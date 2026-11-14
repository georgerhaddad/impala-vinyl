// What stands on the sheet (shaders and geometry for worlds/rarities.js): a pop-up book of the things a test
// pressing comes in. Every card is first a drawing lying flat on the paper, then lifts on its near edge to stand
// facing the deck; the ones between the camera and the deck lie back down, so the book always opens toward you.
//   kinds: 0 a plain sleeve (die-cut hole)   1 a blank label (a disc)   2 a VU meter   4 the typed job slip
//          5 the job ticket   6 a loose caption (ink only)
// Also here: the chart-recorder tape (the last half minute of bass and treble, scrolling), the Lissajous figure and
// its shadow, and the loose pages.
import * as THREE from 'three';
import { COMMON } from './rarities-floor.js';

// where a card is and how far it has risen: shared by the card and by its shadow
const CARD_VS = `${COMMON}
attribute vec4 aA;          // angle round the deck, distance, yaw (a jitter; absolute for the slips), order of appearance
attribute vec4 aB;          // width, height, kind, id
attribute vec4 aC;          // an atlas rectangle, for the kinds that carry exactly one mark
uniform vec4 uKnob;         // sleeves, vu, notes, stamp
uniform float uLay, uLayRot, uFold, uKick, uShadowPass;
uniform vec2 uCamDir;
uniform vec3 uL;
uniform vec4 uStamps[8], uHands[8], uGlyphs[10], uVU;
varying vec2 vUv, vSize;
varying vec4 vK;            // kind, id, how much is drawn, how far risen
varying vec4 vR1, vU1, vR2, vU2, vR3, vU3;
varying vec3 vN;
void main() {
  float kind = aB.z, id = aB.w, o = aA.w;
  float h1 = h11(id * 1.37 + uLay * 9.17), h2 = h11(id * 2.11 + uLay * 5.31 + 3.0), h3 = h11(id * 3.7 + uLay * 2.9 + 7.0);
  bool slip = kind > 3.5;
  float ang = slip ? aA.x : aA.x + uLayRot + (h1 - 0.5) * 0.6;
  float rad = slip ? aA.y : aA.y * (0.88 + 0.3 * h2);
  vec2 base = vec2(cos(ang), sin(ang)) * rad;
  float yaw = slip ? aA.z : ang + 3.14159 + aA.z + (h3 - 0.5) * 0.8;
  vec2 n = vec2(cos(yaw), sin(yaw)), tg = vec2(-n.y, n.x);
  float k = slip ? uKnob.z : (kind > 1.5 ? uKnob.y : uKnob.x);
  float app = smoothstep(0.3 * o, 0.25 + 0.3 * o, k);
  float rise = slip ? 0.0 : smoothstep(0.4 + 0.3 * o, 0.7 + 0.3 * o, k) * uFold * step(h11(id * 4.9 + uLay * 1.3), 0.78);   // a few stay drawings
  if (uSwell.w > 0.001 && !slip && aA.y < 6.5) {                  // at sea the near ones are left astern, and others come up ahead
    base = mod(base - uHeading * uSwell.z + 4.5, 9.0) - 4.5;
    float lat = abs(dot(base, vec2(uHeading.y, -uHeading.x))), edge = max(abs(base.x), abs(base.y));
    app *= mix(1.0, smoothstep(0.75, 1.05, lat) * smoothstep(4.45, 3.7, edge), uSwell.w);
    rad = length(base);
  }
  float front = dot(base / max(rad, 1e-3), uCamDir);
  rise *= 1.0 - smoothstep(0.15, 0.6, front) * (1.0 - smoothstep(2.6, 3.4, rad));
  float th = rise * (1.42 - 0.3 * h1) * (1.0 - 0.06 * uKick * (0.5 + h2));
  vec2 l = vec2((uv.x - 0.5) * aB.x, uv.y * aB.y);
  vec3 P = vec3(base + tg * l.x - n * (cos(th) * l.y), FLOORZ + 0.0018 + 0.0008 * h3 + sin(th) * l.y + swell(base));
  if (uShadowPass > 0.5) { float t = (P.z - FLOORZ) / max(uL.z, 0.12); P.xy -= uL.xy * t; P.z = FLOORZ + 0.0009 + swell(base); }
  vN = vec3(n * sin(th), cos(th));
  vUv = uv; vSize = aB.xy; vK = vec4(kind, id, app, rise);
  // what is stamped, pencilled and printed on it: this song's deal of the marks
  float s1 = h11(id * 7.7 + uLay * 3.1), s2 = h11(id * 9.3 + uLay * 4.7), s3 = h11(id * 11.9 + uLay * 6.1);
  vR1 = vec4(0.0); vR2 = vec4(0.0); vR3 = vec4(0.0); vU1 = vec4(0.0); vU2 = vec4(0.0); vU3 = vec4(0.0);
  if (kind < 0.5) {
    if (s1 < 0.72) { vec2 c = vec2(0.31 + 0.06 * h2, 0.8 - 0.05 * h3); vR1 = vec4(c - vec2(0.25, 0.125), c + vec2(0.25, 0.125)); vU1 = uStamps[int(s1 / 0.72 * 7.99)]; }
    if (s2 < 0.62) { vec2 c = vec2(0.66, 0.11 + 0.05 * h1); vR2 = vec4(c - vec2(0.28, 0.07), c + vec2(0.28, 0.07)); vU2 = uHands[int(s2 / 0.62 * 7.99)]; }
    if (s3 < 0.6) { vec2 c = vec2(0.82, 0.8); vR3 = vec4(c - vec2(0.105, 0.132), c + vec2(0.105, 0.132)); vU3 = uGlyphs[int(s3 / 0.6 * 9.99)]; }
  } else if (kind < 1.5) {
    if (s1 < 0.8) { vec2 c = vec2(0.5, 0.72); vR1 = vec4(c - vec2(0.27, 0.135), c + vec2(0.27, 0.135)); vU1 = uStamps[int(s1 / 0.8 * 7.99)]; }
    if (s2 < 0.75) { vec2 c = vec2(0.5, 0.27); vR2 = vec4(c - vec2(0.3, 0.075), c + vec2(0.3, 0.075)); vU2 = uHands[int(s2 / 0.75 * 7.99)]; }
  } else if (kind < 2.5) { vR1 = vec4(0.03, 0.045, 0.97, 0.955); vU1 = uVU; }
  else if (kind > 4.5) { vR1 = kind > 5.5 ? vec4(0.0, 0.0, 1.0, 1.0) : vec4(0.02, 0.03, 0.98, 0.97); vU1 = aC; }
  gl_Position = projectionMatrix * viewMatrix * vec4(P, 1.0);
}`;

const CARD_FS = `
#define TAU 6.2831853
uniform sampler2D tAtlas;
uniform vec3 uCard, uInk, uInk2, uAcc, uShadowC, uL, uVUn;
uniform vec4 uKnob, uTyped[8], uDigits, uRead;
uniform float uShadowPass, uFade, uInkRed, uType, uKick, uShade, uDarkK;
varying vec2 vUv, vSize;
varying vec4 vK, vR1, vU1, vR2, vU2, vR3, vU3;
varying vec3 vN;
vec4 mark(vec4 rc, vec4 uvr, vec2 uv) {
  vec2 t = (uv - rc.xy) / max(rc.zw - rc.xy, vec2(1e-5));
  float inside = step(0.0, t.x) * step(t.x, 1.0) * step(0.0, t.y) * step(t.y, 1.0) * step(1e-4, rc.z - rc.x);
  return texture2D(tAtlas, mix(uvr.xy, uvr.zw, clamp(t, 0.0, 1.0))) * inside;
}
float digit(float v, float n) { return mod(floor(v / floor(pow(10.0, n) + 0.5) + 1e-4), 10.0); }
void main() {
  float kind = vK.x, app = vK.z, rise = vK.w;
  vec2 m = (vUv - 0.5) * vSize;                                   // metres from the middle of the card
  float px = length(fwidth(m)) * 0.6 + 1e-6, soft = uShadowPass > 0.5 ? 0.012 + 0.03 * rise : px;
  float edge = min(vSize.x * 0.5 - abs(m.x), vSize.y * 0.5 - abs(m.y)), rr = length(m);
  float cov = smoothstep(0.0, soft, edge), line = 0.0, light = 0.0;
  if (kind < 0.5) {                                               // a sleeve: square, with the hole the label shows through
    float hole = 0.165 * vSize.x;
    cov *= smoothstep(hole - soft, hole + soft, rr);
    line = max(1.0 - smoothstep(0.0016 - px, 0.0016 + px, abs(edge - 0.0016)), 1.0 - smoothstep(0.0013 - px, 0.0013 + px, abs(rr - hole - 0.0013)));
    light = 1.0 - smoothstep(0.0008 - px, 0.0008 + px, abs(m.x - vSize.x * 0.455));     // the fold of the pocket
  } else if (kind < 1.5) {                                        // a label: a disc on its edge
    float R = vSize.x * 0.5;
    cov = (1.0 - smoothstep(R - soft, R, rr)) * smoothstep(R * 0.045 - soft * 0.3, R * 0.045 + soft * 0.3, rr);
    line = max(1.0 - smoothstep(0.0016 - px, 0.0016 + px, abs(rr - R + 0.0016)), 1.0 - smoothstep(0.001 - px, 0.001 + px, abs(rr - R * 0.045 - 0.001)));
    light = max(1.0 - smoothstep(0.0008 - px, 0.0008 + px, abs(rr - R * 0.93)), 1.0 - smoothstep(0.0008 - px, 0.0008 + px, abs(rr - R * 0.34)));
  } else if (kind < 5.5) {                                        // a panel or a slip: ruled round the edge
    line = 1.0 - smoothstep(0.0013 - px, 0.0013 + px, abs(edge - 0.0013));
    if (kind < 2.5) light = 1.0 - smoothstep(0.0008 - px, 0.0008 + px, abs(edge - 0.008));
  } else cov = 1.0;
  cov *= 1.0 - smoothstep(app * 1.1 - 0.08, app * 1.1, vUv.y);    // it is drawn in from its near edge
  if (uShadowPass > 0.5) {
    if (kind > 3.5) discard;
    gl_FragColor = vec4(uShadowC, cov * (0.25 + 0.3 * rise) * uShade * uFade);
    return;
  }
  bool back = !gl_FrontFacing;
  float lit = clamp(dot(normalize(vN) * (back ? -1.0 : 1.0), uL), 0.0, 1.0);
  vec3 col = uCard * (0.9 + 0.1 * lit) * (back ? 0.93 : 1.0);
  col = mix(col, uCard * 1.06, uDarkK * 0.5 * rise);
  float ink = line, ink2 = light * 0.8, red = 0.0, pen = 0.0;
  if (!back) {
    vec4 a = mark(vR1, vU1, vUv), b = mark(vR2, vU2, vUv), c = mark(vR3, vU3, vUv);
    if (kind < 1.5) {                                             // stamps strike on the kick; pencil is pencil
      float sk = uKnob.w * (0.8 + 0.2 * uKick);
      red += a.a * a.r * sk; ink += a.a * (1.0 - a.r) * sk;
      pen += b.a * 0.85; ink += c.a * 0.92;
    } else if (kind < 2.5) {                                      // the meter: its face, and a needle
      red += a.a * a.r; ink += a.a * (1.0 - a.r);
      vec2 f = (vUv - vR1.xy) / (vR1.zw - vR1.xy);
      vec2 fm = vec2((f.x - 0.5) * 1.6, f.y + 0.075);
      float idx = mod(vK.y, 3.0), v = idx < 0.5 ? uVUn.x : (idx < 1.5 ? uVUn.y : uVUn.z);
      float na = (v * 2.0 - 1.0) * 0.87, rad = length(fm), an = atan(fm.x, fm.y);
      float fpx = px / (vSize.y * 0.91);
      float nd = abs(an - na) * rad;
      ink = max(ink, (1.0 - smoothstep(0.006 - fpx, 0.006 + fpx, nd)) * step(0.12, rad) * step(rad, 0.97) * step(0.0, f.y) * step(f.y, 1.0));
      red += (1.0 - smoothstep(0.03 - fpx, 0.03 + fpx, length((f - vec2(0.9, 0.84)) * vec2(1.6, 1.0)))) * step(0.8, v);
    } else if (kind < 4.5) {                                      // the job slip: typed a line at a time, on the beat
      float rows = 9.0, ry = (1.0 - vUv.y) * rows * 1.06 - 0.3, row = floor(ry);
      vec2 f = vec2((vUv.x - 0.05) / 0.9, 1.0 - fract(ry));
      float inx = step(0.0, f.x) * step(f.x, 1.0), col24 = floor(f.x * 24.0);
      if (row >= 0.0 && row < 7.5) {
        vec4 rc = uTyped[int(row)];
        float typedTo = clamp(floor((uType - row * 7.0) * 4.0), 0.0, 24.0);
        vec4 t = texture2D(tAtlas, vec2(mix(rc.x, rc.z, clamp(f.x, 0.0, 1.0)), mix(rc.y, rc.w, f.y)));
        ink += t.a * inx * step(col24, typedTo - 0.5);
        red += inx * step(abs(col24 - typedTo), 0.5) * step(typedTo, 23.5) * step(0.5, typedTo) * step(0.12, f.y) * step(f.y, 0.88) * 0.85;     // the carriage
      } else if (row > 7.5 && row < 8.5) {                        // the counters: bar and beat, minutes and seconds
        float cx = fract(f.x * 24.0), g = 14.0;
        if (col24 < 3.5) g = digit(uRead.x, 3.0 - col24);
        else if (col24 < 4.5) g = 11.0;
        else if (col24 < 5.5) g = uRead.y;
        else if (col24 > 8.5 && col24 < 10.5) g = digit(uRead.z, 10.0 - col24);
        else if (col24 > 10.5 && col24 < 11.5) g = 10.0;
        else if (col24 > 11.5 && col24 < 13.5) g = digit(uRead.w, 13.0 - col24);
        else if (col24 > 16.5 && col24 < 23.5) g = step(col24 - 17.0, uRead.y - 0.5) > 0.5 ? 12.0 : 14.0;
        vec4 t = texture2D(tAtlas, vec2(mix(uDigits.x, uDigits.z, (g + clamp(cx, 0.02, 0.98)) / 15.0), mix(uDigits.y, uDigits.w, f.y)));
        float beatMark = step(16.5, col24) * step(col24, 23.5);
        ink += t.a * inx * (1.0 - beatMark); red += t.a * inx * beatMark;
      }
    } else {                                                      // a ticket or a caption: one mark, as printed
      red += a.a * a.r; ink += a.a * (1.0 - a.r);
    }
  }
  if (kind > 5.5) {                                               // a caption has no paper of its own
    float al = clamp(ink + red, 0.0, 1.0) * app * uFade;
    if (al < 0.02) discard;
    gl_FragColor = vec4(mix(mix(uInk, uAcc, uInkRed), uAcc, clamp(red / max(ink + red, 1e-4), 0.0, 1.0)), al);
    return;
  }
  col = mix(col, uInk2, clamp(ink2, 0.0, 1.0) * uFade * 0.6);
  col = mix(col, uInk, clamp(pen, 0.0, 1.0) * uFade * 0.7);
  col = mix(col, mix(uInk, uAcc, uInkRed), clamp(ink, 0.0, 1.0) * uFade);
  col = mix(col, uAcc, clamp(red, 0.0, 1.0) * uFade);
  if (cov < 0.01) discard;
  gl_FragColor = vec4(col, cov);
}`;

// ---- the chart recorder: a paper tape lying past the deck, its far end lifting into the air ----
const TAPE_VS = `${COMMON}
attribute vec3 aUp;         // how far this point lifts when the tape's end rises
attribute vec2 aUV;         // metres along the tape (0 at the pens), -1..1 across it
attribute float aTape;
uniform vec4 uTapeRot;      // each tape's turn about the deck: cos, sin, cos, sin
uniform vec2 uTapeRise;
uniform vec3 uL; uniform float uShadowPass;
varying vec2 vUV; varying float vTape, vLift;
void main() {
  vec2 cs = aTape < 0.5 ? uTapeRot.xy : uTapeRot.zw; float rise = aTape < 0.5 ? uTapeRise.x : uTapeRise.y;
  vec3 p = position + aUp * rise;
  p.xy = vec2(p.x * cs.x - p.y * cs.y, p.x * cs.y + p.y * cs.x);
  p.z += FLOORZ + 0.003;
  vLift = p.z - FLOORZ;
  if (uShadowPass > 0.5) { float t = (p.z - FLOORZ) / max(uL.z, 0.12); p.xy -= uL.xy * t; p.z = FLOORZ + 0.001; }
  vUV = aUV; vTape = aTape;
  gl_Position = projectionMatrix * viewMatrix * vec4(p, 1.0);
}`;
const TAPE_FS = `
#define TAU 6.2831853
uniform sampler2D tTape;
uniform vec3 uCard, uInk, uInk2, uAcc, uShadowC;
uniform float uHead, uChart, uFade, uShadowPass, uInkRed, uKick, uShade, uSpeed;
uniform vec3 uNow;          // low, high, kick: where the pens are this instant
varying vec2 vUV; varying float vTape, vLift;
const float N = 1024.0, STEP = 1.0 / 30.0;
vec4 hist(float age) { return texture2D(tTape, vec2((uHead - age / STEP + 0.5) / N, 0.5)); }
void main() {
  float u = vUV.x, v = vUV.y;
  float reach = uChart * 9.0;                                      // the tape is fed in from the pens
  if (u > reach || u < -reach * 0.35) discard;
  if (uShadowPass > 0.5) { gl_FragColor = vec4(uShadowC, smoothstep(0.0, 0.03, vLift) * 0.4 * uShade * uFade * smoothstep(1.0, 0.75, abs(v))); return; }
  float pu = fwidth(u) + 1e-6, pv = fwidth(v) + 1e-6;
  vec3 col = uCard * (gl_FrontFacing ? 1.0 : 0.94);
  float ink = 0.0, ink2 = 0.0, red = 0.0;
  ink += 1.0 - smoothstep(0.0, pv * 1.5, 1.0 - abs(v));                                   // the edges
  float holes = 1.0 - smoothstep(0.007 - pu, 0.007 + pu, length(vec2((fract((u - uHead * STEP * uSpeed) / 0.05) - 0.5) * 0.05, (abs(v) - 0.88) * 0.085)));
  ink2 += holes;                                                                           // feed holes
  ink2 += (1.0 - smoothstep(0.0, pv * 1.2, abs(fract(v * 4.0 + 0.5) - 0.5) / 4.0)) * 0.35 * step(abs(v), 0.76);     // ruled
  float age = u / uSpeed;
  if (age > 0.0 && age < (N - 4.0) * STEP) {
    vec4 h0 = hist(age), h1 = hist(age + STEP * 1.5);
    float du = STEP * 1.5 * uSpeed / 0.085;                         // the step along the tape, in the same units as v
    float old = smoothstep((N - 4.0) * STEP, (N - 200.0) * STEP, age);
    float y0 = 0.38 + (h0.r - 0.35) * 0.6, y1 = 0.38 + (h1.r - 0.35) * 0.6;
    float sl = (y1 - y0) / du, d = abs(v - y0) / sqrt(1.0 + sl * sl);
    ink += (1.0 - smoothstep(0.018 - pv, 0.018 + pv, d)) * old;
    y0 = -0.36 + (h0.g - 0.3) * 0.55; y1 = -0.36 + (h1.g - 0.3) * 0.55;
    sl = (y1 - y0) / du; d = abs(v - y0) / sqrt(1.0 + sl * sl);
    ink += (1.0 - smoothstep(0.014 - pv, 0.014 + pv, d)) * old * 0.8;
    red += step(0.55, h0.b) * step(0.7, abs(v)) * step(abs(v), 0.8) * step(0.0, v) * old;      // the event pen: a tick on every kick
  }
  // the pens
  float pl = 0.38 + (uNow.x - 0.35) * 0.6, ph = -0.36 + (uNow.y - 0.3) * 0.55;
  red += 1.0 - smoothstep(0.012 - pu, 0.012 + pu, length(vec2(u, (v - pl) * 0.085)));
  red += 1.0 - smoothstep(0.009 - pu, 0.009 + pu, length(vec2(u, (v - ph) * 0.085)));
  ink += (1.0 - smoothstep(0.0, pu * 1.3, abs(u + 0.004))) * 0.6;
  col = mix(col, uInk2, clamp(ink2, 0.0, 1.0) * 0.55 * uFade);
  col = mix(col, mix(uInk, uAcc, uInkRed), clamp(ink, 0.0, 1.0) * uFade);
  col = mix(col, uAcc, clamp(red, 0.0, 1.0) * uFade);
  gl_FragColor = vec4(col, 1.0);
}`;

// ---- the Lissajous figure: a trace in the air (and, flat on the paper, its shadow) ----
const LISSA_VS = `${COMMON}
attribute float aT, aSide;
uniform vec3 uCtr, uFreq, uPhase, uL;
uniform float uR, uWide, uDist, uShadowPass, uCx, uT, uResY;
varying float vT, vSide, vThin;
vec3 curve(float t) {
  float ph = t * TAU;
  vec3 a = vec3(sin(uFreq.x * ph + uPhase.x), sin(uFreq.y * ph + uPhase.y), sin(uFreq.z * ph + uPhase.z));
  vec3 b = vec3(sin(ph + uPhase.x), cos(ph + uPhase.x), 0.25 * sin(2.0 * ph + uPhase.z));     // the plain loop it grows out of
  vec3 c = mix(b, a, uCx);
  c += uDist * vec3(sin(ph * 17.0 + uPhase.y * 3.0), sin(ph * 23.0 - uPhase.x * 2.0), sin(ph * 13.0 + uPhase.z)) * 0.12;
  return uCtr + c * uR * vec3(1.0, 1.0, 0.8);
}
void main() {
  vec3 p = curve(aT), q = curve(aT + 0.0008);
  if (uShadowPass > 0.5) {
    float t0 = (p.z - FLOORZ) / max(uL.z, 0.12), t1 = (q.z - FLOORZ) / max(uL.z, 0.12);
    p = vec3(p.xy - uL.xy * t0, FLOORZ + 0.0012 + swell(p.xy)); q = vec3(q.xy - uL.xy * t1, FLOORZ + 0.0012);
    vec2 tg = normalize(q.xy - p.xy + 1e-6);
    p.xy += vec2(-tg.y, tg.x) * aSide * max(uWide * 0.75, 0.0012);
    vThin = 1.0;
  } else {
    vec3 tg = normalize(q - p + 1e-6), n = normalize(cross(tg, cameraPosition - p));
    float pxw = length(cameraPosition - p) * 2.0 / (projectionMatrix[1][1] * uResY) * 0.8, w = max(uWide, pxw);   // never thinner than a pixel: fainter instead
    vThin = uWide / w;
    p += n * aSide * w;
  }
  vT = aT; vSide = aSide;
  gl_Position = projectionMatrix * viewMatrix * vec4(p, 1.0);
}`;
const LISSA_FS = `
uniform vec3 uInk, uAcc, uShadowC, uInk2;
uniform float uShadowPass, uFade, uA, uBeam, uInkRed, uShade;
varying float vT, vSide, vThin;
void main() {
  float e = 1.0 - smoothstep(0.55, 1.0, abs(vSide));
  float beam = fract(uBeam - vT);                                  // the spot runs round it, and what it has just drawn is freshest
  float fresh = exp(-beam * 5.0);
  if (uShadowPass > 0.5) { gl_FragColor = vec4(uInk2, e * uA * uFade * (0.3 + 0.4 * fresh) * uShade); return; }
  vec3 c = mix(mix(uInk, uAcc, uInkRed), uAcc, smoothstep(0.985, 1.0, 1.0 - beam) );
  gl_FragColor = vec4(c, e * uA * uFade * (0.42 + 0.58 * fresh) * vThin);
}`;

// ---- loose pages: day sheets off a calendar, blowing away (Patience) ----
const PAGE_VS = `${COMMON}
attribute vec4 aP;          // phase, lane, spin, size
uniform float uPages, uPageT, uDay;
uniform vec2 uWind;
varying vec2 vUv; varying float vA, vNum, vFace;
void main() {
  float life = fract(aP.x + uPageT * (0.05 + 0.03 * aP.y));       // 0 where it leaves the pad, 1 gone
  float on = step(aP.x * 0.999, uPages);
  vec2 wd = normalize(uWind), ac = vec2(-wd.y, wd.x);
  float d = life * life * 7.0 + life * 1.2;
  vec3 c = vec3(wd * (0.42 + d) + ac * ((aP.y - 0.5) * (0.5 + 2.2 * life) + 0.25 * sin(life * 9.0 + aP.z * 6.0)), FLOORZ + 0.03 + life * (0.5 + 1.6 * aP.y) + 0.12 * sin(life * 13.0 + aP.z * 20.0));
  float a1 = life * (5.0 + 9.0 * aP.z) + aP.z * 6.28, a2 = life * (3.0 + 5.0 * aP.y);
  vec2 l = (uv - 0.5) * vec2(0.11, 0.15) * aP.w;
  vec3 ex = vec3(cos(a1) * ac + sin(a1) * wd * 0.3, sin(a1) * 0.6), ey = vec3(-sin(a2) * wd, cos(a2));
  ex = normalize(ex); ey = normalize(ey - ex * dot(ex, ey));
  vec3 P = c + ex * l.x + ey * l.y;
  vUv = uv; vA = on * smoothstep(0.0, 0.04, life) * smoothstep(1.0, 0.8, life);
  vNum = mod(floor(uDay) + floor(aP.x * 40.0), 31.0) + 1.0;
  vFace = dot(cross(ex, ey), cameraPosition - c);
  gl_Position = projectionMatrix * viewMatrix * vec4(P, 1.0);
  if (vA < 0.01) gl_Position = vec4(2.0, 2.0, 2.0, 1.0);
}`;
const PAGE_FS = `
uniform sampler2D tAtlas; uniform vec4 uDigits; uniform vec3 uCard, uInk, uAcc; uniform float uFade;
varying vec2 vUv; varying float vA, vNum, vFace;
void main() {
  vec3 col = uCard * (vFace > 0.0 ? 1.0 : 0.93);
  vec2 e = min(vUv, 1.0 - vUv);
  float edge = 1.0 - smoothstep(0.0, 0.025, min(e.x, e.y));
  vec2 f = (vUv - vec2(0.14, 0.12)) / vec2(0.72, 0.6);
  float tens = floor(vNum / 10.0), ones = mod(vNum, 10.0), cell = floor(f.x * 2.0), g = cell < 0.5 ? tens : ones;
  vec4 t = texture2D(tAtlas, vec2(mix(uDigits.x, uDigits.z, (g + clamp(fract(f.x * 2.0), 0.03, 0.97)) / 15.0), mix(uDigits.y, uDigits.w, clamp(f.y, 0.0, 1.0))));
  float ink = t.a * step(0.0, f.x) * step(f.x, 1.0) * step(0.0, f.y) * step(f.y, 1.0) * step(0.0, vFace);
  col = mix(col, uInk, max(edge * 0.8, ink) * uFade);
  col = mix(col, uAcc, step(0.86, vUv.y) * step(vUv.y, 0.9) * step(0.08, vUv.x) * step(vUv.x, 0.92) * uFade);       // the red rule along the top of a day sheet
  gl_FragColor = vec4(col, vA);
}`;

const quad = () => { const g = new THREE.InstancedBufferGeometry(); g.setAttribute('position', new THREE.Float32BufferAttribute([0, 0, 0, 1, 0, 0, 1, 1, 0, 0, 1, 0], 3)); g.setAttribute('uv', new THREE.Float32BufferAttribute([0, 0, 1, 0, 1, 1, 0, 1], 2)); g.setIndex([0, 1, 2, 0, 2, 3]); return g; };
const mat = (vs, fs, uniforms, o = {}) => new THREE.ShaderMaterial({ vertexShader: vs, fragmentShader: fs, uniforms, side: THREE.DoubleSide, ...o });

// the cards: deal them out in rings round the deck, bigger the further off they stand
export function buildCards(sh, R, uvs) {
  const A = [], B = [], Cc = [];
  let id = 0;
  const put = (ang, rad, yaw, order, w, h, kind, rc) => { A.push(ang, rad, yaw, order); B.push(w, h, kind, id++); const c = rc || new THREE.Vector4(); Cc.push(c.x, c.y, c.z, c.w); };
  const rings = [[0.8, 5, 0.05], [1.4, 7, 0.2], [2.3, 9, 0.4], [4.2, 10, 0.6], [8, 11, 0.75], [15, 12, 0.85], [28, 13, 0.9]];
  for (const [rad, n, ord] of rings) for (let i = 0; i < n; i++) {
    const a = (i + R() * 0.7) / n * Math.PI * 2, rr = rad * (0.9 + 0.25 * R()), sz = 0.27 * (1 + 0.4 * rr) * (0.85 + 0.3 * R());
    const kind = R() < 0.36 ? 1 : 0;
    put(a, rr, (R() - 0.5) * 0.3, Math.min(0.99, ord + R() * 0.2), sz, sz, kind);
  }
  // three meters, close in
  for (let i = 0; i < 3; i++) put(1.07 + (i - 1) * 0.62, 0.74 + 0.05 * (i % 2), 0, 0.1 + i * 0.25, 0.3, 0.19, 2);
  // the slips that lie by the deck (they never stand): the typed job slip, the ticket, a few captions
  const flat = (x, y, w, h, kind, rc, rot = 0) => { const bx = x + Math.sin(rot) * h / 2, by = y - Math.cos(rot) * h / 2; put(Math.atan2(by, bx), Math.hypot(bx, by), -Math.PI / 2 + rot, 0, w, h, kind, rc); };
  flat(0.34, -0.43, 0.37, 0.235, 4, null, 0.05);
  flat(-0.46, 0.02, 0.34, 0.136, 5, uvs.ticket, -0.09);
  flat(0.0425, -0.262, 0.07, 0.0173, 6, uvs.misc[0]);                // the deck's width, on its dimension line
  flat(0.33, 0, 0.07, 0.0173, 6, uvs.misc[1], Math.PI / 2);
  flat(0.02, 0.475, 0.11, 0.014, 6, uvs.small[5], 0);
  const g = quad();
  g.setAttribute('aA', new THREE.InstancedBufferAttribute(new Float32Array(A), 4)); g.setAttribute('aB', new THREE.InstancedBufferAttribute(new Float32Array(B), 4)); g.setAttribute('aC', new THREE.InstancedBufferAttribute(new Float32Array(Cc), 4));
  g.instanceCount = id;
  const u = { ...sh, uShadowPass: { value: 0 }, uStamps: { value: uvs.stamps }, uHands: { value: uvs.hands }, uGlyphs: { value: uvs.glyphs }, uVU: { value: uvs.vu }, uTyped: { value: uvs.typed }, uDigits: { value: uvs.digits } };
  const cards = new THREE.Mesh(g, mat(CARD_VS, CARD_FS, u, { alphaToCoverage: true }));
  const shadows = new THREE.Mesh(g, mat(CARD_VS, CARD_FS, { ...u, uShadowPass: { value: 1 } }, { transparent: true, depthWrite: false }));
  cards.frustumCulled = shadows.frustumCulled = false; cards.renderOrder = 2; shadows.renderOrder = -3;
  return { cards, shadows };
}

// two tapes: flat past the deck, then up and away in an arc
export function buildTapes(sh) {
  const pos = [], up = [], uv = [], tape = [], idx = [];
  const W = 0.085;                                                  // half the tape's width
  for (let t = 0; t < 2; t++) {
    const y0 = t === 0 ? 0.62 : 0.86, n0 = pos.length / 3;
    const pts = [];                                                  // [u, lift x, lift z]
    for (let u = -3.2; u < 1.0; u += 0.3) pts.push([u, 0, 0]);
    const RA = 1.5 + t * 0.4, A1 = 1.15;
    for (let i = 0; i <= 26; i++) { const a = i / 26 * A1; pts.push([1.0 + a * RA, RA * Math.sin(a) - a * RA, RA * (1 - Math.cos(a))]); }
    const ex = 1.0 + RA * Math.sin(A1), ez = RA * (1 - Math.cos(A1));
    for (let i = 1; i <= 8; i++) { const d = i * 2.2, u = 1.0 + A1 * RA + d; pts.push([u, ex + Math.cos(A1) * d - u, ez + Math.sin(A1) * d]); }
    pts.forEach(([u, lx, lz], i) => {
      for (const s of [-1, 1]) { pos.push(u, y0 + s * W, 0); up.push(lx, 0, lz); uv.push(u, s); tape.push(t); }
      if (i) { const a = n0 + (i - 1) * 2; idx.push(a, a + 1, a + 2, a + 1, a + 3, a + 2); }
    });
  }
  const g = new THREE.BufferGeometry();
  g.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3)); g.setAttribute('aUp', new THREE.Float32BufferAttribute(up, 3));
  g.setAttribute('aUV', new THREE.Float32BufferAttribute(uv, 2)); g.setAttribute('aTape', new THREE.Float32BufferAttribute(tape, 1)); g.setIndex(idx);
  const u = { ...sh, uShadowPass: { value: 0 } };
  const tapes = new THREE.Mesh(g, mat(TAPE_VS, TAPE_FS, u));
  const shadows = new THREE.Mesh(g, mat(TAPE_VS, TAPE_FS, { ...u, uShadowPass: { value: 1 } }, { transparent: true, depthWrite: false }));
  tapes.frustumCulled = shadows.frustumCulled = false; tapes.renderOrder = 1; shadows.renderOrder = -3;
  return { tapes, shadows };
}

export function buildLissa(sh) {
  const N = 1500, t = new Float32Array(N * 2), side = new Float32Array(N * 2), idx = [];
  for (let i = 0; i < N; i++) { t[i * 2] = t[i * 2 + 1] = i / (N - 1); side[i * 2] = -1; side[i * 2 + 1] = 1; if (i) { const a = (i - 1) * 2; idx.push(a, a + 1, a + 2, a + 1, a + 3, a + 2); } }
  const g = new THREE.BufferGeometry();
  g.setAttribute('position', new THREE.Float32BufferAttribute(new Float32Array(N * 6), 3)); g.setAttribute('aT', new THREE.BufferAttribute(t, 1)); g.setAttribute('aSide', new THREE.BufferAttribute(side, 1)); g.setIndex(idx);
  const u = { ...sh, uShadowPass: { value: 0 } };
  const o = { transparent: true, depthWrite: false };
  const fig = new THREE.Mesh(g, mat(LISSA_VS, LISSA_FS, u, o)), shadow = new THREE.Mesh(g, mat(LISSA_VS, LISSA_FS, { ...u, uShadowPass: { value: 1 } }, o));
  fig.frustumCulled = shadow.frustumCulled = false; fig.renderOrder = 4; shadow.renderOrder = -2;
  return { fig, shadow };
}

export function buildPages(sh, R, uvs) {
  const n = 40, P = new Float32Array(n * 4);
  for (let i = 0; i < n; i++) P.set([(i + 0.5) / n, R(), R(), 0.9 + R() * 0.5], i * 4);
  const g = quad(); g.setAttribute('aP', new THREE.InstancedBufferAttribute(P, 4)); g.instanceCount = n;
  const m = new THREE.Mesh(g, mat(PAGE_VS, PAGE_FS, { ...sh, uDigits: { value: uvs.digits } }, { transparent: true, depthWrite: false }));
  m.frustumCulled = false; m.renderOrder = 5;
  return m;
}
