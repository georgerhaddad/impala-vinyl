// A track's song map (assets/maps/<stem>.json, written by tools/analyze.mjs from the audio): beats, bars, sections,
// stuck-loop spans and loudness envelopes. at(t) answers everything about one moment, t in seconds into the track.
const dec = (s) => (s ? Uint8Array.from(atob(s), (c) => c.charCodeAt(0)) : new Uint8Array(0));
const maps = new Map();
export const loadMap = (stem) => {
  if (!maps.has(stem)) maps.set(stem, fetch(new URL(`../../assets/maps/${stem}.json`, import.meta.url)).then((r) => (r.ok ? r.json() : null)).then((m) => (m ? new Song(m) : null)).catch(() => null));
  return maps.get(stem);
};
// last index i with a[i] <= t (binary search), or -1
function floorIdx(a, t, key) {
  let lo = 0, hi = a.length - 1, r = -1;
  while (lo <= hi) { const m = (lo + hi) >> 1; if ((key ? a[m][key] : a[m]) <= t) { r = m; lo = m + 1; } else hi = m - 1; }
  return r;
}

export class Song {
  constructor(m) {
    this.m = m; this.dur = m.dur; this.fps = m.fps || 50; this.bpm = m.bpm || 120;
    this.beats = m.beats?.length ? m.beats : Array.from({ length: Math.ceil(m.dur * this.bpm / 60) }, (_, i) => i * 60 / this.bpm);
    this.downs = m.downbeats?.length ? m.downbeats : this.beats.filter((_, i) => i % 4 === 0);
    this.bars = m.bars || []; this.sections = m.sections || []; this.repeats = m.repeats || [];
    const e = m.env || {};
    this.env = { low: dec(e.low), mid: dec(e.mid), high: dec(e.high), onset: dec(e.onset), rms: dec(e.rms) };
  }
  env1(name, t) { const a = this.env[name]; if (!a.length) return 0; const f = Math.max(0, Math.min(a.length - 1, t * this.fps)), i = Math.floor(f), k = f - i; return (a[i] * (1 - k) + a[Math.min(a.length - 1, i + 1)] * k) / 255; }
  at(t) {
    const bi = floorIdx(this.beats, t), b0 = this.beats[Math.max(0, bi)] ?? 0, b1 = this.beats[bi + 1] ?? b0 + 60 / this.bpm;
    const di = floorIdx(this.downs, t), d0 = this.downs[Math.max(0, di)] ?? 0, d1 = this.downs[di + 1] ?? d0 + 240 / this.bpm;
    const si = Math.max(0, floorIdx(this.sections, t, 't0')), sec = this.sections[si] || { t0: 0, t1: this.dur, kind: 'full', e: 0.5 };
    const bar = this.bars[Math.max(0, floorIdx(this.bars, t, 't'))] || { e: 0.5 };
    const rep = this.repeats.find((r) => t >= r.t0 && t < r.t1) || null;
    return {
      t, beat: bi, beatPhase: bi < 0 ? 0 : Math.min(1, (t - b0) / Math.max(0.05, b1 - b0)), beatLen: b1 - b0,
      bar: di, barPhase: di < 0 ? 0 : Math.min(1, (t - d0) / Math.max(0.1, d1 - d0)),
      sec, secIdx: si, secPhase: Math.min(1, (t - sec.t0) / Math.max(0.1, sec.t1 - sec.t0)), next: this.sections[si + 1] || null,
      energy: bar.e ?? 0.5, rep,
      low: this.env1('low', t), mid: this.env1('mid', t), high: this.env1('high', t), onset: this.env1('onset', t), rms: this.env1('rms', t),
      progress: Math.min(1, t / this.dur),
    };
  }
}
