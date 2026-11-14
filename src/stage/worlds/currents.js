// Currents: the turntable floats above a river of ribbons, and is the obstacle in it. Seen from above, the
// ribbons follow the streamlines of potential flow round a cylinder the size of the deck: they part round its
// footprint and close up behind it, where the wake turns turbulent and rainbow-coloured. A chrome orb hangs in
// the violet sky and reflects all of it.
//
// Everything that moves is a uniform, so a cue sheet (src/stage/cues/) can bend the whole field at no cost:
//   flow     how fast the current runs (the dashes travel along the lines)
//   turb     turbulence in the wake          vortex  the field wound up into a whirlwind round the deck
//   calm     streamlines relaxed into straight strata      lift  the world dropping away (the deck "takes off")
//   spark    how bright the travelling dashes are          width ribbon width      rainbow  colour in the wake
//   orb      size of the chrome orb          sun   a low sun behind it (the dawn)
//   and the journey off the ground (worlds/space.js): alt, planet, ring, warp, nebula, galaxy, into
// The set pieces of the other choreographed songs (knobs in DEFAULTS, ../index.js; every one is 0 = not there):
//   ekg      a heartbeat running down the red line, one beat of the song per pulse
//   rival    a second obstacle upstream, a red orb in the river whose wake runs into the deck
//   pair     the chrome orb goes and sits at the rival's side        beside  it comes to the deck's side instead
//   fork     the river parts into two streams of two colours, a dark eye round the deck, and they rejoin downstream
//   counter  the near stream runs backwards     voice  -1..1, which of the two streams is lit     orbTwin  the orb divides in two
//   reverse  the whole river turns round (the wake changes sides)
//   rings    the streamlines curl up into rings round the deck, from the middle outwards     ripple  swells running out through them
//   door     a doorway of light on the horizon: 0..0.3 it opens, 0.3..1 it grows until it is the whole sky
//   disc     the sun as a disc (its size)     sunEl  how far above (+) or below (-) its usual place on the horizon, radians
//   sunAz    how far round the horizon from there (pi: the opposite side, where the next day comes up)
//   stars    stars over the river, without leaving the ground
import * as THREE from 'three';
import { Space } from './space.js';
import { Groove } from './groove.js';

export const C = new THREE.Vector3(0.042, 0, -0.03);             // the middle of the deck, world space (z up, metres)
const U = new THREE.Vector3(0.878, -0.479, 0).normalize();        // flow direction: left to right from the default camera
const V = new THREE.Vector3(0, 0, 1).cross(U);                    // across the flow, away from the viewer (ahead)
const Z = new THREE.Vector3(0, 0, 1);
const SUN = V.clone().addScaledVector(U, 0.22).addScaledVector(Z, 0.03).normalize();   // where the sun rises
const SUNH = V.clone().addScaledVector(U, 0.22).normalize(), SUN_EL = Math.asin(SUN.z);
const A = 0.36, L = 3.4;                                          // the obstacle's radius (the deck's footprint), half the field's length
const RIVAL = { u: -1.2, v: 0.36, r: 0.2, z: -0.05 };             // the second obstacle: where it sits in the river (relative to C), how big

const smooth01 = (x) => { x = Math.max(0, Math.min(1, x)); return x * x * (3 - 2 * x); };
// palettes: sky top / horizon / bottom, line colour, accent (the red line), sun, and the second stream's colour
const hex = (h) => new THREE.Color(h);
export const PALETTES = {
  violet: { top: hex('#120a24'), mid: hex('#4a2f78'), bot: hex('#07040e'), line: hex('#efe6f7'), acc: hex('#e0322b'), sun: hex('#000000'), two: hex('#f0b64a') },
  night: { top: hex('#040208'), mid: hex('#160d26'), bot: hex('#020104'), line: hex('#9d86c4'), acc: hex('#e0322b'), sun: hex('#000000'), two: hex('#c9963a') },
  mustard: { top: hex('#2a1a05'), mid: hex('#b9862a'), bot: hex('#120a02'), line: hex('#fff4dc'), acc: hex('#e0322b'), sun: hex('#000000'), two: hex('#a884ee') },
  dawn: { top: hex('#1b1035'), mid: hex('#d9725e'), bot: hex('#0c0716'), line: hex('#ffe6ee'), acc: hex('#ff5a3a'), sun: hex('#ffcf8a'), two: hex('#8fd8ff') },
  white: { top: hex('#cfc6dc'), mid: hex('#f4eef7'), bot: hex('#9b8fb0'), line: hex('#4a2f78'), acc: hex('#e0322b'), sun: hex('#ffffff'), two: hex('#b9862a') },
  // the end of a day: the hour before sunset, the sun on the horizon, and what is left once it has gone
  gold: { top: hex('#1c1238'), mid: hex('#cf8442'), bot: hex('#120a14'), line: hex('#fff0d6'), acc: hex('#e0322b'), sun: hex('#fff0c0'), two: hex('#a884ee') },
  ember: { top: hex('#130a28'), mid: hex('#b03c22'), bot: hex('#0b0510'), line: hex('#ffd9c2'), acc: hex('#ff4a2a'), sun: hex('#ffbf6a'), two: hex('#8fd8ff') },
  midnight: { top: hex('#070a26'), mid: hex('#2a2a66'), bot: hex('#04051a'), line: hex('#c3ccff'), acc: hex('#e0322b'), sun: hex('#e6ecff'), two: hex('#c9963a') },
  dusk: { top: hex('#070515'), mid: hex('#4b2452'), bot: hex('#040209'), line: hex('#c9a6d8'), acc: hex('#e0322b'), sun: hex('#d0522c'), two: hex('#c9963a') },
  // a love song's colours, and a world with the colour taken out
  rose: { top: hex('#200a2a'), mid: hex('#c2477a'), bot: hex('#0e0512'), line: hex('#ffe3ee'), acc: hex('#ff3b30'), sun: hex('#ffb3c8'), two: hex('#ffd27a') },
  lilac: { top: hex('#231743'), mid: hex('#9279c9'), bot: hex('#110a22'), line: hex('#fdf6ff'), acc: hex('#e0322b'), sun: hex('#fff1dc'), two: hex('#f0b64a') },
  mono: { top: hex('#070707'), mid: hex('#3d3d40'), bot: hex('#020202'), line: hex('#f2f2f2'), acc: hex('#f2f2f2'), sun: hex('#000000'), two: hex('#5a5a5e') },
};
const PAL_KEYS = Object.keys(PALETTES.violet);

// potential flow past a cylinder of radius A at the origin (in plan: u along the stream, v across it)
function vel(p, out) {
  const r2 = p.x * p.x + p.y * p.y, r4 = r2 * r2 || 1, a2 = A * A;
  return out.set(1 - a2 * (p.x * p.x - p.y * p.y) / r4, -2 * a2 * p.x * p.y / r4, 0);
}

const LINE_VS = `
uniform float uT, uFlowT, uTurb, uVortex, uCalm, uLift, uWidth, uPulse, uLoopT;
uniform float uDir, uFork, uRings, uRipple, uEkg, uBeatT;
uniform vec4 uRival;
uniform vec3 uC, uU, uV;
attribute float aSide, aS, aId;
attribute vec3 aN;
attribute vec2 aSeed;
varying float vS, vId, vWake, vU, vFog, vB, vW2, vRing;
varying vec3 vP;
void main() {
  vec3 p = position;
  vec3 d = p - uC; float u = dot(d, uU);
  // the wake: behind the obstacle, near the middle, the lines start to wander (uDir: which way the river runs)
  float lat = abs(dot(d, uV));
  float wake = smoothstep(0.1, 1.2, u * uDir) * exp(-pow(lat / 0.9, 2.0)) * abs(uDir);
  float tt = uLoopT;
  vec3 tw = vec3(sin(u * 7.0 - tt * 1.7 + aId * 6.0) + 0.5 * sin(u * 17.0 + tt * 2.3), 0.0, cos(u * 5.0 - tt * 1.3 + aId * 4.0));
  p += (uU * tw.z * 0.4 + uV * tw.x) * wake * uTurb * 0.2;
  // calm: relaxed back toward the straight line the streamline started on
  vec3 straight = uC + uU * u + uV * aSeed.x + vec3(0.0, 0.0, aSeed.y);
  p = mix(p, straight, uCalm);
  vec3 n = aN;
  float sgn = aSeed.x < 0.0 ? -1.0 : 1.0, w2 = 0.0, ring = 1.0;
  // a second obstacle upstream: a sphere sitting in the river, so each sheet parts round its section at that depth
  // (the same potential flow, solved here for where the streamline has to be: Newton from outside the circle)
  if (uRival.w > 0.001) {
    float dz = (aSeed.y + 0.05) / max(uRival.z, 0.001);
    float a = uRival.z * sqrt(max(0.0, 1.0 - dz * dz)), a2 = a * a;
    float x = dot(p - uC, uU) - uRival.x, y = dot(p - uC, uV) - uRival.y, x2 = x * x;
    float sg = y < 0.0 ? -1.0 : 1.0, ya = abs(y), yy = ya + a;
    for (int i = 0; i < 5; i++) { float f = yy * yy * yy - ya * yy * yy + (x2 - a2) * yy - ya * x2; yy -= f / max(3.0 * yy * yy - 2.0 * ya * yy + x2 - a2, 1e-4); }
    p += uV * sg * (yy - ya);
    w2 = smoothstep(0.3 * uRival.z, 2.5 * uRival.z, x) * exp(-pow(yy / (1.5 * uRival.z + 0.1 * max(x, 0.0)), 2.0)) * exp(-max(x, 0.0) * 0.22) * uRival.w * step(-0.3, aSeed.y);
    p += (uU * tw.z * 0.4 + uV * tw.x) * w2 * (0.05 + 0.1 * uTurb);
  }
  // the fork: the two halves of the river pushed apart round the deck, closing again up and downstream
  if (uFork > 0.001) p += uV * sgn * uFork * 0.6 * exp(-pow(u / 2.3, 2.0)) / (1.0 + 0.5 * abs(aSeed.x));
  // rings: each streamline curls into half a circle round the deck (the two sides close the circle), inner ones first
  if (uRings > 0.001) {
    float R = 0.42 + abs(aSeed.x) * 0.8;
    R += uRipple * (0.035 * sin(R * 9.0 - tt * 2.4) + 0.05 * uPulse);
    float th = 3.14159265 * (0.5 - 0.5 * clamp(u / ${L.toFixed(1)}, -1.0, 1.0));
    vec2 e = vec2(cos(th), sgn * sin(th));
    vec3 rp = uC + (uU * e.x + uV * e.y) * R + vec3(0.0, 0.0, aSeed.y + uRipple * 0.035 * sin(R * 6.0 - tt * 2.4));
    float k = smoothstep(0.0, 1.0, uRings * 2.5 - 1.5 * abs(aSeed.x) / 3.0);
    p = mix(p, rp, k);
    n = normalize(mix(n, (uU * e.x + uV * e.y) * sgn, k));
    ring = mix(1.0, smoothstep(2.95, 2.2, R), k);
  }
  // the heartbeat: a pulse a beat, travelling down the red line (and, smaller, its neighbours)
  if (uEkg > 0.001) {
    float env = exp(-pow((aSeed.x - 0.62) / 0.2, 2.0)) * step(-0.1, aSeed.y) * smoothstep(3.1, 2.2, abs(u));
    float f = fract(u / 1.5 - uBeatT) - 0.5;
    float w = exp(-f * f / 0.0011) - 0.22 * exp(-pow(f + 0.055, 2.0) / 0.0006) - 0.3 * exp(-pow(f - 0.06, 2.0) / 0.0008) + 0.13 * exp(-pow(f + 0.2, 2.0) / 0.003) + 0.2 * exp(-pow(f - 0.25, 2.0) / 0.007);
    p.z += uEkg * env * w * 0.21;
    n = normalize(n + vec3(0.0, 0.0, 1.3 * env * min(1.0, uEkg * 2.0)));     // stood up on edge, so the trace shows from low down
  }
  // the whirlwind: wound round the deck's axis, tighter near it
  vec2 q = p.xy - uC.xy; float rq = length(q);
  float ang = uVortex * (tt * 0.9 + 1.4 / (rq + 0.3));
  float ca = cos(ang), sa = sin(ang);
  q = vec2(q.x * ca - q.y * sa, q.x * sa + q.y * ca) * mix(1.0, 0.55 + 0.25 * rq, uVortex * 0.6);
  p.xy = uC.xy + q; p.z += uVortex * 0.06 * sin(rq * 3.0 - tt * 1.2 + aId * 3.0);
  p.z -= uLift;
  n.xy = vec2(n.x * ca - n.y * sa, n.x * sa + n.y * ca);
  p += n * aSide * uWidth * (1.0 + uPulse * 0.8) * (aId > 0.995 ? 1.7 : 1.0);
  vS = aS; vId = aId; vWake = wake; vU = u; vP = p; vB = sgn < 0.0 ? 1.0 : 0.0; vW2 = w2; vRing = ring;
  vec4 mv = modelViewMatrix * vec4(p, 1.0);
  vFog = -mv.z;
  gl_Position = projectionMatrix * mv;
}`;
const LINE_FS = `
uniform float uFlowT, uFlowT2, uSpark, uRainbow, uFade, uT, uTwoK, uGainA, uGainB, uRingsK, uGlintK;
uniform vec3 uLine, uAcc, uSky, uTwo, uGlintCol;
uniform vec2 uGlintDir;
varying float vS, vId, vWake, vU, vFog, vB, vW2, vRing;
varying vec3 vP;
vec3 hue(float h) { return clamp(abs(mod(h * 6.0 + vec3(0.0, 4.0, 2.0), 6.0) - 3.0) - 1.0, 0.0, 1.0); }
void main() {
  float ends = mix(smoothstep(${L.toFixed(1)}, ${(L - 0.9).toFixed(1)}, abs(vU)), vRing, uRingsK);
  float dash = pow(fract(vS * 1.1 - mix(uFlowT, uFlowT2, vB) * (0.55 + 0.6 * fract(vId * 13.7)) + vId * 7.0), 7.0);
  vec3 line = mix(uLine, uTwo, vB * uTwoK);                     // the second stream has its own colour
  vec3 c = line * (0.22 + 0.4 * fract(vId * 3.1 + 0.3));
  c = mix(c, hue(vU * 0.35 + uT * 0.05 + vId) * 1.3, vWake * uRainbow);
  c = mix(c, uAcc * (0.45 + 1.2 * fract(vId * 5.3)), min(1.0, vW2 * 1.5));   // the rival's wake runs red
  if (vId > 0.995) c = uAcc * 1.4;
  c += line * dash * uSpark * 0.9;
  c *= mix(uGainA, uGainB, vB);
  // a light low on the horizon (the sun, the door) lays a path of glitter across the river toward the eye
  if (uGlintK > 0.001) {
    float g = pow(max(0.0, dot(normalize(vP.xy - cameraPosition.xy), uGlintDir)), 70.0);
    c += uGlintCol * uGlintK * g * (0.25 + 1.1 * pow(0.5 + 0.5 * sin(vS * 23.0 + vId * 60.0 + uT * 2.0), 3.0) + dash);
  }
  float fog = exp(-max(0.0, vFog - 1.2) * 0.22);
  vec3 col = mix(uSky, c, fog);
  gl_FragColor = vec4(col, ends * uFade * (0.55 + 0.45 * fog));
}`;
const SKY_VS = `varying vec3 vD; void main() { vD = normalize(position); gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); gl_Position.z = gl_Position.w * 0.99999; }`;
const SKY_FS = `
uniform vec3 uTop, uMid, uBot, uSun, uSunDir, uNebA, uNebB, uDiscCol, uDoorCol; uniform float uT, uStripes, uSunK, uFlash, uSpace, uNebula, uWarp;
uniform float uDisc, uStarsK, uMirror, uDoor; uniform vec2 uDoorDir, uBand;
varying vec3 vD;
float h21(vec2 p) { p = fract(p * vec2(123.34, 456.21)); p += dot(p, p + 45.32); return fract(p.x * p.y); }
float vn(vec2 p) { vec2 i = floor(p), f = fract(p); f = f * f * (3.0 - 2.0 * f); return mix(mix(h21(i), h21(i + vec2(1, 0)), f.x), mix(h21(i + vec2(0, 1)), h21(i + vec2(1, 1)), f.x), f.y); }
float fbm(vec2 p) { float s = 0.0, a = 0.5; for (int i = 0; i < 5; i++) { s += a * vn(p); p = p * 2.07 + 11.3; a *= 0.5; } return s; }
// stars: one candidate per cell of a lat/long grid, most cells empty; dashes, like the flow, when warping
float stars(vec3 d, float scale) {
  float az = atan(d.y, d.x), el = asin(clamp(d.z, -1.0, 1.0));
  vec2 g = vec2(az * scale / 6.2832 * cos(el) * 2.0, el * scale / 3.1416);
  vec2 c = floor(g), f = fract(g); float h = h21(c);
  if (h < 0.93) return 0.0;
  vec2 q = vec2(h21(c + 3.1), h21(c + 7.7)) * 0.7 + 0.15;
  vec2 dd = (f - q) * vec2(1.0, 1.0 + uWarp * 6.0);
  float tw = 0.65 + 0.35 * sin(uT * (1.0 + h * 3.0) + h * 40.0);
  return smoothstep(0.09, 0.0, length(dd)) * (h - 0.93) / 0.07 * tw;
}
// the angle round the horizon from a heading to this pixel
float turn(vec2 a) { vec2 h = normalize(vD.xy + 1e-6); return atan(h.x * a.y - h.y * a.x, dot(h, a)); }
void main() {
  float z = vD.z;
  vec3 c = z > 0.0 ? mix(uMid, uTop, pow(z, mix(0.6, 0.36, min(1.0, uDisc)))) : mix(uMid, uBot, pow(-z, 0.5));     // (with the disc out, the dark comes down nearer the horizon)
  float az = atan(vD.y, vD.x);
  float st = sin((z * 26.0 + 0.5 * sin(az * 2.0 + uT * 0.07)) * 3.14159);
  c *= 1.0 + uStripes * 0.12 * smoothstep(0.6, 1.0, st) * (1.0 - uSpace);
  // leaving the atmosphere: the sky goes black, stars come out, and the nebula is the palette's colour in the dark
  c = mix(c, vec3(0.006, 0.004, 0.012), uSpace);
  float n = fbm(vec2(az * 2.0, z * 3.0) + uT * 0.004), n2 = fbm(vec2(az * 5.0 + 4.0, z * 7.0) - uT * 0.006);
  c += (uNebA * smoothstep(0.45, 0.85, n) * 0.9 + uNebB * smoothstep(0.55, 0.9, n2) * 0.6) * uNebula * uSpace;
  // (uStarsK: stars over the river too, and uMirror: lying on it when it is still)
  c += vec3(0.95, 0.92, 1.0) * (stars(vD, 260.0) + 0.6 * stars(vD.yzx, 520.0)) * max(uSpace, uStarsK * smoothstep(0.004, 0.07, z));
  if (uStarsK > 0.001 && z > 0.0) {                              // a night on the ground: a few big stars, and the band of the galaxy standing up from the horizon
    float sk = uStarsK * smoothstep(0.004, 0.07, z);
    c += vec3(0.9, 0.93, 1.0) * (stars(vD.zxy, 70.0) * 1.8 + stars(vD, 260.0) * 1.2 + stars(vD.yzx, 520.0) * 0.6) * sk;
    float bx = dot(vD.xy, uBand), by = dot(vD.xy, vec2(-uBand.y, uBand.x));
    float band = exp(-pow((by - 0.25 * z) / 0.2, 2.0)) * step(0.0, bx);
    float bn = fbm(vec2(by * 9.0 + 3.0, z * 7.0));
    c += (uNebA * 0.5 + vec3(0.25, 0.27, 0.4)) * band * smoothstep(0.3, 0.75, bn) * sk * 0.55 + vec3(0.9, 0.93, 1.0) * stars(vD.yxz, 400.0) * band * sk * 1.2;
  }
  if (uMirror > 0.001 && z < 0.0) { vec3 m = vec3(vD.xy, -z); c += vec3(0.95, 0.92, 1.0) * (stars(m, 260.0) + 0.6 * stars(m.yzx, 520.0)) * uMirror * smoothstep(0.004, 0.07, -z) * 0.45; }
  float s = max(0.0, dot(vD, uSunDir));
  c += uSun * uSunK * (pow(s, 40.0) * 2.5 + pow(s, 6.0) * 0.35);
  // the sun as a disc: it goes down behind the horizon, the river's strata cutting across its lower half, its light on the water
  if (uDisc > 0.001) {
    float rad = 0.085 * uDisc, el = asin(clamp(z, -1.0, 1.0)), sel = asin(clamp(uSunDir.z, -1.0, 1.0));
    float da = turn(normalize(uSunDir.xy)), ang = length(vec2(da * cos(el), el - sel));
    float up = smoothstep(-rad, rad * 0.4, sel);                  // how much of it is still above the horizon
    float y = (el - sel) / rad;
    float slit = smoothstep(0.0, 0.25, 0.5 - y) * smoothstep(0.42 - 0.3 * clamp(0.2 - y, 0.0, 1.0), 0.5, abs(fract(y * 5.0 - uT * 0.04) - 0.5));
    float disc = smoothstep(rad, rad * 0.955, ang) * smoothstep(-0.0015, 0.0015, z);
    // long thin clouds lying along the horizon, lit from underneath while there is light, dark shapes after
    vec2 hd = normalize(vD.xy + 1e-6);
    float cn = fbm(vec2(hd.y * 3.0, z * 30.0 + uT * 0.002)) * hd.x * hd.x + fbm(vec2(hd.x * 3.0 + 9.0, z * 30.0 + uT * 0.002)) * hd.y * hd.y;
    float cl = smoothstep(0.5, 0.74, cn) * smoothstep(0.0, 0.04, z) * smoothstep(0.5, 0.1, z) * min(1.0, uDisc);
    float lightK = smoothstep(-0.3, 0.02, sel), nearSun = exp(-da * da * 0.9);
    c = mix(c, mix(uTop * 0.5, uDiscCol * (0.25 + 0.95 * nearSun), lightK * (0.35 + 0.65 * nearSun)), cl * 0.75);
    c += uDiscCol * exp(-ang / (rad * 1.5)) * 0.32 * (0.2 + 0.8 * up) * (1.0 - disc);
    c = mix(c, uDiscCol * (1.7 - 0.45 * ang / rad), disc * (1.0 - 0.85 * slit) * (1.0 - 0.5 * cl));
    if (z < 0.0) {                                               // on the water: a column of broken light, wider toward the eye
      float wcol = exp(-pow(da / (rad * (0.75 + 9.0 * -z)), 2.0));
      float brk = smoothstep(0.3, 0.7, vn(vec2(da * 30.0, -z * 260.0 + uT * 0.5)));
      c += uDiscCol * wcol * (0.3 + 1.2 * brk) * up * exp(z * 2.5) * 0.8;
    }
  }
  // the door: a doorway of light standing on the horizon. It opens from a slit, then grows until it is everything
  if (uDoor > 0.001) {
    float open = smoothstep(0.0, 0.3, uDoor), grow = smoothstep(0.3, 1.0, uDoor), g2 = grow * grow;
    float el = asin(clamp(z, -1.0, 1.0)), da = turn(uDoorDir) * cos(el);
    float g8 = g2 * g2 * g2 * g2, w = mix(0.0012, 0.034, open) * (1.0 + 14.0 * g2 + 90.0 * g8), hgt = 0.135 * (1.0 + 2.5 * g2 + 30.0 * g8);
    float dd = max(abs(da) - w, max(el - hgt, -el));              // distance outside the doorway
    float inside = smoothstep(0.003, -0.003, dd);
    vec3 lit = uDoorCol * (1.25 - 0.1 * smoothstep(0.7, 1.0, sin(el * 150.0)));   // the other side has its own strata
    c += uDoorCol * exp(-max(dd, 0.0) / (0.02 + 0.03 * open + 0.25 * g2)) * 0.42 * (0.35 + 0.65 * open) * (1.0 - inside);
    c = mix(c, lit, inside);
    if (z < 0.0) {                                               // its light lying on the water
      float wcol = exp(-pow(da / (w * 0.9 + 0.5 * -el * (0.4 + open)), 2.0));
      float brk = smoothstep(0.3, 0.7, vn(vec2(da * 40.0, -el * 240.0 + uT * 0.5)));
      c += uDoorCol * wcol * (0.25 + 0.9 * brk) * open * exp(el * 3.0) * 0.7;
    }
    c = mix(c, uDoorCol * (1.12 - 0.3 * pow(abs(z), 0.7)), g2 * g2);                 // through it: the sky of the other side
  }
  c = mix(c, vec3(1.0), uFlash);
  gl_FragColor = vec4(c, 1.0);
}`;

// the words over each palette: ink, accent
const INK = {
  violet: ['#f4eef7', '#e0322b'], night: ['#b79ad6', '#e0322b'], mustard: ['#fff4dc', '#e0322b'], dawn: ['#fff0f3', '#ff5a3a'], white: ['#2a1a45', '#e0322b'],
  gold: ['#fff4dc', '#e0322b'], ember: ['#ffe9dc', '#ffd27a'], dusk: ['#e2c9ee', '#ff6a4a'], midnight: ['#dfe5ff', '#ff6a4a'], rose: ['#fff0f5', '#ffd27a'], lilac: ['#ffffff', '#e0322b'], mono: ['#f2f2f2', '#9a9a9a'],
};

export class CurrentsWorld {
  ink(p) { return (p.door || 0) > 0.62 ? INK.white : INK[p.palette] || INK.violet; }
  constructor(r) {
    this.r = r;
    this.scene = new THREE.Scene();
    this.root = new THREE.Group(); this.scene.add(this.root);
    this.pal = Object.fromEntries(Object.entries(PALETTES.violet).map(([k, c]) => [k, c.clone()]));
    this.flowT = 0; this.flowB = 0; this.beatT = 0;
    this.eye = new THREE.Vector3(); this.seen = false; this.sunDir = SUN.clone(); this.sunH = SUNH.clone();
    this.v1 = new THREE.Vector3(); this.v2 = new THREE.Vector3(); this.v3 = new THREE.Vector3(); this.c1 = new THREE.Color();
    this.buildSky(); this.buildLines(); this.buildOrb();
    this.space = new Space(this.root, C, U, V);
    this.groove = null;                                              // made the first time a cue dives into the cut
  }
  buildSky() {
    this.skyU = {
      uTop: { value: this.pal.top }, uMid: { value: this.pal.mid }, uBot: { value: this.pal.bot }, uSun: { value: this.pal.sun },
      uSunDir: { value: this.sunDir }, uT: { value: 0 }, uStripes: { value: 1 }, uSunK: { value: 0 }, uFlash: { value: 0 },
      uSpace: { value: 0 }, uNebula: { value: 0 }, uWarp: { value: 0 }, uNebA: { value: new THREE.Color() }, uNebB: { value: new THREE.Color() },
      uDisc: { value: 0 }, uDiscCol: { value: new THREE.Color() }, uStarsK: { value: 0 }, uMirror: { value: 0 },
      uDoor: { value: 0 }, uDoorDir: { value: new THREE.Vector2(V.x, V.y).normalize() }, uDoorCol: { value: new THREE.Color('#fff6ea') }, uBand: { value: new THREE.Vector2(-U.x * 0.94 + V.x * 0.34, -U.y * 0.94 + V.y * 0.34).normalize() },
    };
    const sky = new THREE.Mesh(new THREE.SphereGeometry(60, 48, 24), new THREE.ShaderMaterial({ vertexShader: SKY_VS, fragmentShader: SKY_FS, uniforms: this.skyU, side: THREE.BackSide, depthWrite: false }));
    sky.position.copy(C); sky.frustumCulled = false; sky.renderOrder = -1;
    this.sky = sky; this.root.add(sky);
  }
  buildLines() {
    const pos = [], nrm = [], side = [], arc = [], ids = [], seeds = [], idx = [];
    const p = new THREE.Vector3(), v1 = new THREE.Vector3(), v2 = new THREE.Vector3(), q = new THREE.Vector3(), t = new THREE.Vector3(), n = new THREE.Vector3();
    // sheets of ribbons below the deck (its feet are at z = -0.08), the deeper ones dimmer through the fog
    const layers = [-0.10, -0.17, -0.26, -0.38, -0.55].map((z) => z - C.z), H = 0.03;
    let line = 0, vert = 0;
    const red = { v: 0.62, w: layers[0] };
    for (const w0 of layers) {
      for (let v0 = -3.0; v0 <= 3.0 + 1e-9; v0 += 0.048) {
        const vv = v0 + (Math.abs(w0) * 0.37 % 0.024);        // stagger the sheets so their lines don't stack exactly
        if (Math.abs(vv) < 0.012) continue;                   // the line straight into the stagnation point
        const id = Math.abs(vv - red.v) < 0.024 && w0 === red.w ? 0.999 : (Math.sin(line * 12.9898) * 43758.5453) % 1 * 0.5 + 0.5 - 0.006;
        p.set(-L, vv, w0); let s = 0, n0 = vert;
        for (let k = 0; k < 260 && p.x < L; k++) {
          vel(p, v1); q.copy(p).addScaledVector(v1.normalize(), H * 0.5); vel(q, v2); t.copy(v2).normalize();
          const wp = C.clone().addScaledVector(U, p.x).addScaledVector(V, p.y).addScaledVector(Z, p.z);
          const wt = U.clone().multiplyScalar(t.x).addScaledVector(V, t.y);
          n.set(-wt.y, wt.x, 0).normalize();
          for (const sd of [-1, 1]) { pos.push(wp.x, wp.y, wp.z); nrm.push(n.x, n.y, n.z); side.push(sd); arc.push(s); ids.push(id); seeds.push(vv, w0); }
          if (vert > n0) { const a = vert - 2; idx.push(a, a + 1, vert, a + 1, vert + 1, vert); }
          vert += 2; p.addScaledVector(t, H); s += H;
        }
        line++;
      }
    }
    const g = new THREE.BufferGeometry();
    g.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3)); g.setAttribute('aN', new THREE.Float32BufferAttribute(nrm, 3));
    g.setAttribute('aSide', new THREE.Float32BufferAttribute(side, 1)); g.setAttribute('aS', new THREE.Float32BufferAttribute(arc, 1));
    g.setAttribute('aId', new THREE.Float32BufferAttribute(ids, 1)); g.setAttribute('aSeed', new THREE.Float32BufferAttribute(seeds, 2));
    g.setIndex(idx);
    this.lineU = {
      uT: { value: 0 }, uFlowT: { value: 0 }, uLoopT: { value: 0 }, uTurb: { value: 0.3 }, uVortex: { value: 0 }, uCalm: { value: 0 }, uLift: { value: 0 }, uWidth: { value: 0.006 }, uPulse: { value: 0 },
      uSpark: { value: 0.6 }, uRainbow: { value: 0.6 }, uFade: { value: 1 }, uC: { value: C }, uU: { value: U }, uV: { value: V },
      uLine: { value: this.pal.line }, uAcc: { value: this.pal.acc }, uSky: { value: this.pal.mid },
      uDir: { value: 1 }, uFork: { value: 0 }, uRings: { value: 0 }, uRipple: { value: 0 }, uEkg: { value: 0 }, uBeatT: { value: 0 }, uRival: { value: new THREE.Vector4(RIVAL.u, RIVAL.v, RIVAL.r, 0) },
      uFlowT2: { value: 0 }, uTwo: { value: this.pal.two }, uTwoK: { value: 0 }, uGainA: { value: 1 }, uGainB: { value: 1 }, uRingsK: { value: 0 },
      uGlintK: { value: 0 }, uGlintCol: { value: new THREE.Color() }, uGlintDir: { value: new THREE.Vector2(SUNH.x, SUNH.y) },
    };
    const mat = new THREE.ShaderMaterial({ vertexShader: LINE_VS, fragmentShader: LINE_FS, uniforms: this.lineU, transparent: true, depthWrite: false, side: THREE.DoubleSide, blending: THREE.NormalBlending });
    this.lines = new THREE.Mesh(g, mat); this.lines.frustumCulled = false;
    this.root.add(this.lines);
    this.lineCount = line;
  }
  buildOrb() {
    this.cube = new THREE.WebGLCubeRenderTarget(128, { type: THREE.HalfFloatType, generateMipmaps: true, minFilter: THREE.LinearMipmapLinearFilter });
    this.cubeCam = new THREE.CubeCamera(0.05, 100, this.cube);
    this.orbHome = C.clone().addScaledVector(V, 3.2).addScaledVector(U, 0.9).addScaledVector(Z, 0.9);
    const ball = new THREE.SphereGeometry(1, 96, 48);
    this.orb = new THREE.Mesh(ball, new THREE.MeshStandardMaterial({ color: 0xffffff, metalness: 1, roughness: 0.04, envMap: this.cube.texture, envMapIntensity: 1.25 }));
    this.orb.position.copy(this.orbHome); this.orb.scale.setScalar(0.001);
    this.root.add(this.orb); this.root.add(this.cubeCam);
    // a second orb: the rival, red, sitting in the river upstream; or the first one's twin
    this.orb2Mat = new THREE.MeshStandardMaterial({ color: 0xffffff, metalness: 1, roughness: 0.07, envMap: this.cube.texture, envMapIntensity: 1.3 });
    this.orb2Flat = new THREE.MeshBasicMaterial({ color: 0xe0322b });      // what the chrome sees of it
    this.orb2 = new THREE.Mesh(ball, this.orb2Mat); this.orb2.visible = false; this.root.add(this.orb2);
    this.rivalPos = C.clone().addScaledVector(U, RIVAL.u).addScaledVector(V, RIVAL.v).addScaledVector(Z, RIVAL.z);
    this.sidePos = C.clone().addScaledVector(U, 0.47).addScaledVector(V, 0.04).addScaledVector(Z, 0.11);
    this.twinPos = C.clone().addScaledVector(V, 2.5).addScaledVector(U, 0.25).addScaledVector(Z, 0.42);
    // the deck, as the chrome sees it when it comes close: a dark slab and a record (only the cube camera draws these)
    const proxy = this.proxy = new THREE.Group();
    const slab = new THREE.Mesh(new THREE.BoxGeometry(0.455, 0.38, 0.045), new THREE.MeshBasicMaterial({ color: 0x0c0c10 }));
    slab.position.set(0.0425, 0, -0.045);
    const disc = new THREE.Mesh(new THREE.CircleGeometry(0.15, 48), new THREE.MeshBasicMaterial({ color: 0x030304 })); disc.position.set(0, 0, -0.02);
    const label = new THREE.Mesh(new THREE.CircleGeometry(0.05, 32), new THREE.MeshBasicMaterial({ color: 0xb79ad6 })); label.position.set(0, 0, -0.019);
    proxy.add(slab, disc, label); proxy.visible = false; this.root.add(proxy);
    for (const m of proxy.children) m.layers.set(1);
    for (const c of this.cubeCam.children) c.layers.enable(1);
    this.frame = 0;
  }

  // p: the act's parameters (already blended), s: what the music is doing, dt: seconds of real time, loopT: the world's clock
  update(dt, p, s, loopT) {
    const u = this.lineU, kick = s.kick || 0, pal = this.pal;
    // colours ease toward the act's palette
    const target = PALETTES[p.palette] || PALETTES.violet, k = 1 - Math.exp(-dt * (p.palFast ? 12 : 1.4));
    for (let i = 0; i < PAL_KEYS.length; i++) pal[PAL_KEYS[i]].lerp(target[PAL_KEYS[i]], k);
    // the river runs, forwards or (reverse) back; the near stream can run against it (counter)
    const dir = 1 - 2 * (p.reverse || 0), adv = dt * p.flow * (1 + 0.6 * (s.energy || 0)) * (s.rate ?? 1) * dir;
    this.flowT += adv; this.flowB += adv * 2 * (p.counter || 0);
    this.beatT += dt * (s.rate ?? 1) / Math.max(0.2, s.beatLen || 0.5);
    this.diving = p.dive > 0.5 && !!s.tap;
    if (this.diving) (this.groove ||= new Groove()).update(dt, p, s, s.tap, s.th, pal, s.songT ?? loopT);
    const sp = this.space.update(dt, p, s, loopT, pal, SUN);
    const alt = p.alt || 0, gone = 1 - smooth01((alt - 0.18) / 0.3);          // the river falls away as the deck climbs
    const flowT = p.loopFlow != null ? p.loopFlow : this.flowT;
    u.uT.value = loopT; u.uLoopT.value = loopT; u.uFlowT.value = flowT; u.uFlowT2.value = flowT - this.flowB;
    u.uTurb.value = p.turb * (0.6 + 0.8 * (s.high || 0)); u.uVortex.value = p.vortex; u.uCalm.value = p.calm; u.uLift.value = p.lift + alt * 6;
    u.uWidth.value = 0.006 * p.width; u.uPulse.value = kick * p.pulse; u.uSpark.value = p.spark * (0.5 + (s.onset || 0)); u.uRainbow.value = p.rainbow; u.uFade.value = p.fade * gone;
    u.uSky.value = pal.mid;
    // the set pieces in the river
    const rival = smooth01(p.rival || 0), fork = p.fork || 0, voice = p.voice || 0, rings = p.rings || 0;
    u.uDir.value = dir; u.uFork.value = fork; u.uTwoK.value = Math.min(1, fork * 2.5);
    u.uGainA.value = 1 + 0.8 * Math.max(0, voice) - 0.65 * Math.max(0, -voice); u.uGainB.value = 1 + 0.8 * Math.max(0, -voice) - 0.65 * Math.max(0, voice);
    u.uRings.value = rings; u.uRingsK.value = Math.min(1, rings * 1.5); u.uRipple.value = p.ripple || 0;
    u.uEkg.value = (p.ekg || 0) * (0.75 + 0.6 * kick); u.uBeatT.value = s.beatPhase != null ? Math.max(0, s.beat) + s.beatPhase : this.beatT;
    u.uRival.value.z = RIVAL.r * rival; u.uRival.value.w = rival;
    // the sky: the sun where the act puts it, the disc, the stars, the door
    const su = this.skyU, disc = p.disc || 0, door = p.door || 0;
    if (p.sunEl || p.sunAz) {
      const el = SUN_EL + (p.sunEl || 0), az = p.sunAz || 0, ca = Math.cos(az), sa = Math.sin(az);
      this.sunH.set(SUNH.x * ca - SUNH.y * sa, SUNH.x * sa + SUNH.y * ca, 0);
      this.sunDir.copy(this.sunH).multiplyScalar(Math.cos(el)).addScaledVector(Z, Math.sin(el));
    } else { this.sunH.copy(SUNH); this.sunDir.copy(SUN); }
    const hasSun = pal.sun.r + pal.sun.g + pal.sun.b > 0.3, low = smooth01(1 - (this.sunDir.z - 0.02) / 0.25);   // redder as it sinks
    su.uT.value = loopT; su.uSunK.value = p.sun * (1 - sp.space * 0.25); su.uStripes.value = p.stripes ?? 1; su.uFlash.value = 0;
    su.uSpace.value = sp.space; su.uNebula.value = p.nebula || 0; su.uWarp.value = p.warp || 0;
    su.uNebA.value.copy(pal.mid).multiplyScalar(1.3); su.uNebB.value.copy(pal.acc).lerp(pal.line, 0.4);
    su.uDisc.value = disc; su.uStarsK.value = p.stars || 0; su.uMirror.value = (p.stars || 0) * p.calm; su.uDoor.value = door;
    if (disc > 0) su.uDiscCol.value.copy(hasSun ? pal.sun : pal.line).lerp(pal.acc, low * 0.2);
    // their light on the ribbons
    const up = smooth01((this.sunDir.z + 0.085 * disc) / (0.12 * disc + 1e-4)), gs = Math.min(1, disc) * up * 0.9, gd = smooth01(door / 0.3) * (1 - smooth01((door - 0.3) / 0.5)) * 0.8;
    u.uGlintK.value = Math.max(gs, gd);
    if (gs > gd) { u.uGlintCol.value.copy(su.uDiscCol.value); u.uGlintDir.value.set(this.sunH.x, this.sunH.y); }
    else if (gd > 0) { u.uGlintCol.value.copy(su.uDoorCol.value); u.uGlintDir.value.copy(su.uDoorDir.value); }

    const orbR = Math.max(0.001, p.orb * (1 + 0.06 * (s.low || 0) + 0.05 * kick));
    this.orb.scale.setScalar(orbR);
    this.orb.position.copy(this.orbHome).addScaledVector(Z, Math.sin(loopT * 0.21) * 0.06 - p.lift * 0.35);
    // the orb's other places: divided in two, down at the rival's side, or come to the deck's side
    const twin = smooth01(p.orbTwin || 0), pair = smooth01(p.pair || 0), beside = smooth01(p.beside || 0), o2 = this.orb2;
    o2.visible = rival > 0.01 || twin > 0.01;
    if (twin > 0) {
      this.orb.position.lerp(this.twinPos, twin);                   // lower, where a low camera has them both
      const off = twin * orbR * 1.25, r2 = orbR * (1 - 0.22 * twin);
      o2.position.copy(this.orb.position).addScaledVector(U, off).addScaledVector(Z, Math.sin(loopT * 0.33 + 2) * 0.05 * twin);
      this.orb.position.addScaledVector(U, -off); this.orb.scale.setScalar(r2); o2.scale.setScalar(r2);
      this.orb2Mat.color.copy(pal.two).lerp(this.c1.set(0xffffff), 0.25); this.orb2Mat.emissive.copy(pal.two).multiplyScalar(0.05); this.orb2Flat.color.copy(pal.two);
    }
    if (rival > 0.01) {                                              // the rival comes up out of the river
      o2.position.copy(this.rivalPos).addScaledVector(Z, -(1 - rival) * 0.3 + Math.sin(loopT * 0.9) * 0.008); o2.scale.setScalar(RIVAL.r * rival);
      this.orb2Mat.color.copy(pal.acc).lerp(this.c1.set(0xffffff), 0.12); this.orb2Mat.emissive.copy(pal.acc).multiplyScalar(0.22 + 0.25 * kick * p.pulse); this.orb2Flat.color.copy(pal.acc);
    }
    if (pair > 0) this.orb.position.lerp(this.v1.copy(this.rivalPos).addScaledVector(V, (RIVAL.r + orbR) * 0.96).addScaledVector(U, 0.06).addScaledVector(Z, orbR - RIVAL.r + 0.02 + Math.sin(loopT * 0.9 + 1) * 0.008), pair);
    if (beside > 0) this.orb.position.lerp(this.v1.copy(this.sidePos).addScaledVector(Z, orbR - 0.2 + Math.sin(loopT * 0.6) * 0.012), beside);
    this.proxy.visible = beside > 0.02;
    // in space the orb is the sun, far off where it rises; `into` flies the deck right up to it
    const into = p.into || 0;
    if (sp.space > 0 || into > 0) {
      // flying into it: it comes to meet the camera head on, just beyond the deck
      const fwd = this.seen ? this.v1.copy(C).sub(this.eye).setZ(0).normalize() : SUN;
      const far = this.v2.copy(C).addScaledVector(SUN, 14), near = this.v3.copy(C).addScaledVector(fwd, 1.3).addScaledVector(Z, 0.12);
      this.orb.position.lerp(far, sp.space).lerp(near, smooth01(into));
      this.orb.scale.setScalar(orbR * (1 + sp.space * 0.15) * (1 - 0.5 * smooth01(into)));
    }
    // chrome reflects nothing in the dark, so out there the orb burns
    this.orb.material.emissive.copy(hasSun ? pal.sun : pal.line).multiplyScalar(sp.space * 0.3 * p.sun + into * 0.45);
    this.orb.visible = orbR > 0.01;
    this.lines.visible = p.fade * gone > 0.003;
  }
  render(r, cam) {
    if (this.diving && this.groove?.on) return this.groove.render(r, r.domElement.width, r.domElement.height);
    this.eye.setFromMatrixPosition(cam.matrixWorld); this.seen = true;
    this.space.aim(this.eye, C);
    if (this.orb.visible && this.frame++ % 3 === 0) {               // what the chrome sees, refreshed every third frame
      this.orb.visible = false; this.cubeCam.position.copy(this.orb.position);
      this.orb2.material = this.orb2Flat;                           // (the second orb wears the same reflection, so not while it is being made)
      const ac = r.autoClear; r.autoClear = true;                  // each face starts clean
      this.cubeCam.update(r, this.scene); this.orb.visible = true; r.autoClear = ac;
      this.orb2.material = this.orb2Mat;
    }
    r.render(this.scene, cam);
  }
}
export default CurrentsWorld;
