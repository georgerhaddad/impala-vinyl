// Offline song analyser: turns each track in records/ into a "song map" (assets/maps/<stem>.json) that the
// music-video engine reads to choreograph visuals at the needle's position. Maps are derived data (no audio).
//
//   node tools/analyze.mjs                          # every track whose map is missing or stale
//   node tools/analyze.mjs currents/01-let-it-happen  # just these stems (always rebuilt, with a long summary)
//
// Pipeline, one pass per track (plain JS, no dependencies; ffmpeg decodes):
//   1. decode to mono 22.05 kHz floats
//   2. STFT (own radix-2 FFT, 1024 window, hop 147 = 150 fps): band powers, 48 log bands, chroma
//   3. onset strength (log-band spectral flux) -> global tempo by autocorrelation -> local tempo curve
//   4. dynamic-programming beat tracker (Ellis 2007) following that curve, so slow drift is followed
//   5. downbeats: Viterbi over the 4 bar phases, scored by low-end onsets + harmonic change
//   6. bars (energy, low/high share, novelty), sections (Foote novelty + energy steps, labelled by energy shape)
//   7. repeats: "stuck record" spans where a 0.1-2 s slice repeats near-identically at a constant lag
//   8. 50 fps envelopes (low/mid/high/onset/rms) as base64 bytes
//
// Output (compact JSON, schema version 1; times in seconds from the start of the audio file, ms precision):
//   { version: 1, title, era, dur, fps: 50, bpm,
//     beats: [t...],               tracked beats (follow drift)
//     downbeats: [t...],           bar starts, a subset of beats (4/4 assumed)
//     bars: [{ t, e, lo, hi, nov }]   e = RMS / loudest bar; lo, hi = share of spectral power < 150 Hz, > 4 kHz;
//                                     nov = change from the previous 4 bars, 0..1
//     sections: [{ t0, t1, kind, e }] contiguous from 0 to dur; kind: intro quiet build full break outro loop
//     repeats: [{ t0, t1, period }]   "stuck record" spans and their loop length
//     env: { low, mid, high, onset, rms }  base64 bytes, one per 1/fps s (byte k is centred on k/fps),
//                                          each scaled so the track's 99th percentile = 255 }
// An 8-minute track comes to ~175 KB, most of it env.
import { spawnSync } from 'node:child_process';
import { existsSync, mkdirSync, readFileSync, statSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { ALL_TRACKS } from '../src/catalog.js';

const ROOT = fileURLToPath(new URL('..', import.meta.url));
const SELF = fileURLToPath(import.meta.url);

const SR = 22050;            // analysis sample rate
const N = 1024;              // FFT size (46 ms)
const HOP = 147;             // analysis hop: 150 frames/s (6.7 ms), fine enough for beat timing
const OFPS = SR / HOP;       // 150
const SUB = 3;               // analysis frames per output frame
const FPS = OFPS / SUB;      // 50 output frames/s (hop 441)
const BIN = SR / N;          // 21.5 Hz per FFT bin
const K_LOW = Math.floor(150 / BIN);      // bins 1..6   -> < 150 Hz
const K_HIGH = Math.ceil(4000 / BIN);     // bins 186..  -> > 4 kHz
const ONSET_LAG = 2;         // spectral flux compares frame t with t-2 (13 ms)
const BEAT_OFFSET = 0.007;   // s; centred-window flux peaks ~7 ms before the attack (measured on synthetic clicks)

// ---------------------------------------------------------------------------------------------------------
// 1. decode
function decode(file) {
  const r = spawnSync('ffmpeg', ['-v', 'error', '-i', file, '-f', 'f32le', '-ac', '1', '-ar', String(SR), 'pipe:1'], { maxBuffer: Infinity });
  if (r.status !== 0) throw new Error(`ffmpeg failed on ${file}: ${r.stderr}`);
  const x = new Float32Array(r.stdout.length >> 2);
  new Uint8Array(x.buffer).set(r.stdout.subarray(0, x.length * 4));
  return x;
}

// ---------------------------------------------------------------------------------------------------------
// 2. FFT + STFT
// In-place iterative radix-2 complex FFT of size n.
function makeFFT(n) {
  const bits = Math.log2(n) | 0, rev = new Uint32Array(n);
  for (let i = 0; i < n; i++) { let r = 0; for (let b = 0; b < bits; b++) r |= ((i >> b) & 1) << (bits - 1 - b); rev[i] = r; }
  const c = new Float64Array(n / 2), s = new Float64Array(n / 2);
  for (let i = 0; i < n / 2; i++) { c[i] = Math.cos(2 * Math.PI * i / n); s[i] = Math.sin(2 * Math.PI * i / n); }
  return (re, im) => {
    for (let i = 0; i < n; i++) {
      const j = rev[i];
      if (j > i) { let t = re[i]; re[i] = re[j]; re[j] = t; t = im[i]; im[i] = im[j]; im[j] = t; }
    }
    for (let size = 2; size <= n; size <<= 1) {
      const half = size >> 1, step = n / size;
      for (let i = 0; i < n; i += size) {
        for (let j = 0, k = 0; j < half; j++, k += step) {
          const a = i + j, b = a + half;
          const tr = re[b] * c[k] + im[b] * s[k], ti = im[b] * c[k] - re[b] * s[k]; // x[b] * e^(-2πik/n)
          re[b] = re[a] - tr; im[b] = im[a] - ti; re[a] += tr; im[a] += ti;
        }
      }
    }
  };
}

// 48 log-spaced bands from 43 Hz to 10 kHz (one FFT bin wide at the bottom, where bins are coarser than
// the log spacing); used for onset flux, timbre and repeat detection.
const BAND_EDGES = (() => {
  const lo = 2, hi = Math.round(10000 / BIN), B = 48, e = [lo];
  for (let j = 0; j < B; j++) {
    const k = e[j], left = B - j;                // spread the remaining log range over the remaining bands
    e.push(Math.max(k + 1, Math.round(k * Math.pow(hi / k, 1 / left))));
  }
  return e;
})();
const NB = BAND_EDGES.length - 1;
const NB_LOW = BAND_EDGES.findIndex((k) => k > K_LOW);   // bands entirely below 150 Hz

// Pitch class of each FFT bin (80 Hz..4 kHz), for chroma; -1 = unused.
const PC = Int8Array.from({ length: N / 2 + 1 }, (_, k) => {
  const f = k * BIN;
  return f < 80 || f > 4000 ? -1 : ((Math.round(12 * Math.log2(f / 440)) % 12) + 12 + 9) % 12; // 0 = C
});

// One STFT at 150 fps; frame i is centred on sample i*HOP (so its time is i/150 s).
// Two real frames go through one complex FFT (one in re, one in im) and are separated afterwards.
function stft(x) {
  const nF = Math.floor(x.length / HOP) + 1, H = N / 2;
  const win = Float64Array.from({ length: N }, (_, n) => 0.5 - 0.5 * Math.cos(2 * Math.PI * n / N));
  const fft = makeFFT(N), re = new Float64Array(N), im = new Float64Array(N);
  const PA = new Float64Array(H + 1), PB = new Float64Array(H + 1);
  const low = new Float32Array(nF), mid = new Float32Array(nF), high = new Float32Array(nF);
  const lb = new Float32Array(nF * NB);      // band powers, later converted to dB
  const chroma = new Float32Array(Math.ceil(nF / SUB) * 12);
  const take = (P, i) => {
    let l = 0, m = 0, h = 0;
    for (let k = 1; k <= K_LOW; k++) l += P[k];
    for (let k = K_LOW + 1; k < K_HIGH; k++) m += P[k];
    for (let k = K_HIGH; k < H; k++) h += P[k];
    low[i] = l; mid[i] = m; high[i] = h;
    for (let b = 0; b < NB; b++) {
      let s = 0; for (let k = BAND_EDGES[b]; k < BAND_EDGES[b + 1]; k++) s += P[k];
      lb[i * NB + b] = s / (BAND_EDGES[b + 1] - BAND_EDGES[b]);
    }
    if (i % SUB === 0) { const o = (i / SUB) * 12; for (let k = 0; k <= H; k++) if (PC[k] >= 0) chroma[o + PC[k]] += Math.sqrt(P[k]); }
  };
  for (let i = 0; i < nF; i += 2) {
    const s0 = i * HOP - H, s1 = s0 + HOP;
    for (let n = 0; n < N; n++) {
      const a = s0 + n, b = s1 + n;
      re[n] = a >= 0 && a < x.length ? x[a] * win[n] : 0;
      im[n] = i + 1 < nF && b >= 0 && b < x.length ? x[b] * win[n] : 0;
    }
    fft(re, im);
    for (let k = 0; k <= H; k++) {
      const nk = (N - k) & (N - 1);
      const ar = (re[k] + re[nk]) / 2, ai = (im[k] - im[nk]) / 2;   // spectrum of the frame in re
      const br = (im[k] + im[nk]) / 2, bi = (re[nk] - re[k]) / 2;   // spectrum of the frame in im
      PA[k] = ar * ar + ai * ai; PB[k] = br * br + bi * bi;
    }
    take(PA, i);
    if (i + 1 < nF) take(PB, i + 1);
  }
  // band powers -> dB with a floor 70 dB under the track's loudest band
  let mx = 0; for (let i = 0; i < lb.length; i++) if (lb[i] > mx) mx = lb[i];
  const floor = 10 * Math.log10(mx + 1e-20) - 70;
  for (let i = 0; i < lb.length; i++) lb[i] = Math.max(floor, 10 * Math.log10(lb[i] + 1e-20)) - floor;
  return { nF, low, mid, high, lb, chroma };
}

// ---------------------------------------------------------------------------------------------------------
// small helpers
const percentile = (a, p) => { const s = Float64Array.from(a).sort(); return s.length ? s[Math.min(s.length - 1, Math.floor(p * (s.length - 1)))] : 0; };
const mean = (a, i0 = 0, i1 = a.length) => { let s = 0; for (let i = i0; i < i1; i++) s += a[i]; return i1 > i0 ? s / (i1 - i0) : 0; };
const median = (a) => percentile(a, 0.5);
const r3 = (v) => Math.round(v * 1000) / 1000, r2 = (v) => Math.round(v * 100) / 100;
const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
function movingAvg(a, w) {           // centred boxcar of width w
  const out = new Float32Array(a.length), h = w >> 1; let s = 0, n = 0;
  for (let i = -h; i < a.length; i++) {
    const add = i + h, rem = i - h - 1;
    if (add < a.length) { s += a[add]; n++; }
    if (rem >= 0) { s -= a[rem]; n--; }
    if (i >= 0) out[i] = s / n;
  }
  return out;
}
function parabolic(f, i) {           // sub-sample peak position around index i
  if (i <= 0 || i >= f.length - 1) return i;
  const a = f[i - 1], b = f[i], c = f[i + 1], d = a - 2 * b + c;
  return d === 0 ? i : i + clamp(0.5 * (a - c) / d, -0.5, 0.5);
}

// ---------------------------------------------------------------------------------------------------------
// 3. onset strength and tempo
// Spectral flux over the log bands (dB increases, half-wave rectified), averaged over bands.
function onsetStrength(S) {
  const { nF, lb } = S, flux = new Float32Array(nF), lowFlux = new Float32Array(nF);
  for (let i = ONSET_LAG; i < nF; i++) {
    let s = 0, sl = 0;
    const a = i * NB, b = (i - ONSET_LAG) * NB;
    for (let k = 0; k < NB; k++) { const d = lb[a + k] - lb[b + k]; if (d > 0) { s += d; if (k < NB_LOW) sl += d; } }
    flux[i] = s / NB; lowFlux[i] = sl / Math.max(1, NB_LOW);
  }
  // beat-tracking version: light smoothing, local mean removed (high-pass), unit variance
  const sm = new Float32Array(nF);
  for (let i = 0; i < nF; i++) sm[i] = 0.25 * flux[Math.max(0, i - 1)] + 0.5 * flux[i] + 0.25 * flux[Math.min(nF - 1, i + 1)];
  const loc = movingAvg(sm, Math.round(OFPS));
  const o = new Float32Array(nF);
  for (let i = 0; i < nF; i++) o[i] = sm[i] - loc[i];
  const sd = Math.sqrt(mean(o.map((v) => v * v))) || 1;
  for (let i = 0; i < nF; i++) o[i] /= sd;
  return { flux, lowFlux, o };
}

const lagToBpm = (L) => 60 * OFPS / L;
// Global tempo: autocorrelation of the onset envelope, weighted by a log-normal preference around 120 BPM
// (so 90-160 wins octave ties), then an explicit octave check that halves/doubles into 90-160 if the
// autocorrelation supports it there.
function globalTempo(o, a0, a1) {
  const minL = Math.round(OFPS * 60 / 320), maxL = Math.round(OFPS * 60 / 40);
  const acf = new Float32Array(maxL + 2);
  for (let L = minL - 1; L <= maxL + 1; L++) {
    let s = 0; for (let t = a0 + L; t < a1; t++) s += o[t] * o[t - L];
    acf[L] = s / Math.max(1, a1 - a0 - L);
  }
  const prior = (L) => Math.exp(-0.5 * (Math.log2(lagToBpm(L) / 120) / 0.55) ** 2);
  let best = -Infinity, L0 = Math.round(OFPS / 2);
  for (let L = minL; L <= maxL; L++) {
    if (acf[L] < acf[L - 1] || acf[L] < acf[L + 1]) continue;   // local maxima only
    const v = acf[L] * prior(L);
    if (v > best) { best = v; L0 = L; }
  }
  let Lf = parabolic(acf, L0);
  // octave sanity: outside 90-160, accept the octave inside it when its peak is at least 55% as strong
  const at = (Lx) => { const i = Math.round(Lx); let m = -Infinity; for (let k = i - 2; k <= i + 2; k++) if (k >= minL && k <= maxL) m = Math.max(m, acf[k]); return m; };
  const bpm0 = lagToBpm(Lf);
  if (bpm0 < 90 && at(Lf / 2) > 0.55 * acf[L0]) Lf = refineAround(acf, Lf / 2);
  else if (bpm0 > 165 && at(Lf * 2) > 0.55 * acf[L0]) Lf = refineAround(acf, Lf * 2);
  return { L: Lf, acf };
}
function refineAround(acf, Lx) {
  const i0 = Math.round(Lx); let bi = i0;
  for (let k = i0 - 2; k <= i0 + 2; k++) if (k > 0 && k < acf.length - 1 && acf[k] > acf[bi]) bi = k;
  return parabolic(acf, bi);
}
// Local tempo curve: per 8 s window (1 s hop), the autocorrelation peak within ±20% of the global period,
// gently pulled towards it, then median-filtered. Lets the beat tracker follow live-feel drift.
function localPeriod(o, L0) {
  const nF = o.length, W = Math.round(8 * OFPS), step = Math.round(OFPS);
  const lo = Math.floor(L0 * 0.82), hi = Math.ceil(L0 * 1.2), centers = [], vals = [];
  const acf = new Float32Array(hi + 2);
  for (let c = 0; c < nF; c += step) {
    const a0 = Math.max(0, c - W / 2), a1 = Math.min(nF, c + W / 2);
    for (let L = lo - 1; L <= hi + 1; L++) { let s = 0; for (let t = a0 + L; t < a1; t++) s += o[t] * o[t - L]; acf[L] = s; }
    let bi = Math.round(L0), bv = -Infinity;
    for (let L = lo; L <= hi; L++) { const v = acf[L] * Math.exp(-0.5 * (Math.log(L / L0) / 0.08) ** 2); if (v > bv) { bv = v; bi = L; } }
    centers.push(c); vals.push(parabolic(acf, bi));
  }
  const med = vals.map((_, i) => median(vals.slice(Math.max(0, i - 4), i + 5)));
  const per = new Float32Array(nF);
  for (let t = 0, j = 0; t < nF; t++) {
    while (j < centers.length - 2 && centers[j + 1] <= t) j++;
    const f = clamp((t - centers[j]) / step, 0, 1);
    per[t] = centers.length > 1 ? med[j] * (1 - f) + med[j + 1] * f : med[0];
  }
  return per;
}

// ---------------------------------------------------------------------------------------------------------
// 4. dynamic-programming beat tracker (Ellis 2007): cumulative score = onset strength + best predecessor score
// minus a log-squared penalty for deviating from the local period; backtrack from the best final beat.
const TIGHTNESS = 100;
function trackBeats(o, per, a0, a1) {
  const nF = o.length, cum = new Float64Array(nF), back = new Int32Array(nF).fill(-1);
  for (let t = 0; t < nF; t++) {
    const p = per[t], lo = Math.max(0, t - Math.round(2 * p)), hi = t - Math.round(p / 2);
    let best = -Infinity, arg = -1;
    for (let u = lo; u <= hi; u++) {
      const v = cum[u] - TIGHTNESS * Math.log((t - u) / p) ** 2;
      if (v > best) { best = v; arg = u; }
    }
    cum[t] = o[t] + (arg >= 0 ? Math.max(best, 0) : 0);
    back[t] = arg >= 0 && best > 0 ? arg : -1;
  }
  // last beat: best cumulative score within one period of the end of the music
  const pEnd = per[Math.max(0, a1 - 1)];
  let t = a1 - 1, bv = -Infinity;
  for (let u = Math.max(0, Math.round(a1 - pEnd)); u < a1; u++) if (cum[u] > bv) { bv = cum[u]; t = u; }
  const beats = [];
  while (t >= 0) { beats.push(t); t = back[t]; }
  beats.reverse();
  // keep beats where there is music (allow half a period of lead-in)
  return beats.filter((b) => b >= a0 - per[b] / 2 && b < a1);
}

// ---------------------------------------------------------------------------------------------------------
// 5. downbeats: Viterbi over bar phase (beat index mod 4). A beat scores as a downbeat by its low-end onset,
// harmonic (chroma) change across it, and overall onset. Changing phase costs a lot, so it only happens
// when several bars agree (e.g. after a dropped beat in the tracker).
function downbeatPhases(beats, o, lowFlux, chroma50) {
  const n = beats.length; if (n < 8) return beats.map((_, i) => i % 4 === 0);
  const pick = (a, f) => { let m = -Infinity; for (let k = f - 2; k <= f + 3; k++) if (k >= 0 && k < a.length) m = Math.max(m, a[k]); return m; };
  const chromaMean = (f0, f1) => {
    const v = new Float64Array(12), a = Math.floor(f0 / SUB), b = Math.max(a + 1, Math.floor(f1 / SUB));
    for (let k = a; k < b && k * 12 < chroma50.length; k++) for (let c = 0; c < 12; c++) v[c] += chroma50[k * 12 + c];
    const nrm = Math.hypot(...v) || 1; return v.map((x) => x / nrm);
  };
  const low = [], on = [], chg = [];
  for (let i = 0; i < n; i++) {
    low.push(pick(lowFlux, beats[i])); on.push(pick(o, beats[i]));
    const A = chromaMean(beats[Math.max(0, i - 2)], beats[i]), B = chromaMean(beats[i], beats[Math.min(n - 1, i + 2)]);
    let d = 0; for (let c = 0; c < 12; c++) d += A[c] * B[c];
    chg.push(i < 2 || i > n - 3 ? 0 : 1 - d);
  }
  const z = (a) => { const m = mean(a), s = Math.sqrt(mean(a.map((v) => (v - m) ** 2))) || 1; return a.map((v) => (v - m) / s); };
  const zl = z(low), zo = z(on), zc = z(chg);
  const s = zl.map((v, i) => v + zc[i] + 0.5 * zo[i]);
  const SWITCH = 8;
  let score = [0, 0, 0, 0]; const bp = [];
  for (let i = 0; i < n; i++) {
    const next = [0, 0, 0, 0], from = [0, 0, 0, 0];
    for (let p = 0; p < 4; p++) {
      let bv = -Infinity, bq = p;
      for (let q = 0; q < 4; q++) { const v = score[q] - (q === p ? 0 : SWITCH); if (v > bv) { bv = v; bq = q; } }
      next[p] = bv + (i % 4 === p ? s[i] : 0); from[p] = bq;
    }
    score = next; bp.push(from);
  }
  let p = score.indexOf(Math.max(...score));
  const phase = new Array(n);
  for (let i = n - 1; i >= 0; i--) { phase[i] = p; p = bp[i][p]; }
  return phase.map((ph, i) => i % 4 === ph);
}

// ---------------------------------------------------------------------------------------------------------
// 7. repeats ("stuck record"): at 50 fps, for every lag L of 0.1-2 s, d_L(t) = mean |dB difference| over the
// log bands between frame t and t-L, smoothed over 1 s. A span counts when, for >= 4 s, the best lag is
// much closer than the track's usual distance at that lag (< 30% of its median), clearly closer than at
// half that lag and at non-multiples (so steady drones don't count), and below an absolute ceiling.
function findRepeats(F50, nF50, active50, lbAt150, nF150) {
  const Lmin = Math.round(0.1 * FPS), Lmax = Math.round(2 * FPS), L2 = 2, nL = Lmax - L2 + 1; // row j = lag L2 + j
  const D = new Float32Array(nL * nF50);
  const row = new Float32Array(nF50);
  for (let j = 0; j < nL; j++) {
    const L = L2 + j;
    for (let t = 0; t < nF50; t++) {
      if (t < L) { row[t] = 99; continue; }
      let s = 0; const a = t * NB, b = (t - L) * NB;
      for (let k = 0; k < NB; k++) s += Math.abs(F50[a + k] - F50[b + k]);
      row[t] = s / NB;
    }
    D.set(movingAvg(row, FPS), j * nF50);
  }
  const med = new Float32Array(nL);
  for (let j = 0; j < nL; j++) {
    const v = []; for (let t = Lmax; t < nF50; t++) if (active50[t]) v.push(D[j * nF50 + t]);
    med[j] = v.length ? median(v) : 99;
  }
  const CORE = 0.3;   // exact-repeat core: < 30% of the track's usual distance at that lag (and < 2 dB)
  // per frame: smallest qualifying lag whose distance is within 15% of the best qualifying one
  const bestL = new Int16Array(nF50).fill(-1), ratio = new Float32Array(nF50).fill(9);
  for (let t = Lmax; t < nF50; t++) {
    if (!active50[t]) continue;
    let minD = Infinity;
    const ok = [];
    for (let j = Lmin - L2; j < nL; j++) {
      const L = L2 + j, d = D[j * nF50 + t];
      if (d > CORE * med[j] || d > 2) continue;
      // contrast: half the lag and ~0.3-0.7 of the lag (non-multiples) must be clearly worse
      let off = Infinity;
      for (const f of [0.5, 0.35, 0.65]) { const Lo = Math.round(L * f); if (Lo >= L2) off = Math.min(off, D[(Lo - L2) * nF50 + t]); }
      if (off !== Infinity && d > 0.6 * off) continue;
      ok.push([L, d]); if (d < minD) minD = d;
    }
    for (const [L, d] of ok) if (d <= 1.15 * minD) { bestL[t] = L; ratio[t] = d / med[L - L2]; break; }
  }
  // runs of a consistent lag (±2 frames), bridging gaps up to 0.5 s, at least 4 s long
  const runs = [];
  let cur = null;
  for (let t = 0; t < nF50; t++) {
    const L = bestL[t];
    if (L > 0 && cur && Math.abs(L - cur.L) <= Math.max(2, 0.05 * cur.L) && t - cur.end <= FPS / 2) { cur.end = t; cur.Ls.push(L); continue; }
    if (L > 0) { if (cur) runs.push(cur); cur = { start: t, end: t, L, Ls: [L] }; }
  }
  if (cur) runs.push(cur);
  // a stuck loop often keeps going under new material, less exactly: extend each core run while the
  // distance at the same lag (±1) stays under 65% of the track's usual (hysteresis), bridging gaps <= 1.5 s
  const EXT = 0.65, GAP = 1.5 * FPS;
  const loose = (Lm, t) => {
    if (!active50[t]) return false;
    for (let L = Math.max(Lmin, Lm - 1); L <= Math.min(Lmax, Lm + 1); L++) if (t >= L && D[(L - L2) * nF50 + t] < EXT * med[L - L2]) return true;
    return false;
  };
  const out = [];
  for (const r of runs) {
    const Lm = Math.round(median(r.Ls));
    if ((r.end - r.start) / FPS < 4) continue;
    let s = r.start, e = r.end;
    for (let t = s - 1, miss = 0; t >= Lmax && miss <= GAP; t--) { if (loose(Lm, t)) { s = t; miss = 0; } else miss++; }
    for (let t = e + 1, miss = 0; t < nF50 && miss <= GAP; t++) { if (loose(Lm, t)) { e = t; miss = 0; } else miss++; }
    // refine the period at 150 fps: minimise the mean band distance over the run around 3*L
    const f0 = r.start * SUB, f1 = Math.min(nF150, r.end * SUB);
    const c = Math.round(Lm * SUB), cost = [];
    for (let L = c - 5; L <= c + 5; L++) {
      let s = 0, n = 0;
      for (let t = Math.max(f0, L); t < f1; t += 2) { s += dist(lbAt150, t, L, NB); n++; }
      cost.push(n ? s / n : 99);
    }
    let bi = 0; for (let k = 1; k < cost.length; k++) if (cost[k] < cost[bi]) bi = k;
    const neg = cost.map((v) => -v), Lr = c - 5 + parabolic(neg, bi);
    const period = Lr / OFPS;
    // the first copy of the looping slice starts one period before the first matching frame; the 1 s
    // smoothing widens the run by about half a second on each side
    const t0 = Math.max(0, s / FPS + 0.5 - period), t1 = e / FPS - 0.5;
    out.push({ t0, t1, period, core: [r.start / FPS, r.end / FPS], strength: 1 - median(Array.from(ratio.subarray(r.start, r.end + 1)).filter((v) => v < 9)) });
  }
  // merge spans that touch with the same period
  const merged = [];
  for (const r of out) {
    const p = merged[merged.length - 1];
    if (p && r.t0 - p.t1 < 1 && Math.abs(r.period - p.period) < 0.03 * p.period) p.t1 = Math.max(p.t1, r.t1); else merged.push(r);
  }
  return merged;
}
function dist(F, t, L, nb) {
  if (t < L) return 99;
  let s = 0; const a = t * nb, b = (t - L) * nb;
  for (let k = 0; k < nb; k++) s += Math.abs(F[a + k] - F[b + k]);
  return s / nb;
}

// ---------------------------------------------------------------------------------------------------------
// 6. bars and sections
// Per-bar descriptor: 16 coarse timbre bands (dB), chroma (12, unit length), loudness (dB).
function barFeatures(bars, F50, chroma50, rms50, nF50) {
  const G = 16, per = Math.ceil(NB / G);
  return bars.map(({ f0, f1 }) => {
    const a = clamp(f0, 0, nF50 - 1), b = clamp(Math.max(f1, f0 + 1), a + 1, nF50);
    const v = new Float64Array(G + 12 + 1);
    for (let t = a; t < b; t++) {
      for (let k = 0; k < NB; k++) v[Math.floor(k / per)] += F50[t * NB + k] / per;
      for (let c = 0; c < 12; c++) v[G + c] += chroma50[t * 12 + c];
    }
    for (let k = 0; k < G; k++) v[k] /= b - a;
    const cn = Math.hypot(...v.subarray(G, G + 12)) || 1;
    for (let c = 0; c < 12; c++) v[G + c] /= cn;
    let ms = 0; for (let t = a; t < b; t++) ms += rms50[t] * rms50[t];
    v[G + 12] = 10 * Math.log10(ms / (b - a) + 1e-12);
    return v;
  });
}
function standardise(vecs) {
  if (!vecs.length) return vecs;
  const D = vecs[0].length, m = new Float64Array(D), s = new Float64Array(D);
  for (const v of vecs) for (let d = 0; d < D; d++) m[d] += v[d] / vecs.length;
  for (const v of vecs) for (let d = 0; d < D; d++) s[d] += (v[d] - m[d]) ** 2 / vecs.length;
  const w = Array.from({ length: D }, (_, d) => (d === D - 1 ? 2 : 1) / (Math.sqrt(s[d]) || 1));  // loudness weighted x2
  return vecs.map((v) => v.map((x, d) => (x - m[d]) * w[d]));
}
const cosSim = (a, b) => { let s = 0, na = 0, nb = 0; for (let i = 0; i < a.length; i++) { s += a[i] * b[i]; na += a[i] * a[i]; nb += b[i] * b[i]; } return s / (Math.sqrt(na * nb) || 1); };

// Boundaries = peaks of (Foote checkerboard novelty on the bar self-similarity matrix + loudness steps),
// at least 4 bars apart, plus forced boundaries at repeat spans. Then each section gets a kind from its
// loudness relative to the track and to its neighbours.
function segment(bars, Z, repeats, dur) {
  const n = bars.length;
  if (n < 4) return [{ t0: 0, t1: dur, kind: 'full', e: 1 }];
  const S = Z.map((a) => Z.map((b) => cosSim(a, b)));
  const W = 8, foote = new Float64Array(n + 1);
  for (let k = 1; k < n; k++) {
    let s = 0, wsum = 0;
    for (let a = -W; a < W; a++) for (let b = -W; b < W; b++) {
      const i = k + a, j = k + b; if (i < 0 || j < 0 || i >= n || j >= n) continue;
      const g = Math.exp(-((a + 0.5) ** 2 + (b + 0.5) ** 2) / (2 * (W / 2) ** 2));
      const sign = (a < 0) === (b < 0) ? 1 : -1;   // novelty = similarity within each side - across the boundary
      s += sign * g * S[i][j]; wsum += g;
    }
    foote[k] = Math.max(0, s / (wsum || 1));
  }
  const e = bars.map((b) => b.e), step = new Float64Array(n + 1);
  for (let k = 1; k < n; k++) step[k] = Math.abs(mean(e, k, Math.min(n, k + 4)) - mean(e, Math.max(0, k - 4), k));
  const fmx = percentile(foote, 0.98) || 1, smx = percentile(step, 0.98) || 1;
  const nov = Array.from(foote, (f, k) => Math.min(1, f / fmx) + Math.min(1, step[k] / smx));
  // forced boundaries from repeats (snapped to bar starts)
  const snap = (t) => { let bi = 0; for (let k = 0; k < n; k++) if (Math.abs(bars[k].t - t) < Math.abs(bars[bi].t - t)) bi = k; return bi; };
  const forced = new Set();
  for (const r of repeats) { for (const k of [snap(r.t0), snap(r.t1)]) if (k > 0 && k < n) forced.add(k); }
  const target = clamp(Math.round(dur / 30), 3, 18);       // ~15 for an 8-minute track, fewer for short ones
  const barLen = median(bars.map((b) => b.t1 - b.t)) || 2;
  const MIN = Math.max(4, Math.ceil(8 / barLen)), cands = [];   // sections at least 4 bars and ~8 s
  for (let k = 2; k <= n - 2; k++) {
    let peak = true; for (let d = -2; d <= 2; d++) if (d && k + d > 0 && k + d < n && nov[k + d] > nov[k]) peak = false;
    if (peak) cands.push(k);
  }
  cands.sort((a, b) => nov[b] - nov[a]);
  const chosen = [...forced];
  const far = (k) => chosen.every((c) => Math.abs(c - k) >= MIN) && k >= MIN / 2 && n - k >= MIN / 2;
  const top = nov[cands[0]] || 1;
  for (const k of cands) {
    if (chosen.length >= target - 1) break;
    if (nov[k] < 0.35 * top && chosen.length >= Math.max(2, Math.round(dur / 60))) break;
    if (far(k)) chosen.push(k);
  }
  chosen.sort((a, b) => a - b);
  const bounds = [0, ...chosen, n];
  const secs = [];
  for (let i = 0; i + 1 < bounds.length; i++) {
    const b0 = bounds[i], b1 = bounds[i + 1];
    const t0 = i === 0 ? 0 : bars[b0].t, t1 = i + 2 === bounds.length ? dur : bars[b1].t;
    // loudness as RMS over the section's bars, weighted by bar length
    let s = 0, w = 0; for (let k = b0; k < b1; k++) { const d = bars[k].t1 - bars[k].t; s += bars[k].e ** 2 * d; w += d; }
    // loudness trend: least-squares slope over the section's bars, as total rise, and how straight it is
    const m = b1 - b0, xm = (m - 1) / 2, ym = mean(e, b0, b1);
    let sxy = 0, sxx = 0, syy = 0;
    for (let k = 0; k < m; k++) { sxy += (k - xm) * (e[b0 + k] - ym); sxx += (k - xm) ** 2; syy += (e[b0 + k] - ym) ** 2; }
    const corr = sxy / (Math.sqrt(sxx * syy) || 1);
    secs.push({ t0, t1, b0, b1, e: Math.sqrt(s / (w || 1)), rise: m > 1 ? (sxy / sxx) * (m - 1) : 0, corr });
  }
  // kinds
  // reference loudness = 90th percentile of the bars (robust to one short loud hit); full = within 80% of it
  const emax = percentile(e, 0.9), FULL = 0.8 * emax;
  const overlap = (s, r) => Math.max(0, Math.min(s.t1, r.t1) - Math.max(s.t0, r.t0));
  secs.forEach((s, i) => {
    const prev = secs[i - 1], next = secs[i + 1];
    if (repeats.some((r) => overlap(s, r) >= 0.5 * (s.t1 - s.t0))) s.kind = 'loop';
    else if (s.e >= FULL) s.kind = 'full';
    else if (s.b1 - s.b0 >= 4 && s.rise > 0.12 * emax && s.corr > 0.5 && (!next || next.e >= FULL || next.e > s.e + 0.1 * emax)) s.kind = 'build';
    else if (prev && prev.e >= FULL && s.e < 0.75 * prev.e) s.kind = 'break';
    else s.kind = 'quiet';
  });
  // first/last sections are intro/outro unless they are the loop, or a long full-on stretch
  const ends = (s) => s.kind !== 'loop' && !(s.kind === 'full' && s.t1 - s.t0 > 0.25 * dur);
  if (secs.length > 1 && ends(secs[0])) secs[0].kind = 'intro';
  if (secs.length > 2 && ends(secs[secs.length - 1])) secs[secs.length - 1].kind = 'outro';
  return secs.map((s) => ({ t0: r3(s.t0), t1: r3(s.t1), kind: s.kind, e: r2(s.e) }));
}

// ---------------------------------------------------------------------------------------------------------
// the whole analysis for one decoded track
export function analyse(x) {
  const dur = x.length / SR;
  const S = stft(x);
  const nF = S.nF, nF50 = Math.ceil(nF / SUB);
  const { flux, lowFlux, o } = onsetStrength(S);

  // 50 fps frames (frame k centred on k/50 s): band powers averaged over 3 analysis frames, flux summed
  const avg3 = (a) => Float32Array.from({ length: nF50 }, (_, k) => { let s = 0, c = 0; for (let i = k * SUB - 1; i <= k * SUB + 1; i++) if (i >= 0 && i < nF) { s += a[i]; c++; } return s / c; });
  const low50 = avg3(S.low), mid50 = avg3(S.mid), high50 = avg3(S.high), flux50 = avg3(flux);
  const F50 = new Float32Array(nF50 * NB);
  for (let k = 0; k < nF50; k++) for (let b = 0; b < NB; b++) {
    let s = 0, c = 0; for (let i = k * SUB - 1; i <= k * SUB + 1; i++) if (i >= 0 && i < nF) { s += S.lb[i * NB + b]; c++; }
    F50[k * NB + b] = s / c;
  }
  const rms50 = Float32Array.from({ length: nF50 }, (_, k) => {
    const a = Math.max(0, k * 441 - 220), b = Math.min(x.length, k * 441 + 221); let s = 0;
    for (let i = a; i < b; i++) s += x[i] * x[i]; return Math.sqrt(s / Math.max(1, b - a));
  });
  // where the music is: frames louder than -40 dB re the track's 99th percentile
  const rp99 = percentile(rms50, 0.99) || 1;
  const active50 = Uint8Array.from(rms50, (v) => (v > rp99 * 0.01 ? 1 : 0));
  let firstA = active50.indexOf(1), lastA = active50.lastIndexOf(1);
  if (firstA < 0) { firstA = 0; lastA = nF50 - 1; }
  const a0 = firstA * SUB, a1 = Math.min(nF, (lastA + 1) * SUB);

  // 3-4. tempo and beats
  const { L: L0 } = globalTempo(o, a0, a1);
  const per = localPeriod(o, L0);
  const beatF = trackBeats(o, per, a0, a1);
  const beats = beatF.map((f) => Math.max(0, f / OFPS + BEAT_OFFSET));
  const ibis = beats.slice(1).map((b, i) => b - beats[i]);
  // dominant tempo: median of 8-beat spans (finer than single frame-quantised intervals)
  const spans = beats.slice(8).map((b, i) => (b - beats[i]) / 8);
  const bpm = spans.length ? 60 / median(spans) : ibis.length ? 60 / median(ibis) : lagToBpm(L0);

  // 5. downbeats and bars
  const isDown = downbeatPhases(beatF, o, lowFlux, S.chroma);
  const downIdx = isDown.flatMap((d, i) => (d ? [i] : []));
  const barLen = 4 * (median(ibis) || 0.5);
  const bars = downIdx.map((i, k) => {
    const t = beats[i], t1 = k + 1 < downIdx.length ? beats[downIdx[k + 1]] : Math.min(dur, t + barLen);
    return { t, t1, f0: Math.round(t * FPS), f1: Math.round(t1 * FPS) };
  }).filter((b) => b.t1 > b.t);
  const pw = (a, b, arr) => { let s = 0; for (let k = clamp(a, 0, nF50); k < clamp(b, 0, nF50); k++) s += arr[k]; return s; };
  for (const b of bars) {
    const f1 = Math.max(b.f1, b.f0 + 1);
    let ms = 0; for (let k = b.f0; k < f1 && k < nF50; k++) ms += rms50[k] ** 2;
    b.rms = Math.sqrt(ms / (f1 - b.f0));
    const lo = pw(b.f0, f1, low50), mi = pw(b.f0, f1, mid50), hi = pw(b.f0, f1, high50), tot = lo + mi + hi || 1;
    b.lo = lo / tot; b.hi = hi / tot;
  }
  const rmax = Math.max(...bars.map((b) => b.rms), 1e-9);
  for (const b of bars) b.e = b.rms / rmax;
  const Z = standardise(barFeatures(bars, F50, S.chroma, rms50, nF50));
  // novelty: cosine distance from the mean of the previous 4 bars, scaled to the track's 98th percentile
  const novRaw = Z.map((v, k) => {
    if (k === 0) return 0;
    const m = new Float64Array(v.length), j0 = Math.max(0, k - 4);
    for (let j = j0; j < k; j++) for (let d = 0; d < v.length; d++) m[d] += Z[j][d] / (k - j0);
    return (1 - cosSim(v, m)) / 2;
  });
  const nmx = percentile(novRaw, 0.98) || 1;
  bars.forEach((b, k) => { b.nov = Math.min(1, novRaw[k] / nmx); });

  // 7. repeats, then 6. sections (which need the repeats to label "loop")
  const repeats = findRepeats(F50, nF50, active50, S.lb, nF);
  const sections = segment(bars, Z, repeats, dur);

  // 8. envelopes: amplitude per band, onset (light 1-2-1 smoothing), rms; each scaled to its 99th percentile
  const amp = (a) => a.map(Math.sqrt);
  const onset50 = flux50.map((_, k) => 0.25 * flux50[Math.max(0, k - 1)] + 0.5 * flux50[k] + 0.25 * flux50[Math.min(nF50 - 1, k + 1)]);
  const bytes = (a) => { const p = percentile(a, 0.99) || 1; return Buffer.from(Uint8Array.from(a, (v) => clamp(Math.round(255 * v / p), 0, 255))).toString('base64'); };
  const env = { low: bytes(amp(low50)), mid: bytes(amp(mid50)), high: bytes(amp(high50)), onset: bytes(onset50), rms: bytes(rms50) };

  // diagnostics: onset strength on beats vs half-way between beats (raw flux, ±1 frame)
  const at = (t) => { const f = Math.round((t - BEAT_OFFSET) * OFPS); let m = 0; for (let i = f - 1; i <= f + 1; i++) if (i >= 0 && i < nF) m = Math.max(m, flux[i]); return m; };
  const onBeat = mean(beats.map(at)), offBeat = mean(ibis.map((d, i) => at(beats[i] + d / 2)));

  return {
    map: {
      dur: r2(dur), fps: FPS, bpm: Math.round(bpm * 10) / 10,
      beats: beats.map(r3), downbeats: downIdx.map((i) => r3(beats[i])),
      bars: bars.map((b) => ({ t: r3(b.t), e: r2(b.e), lo: r2(b.lo), hi: r3(b.hi), nov: r2(b.nov) })),
      sections,
      repeats: repeats.map((r) => ({ t0: r3(r.t0), t1: r3(r.t1), period: r3(r.period) })),
      env,
    },
    diag: { beatContrast: onBeat / (offBeat || 1e-9), globalBpm: lagToBpm(L0), repeats },
  };
}

// ---------------------------------------------------------------------------------------------------------
// CLI
const mmss = (t) => `${Math.floor(t / 60)}:${String(Math.floor(t % 60)).padStart(2, '0')}`;

function run() {
  const index = JSON.parse(readFileSync(join(ROOT, 'records', 'index.json'), 'utf8'));
  const byStem = new Map(ALL_TRACKS.map((t) => [t.file, t]));
  const args = process.argv.slice(2);
  const selfTime = statSync(SELF).mtimeMs;
  const mapPath = (stem) => join(ROOT, 'assets', 'maps', `${stem}.json`);
  const stems = args.length ? args : Object.keys(index).filter((stem) => {
    const m = mapPath(stem); if (!existsSync(m)) return true;
    const mt = statSync(m).mtimeMs;
    return mt < statSync(join(ROOT, 'records', index[stem])).mtimeMs || mt < selfTime;
  });
  if (!stems.length) { console.log('all maps up to date'); return; }
  const rows = [];
  for (const stem of stems) {
    if (!index[stem]) { console.error(`${stem}: not in records/index.json`); process.exitCode = 1; continue; }
    const track = byStem.get(stem);
    const t0 = performance.now();
    const x = decode(join(ROOT, 'records', index[stem]));
    const { map, diag } = analyse(x);
    const out = { version: 1, title: track ? track.title : stem, era: track ? track.side.era.id : stem.split('/')[0], ...map };
    const file = mapPath(stem);
    mkdirSync(dirname(file), { recursive: true });
    const json = JSON.stringify(out);
    writeFileSync(file, json);
    const secs = (performance.now() - t0) / 1000;
    rows.push({ title: out.title, bpm: out.bpm, beats: out.beats.length, sections: out.sections.length, repeats: out.repeats.length, contrast: diag.beatContrast, kb: json.length / 1024, secs });
    console.log(`${stem.padEnd(48)} ${mmss(out.dur).padStart(5)}  ${String(out.bpm).padStart(5)} bpm  ${String(out.beats.length).padStart(4)} beats  on/off ${diag.beatContrast.toFixed(2)}  ${String(out.sections.length).padStart(2)} sect  ${out.repeats.length} rep  ${(json.length / 1024).toFixed(0)} KB  ${secs.toFixed(1)} s`);
    if (args.length) {
      console.log(`  sections: ${out.sections.map((s) => `${mmss(s.t0)} ${s.kind} ${s.e}`).join(' | ')}`);
      for (const r of diag.repeats) console.log(`  repeat ${mmss(r.t0)}-${mmss(r.t1)} (${r.t0.toFixed(1)}-${r.t1.toFixed(1)} s, exact core ${r.core.map(mmss).join('-')}) period ${(r.period * 1000).toFixed(1)} ms, strength ${r.strength.toFixed(2)}`);
    }
  }
  if (rows.length > 1) console.log(`${rows.length} maps, ${rows.reduce((s, r) => s + r.kb, 0).toFixed(0)} KB, ${rows.reduce((s, r) => s + r.secs, 0).toFixed(0)} s`);
  return rows;
}

if (process.argv[1] && pathToFileURL(process.argv[1]).href === import.meta.url) run();
