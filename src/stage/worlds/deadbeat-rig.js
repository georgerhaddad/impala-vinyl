// Deadbeat, the rig: the trestle table the deck stands on (mixer, record crate, the work-light on its tripod), the
// speaker stacks and their cones, the moving heads' beams, the lasers, and every small light there is, each drawn
// twice: once sharp, and once as the streak a slow shutter leaves when the camera is shaken.
import * as THREE from 'three';
import { C, U, V, Z, G0, ZT, R_STACK, NBEAM, NSTACK, riseZ, dirAt, rng, GLSL_NOISE, GLSL_LIGHT } from './deadbeat-lib.js';

// the stacks: where (radians round from straight ahead), how many cabinets wide and high, how far out
const STACKS = [[-0.63, 3, 5, 0], [0.56, 3, 6, 0.4], [1.68, 2, 5, -0.3], [2.76, 3, 5, 0.1], [-2.62, 2, 6, 0], [-1.66, 3, 4, -0.4]];
const CW = 0.66, CH = 0.62, CD = 0.7;
export const TABLE = new THREE.Vector4(0.20, 0, 0.56, 0.31);          // the table top: centre x, y, half size
const POLE = new THREE.Vector3(C.x + V.x * 0.66 - U.x * 0.62, C.y + V.y * 0.66 - U.y * 0.62, ZT);
export const LAMP = new THREE.Vector3(POLE.x, POLE.y, 0.3);
export const HUB = new THREE.Vector3(POLE.x, POLE.y, 1.36);

const PROP_VS = `
attribute vec3 aLoc, aHalf; attribute float aMat;
varying vec3 vP, vN, vLoc, vHalf; varying float vMat;
void main() { vP = position; vN = normal; vLoc = aLoc; vHalf = aHalf; vMat = aMat; gl_Position = projectionMatrix * viewMatrix * vec4(position, 1.0); }`;
const PROP_FS = `
${GLSL_NOISE}
${GLSL_LIGHT}
uniform vec3 uVU; uniform float uWorkOn;
varying vec3 vP, vN, vLoc, vHalf; varying float vMat;
void main() {
  vec3 N = normalize(vN); if (!gl_FrontFacing) N = -N;
  vec3 e = (1.0 - abs(vLoc)) * vHalf;
  float edge = min(max(e.x, e.y), min(max(e.y, e.z), max(e.x, e.z)));      // how far from the nearest edge of this face
  vec3 alb = vec3(0.02), emis = vec3(0.0); float gloss = 0.05, sh = 1.0;
  if (vMat < 1.5) {                                                         // the table top: stained ply
    float g = fbm(vec2(vP.x * 3.0, vP.y * 70.0));
    alb = mix(vec3(0.17, 0.105, 0.055), vec3(0.085, 0.05, 0.028), g) * (0.55 + 0.45 * smoothstep(0.0, 0.012, edge));
    if (N.z > 0.5) {                                                        // what stands on it shades it
      vec2 d = abs(vP.xy - vec2(0.0425, 0.0)) - vec2(0.2275, 0.19); float sd = length(max(d, 0.0)) + min(max(d.x, d.y), 0.0);
      vec2 d2 = abs(vP.xy - vec2(0.5, -0.01)) - vec2(0.13, 0.165); float sd2 = length(max(d2, 0.0)) + min(max(d2.x, d2.y), 0.0);
      sh = 0.25 + 0.75 * smoothstep(-0.02, 0.07, min(sd, sd2));
      vec2 tl = (uWorkPos.xy - vP.xy) / (uWorkPos.z - vP.z);              // and throws a shadow away from the work-light
      d = abs(vP.xy + tl * 0.058 - vec2(0.0425, 0.0)) - vec2(0.2275, 0.19); sd = length(max(d, 0.0)) + min(max(d.x, d.y), 0.0);
      d2 = abs(vP.xy + tl * 0.08 - vec2(0.5, -0.01)) - vec2(0.13, 0.165); sd2 = length(max(d2, 0.0)) + min(max(d2.x, d2.y), 0.0);
      sh *= 1.0 - 0.6 * (1.0 - smoothstep(-0.01, 0.035, min(sd, sd2))) * clamp(uWorkOn * 2.0, 0.0, 1.0);
      gloss = 0.5;
    }
  } else if (vMat < 2.5) {                                                  // the mixer
    alb = vec3(0.014); gloss = 0.05;
    if (N.z > 0.5) {
      float cx = (vLoc.x + 1.0) * 2.5, col = floor(cx); vec2 m = vec2((fract(cx) - 0.5) * 0.052, vLoc.y * 0.165);
      if (abs(col - 2.0) < 0.5) {                                           // the meters, up the middle
        float seg = floor((m.y + 0.13) / 0.02), lev = (m.x < 0.0 ? uVU.x : uVU.y) * 13.0;
        float led = step(0.004, abs(m.x)) * step(abs(m.x), 0.014) * step(0.2, fract((m.y + 0.13) / 0.02)) * step(0.0, seg) * step(seg, 12.5);
        vec3 lc = seg < 7.5 ? vec3(1.0, 0.75, 0.12) : seg < 10.5 ? vec3(1.0, 0.35, 0.05) : vec3(1.0, 0.08, 0.03);
        emis = lc * led * (step(seg + 0.5, lev) * 2.2 + 0.03);
      } else {                                                              // a channel strip: knobs over a fader
        float ky = m.y - 0.045 * clamp(floor(m.y / 0.045 + 0.5), 0.0, 3.0), kd = length(vec2(m.x, ky));
        alb = mix(alb, vec3(0.07), smoothstep(0.012, 0.0105, kd));
        alb = mix(alb, vec3(0.7), smoothstep(0.0015, 0.001, abs(m.x + ky * sin(col * 2.3))) * step(kd, 0.011) * step(0.0, ky));
        float fy = -0.09 + 0.035 * sin(col * 2.1 + 1.0);
        if (m.y < -0.03 && m.y > -0.15) { alb *= 1.0 - 0.8 * smoothstep(0.0025, 0.0015, abs(m.x)); alb = mix(alb, vec3(0.3), step(abs(m.x), 0.009) * step(abs(m.y - fy), 0.006)); }
        emis += vec3(1.0, 0.45, 0.08) * smoothstep(0.003, 0.002, length(m - vec2(0.016, 0.155))) * (0.4 + 1.6 * uVU.z);
      }
    }
  } else if (vMat < 3.5) { alb = vec3(0.1); gloss = 0.6; }                  // the tripod
  else if (vMat < 4.5) {                                                    // the work-light: a site flood, yellow housing
    alb = vec3(0.42, 0.28, 0.02);
    if (vLoc.z > 0.99) { alb = vec3(0.05); emis = vec3(1.0, 0.72, 0.4) * uWorkOn * 1.6 * (0.35 + 0.65 * step(0.12, abs(fract(vLoc.x * 3.0) - 0.5))); }
  } else if (vMat < 5.5) alb = mix(vec3(0.2, 0.14, 0.08), vec3(0.12, 0.08, 0.045), fbm(vP.xz * vec2(60.0, 4.0) + vP.y * 9.0));   // trestle timber
  else {                                                                    // the crate of records
    alb = vec3(0.3, 0.06, 0.015) * (0.35 + 0.65 * step(0.3, fract(vP.z * 16.0)) * step(0.25, fract((vP.x + vP.y) * 14.0)));
    if (N.z > 0.5) { float sp = floor(vP.x * 260.0); alb = (0.25 + 0.75 * step(0.06, edge)) * mix(vec3(0.02), 0.5 + 0.5 * cos(sp * 1.7 + vec3(0.0, 2.0, 4.0)), step(0.55, h21(vec2(sp, 3.0))) * 0.5); }
  }
  vec3 toE = uEye - vP; float dd = dot(toE, toE);
  vec3 col = alb * dbLight(vP, N, 0.08) * sh + emis;
  vec3 vd = toE * inversesqrt(dd), wl = normalize(uWorkPos - vP);
  col += (uFlashCol * pow(max(dot(N, vd), 0.0), 60.0) / (1.0 + dd * 0.22) + uWorkCol * 0.25 * pow(max(dot(N, normalize(wl + vd)), 0.0), 50.0) * smoothstep(0.35, 0.85, dot(-wl, uWorkDir))) * gloss * sh;
  gl_FragColor = vec4(dbOut(dbFog(col, vP)), 1.0);
}`;

const BOX_VS = `
attribute vec3 aPivot, aS; attribute vec4 aB;                           // foot of its stack; width, height, cone radius; kind, stack, a random number, grows
uniform float uStack;
varying vec3 vP, vN, vL, vLN, vS; varying vec4 vB; varying float vH;
void main() {
  vec4 wp = instanceMatrix * vec4(position, 1.0);
  wp.xyz = aPivot + (wp.xyz - aPivot) * mix(1.0, uStack, aB.w);
  vN = normalize(mat3(instanceMatrix) * normal); vL = position; vLN = normal; vB = aB; vS = aS; vH = wp.z - aPivot.z; vP = wp.xyz;
  gl_Position = projectionMatrix * viewMatrix * wp;
}`;
const BOX_FS = `
${GLSL_LIGHT}
uniform vec3 uStkCol[${NSTACK}], uStkN[${NSTACK}]; uniform float uStrobeIdx;
varying vec3 vP, vN, vL, vLN, vS; varying vec4 vB; varying float vH;
void main() {
  vec3 N = normalize(vN); int si = int(vB.y + 0.5); float kind = vB.x;
  vec2 f = vL.xy * vS.xy;                                               // metres, on the face
  bool front = vLN.z > 0.5;
  vec3 e = (0.5 - abs(vL)) * vec3(vS.xy, 0.7); float edge = min(max(e.x, e.y), min(max(e.y, e.z), max(e.x, e.z)));
  vec3 alb = vec3(0.04 + 0.03 * vB.z), emis = vec3(0.0);
  if (kind < 2.5 || kind > 4.5) {                                       // cabinets
    if (front) {
      if (fract(vB.z * 7.0) > 0.7) alb = fract(vB.z * 13.0) > 0.5 ? vec3(0.3, 0.07, 0.012) : vec3(0.32, 0.21, 0.03);   // a few baffles got painted
      if (vS.z > 0.0) {
        float rr = length(f);
        if (rr < vS.z) discard;                                         // the hole the cone sits in
        alb *= 0.35 + 0.65 * smoothstep(vS.z + 0.005, vS.z + 0.03, rr);
        if (kind > 0.5 && kind < 1.5) { vec2 p = abs(f - vec2(0.0, -vS.y * 0.5 + 0.045)) - vec2(vS.x * 0.3, 0.012); alb *= 0.15 + 0.85 * smoothstep(0.0, 0.006, max(p.x, p.y)); }   // a port
      } else {                                                          // a horn: black in the throat
        vec2 h = abs(f) - vS.xy * vec2(0.36, 0.28); float d = length(max(h, 0.0)) + min(max(h.x, h.y), 0.0);
        alb = mix(alb, vec3(0.004) + 0.035 * smoothstep(-0.16, 0.0, d), smoothstep(0.0, -0.012, d));
      }
    }
    alb = mix(vec3(0.16), alb, smoothstep(0.012, 0.022, edge));        // worn edges
  } else if (kind < 3.5) alb = vec3(0.02);                              // a moving head
  else { alb = vec3(0.03); if (front) emis = uStrobeCol * 2.5 * step(abs(vB.y - uStrobeIdx), 0.5); }   // a strobe
  vec3 L = dbLight(vP, N, 0.1);
  if (vB.w > 0.5) L += uStkCol[si] * (0.45 + 0.55 * exp(-vH * 0.4)) * max(dot(N, normalize(uStkN[si] + vec3(0.0, 0.0, -0.7))), 0.0) * 3.0;   // the pars at its feet
  gl_FragColor = vec4(dbOut(dbFog(alb * L + emis, vP)), 1.0);
}`;
const CONE_VS = `
attribute vec3 aPivot; attribute vec4 aD; attribute float aMove;        // aD: kind (0 bass, 1 mid), stack, a random number, grows
uniform float uStack, uPumpLow, uPumpMid;
varying vec3 vP, vN; varying vec4 vD; varying float vRho, vZ, vPump, vH;
void main() {
  float pump = (aD.x < 0.5 ? uPumpLow : uPumpMid) * (0.8 + 0.4 * aD.z);
  vec3 lp = position; float rho = length(position.xy);
  lp.z += aMove * pump * 0.22;                                          // far more travel than a real cone: it has to read from across the floor
  if (rho < 0.31) lp.xy *= 1.0 + pump * 0.14;
  vec4 wp = instanceMatrix * vec4(lp, 1.0);
  wp.xyz = aPivot + (wp.xyz - aPivot) * mix(1.0, uStack, aD.w);
  vN = normalize(mat3(instanceMatrix) * normal); vD = aD; vRho = rho; vZ = lp.z; vPump = pump; vH = wp.z - aPivot.z; vP = wp.xyz;
  gl_Position = projectionMatrix * viewMatrix * wp;
}`;
const CONE_FS = `
${GLSL_LIGHT}
uniform vec3 uStkCol[${NSTACK}], uStkN[${NSTACK}];
varying vec3 vP, vN; varying vec4 vD; varying float vRho, vZ, vPump, vH;
void main() {
  vec3 N = normalize(vN); vec3 toE = normalize(uEye - vP); if (dot(N, toE) < 0.0) N = -N;
  int si = int(vD.y + 0.5);
  vec3 alb; float gloss;
  if (vRho > 0.85) { alb = vec3(0.03); gloss = 0.5; }                  // the rubber surround
  else if (vRho > 0.31) { alb = vec3(0.13) * (0.75 + 0.3 * sin((vRho - vPump * 0.07) * 64.0)); gloss = 0.12; }   // paper, pressed in rings
  else { alb = vec3(0.06); gloss = 0.9; }                               // the dust cap
  float ao = mix(0.28, 1.0, smoothstep(-0.38, 0.03, vZ));
  vec3 L = dbLight(vP, N, 0.15), spec = vec3(0.0);
  float dd = distance(vP, uEye);
  spec += uFlashCol * pow(max(dot(N, toE), 0.0), 24.0) / (1.0 + dd * dd * 0.22);
  if (vD.w > 0.5) {
    vec3 wl = normalize(uStkN[si] + vec3(0.0, 0.0, -0.7)), wc = uStkCol[si] * (0.45 + 0.55 * exp(-vH * 0.4)) * 3.0;
    L += wc * max(dot(N, wl), 0.0); spec += wc * pow(max(dot(N, normalize(wl + toE)), 0.0), 24.0) * 2.0;
  }
  vec3 col = (alb * L + spec * gloss * 0.25) * ao * (1.0 + vPump * 1.1);
  gl_FragColor = vec4(dbOut(dbFog(col, vP)), 1.0);
}`;

const BEAM_VS = `
attribute float aIdx;
uniform vec3 uBO[${NBEAM}], uBD[${NBEAM}], uBC[${NBEAM}]; uniform float uBeamLen;
varying vec3 vP, vC, vO, vD; varying float vI;
void main() {
  int i = int(aIdx + 0.5); vec3 o = uBO[i], d = uBD[i];
  vec3 a = normalize(cross(d, vec3(0.0, 0.0, 1.0) + d.yzx * 0.013)), b = cross(d, a);
  float t = position.z, rad = mix(0.08, 1.0, t);
  vec3 p = o + d * (t * uBeamLen) + (a * position.x + b * position.y) * rad;
  vP = p; vC = uBC[i]; vO = o; vD = d; vI = aIdx;
  gl_Position = projectionMatrix * viewMatrix * vec4(p, 1.0);
}`;
// lit smoke, not a solid: how close the line of sight passes to the beam's axis
const BEAM_FS = `
${GLSL_NOISE}
uniform vec3 uEye; uniform float uBeamLen, uTime, uSmoke;
varying vec3 vP, vC, vO, vD; varying float vI;
void main() {
  vec3 w = normalize(vP - uEye), w0 = uEye - vO;
  float b = dot(w, vD), dd = dot(w, w0), e = dot(vD, w0), den = max(1.0 - b * b, 0.002);
  float s = (b * e - dd) / den, t = (e - b * dd) / den;
  if (t < 0.0 || t > uBeamLen || s < 0.0) discard;
  vec3 off = w0 + w * s - vD * t, ax = cross(w0, vD);
  float rad = 0.03 + t * 0.03;
  float g = exp(-dot(off, off) / (rad * rad));
  float n = fbm(vec2(t * 0.55 - uTime * 0.35, vI * 7.3 + uTime * 0.05));
  float I = g * (0.03 / rad) * (1.0 - 0.8 * smoothstep(0.8, 0.99, abs(b))) * (0.3 + 1.2 * n) * exp(-t * 0.1) * smoothstep(0.0, 0.25, t) * (0.25 + 0.75 * uSmoke) * smoothstep(0.4, 3.0, s) * smoothstep(0.25, 1.6, length(ax));   // not when it is in the lens
  vec3 c = vC * I;
  gl_FragColor = vec4(1.0 - exp(-c * 1.3), 1.0);
}`;

const LASER_VS = `
attribute vec2 aL;                                                      // which emitter; where in its fan, 0..1
uniform vec3 uLO[2], uLN[2], uLT[2], uEye; uniform vec4 uLA;            // uLA: the fan's roll, its spread, lift, -
varying float vS, vT, vF;
void main() {
  int e = int(aL.x + 0.5); float sg = aL.x < 0.5 ? 1.0 : -1.0;
  float phi = (aL.y - 0.5) * 2.0 * uLA.y;
  vec3 pt = uLT[e] * cos(uLA.x * sg) + vec3(0.0, 0.0, 1.0) * sin(uLA.x * sg);
  vec3 d = normalize(uLN[e] * cos(phi) + pt * sin(phi) + vec3(0.0, 0.0, uLA.z));
  vec3 p = uLO[e] + d * (position.x * 46.0);
  vec3 side = normalize(cross(d, uEye - p));
  p += side * position.y * max(0.006, distance(p, uEye) * 0.0012);
  vS = position.y; vT = position.x * 46.0; vF = aL.y + aL.x * 3.7;
  gl_Position = projectionMatrix * viewMatrix * vec4(p, 1.0);
}`;
const LASER_FS = `
${GLSL_NOISE}
uniform vec3 uLaserCol; uniform float uTime, uGate, uSmoke;
varying float vS, vT, vF;
void main() {
  float on = mix(1.0, step(0.45, h21(vec2(floor(vF * 16.0 + 0.5), floor(uGate)))), step(0.0, uGate));   // lines switch on the sixteenths
  float I = (1.0 - vS * vS) * (1.0 - vS * vS) * (0.3 + 1.1 * fbm(vec2(vT * 0.8 - uTime * 0.4, vF * 9.0))) * exp(-vT * 0.03) * on * (0.3 + 0.7 * uSmoke);
  gl_FragColor = vec4(uLaserCol * I, 1.0);
}`;

const LINK_VS = `
uniform vec3 uEye, uCtr;
varying float vX, vZ;
void main() {
  vec3 base = vec3(0.0, 0.0, 0.012 + position.y * 60.0);
  vec3 toE = uEye - base; vec3 right = normalize(vec3(-toE.y, toE.x, 0.0));
  vec3 p = base + right * position.x * max(0.035, length(toE) * 0.012);
  vX = position.x; vZ = base.z;
  gl_Position = projectionMatrix * viewMatrix * vec4(p, 1.0);
}`;
const LINK_FS = `
${GLSL_NOISE}
uniform vec3 uLinkCol; uniform float uTime, uLinkPulse;
varying float vX, vZ;
void main() {
  float core = exp(-vX * vX * 90.0) * 1.3 + exp(-vX * vX * 7.0) * 0.16;
  float run = 0.55 + 0.9 * vn(vec2(vZ * 1.6 - uTime * 5.0, 3.0)) * (0.4 + 0.6 * uLinkPulse);       // light running up it
  gl_FragColor = vec4(uLinkCol * core * run * smoothstep(0.0, 0.05, vZ) * exp(-vZ * 0.035), 1.0);
}`;

// every small light: where it is now, how bright, what colour
const LIGHT_COMMON = `
attribute vec3 aPos, aPivot, aCol; attribute vec4 aK;                   // aK: kind, a random number, size, (rank / beam / stack); aCol: a-b mix, whiteness, -
uniform vec3 uBO[${NBEAM}], uBC[${NBEAM}], uColA, uColB, uStrobeTint, uEye;
uniform float uTime, uBeat, uDance, uCrowd, uStack, uStrobeIdx, uKB[6];
vec3 lightPos(out float bright, out vec3 col) {
  float kind = aK.x; vec3 p = aPivot + (aPos - aPivot) * uStack;
  col = mix(mix(uColA, uColB, aCol.x), vec3(1.0, 0.8, 0.5), aCol.y); bright = 0.0;
  if (kind < 0.5) { p.z += sin(uTime * 0.8 + aK.y * 30.0) * 0.025; bright = uKB[0] * (0.7 + 0.3 * sin(uTime * (1.5 + aK.y * 4.0) + aK.y * 50.0)); }      // a bulb on the string
  else if (kind < 1.5) {                                                // something held up in the crowd
    float b = uBeat * (aK.y > 0.72 ? 0.5 : 1.0) + aK.y * 0.37, x = fract(b), w = (floor(b) + x) * 3.14159 + aK.y * 20.0;
    p += vec3(cos(w) * 0.22, sin(w * 0.5) * 0.12, sin(w) * 0.18 + 4.0 * x * (1.0 - x) * (0.03 + 0.13 * fract(aK.y * 7.3))) * uDance;
    bright = uKB[1] * smoothstep(aK.w, aK.w + 0.05, uCrowd);
  } else if (kind < 2.5) {                                              // a moth at the work-light
    float a = uTime * (1.5 + aK.y * 2.5) + aK.y * 60.0, rr = 0.1 + 0.32 * fract(aK.y * 9.1);
    p += vec3(cos(a) * rr, sin(a * 1.3) * rr, sin(a * 0.7 + aK.y * 10.0) * rr * 0.7 - 0.05);
    bright = uKB[2] * (0.55 + 0.45 * sin(a * 9.0));
  } else if (kind < 3.5) { int i = int(aK.w + 0.5); p = uBO[i]; col = uBC[i]; bright = uKB[3]; }                                                    // a moving head's lens
  else if (kind < 4.5) { bright = uKB[4] * step(abs(aK.w - uStrobeIdx), 0.5); col = uStrobeTint; }                                                // a strobe
  else { bright = uKB[5]; col = vec3(1.0, 0.74, 0.42); }                                                                                        // the work-light
  return p;
}`;
const HEAD_VS = `${LIGHT_COMMON}
uniform float uHalo;
varying vec2 vQ; varying vec3 vC; varying float vHalo;
void main() {
  float bright; vec3 col; vec3 p = lightPos(bright, col);
  if (bright < 0.004) { gl_Position = vec4(2.0, 2.0, 2.0, 1.0); return; }
  vec4 mv = viewMatrix * vec4(p, 1.0);
  float size = clamp(aK.z * (2.5 + 2.5 * uHalo), -mv.z * 0.004, -mv.z * 0.035);
  mv.xy += position.xy * 2.0 * size;
  vQ = position.xy * 2.0; vC = col * bright; vHalo = uHalo * aK.z * 3.0 / size;
  gl_Position = projectionMatrix * mv;
}`;
const HEAD_FS = `
varying vec2 vQ; varying vec3 vC; varying float vHalo;
void main() {
  float d = length(vQ); if (d > 1.0) discard;
  float I = smoothstep(0.3, 0.1, d) * 1.5 + exp(-d * 5.0) * 0.5 + (1.0 - d) * (1.0 - d) * 0.14 * vHalo;
  gl_FragColor = vec4(vC * I, 1.0);
}`;
const TRAIL_VS = `${LIGHT_COMMON}
attribute float aT, aSide;
uniform vec4 uTr, uTrPh; uniform vec2 uRes;                             // uTr: length (screen heights), wiggle, direction, aspect
varying vec3 vC; varying float vT, vSide, vDash;
vec2 path(float u, float rnd, float own) {
  vec2 dir = vec2(cos(uTr.z), sin(uTr.z)), nrm = vec2(-dir.y, dir.x);
  float wig = uTr.y * u * (sin(u * 8.0 + uTrPh.x) * 0.5 + sin(u * 19.0 + uTrPh.y) * 0.2);                 // the camera's shake: the same scribble on every light
  wig += own * u * sin(u * 13.0 + rnd * 40.0 + uTrPh.z) * 0.35;                                           // and what the light itself was doing
  return (dir * u * (1.0 + own * 0.5 * (rnd - 0.5)) + nrm * wig) * uTr.x;
}
void main() {
  float bright; vec3 col; vec3 p = lightPos(bright, col);
  if (bright < 0.004 || uTr.x < 0.002) { gl_Position = vec4(2.0, 2.0, 2.0, 1.0); return; }
  vec4 clip = projectionMatrix * viewMatrix * vec4(p, 1.0);
  float own = aK.x > 0.5 && aK.x < 2.5 ? 1.0 : 0.0;
  vec2 o = path(aT, aK.y, own), o2 = path(aT + 0.02, aK.y, own);
  vec2 tg = normalize(o2 - o + vec2(1e-5, 0.0)), nn = vec2(-tg.y, tg.x);
  float px = mix(2.6, 0.8, aT) * clamp(aK.z * 40.0, 0.7, 2.2);
  vec2 ndc = (o * 2.0 + nn * aSide * px * 2.0 / uRes.y) * vec2(1.0 / uTr.w, 1.0);
  clip.xy += ndc * clip.w;
  vC = col * bright; vT = aT; vSide = aSide; vDash = aK.x > 0.5 && aK.x < 1.5 ? 1.0 : 0.0;
  gl_Position = clip;
}`;
const TRAIL_FS = `
varying vec3 vC; varying float vT, vSide, vDash;
void main() {
  float I = pow(1.0 - vT, 1.5) * (1.0 - vSide * vSide * 0.8) * 0.85;
  I *= mix(1.0, step(0.4, fract(vT * 17.0)), vDash);                    // LEDs flicker: their streaks come out dashed
  gl_FragColor = vec4(vC * I, 1.0);
}`;

function boxInto(o, c, A, h, mat) {
  const F = [[0, 1, 2, 1], [0, 1, 2, -1], [1, 2, 0, 1], [1, 2, 0, -1], [2, 0, 1, 1], [2, 0, 1, -1]], Q = [[-1, -1], [1, -1], [1, 1], [-1, -1], [1, 1], [-1, 1]];
  for (const [u, v, n, s] of F) for (const [qu, qv] of Q) {
    const loc = [0, 0, 0]; loc[u] = qu; loc[v] = qv; loc[n] = s;
    for (let i = 0; i < 3; i++) o.pos.push(c[i] + A[0][i] * loc[0] * h[0] + A[1][i] * loc[1] * h[1] + A[2][i] * loc[2] * h[2]);
    o.nrm.push(A[n][0] * s, A[n][1] * s, A[n][2] * s); o.loc.push(...loc); o.half.push(...h); o.mat.push(mat);
  }
}
const AX = [[1, 0, 0], [0, 1, 0], [0, 0, 1]];
function strut(o, p0, p1, th, mat) {                                    // a square bar from p0 to p1
  const a = new THREE.Vector3(...p0), b = new THREE.Vector3(...p1), az = b.clone().sub(a), len = az.length(); az.normalize();
  const ax = new THREE.Vector3().crossVectors(az, Math.abs(az.z) > 0.9 ? new THREE.Vector3(1, 0, 0) : Z).normalize(), ay = new THREE.Vector3().crossVectors(az, ax);
  boxInto(o, a.add(b).multiplyScalar(0.5).toArray(), [ax.toArray(), ay.toArray(), az.toArray()], [th, th, len / 2], mat);
}

export class Rig {
  constructor(root, LU, beamU, stackU, dancers) {
    this.LU = LU; this.beamU = beamU; this.stackU = stackU;
    const R = rng(909), add = (mesh, order = 0) => { mesh.frustumCulled = false; mesh.renderOrder = order; root.add(mesh); return mesh; };
    const tmp = new THREE.Vector3(), n = new THREE.Vector3(), t = new THREE.Vector3(), m4 = new THREE.Matrix4(), sc = new THREE.Vector3();

    // ---- the table and what is on and under it, the work-light on its tripod ----
    {
      const o = { pos: [], nrm: [], loc: [], half: [], mat: [] }, T = TABLE;
      boxInto(o, [T.x, T.y, -0.095], AX, [T.z, T.w, 0.015], 1);
      for (const x of [T.x - 0.4, T.x + 0.4]) {
        for (const s of [-1, 1]) strut(o, [x, s * 0.05, -0.12], [x, s * 0.3, ZT - 0.02], 0.019, 5);
        strut(o, [x, -0.3, -0.128], [x, 0.3, -0.128], 0.019, 5); strut(o, [x, -0.2, -0.5], [x, 0.2, -0.5], 0.014, 5);
      }
      strut(o, [T.x - 0.4, 0, -0.5], [T.x + 0.4, 0, -0.5], 0.012, 5);
      boxInto(o, [0.5, -0.01, -0.04], AX, [0.13, 0.165, 0.04], 2);
      boxInto(o, [0.22, 0.04, ZT + 0.15], AX, [0.17, 0.17, 0.15], 6);
      strut(o, [POLE.x, POLE.y, ZT + 0.5], [HUB.x, HUB.y, HUB.z], 0.013, 3);
      for (let i = 0; i < 3; i++) { const a = i * 2.094 + 0.4, fx = POLE.x + Math.cos(a) * 0.42, fy = POLE.y + Math.sin(a) * 0.42; strut(o, [POLE.x, POLE.y, ZT + 0.62], [fx, fy, riseZ(Math.hypot(fx - C.x, fy - C.y)) - 0.02], 0.011, 3); }
      const aim = new THREE.Vector3(C.x - LAMP.x, C.y - LAMP.y, -0.02 - LAMP.z).normalize(), ax = new THREE.Vector3().crossVectors(aim, Z).normalize(), ay = new THREE.Vector3().crossVectors(aim, ax);
      this.workDir = aim; this.workPos = LAMP.clone().addScaledVector(aim, 0.1);
      boxInto(o, LAMP.clone().addScaledVector(aim, 0.05).toArray(), [ax.toArray(), ay.toArray(), aim.toArray()], [0.085, 0.06, 0.04], 4);
      const g = new THREE.BufferGeometry();
      g.setAttribute('position', new THREE.Float32BufferAttribute(o.pos, 3)); g.setAttribute('normal', new THREE.Float32BufferAttribute(o.nrm, 3));
      g.setAttribute('aLoc', new THREE.Float32BufferAttribute(o.loc, 3)); g.setAttribute('aHalf', new THREE.Float32BufferAttribute(o.half, 3)); g.setAttribute('aMat', new THREE.Float32BufferAttribute(o.mat, 1));
      this.propU = { ...LU, uVU: { value: new THREE.Vector3() }, uWorkOn: { value: 0 } };
      add(new THREE.Mesh(g, new THREE.ShaderMaterial({ vertexShader: PROP_VS, fragmentShader: PROP_FS, uniforms: this.propU, side: THREE.DoubleSide })));
    }

    // ---- stacks ----
    const boxes = [], cones = [];                                        // [matrix, pivot, ...]
    this.stackG = []; this.stackN = []; this.moverLocal = []; this.strobeLocal = [];
    STACKS.forEach(([ang, w, rows, dr], si) => {
      dirAt(ang, tmp); const G = new THREE.Vector3(C.x + tmp.x * (R_STACK + dr), C.y + tmp.y * (R_STACK + dr), G0);
      n.copy(tmp).negate(); t.crossVectors(Z, n);
      this.stackG.push(G); this.stackN.push(n.clone());
      stackU.uStkN.value[si].copy(n);
      const at = (lx, lz, ln) => G.clone().addScaledVector(t, lx).addScaledVector(Z, lz).addScaledVector(n, ln);
      for (let r = 0; r < rows; r++) for (let c = 0; c < w; c++) {
        const kind = r === rows - 1 ? 2 : r < 2 ? 0 : 1, jog = (R() - 0.5) * 0.05, ctr = at((c - (w - 1) / 2) * CW, r * CH + CH / 2, -CD / 2 + jog), rad = kind === 2 ? 0 : kind === 0 ? 0.265 : 0.215;
        m4.makeBasis(t, Z, n).scale(sc.set(CW * 0.985, CH * 0.985, CD)).setPosition(ctr);
        boxes.push({ m: m4.clone(), pivot: G, s: [CW * 0.985, CH * 0.985, rad], b: [kind, si, R(), 1] });
        if (rad) { m4.makeBasis(t, Z, n).scale(sc.set(rad, rad, rad)).setPosition(ctr.clone().addScaledVector(n, CD / 2 - 0.004)); cones.push({ m: m4.clone(), pivot: G, d: [kind, si, R(), 1] }); }
      }
      const top = rows * CH;
      for (const s of [-1, 1]) {                                         // two moving heads on top, a strobe between them
        const p = at(s * (w - 1) * CW * 0.5, top + 0.13, -0.2);
        m4.makeBasis(t, Z, n).scale(sc.set(0.24, 0.26, 0.24)).setPosition(p); boxes.push({ m: m4.clone(), pivot: G, s: [0.24, 0.26, 0], b: [3, si, R(), 1] });
        this.moverLocal.push(p.clone().addScaledVector(n, 0.13));
      }
      const sp = at(0, top + 0.09, -0.12);
      m4.makeBasis(t, Z, n).scale(sc.set(0.5, 0.18, 0.14)).setPosition(sp); boxes.push({ m: m4.clone(), pivot: G, s: [0.5, 0.18, 0], b: [4, si, R(), 1] });
      this.strobeLocal.push(sp.clone().addScaledVector(n, 0.09));
    });
    {                                                                   // a monitor wedge on the rise, facing the deck
      const p = new THREE.Vector3(C.x + V.x * 0.45 + U.x * 1.02, C.y + V.y * 0.45 + U.y * 1.02, 0); p.z = riseZ(Math.hypot(p.x - C.x, p.y - C.y)) + 0.17;
      const inw = new THREE.Vector3(C.x - p.x, C.y - p.y, 0).normalize(), tt = new THREE.Vector3().crossVectors(Z, inw), tilt = 0.75;
      const fn = inw.clone().multiplyScalar(Math.cos(tilt)).addScaledVector(Z, Math.sin(tilt)), up = Z.clone().multiplyScalar(Math.cos(tilt)).addScaledVector(inw, -Math.sin(tilt));
      m4.makeBasis(tt, up, fn).scale(sc.set(0.52, 0.4, 0.34)).setPosition(p); boxes.push({ m: m4.clone(), pivot: p, s: [0.52, 0.4, 0.15], b: [5, 0, 0.2, 0] });
      m4.makeBasis(tt, up, fn).scale(sc.set(0.15, 0.15, 0.15)).setPosition(p.clone().addScaledVector(fn, 0.166)); cones.push({ m: m4.clone(), pivot: p, d: [1, 0, 0.5, 0] });
    }
    {
      const g = new THREE.BoxGeometry(1, 1, 1);
      this.boxU = { ...LU, ...stackU, uStack: { value: 1 }, uStrobeIdx: { value: -1 } };
      const mesh = new THREE.InstancedMesh(g, new THREE.ShaderMaterial({ vertexShader: BOX_VS, fragmentShader: BOX_FS, uniforms: this.boxU }), boxes.length);
      const piv = new Float32Array(boxes.length * 3), aS = new Float32Array(boxes.length * 3), aB = new Float32Array(boxes.length * 4);
      boxes.forEach((b, i) => { mesh.setMatrixAt(i, b.m); b.pivot.toArray(piv, i * 3); aS.set(b.s, i * 3); aB.set(b.b, i * 4); });
      g.setAttribute('aPivot', new THREE.InstancedBufferAttribute(piv, 3)); g.setAttribute('aS', new THREE.InstancedBufferAttribute(aS, 3)); g.setAttribute('aB', new THREE.InstancedBufferAttribute(aB, 4));
      this.boxes = add(mesh);
    }
    {                                                                   // a driver, turned on a lathe: frame, surround, cone, dust cap
      const prof = [[1.07, 0, 0], [1.0, 0.012, 0]];
      for (let i = 1; i <= 5; i++) { const k = i / 5; prof.push([1.0 - 0.15 * k, 0.012 + 0.05 * Math.sin(Math.PI * k), k]); }
      for (let i = 1; i <= 6; i++) { const k = i / 6; prof.push([0.85 - 0.55 * k, 0.012 - 0.36 * Math.pow(k, 0.85), 1]); }
      for (let i = 1; i <= 5; i++) { const k = i / 5; prof.push([0.3 * (1 - k), -0.348 + 0.13 * Math.sin(Math.PI / 2 * k), 1]); }
      const SEG = 40, pos = [], mv = [], idx = [];
      prof.forEach(([r, z, mo], i) => { for (let j = 0; j <= SEG; j++) { const a = j / SEG * Math.PI * 2; pos.push(Math.cos(a) * r, Math.sin(a) * r, z); mv.push(mo); } if (i) for (let j = 0; j < SEG; j++) { const a0 = (i - 1) * (SEG + 1) + j, b0 = i * (SEG + 1) + j; idx.push(a0, b0, b0 + 1, a0, b0 + 1, a0 + 1); } });
      const g = new THREE.BufferGeometry(); g.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3)); g.setAttribute('aMove', new THREE.Float32BufferAttribute(mv, 1)); g.setIndex(idx); g.computeVertexNormals();
      this.coneU = { ...LU, ...stackU, uStack: this.boxU.uStack, uPumpLow: { value: 0 }, uPumpMid: { value: 0 } };
      const mesh = new THREE.InstancedMesh(g, new THREE.ShaderMaterial({ vertexShader: CONE_VS, fragmentShader: CONE_FS, uniforms: this.coneU, side: THREE.DoubleSide }), cones.length);
      const piv = new Float32Array(cones.length * 3), aD = new Float32Array(cones.length * 4);
      cones.forEach((c, i) => { mesh.setMatrixAt(i, c.m); c.pivot.toArray(piv, i * 3); aD.set(c.d, i * 4); });
      g.setAttribute('aPivot', new THREE.InstancedBufferAttribute(piv, 3)); g.setAttribute('aD', new THREE.InstancedBufferAttribute(aD, 4));
      this.cones = add(mesh);
    }

    // ---- beams ----
    {
      const SEG = 14, pos = [], idx = [];
      for (let i = 0; i <= 1; i++) for (let j = 0; j <= SEG; j++) { const a = j / SEG * Math.PI * 2; pos.push(Math.cos(a), Math.sin(a), i); }
      for (let j = 0; j < SEG; j++) idx.push(j, SEG + 1 + j, SEG + 2 + j, j, SEG + 2 + j, j + 1);
      const g = new THREE.InstancedBufferGeometry(); g.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3)); g.setIndex(idx);
      g.setAttribute('aIdx', new THREE.InstancedBufferAttribute(new Float32Array(Array.from({ length: NBEAM }, (_, i) => i)), 1)); g.instanceCount = NBEAM;
      this.beamMatU = { ...beamU, uEye: LU.uEye, uTime: LU.uTime, uBeamLen: { value: 15 }, uSmoke: { value: 1 } };
      this.beams = add(new THREE.Mesh(g, new THREE.ShaderMaterial({ vertexShader: BEAM_VS, fragmentShader: BEAM_FS, uniforms: this.beamMatU, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending, side: THREE.DoubleSide })), 6);
    }
    // ---- lasers: two fans, from the tallest stack and the one across from it ----
    {
      const NL = 18, aL = [];
      for (let e = 0; e < 2; e++) for (let i = 0; i < NL; i++) aL.push(e, i / (NL - 1));
      const g = new THREE.InstancedBufferGeometry();
      g.setAttribute('position', new THREE.Float32BufferAttribute([0, -1, 0, 1, -1, 0, 1, 1, 0, 0, 1, 0], 3)); g.setIndex([0, 1, 2, 0, 2, 3]);
      g.setAttribute('aL', new THREE.InstancedBufferAttribute(new Float32Array(aL), 2)); g.instanceCount = NL * 2;
      this.laserStacks = [1, 4];
      this.laserU = { uLO: { value: [new THREE.Vector3(), new THREE.Vector3()] }, uLN: { value: this.laserStacks.map((i) => this.stackN[i].clone()) }, uLT: { value: this.laserStacks.map((i) => new THREE.Vector3().crossVectors(Z, this.stackN[i])) },
        uEye: LU.uEye, uLA: { value: new THREE.Vector4(0, 0.5, 0, 0) }, uLaserCol: { value: new THREE.Color(0, 0, 0) }, uTime: LU.uTime, uGate: { value: -1 }, uSmoke: { value: 1 } };
      this.lasers = add(new THREE.Mesh(g, new THREE.ShaderMaterial({ vertexShader: LASER_VS, fragmentShader: LASER_FS, uniforms: this.laserU, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending, side: THREE.DoubleSide })), 7);
    }

    // ---- the link: a thread of light from the spindle to the sky ----
    {
      const g = new THREE.BufferGeometry(); g.setAttribute('position', new THREE.Float32BufferAttribute([-1, 0, 0, 1, 0, 0, 1, 1, 0, -1, 1, 0], 3)); g.setIndex([0, 1, 2, 0, 2, 3]);
      this.linkU = { uEye: LU.uEye, uCtr: LU.uCtr, uTime: LU.uTime, uLinkCol: { value: new THREE.Color(0, 0, 0) }, uLinkPulse: { value: 0 } };
      this.link = add(new THREE.Mesh(g, new THREE.ShaderMaterial({ vertexShader: LINK_VS, fragmentShader: LINK_FS, uniforms: this.linkU, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending, side: THREE.DoubleSide })), 7);
    }

    // ---- the small lights ----
    {
      const aPos = [], aPivot = [], aK = [], aCol = [], wire = [];
      const light = (p, pivot, kind, size, extra, ab, white) => { aPos.push(p.x, p.y, p.z); aPivot.push(pivot.x, pivot.y, pivot.z); aK.push(kind, R(), size, extra); aCol.push(ab, white, 0); };
      // festoon: strings of bulbs from the top of the tripod out into the trees
      for (const ang of [0.05, 1.08, 2.06, -2.06, -1.05]) {
        dirAt(ang, tmp); const r = R_STACK + 3 + R() * 1.5, end = new THREE.Vector3(C.x + tmp.x * r, C.y + tmp.y * r, 1.7 + R() * 0.9), len = end.distanceTo(HUB), nb = Math.floor(len / 0.44);
        let prev = null;
        for (let i = 0; i <= 40; i++) { const u = i / 40, p = HUB.clone().lerp(end, u); p.z -= 3.2 * u * (1 - u); if (prev) wire.push(prev.x, prev.y, prev.z, p.x, p.y, p.z); prev = p; }
        for (let i = 1; i < nb; i++) { const u = i / nb, p = HUB.clone().lerp(end, u); p.z -= 3.2 * u * (1 - u) + 0.05; light(p, p, 0, 0.022, 0, R() < 0.5 ? 0 : 1, 0.55); }
      }
      // in the crowd: things held up and waved
      let k = 0;
      for (const d of dancers) { if (k >= 46) break; if (d.rnd < 0.2 || d.rank > 0.9) continue; k++; const p = new THREE.Vector3(d.x, d.y, G0 + 1.95 * d.h); light(p, p, 1, 0.016, d.rank, R() < 0.5 ? 0 : 1, R() < 0.25 ? 0.8 : 0.1); aK[aK.length - 3] = d.rnd; }
      for (let i = 0; i < 14; i++) light(LAMP, LAMP, 2, 0.006, 0, 0.5, 0.9);                           // moths
      for (let i = 0; i < NBEAM; i++) light(this.moverLocal[i], this.stackG[i >> 1], 3, 0.05, i, 0, 0);
      for (let i = 0; i < NSTACK; i++) light(this.strobeLocal[i], this.stackG[i], 4, 0.16, i, 0, 1);
      light(this.workPos, this.workPos, 5, 0.045, 0, 0, 1);
      const N = aPos.length / 3;
      const inst = (g) => { g.setAttribute('aPos', new THREE.InstancedBufferAttribute(new Float32Array(aPos), 3)); g.setAttribute('aPivot', new THREE.InstancedBufferAttribute(new Float32Array(aPivot), 3)); g.setAttribute('aK', new THREE.InstancedBufferAttribute(new Float32Array(aK), 4)); g.setAttribute('aCol', new THREE.InstancedBufferAttribute(new Float32Array(aCol), 3)); g.instanceCount = N; return g; };
      this.lightU = { uBO: beamU.uBO, uBC: beamU.uBC, uColA: { value: new THREE.Color() }, uColB: { value: new THREE.Color() }, uStrobeTint: { value: new THREE.Color() }, uEye: LU.uEye, uTime: LU.uTime,
        uBeat: { value: 0 }, uDance: { value: 0 }, uCrowd: { value: 0 }, uStack: this.boxU.uStack, uStrobeIdx: this.boxU.uStrobeIdx, uKB: { value: [0, 0, 0, 0, 0, 0] },
        uHalo: { value: 0.5 }, uTr: { value: new THREE.Vector4(0, 0, 0, 1.78) }, uTrPh: { value: new THREE.Vector4() }, uRes: { value: new THREE.Vector2(1280, 720) } };
      const hg = new THREE.InstancedBufferGeometry(); hg.setAttribute('position', new THREE.Float32BufferAttribute([-0.5, -0.5, 0, 0.5, -0.5, 0, 0.5, 0.5, 0, -0.5, 0.5, 0], 3)); hg.setIndex([0, 1, 2, 0, 2, 3]);
      this.heads = add(new THREE.Mesh(inst(hg), new THREE.ShaderMaterial({ vertexShader: HEAD_VS, fragmentShader: HEAD_FS, uniforms: this.lightU, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending })), 9);
      const SEGS = 26, pos = [], aT = [], aSide = [], idx = [];
      for (let i = 0; i <= SEGS; i++) { for (const sd of [-1, 1]) { pos.push(0, 0, 0); aT.push(i / SEGS); aSide.push(sd); } if (i) { const a = (i - 1) * 2; idx.push(a, a + 1, a + 2, a + 1, a + 3, a + 2); } }
      const tg = new THREE.InstancedBufferGeometry(); tg.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3)); tg.setAttribute('aT', new THREE.Float32BufferAttribute(aT, 1)); tg.setAttribute('aSide', new THREE.Float32BufferAttribute(aSide, 1)); tg.setIndex(idx);
      this.trails = add(new THREE.Mesh(inst(tg), new THREE.ShaderMaterial({ vertexShader: TRAIL_VS, fragmentShader: TRAIL_FS, uniforms: this.lightU, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending, side: THREE.DoubleSide })), 8);
      const wg = new THREE.BufferGeometry(); wg.setAttribute('position', new THREE.Float32BufferAttribute(wire, 3));
      add(new THREE.LineSegments(wg, new THREE.LineBasicMaterial({ color: 0x030303 })));
    }
  }
  // where a thing on top of a stack is, with the stacks grown or shrunk
  onStack(local, si, k, out) { const G = this.stackG[si]; return out.copy(local).sub(G).multiplyScalar(k).add(G); }
}
