// Deadbeat, the bush: the night sky (and the dawn that ends it), the red dirt and the rise the booth stands on, tall
// dry grass, gums and scrub, the far ridge, the crowd (flat silhouettes: nobody in particular), and the smoke.
import * as THREE from 'three';
import { C, U, V, G0, ZT, R_STACK, NBEAM, NSTACK, riseZ, dirAt, rng, GLSL_NOISE, GLSL_LIGHT } from './deadbeat-lib.js';

const SKY_VS = `varying vec3 vD; void main() { vD = position; gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); gl_Position.z = gl_Position.w * 0.99999; }`;
const SKY_FS = `
uniform vec3 uZen, uHorS, uHorA, uSunDir, uSunCol, uMoonDir, uMoonCol, uHaze, uCloudCol, uFarDir, uFarCol; uniform float uT, uStars, uMoon, uGlow, uCloud, uFar, uFarPulse;
varying vec3 vD;
${GLSL_NOISE}
vec3 dbOut(vec3 c) { c = pow(1.0 - exp(-max(c, 0.0) * 1.5), vec3(0.5)); return mix(c, c * c * (3.0 - 2.0 * c), 0.45); }
float stars(vec3 d, float scale) {
  float az = atan(d.y, d.x), el = asin(clamp(d.z, -1.0, 1.0));
  vec2 g = vec2(az * scale / 6.2832 * cos(el) * 2.0, el * scale / 3.1416);
  vec2 c = floor(g), f = fract(g); float h = h21(c);
  if (h < 0.9) return 0.0;
  vec2 q = vec2(h21(c + 3.1), h21(c + 7.7)) * 0.7 + 0.15;
  float tw = 0.6 + 0.4 * sin(uT * (1.0 + h * 3.0) + h * 40.0);
  return smoothstep(0.1, 0.0, length(f - q)) * pow((h - 0.9) / 0.1, 2.0) * tw;
}
void main() {
  vec3 d = normalize(vD); float z = d.z, az = atan(d.y, d.x);
  float sa = max(0.0, dot(normalize(d.xy), normalize(uSunDir.xy)));
  vec3 hor = mix(uHorA, uHorS, pow(sa, 2.5));
  vec3 c = mix(hor, uZen, pow(clamp(z, 0.0, 1.0), 0.42));
  c += uHorS * exp(-max(z, 0.0) * 16.0) * pow(sa, 5.0) * 0.9;          // first light: a hot line along the horizon
  if (z < 0.0) c = hor * exp(z * 8.0);
  float up = smoothstep(0.0, 0.2, z);
  // the southern sky: the galaxy's band across it
  float mw = exp(-pow(dot(d, normalize(vec3(0.5, -0.3, 0.62))) * 3.2, 2.0));
  float st = stars(d, 240.0) + 0.6 * stars(d.yzx, 480.0) + mw * 0.9 * stars(d.zxy, 720.0);
  c += (vec3(0.95, 0.93, 1.0) * st * 1.4 + vec3(0.08, 0.09, 0.14) * mw * smoothstep(0.3, 0.7, fbm(vec2(az * 3.0, z * 5.0) + 3.0))) * uStars * up;
  // thin streaks of high cloud: unseen at night, lit from below when the light comes
  float cl = smoothstep(0.42, 0.75, fbm(vec2(az * 2.5 + uT * 0.003, z * 26.0))) * smoothstep(0.01, 0.07, z) * (1.0 - smoothstep(0.18, 0.5, z));
  c = mix(c, uCloudCol * (0.6 + 0.8 * pow(sa, 2.0)), cl * uCloud);
  if (uMoon > 0.001) {                                                  // the moon, low over the scrub
    float md = acos(clamp(dot(d, uMoonDir), -1.0, 1.0)) / uMoon;
    float disc = smoothstep(1.0, 0.95, md);
    vec3 mt = normalize(cross(vec3(0.0, 0.0, 1.0), uMoonDir));
    vec2 mp = vec2(dot(d - uMoonDir, mt), d.z - uMoonDir.z) / uMoon;
    vec3 mc = uMoonCol * (0.35 + 0.75 * smoothstep(0.3, 0.72, fbm(mp * 1.5 + 7.0))) * (1.0 - 0.3 * md * md);
    c = mix(c, mc, disc * (1.0 - 0.5 * cl * uCloud));
    c += uMoonCol * (exp(-md * 1.2) * 0.2 + exp(-md * 0.4) * 0.045) * (1.0 - disc);
  }
  float s = max(0.0, dot(d, uSunDir));
  c += uSunCol * (smoothstep(0.99955, 0.9998, s) * 6.0 + pow(s, 400.0) * 1.5 + pow(s, 14.0) * 0.3);
  c += uHaze * uGlow * exp(-abs(z) * 8.0);                              // the rig's glow in the smoke, along the horizon
  if (uFar > 0.001) {                                                   // a party a long way off: a dome of light behind the trees, a few beams
    float da = az - atan(uFarDir.y, uFarDir.x); da = atan(sin(da), cos(da));
    float dome = exp(-da * da * 26.0) * exp(-max(z, 0.0) * 20.0), rays = 0.0, phi = atan(da, max(z, 0.0) + 0.012);
    for (int i = 0; i < 4; i++) rays += smoothstep(0.045, 0.0, abs(phi - 0.75 * sin(uT * (0.23 + 0.11 * float(i)) + float(i) * 1.9)));
    c += uFarCol * uFar * (dome * (1.0 + 1.6 * uFarPulse) + rays * exp(-length(vec2(da, z)) * 6.0) * 0.5 * step(0.0, z));
  }
  gl_FragColor = vec4(dbOut(c), 1.0);
}`;

const GROUND_VS = `varying vec3 vP, vN; void main() { vP = position; vN = normal; gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }`;
const GROUND_FS = `
${GLSL_NOISE}
${GLSL_LIGHT}
uniform vec3 uBO[${NBEAM}], uBD[${NBEAM}], uBC[${NBEAM}], uStk[${NSTACK}], uStkCol[${NSTACK}];
uniform vec4 uTable;                                                    // the table's footprint: centre xy, half size
varying vec3 vP, vN;
void main() {
  vec3 N = normalize(vN);
  float r = length(vP.xy - uCtr.xy), n = fbm(vP.xy * 1.3), n2 = fbm(vP.xy * 11.0);
  vec3 alb = mix(vec3(0.16, 0.055, 0.025), vec3(0.30, 0.125, 0.055), n) * (0.7 + 0.6 * n2);    // red earth
  float fl = smoothstep(3.2, 4.2, r) * (1.0 - smoothstep(${(R_STACK + 0.3).toFixed(1)}, ${(R_STACK + 2.5).toFixed(1)}, r));
  alb = mix(alb, alb * vec3(0.72, 0.7, 0.7), fl * 0.6);                 // the trampled floor
  alb = mix(alb, vec3(0.22, 0.17, 0.08) * (0.6 + 0.8 * n2), smoothstep(${(R_STACK + 1).toFixed(1)}, ${(R_STACK + 6).toFixed(1)}, r) * (0.35 + 0.65 * n));   // litter and dead grass further out
  vec3 L = dbLight(vP, N, 0.12);
  for (int i = 0; i < ${NSTACK}; i++) { vec2 d = vP.xy - uStk[i].xy; L += uStkCol[i] * exp(-dot(d, d) * 0.2); }           // the pools the stacks' washes throw
  for (int i = 0; i < ${NBEAM}; i++) {                                    // where the moving heads land
    vec3 w = vP - uBO[i]; float t = dot(w, uBD[i]); vec3 off = w - uBD[i] * t; float rad = 0.1 + t * 0.045;
    L += uBC[i] * exp(-dot(off, off) / (rad * rad)) * step(0.0, t) * max(dot(N, -uBD[i]), 0.0) * 14.0 / (1.0 + t * t * 0.03);
  }
  vec2 tb = abs(vP.xy - uTable.xy) - uTable.zw; float td = length(max(tb, 0.0));
  L *= 0.3 + 0.7 * smoothstep(0.0, 0.45, td + max(0.0, ${ZT.toFixed(2)} - vP.z) * 2.0);                                       // the table's shadow
  gl_FragColor = vec4(dbOut(dbFog(alb * L, vP)), 1.0);
}`;

const RIDGE_VS = `varying vec3 vP; void main() { vP = position; gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }`;
const RIDGE_FS = `${GLSL_LIGHT}
varying vec3 vP;
void main() { vec3 c = vec3(0.05, 0.055, 0.045) * (uAmb * 0.8 + uSunCol * 0.08); gl_FragColor = vec4(dbOut(mix(c, uHaze, 0.35)), 1.0); }`;

const TREE_VS = `
${GLSL_LIGHT}
attribute vec3 aPos; attribute vec4 aTS;                                // base; width, height, which tree, a random number
varying vec2 vUv; varying vec3 vP; varying float vRnd, vY;
void main() {
  vec3 toE = uEye - aPos; vec3 right = normalize(vec3(-toE.y, toE.x, 0.0));
  float y = position.y + 0.5;
  vec3 p = aPos + right * (position.x * aTS.x + sin(uTime * 0.6 + aTS.w * 40.0) * 0.012 * aTS.y * y * y) + vec3(0.0, 0.0, y * aTS.y);
  vUv = vec2((aTS.z + 0.02 + uv.x * 0.96) / 6.0, uv.y); vP = p; vRnd = aTS.w; vY = y;
  gl_Position = projectionMatrix * viewMatrix * vec4(p, 1.0);
}`;
const TREE_FS = `
${GLSL_LIGHT}
uniform sampler2D uTree;
varying vec2 vUv; varying vec3 vP; varying float vRnd, vY;
void main() {
  vec4 t = texture2D(uTree, vUv);
  float a = clamp((t.a - 0.42) / max(fwidth(t.a), 0.0001) + 0.5, 0.0, 1.0);
  if (a < 0.02) discard;
  float bark = t.r / max(t.r + t.g, 0.001);
  vec3 alb = mix(vec3(0.05, 0.075, 0.035), vec3(0.5, 0.44, 0.36) * (0.75 + 0.5 * vRnd), bark);    // grey-green leaves, pale bark
  vec3 toE = normalize(uEye - vP);
  vec3 col = alb * dbLight(vP, normalize(vec3(toE.xy, 0.25)), 0.55);
  col += (1.0 - bark) * uSunCol * 0.05 * max(0.0, -dot(toE, uSunDir));           // leaves with the sun behind them
  gl_FragColor = vec4(dbOut(dbFog(col, vP)), a);
}`;

const GRASS_VS = `
${GLSL_LIGHT}
attribute vec3 aBase; attribute vec4 aG;                                // root; lean direction, lean, height, a random number
attribute float aT, aSide;
uniform float uWind, uThump;
varying vec3 vP; varying float vT, vRnd;
void main() {
  float t = aT, h = aG.z;
  vec2 ld = vec2(cos(aG.x), sin(aG.x));
  float sway = sin(uTime * (1.1 + aG.w) + aBase.x * 2.1 + aBase.y * 1.7) * uWind + uThump * sin(aG.w * 51.0);   // wind, and the bass shaking it
  float lean = aG.y + sway * 0.16;
  vec3 p = aBase + vec3(ld * lean * h * t * t, h * t * (1.0 - 0.22 * abs(lean) * t));
  vec3 tang = normalize(vec3(ld * lean * 2.0 * t, 1.0));
  vec3 toE = uEye - p; float dist = length(toE);
  vec3 side = normalize(cross(tang, toE));
  float head = fract(aG.w * 9.7) > 0.6 ? smoothstep(0.7, 0.86, t) * (1.0 - smoothstep(0.9, 1.0, t)) * 1.6 : 0.0;   // some carry a seed head
  float w = (0.0045 + 0.004 * aG.w) * (1.0 - t * 0.92 + head) * max(1.0, dist * 0.22) * smoothstep(0.15, 0.5, dist);
  p += side * aSide * w;
  vP = p; vT = t; vRnd = aG.w;
  gl_Position = projectionMatrix * viewMatrix * vec4(p, 1.0);
}`;
const GRASS_FS = `
${GLSL_LIGHT}
varying vec3 vP; varying float vT, vRnd;
void main() {
  vec3 alb = mix(vec3(0.2, 0.14, 0.05), vec3(0.62, 0.5, 0.22), vT) * (0.7 + 0.6 * vRnd);          // straw: darker at the root
  alb = mix(alb, vec3(0.16, 0.22, 0.07), step(0.86, fract(vRnd * 5.3)) * 0.6);
  vec3 toE = normalize(uEye - vP);
  vec3 L = dbLight(vP, normalize(vec3(toE.xy, 0.5)), 0.6);
  vec2 q = vP.xy - uCtr.xy; float r = length(q);
  L += uWashCol * 0.5 * vT * exp(-abs(r - 6.0) * 0.4) + uSunCol * 0.4 * vT * max(0.0, -dot(toE, uSunDir));   // light coming through the blades
  gl_FragColor = vec4(dbOut(dbFog(alb * L * (0.35 + 0.65 * vT), vP)), 1.0);
}`;

const CROWD_VS = `
${GLSL_LIGHT}
attribute vec3 aPos; attribute vec4 aC;                                 // feet; height, pose pair, a random number, its place in the queue
uniform float uBeat, uDance, uCrowd;
varying vec2 vUv; varying vec3 vP; varying float vRnd;
void main() {
  float show = smoothstep(aC.w, aC.w + 0.05, uCrowd);
  vec3 toE = uEye - aPos; float hl = length(toE.xy); vec3 hd = vec3(toE.xy / max(hl, 0.001), 0.0);
  vec3 right = vec3(-hd.y, hd.x, 0.0);
  float tilt = 0.5 * atan(max(toE.z, 0.0), hl);                         // seen from above, the cards lean back toward the camera
  vec3 up = vec3(0.0, 0.0, cos(tilt)) - hd * sin(tilt);
  float b = uBeat * (aC.z > 0.72 ? 0.5 : 1.0) + aC.z * 0.37, x = fract(b);
  float hop = 4.0 * x * (1.0 - x) * uDance * (0.03 + 0.13 * fract(aC.z * 7.3));     // off the ground between beats, landing on them
  float sway = sin((floor(b) + smoothstep(0.0, 1.0, x)) * 3.14159 + aC.z * 20.0);
  float y = position.y + 0.5;
  vec3 p = aPos + (right * (position.x * 1.15 + sway * 0.1 * y * uDance) + up * y * 2.3) * aC.x * show + vec3(0.0, 0.0, hop * show);
  float pose = aC.y * 2.0 + mod(floor(b * 0.5 + aC.z * 3.0), 2.0);       // two poses each, swapped every other beat
  vUv = vec2((pose + 0.01 + uv.x * 0.98) / 8.0, uv.y); vP = p; vRnd = aC.z;
  gl_Position = projectionMatrix * viewMatrix * vec4(p, 1.0);
}`;
const CROWD_FS = `
${GLSL_LIGHT}
uniform sampler2D uFig;
varying vec2 vUv; varying vec3 vP; varying float vRnd;
void main() {
  float a = texture2D(uFig, vUv).a;
  float cov = clamp((a - 0.45) / max(fwidth(a), 0.0001) + 0.5, 0.0, 1.0);
  if (cov < 0.02) discard;
  vec3 toE = normalize(uEye - vP);
  vec3 alb = mix(vec3(0.035, 0.03, 0.03), vec3(0.2, 0.15, 0.12), fract(vRnd * 13.7) * fract(vRnd * 13.7));
  vec3 col = alb * (dbLight(vP, normalize(vec3(toE.xy, 0.35)), 0.55) - uAmb * 0.55);     // against a bright sky they stay dark
  // the edge catches whatever burns behind them: the stacks' wash, the strobe, the first sun
  float top = clamp((a - texture2D(uFig, vUv + vec2(0.0, 0.006)).a) * 1.3, 0.0, 1.0);      // heads, shoulders, raised arms
  vec2 q = vP.xy - uCtr.xy; vec3 sd = uStrobePos - vP;
  col *= 0.45 + 0.55 * smoothstep(0.2, 0.8, vUv.y);
  col += top * (uWashCol * 2.2 * exp(-abs(length(q) - 6.0) * 0.3) + uStrobeCol * 1.6 / (1.0 + dot(sd, sd) * 0.1) + uSunCol * 0.5 + uAmb * 0.6);
  gl_FragColor = vec4(dbOut(dbFog(col, vP)), cov);
}`;

const SMOKE_VS = `
${GLSL_LIGHT}
attribute vec4 aP;                                                      // orbit radius, start angle, height, a random number
uniform float uSmokeT, uSmoke, uLow;
varying vec2 vUv; varying vec3 vP; varying float vRnd;
void main() {
  float ang = aP.y + uSmokeT * (0.02 + 0.03 * aP.w) * (fract(aP.w * 7.0) > 0.5 ? 1.0 : -1.0);
  float rr = aP.x + sin(uSmokeT * 0.05 + aP.w * 20.0) * 0.8;
  vec3 ctr = vec3(uCtr.xy + vec2(cos(ang), sin(ang)) * rr, aP.z + sin(uSmokeT * 0.07 + aP.w * 9.0) * 0.25);
  float size = (1.7 + 2.8 * fract(aP.w * 3.1)) * (0.7 + 0.3 * uSmoke + 0.35 * uLow);    // it swells with the bass
  vec3 toE = normalize(uEye - ctr); vec3 right = normalize(vec3(-toE.y, toE.x, 0.0)); vec3 up = cross(toE, right);
  vec3 p = ctr + (right * position.x + up * position.y) * size;
  vUv = uv; vP = p; vRnd = aP.w;
  gl_Position = projectionMatrix * viewMatrix * vec4(p, 1.0);
}`;
const SMOKE_FS = `
${GLSL_NOISE}
${GLSL_LIGHT}
uniform float uSmokeT, uSmoke;
varying vec2 vUv; varying vec3 vP; varying float vRnd;
void main() {
  vec2 q = vUv * 2.0 - 1.0; float d = length(q);
  float n = fbm(q * 1.5 + vRnd * 37.0 + vec2(uSmokeT * 0.05, uSmokeT * 0.02));
  float dens = smoothstep(1.0, 0.15, d) * smoothstep(0.28, 0.78, n + 0.3 * (1.0 - d));
  float a = dens * min(uSmoke, 1.5) * 0.4 * smoothstep(${(G0 + 0.05).toFixed(2)}, ${(G0 + 1.0).toFixed(2)}, vP.z) * smoothstep(0.6, 1.8, distance(vP, uEye));
  if (a < 0.004) discard;
  vec2 qq = vP.xy - uCtr.xy;
  vec3 de = uEye - vP, ds = uStrobePos - vP;                              // smoke scatters every light there is (the flashes less: they are over before it shows)
  vec3 col = vec3(0.5) * (dbLight(vP, normalize(de), 1.0) - 0.72 * uFlashCol / (1.0 + dot(de, de) * 0.22) - 0.8 * uStrobeCol / (1.0 + dot(ds, ds) * 0.1)) + uWashCol * 0.9 * exp(-abs(length(qq) - 6.3) * 0.55) + uHaze * 0.6;
  gl_FragColor = vec4(dbOut(col) * a, a * 0.55);
}`;

const BAT_VS = `
${GLSL_LIGHT}
attribute vec4 aBat; attribute float aW;                                // orbit radius, where on it, height, a random number; how far out the wing this vertex is
varying vec3 vP;
void main() {
  float sg = fract(aBat.w * 5.0) > 0.5 ? 1.0 : -1.0, sp = (1.6 + 1.4 * aBat.w) / aBat.x;
  float a = aBat.y + uTime * sp * sg, rr = aBat.x * (1.0 + 0.18 * sin(uTime * 0.23 + aBat.w * 30.0));
  vec3 ctr = vec3(uCtr.xy + vec2(cos(a), sin(a)) * rr, aBat.z + 0.5 * sin(uTime * 0.7 + aBat.w * 17.0));
  vec2 fw = vec2(-sin(a), cos(a)) * sg, rt = vec2(fw.y, -fw.x);
  float sc = 0.55 + 0.6 * aBat.w, flap = sin(uTime * (7.0 + 3.0 * aBat.w) + aBat.w * 40.0);
  vec3 p = ctr + vec3(rt * position.x + fw * position.y, aW * aW * flap * 0.3 - aW * 0.05) * sc;
  vP = p; gl_Position = projectionMatrix * viewMatrix * vec4(p, 1.0);
}`;
const BAT_FS = `
${GLSL_LIGHT}
varying vec3 vP;
void main() { gl_FragColor = vec4(dbOut(dbFog(vec3(0.03, 0.022, 0.02) * dbLight(vP, normalize(uEye - vP), 0.7), vP)), 1.0); }`;

// ---- drawn once, on canvases ----
function treeAtlas() {
  const W = 256, H = 512, N = 6, cv = document.createElement('canvas'); cv.width = W * N; cv.height = H;
  const k = cv.getContext('2d'), R = rng(77);
  const BARK = 'rgb(255,0,0)', LEAF = 'rgb(0,255,0)';
  const clump = (x, y, r, n) => {                                       // gum leaves hang: thin, steep
    k.fillStyle = LEAF;
    for (let i = 0; i < n; i++) {
      const a = R() * 6.283, d = Math.sqrt(R()) * r;
      k.save(); k.translate(x + Math.cos(a) * d, y + Math.sin(a) * d * 0.62); k.rotate(1.2 + (R() - 0.5) * 1.3);
      k.beginPath(); k.ellipse(0, 0, 5 + R() * 6, 1.5 + R() * 1.3, 0, 0, 6.283); k.fill(); k.restore();
    }
  };
  const limb = (x, y, ang, len, w, depth, leafy) => {
    const x1 = x + Math.cos(ang) * len, y1 = y - Math.sin(ang) * len, mx = (x + x1) / 2 + (R() - 0.5) * len * 0.2, my = (y + y1) / 2 + (R() - 0.5) * len * 0.1;
    k.strokeStyle = BARK; k.lineWidth = w; k.lineCap = 'round'; k.beginPath(); k.moveTo(x, y); k.quadraticCurveTo(mx, my, x1, y1); k.stroke();
    if (depth <= 0 || w < 1.3) { if (leafy) clump(x1, y1, 16 + R() * 14, 26 * leafy); return; }
    const n = R() < 0.35 ? 3 : 2;
    for (let i = 0; i < n; i++) limb(x1, y1, ang + (i - (n - 1) / 2) * (0.5 + R() * 0.5) + (R() - 0.5) * 0.3, len * (0.5 + R() * 0.25), w * 0.62, depth - 1, leafy);
    if (leafy && depth <= 2) clump(x1, y1, 14 + R() * 10, 14 * leafy);
  };
  for (let c = 0; c < N; c++) {
    k.save(); k.beginPath(); k.rect(c * W + 2, 0, W - 4, H); k.clip(); k.translate(c * W, 0);
    const bx = W / 2, by = H + 2;
    if (c === 0) limb(bx, by, 1.62, 240, 13, 4, 1);                                                // a tall gum: bare trunk, the crown high up
    else if (c === 1) { limb(bx - 14, by, 1.4, 170, 12, 4, 1); limb(bx - 2, by - 110, 2.2, 100, 6, 3, 1); }   // a leaning, forked one
    else if (c === 2) for (let i = 0; i < 4; i++) limb(bx + (i - 1.5) * 9, by, 1.57 - (i - 1.5) * 0.24, 150 + R() * 60, 6, 3, 1.2);   // mallee: many stems from the ground
    else if (c === 3) for (let i = 0; i < 6; i++) limb(bx + (i - 2.5) * 12, by, 1.57 - (i - 2.5) * 0.3, 120 + R() * 90, 5, 3, 1.5);    // scrub
    else if (c === 4) limb(bx, by, 1.52, 210, 12, 4, 0);                                           // a dead one
    else {                                                                                         // a grass tree: black trunk, a head of needles, one tall spike
      k.strokeStyle = 'rgb(60,0,0)'; k.lineWidth = 26; k.lineCap = 'butt'; k.beginPath(); k.moveTo(bx, by); k.lineTo(bx + 5, by - 190); k.stroke();
      k.strokeStyle = LEAF; k.lineWidth = 1.4;
      for (let i = 0; i < 300; i++) { const a = R() * 3.6 - 0.23, l = 70 + R() * 45, cx = bx + 5, cy = by - 200; k.beginPath(); k.moveTo(cx, cy); k.quadraticCurveTo(cx + Math.cos(a) * l * 0.7, cy - Math.sin(a) * l * 0.9, cx + Math.cos(a) * l, cy - Math.sin(a) * l * 0.55 + 28); k.stroke(); }
      k.strokeStyle = 'rgb(160,0,0)'; k.lineWidth = 5; k.lineCap = 'round'; k.beginPath(); k.moveTo(bx + 5, by - 200); k.lineTo(bx + 12, by - 440); k.stroke();
    }
    k.restore();
  }
  const t = new THREE.CanvasTexture(cv); t.colorSpace = THREE.NoColorSpace; t.anisotropy = 4;
  return t;
}
function crowdAtlas() {
  const W = 256, H = 512, cv = document.createElement('canvas'); cv.width = W * 8; cv.height = H;
  const k = cv.getContext('2d'), m = H / 2.3;                           // pixels per metre: the card is 2.3 m tall
  // arms: [upper, fore] angles from hanging straight down (0) round to straight up (pi), left then right
  const poses = [[[2.6, 2.9], [2.6, 2.9]], [[0.7, 2.2], [0.6, 2.0]], [[2.9, 3.0], [0.5, 1.7]], [[0.5, 1.7], [2.9, 3.0]],
    [[1.8, 2.7], [1.8, 2.7]], [[1.0, 1.3], [1.1, 0.9]], [[3.0, 3.1], [0.25, 0.4]], [[2.8, 3.35], [2.8, 3.35]]];
  k.filter = 'blur(2px)'; k.strokeStyle = k.fillStyle = '#fff'; k.lineCap = 'round'; k.lineJoin = 'round';
  poses.forEach((pose, i) => {
    k.save(); k.beginPath(); k.rect(i * W + 3, 0, W - 6, H); k.clip(); k.translate(i * W + W / 2, H);
    const lean = (i % 3 - 1) * 0.04 * m, hip = 0.93 * m, sh = 1.43 * m, head = 1.63 * m;
    k.lineWidth = 0.16 * m;                                               // legs
    for (const sx of [-1, 1]) { k.beginPath(); k.moveTo(sx * 0.09 * m, -hip); k.lineTo(sx * (0.12 + 0.05 * (i % 2)) * m, -0.02 * m); k.stroke(); }
    k.lineWidth = 0.07 * m;                                               // torso: wide at the shoulder
    k.beginPath(); k.moveTo(-0.13 * m, -hip); k.lineTo(0.13 * m, -hip); k.lineTo(0.2 * m + lean, -sh); k.lineTo(-0.2 * m + lean, -sh); k.closePath(); k.stroke(); k.fill();
    k.lineWidth = 0.09 * m; k.beginPath(); k.moveTo(lean, -sh); k.lineTo(lean * 1.4, -head); k.stroke();   // neck
    k.beginPath(); k.ellipse(lean * 1.5, -head - 0.01 * m, 0.092 * m, 0.11 * m, 0, 0, 6.283); k.fill();   // head
    if (i % 4 === 1) { k.beginPath(); k.ellipse(lean * 1.5, -head + 0.06 * m, 0.13 * m, 0.16 * m, 0, 0, 6.283); k.fill(); }            // long hair
    if (i % 4 === 2) { k.beginPath(); k.ellipse(lean * 1.5, -head - 0.07 * m, 0.17 * m, 0.035 * m, 0, 0, 6.283); k.fill(); }            // a wide hat
    if (i % 4 === 3) { k.beginPath(); k.arc(lean * 1.5 + 0.02 * m, -head - 0.13 * m, 0.05 * m, 0, 6.283); k.fill(); }                  // a bun
    pose.forEach(([ua, fa], j) => {
      const sx = j ? 1 : -1, x0 = sx * 0.22 * m + lean, y0 = -sh + 0.03 * m;
      const x1 = x0 + sx * Math.sin(ua) * 0.29 * m, y1 = y0 + Math.cos(ua) * 0.29 * m, x2 = x1 + sx * Math.sin(fa) * 0.3 * m * (fa > 3.2 ? -1 : 1), y2 = y1 + Math.cos(fa) * 0.3 * m;
      k.lineWidth = 0.095 * m; k.beginPath(); k.moveTo(x0, y0); k.lineTo(x1, y1); k.stroke();
      k.lineWidth = 0.07 * m; k.beginPath(); k.moveTo(x1, y1); k.lineTo(x2, y2); k.stroke();
      k.beginPath(); k.arc(x2 + (x2 - x1) * 0.12, y2 + (y2 - y1) * 0.12, 0.036 * m, 0, 6.283); k.fill();   // a hand
    });
    k.restore();
  });
  const t = new THREE.CanvasTexture(cv); t.colorSpace = THREE.NoColorSpace; t.generateMipmaps = true;
  return t;
}

export class Bush {
  // LU: the shared lights; beamU / stackU: where the moving heads point and what the stacks throw, for the dirt
  constructor(root, LU, beamU, stackU, table) {
    this.root = root; this.LU = LU;
    const R = rng(4242), tmp = new THREE.Vector3();
    const add = (mesh, order = 0) => { mesh.frustumCulled = false; mesh.renderOrder = order; root.add(mesh); return mesh; };
    const col = () => ({ value: new THREE.Color(0, 0, 0) });

    // sky
    this.skyU = { uZen: col(), uHorS: col(), uHorA: col(), uSunDir: LU.uSunDir, uSunCol: col(), uMoonDir: { value: new THREE.Vector3() }, uMoonCol: col(), uHaze: LU.uHaze, uCloudCol: col(),
      uT: { value: 0 }, uStars: { value: 1 }, uMoon: { value: 0 }, uGlow: { value: 0 }, uCloud: { value: 0 }, uFarDir: { value: new THREE.Vector3() }, uFarCol: col(), uFar: { value: 0 }, uFarPulse: { value: 0 } };
    const sky = add(new THREE.Mesh(new THREE.SphereGeometry(120, 48, 24), new THREE.ShaderMaterial({ vertexShader: SKY_VS, fragmentShader: SKY_FS, uniforms: this.skyU, side: THREE.BackSide, depthWrite: false, depthTest: true })), -10);
    sky.position.copy(C);

    // the dirt: a polar grid, fine over the rise
    {
      const radii = [0]; for (let r = 0.12; r < 5; r += 0.125) radii.push(r); for (let r = 5; r < 125; r *= 1.13) radii.push(r);
      const SEG = 128, pos = [], idx = [];
      const zAt = (r, a) => riseZ(r) + (r > 9 ? Math.min(1, (r - 9) / 14) * (0.35 * Math.sin(a * 3 + 1) + 0.25 * Math.sin(a * 7 + r * 0.21)) : 0);
      radii.forEach((r, i) => { for (let j = 0; j <= SEG; j++) { const a = j / SEG * Math.PI * 2; pos.push(C.x + Math.cos(a) * r, C.y + Math.sin(a) * r, zAt(r, a)); } if (i) for (let j = 0; j < SEG; j++) { const a0 = (i - 1) * (SEG + 1) + j, b0 = i * (SEG + 1) + j; idx.push(a0, b0, b0 + 1, a0, b0 + 1, a0 + 1); } });
      const g = new THREE.BufferGeometry(); g.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3)); g.setIndex(idx); g.computeVertexNormals();
      this.groundU = { ...LU, ...beamU, ...stackU, uTable: { value: table } };
      add(new THREE.Mesh(g, new THREE.ShaderMaterial({ vertexShader: GROUND_VS, fragmentShader: GROUND_FS, uniforms: this.groundU })));
    }
    // the far ridge
    {
      const N = 256, pos = [], idx = [];
      for (let i = 0; i <= N; i++) { const a = i / N * Math.PI * 2, h = 3.5 + 2.2 * Math.sin(a * 3 + 0.5) + 1.4 * Math.sin(a * 7 + 2) + 0.8 * Math.sin(a * 17) + 0.5 * Math.sin(a * 41 + 1); pos.push(C.x + Math.cos(a) * 100, C.y + Math.sin(a) * 100, G0 - 2, C.x + Math.cos(a) * 100, C.y + Math.sin(a) * 100, G0 + Math.max(0.5, h)); if (i < N) idx.push(i * 2, i * 2 + 2, i * 2 + 1, i * 2 + 1, i * 2 + 2, i * 2 + 3); }
      const g = new THREE.BufferGeometry(); g.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3)); g.setIndex(idx);
      add(new THREE.Mesh(g, new THREE.ShaderMaterial({ vertexShader: RIDGE_VS, fragmentShader: RIDGE_FS, uniforms: LU, side: THREE.DoubleSide })), -9);
    }
    const card = () => { const g = new THREE.InstancedBufferGeometry(); const p = new THREE.PlaneGeometry(1, 1); g.index = p.index; g.setAttribute('position', p.getAttribute('position')); g.setAttribute('uv', p.getAttribute('uv')); return g; };

    // trees: a few tall gums close in, scrub and mallee behind; kept low straight ahead, where the sun comes up
    {
      const aPos = [], aTS = [];
      const put = (ang, r, kind, h, w) => { dirAt(ang, tmp); const x = C.x + tmp.x * r, y = C.y + tmp.y * r; aPos.push(x, y, G0 - 0.15 + (r > 9 ? Math.min(1, (r - 9) / 14) * 0.3 : 0)); aTS.push(w, h, kind, R()); };
      for (let i = 0; i < 16; i++) { const ang = (i + R() * 0.7) / 16 * Math.PI * 2, ahead = Math.abs(Math.sin(ang)) < 0.4; if (ahead) continue; const kind = R() < 0.2 ? 4 : R() < 0.6 ? 0 : 1, h = 9 + R() * 6; put(ang, R_STACK + 3.5 + R() * 5, kind, h, h * 0.5); }
      for (let i = 0; i < 150; i++) {
        const ang = R() * Math.PI * 2, r = R_STACK + 4 + Math.pow(R(), 1.4) * 42, ahead = Math.abs(Math.sin(ang)) < 0.4;
        const q = R(), kind = q < 0.34 ? 2 : q < 0.7 ? 3 : q < 0.8 ? 5 : q < 0.9 ? 1 : 0;
        let h = kind === 5 ? 2.2 + R() * 1.6 : kind === 3 ? 2.5 + R() * 3 : kind === 2 ? 4 + R() * 4 : 7 + R() * 7;
        if (ahead) h = Math.min(h, 2.2 + r * 0.07);
        put(ang, r, kind, h, h * 0.5);
      }
      const g = card(); g.setAttribute('aPos', new THREE.InstancedBufferAttribute(new Float32Array(aPos), 3)); g.setAttribute('aTS', new THREE.InstancedBufferAttribute(new Float32Array(aTS), 4));
      g.instanceCount = aPos.length / 3;
      add(new THREE.Mesh(g, new THREE.ShaderMaterial({ vertexShader: TREE_VS, fragmentShader: TREE_FS, uniforms: { ...LU, uTree: { value: treeAtlas() } }, side: THREE.DoubleSide, alphaToCoverage: true })));
    }
    // grass: clumps on the rise round the booth, and tall stuff out past the stacks
    {
      const SEGS = 5, pos = [], aT = [], aSide = [], idx = [];
      for (let i = 0; i <= SEGS; i++) { for (const sd of [-1, 1]) { pos.push(0, 0, 0); aT.push(i / SEGS); aSide.push(sd); } if (i) { const a = (i - 1) * 2; idx.push(a, a + 1, a + 2, a + 1, a + 3, a + 2); } }
      const aBase = [], aG = [];
      const clumpAt = (x, y, z, n, hMin, hMax, zMax) => {
        for (let i = 0; i < n; i++) {
          const a = R() * 6.283, d = R() * 0.13; let h = hMin + R() * (hMax - hMin); if (zMax != null) h = Math.min(h, zMax - z);
          if (h < 0.08) continue;
          aBase.push(x + Math.cos(a) * d, y + Math.sin(a) * d, z - 0.02); aG.push(a + (R() - 0.5) * 0.8, 0.12 + R() * 0.55, h, R());
        }
      };
      for (let i = 0; i < 420; i++) {                                     // on the rise: never taller than the table top
        const a = R() * 6.283, r = 1.12 + Math.pow(R(), 0.8) * 2.5, x = C.x + Math.cos(a) * r, y = C.y + Math.sin(a) * r;
        if (Math.abs(x - table.x) < table.z + 0.25 && Math.abs(y - table.y) < table.w + 0.3) continue;
        clumpAt(x, y, riseZ(r), 12 + Math.floor(R() * 12), 0.22, 0.5 + 0.35 * R(), -0.2);
      }
      for (let i = 0; i < 420; i++) { const a = R() * 6.283, r = R_STACK + 0.8 + Math.pow(R(), 1.5) * 12, x = C.x + Math.cos(a) * r, y = C.y + Math.sin(a) * r; clumpAt(x, y, G0 + (r > 9 ? Math.min(1, (r - 9) / 14) * 0.3 : 0), 10 + Math.floor(R() * 10), 0.5, 1.5); }
      const g = new THREE.InstancedBufferGeometry();
      g.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3)); g.setAttribute('aT', new THREE.Float32BufferAttribute(aT, 1)); g.setAttribute('aSide', new THREE.Float32BufferAttribute(aSide, 1)); g.setIndex(idx);
      g.setAttribute('aBase', new THREE.InstancedBufferAttribute(new Float32Array(aBase), 3)); g.setAttribute('aG', new THREE.InstancedBufferAttribute(new Float32Array(aG), 4));
      g.instanceCount = aBase.length / 3;
      this.grassU = { ...LU, uWind: { value: 0.3 }, uThump: { value: 0 } };
      add(new THREE.Mesh(g, new THREE.ShaderMaterial({ vertexShader: GRASS_VS, fragmentShader: GRASS_FS, uniforms: this.grassU, side: THREE.DoubleSide })));
    }
    // the crowd, on the floor between the rise and the stacks
    {
      const aPos = [], aC = [], N = 230; this.dancers = [];
      for (let i = 0; i < N; i++) {
        const a = R() * 6.283, r = 3.35 + Math.sqrt(R()) * (R_STACK - 0.9 - 3.35), x = C.x + Math.cos(a) * r, y = C.y + Math.sin(a) * r, h = 0.86 + R() * 0.2, rnd = R(), rank = Math.pow(R(), 0.8) * 0.94;
        aPos.push(x, y, G0); aC.push(h, Math.floor(R() * 4), rnd, rank);
        this.dancers.push({ x, y, h, rnd, rank });
      }
      const g = card(); g.setAttribute('aPos', new THREE.InstancedBufferAttribute(new Float32Array(aPos), 3)); g.setAttribute('aC', new THREE.InstancedBufferAttribute(new Float32Array(aC), 4));
      g.instanceCount = N;
      this.crowdU = { ...LU, uFig: { value: crowdAtlas() }, uBeat: { value: 0 }, uDance: { value: 0 }, uCrowd: { value: 0 } };
      this.crowd = add(new THREE.Mesh(g, new THREE.ShaderMaterial({ vertexShader: CROWD_VS, fragmentShader: CROWD_FS, uniforms: this.crowdU, side: THREE.DoubleSide, alphaToCoverage: true })));
    }
    // flying foxes, out over the clearing
    {
      const pos = [], aW = [], v = (x, y) => { pos.push(x, y, 0); aW.push(Math.abs(x) / 0.5); };
      for (const s of [-1, 1]) { v(0, 0.07); v(s * 0.5, 0.05); v(s * 0.25, -0.03); v(0, 0.07); v(s * 0.25, -0.03); v(0, -0.09); v(s * 0.5, 0.05); v(s * 0.43, -0.07); v(s * 0.25, -0.03); v(s * 0.25, -0.03); v(s * 0.12, -0.1); v(0, -0.09); }
      const aBat = [], N = 40;
      for (let i = 0; i < N; i++) aBat.push(4 + R() * 13, R() * 6.283, 0.7 + R() * 3.2, R());
      const g = new THREE.InstancedBufferGeometry(); g.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3)); g.setAttribute('aW', new THREE.Float32BufferAttribute(aW, 1));
      g.setAttribute('aBat', new THREE.InstancedBufferAttribute(new Float32Array(aBat), 4)); g.instanceCount = 0;
      this.bats = add(new THREE.Mesh(g, new THREE.ShaderMaterial({ vertexShader: BAT_VS, fragmentShader: BAT_FS, uniforms: LU, side: THREE.DoubleSide })));
      this.batN = N;
    }
    // smoke: slow puffs that drift round the floor
    {
      const aP = [], N = 64;
      for (let i = 0; i < N; i++) aP.push(i % 3 ? R_STACK - 2.2 + R() * 3.4 : 2.9 + R() * 7.5, R() * 6.283, G0 + 0.9 + R() * 2.8, R());
      const g = card(); g.setAttribute('aP', new THREE.InstancedBufferAttribute(new Float32Array(aP), 4)); g.instanceCount = N;
      this.smokeU = { ...LU, uSmokeT: { value: 0 }, uSmoke: { value: 0 }, uLow: { value: 0 } };
      this.smoke = add(new THREE.Mesh(g, new THREE.ShaderMaterial({ vertexShader: SMOKE_VS, fragmentShader: SMOKE_FS, uniforms: this.smokeU, transparent: true, depthWrite: false, side: THREE.DoubleSide,
        blending: THREE.CustomBlending, blendSrc: THREE.OneFactor, blendDst: THREE.OneMinusSrcAlphaFactor, blendEquation: THREE.AddEquation })), 5);
    }
  }
}
