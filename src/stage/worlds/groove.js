// Inside the groove: where Let It Happen's record sticks, the camera goes down the stylus and into the cut.
// The canyon is the real groove under the needle: its two walls, and the neighbouring turns of the spiral either
// side, sampled every frame from the record that is playing (a light copy of the cut walls, made when the record
// went on the platter: see main.js). So the walls are the music, and when the music loops, so does the canyon.
// The groove's top edges glow like the river's flow lines, the stylus rides ahead, dust drifts past.
import * as THREE from 'three';
import { grooveRadius } from '../../geometry.js';

const TAU = Math.PI * 2, SQ2 = Math.SQRT2;
const ROWS = 9, COLS = 220, SPAN = 4200;          // turns of the spiral shown, points along each, cut samples either side of the needle
const LEN = 14, K = 1e4;                          // world units for SPAN along the groove; units per metre across it (100 um = 1)
const DEPTH = 1.6;                                // the cut is exaggerated in depth so the canyon reads

export class Groove {
  constructor() {
    this.scene = new THREE.Scene();
    this.cam = new THREE.PerspectiveCamera(58, 1, 0.02, 80); this.cam.up.set(0, 0, 1);
    this.fog = this.scene.fog = new THREE.FogExp2(0x07040e, 0.11);
    this.bg = new THREE.Color(0x07040e); this.scene.background = this.bg;
    // the canyon: one strip across all the turns (land, wall, floor, wall, land, ...), COLS long
    this.across = 2 + ROWS * 3;
    const n = COLS * this.across, pos = new Float32Array(n * 3), idx = [];
    for (let c = 0; c + 1 < COLS; c++) for (let k = 0; k + 1 < this.across; k++) {
      const a = c * this.across + k, b = a + this.across;
      idx.push(a, b, a + 1, a + 1, b, b + 1);
    }
    const g = this.geo = new THREE.BufferGeometry();
    g.setAttribute('position', new THREE.BufferAttribute(pos, 3)); g.setIndex(idx);
    this.mat = new THREE.MeshStandardMaterial({ color: 0x1a1028, roughness: 0.2, metalness: 0.3, emissive: 0x0a0612, side: THREE.DoubleSide });
    this.mesh = new THREE.Mesh(g, this.mat); this.mesh.frustumCulled = false; this.scene.add(this.mesh);
    // the top edges of every wall, glowing
    const ep = new Float32Array(ROWS * 2 * COLS * 3), eidx = [];
    for (let e = 0; e < ROWS * 2; e++) for (let c = 0; c + 1 < COLS; c++) eidx.push(e * COLS + c, e * COLS + c + 1);
    this.edgeGeo = new THREE.BufferGeometry(); this.edgeGeo.setAttribute('position', new THREE.BufferAttribute(ep, 3)); this.edgeGeo.setIndex(eidx);
    this.edgeMat = new THREE.LineBasicMaterial({ color: 0xf4eef7, transparent: true, opacity: 0.8, fog: true });
    this.edges = new THREE.LineSegments(this.edgeGeo, this.edgeMat); this.edges.frustumCulled = false; this.scene.add(this.edges);
    // the stylus: a diamond on a cantilever, riding the groove at the middle
    this.stylus = new THREE.Group();
    // a diamond: an octahedron drawn out to a point, faceted so the lamp catches each face
    this.gemMat = new THREE.MeshStandardMaterial({ color: 0xdfe6ff, metalness: 0.15, roughness: 0.08, emissive: 0x1a1430, flatShading: true });
    const tip = new THREE.Mesh(new THREE.OctahedronGeometry(0.42, 0), this.gemMat);
    tip.scale.set(1, 1, 2.1); tip.position.z = 0.88;
    // the cantilever leaves upward and away down the groove, out of the camera's way
    const arm = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.08, 9, 10), new THREE.MeshStandardMaterial({ color: 0x9da1ab, metalness: 1, roughness: 0.25 }));
    arm.position.set(2.2, 0, 5.4); arm.rotation.y = 0.55;
    this.stylus.add(tip, arm); this.scene.add(this.stylus);
    // light: a lamp at the stylus, a low sun far down the groove, a little sky
    this.lamp = new THREE.PointLight(0xffffff, 6, 9, 1.6); this.scene.add(this.lamp);
    this.sun = new THREE.DirectionalLight(0xffffff, 1.6); this.sun.position.set(20, 3, 4); this.scene.add(this.sun);
    this.hemi = new THREE.HemisphereLight(0x8c78b0, 0x05030a, 0.8); this.scene.add(this.hemi);
    // dust: specks lying in the grooves, carried past with them
    const D = 160, dp = new Float32Array(D * 3); this.dust = [];
    for (let i = 0; i < D; i++) this.dust.push({ s: (Math.random() * 2 - 1) * SPAN * 6, row: Math.floor(Math.random() * ROWS) - (ROWS - 1) / 2, f: Math.random() });
    this.dustGeo = new THREE.BufferGeometry(); this.dustGeo.setAttribute('position', new THREE.BufferAttribute(dp, 3));
    this.dustPts = new THREE.Points(this.dustGeo, new THREE.PointsMaterial({ color: 0xffffff, size: 0.07, transparent: true, opacity: 0.85 }));
    this.dustPts.frustumCulled = false; this.scene.add(this.dustPts);
    this.shot = 0; this.prof = new Float32Array(ROWS * 3);
  }
  // tap: the light copy of the cut ({ wallIn, wallOut, step, rTab, spr, W, thetaEnd }); th: the needle's groove angle
  update(dt, p, s, tap, th, pal, t) {
    this.on = !!(tap && th != null);
    this.bg.copy(pal.bot).lerp(pal.mid, 0.12); this.fog.color.copy(this.bg);
    this.edgeMat.color.copy(pal.line); this.lamp.color.copy(pal.line).lerp(new THREE.Color(1, 1, 1), 0.5);
    this.sun.color.copy(pal.sun.r + pal.sun.g + pal.sun.b > 0.3 ? pal.sun : pal.acc); this.sun.intensity = 0.8 + 2.2 * (p.sun || 0);
    this.hemi.color.copy(pal.mid); this.mat.emissive.copy(pal.mid).multiplyScalar(0.06); this.gemMat.emissive.copy(pal.line).multiplyScalar(0.12 + 0.3 * (s.kick || 0));
    this.lamp.intensity = 5 + 6 * (s.kick || 0);
    this.edgeMat.opacity = 0.55 + 0.4 * (s.onset || 0);
    if (!this.on) return;
    // the canyon, from the cut, centred on the needle
    const { wallIn, wallOut, step, rTab, spr, W } = tap, rg0 = grooveRadius(rTab, th), s0 = th * spr / TAU;
    const P = this.geo.attributes.position.array, E = this.edgeGeo.attributes.position.array, half = (ROWS - 1) / 2;
    const n = wallIn.length;
    for (let c = 0; c < COLS; c++) {
      const ds = (c / (COLS - 1) * 2 - 1) * SPAN, x = ds / SPAN * LEN;
      let o = c * this.across * 3, prevB = null;
      // rows from the outermost turn inward, so the strip runs one way across
      for (let r = 0; r < ROWS; r++) {
        const g = r - half, thg = th + g * TAU + ds * TAU / spr, i = Math.round((s0 + g * spr + ds) / step);
        let a, b;
        if (i < 0 || i >= n || thg < 0) { a = g * 1.2e-4 - W; b = g * 1.2e-4 + W; }
        else { const rc = grooveRadius(rTab, thg) - rg0; a = rc - W + SQ2 * wallIn[i]; b = rc + W - SQ2 * wallOut[i]; }
        this.prof[r * 3] = a; this.prof[r * 3 + 1] = b;
      }
      // outermost (largest radius) first: rows with negative g are outer turns
      const ys = [];
      for (let r = 0; r < ROWS; r++) { const a = this.prof[r * 3], b = this.prof[r * 3 + 1]; ys.push([a, b]); }
      ys.sort((u, v) => u[0] - v[0]);
      const put = (y, z) => { P[o++] = x; P[o++] = y; P[o++] = z; };
      put((ys[0][0] - 2e-4) * K, 0);
      ys.forEach(([a, b], k) => {
        const w = Math.max(0, b - a);
        put(a * K, 0); put((a + b) / 2 * K, -w / 2 * K * DEPTH); put(b * K, 0);
        const e1 = ((k * 2) * COLS + c) * 3, e2 = ((k * 2 + 1) * COLS + c) * 3;
        E[e1] = x; E[e1 + 1] = a * K; E[e1 + 2] = 0.004; E[e2] = x; E[e2 + 1] = b * K; E[e2 + 2] = 0.004;
      });
      put((ys[ys.length - 1][1] + 2e-4) * K, 0);
    }
    this.geo.attributes.position.needsUpdate = true; this.geo.computeVertexNormals(); this.edgeGeo.attributes.position.needsUpdate = true;
    // the stylus sits in the middle groove, its tip down at the floor
    const mid = ROWS * 0 + 4 * 3 + 2;   // the middle row's floor point, at the middle column
    const mc = ((COLS - 1) >> 1) * this.across * 3 + mid * 3;
    this.stylus.position.set(0, P[mc + 1], P[mc + 2]);
    // dust rides with the cut
    const DP = this.dustGeo.attributes.position.array;
    this.dust.forEach((d, i) => {
      let rel = d.s - (s0 % (SPAN * 12)); rel = ((rel % (SPAN * 12)) + SPAN * 18) % (SPAN * 12) - SPAN * 6;
      DP[i * 3] = rel / SPAN * LEN; DP[i * 3 + 1] = (d.row * 0.72 + (d.f - 0.5) * 0.4); DP[i * 3 + 2] = 0.05 + d.f * 0.1;
    });
    this.dustGeo.attributes.position.needsUpdate = true;
    // the camera: chasing the stylus low in the groove, rising (`rise`) until the turns lie side by side below
    const rise = p.diveRise || 0, sway = Math.sin(t * 0.7) * 0.15, shot = Math.floor(t / 3.84) % 3;   // a new angle every two bars of the loop
    const low = [[-3.2, 0.12 + sway * 0.3, 0.55], [-2.2, -0.9, 0.9], [-3.6, 0.6, 0.35]][rise < 0.2 ? shot : 0];
    const high = [-7, 0.2, 7.5];
    const cp = low.map((v, k) => v + (high[k] - v) * rise);
    this.cam.position.set(cp[0], cp[1], cp[2]);
    this.cam.lookAt(5 - 3 * rise, P[mc + 1] * (1 - rise), -0.4 * (1 - rise));
    this.lamp.position.set(0.4, P[mc + 1], 0.9);
  }
  render(r, w, h) {
    if (!this.on) return;
    this.cam.aspect = w / h; this.cam.updateProjectionMatrix();
    r.clear(true, true, false);
    r.render(this.scene, this.cam);
  }
}
