// Deadbeat: what the pieces of the bush rave share (worlds/deadbeat.js is the world itself).
// The place: the deck stands on a road case on a low rise in a clearing; the dancefloor is the flat red dirt around
// it, speaker stacks ring that, scrub and gums ring the stacks. z is up, metres, the deck's centre is C.
import * as THREE from 'three';

export const C = new THREE.Vector3(0.042, 0, -0.03);              // the middle of the deck
export const U = new THREE.Vector3(0.878, -0.479, 0).normalize(); // screen left-to-right from the default camera
export const V = new THREE.Vector3(0, 0, 1).cross(U);             // away from the default camera
export const Z = new THREE.Vector3(0, 0, 1);
export const G0 = -1.9, ZT = -0.8;                                // the dancefloor; the top of the rise (under the road case)
export const R_STACK = 6.5;                                       // how far out the stacks stand
export const NBEAM = 12, NSTACK = 6;

export const smooth01 = (x) => { x = Math.max(0, Math.min(1, x)); return x * x * (3 - 2 * x); };
export const clamp01 = (x) => Math.max(0, Math.min(1, x));
// the rise the booth stands on: flat on top, sloping to the floor
export const riseZ = (r) => G0 + (ZT - G0) * (1 - smooth01((r - 1.25) / 2.2));
// a direction on the ground, `a` radians round from V (straight ahead of the default camera) toward U (its right)
export const dirAt = (a, out) => out.set(V.x * Math.cos(a) + U.x * Math.sin(a), V.y * Math.cos(a) + U.y * Math.sin(a), 0);
export function rng(seed) {
  let s = seed >>> 0;
  return () => { s = (s + 0x6D2B79F5) >>> 0; let t = s; t = Math.imul(t ^ (t >>> 15), t | 1); t ^= t + Math.imul(t ^ (t >>> 7), t | 61); return ((t ^ (t >>> 14)) >>> 0) / 4294967296; };
}
export const hash1 = (n) => { const x = Math.sin(n * 127.1 + 311.7) * 43758.5453; return x - Math.floor(x); };

// the rig's colours: flash (the light on the camera), a / b (beams, washes, bulbs), strobe, laser, moon
const hex = (h) => new THREE.Color(h);
export const PALETTES = {
  flash: { flash: hex('#ff8a3a'), a: hex('#f06a2a'), b: hex('#f2d34b'), strobe: hex('#fff0c4'), laser: hex('#f2d34b'), moon: hex('#e9dfc6') },
  sodium: { flash: hex('#ff9a2c'), a: hex('#ff7a14'), b: hex('#ffb84a'), strobe: hex('#ffd89a'), laser: hex('#ffb84a'), moon: hex('#f0d9a8') },
  acid: { flash: hex('#f6e04a'), a: hex('#cdf03a'), b: hex('#f06a2a'), strobe: hex('#fbffc8'), laser: hex('#b9ff3c'), moon: hex('#eef0c0') },
  blood: { flash: hex('#ff6a3c'), a: hex('#f02a1c'), b: hex('#ff8f2e'), strobe: hex('#ffd8c0'), laser: hex('#ff2418'), moon: hex('#e2482c') },
  uv: { flash: hex('#ff8a3a'), a: hex('#7a3cff'), b: hex('#f06a2a'), strobe: hex('#e9ddff'), laser: hex('#a36bff'), moon: hex('#d9d0f0') },
  ether: { flash: hex('#ffd29a'), a: hex('#35d6e2'), b: hex('#f2d34b'), strobe: hex('#eaffff'), laser: hex('#5cf2ff'), moon: hex('#d6eef2') },
  ember: { flash: hex('#e0602a'), a: hex('#a83c16'), b: hex('#c97a2c'), strobe: hex('#ffc890'), laser: hex('#ff7a2a'), moon: hex('#d8b08a') },
  cold: { flash: hex('#ffb478'), a: hex('#f2d34b'), b: hex('#8fa9da'), strobe: hex('#f0f4ff'), laser: hex('#bcd0ff'), moon: hex('#dfe6f2') },
  dawn: { flash: hex('#ffc490'), a: hex('#ffd49a'), b: hex('#ff9a78'), strobe: hex('#fff1e0'), laser: hex('#ffd49a'), moon: hex('#f2e6dc') },
};

export const GLSL_NOISE = `
float h21(vec2 p) { p = fract(p * vec2(123.34, 456.21)); p += dot(p, p + 45.32); return fract(p.x * p.y); }
float vn(vec2 p) { vec2 i = floor(p), f = fract(p); f = f * f * (3.0 - 2.0 * f); return mix(mix(h21(i), h21(i + vec2(1.0, 0.0)), f.x), mix(h21(i + vec2(0.0, 1.0)), h21(i + vec2(1.0, 1.0)), f.x), f.y); }
float fbm(vec2 p) { float s = 0.0, a = 0.5; for (int i = 0; i < 4; i++) { s += a * vn(p); p = p * 2.07 + 11.3; a *= 0.5; } return s; }
`;
// every lit thing shares these lights: the flash on the camera (falls off fast: near things burn, the rest stays
// black), the work-light by the deck, this beat's strobe on the rig, the stacks' wash, and the sky when dawn comes
export const GLSL_LIGHT = `
uniform vec3 uEye, uCtr, uFlashCol, uWorkPos, uWorkDir, uWorkCol, uStrobePos, uStrobeCol, uAmb, uSunDir, uSunCol, uHaze, uWashCol;
uniform float uFogK, uTime;
vec3 dbLight(vec3 P, vec3 N, float wrap) {
  vec3 d = uEye - P; float dd = dot(d, d);
  vec3 L = uFlashCol * (wrap + (1.0 - wrap) * max(dot(N, d * inversesqrt(dd)), 0.0)) / (1.0 + dd * 0.22);
  d = uWorkPos - P; dd = dot(d, d); vec3 l = d * inversesqrt(dd);
  L += uWorkCol * (wrap + (1.0 - wrap) * max(dot(N, l), 0.0)) * (0.07 + 0.93 * smoothstep(0.35, 0.85, dot(-l, uWorkDir))) / (0.25 + dd);
  d = uStrobePos - P; dd = dot(d, d); l = d * inversesqrt(dd);
  L += uStrobeCol * (wrap + (1.0 - wrap) * max(dot(N, l), 0.0)) / (1.0 + dd * 0.1);
  vec2 q = P.xy - uCtr.xy; float r = length(q);
  L += uWashCol * exp(-abs(r - 6.0) * 0.4) * (wrap + (1.0 - wrap) * max(dot(N, normalize(vec3(q / max(r, 0.001), 0.3))), 0.0));
  L += uAmb * (0.65 + 0.35 * N.z) + uSunCol * (wrap * 0.5 + (1.0 - wrap * 0.5) * max(dot(N, uSunDir), 0.0));
  return L;
}
vec3 dbFog(vec3 c, vec3 P) { return mix(c, uHaze, 1.0 - exp(-distance(P, uEye) * uFogK)); }
vec3 dbOut(vec3 c) { c = pow(1.0 - exp(-max(c, 0.0) * 1.5), vec3(0.5)); return mix(c, c * c * (3.0 - 2.0 * c), 0.45); }
`;
export function lightUniforms() {
  const v = () => ({ value: new THREE.Vector3() }), c = () => ({ value: new THREE.Color(0, 0, 0) });
  return {
    uEye: v(), uCtr: { value: C }, uTime: { value: 0 }, uFogK: { value: 0.02 },
    uFlashCol: c(), uWorkPos: v(), uWorkDir: v(), uWorkCol: c(), uStrobePos: v(), uStrobeCol: c(), uAmb: c(), uSunDir: v(), uSunCol: c(), uHaze: c(), uWashCol: c(),
  };
}
