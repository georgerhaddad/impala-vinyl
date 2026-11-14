// The Slow Rush's set piece: an hourglass standing in the sand behind the deck. It runs out once per song (the
// upper bulb holds what is left of the track), `glass` is its size, `glassTurn` turns it over (in half turns, so an
// act that changes it by 1 flips it during its fadeIn), and a time-lapse running backwards (`rush` < 0) sends the
// sand in it back up. It stands in the room's own light: in a sun patch it shines, in the shade it is a silhouette.
import * as THREE from 'three';
import { AZ, FLOOR, ZB, COMMON } from './slow-rush-room.js';

const AT = [0.5, 0.38];                                             // where it stands, room space
const HALF = 0.13;                                                   // half its height at glass = 1
// the glass's radius at height t (-1 foot .. 0 neck .. 1 top), in units of HALF
const radius = (t) => 0.055 + 0.43 * Math.pow(Math.sin(Math.PI * Math.pow(Math.min(1, Math.abs(t)), 0.85)), 0.7);

const VS = COMMON + `
varying vec3 vR, vN, vL;
void main() { vec4 w = modelMatrix * vec4(position, 1.0); vR = toRoom(w.xyz); vN = dirToRoom(normalize(mat3(modelMatrix) * normal)); vL = position; gl_Position = projectionMatrix * viewMatrix * w; }`;
const SOLID_FS = COMMON + `
uniform vec3 uCol; uniform vec2 uLevel; uniform float uClip, uFlip;
varying vec3 vR, vN, vL;
void main() {
  float yy = vL.y * uFlip; if (uClip > 0.5 && (yy > 0.0 ? yy > uLevel.x : yy > uLevel.y)) discard;       // the sand only fills each bulb so far
  vec3 n = normalize(vN); if (!gl_FrontFacing) n = -n;
  gl_FragColor = vec4(finish(lit(uCol * (0.85 + 0.3 * vn(vL.xz * 60.0 + vL.y * 37.0)), n, sunVis(vR + n * 0.01), 1.0 - uOpen)), 1.0);
}`;
const GLASS_FS = COMMON + `
uniform vec3 uTop, uHor;
varying vec3 vR, vN, vL;
void main() {
  vec3 n = normalize(vN), v = normalize(vR - uEyeR); if (dot(n, v) > 0.0) n = -n;
  float fr = pow(1.0 - max(dot(n, -v), 0.0), 2.5);
  vec3 rf = reflect(v, n);
  vec3 env = mix(uHor, uTop, clamp(rf.z * 1.5, 0.0, 1.0)) * (0.35 + 0.65 * smoothstep(-0.2, 0.3, rf.z)) + uAmb * 0.3;
  float vis = sunVis(vR + n * 0.01);
  vec3 c = env * (0.25 + 0.75 * fr) + uSunCol * vis * (pow(max(dot(rf, uSunR), 0.0), 90.0) * 3.0 + pow(max(dot(rf, uSunR), 0.0), 12.0) * 0.12);
  gl_FragColor = vec4(finish(c), clamp(0.07 + 0.75 * fr + vis * 0.05, 0.0, 1.0));
}`;

export class Hourglass {
  constructor(scene, U) {
    this.U = U;
    const g = this.group = new THREE.Group(), tilt = this.tilt = new THREE.Group();
    g.rotation.x = Math.PI / 2;                                     // lathes are built up the y axis; the world's up is z
    g.add(tilt); scene.add(g);
    const ca = Math.cos(AZ), sa = Math.sin(AZ);
    this.home = new THREE.Vector3(0.042 + ca * AT[0] - sa * AT[1], sa * AT[0] + ca * AT[1], FLOOR + ZB);
    const prof = (k, n = 56) => Array.from({ length: n + 1 }, (_, i) => { const t = -1 + 2 * i / n; return new THREE.Vector2(radius(t) * k, t); });
    const mat = (fs, extra, o = {}) => new THREE.ShaderMaterial({ vertexShader: VS, fragmentShader: fs, uniforms: { ...U, ...extra }, ...o });
    const sandCol = { value: U.uSandC.value }, wood = { value: new THREE.Color('#2a1710') }, brass = { value: new THREE.Color('#8a5a24') };
    this.level = { value: new THREE.Vector2(0.5, -0.5) }; this.flip = { value: 1 };
    const on = { value: 1 }, off = { value: 0 };
    const add = (geo, m, order) => { const mesh = new THREE.Mesh(geo, m); mesh.frustumCulled = false; mesh.renderOrder = order; tilt.add(mesh); return mesh; };
    add(new THREE.LatheGeometry(prof(0.93), 40), mat(SOLID_FS, { uCol: sandCol, uLevel: this.level, uFlip: this.flip, uClip: on }, { side: THREE.DoubleSide }), 8);
    const solid = (col) => mat(SOLID_FS, { uCol: col, uLevel: this.level, uFlip: this.flip, uClip: off }, { side: THREE.DoubleSide });
    this.capTop = add(new THREE.CylinderGeometry(1, 1, 0.004, 40), solid(sandCol), 8);
    this.capBot = add(new THREE.ConeGeometry(1, 1, 40), solid(sandCol), 8);
    this.fall = add(new THREE.CylinderGeometry(0.012, 0.016, 1, 8), solid(sandCol), 8);
    for (const y of [-1.04, 1.04]) { const d = add(new THREE.CylinderGeometry(0.6, 0.6, 0.08, 48), solid(wood), 8); d.position.y = y; }
    for (let i = 0; i < 3; i++) { const a = i / 3 * Math.PI * 2 + 0.5, p = add(new THREE.CylinderGeometry(0.03, 0.03, 2.08, 12), solid(brass), 8); p.position.set(Math.cos(a) * 0.52, 0, Math.sin(a) * 0.52); }
    add(new THREE.LatheGeometry(prof(1), 48), mat(GLASS_FS, {}, { transparent: true, depthWrite: false, side: THREE.DoubleSide }), 9);
    this.a = 1; this.lastProg = null; g.visible = false;
  }
  update(dt, p, s) {
    const size = p.glass || 0, g = this.group;
    g.visible = size > 0.01;
    const prog = s.progress || 0, turn = p.glassTurn || 0, ang = turn * Math.PI, aUp = Math.cos(ang) >= 0, rush = p.rush || 0;
    // chamber A holds `a` of the sand; whichever chamber is up runs into the other (or back, when time does)
    const dp = this.lastProg == null ? 1 : prog - this.lastProg; this.lastProg = prog;
    if (dp < 0 || dp > 0.02) this.a = aUp ? 1 - prog : prog;
    else { const run = (dp + dt * Math.abs(rush) * 0.08) * (rush < -0.05 ? -1 : 1) * (aUp ? -1 : 1); this.a = Math.max(0, Math.min(1, this.a + run)); }
    if (!g.visible) return;
    const half = HALF * size;
    g.scale.setScalar(half); g.position.copy(this.home); g.position.z += half * 1.08;
    this.tilt.rotation.z = ang;
    // the sand lies at the bottom of whichever way is up: levels are measured along world up (local y, mirrored when turned over)
    const flip = aUp ? 1 : -1, upAmt = aUp ? this.a : 1 - this.a, dnAmt = 1 - upAmt;
    const tUp = 0.07 + 0.66 * Math.pow(upAmt, 0.62), tDn = -0.97 + 0.62 * Math.pow(dnAmt, 0.62);
    this.flip.value = flip; this.level.value.set(upAmt > 0.002 ? tUp : 0, tDn);
    this.capTop.visible = upAmt > 0.002; this.capBot.visible = dnAmt > 0.002;
    this.capTop.position.y = flip * tUp; this.capTop.scale.set(radius(tUp) * 0.92, 1, radius(tUp) * 0.92);
    const rb = radius(tDn) * 0.92, hb = Math.min(0.2, rb * 0.6);
    this.capBot.position.y = flip * (tDn + hb / 2); this.capBot.scale.set(rb, flip * hb, rb);
    this.fall.visible = upAmt > 0.002 && dnAmt < 0.998 && Math.abs(Math.sin(ang)) < 0.2;
    this.fall.position.y = flip * (tDn + hb) / 2; this.fall.scale.set(1, Math.max(0.01, -(tDn + hb)), 1);
  }
}
