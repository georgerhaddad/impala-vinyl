// The EP (2008): a hand-painted poster you can stand in. The turntable floats over wavy bands of flat gouache that
// roll away under it toward the horizon like hills, or a sea; ahead, a painted sun of concentric rings comes up
// behind the last of them. Nothing glows: it is flat matte colour on paper, with brush-wobbled edges, slivers of
// bare paper where two colours don't quite meet, dry-brush streaks, and a little line boil.
//
// What the music does:
//   every kick pushes the sun's rings one step outward (a new one is born in the middle), and sends a ripple of
//   cream paint out across the bands from under the deck; the bass swells the hills and the sun; the treble swells
//   the dabs of paint drifting in the air. Every eight bars the sun throws a burst of rings and the sky shifts.
//   The sun climbs over the first part of a song and sets at its end, and each song has its own colours of band.
// Knobs (in DEFAULTS, ../index.js; 0 is neutral):
//   epSun    -1..1  the sun lower / higher than where the song has it      epRings  0..1  its rings spread over the sky
//   epSwell  0..1.5 taller hills      epMoon  0..1  the small moon of rings opposite the sun, grown
//   epFlock  0..1   a formation of forty-one small fliers circling the deck
// and the shared ones: flow (how fast the bands roll), turb (how wavy), calm (straighter), pulse (how hard the kick
// lands), spark (the dabs), fade (how much of the paint is on the paper), palette (dawn, day, blaze, dusk, night).
import * as THREE from 'three';

const C = new THREE.Vector3(0.042, 0, -0.03);                    // the middle of the deck (z up, metres)
const U = new THREE.Vector3(0.878, -0.479, 0).normalize();        // along the bands: left to right from the default camera
const V = new THREE.Vector3(0, 0, 1).cross(U);                    // across them: away from the viewer, toward the sun

// colours are written to the screen as they are (no tone mapping in these shaders), so: plain sRGB triples
const col = (h) => { const n = parseInt(h.slice(1), 16); return new THREE.Vector3((n >> 16 & 255) / 255, (n >> 8 & 255) / 255, (n & 255) / 255); };
const cols = (a) => a.map(col);
const smooth01 = (x) => { x = Math.max(0, Math.min(1, x)); return x * x * (3 - 2 * x); };
const frac = (x) => x - Math.floor(x);

// the light: the time of day. sun: its rings from the middle out; bandTo/bandAmt: what the light does to the hills
const LIGHTS = {
  dawn: {
    skyA: '#f9dcc0', skyB: '#c7b5d9', haze: '#e9c8c2', paper: '#f5e8d2', cloud: '#fdf1e2', cloudSh: '#eab6a6', shade: '#5f4474', rip: '#fff4de',
    sun: ['#fbe6b0', '#f7c96f', '#f4a55a', '#ee7a4f', '#f7c9a0', '#e8553e'], moon: ['#fdf1e2', '#c7b5d9', '#9d8fc4'], dab: ['#fff4de', '#f4a55a', '#e8553e'],
    bandTo: '#eab0a4', bandAmt: 0.3, stars: 0, clouds: 0.55, ink: ['#3a2a1e', '#c8372b'],
  },
  day: {
    skyA: '#f6ecd0', skyB: '#a3d3cc', haze: '#dcdcbc', paper: '#f3e7c8', cloud: '#fffaf0', cloudSh: '#c6ddd3', shade: '#3b3560', rip: '#fff6dc',
    sun: ['#f7dc77', '#f4c542', '#f4a834', '#f08a2b', '#e8692e', '#d8452b'], moon: ['#fffaf0', '#a3d3cc', '#6fb3bd'], dab: ['#fff6dc', '#f4c542', '#d8452b'],
    bandTo: '#f3e7c8', bandAmt: 0.1, stars: 0, clouds: 0.6, ink: ['#33221a', '#c8372b'],
  },
  blaze: {
    skyA: '#f7a531', skyB: '#dc4a2a', haze: '#e8742c', paper: '#fbe9c3', cloud: '#fbe9c3', cloudSh: '#f4b04a', shade: '#5e1f3a', rip: '#fff1c9',
    sun: ['#fbe9c3', '#d8452b', '#f4c542', '#b3243a', '#f08a2b', '#e8457a'], moon: ['#fbe9c3', '#f4c542', '#e8457a'], dab: ['#fff1c9', '#fbe9c3', '#b3243a'],
    bandTo: '#d8452b', bandAmt: 0.06, stars: 0, clouds: 0.35, ink: ['#fff6dc', '#f7dc77'],
  },
  dusk: {
    skyA: '#f6a56f', skyB: '#5d3d80', haze: '#b9668a', paper: '#f1d9b8', cloud: '#f9c9a0', cloudSh: '#c9567a', shade: '#33204f', rip: '#fde3b5',
    sun: ['#fbe6b0', '#f4c542', '#f08a2b', '#e8552e', '#c9305a', '#8a2a6a'], moon: ['#fde3b5', '#c9567a', '#8a2a6a'], dab: ['#fde3b5', '#f4c542', '#f08a2b'],
    bandTo: '#5d2f6e', bandAmt: 0.26, stars: 0.25, clouds: 0.7, ink: ['#fff3d6', '#f4c542'],
  },
  night: {
    skyA: '#2c3470', skyB: '#11153a', haze: '#1c2352', paper: '#0e1130', cloud: '#3a4484', cloudSh: '#222a5e', shade: '#070920', rip: '#dfe6f7',
    sun: ['#fbf1cf', '#f4e3a0', '#c9d3e8', '#93a8d8', '#6078c0', '#4458a0'], moon: ['#f4c542', '#f08a2b', '#d8452b'], dab: ['#fbf1cf', '#f4e3a0', '#93a8d8'],
    bandTo: '#222a6c', bandAmt: 0.5, stars: 1, clouds: 0.5, ink: ['#f6ecd0', '#f4c542'],
  },
};
for (const l of Object.values(LIGHTS)) { for (const k of ['skyA', 'skyB', 'haze', 'paper', 'cloud', 'cloudSh', 'shade', 'rip', 'bandTo']) l[k] = col(l[k]); for (const k of ['sun', 'moon', 'dab']) l[k] = cols(l[k]); }
const VEC = ['skyA', 'skyB', 'haze', 'paper', 'cloud', 'cloudSh', 'shade', 'rip'], ARR = ['sun', 'moon', 'dab'], NUMS = ['bandAmt', 'stars', 'clouds'];

// the songs: each its own six colours of band (warm, with a cool one or two against them), a cast over the sky,
// and a few habits. Anything else on the era gets one of these by its seed.
const SONGS = [
  { key: 'wine', bands: ['#7a1f3d', '#e8692e', '#4b2a5e', '#f4a834', '#b3243a', '#2f5d8a'], tint: '#f2b5a6', tintK: 0.3, alt: '#d98aa0', k: 1.7, tiger: 0, clouds: 0.9, flock: 0 },
  { key: 'tiger', bands: ['#f08a2b', '#2a2320', '#f4c542', '#d8452b', '#efe2c4', '#2f7f7a'], tint: '#f7d98a', tintK: 0.35, alt: '#8fc9b8', k: 1.5, tiger: 1, clouds: 0.5, flock: 0 },
  { key: 'slide', bands: ['#3d6fb4', '#7fc4c0', '#6b4c9a', '#f4c542', '#2c9c96', '#e8692e'], tint: '#9fd6dc', tintK: 0.4, alt: '#b9a6e0', k: 1.9, tiger: 0, clouds: 1.2, flock: 0 },
  { key: 'mosquito', bands: ['#6f8f2f', '#f4c542', '#2f6b4f', '#d8452b', '#e9b949', '#6b4c9a'], tint: '#dfe28a', tintK: 0.35, alt: '#f2b07a', k: 2.1, tiger: 0, clouds: 0.7, flock: 1 },
  { key: 'wander', bands: ['#6b4c9a', '#3d6fb4', '#e9b949', '#7a4a2a', '#c9567a', '#f08a2b'], tint: '#e3b9dc', tintK: 0.3, alt: '#f4c9a0', k: 1.6, tiger: 0, clouds: 1.0, flock: 0 },
];
for (const f of SONGS) { f.bands = cols(f.bands); f.tint = col(f.tint); f.alt = col(f.alt); }
const songOf = (title, seed) => { const t = (title || '').toLowerCase(); return SONGS.find((f) => t.includes(f.key)) || SONGS[Math.floor((seed || 0) * SONGS.length) % SONGS.length]; };

const NOISE = `
float h11(float n) { return fract(sin(n * 127.1 + 311.7) * 43758.5453); }
float h21(vec2 p) { p = fract(p * vec2(123.34, 456.21)); p += dot(p, p + 45.32); return fract(p.x * p.y); }
float vn(vec2 p) { vec2 i = floor(p), f = fract(p); f = f * f * (3.0 - 2.0 * f); return mix(mix(h21(i), h21(i + vec2(1, 0)), f.x), mix(h21(i + vec2(0, 1)), h21(i + vec2(1, 1)), f.x), f.y); }
float h31(vec3 p) { p = fract(p * vec3(0.1031, 0.1030, 0.0973)); p += dot(p, p.yzx + 33.33); return fract((p.x + p.y) * p.z); }
float vn3(vec3 p) { vec3 i = floor(p), f = fract(p); f = f * f * (3.0 - 2.0 * f);
  return mix(mix(mix(h31(i), h31(i + vec3(1, 0, 0)), f.x), mix(h31(i + vec3(0, 1, 0)), h31(i + vec3(1, 1, 0)), f.x), f.y),
             mix(mix(h31(i + vec3(0, 0, 1)), h31(i + vec3(1, 0, 1)), f.x), mix(h31(i + vec3(0, 1, 1)), h31(i + vec3(1, 1, 1)), f.x), f.y), f.z); }
// the tooth of the paper, fixed to the sheet (the screen)
vec3 paperGrain(vec3 c, vec2 fc) { return c * (0.925 + 0.06 * vn(fc * 0.55) + 0.045 * h21(floor(fc * 0.75))) - 0.03 * step(0.985, h21(floor(fc * 0.5) + 7.0)); }
`;

// ---- the sky: the sun's rings, out to the far side of it ----
const SKY_VS = `varying vec3 vD; void main() { vD = position; gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); gl_Position.z = gl_Position.w * 0.99999; }`;
const SKY_FS = `
uniform vec3 uSunDir, uSunUp, uSunRt, uMoonDir, uSkyA, uSkyB, uHaze, uPaper, uCloud, uCloudSh;
uniform vec3 uSun[6]; uniform vec3 uMoon[3];
uniform float uPush, uRingN, uDisc, uRings, uMoonK, uStars, uCloudK, uT, uBoil, uFade, uDrift, uSeed;
varying vec3 vD;
${NOISE}
float stars(vec3 d, float scale) {
  float az = atan(d.y, d.x), el = asin(clamp(d.z, -1.0, 1.0));
  vec2 g = vec2(az * scale / 6.2832 * 2.0, el * scale / 3.1416), c = floor(g), f = fract(g);
  float h = h21(c);
  if (h < 0.9) return 0.0;
  vec2 q = vec2(h21(c + 3.1), h21(c + 7.7)) * 0.6 + 0.2;
  float tw = 0.75 + 0.25 * sin(uT * (1.0 + h * 3.0) + h * 40.0);
  return step(length(f - q) + 0.05 * vn(f * 9.0 + c), 0.07 + 0.09 * (h - 0.9) / 0.1 * tw);
}
void main() {
  vec3 d = normalize(vD);
  float ang = acos(clamp(dot(d, uSunDir), -1.0, 1.0));
  vec2 sp = vec2(dot(d, uSunRt), dot(d, uSunUp)), dir = sp / (length(sp) + 1e-5);
  float a = atan(sp.x, sp.y);                                    // round the sun; the seam points straight down
  // the ring coordinate: even rings inside the disc, wider and wider ones outside it, all the way round the sky
  float rr = ang < uDisc ? ang / uDisc * uRingN : uRingN * (1.0 + 0.62 * log(ang / uDisc));
  // hand-painted: every ring a little out of true, its edge wandering with the brush (and boiling, frame to frame)
  float wob = (vn(dir * 2.2 + rr * 0.35 + uSeed * 10.0) - 0.5) * 0.5 + (vn(dir * 9.0 + rr * 1.3 + uBoil) - 0.5) * 0.17 + (vn(dir * 34.0 + rr * 4.0 - uBoil * 3.0) - 0.5) * 0.04;
  float x = rr + wob * min(1.0, rr * 0.8) - uPush;
  float idx = floor(x), f = x - idx, mid = idx + 0.5 + uPush;     // mid: where this ring is now, in rings from the middle
  float inDisc = smoothstep(uRingN + 0.45, uRingN - 0.45, mid);
  float spread = uRings * (1.0 - 0.8 * smoothstep(uRingN, uRingN * 3.3, mid));
  float k = max(inDisc, spread);
  vec3 sky = mix(uSkyA, uSkyB, pow(clamp((mid - uRingN) / (uRingN * 2.4), 0.0, 1.0), 0.8));
  sky *= 1.0 + 0.035 * (mod(idx, 2.0) * 2.0 - 1.0);              // the sky is rings too, in two tones of itself
  vec3 c = mix(sky, uSun[int(mod(idx, 6.0))], k);
  // dry brush: bristle streaks round the ring, the paper showing through them
  float st = vn(vec2(a * (3.0 + idx * 1.5), x * 30.0));
  float e = min(f, 1.0 - f);
  c = mix(c, mix(c, uPaper, 0.55), smoothstep(0.66, 0.74, st) * (0.25 + 0.75 * smoothstep(0.3, 0.05, e)) * (0.35 + 0.65 * k) * 0.8);
  // where two rings don't quite meet: a sliver of paper
  float gap = 0.03 + 0.07 * vn(vec2(a * 5.0 + idx * 3.7, idx));
  c = mix(c, uPaper, (1.0 - smoothstep(gap * 0.6, gap, e + (st - 0.5) * 0.03)) * k * 0.9);
  // a small moon of rings, opposite: always there, and bigger with epMoon
  float am = acos(clamp(dot(d, uMoonDir), -1.0, 1.0)), rm = (0.034 + 0.03 * uMoonK) * (1.0 + 0.14 * (vn(d.xy * 30.0 + uBoil) - 0.5));
  float xm = am / rm * 3.0 + (vn(d.xy * 60.0 - uBoil) - 0.5) * 0.3 - uPush * 0.5, fm = fract(xm);
  c = mix(c, mix(uPaper, uMoon[int(mod(floor(xm), 3.0))], smoothstep(0.03, 0.09, min(fm, 1.0 - fm))), step(am, rm));
  // painted stars
  if (uStars > 0.01) c = mix(c, uSun[0], (stars(d, 70.0) + stars(d.yxz, 130.0)) * uStars * (1.0 - k) * step(0.01, d.z));
  // clouds: long flat shapes low in the sky, a darker underside
  float cd = uDrift, cc = cos(cd), cs = sin(cd);
  vec3 q = vec3(d.x * cc - d.y * cs, d.x * cs + d.y * cc, d.z);
  float band = smoothstep(0.035, 0.075, d.z) * smoothstep(0.5, 0.22, d.z) * smoothstep(uDisc * 0.9, uDisc * 1.7, ang);
  float thr = 0.74 - 0.13 * uCloudK;
  float cn = vn3(vec3(q.xy * 3.4, q.z * 17.0) + uSeed * 5.0) * 0.72 + vn3(vec3(q.xy * 11.0, q.z * 50.0) + 3.0) * 0.28 + (vn(dir * 40.0 + uBoil) - 0.5) * 0.02;
  float cn2 = vn3(vec3(q.xy * 3.4, (q.z + 0.012) * 17.0) + uSeed * 5.0) * 0.72 + vn3(vec3(q.xy * 11.0, (q.z + 0.012) * 50.0) + 3.0) * 0.28;
  c = mix(c, mix(uCloudSh, uCloud, step(thr, cn2 * band)), step(thr, cn * band));
  c = mix(c, uHaze, smoothstep(0.0, -0.02, d.z));
  // fade: the paint coming off the paper, in streaks
  float lack = (1.0 - uFade) * 1.25;
  c = mix(uPaper, c, smoothstep(lack - 0.25, lack, vn(vec2(a * 6.0, x * 9.0)) * 0.6 + vn(d.xy * 4.0 + d.z * 31.0) * 0.4));
  gl_FragColor = vec4(paperGrain(c, gl_FragCoord.xy), 1.0);
}`;

// ---- the bands: a mesh laid out in band space (x: which band, y: along it), bent into hills here ----
const A0 = 0.4, RMAX = 105, WMAX = 13.5, QMAX = Math.asinh(RMAX);
const LAND_VS = `
uniform float uScroll, uAmp, uWob, uT, uK, uSeed;
uniform vec4 uRipAge, uRipAmp;
uniform vec3 uC, uU, uV;
varying float vWp, vQ, vR, vW;
varying vec2 vUV;
float h11(float n) { return fract(sin(n * 127.1 + 311.7) * 43758.5453); }
void main() {
  float wv = position.x, q = position.y;
  float u = sinh(q);                                              // metres along the band
  float sw = wv / uK, v = ${A0} * sinh(sw), bw = ${A0} * cosh(sw) / uK;   // metres across (bands widen with distance); this band's width
  float ws = wv - uScroll;                                        // the bands roll away through the mesh
  q = asinh(u / pow(1.0 + v * v, 0.35));                        // along the band, in a measure that stays even on screen as it recedes
  float wp = ws + uWob * (0.5 * sin(q * 1.7 + ws * 0.9 + uSeed * 6.28) + 0.27 * sin(q * 3.9 - ws * 1.7 + uSeed * 17.0 + uT * 0.21) + 0.12 * sin(q * 8.3 + ws * 2.9 - uT * 0.37));
  float idx = floor(wp), f = wp - idx, hs = h11(idx + uSeed * 91.0);
  float r0 = length(vec2(u, v)), r = min(r0, ${RMAX}.0), sc = r / max(r0, 1e-4);
  u *= sc; v *= sc;
  // each band is a ridge: a hump across it, rising and falling along it; low under the deck, hills far away
  float hump = sin(3.14159 * f); hump *= hump;
  float along = 0.62 + 0.38 * sin(q * 2.3 + idx * 2.4 + uSeed * 9.0) + 0.2 * sin(q * 6.1 + idx * 5.7 + uT * 0.15);
  float rel = (0.045 + 0.11 / (1.0 + r * r / 5.0)) * (0.65 + 0.6 * hs);
  float lg = log(1.0 + r / 2.0) / 3.43;
  float z = -0.31 + r * 0.02 * pow(lg, 1.5) + bw * sc * rel * hump * along * uAmp * (1.0 - smoothstep(${(0.8 * RMAX).toFixed(1)}, ${RMAX}.0, r0));
  // and the land has its own slow dunes under the bands, so the horizon is never a ruled line
  vec2 P = vec2(u, v) / pow(1.0 + r * r, 0.35);
  z += r * 0.015 * smoothstep(4.0, 14.0, r) * (sin(P.x * 1.9 + uSeed * 20.0) * sin(P.y * 1.6 + uSeed * 31.0 + 1.0) + 0.5 * sin(P.x * 3.7 - P.y * 2.9 + uSeed * 7.0));
  for (int i = 0; i < 4; i++) { float dr = r - (0.22 + uRipAge[i] * 1.3); z += uRipAmp[i] * 0.03 * exp(-dr * dr / 0.02) * exp(-uRipAge[i] * 1.2); }   // the kick, travelling out
  z = min(z, -0.12 + max(0.0, r - 3.2) * 0.6);                    // never up into the camera's reach
  vec3 p = vec3(uC.xy, 0.0) + uU * u + uV * v + vec3(0.0, 0.0, z);
  vWp = wp; vQ = q; vR = r; vW = wv; vUV = vec2(u, v);
  gl_Position = projectionMatrix * modelViewMatrix * vec4(p, 1.0);
}`;
const LAND_FS = `
uniform vec3 uBand[6];
uniform vec3 uPaper, uHaze, uShade, uRip;
uniform vec4 uRipAge, uRipAmp;
uniform float uFade, uBoil, uSeed, uScroll, uTiger, uHazeK;
uniform vec2 uSunUV;
varying float vWp, vQ, vR, vW;
varying vec2 vUV;
${NOISE}
void main() {
  float aa = fwidth(vWp), fine = 1.0 - smoothstep(0.02, 0.09, aa);          // detail goes as the bands get small
  // brush-wobbled edges
  float n1 = vn(vec2(vQ * 9.0, vWp * 1.3) + uBoil * 13.7), n2 = vn(vec2(vQ * 37.0, vWp * 5.0) - uBoil * 7.1);
  float wp = vWp + ((n1 - 0.5) * 0.11 + (n2 - 0.5) * 0.03) * fine;
  float idx = floor(wp), f = wp - idx, e = min(f, 1.0 - f), h = h11(idx * 1.37 + uSeed * 91.0);
  vec3 base = uBand[int(mod(idx, 6.0))], c = base;
  // two tones of each: the side away from the sun a shade darker
  float lit = smoothstep(-0.02, 0.02, f - 0.5 + (n1 - 0.5) * 0.12);
  c = mix(mix(c, uShade, 0.13), mix(c, uPaper, 0.05), lit);
  // some bands carry a stripe along the crest, some a pair of thin lines
  vec3 other = uBand[int(mod(idx + 2.0, 6.0))];
  float crest = (1.0 - smoothstep(0.085, 0.1, abs(f - 0.5 + (n1 - 0.5) * 0.07))) * step(0.62, h);
  float lines = (1.0 - smoothstep(0.02, 0.032, abs(abs(f - 0.5) - 0.2 + (n1 - 0.5) * 0.05))) * step(h, 0.28);
  c = mix(c, other, crest * fine);
  c = mix(c, mix(base, uShade, 0.45), lines * fine);
  // one song's bands are striped like its animal: dark tapering strokes in from the edges
  if (uTiger > 0.01) {
    float tg = sin(vQ * 30.0 + (f - 0.5) * 5.0 * sin(idx * 2.1) + n1 * 4.0);
    float taper = smoothstep(0.62, 0.1, e + 0.25 * vn(vec2(vQ * 30.0 / 6.2832, idx)));
    c = mix(c, mix(uShade, vec3(0.1, 0.08, 0.08), 0.5), smoothstep(0.55, 0.7, tg) * taper * step(0.3, h11(idx * 3.3 + 1.0)) * uTiger * fine);
  }
  // the wash is never quite even; dry-brush streaks along the band, the paper showing through near its edges
  float st = vn(vec2(vQ * 5.0 + idx * 3.1, f * 46.0));
  c *= 0.965 + 0.07 * vn(vec2(vQ * 2.0 + 5.0, wp * 2.0));
  c = mix(c, mix(c, uPaper, 0.6), smoothstep(0.66, 0.74, st) * smoothstep(0.3, 0.04, e) * 0.7 * fine);
  // where two bands don't quite meet: a sliver of paper
  float gap = 0.028 + 0.05 * vn(vec2(vQ * 3.0, idx * 7.7));
  c = mix(uPaper, c, mix(1.0, smoothstep(gap * 0.5, gap, e + (st - 0.5) * 0.03), fine));
  // the deck's shadow, painted on, falling away from the sun
  vec2 sq = abs(vUV + uSunUV * 0.09) - vec2(0.2, 0.16);
  float sd = length(max(sq, 0.0)) + min(max(sq.x, sq.y), 0.0) - 0.05 + (n1 - 0.5) * 0.05;
  c = mix(c, mix(c * 0.6, uShade, 0.4), (1.0 - smoothstep(-0.015, 0.02, sd)) * 0.8);
  // the kick: a ring of lighter paint going out from under the deck, across the bands
  vec2 rd = vUV / max(vR, 1e-3);
  for (int i = 0; i < 4; i++) {
    float ag = uRipAge[i], R = 0.22 + ag * 1.3, w = 0.03 + 0.045 * ag;
    float dd = abs(vR - R + (vn(rd * 2.5 + float(i) * 7.0) - 0.5) * 0.1 * (0.3 + ag));
    float life = floor((1.0 - smoothstep(0.45, 1.5, ag)) * 5.0 + 0.5) / 5.0;
    c = mix(c, uRip, (1.0 - smoothstep(w * 0.7, w, dd + (st - 0.5) * 0.03)) * 0.36 * life * min(1.0, uRipAmp[i]));
  }
  // far away the hills go to the colour of the air, a band at a time
  float wc = abs(idx + 0.5 + uScroll);
  c = mix(c, uHaze, max(uHazeK * smoothstep(3.5, ${WMAX.toFixed(1)}, wc), smoothstep(0.5, 1.4, aa)) * 0.85);
  // fade: the paint coming off the paper, in streaks
  float lack = (1.0 - uFade) * 1.25;
  c = mix(uPaper, c, smoothstep(lack - 0.25, lack, vn(vec2(vQ * 3.0, wp * 9.0)) * 0.6 + st * 0.4));
  gl_FragColor = vec4(paperGrain(c, gl_FragCoord.xy), 1.0);
}`;

// ---- dabs of paint in the air ----
const DAB_VS = `
attribute vec3 aP, aR;
uniform float uT, uSize, uSpark, uHigh;
uniform vec3 uC;
varying vec2 vUv; varying float vK;
void main() {
  float ang = aP.y * 6.2832 + uT * (0.03 + 0.05 * aR.x) * (aR.y < 0.5 ? 1.0 : -1.0);
  float rad = 0.5 + pow(aP.x, 1.6) * 6.0;
  float zz = mod(aP.z * 2.6 + uT * (0.02 + 0.04 * aR.z), 2.6);
  vec3 wp = uC + vec3(cos(ang) * rad, sin(ang) * rad, zz - 0.2);
  wp.xy += 0.05 * vec2(sin(uT * 0.7 + aR.x * 40.0), cos(uT * 0.6 + aR.y * 40.0));
  vec4 mv = viewMatrix * vec4(wp, 1.0);
  float sz = uSize * (0.5 + aR.z) * (1.0 + uHigh * 0.9 * aR.x) * (0.6 + 0.4 * rad) * smoothstep(0.0, 0.25, zz) * smoothstep(2.6, 2.2, zz) * step(aR.y, uSpark) * smoothstep(0.6, 1.6, -mv.z);
  mv.xy += position.xy * min(sz, -mv.z * 0.022);
  vUv = position.xy; vK = aR.x;
  gl_Position = projectionMatrix * mv;
}`;
const DAB_FS = `
uniform vec3 uDab[3]; uniform float uBoil;
varying vec2 vUv; varying float vK;
${NOISE}
void main() {
  if (length(vUv) + (vn(vUv * 2.5 + vK * 31.0 + uBoil) - 0.5) * 0.3 > 0.42) discard;
  gl_FragColor = vec4(paperGrain(uDab[int(mod(vK * 17.0, 3.0))], gl_FragCoord.xy), 1.0);
}`;

// ---- forty-one fliers in formation, round and round the deck ----
const FLOCK_VS = `
attribute float aI;
uniform float uT, uFlock;
uniform vec3 uC;
varying vec2 vUv; varying float vI;
void main() {
  float row = ceil(aI * 0.5), side = aI < 0.5 ? 0.0 : mod(aI, 2.0) * 2.0 - 1.0;
  float th = uT * 0.2, R = 2.7 + 0.4 * sin(uT * 0.13);
  vec3 fwd = vec3(-sin(th), cos(th), 0.0), lat = vec3(cos(th), sin(th), 0.0);
  vec3 wp = uC + lat * R + vec3(0.0, 0.0, 0.5 + 0.22 * sin(uT * 0.31)) - fwd * row * 0.09 + lat * side * row * 0.062;
  wp.z += 0.014 * sin(uT * 5.0 + aI * 1.7) + row * 0.012; wp += lat * 0.012 * sin(uT * 3.1 + aI * 2.3);
  vec4 mv = viewMatrix * vec4(wp, 1.0);
  mv.xy += position.xy * 0.085 * uFlock;
  vUv = position.xy; vI = aI;
  gl_Position = projectionMatrix * mv;
}`;
const FLOCK_FS = `
uniform vec3 uBody, uWing; uniform float uT;
varying vec2 vUv; varying float vI;
void main() {
  float flap = 0.35 + 0.65 * abs(sin(uT * 19.0 + vI * 2.4));
  float body = length(vUv / vec2(0.07, 0.2));
  float wing = length(vec2(abs(vUv.x) - 0.2, vUv.y - 0.03 - 0.25 * flap * abs(vUv.x)) / vec2(0.2, 0.05 + 0.07 * flap));
  if (body > 1.0 && wing > 1.0) discard;
  gl_FragColor = vec4(body <= 1.0 ? uBody : uWing, 1.0);
}`;

export class EpWorld {
  // the act for each kind of section. A song opens looking down on the record and the bands under it, then the
  // camera comes down to the horizon: lower and wider the louder it gets, until the whole sun is in the frame.
  static SECTIONS = {
    intro: { palette: 'dawn', flow: 0.25, turb: 0.15, calm: 0.4, pulse: 0.4, spark: 0.3, epSun: -0.2, epRings: 0.12, camEl: -0.16, camAz: 0.3, camZoom: -0.02, drift: 0.03, split: 0.12, bloom: 0.3 },
    quiet: { palette: 'day', flow: 0.45, turb: 0.3, calm: 0.15, pulse: 0.65, spark: 0.5, epRings: 0.25, camEl: -0.44, camAz: -0.16, camZoom: -0.28, drift: 0.04, split: 0.2, bloom: 0.3 },
    build: { palette: 'dusk', flow: 0.8, turb: 0.55, pulse: 0.9, spark: 0.8, epRings: 0.6, epSwell: 0.35, camEl: -0.47, camAz: 0.12, camZoom: -0.42, drift: 0.06, split: 0.3, bloom: 0.3 },
    full: { palette: 'blaze', flow: 1.15, turb: 0.8, pulse: 1.1, spark: 1, epRings: 1, epSwell: 0.6, camEl: -0.55, camAz: 0, camZoom: -0.55, drift: 0.04, split: 0.45, bloom: 0.35 },
    break: { palette: 'night', flow: 0.3, turb: 0.2, calm: 0.35, pulse: 0.7, spark: 0.9, epRings: 0.4, epMoon: 1, epSun: 0.15, camEl: -0.49, camAz: 0.04, camZoom: -0.3, drift: 0.035, split: 0.15, bloom: 0.4 },
    outro: { palette: 'dusk', flow: 0.3, turb: 0.2, calm: 0.3, pulse: 0.5, spark: 0.4, fade: 0.8, epSun: -0.6, epRings: 0.45, camEl: -0.5, camAz: -0.3, camZoom: -0.75, drift: 0.04, split: 0.15, bloom: 0.3 },
    loop: { palette: 'night', flow: 0.9, turb: 0.9, pulse: 1.1, epRings: 1, glitch: 0.2, trail: 0.35 },
  };
  static base(info) { return { words: 'drift', grain: 0.05, vig: 0.45, mblur: 0.5, epFlock: /mosquito/i.test(info.title || '') ? 1 : 0 }; }
  // rounded and friendly, as written, no streaks or fringes: lettering on a poster
  static WORDS = { font: '"Fredoka", ui-rounded, system-ui, sans-serif', wide: '"Fredoka", ui-rounded, system-ui, sans-serif', weight: 600, upper: false, track: 0.25, streak: 0, chroma: false, rise: 0.012 };

  // cream with a dark brown line round it: the sky is light and the bands are dark, so no single ink reads on both
  ink(p) { const i = (LIGHTS[p.palette] || LIGHTS.day).ink; return this.inks[i[1]] ||= ['#fff6dc', i[1] === '#c8372b' ? '#f7a23b' : i[1], '#33221a']; }
  post(post, p, s) {                                                // matte: paint doesn't glow
    post.uThresh = 0.97; post.uBloom *= 0.3; post.uGrain += 0.02;
  }

  constructor(r) {
    this.r = r; this.inks = {};
    this.scene = new THREE.Scene();
    const L = LIGHTS.day;
    this.pal = { band: SONGS[4].bands.map((c) => c.clone()), bandAmt: 0, stars: 0, clouds: 0.6 };
    for (const k of VEC) this.pal[k] = L[k].clone();
    for (const k of ARR) this.pal[k] = L[k].map((c) => c.clone());
    this.tmp = new THREE.Vector3(); this.tmp2 = new THREE.Vector3();
    this.song = SONGS[4]; this.title = null;
    this.flowT = 0; this.push = 0; this.pushTo = 0; this.low = 0; this.high = 0; this.lastKick = 0; this.rip = 0; this.lastBar = -1; this.variant = 0; this.variantTo = 0;
    this.sunEl = 0.04; this.sunPhi = 0.2; this.k = 1.7; this.tiger = 0; this.ringN = 5;
    this.ripAge = new THREE.Vector4(9, 9, 9, 9); this.ripAmp = new THREE.Vector4(0, 0, 0, 0);
    this.buildSky(); this.buildLand(); this.buildDabs(); this.buildFlock();
  }
  buildSky() {
    const p = this.pal;
    this.skyU = {
      uSunDir: { value: new THREE.Vector3(0, 1, 0) }, uSunUp: { value: new THREE.Vector3(0, 0, 1) }, uSunRt: { value: new THREE.Vector3(1, 0, 0) }, uMoonDir: { value: new THREE.Vector3(0, -1, 0) },
      uSkyA: { value: p.skyA }, uSkyB: { value: p.skyB }, uHaze: { value: p.haze }, uPaper: { value: p.paper }, uCloud: { value: p.cloud }, uCloudSh: { value: p.cloudSh },
      uSun: { value: p.sun }, uMoon: { value: p.moon },
      uPush: { value: 0 }, uRingN: { value: 5 }, uDisc: { value: 0.115 }, uRings: { value: 0 }, uMoonK: { value: 0 }, uStars: { value: 0 }, uCloudK: { value: 0.6 },
      uT: { value: 0 }, uBoil: { value: 0 }, uFade: { value: 1 }, uDrift: { value: 0 }, uSeed: { value: 0 },
    };
    const sky = new THREE.Mesh(new THREE.SphereGeometry(60, 32, 16), new THREE.ShaderMaterial({ vertexShader: SKY_VS, fragmentShader: SKY_FS, uniforms: this.skyU, side: THREE.BackSide, depthWrite: false }));
    sky.position.copy(C); sky.frustumCulled = false; sky.renderOrder = -1;
    this.scene.add(sky);
  }
  buildLand() {
    const ROWS = Math.round(WMAX * 2 * 14), COLS = 220, pos = new Float32Array((ROWS + 1) * (COLS + 1) * 3), idx = new Uint32Array(ROWS * COLS * 6);
    let n = 0, m = 0;
    for (let i = 0; i <= ROWS; i++) for (let j = 0; j <= COLS; j++) { pos[n++] = (i / ROWS * 2 - 1) * WMAX; pos[n++] = (j / COLS * 2 - 1) * QMAX; pos[n++] = 0; }
    for (let i = 0; i < ROWS; i++) for (let j = 0; j < COLS; j++) { const a = i * (COLS + 1) + j, b = a + COLS + 1; idx[m++] = a; idx[m++] = b; idx[m++] = a + 1; idx[m++] = a + 1; idx[m++] = b; idx[m++] = b + 1; }
    const g = new THREE.BufferGeometry();
    g.setAttribute('position', new THREE.BufferAttribute(pos, 3)); g.setIndex(new THREE.BufferAttribute(idx, 1));
    const p = this.pal;
    this.landU = {
      uScroll: { value: 0 }, uAmp: { value: 1 }, uWob: { value: 0.35 }, uT: { value: 0 }, uK: { value: 1.7 }, uSeed: { value: 0 },
      uRipAge: { value: this.ripAge }, uRipAmp: { value: this.ripAmp }, uC: { value: C }, uU: { value: U }, uV: { value: V },
      uBand: { value: p.band }, uPaper: { value: p.paper }, uHaze: { value: p.haze }, uShade: { value: p.shade }, uRip: { value: p.rip },
      uFade: { value: 1 }, uBoil: { value: 0 }, uTiger: { value: 0 }, uHazeK: { value: 0.8 }, uSunUV: { value: new THREE.Vector2(0, 1) },
    };
    const land = new THREE.Mesh(g, new THREE.ShaderMaterial({ vertexShader: LAND_VS, fragmentShader: LAND_FS, uniforms: this.landU, side: THREE.DoubleSide }));
    land.frustumCulled = false;
    this.scene.add(land);
  }
  buildDabs() {
    const N = 260, g = new THREE.InstancedBufferGeometry(), rnd = (i) => frac(Math.sin(i * 127.1 + 3.7) * 43758.5453);
    g.setAttribute('position', new THREE.Float32BufferAttribute([-0.5, -0.5, 0, 0.5, -0.5, 0, 0.5, 0.5, 0, -0.5, 0.5, 0], 3)); g.setIndex([0, 1, 2, 0, 2, 3]);
    const aP = new Float32Array(N * 3), aR = new Float32Array(N * 3);
    for (let i = 0; i < N * 3; i++) { aP[i] = rnd(i * 2 + 1); aR[i] = rnd(i * 2 + 2000); }
    g.setAttribute('aP', new THREE.InstancedBufferAttribute(aP, 3)); g.setAttribute('aR', new THREE.InstancedBufferAttribute(aR, 3));
    g.instanceCount = N;
    this.dabU = { uT: { value: 0 }, uSize: { value: 0.024 }, uSpark: { value: 0.6 }, uHigh: { value: 0 }, uC: { value: C }, uDab: { value: this.pal.dab }, uBoil: { value: 0 } };
    this.dabs = new THREE.Mesh(g, new THREE.ShaderMaterial({ vertexShader: DAB_VS, fragmentShader: DAB_FS, uniforms: this.dabU }));
    this.dabs.frustumCulled = false;
    this.scene.add(this.dabs);
  }
  buildFlock() {
    const N = 41, g = new THREE.InstancedBufferGeometry();
    g.setAttribute('position', new THREE.Float32BufferAttribute([-0.5, -0.5, 0, 0.5, -0.5, 0, 0.5, 0.5, 0, -0.5, 0.5, 0], 3)); g.setIndex([0, 1, 2, 0, 2, 3]);
    g.setAttribute('aI', new THREE.InstancedBufferAttribute(Float32Array.from({ length: N }, (_, i) => i), 1));
    g.instanceCount = N;
    this.flockU = { uT: { value: 0 }, uFlock: { value: 0 }, uC: { value: C }, uBody: { value: this.pal.shade }, uWing: { value: this.pal.rip } };
    this.flock = new THREE.Mesh(g, new THREE.ShaderMaterial({ vertexShader: FLOCK_VS, fragmentShader: FLOCK_FS, uniforms: this.flockU }));
    this.flock.frustumCulled = false; this.flock.visible = false;
    this.scene.add(this.flock);
  }

  // p: the act's parameters (already blended), s: what the music is doing, dt: seconds of real time, loopT: the world's clock
  update(dt, p, s, loopT) {
    const rate = s.rate ?? 1, pulse = p.pulse ?? 0.5, prog = s.progress || 0;
    // what the music is doing: the deck's output, or the song map while nothing can be heard
    let kick = s.kick || 0, low = s.low || 0, high = s.high || 0;
    if (kick + low + high < 0.02 && s.playing && s.beatPhase != null) {
      const e = s.energy || 0;
      kick = Math.exp(-s.beatPhase * s.beatLen * 9) * (0.35 + 0.65 * e); low = e * (0.45 + 0.4 * kick); high = s.onset || 0;
    }
    const kf = 1 - Math.exp(-dt * 8);
    this.low += (low - this.low) * kf; this.high += (high - this.high) * kf;
    if (s.title !== this.title) { this.title = s.title; this.song = songOf(s.title, s.seed); }
    const song = this.song, seed = s.seed || 0;

    // the colours: the act's light, the song's bands in that light, later in the song a little later in the day
    const L = LIGHTS[p.palette] || LIGHTS.day, D = LIGHTS.dusk, pal = this.pal, t = this.tmp, t2 = this.tmp2;
    const k = 1 - Math.exp(-dt * (p.palFast ? 12 : 1.5));
    const late = L === LIGHTS.night || L === D ? 0 : 0.4 * smooth01((prog - 0.55) / 0.4);
    const dark = L === LIGHTS.night ? 0.25 : 1;
    for (const key of VEC) pal[key].lerp(t.copy(L[key]).lerp(D[key], late), k);
    for (const key of ARR) for (let i = 0; i < L[key].length; i++) pal[key][i].lerp(t.copy(L[key][i]).lerp(D[key][i], late * 0.6), k);
    for (const key of NUMS) pal[key] += (L[key] + (D[key] - L[key]) * late - pal[key]) * k;
    // the song's cast over the sky; every eight bars it leans toward the song's other colour and back
    this.variant += (this.variantTo - this.variant) * (1 - Math.exp(-dt * 0.8));
    pal.skyB.lerp(t.copy(song.tint).lerp(song.alt, this.variant), song.tintK * dark * k);
    pal.skyA.lerp(t.copy(song.tint).lerp(song.alt, this.variant), song.tintK * 0.3 * dark * k);
    const bAmt = L.bandAmt + (D.bandAmt - L.bandAmt) * late;
    t2.copy(L.bandTo).lerp(D.bandTo, late);
    for (let i = 0; i < 6; i++) pal.band[i].lerp(t.copy(song.bands[i]).lerp(t2, bAmt), k);

    // the kick: the rings step out, a ripple leaves the deck
    const hit = kick > 0.5 && this.lastKick <= 0.5; this.lastKick = kick;
    this.ripAge.x += dt; this.ripAge.y += dt; this.ripAge.z += dt; this.ripAge.w += dt;
    if (hit && s.playing) {
      this.pushTo += 0.5 * Math.min(1.3, pulse);
      this.ripAge.setComponent(this.rip, 0); this.ripAmp.setComponent(this.rip, Math.min(1, pulse * 1.2) * (p.fade ?? 1)); this.rip = (this.rip + 1) % 4;
    }
    if (s.barPhase != null && s.bar !== this.lastBar) {              // every eight bars: a burst of rings, the sky leans
      if (this.lastBar >= 0 && s.bar % 8 === 0 && s.playing) { this.pushTo += 2 * Math.min(1, pulse); this.variantTo = frac(Math.sin((s.bar / 8 + seed * 50) * 12.9898) * 43758.5453); }
      this.lastBar = s.bar;
    }
    this.pushTo += dt * rate * (0.05 + 0.2 * p.flow);
    this.push += (this.pushTo - this.push) * (1 - Math.exp(-dt * 9));
    if (this.push > 60) { this.push -= 60; this.pushTo -= 60; }       // 60: a whole number of colour cycles
    this.flowT += dt * p.flow * 0.3 * (1 + 0.6 * (s.energy || 0)) * rate;

    // the sun: each song puts it a little differently; it climbs over the first fifth and sets at the end
    const side = seed < 0.5 ? -1 : 1, phi = side * (0.17 + 0.1 * frac(seed * 7.3));
    const arc = smooth01(prog / 0.22) * (1 - 0.8 * smooth01((prog - 0.9) / 0.1));
    const el = (-0.5 + 4.4 * arc + (p.epSun || 0) * 5) * Math.PI / 180;
    const ke = 1 - Math.exp(-dt * 1.2);
    this.sunEl += (el - this.sunEl) * ke; this.sunPhi += (phi - this.sunPhi) * ke;
    this.k += (song.k - this.k) * ke; this.tiger += (song.tiger - this.tiger) * ke;
    this.ringN += (4.2 + 2.2 * frac(seed * 3.1) + 2 * prog - this.ringN) * ke;
    const su = this.skyU, ce = Math.cos(this.sunEl), sd = su.uSunDir.value, up = su.uSunUp.value;
    sd.copy(V).multiplyScalar(Math.cos(this.sunPhi) * ce).addScaledVector(U, Math.sin(this.sunPhi) * ce); sd.z = Math.sin(this.sunEl);
    up.set(0, 0, 1).addScaledVector(sd, -sd.z).normalize(); su.uSunRt.value.crossVectors(sd, up);
    const mphi = this.sunPhi + Math.PI + 0.45 * side, me = 0.1;
    su.uMoonDir.value.copy(V).multiplyScalar(Math.cos(mphi) * Math.cos(me)).addScaledVector(U, Math.sin(mphi) * Math.cos(me)); su.uMoonDir.value.z = Math.sin(me);

    const boil = s.reduce ? 0 : Math.floor(loopT * 7) * 1.618, fade = p.fade ?? 1;
    su.uPush.value = this.push; su.uRingN.value = this.ringN; su.uDisc.value = (0.094 + 0.024 * frac(seed * 5.7)) * (1 + 0.07 * this.low * pulse + 0.05 * kick * pulse);
    su.uRings.value = p.epRings || 0; su.uMoonK.value = p.epMoon || 0; su.uStars.value = pal.stars; su.uCloudK.value = pal.clouds * song.clouds;
    su.uT.value = loopT; su.uBoil.value = boil; su.uFade.value = fade; su.uDrift.value = this.flowT * 0.06 + seed * 6; su.uSeed.value = seed;

    const lu = this.landU;
    lu.uScroll.value = this.flowT; lu.uT.value = loopT * (0.5 + p.turb); lu.uK.value = this.k; lu.uSeed.value = seed;
    lu.uAmp.value = (1 + 0.2 * prog + (p.epSwell || 0) + 0.55 * this.low * pulse) * (1 - 0.35 * p.calm);
    lu.uWob.value = (0.3 + 0.4 * p.turb) * (1 - 0.8 * p.calm);
    lu.uFade.value = fade; lu.uBoil.value = boil; lu.uTiger.value = this.tiger; lu.uHazeK.value = 0.5;
    lu.uSunUV.value.set(Math.sin(this.sunPhi), Math.cos(this.sunPhi));

    const du = this.dabU;
    du.uT.value = loopT * (0.6 + p.flow); du.uSpark.value = p.spark * fade; du.uHigh.value = this.high; du.uBoil.value = boil;
    const fl = (p.epFlock || 0) * fade;
    this.flock.visible = fl > 0.01; this.flockU.uT.value = loopT * (0.7 + 0.5 * p.flow); this.flockU.uFlock.value = fl;
  }
  render(r, cam) { r.render(this.scene, cam); }
}
export default EpWorld;
