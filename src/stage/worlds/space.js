// Out of this world: what the Currents world turns into as the deck leaves the ground (Let It Happen's journey).
// All of it is still Currents: violet, chrome, op-art stripes, the red line. Stars are dashes of flow, the planet is
// banded like the cover's lines, its ring is a record, and the galaxy is a groove's spiral.
//
// Knobs (all 0 = not there, so other songs never see any of this):
//   alt     altitude: 0 the river; ~0.35 through the clouds; 0.6+ black sky and stars
//   planet  the planet rising beneath     ring  its ring, which is a record
//   warp    hyperspace: a tunnel of stripes streaming past     nebula  colour in the dark (the palette's sky)
//   galaxy  a spiral galaxy, wound like a groove                into    flying into the chrome sun
import * as THREE from 'three';

const smooth = (a, b, x) => { const t = Math.max(0, Math.min(1, (x - a) / (b - a))); return t * t * (3 - 2 * t); };

const NOISE = `
float h21(vec2 p) { p = fract(p * vec2(123.34, 456.21)); p += dot(p, p + 45.32); return fract(p.x * p.y); }
float vnoise(vec2 p) { vec2 i = floor(p), f = fract(p); f = f * f * (3.0 - 2.0 * f);
  return mix(mix(h21(i), h21(i + vec2(1, 0)), f.x), mix(h21(i + vec2(0, 1)), h21(i + vec2(1, 1)), f.x), f.y); }
float fbm(vec2 p) { float s = 0.0, a = 0.5; for (int i = 0; i < 5; i++) { s += a * vnoise(p); p = p * 2.03 + 17.1; a *= 0.5; } return s; }`;

// ---- clouds: soft sheets the deck rises through ----
const CLOUD_VS = `varying vec2 vUv; varying vec3 vW; void main() { vUv = uv; vec4 w = modelMatrix * vec4(position, 1.0); vW = w.xyz; gl_Position = projectionMatrix * viewMatrix * w; }`;
const CLOUD_FS = `${NOISE}
uniform float uT, uA, uSeed; uniform vec3 uCol, uLit, uC; varying vec2 vUv; varying vec3 vW;
void main() {
  vec2 p = vW.xy * 0.55 + vec2(uT * 0.03, uSeed);
  float d = fbm(p) * 0.75 + fbm(p * 3.1 + uT * 0.05) * 0.35;
  float a = smoothstep(0.38, 0.78, d) * uA * smoothstep(30.0, 6.0, length(vW.xy - uC.xy));
  vec3 c = mix(uCol, uLit, smoothstep(0.5, 1.0, d));
  gl_FragColor = vec4(c, a);
}`;
// ---- the planet: banded like the cover, lit from the sun, with an atmosphere at the rim ----
const PLANET_VS = `varying vec3 vN, vW, vO; void main() { vO = normal; vN = normalize(mat3(modelMatrix) * normal); vec4 w = modelMatrix * vec4(position, 1.0); vW = w.xyz; gl_Position = projectionMatrix * viewMatrix * w; }`;
const PLANET_FS = `${NOISE}
uniform float uT; uniform vec3 uSunDir, uA, uB, uRed, uGlow; varying vec3 vN, vW, vO;
void main() {
  vec3 n = normalize(vN), o = normalize(vO);          // lit in the world, patterned on the planet (its poles turned away)
  float lat = asin(clamp(o.z, -1.0, 1.0)), lon = atan(o.y, o.x);
  float warp = fbm(vec2(lon * 9.0 + uT * 0.01, lat * 14.0)) * 1.6;
  float band = sin(lat * 150.0 + warp * 6.0 + sin(lon * 9.0) * 0.8);
  vec3 c = mix(uA, uB, smoothstep(-0.2, 0.6, band));
  c = mix(c, uRed, smoothstep(0.99, 1.0, sin(lat * 23.0 + warp)));
  float haze = pow(1.0 - max(0.0, dot(n, normalize(cameraPosition - vW))), 1.5);   // the air, thicker toward the limb
  float lit = smoothstep(-0.15, 0.4, dot(n, uSunDir));
  vec3 V = normalize(cameraPosition - vW);
  float rim = pow(1.0 - max(0.0, dot(n, V)), 3.0);
  c = mix(c * (0.16 + 0.84 * lit), uGlow * (0.15 + 0.6 * lit), haze * 0.6) + uGlow * rim * (0.35 + 1.4 * lit);
  gl_FragColor = vec4(c, 1.0);
}`;
const HALO_FS = `uniform vec3 uGlow, uSunDir; varying vec3 vN, vW, vO;
void main() { vec3 n = normalize(vN), V = normalize(cameraPosition - vW); float f = pow(max(0.0, 1.0 - abs(dot(n, V))), 2.5);
  float lit = smoothstep(-0.3, 0.5, dot(n, uSunDir)); gl_FragColor = vec4(uGlow * f * (0.3 + 1.5 * lit), f * (0.35 + 0.65 * lit)); }`;
// ---- the ring is a record: black, finely grooved, catching a rainbow where the light glances off it ----
const RING_VS = `varying vec3 vW; varying vec2 vL; void main() { vL = position.xy; vec4 w = modelMatrix * vec4(position, 1.0); vW = w.xyz; gl_Position = projectionMatrix * viewMatrix * w; }`;
const RING_FS = `uniform float uA, uIn, uOut, uT; uniform vec3 uSunDir, uCtr; varying vec3 vW; varying vec2 vL;
vec3 hue(float h) { return clamp(abs(mod(h * 6.0 + vec3(0.0, 4.0, 2.0), 6.0) - 3.0) - 1.0, 0.0, 1.0); }
void main() {
  float r = length(vL), u = (r - uIn) / (uOut - uIn);
  float groove = 0.5 + 0.5 * sin(r * 9.0 + atan(vL.y, vL.x) * 0.0);
  float fine = 0.5 + 0.5 * sin(r * 61.0);
  float gaps = smoothstep(0.0, 0.01, abs(fract(u * 6.0 + 0.5) - 0.5) - 0.012);   // the gaps between tracks
  vec3 V = normalize(cameraPosition - vW);
  float a = atan(vL.y, vL.x);
  float sheen = pow(abs(sin(a + dot(V, uSunDir) * 3.0 + uT * 0.05)), 60.0) * (0.4 + 0.6 * fine);
  vec3 c = vec3(0.018) + vec3(0.04) * groove * fine;
  c += (hue(u * 1.2 + a * 0.05 + 0.6) * 0.14 + vec3(0.75, 0.72, 0.85) * 0.2) * sheen;
  float edge = smoothstep(0.0, 0.02, u) * smoothstep(1.0, 0.97, u);
  gl_FragColor = vec4(c, uA * edge * (0.75 + 0.25 * gaps));
}`;
// ---- hyperspace: a tunnel of stripes streaming past ----
const TUNNEL_VS = `varying vec2 vUv; varying vec3 vW; void main() { vUv = uv; vec4 w = modelMatrix * vec4(position, 1.0); vW = w.xyz; gl_Position = projectionMatrix * viewMatrix * w; }`;
const TUNNEL_FS = `uniform float uA, uT, uSpeed; uniform vec3 uLine, uRed, uDark; varying vec2 vUv;
float h(float x) { return fract(sin(x * 91.7) * 43758.5); }
void main() {
  float lane = floor(vUv.x * 160.0), id = h(lane);
  float s = fract(vUv.y * (2.0 + 4.0 * id) - uT * uSpeed * (0.6 + id));
  float dash = smoothstep(0.0, 0.05, s) * smoothstep(1.0, 0.55, s);
  float stripe = smoothstep(0.35, 0.5, abs(fract(vUv.x * 160.0) - 0.5) * 2.0);
  vec3 c = mix(uDark, uLine, dash * (1.0 - stripe) * (0.3 + 0.7 * id));
  if (lane == 37.0 || lane == 113.0) c = mix(c, uRed * 1.5, dash);
  float ends = smoothstep(0.0, 0.25, vUv.y) * smoothstep(1.0, 0.75, vUv.y);
  gl_FragColor = vec4(c, uA * ends * (0.25 + 0.75 * dash));
}`;
// ---- the galaxy: points on a groove's spiral ----
const GAL_VS = `attribute float aR, aK; uniform float uT, uSize; varying float vK, vR;
void main() { vK = aK; vR = aR; vec4 mv = modelViewMatrix * vec4(position, 1.0); gl_PointSize = uSize * (0.6 + aK) / max(1.0, -mv.z) * 60.0; gl_Position = projectionMatrix * mv; }`;
const GAL_FS = `uniform float uA; uniform vec3 uCore, uArm; varying float vK, vR;
void main() { vec2 q = gl_PointCoord - 0.5; float d = dot(q, q); if (d > 0.25) discard;
  vec3 c = mix(uCore, uArm, smoothstep(0.0, 0.7, vR)); gl_FragColor = vec4(c * (0.6 + vK), uA * smoothstep(0.25, 0.0, d) * (0.4 + 0.6 * vK)); }`;

export class Space {
  constructor(root, C, U, V) {
    this.C = C; this.U = U; this.V = V;
    const Z = new THREE.Vector3(0, 0, 1);
    // clouds: three sheets above the deck that sink past it as it climbs
    this.clouds = [0, 1, 2].map((i) => {
      const u = { uT: { value: 0 }, uA: { value: 0 }, uSeed: { value: i * 13.7 }, uCol: { value: new THREE.Color('#8c78b0') }, uLit: { value: new THREE.Color('#f4eef7') }, uC: { value: C } };
      const m = new THREE.Mesh(new THREE.PlaneGeometry(70, 70), new THREE.ShaderMaterial({ vertexShader: CLOUD_VS, fragmentShader: CLOUD_FS, uniforms: u, transparent: true, depthWrite: false, side: THREE.DoubleSide }));
      m.frustumCulled = false; m.userData.u = u; m.userData.base = 1.4 + i * 0.75; root.add(m); return m;
    });
    // the planet, far below until it is needed
    this.R = 60;                                                    // big and far enough to read as orbit, inside the far plane
    this.planetU = { uT: { value: 0 }, uSunDir: { value: new THREE.Vector3(0, 1, 0.2).normalize() }, uA: { value: new THREE.Color('#2a1a45') }, uB: { value: new THREE.Color('#b79ad6') }, uRed: { value: new THREE.Color('#e0322b') }, uGlow: { value: new THREE.Color('#d9a0ff') } };
    this.planet = new THREE.Mesh(new THREE.SphereGeometry(this.R, 128, 64), new THREE.ShaderMaterial({ vertexShader: PLANET_VS, fragmentShader: PLANET_FS, uniforms: this.planetU }));
    this.halo = new THREE.Mesh(new THREE.SphereGeometry(this.R * 1.035, 96, 48), new THREE.ShaderMaterial({ vertexShader: PLANET_VS, fragmentShader: HALO_FS, uniforms: this.planetU, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending, side: THREE.BackSide }));
    // its ring: a record, tilted so it sweeps across the view
    this.ringU = { uA: { value: 0 }, uIn: { value: this.R * 1.35 }, uOut: { value: this.R * 2.2 }, uT: { value: 0 }, uSunDir: this.planetU.uSunDir, uCtr: { value: new THREE.Vector3() } };
    this.ring = new THREE.Mesh(new THREE.RingGeometry(this.R * 1.35, this.R * 2.2, 256, 4), new THREE.ShaderMaterial({ vertexShader: RING_VS, fragmentShader: RING_FS, uniforms: this.ringU, transparent: true, depthWrite: false, side: THREE.DoubleSide }));
    this.globe = new THREE.Group(); this.globe.add(this.planet, this.halo, this.ring);
    this.ring.rotation.set(0.32, -0.18, 0);
    this.planet.rotation.set(1.25, 0.4, 0);                          // keep its pole (where the bands pinch) out of sight
    root.add(this.globe);
    // hyperspace: a long open tube along the view
    this.tunU = { uA: { value: 0 }, uT: { value: 0 }, uSpeed: { value: 1 }, uLine: { value: new THREE.Color('#f4eef7') }, uRed: { value: new THREE.Color('#e0322b') }, uDark: { value: new THREE.Color('#1a0f2e') } };
    const tg = new THREE.CylinderGeometry(1.6, 1.6, 80, 160, 1, true);
    this.tunnel = new THREE.Mesh(tg, new THREE.ShaderMaterial({ vertexShader: TUNNEL_VS, fragmentShader: TUNNEL_FS, uniforms: this.tunU, transparent: true, depthWrite: false, side: THREE.BackSide, blending: THREE.AdditiveBlending }));
    this.tunnel.frustumCulled = false; root.add(this.tunnel);
    // the galaxy: two arms, each an Archimedean spiral like a record's groove, plus a bulge
    const N = 26000, pos = new Float32Array(N * 3), rr = new Float32Array(N), kk = new Float32Array(N);
    let seed = 7; const rnd = () => ((seed = (seed * 16807) % 2147483647) / 2147483647);
    for (let i = 0; i < N; i++) {
      const arm = i % 2, th = Math.pow(rnd(), 0.8) * 5.5 * Math.PI, r = th / (5.5 * Math.PI), sc = 0.08 + 0.18 * r;
      const a = th + arm * Math.PI + (rnd() - 0.5) * sc * 2.2, rad = r * 14 + (rnd() - 0.5) * sc * 6;
      const bulge = i % 9 === 0;
      const R0 = bulge ? Math.pow(rnd(), 2) * 3 : rad, A0 = bulge ? rnd() * 6.283 : a;
      pos.set([Math.cos(A0) * R0, Math.sin(A0) * R0, (rnd() - 0.5) * (bulge ? 1.6 : 0.5) * (1 - r * 0.6)], i * 3);
      rr[i] = bulge ? 0 : r; kk[i] = Math.pow(rnd(), 3);
    }
    const gg = new THREE.BufferGeometry(); gg.setAttribute('position', new THREE.BufferAttribute(pos, 3)); gg.setAttribute('aR', new THREE.BufferAttribute(rr, 1)); gg.setAttribute('aK', new THREE.BufferAttribute(kk, 1));
    this.galU = { uT: { value: 0 }, uSize: { value: 2.2 }, uA: { value: 0 }, uCore: { value: new THREE.Color('#fff2e0') }, uArm: { value: new THREE.Color('#b79ad6') } };
    this.galaxy = new THREE.Points(gg, new THREE.ShaderMaterial({ vertexShader: GAL_VS, fragmentShader: GAL_FS, uniforms: this.galU, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending }));
    this.galaxy.frustumCulled = false;
    this.galaxy.position.copy(C).addScaledVector(V, 42).addScaledVector(Z, -1).addScaledVector(U, -8);
    this.galaxy.lookAt(C.clone().addScaledVector(Z, -20)); this.galaxy.rotateX(0.5);
    root.add(this.galaxy);
    this.Z = Z;
  }
  // p: blended act parameters; pal: the world's current palette; returns what the rest of the world should do
  update(dt, p, s, t, pal, sunDir) {
    const C = this.C, Z = this.Z, alt = p.alt || 0;
    const space = smooth(0.42, 0.8, alt), cloudy = smooth(0.12, 0.3, alt) * (1 - smooth(0.55, 0.75, alt));
    // clouds sink past as the deck climbs (altitude in metres-ish: alt 1 = 6 m above the river)
    for (const m of this.clouds) {
      const z = C.z + m.userData.base - alt * 6;
      m.position.set(C.x, C.y, z); const u = m.userData.u;
      u.uT.value = t; u.uA.value = cloudy * 0.95; u.uLit.value.copy(pal.line).lerp(new THREE.Color('#ffffff'), 0.6); u.uCol.value.copy(pal.mid).lerp(pal.line, 0.55);
      m.visible = u.uA.value > 0.003;
    }
    // the planet: rises from far below as `planet` goes to 1
    const pk = p.planet || 0;
    this.globe.visible = pk > 0.002;
    this.globe.position.copy(C).addScaledVector(Z, -(this.R + 1.4 + (1 - pk) * (1 - pk) * 40)).addScaledVector(this.V, 5 + 8 * (1 - pk));
    this.planetU.uT.value = t; this.planetU.uSunDir.value.copy(sunDir);
    this.planetU.uA.value.copy(pal.bot).lerp(pal.mid, 0.4); this.planetU.uB.value.copy(pal.line).lerp(pal.mid, 0.5);
    this.planetU.uGlow.value.copy(pal.sun.r + pal.sun.g + pal.sun.b > 0.3 ? pal.sun : pal.line).multiplyScalar(0.8);
    this.ringU.uA.value = (p.ring || 0) * pk; this.ringU.uT.value = t; this.ring.visible = this.ringU.uA.value > 0.003;
    this.globe.rotation.z = t * 0.004;
    // hyperspace: the tube lies along the view, so it has to follow the camera's heading
    const w = p.warp || 0;
    this.tunU.uA.value = w; this.tunU.uT.value += dt * (0.4 + 3.2 * w) * (s.rate ?? 1); this.tunU.uSpeed.value = 1;
    this.tunU.uLine.value.copy(pal.line); this.tunU.uDark.value.copy(pal.mid).multiplyScalar(0.4);
    this.tunnel.visible = w > 0.003;
    this.galU.uA.value = p.galaxy || 0; this.galU.uT.value = t; this.galaxy.visible = this.galU.uA.value > 0.003;
    this.galaxy.rotation.z += dt * 0.02 * (s.rate ?? 1);
    this.galU.uArm.value.copy(pal.line).lerp(pal.mid, 0.3);
    return { space, cloudy };
  }
  // the tunnel points along the camera's view (called with the eye before rendering)
  aim(eye, at) {
    if (!this.tunnel.visible) return;
    const d = at.clone().sub(eye).normalize();
    this.tunnel.position.copy(eye).addScaledVector(d, 20);
    this.tunnel.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), d);
  }
}
