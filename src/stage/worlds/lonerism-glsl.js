// Shaders for the Lonerism world (lonerism.js). Everything is worked out in the world's own frame: x along the
// railings (left to right from the default camera), y away from the viewer, z up, the origin under the deck's centre.
export const GROUND = -0.08;     // where the deck's feet stand
export const FV = 0.62;          // the railings' line: this far beyond the deck
export const GAP0 = 0.075, H0 = 0.46, POST = 12;   // bar spacing and height at rest; every POSTth bar is a post

const f = (x) => x.toFixed(4);

// the exposure: everything is lit, hazed by distance (and by the glare round the sun), then printed too bright
const COMMON = `
uniform vec3 uEye, uSunDir, uSunCol, uHaze, uShade;
uniform float uExpo, uHazeK, uGlare, uT, uSat;
const float GROUND = ${f(GROUND)}, FV = ${f(FV)};
float h21(vec2 p) { p = fract(p * vec2(123.34, 456.21)); p += dot(p, p + 45.32); return fract(p.x * p.y); }
float vn(vec2 p) { vec2 i = floor(p), f = fract(p); f = f * f * (3.0 - 2.0 * f); return mix(mix(h21(i), h21(i + vec2(1, 0)), f.x), mix(h21(i + vec2(0, 1)), h21(i + vec2(1, 1)), f.x), f.y); }
vec3 hazed(vec3 c, vec3 P) {
  vec3 d = P - uEye; float L = length(d); d /= L;
  float k = 1.0 - exp(-max(L - 1.3, 0.0) * uHazeK), s = max(0.0, dot(d, uSunDir));
  c = mix(c, uHaze * 1.3 + uSunCol * pow(s, 5.0) * 0.3 * uGlare, k);
  return c + uSunCol * pow(s, 16.0) * uGlare * 0.25 * (0.2 + 0.8 * k);
}
vec3 film(vec3 c) {
  c = 1.0 - exp(-pow(max(c, 0.0) * uExpo, vec3(1.35)));
  float l = dot(c, vec3(0.3, 0.59, 0.11));
  return mix(vec3(l), c, uSat * (1.0 - 0.4 * smoothstep(0.6, 1.0, l)));
}
`;

export const SKY_VS = `varying vec3 vD; void main() { vD = position; gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); gl_Position.z = gl_Position.w * 0.99999; }`;
export const SKY_FS = COMMON + `
uniform vec3 uTop, uTree; uniform float uSunR, uFlowT, uBurn;
varying vec3 vD;
void main() {
  vec3 d = normalize(vD); float z = max(d.z, 0.0);
  vec3 c = mix(uHaze * 1.3, uTop, pow(z, 0.42));
  // thin high cloud, drifting
  vec2 cp = d.xy / (z + 0.22) * 0.9 + vec2(uFlowT * 0.012, 0.0);
  float cl = smoothstep(0.42, 0.85, vn(cp) * 0.6 + vn(cp * 2.3 + 4.0) * 0.4) * smoothstep(0.03, 0.3, d.z);
  c = mix(c, uHaze * 1.3 + uSunCol * 0.2, cl * 0.6);
  float s = max(0.0, dot(d, uSunDir)), ang = acos(min(s, 1.0));
  c += uSunCol * (smoothstep(uSunR, uSunR * 0.72, ang) * 4.0 + (pow(s, 40.0) * 0.9 + pow(s, 5.0) * 0.3) * uGlare);
  // the trees round the park: far and pale past the lawn, close and dark behind the viewer
  vec2 h = normalize(d.xy + 1e-5); float el = d.z / max(length(d.xy), 1e-4);
  float n = vn(h * 6.0 + 3.0) * 0.55 + vn(h * 15.0 + 7.0) * 0.3 + vn(h * 41.0) * 0.15;
  float back = smoothstep(0.35, -0.55, h.y);
  float top = mix(0.05 + 0.1 * n, 0.3 + 0.5 * n, back);
  float tree = smoothstep(top, top - 0.014 - 0.07 * back, el);
  float lf = vn(vec2(atan(h.x, h.y) * 38.0, el * 46.0)) * 0.6 + vn(vec2(atan(h.x, h.y) * 97.0, el * 110.0)) * 0.4;
  vec3 tc = uTree * (0.5 + 0.35 * n + 0.5 * lf) * mix(1.0, mix(0.4, 1.15, smoothstep(0.0, top, el)), back);
  tc = mix(tc * (uShade * 0.5 + uSunCol * mix(0.55, 0.9, back)), uHaze * 1.3, mix(0.42, 0.06, back));
  tc += uSunCol * pow(s, 3.0) * 0.5 * uGlare;
  c = mix(c, tc, tree);
  c = mix(c, uSunCol * 2.5, uBurn * (0.25 + 0.75 * pow(s, 2.0)));
  gl_FragColor = vec4(film(c), 1.0);
}`;

export const GROUND_VS = `varying vec3 vP; void main() { vP = position; gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }`;
export const GROUND_FS = COMMON + `
uniform vec3 uLawn, uPave; uniform float uGap, uH, uShadowK, uFlowT, uPulse; uniform vec4 uKickAge, uKickAmp, uGiant; uniform vec2 uRingC; uniform float uDirect, uGiantPh;
varying vec3 vP;
// how much of a strip of half-width r is covered by a blur of half-width pen, x from its middle
float cover(float x, float r, float pen) { return max(0.0, min(x + pen, r) - max(x - pen, -r)) / (2.0 * pen); }
// the railings' shadow: follow the light back from the ground to the fence, and see what is there
float fenceShadow(vec2 p) {
  float sy = uSunDir.y; if (abs(sy) < 0.03) return 0.0;
  float t = (FV - p.y) / sy; if (t <= 0.0) return 0.0;
  float zh = t * uSunDir.z, uh = p.x + t * uSunDir.x, pen = 0.0012 + t * 0.0045;
  if (zh > uH + 0.05) return 0.0;
  float du = (fract(uh / uGap + 0.5) - 0.5) * uGap;
  float tf = clamp((zh - (uH - 0.06)) / 0.06, 0.0, 1.0);
  float r = tf < 0.25 ? mix(0.0065, 0.014, tf * 4.0) : 0.014 * (1.0 - tf) / 0.75;
  float top = smoothstep(uH + pen, uH - pen, zh);
  float sh = cover(du, r, pen) * top;
  float gp = uGap * ${f(POST)}; float dp = (fract(uh / gp + 0.5) - 0.5) * gp;
  sh = max(sh, cover(dp, 0.0155, pen) * top);
  sh = max(sh, cover(zh - (uH - 0.095), 0.01, pen));
  sh = max(sh, cover(zh - 0.095, 0.01, pen));
  sh = max(sh, smoothstep(0.045 + pen, 0.045 - pen, zh));
  return sh * exp(-t * 0.1);
}
float cap2(vec2 p, vec2 a, vec2 b, float r) { vec2 pa = p - a, ba = b - a; float h = clamp(dot(pa, ba) / dot(ba, ba), 0.0, 1.0); return length(pa - ba * h) - r; }
// the giant, side on (x along the lawn from its middle, y up, metres): it is only ever drawn as a shadow
float giant(vec2 q) {
  float d = (length((q - vec2(0.0, 1.38)) / vec2(1.3, 0.78)) - 1.0) * 0.78;                    // body
  d = min(d, length(q - vec2(1.42, 1.62)) - 0.6);                                                // head
  d = min(d, (length((q - vec2(0.98, 1.8)) / vec2(0.4, 0.62)) - 1.0) * 0.4);                    // ear
  float sw = sin(uT * 2.6) * 0.25;                                                               // the trunk, swinging
  vec2 k = vec2(2.2 + sw * 0.4, 0.85);
  d = min(d, min(cap2(q, vec2(1.9, 1.5), k, 0.2), cap2(q, k, vec2(2.05 + sw, 0.2), 0.13)));
  float s = sin(uGiantPh), c = cos(uGiantPh);                                                    // a step on every kick
  d = min(d, cap2(q, vec2(-0.95, 1.0), vec2(-0.95 + 0.28 * s, 0.2 + 0.22 * max(0.0, c)), 0.21));
  d = min(d, cap2(q, vec2(-0.5, 1.0), vec2(-0.5 - 0.28 * s, 0.2 + 0.22 * max(0.0, -c)), 0.21));
  d = min(d, cap2(q, vec2(0.5, 1.0), vec2(0.5 - 0.28 * s, 0.2 + 0.22 * max(0.0, -c)), 0.21));
  d = min(d, cap2(q, vec2(0.95, 1.0), vec2(0.95 + 0.28 * s, 0.2 + 0.22 * max(0.0, c)), 0.21));
  return min(d, cap2(q, vec2(-1.25, 1.6), vec2(-1.55, 0.95), 0.045));                             // tail
}
float giantShadow(vec2 p) {
  float sy = uSunDir.y; if (abs(sy) < 0.03) return 0.0;
  float t = (uGiant.y - p.y) / sy; if (t <= 0.0) return 0.0;
  float pen = 0.03 + t * 0.014;
  return smoothstep(pen, -pen, giant(vec2(p.x + t * uSunDir.x - uGiant.x, t * uSunDir.z) / 0.62) * 0.62);   // three times a person
}
float sdBox(vec2 p, vec2 b, float r) { vec2 q = abs(p) - b + r; return length(max(q, 0.0)) + min(max(q.x, q.y), 0.0) - r; }
void main() {
  vec2 p = vP.xy; float fw = fwidth(p.x) + fwidth(p.y);
  vec3 alb;
  if (p.y < FV) {                                   // paving slabs, this side
    vec2 g = vec2(p.x + 0.21 * mod(floor(p.y / 0.42), 2.0), p.y) / 0.42, cell = floor(g), fr = fract(g);
    float e = min(min(fr.x, 1.0 - fr.x), min(fr.y, 1.0 - fr.y)) * 0.42;
    float joint = smoothstep(0.0045 + fw, 0.0015, e) * clamp(1.0 - fw * 30.0, 0.0, 1.0);
    alb = uPave * (0.92 + 0.1 * h21(cell)) * (1.0 - 0.28 * joint) * (0.93 + 0.14 * vn(p * 11.0));
  } else {                                          // the lawn, mown in stripes, dry in patches
    float st = smoothstep(-0.35, 0.35, sin((p.y * 0.97 + p.x * 0.26) * 5.2));
    alb = uLawn * (0.9 + 0.1 * st) * (0.84 + 0.3 * vn(p * 1.7 + 3.0));
    alb = mix(alb, alb * vec3(1.14, 1.04, 0.74), vn(p * 0.45 + 9.0) * 0.5);
  }
  // leaf shade: this side stands under trees, with a clearing where the deck is
  vec2 w = vec2(sin(uT * 0.31), cos(uT * 0.23)) * 0.04;
  float n = vn(p * 1.15 + w) * 0.5 + vn(p * 3.1 - w * 1.4 + 5.0) * 0.28 + vn(p * 7.9 + w * 2.0) * 0.14 + vn(p * 19.0 - w * 3.0) * 0.08 * clamp(1.0 - fw * 8.0, 0.0, 1.0);
  float zo = smoothstep(0.5, 1.7, length(p - vec2(0.0, 0.05))) * smoothstep(FV, FV - 0.7, p.y);
  float cv = p.y < FV ? 0.72 * zo : 0.4 * smoothstep(3.0, 8.0, p.y);        // how much of the ground the leaves cover
  float sh = smoothstep(0.03, -0.09, 0.78 - cv * 0.62 - n) * 0.85;
  sh = max(sh, fenceShadow(p));
  // the deck's own shadow (the deck sits turned half a radian in this frame)
  vec2 q = vec2(0.878 * p.x + 0.479 * p.y, -0.479 * p.x + 0.878 * p.y);
  vec2 so = uSunDir.xy / max(uSunDir.z, 0.07), sq = vec2(0.878 * so.x + 0.479 * so.y, -0.479 * so.x + 0.878 * so.y);
  vec2 B = vec2(0.2275, 0.19);
  float d0 = sdBox(q, B, 0.02);
  float dd = min(min(sdBox(q + sq * 0.02, B, 0.02), sdBox(q + sq * 0.045, B, 0.02)), sdBox(q + sq * 0.07, B, 0.02));
  sh = max(sh, smoothstep(0.014, -0.014, dd));
  sh *= uShadowK;
  // something enormous on the lawn: its shadow
  float gi = 0.0;
  if (uGiant.w > 0.002) gi = uGiant.w * max(giantShadow(p) * uShadowK, 0.22 * smoothstep(1.0, 0.4, length((p - uGiant.xy) / vec2(uGiant.z, uGiant.z * 0.62))));
  sh = max(sh, gi);
  vec3 lit = mix(uSunCol * 1.3 * uDirect + uShade * (0.1 + 0.75 * (1.0 - uDirect)), uShade * 0.7, sh);
  vec3 c = alb * lit * (1.0 - 0.6 * exp(-max(d0, 0.0) / 0.03));
  // grass looks silver towards the sun
  vec3 vd = normalize(vP - uEye);
  if (p.y >= FV) c += uSunCol * pow(max(0.0, dot(normalize(vd.xy + 1e-5), normalize(uSunDir.xy + 1e-5))), 4.0) * 0.22 * (1.0 - sh);
  // a ring through the ground on each kick, out from the deck
  float ring = 0.0, rl = length(p - uRingC);
  ring += uKickAmp.x * exp(-uKickAge.x * 2.4) * exp(-pow((rl - 0.3 - uKickAge.x * 2.6) / 0.07, 2.0));
  ring += uKickAmp.y * exp(-uKickAge.y * 2.4) * exp(-pow((rl - 0.3 - uKickAge.y * 2.6) / 0.07, 2.0));
  c *= 1.0 + ring * uPulse * 0.4;
  gl_FragColor = vec4(film(hazed(c, vP)), 1.0);
}`;

// the railings: one bar (with its spear tip, its length of rail and of kerb) per instance, placed in the shader so
// spacing and height are uniforms
export const FENCE_VS = `
attribute vec3 aA; attribute float aI;
uniform float uGap, uH, uHum, uT; uniform vec4 uKickAge, uKickAmp;
varying vec3 vP, vN; varying float vKind;
const float GROUND = ${f(GROUND)}, FV = ${f(FV)};
void main() {
  vec3 p = position; float u0 = aI * uGap;
  float post = step(mod(aI + ${f(POST * 100)}, ${f(POST)}), 0.5), bar = step(aA.x, 0.5) * step(aA.z, 0.5);
  if (aA.x > 0.5) p.x *= uGap / ${f(GAP0)}; else if (aA.z < 0.5) p.xy *= 1.0 + post * 1.4;
  // each kick runs along the fence as a ripple
  float au = abs(u0), rip = 0.0;
  rip += uKickAmp.x * exp(-uKickAge.x * 1.6) * exp(-pow((au - uKickAge.x * 4.0) / 0.5, 2.0));
  rip += uKickAmp.y * exp(-uKickAge.y * 1.6) * exp(-pow((au - uKickAge.y * 4.0) / 0.5, 2.0));
  rip += uKickAmp.z * exp(-uKickAge.z * 1.6) * exp(-pow((au - uKickAge.z * 4.0) / 0.5, 2.0));
  float H = uH * (1.0 + post * 0.05) + rip * 0.035 * bar;
  float z = p.z + aA.y * H, hf = clamp(z / uH, 0.0, 1.0);
  // and the bars hum like strings, pinned at the rails
  float bend = sin(hf * 3.14159) * (uHum * 0.0035 * sin(uT * 37.0 + aI * 2.4) + rip * 0.012 * sin(uT * 46.0 + aI * 1.7));
  p.y += bend * bar * (1.0 - post); p.x += bend * 0.6 * bar * (1.0 - post) * sin(aI * 5.1);
  vec3 P = vec3(u0 + p.x, FV + p.y, GROUND + z);
  vP = P; vN = normal; vKind = aA.z;
  gl_Position = projectionMatrix * modelViewMatrix * vec4(P, 1.0);
}`;
export const FENCE_FS = COMMON + `
uniform vec3 uIron, uStone;
varying vec3 vP, vN; varying float vKind;
void main() {
  vec3 n = normalize(vN), vd = normalize(uEye - vP);
  float nl = max(0.0, dot(n, uSunDir));
  vec3 c;
  if (vKind > 0.5) c = uStone * (0.9 + 0.2 * vn(vP.xz * 40.0 + vP.y * 17.0)) * (uShade * 0.62 + uSunCol * nl * 1.2);
  else {
    // painted iron against the light: nearly a silhouette, with the sun catching its edges
    float rim = pow(1.0 - abs(dot(n, vd)), 2.5) * smoothstep(-0.4, 0.6, dot(-vd, uSunDir));
    c = uIron * (uShade * 0.8 + uSunCol * nl * 1.6) + uSunCol * rim * 0.7 + uSunCol * pow(max(0.0, dot(reflect(-vd, n), uSunDir)), 20.0) * 0.6;
  }
  gl_FragColor = vec4(film(hazed(c, vP)), 1.0);
}`;

// where a figure stands: shared by the figures and their shadows
const FIG = `
attribute vec4 aA, aB;
uniform float uWalkT, uNear, uCrowd, uKickEnv, uDance; uniform vec4 uHero, uGiant; uniform vec3 uGiant3;
const float GROUND = ${f(GROUND)}, FV = ${f(FV)};
vec3 figBase(out float vis) {
  float d = (0.34 + aA.y) * 5.5 * exp(-uNear * 1.05);          // metres past the railings
  float span = 5.0 + d * 1.5;
  float u = mod(aA.x * span + aB.z * uWalkT * 0.22 + span, 2.0 * span) - span;
  vis = smoothstep(aB.y - 0.03, aB.y + 0.03, uCrowd) * smoothstep(span, span * 0.88, abs(u));
  // the crowd keeps clear of the giant
  float gx = u - uGiant3.x; u += sign(gx) * uGiant3.z * 0.9 * exp(-pow(gx / max(uGiant3.y, 0.1), 2.0));
  if (aB.w > 0.5) { u = mix(u, uHero.y, uHero.x); d = mix(d, uHero.z, uHero.x); vis = max(vis, uHero.x); }
  return vec3(u, FV + d, GROUND);
}`;
export const FIG_VS = FIG + `
uniform vec3 uEye, uCamUp, uSunDir; uniform float uTilt, uSoft, uT;
varying vec2 vQ; varying vec4 vS; varying vec3 vP; varying float vVis, vBlur, vBack, vWalk, vGi;
void main() {
  float vis; vec3 base = figBase(vis); float h = aB.x;
  vGi = uGiant.w * smoothstep(1.0, 0.55, length((base.xy - uGiant.xy) / vec2(uGiant.z, uGiant.z * 0.62)));
  vec2 tc = uEye.xy - base.xy; float dist = length(uEye - base); tc = normalize(tc);
  vec3 right = vec3(-tc.y, tc.x, 0.0), up = normalize(mix(vec3(0.0, 0.0, 1.0), uCamUp, uTilt));
  vec2 q = vec2(position.x * 1.1, position.y * 1.34 - 0.03);
  float jump = uKickEnv * uDance * 0.11 * (0.4 + aA.z) * h;
  vec3 P = base + right * q.x * h + up * (q.y * h + jump);
  float hero = aB.w * uHero.x;
  vQ = q; vS = vec4(aA.z, aA.w, aB.z * 0.5 + 0.5, hero); vP = P; vVis = vis * smoothstep(0.3, 0.9, dist); vWalk = aB.z;
  vBlur = (0.008 + dist * 0.0045 * exp(uSoft * 1.1)) / h * (1.0 - 0.7 * hero);
  vBack = smoothstep(-0.2, 0.6, dot(normalize(base.xy - uEye.xy), normalize(uSunDir.xy)));
  gl_Position = projectionMatrix * modelViewMatrix * vec4(P, 1.0);
}`;
export const FIG_FS = COMMON + `
uniform float uWalkT, uDance, uKickEnv, uFade; uniform vec3 uHeroCol;
varying vec2 vQ; varying vec4 vS; varying vec3 vP; varying float vVis, vBlur, vBack, vWalk, vGi;
float cap(vec2 p, vec2 a, vec2 b, float r) { vec2 pa = p - a, ba = b - a; float h = clamp(dot(pa, ba) / dot(ba, ba), 0.0, 1.0); return length(pa - ba * h) - r; }
void main() {
  if (vVis < 0.004) discard;
  vec2 q = vQ; float s1 = vS.x, s2 = vS.y, s3 = fract(s1 * 7.3 + s2 * 3.1);
  float ph = uWalkT * 4.5 * abs(vWalk) + s1 * 6.283;
  float stride = 0.075 * smoothstep(0.05, 0.3, abs(vWalk)) * sin(ph);
  q.x -= sin(uT * (0.9 + s2) + s1 * 20.0) * 0.03 * (1.0 + 2.5 * uDance) * q.y;      // swaying from the feet
  float skirt = step(0.6, s3);
  float d = length(q - vec2(0.0, 0.9)) - 0.083;
  d = min(d, cap(q, vec2(0.0, 0.52), vec2(0.0, 0.7), 0.092 + 0.02 * s2));
  d = min(d, cap(q, vec2(-0.075, 0.735), vec2(0.075, 0.735), 0.052));
  d = min(d, min(cap(q, vec2(-0.045, 0.5), vec2(-0.05 + stride, 0.04), 0.04), cap(q, vec2(0.045, 0.5), vec2(0.05 - stride, 0.04), 0.04)));
  if (skirt > 0.5) d = min(d, max(abs(q.x) - (0.085 + (0.52 - q.y) * 0.32), max(0.27 - q.y, q.y - 0.52)));
  float raise = clamp(uDance * smoothstep(0.3, 0.6, s2) * (0.7 + 0.3 * sin(uT * 3.0 + s1 * 9.0)) + uKickEnv * uDance * 0.25, 0.0, 1.0);
  vec2 hl = mix(vec2(-0.15 - stride * 0.6, 0.47), vec2(-0.2, 1.07), raise), hr = mix(vec2(0.15 + stride * 0.6, 0.47), vec2(0.2, 1.07), raise * step(0.45, s3 + s2 * 0.5));
  d = min(d, min(cap(q, vec2(-0.1, 0.73), hl, 0.03), cap(q, vec2(0.1, 0.73), hr, 0.03)));
  float a = smoothstep(vBlur, -vBlur, d);
  if (a < 0.004) discard;
  // summer clothes, faded
  vec3 cloth = 0.56 + 0.44 * cos(6.283 * (s1 * 3.0 + vec3(0.0, 0.33, 0.67)));
  cloth = mix(cloth, vec3(0.96, 0.93, 0.88), step(0.62, s2));
  cloth = mix(cloth, uHeroCol, vS.w);
  vec3 legs = mix(vec3(0.16, 0.2, 0.36), vec3(0.55, 0.47, 0.36), step(0.6, fract(s3 * 3.7)));
  vec3 head = mix(vec3(0.16, 0.1, 0.08), vec3(0.6, 0.42, 0.26), s3);
  float lo = skirt > 0.5 ? 0.27 : 0.5;
  vec3 col = mix(legs, cloth, smoothstep(lo - 0.02 - vBlur, lo + 0.02 + vBlur, q.y));
  col = mix(col, head, smoothstep(0.8 - vBlur, 0.83 + vBlur, q.y));
  // against the light: dim on this side, burning at the edges
  float rim = smoothstep(-0.022 - vBlur * 0.4, 0.0, d) * (0.3 + 0.7 * smoothstep(0.35, 0.95, q.y));
  vec3 back = col * (uShade * 0.6 + uSunCol * 0.08) * (0.75 + 0.25 * smoothstep(0.0, 0.9, q.y)) + uSunCol * rim * 0.9;
  vec3 front = col * (uSunCol * 1.15 + uShade * 0.2);
  vec3 c = mix(mix(front, back, vBack), col * uShade * 0.45, vGi);
  // the one a song has picked out keeps her colour, whatever the light is doing
  vec3 hz = hazed(c, vP); hz = mix(hz, col * (0.75 + 0.5 * rim) + uSunCol * rim * 0.35, vS.w * 0.75 * step(q.y, 0.84) * step(lo, q.y));
  gl_FragColor = vec4(film(hz), a * vVis * mix(uFade, 1.0, vS.w));
}`;
// their shadows, long across the grass
export const FSH_VS = FIG + `
uniform vec3 uSunDir;
varying vec2 vQ; varying vec3 vP; varying float vVis;
void main() {
  float vis; vec3 base = figBase(vis); float h = aB.x;
  vec2 sd = -normalize(uSunDir.xy + 1e-5); float len = min(h * length(uSunDir.xy) / max(uSunDir.z, 0.05), 3.5);
  vec3 P = base + vec3(-sd.y, sd.x, 0.0) * position.x * 0.36 * h + vec3(sd, 0.0) * (position.y * len - 0.03) + vec3(0.0, 0.0, 0.003);
  vQ = vec2(position.x * 2.0, position.y); vP = P; vVis = vis * min(1.0, 1.4 / (0.4 + len));
  gl_Position = projectionMatrix * modelViewMatrix * vec4(P, 1.0);
}`;
export const FSH_FS = COMMON + `
uniform vec3 uLawn; uniform float uShadowK, uFade;
varying vec2 vQ; varying vec3 vP; varying float vVis;
void main() {
  float a = (1.0 - vQ.x * vQ.x) * smoothstep(0.0, 0.06, vQ.y) * (1.0 - vQ.y) * (1.0 - vQ.y);
  vec3 c = uLawn * uShade * 0.5;
  gl_FragColor = vec4(film(hazed(c, vP)), a * 0.62 * vVis * uShadowK * uFade);
}`;

// trees: a soft crown on a trunk, facing the camera
export const TREE_VS = `
attribute vec4 aP;
uniform vec3 uEye, uSunDir; uniform float uT, uSoft;
varying vec2 vQ; varying vec3 vP; varying float vSeed, vBlur, vBack;
void main() {
  vec3 base = vec3(aP.x, aP.y, ${f(GROUND)}); float h = aP.z;
  vec2 tc = normalize(uEye.xy - base.xy); vec3 right = vec3(-tc.y, tc.x, 0.0);
  vec2 q = vec2(position.x * 1.1, position.y * 1.06 - 0.01);
  float sway = sin(uT * 0.6 + aP.w * 30.0) * 0.012 * q.y * q.y;
  vec3 P = base + right * (q.x + sway) * h + vec3(0.0, 0.0, q.y * h);
  vQ = q; vP = P; vSeed = aP.w; vBlur = 0.012 + length(uEye - base) * 0.006 * exp(uSoft * 0.9) / h;
  vBack = smoothstep(-0.2, 0.6, dot(normalize(base.xy - uEye.xy), normalize(uSunDir.xy)));
  gl_Position = projectionMatrix * modelViewMatrix * vec4(P, 1.0);
}`;
export const TREE_FS = COMMON + `
uniform vec3 uTree; uniform float uFade;
varying vec2 vQ; varying vec3 vP; varying float vSeed, vBlur, vBack;
void main() {
  vec2 q = vQ; float s = vSeed;
  float d = length(q - vec2(0.0, 0.58)) - 0.33;
  d = min(d, length(q - vec2(-0.24 - 0.05 * s, 0.42)) - 0.23);
  d = min(d, length(q - vec2(0.25, 0.45 + 0.06 * s)) - 0.24);
  d = min(d, length(q - vec2(0.05 * s - 0.03, 0.8)) - 0.18);
  d -= (vn(q * 9.0 + s * 31.0) - 0.5) * 0.09 + (vn(q * 23.0 + s * 11.0) - 0.5) * 0.04;
  float crown = smoothstep(vBlur, -vBlur, d);
  float trunk = smoothstep(vBlur * 0.5, -vBlur * 0.5, max(abs(q.x - 0.01 * sin(q.y * 9.0 + s * 5.0)) - 0.022, q.y - 0.4));
  float a = max(crown, trunk * 0.95);
  if (a < 0.004) discard;
  // light through the leaves at the crown's edge, and in holes
  float thru = smoothstep(-0.16, 0.0, d) * 0.8 + smoothstep(0.62, 0.8, vn(q * 17.0 + s * 3.0 + uT * 0.05)) * 0.5;
  vec3 leaf = uTree * (0.55 + 0.45 * vn(q * 6.0 + s * 9.0));
  vec3 back = leaf * (uShade * 0.8) + (uSunCol * vec3(0.9, 1.0, 0.45)) * thru * 0.75;
  vec3 front = leaf * (uSunCol * 1.25 + uShade * 0.15);
  vec3 c = mix(mix(front, back, vBack), vec3(0.16, 0.11, 0.09) * (uShade + 0.2), (1.0 - crown) * trunk);
  gl_FragColor = vec4(film(hazed(c, vP)), a * uFade);
}`;

// out-of-focus highlights: discs of light in the leaves and on the grass
export const BOKEH_VS = `
attribute vec4 aP; attribute vec4 aS;
uniform vec3 uCamR, uCamUp, uEye; uniform float uT, uKickEnv, uPulse, uSpark, uSoft, uHazeK;
varying vec2 vQ; varying vec3 vC; varying float vA;
void main() {
  vec3 base = aP.xyz; float size = aS.x * (1.0 + uKickEnv * uPulse * 0.35) * exp(uSoft * 0.5);
  vec3 P = base + (uCamR * position.x + uCamUp * position.y) * size;
  float tw = pow(0.5 + 0.5 * sin(uT * (0.5 + 2.2 * aS.y) + aS.y * 40.0), 3.0);
  float dist = length(uEye - base);
  vA = tw * uSpark * exp(-dist * uHazeK * 0.35) * smoothstep(0.4, 1.2, dist);
  vC = mix(vec3(1.0, 0.95, 0.8), mix(vec3(0.8, 1.0, 0.6), vec3(1.0, 0.7, 0.8), step(0.5, aS.z)), aS.z > 0.5 ? (aS.z - 0.5) * 1.6 : aS.z * 1.6);
  vQ = position.xy * 2.0;
  gl_Position = projectionMatrix * modelViewMatrix * vec4(P, 1.0);
}`;
export const BOKEH_FS = `
uniform float uExpo;
varying vec2 vQ; varying vec3 vC; varying float vA;
void main() {
  float r = length(vQ); if (r > 1.0) discard;
  float disc = smoothstep(1.0, 0.9, r) * (0.55 + 0.45 * smoothstep(0.55, 0.95, r));
  gl_FragColor = vec4(vC * disc * vA * 0.36 * min(uExpo, 2.0), 1.0);
}`;

// seeds and petals in the air round the deck, lit from behind. They fall; when the day runs backwards, they rise
export const MOTE_VS = `
attribute vec4 aP; attribute vec4 aS;
uniform vec3 uCamR, uCamUp, uEye, uSunDir; uniform float uT, uAirT, uTurb, uPetal;
varying vec2 vQ; varying vec4 vC;
void main() {
  vec3 box = vec3(5.0, 5.0, 1.3);
  float petal = step(aS.z, 0.22);
  vec3 p = aP.xyz + vec3(uAirT * (0.05 + 0.08 * aS.x), uAirT * 0.02 * (aS.y - 0.5), -uAirT * mix(0.012 + 0.02 * aS.y, 0.11 + 0.08 * aS.x, petal));
  p += vec3(sin(uT * (0.7 + aS.x) + aS.y * 30.0), cos(uT * (0.6 + aS.y) + aS.x * 30.0), sin(uT * 0.9 + aS.z * 30.0)) * (0.02 + 0.05 * uTurb) * (1.0 + petal);
  p = mod(p + box * 0.5, box) - box * 0.5 + vec3(0.0, 0.3, 0.57);
  float dist = length(uEye - p);
  float size = (0.004 + 0.007 * aS.x + petal * 0.009) * (1.0 + 2.5 * smoothstep(0.9, 0.2, dist));
  float spin = uAirT * (1.0 + aS.x * 3.0) + aS.y * 6.0;
  vec2 q = position.xy; if (petal > 0.5) q = vec2(q.x * cos(spin) - q.y * sin(spin), (q.x * sin(spin) + q.y * cos(spin)) * (0.35 + 0.65 * abs(sin(spin * 0.7))));
  vec3 P = p + (uCamR * q.x + uCamUp * q.y) * size * 2.0;
  float s = max(0.0, dot(normalize(p - uEye), uSunDir));
  float edge = smoothstep(2.5, 1.8, abs(p.x)) * smoothstep(0.25, 0.5, dist);
  float a = (0.25 + 0.75 * pow(s, 3.0)) * edge * (0.4 + 0.6 / (1.0 + 2.5 * smoothstep(0.9, 0.2, dist)));
  vC = petal > 0.5 ? vec4(mix(vec3(1.0, 0.72, 0.8), vec3(1.0, 0.9, 0.7), aS.y), uPetal * edge) : vec4(vec3(1.0, 0.97, 0.88), a);
  vC.a *= mix(1.0, uPetal, petal);
  vQ = position.xy * 2.0;
  gl_Position = projectionMatrix * modelViewMatrix * vec4(P, 1.0);
}`;
export const MOTE_FS = `
uniform float uSpark;
varying vec2 vQ; varying vec4 vC;
void main() {
  float r = length(vQ); if (r > 1.0) discard;
  float a = smoothstep(1.0, 0.35, r) * vC.a * uSpark;
  gl_FragColor = vec4(vC.rgb * a, 0.0);
}`;

// over the whole frame, screened on: the light leak, the print's faded blacks, dust
export const OVER_VS = `varying vec2 vUv; void main() { vUv = uv; gl_Position = vec4(position.xy, 0.0, 1.0); }`;
export const OVER_FS = `
uniform vec3 uLeakA, uLeakB, uLift; uniform float uLeak, uSide, uT, uDust, uBurn, uAsp;
varying vec2 vUv;
float h21(vec2 p) { p = fract(p * vec2(123.34, 456.21)); p += dot(p, p + 45.32); return fract(p.x * p.y); }
float vn(vec2 p) { vec2 i = floor(p), f = fract(p); f = f * f * (3.0 - 2.0 * f); return mix(mix(h21(i), h21(i + vec2(1, 0)), f.x), mix(h21(i + vec2(0, 1)), h21(i + vec2(1, 1)), f.x), f.y); }
void main() {
  vec2 uv = vUv; float x = uSide > 0.0 ? 1.0 - uv.x : uv.x, k = abs(uSide);
  // the leak: light getting in at the edge of the frame, in soft tongues that breathe
  float n = vn(vec2(uv.y * 1.6 + uT * 0.07, uT * 0.05 + 3.0)), n2 = vn(vec2(uv.y * 4.1 - uT * 0.1, 7.0 + uT * 0.03));
  float reach = uLeak * k * (0.1 + 0.34 * n + 0.1 * n2);
  float a = smoothstep(reach, 0.0, x); a *= a;
  vec3 lc = mix(uLeakA, uLeakB, smoothstep(0.25, 0.9, a)); lc = mix(lc, vec3(1.0, 0.93, 0.8), pow(a, 6.0) * 0.8);
  float al = a * 0.92; vec3 c = lc * al;
  // a fainter one creeping along the top, from the far corner
  float y2 = 1.0 - uv.y, reach2 = uLeak * k * (0.05 + 0.22 * vn(vec2(x * 1.3 - uT * 0.05, 11.0)));
  float b = smoothstep(reach2, 0.0, y2) * smoothstep(0.1, 0.9, 1.0 - x); b *= b;
  b *= 0.55 * (1.0 - al); c += mix(uLeakB, uLeakA, 0.4) * b; al += b;
  float on = min(1.0, uLeak * 1.4); c *= on; al *= on;
  c += uLift * (1.0 - al);
  // the film burning out from the middle
  if (uBurn > 0.001) { float r = length((uv - 0.5) * vec2(uAsp, 1.0)); c += mix(uLeakB, vec3(1.0), 0.5) * uBurn * smoothstep(1.1, 0.0, r + 0.25 * vn(uv * 3.0 + uT * 0.2) - uBurn); }
  // dust and a scratch or two, a different frame's worth 12 times a second
  if (uDust > 0.001) {
    float ft = floor(uT * 12.0);
    vec2 g = uv * vec2(uAsp, 1.0) * 9.0, cell = floor(g);
    float hh = h21(cell + ft * 1.37);
    if (hh > 0.985) { vec2 o = vec2(h21(cell + ft), h21(cell - ft)) * 0.7 + 0.15; c += vec3(0.5) * uDust * smoothstep(0.06, 0.0, length(fract(g) - o) - 0.02 * hh); }
    float sx = h21(vec2(ft, 3.0)); if (h21(vec2(ft, 9.0)) > 0.86) c += vec3(0.3) * uDust * smoothstep(0.0012, 0.0, abs(uv.x - sx + 0.004 * sin(uv.y * 9.0)));
  }
  gl_FragColor = vec4(c, al);
}`;
