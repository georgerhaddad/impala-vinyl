// Innerspeaker: a valley that folds into itself, forever. The turntable floats down a valley of hills, a river and
// trees that never arrives: the land lies on a cone whose tip is the vanishing point, and it is the same land at
// every scale (a gate of two peaks, the river through it, and through the gate the same valley again, smaller), so
// flying in is an endless Droste zoom. Then the valley floor curls up round the deck, over its head, and closes
// into a tube of hills that winds into a spiral and mirrors into a kaleidoscope.
// Sky on the first disc (blue, cloud, green hills), autumn on the second (rust, ochre, low golden light).
//
// Everything is a uniform (shaders in innerspeaker-glsl.js), so a cue sheet bends the whole valley at no cost:
//   fold    0 an open valley under the sky .. 1 the land closed overhead into a tube
//   twist   each level turned further than the last: the valley as a spiral (signed)      spin  the tube turning (rad/s)
//   kalei   the land mirrored into kaleiN sectors (1 = left/right, 3 = a triangle of valleys ...)
//   recur   the zoom's speed, on top of `flow`: 0 as `flow` says, -1 stopped, -2 backing out, +1 double
//   deep    a longer, slower fold: more levels between the deck and the vanishing point
//   pitch   where the valley leads: > 0 up into the sky, < 0 down under the deck      yaw  round to the side
//   cloud   clouds in the valley and overhead      leaves  leaves (seed fluff on the first disc) in the air
//   storm   rain, a dark sky and lightning
//   echo    the turntable again at every level: smaller and smaller toward the vanishing point, vast behind you
//   twin    one of those echoes come up out of the fold to float beside the deck, in negative
//   fluct   the fold rising and falling, two bars up, two bars down
//   town    0..0.5 houses gather by the river, ..1 they grow into a city      alt  (shared) the land dropping away beneath
// and the shared knobs: flow, turb, calm (the hills lie down), pulse, spark, sun (the vanishing point as a sun), fade.
// Palettes: sky gold dawn cloud (first disc), autumn amber dusk ember (second), night, storm; and the aliases the
// section presets use, which pick by disc: day, late, dark.
// Music: every kick sends a ring of light down the valley and heaves the hills; bass swells the sun; treble glints
// on the river and the leaves; the zoom runs with the song's energy, and with the record (backwards on a scratch).
import * as THREE from 'three';
import { RT, LAND_VS, LAND_FS, TREE_VS, TREE_FS, CLOUD_VS, CLOUD_FS, MOTE_VS, MOTE_FS, SKY_VS, SKY_FS, ECHO_VS, ECHO_FS, HOUSE_VS, HOUSE_FS } from './innerspeaker-glsl.js';

const C = new THREE.Vector3(0.042, 0, -0.03);                    // the middle of the deck (z up, metres)
const U = new THREE.Vector3(0.878, -0.479, 0).normalize(), Z = new THREE.Vector3(0, 0, 1), V = new THREE.Vector3().crossVectors(Z, U);   // screen right, up, away
const D0 = 4.5, R0 = 1.25;                                       // deck to vanishing point; the cone's radius at the deck
const DFLAT = 0.45, P0 = 0.51;                                   // the open valley's floor below the deck (cone radii); one level, in log-distance
const TILT0 = -0.5, YAW0 = -0.3;                                 // the valley leads downhill and off to the left: the vanishing point sits up and left of the deck in the default shot
const UMIN = -4.4, UMAX = 2.0, ROWS = 560, COLS = 300;
const TREES = 2600, TREE_LV = [-8, 2], PUFFS = 5, CLOUDS = 14, CLOUD_LV = [-6, 2], MOTES = 520, MOTE_LV = [-5, 1], ECHOES = [-2, -1, 1, 2, 3, 4, 5, 6, 100], HOUSES = 1500, HOUSE_LV = [-6, 2];      // echo 100 is the twin

const smooth01 = (x) => { x = Math.max(0, Math.min(1, x)); return x * x * (3 - 2 * x); };
const rnd = (x) => { const v = Math.sin(x * 127.1 + 1.7) * 43758.5453; return v - Math.floor(v); };
const wrapPi = (x) => x - Math.PI * 2 * Math.floor((x + Math.PI) / (Math.PI * 2));

// palettes. Sky: top / horizon / below it; haze (fog), glow (the vanishing point's light), sun; the light: amb, lit;
// the land: g1 g2 meadow, fo forest floor, rock, cap, water; t1..3 trees; cl cs cloud lit / shaded; m1..3 leaves.
// el: how high the light stands (0 = straight down the valley); star; th: where the bloom starts; fk: haze per metre;
// ln: how brightly the contour lines glow (the dark palettes are maps of themselves in neon); ink: the words.
// (label: the echo decks' label, orange where the trees are rust, the era's blue otherwise.)
const P = (top, hor, low, haze, glow, sun, amb, lit, g1, g2, fo, rock, cap, water, t1, t2, t3, cl, cs, m1, m2, m3, el, star, th, fk, ln, ink) =>
  ({ col: Object.fromEntries(Object.entries({ top, hor, low, haze, glow, sun, amb, lit, g1, g2, fo, rock, cap, water, t1, t2, t3, cl, cs, m1, m2, m3, label: t1 === '#c2412b' || t1 === '#8a2a1a' || t1 === '#a02a14' ? '#d9772b' : '#8fc3e6' }).map(([k, h]) => [k, new THREE.Color(h)])), el, star, th, fk, ln, ink });
const PALETTES = {
  sky: P('#2f7fd4', '#c3e0f2', '#a9cde2', '#b5d8ec', '#f2f9ff', '#fffbe6', '#a9cdea', '#fff3d2', '#5fb05a', '#b2dc74', '#3f8a55', '#b4bfbe', '#f4f8fa', '#4fa6de', '#3f9a5a', '#78c463', '#2f7c66', '#ffffff', '#c3d7ea', '#ffffff', '#ffe9a8', '#d6ecff', 0.4, 0, 0.93, 0.07, 0, ['#ffffff', '#ffe07a']),
  gold: P('#3f78bd', '#ffd6a2', '#e3c0a0', '#eecba6', '#fff0c6', '#ffe6a0', '#c9b6b2', '#ffd294', '#7fa843', '#e0cf5e', '#4f7a3c', '#b89a7c', '#fff0da', '#74acd2', '#3c7a42', '#7ea646', '#2c5a44', '#fff0dc', '#cf9f8c', '#fff6d8', '#ffd67a', '#ffffff', 0.3, 0, 0.92, 0.1, 0, ['#1f1a3c', '#b02f1b']),
  dawn: P('#3a4c92', '#ffb89c', '#c98fa0', '#dfa3a6', '#ffe2c4', '#fff0d0', '#9a8fc0', '#ffc2a0', '#4b7c5c', '#9db66c', '#2f5c4c', '#7c6c7e', '#ffe8e2', '#8a9cd4', '#2f6a55', '#6f9d5c', '#234c48', '#ffd2c2', '#a183ac', '#fff0e6', '#ffc8b0', '#ffffff', 0.25, 0.15, 0.92, 0.1, 0, ['#1c1a44', '#b5321e']),
  autumn: P('#5a84a6', '#f0bf74', '#b98048', '#d39a56', '#ffdf9c', '#fff0b6', '#c7a68e', '#ffc477', '#b08d30', '#e0b440', '#8a5026', '#7d5438', '#ecd09a', '#4f86a2', '#c2412b', '#e39a3b', '#8a2a1a', '#fff0d4', '#e0b08a', '#e3571f', '#f2c14e', '#b3341c', 0.28, 0, 0.9, 0.06, 0, ['#fff6e2', '#9fd4f2']),
  amber: P('#7fa0b8', '#ffe0a0', '#d6a468', '#e8bd7a', '#fff0c0', '#fff6c8', '#d9b89a', '#ffd088', '#b89238', '#e8bf4c', '#92582a', '#8a6040', '#f4dcaa', '#6a9ab2', '#c2412b', '#e39a3b', '#8a2a1a', '#fff4dc', '#e8c09a', '#e3571f', '#f2c14e', '#b3341c', 0.35, 0, 0.92, 0.07, 0, ['#fffaf0', '#8fd0f2']),
  dusk: P('#231739', '#d65d38', '#572031', '#74303a', '#ff9850', '#ffb262', '#8a5f86', '#ff9458', '#6b4428', '#a06a30', '#4d2218', '#3a2228', '#ad684a', '#683a5c', '#8a2a1a', '#c2552b', '#4a1a1a', '#ff9a72', '#562a4c', '#ff7a3a', '#ffc15a', '#c2412b', 0.08, 0.3, 0.82, 0.06, 0.3, ['#fff0e0', '#8fc3e6']),
  ember: P('#07040a', '#541811', '#170709', '#280c0b', '#ff6a2a', '#ffb070', '#3a2030', '#ff783a', '#2a1810', '#4a2814', '#1a0a08', '#150a0b', '#683020', '#381418', '#a02a14', '#e0601a', '#5a1408', '#682a1a', '#1a0a0e', '#ff8a2a', '#ffd15a', '#e0401a', 0.05, 0.7, 0.72, 0.05, 0.9, ['#ffe9d2', '#8fc3e6']),
  night: P('#040a1c', '#1c3964', '#0a172e', '#14294e', '#8fc3e6', '#e2f1ff', '#4466a2', '#9fc0ee', '#1c4656', '#2f6876', '#143444', '#2a4058', '#9fc3e6', '#28588a', '#0f3a3b', '#1a5152', '#0a2a31', '#3a5b8c', '#0f1d3a', '#bfe0ff', '#8fc3e6', '#ffffff', 0.55, 1, 0.72, 0.06, 1, ['#e6f2ff', '#ff7a5c']),
  storm: P('#26323f', '#93a2a9', '#4a565e', '#6f7d85', '#d5dfe4', '#eef4f7', '#7f8f9c', '#cfdde4', '#3d6248', '#5f8a5c', '#2a4a3c', '#4d575e', '#b4bec3', '#5f8496', '#2a5c46', '#4a7a54', '#1f4238', '#9aa6ad', '#39434a', '#cfe3ee', '#aab9c2', '#ffffff', 0.6, 0, 0.86, 0.07, 0.12, ['#f0f5f7', '#ff8a6a']),
  cloud: P('#bcd6ec', '#f6fafc', '#dfeaf2', '#edf3f7', '#ffffff', '#ffffff', '#b9cfe2', '#fffaf0', '#8fbf9a', '#c3dfae', '#74a892', '#b3bfc6', '#ffffff', '#9fcbe8', '#6aa58a', '#93c29a', '#5a9186', '#ffffff', '#c6d6e4', '#ffffff', '#ffffff', '#e8f2fa', 0.8, 0, 0.97, 0.45, 0, ['#1a2c55', '#c2412b']),
};
// the names the section presets use, per disc: [sides A B, sides C D]; and what each leans toward as the song runs on
const ALIAS = { day: ['sky', 'autumn'], late: ['gold', 'dusk'], dark: ['night', 'ember'] };
const LATE = { sky: 'gold', autumn: 'dusk' };
const KEYS = Object.keys(PALETTES.sky.col);

function rng(seed) { let a = seed >>> 0; return () => { a |= 0; a = a + 0x6D2B79F5 | 0; let t = Math.imul(a ^ a >>> 15, 1 | a); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; }; }
// n per level, the same on every level (that is what makes it the same valley again)
function levels(perLevel, [lo, hi], attrs, make) {
  const L = hi - lo + 1, arrs = attrs.map(([, n]) => new Float32Array(perLevel * L * n)), one = make();
  for (let l = 0; l < L; l++) for (let i = 0; i < perLevel; i++) attrs.forEach(([, n], k) => { for (let j = 0; j < n; j++) arrs[k][(l * perLevel + i) * n + j] = k === 0 && j === 2 ? lo + l : one[k][i * n + j]; });
  return arrs;
}
// a plain stand-in for the turntable, in the deck's own coordinates (origin at the spindle): body, platter, label, arm
function deckGeometry() {
  const pos = [], nrm = [], col = [];
  const add = (g, grey, label = 0) => { g = g.toNonIndexed(); const p = g.getAttribute('position').array, n = g.getAttribute('normal').array; for (let i = 0; i < p.length; i += 3) { pos.push(p[i], p[i + 1], p[i + 2]); nrm.push(n[i], n[i + 1], n[i + 2]); col.push(grey, label); } };
  const box = (x0, y0, z0, x1, y1, z1) => new THREE.BoxGeometry(x1 - x0, y1 - y0, z1 - z0).translate((x0 + x1) / 2, (y0 + y1) / 2, (z0 + z1) / 2);
  const cyl = (r, z0, z1, x = 0, y = 0, seg = 40) => new THREE.CylinderGeometry(r, r, z1 - z0, seg).rotateX(Math.PI / 2).translate(x, y, (z0 + z1) / 2);
  add(box(-0.185, -0.19, -0.062, 0.27, 0.19, -0.022), 0.1);
  add(cyl(0.153, -0.022, -0.001), 0.03); add(cyl(0.148, -0.001, 0), 0.055); add(cyl(0.05, 0, 0.0012), 1, 1);
  add(cyl(0.021, -0.022, 0.04, 0.214, 0.118, 16), 0.08);
  const ang = Math.atan2(-0.05 - 0.118, 0.085 - 0.214), len = Math.hypot(0.085 - 0.214, -0.05 - 0.118);
  add(new THREE.BoxGeometry(len, 0.009, 0.009).translate(len / 2, 0, 0).rotateZ(ang).translate(0.214, 0.118, 0.027), 0.13);
  for (const [x, y] of [[-0.15, -0.155], [0.235, -0.155], [-0.15, 0.155], [0.235, 0.155]]) add(cyl(0.027, -0.08, -0.062, x, y, 14), 0.04);
  const g = new THREE.BufferGeometry();
  g.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3)); g.setAttribute('normal', new THREE.Float32BufferAttribute(nrm, 3)); g.setAttribute('aC', new THREE.Float32BufferAttribute(col, 2));
  return g;
}
function houseGeometry() {
  const pos = [], nrm = [], roof = [];
  const add = (g, r) => { g = g.toNonIndexed(); const p = g.getAttribute('position').array, n = g.getAttribute('normal').array; for (let i = 0; i < p.length; i += 3) { pos.push(p[i], p[i + 1], p[i + 2]); nrm.push(n[i], n[i + 1], n[i + 2]); roof.push(r); } };
  add(new THREE.BoxGeometry(2, 1.4, 1.2).translate(0, 0, 0.6), 0);
  add(new THREE.ConeGeometry(1.5, 0.9, 4, 1).rotateY(Math.PI / 4).rotateX(Math.PI / 2).scale(1, 0.72, 1).translate(0, 0, 1.65), 1);
  const g = new THREE.BufferGeometry();
  g.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3)); g.setAttribute('normal', new THREE.Float32BufferAttribute(nrm, 3)); g.setAttribute('aR', new THREE.Float32BufferAttribute(roof, 1));
  return g;
}
function instanced(base, count, attrs, arrs) {
  const g = new THREE.InstancedBufferGeometry(); g.index = base.index; g.setAttribute('position', base.getAttribute('position'));
  attrs.forEach(([name, n], k) => g.setAttribute(name, new THREE.InstancedBufferAttribute(arrs[k], n)));
  g.instanceCount = count; return g;
}

export default class InnerspeakerWorld {
  static WORDS = { font: 'Oswald, "Arial Narrow", sans-serif', wide: 'Oswald, "Arial Narrow", sans-serif', weight: 600, upper: true, track: 0.55, streak: 0.35, chroma: false, rise: 0.012 };
  // a song with no cue sheet: the valley opens in the intro, curls as the song builds, closes and winds up when it is
  // full, turns into a still kaleidoscope in the dark for a break, and backs out of the fold at the end
  static SECTIONS = {
    intro: { fold: 0, twist: 0, kalei: 0, recur: 0, spin: 0, echo: 0.17, flow: 0.32, turb: 0.1, calm: 0.25, cloud: 0.75, leaves: 0.25, sun: 0.5, spark: 0.4, pulse: 0.4, camZoom: -0.4, camEl: 0.02, drift: 0.03, bloom: 0.45 },
    quiet: { fold: 0.22, twist: 0.08, kalei: 0, recur: 0, spin: 0, echo: 0.17, flow: 0.45, turb: 0.15, calm: 0.1, cloud: 0.6, leaves: 0.4, sun: 0.6, spark: 0.55, pulse: 0.5, camZoom: -0.3, camEl: 0.04, drift: 0.035, bloom: 0.5 },
    build: { fold: 0.45, twist: 0.2, kalei: 0, recur: 0.15, spin: 0, echo: 0.34, flow: 0.75, turb: 0.3, calm: 0, cloud: 0.45, leaves: 0.65, sun: 0.75, spark: 0.8, pulse: 0.8, camZoom: -0.34, camEl: 0.04, drift: 0.04, bloom: 0.55 },
    full: { fold: 0.66, twist: 0.42, kalei: 0, recur: 0.3, spin: 0.05, echo: 0.6, flow: 1.1, turb: 0.5, calm: 0, cloud: 0.35, leaves: 1, sun: 1, spark: 1, pulse: 1, camZoom: -0.44, camEl: 0.04, drift: 0.04, bloom: 0.65, split: 0.4 },
    break: { palette: 'dark', fold: 1, twist: 0.25, kalei: 1, recur: -0.72, spin: 0.12, echo: 1, flow: 0.4, turb: 0.1, calm: 0.15, cloud: 0.12, leaves: 0.35, sun: 0.7, spark: 0.7, pulse: 0.6, camZoom: -0.3, camEl: 0.05, drift: 0.03, bloom: 0.8 },
    outro: { palette: 'late', fold: 0.05, twist: 0, kalei: 0, recur: -1.7, spin: 0, echo: 0.17, flow: 0.5, turb: 0.1, calm: 0.3, cloud: 0.85, leaves: 0.3, sun: 0.85, spark: 0.4, pulse: 0.3, fade: 0.85, camZoom: -0.55, camEl: 0.02, drift: 0.03, bloom: 0.6 },
    loop: { fold: 1, twist: 0.8, kalei: 1, spin: 0.5, echo: 1, flow: 0.9, glitch: 0.2, trail: 0.35 },
  };
  static base(info) {
    const stormy = /storm/i.test(info.title || '');
    return { auto: 1, palette: stormy ? 'storm' : 'day', storm: stormy ? 0.75 : 0, words: 'drift', vig: 0.65, mblur: 0.45, split: 0.15, grain: 0.035, deep: 0, pitch: 0, yaw: 0, fade: 1 };
  }

  constructor(r) {
    this.r = r; this.scene = new THREE.Scene();
    this.pal = Object.fromEntries(KEYS.map((k) => [k, PALETTES.sky.col[k].clone()])); this.palN = { el: 0.7, star: 0, th: 0.93, fk: 0.13, ln: 0 }; this.palName = 'sky'; this.tmp = new THREE.Color();
    this.eye = new THREE.Vector3(0, -1, 0.7); this.dirF = new THREE.Vector3(); this.e1 = new THREE.Vector3(); this.e2 = new THREE.Vector3();
    this.tau = 0; this.rot = 0; this.lastT = null; this.seed = -1; this.sgn = 1; this.kN = 3; this.vTw = 0; this.vKal = 0; this.vYaw = 0;
    this.kPrev = 0; this.ringI = 0; this.aflash = 0; this.bolt = 0; this.lastAct = -1;
    const pal = this.pal, v = (x) => ({ value: x });
    // shared by every material
    const cu = this.cu = {
      uF: v(new THREE.Vector3()), uAx: v(new THREE.Vector3()), uE1: v(new THREE.Vector3()), uE2: v(new THREE.Vector3()), uEye: v(this.eye), uC: v(C),
      uD: v(D0), uTanB: v(R0 / D0), uP: v(P0), uTau: v(0), uRot: v(0), uTw: v(0), uFold: v(0), uDz: v(DFLAT), uHAmp: v(0.55), uKal: v(0), uKN: v(3), uTime: v(0), uTurb: v(0), uKick: v(0),
      uSeed: v(new THREE.Vector2()), uMe: v(new THREE.Vector4(0.3, 0, 0.12, 1)),
      cHaze: v(pal.haze), cGlow: v(pal.glow), uFade: v(1), uSunK: v(0.5), uFogK: v(0.035), uBolt: v(0),
      cAmb: v(pal.amb), cLit: v(pal.lit), uSunEl: v(0.7),
    };
    // the sky
    this.skyU = { ...cu, cTop: v(pal.top), cHor: v(pal.hor), cLow: v(pal.low), cSun: v(pal.sun), cCl: v(pal.cl), cCs: v(pal.cs), uStar: v(0), uCloud: v(0.5), uSkyT: v(0) };
    this.sky = new THREE.Mesh(new THREE.SphereGeometry(80, 32, 16), new THREE.ShaderMaterial({ vertexShader: SKY_VS, fragmentShader: SKY_FS, uniforms: this.skyU, side: THREE.BackSide, depthWrite: false }));
    this.sky.frustumCulled = false; this.sky.renderOrder = -1; this.scene.add(this.sky);
    // the land: a grid in (log-distance, angle across the valley); the vertex shader puts it on the cone
    const lp = new Float32Array((ROWS + 1) * (COLS + 1) * 3), li = new Uint32Array(ROWS * COLS * 6);
    for (let i = 0, n = 0; i <= ROWS; i++) for (let j = 0; j <= COLS; j++, n += 3) { lp[n] = UMIN + (UMAX - UMIN) * i / ROWS; lp[n + 1] = -Math.PI + 2 * Math.PI * j / COLS; }
    for (let i = 0, n = 0; i < ROWS; i++) for (let j = 0; j < COLS; j++) { const a = i * (COLS + 1) + j, b = a + COLS + 1; li[n++] = a; li[n++] = b; li[n++] = a + 1; li[n++] = a + 1; li[n++] = b; li[n++] = b + 1; }
    const lg = new THREE.BufferGeometry(); lg.setAttribute('position', new THREE.BufferAttribute(lp, 3)); lg.setIndex(new THREE.BufferAttribute(li, 1));
    this.landU = { ...cu, cG1: v(pal.g1), cG2: v(pal.g2), cFo: v(pal.fo), cRock: v(pal.rock), cCap: v(pal.cap), cWater: v(pal.water), cHor: v(pal.hor), uSpark: v(0.6), uFlowT: v(0), uPulse: v(0.5), uLine: v(0), uRing: v(new THREE.Vector4(99, 99, 99, 99)) };
    this.land = new THREE.Mesh(lg, new THREE.ShaderMaterial({ vertexShader: LAND_VS, fragmentShader: LAND_FS, uniforms: this.landU }));
    this.land.frustumCulled = false; this.scene.add(this.land);
    // trees
    const R = rng(20100521), ico = new THREE.BufferGeometry(), t = (1 + Math.sqrt(5)) / 2, k = 1 / Math.hypot(1, t);
    ico.setAttribute('position', new THREE.BufferAttribute(new Float32Array([-1, t, 0, 1, t, 0, -1, -t, 0, 1, -t, 0, 0, -1, t, 0, 1, t, 0, -1, -t, 0, 1, -t, t, 0, -1, t, 0, 1, -t, 0, -1, -t, 0, 1].map((x) => x * k)), 3));
    ico.setIndex([0, 11, 5, 0, 5, 1, 0, 1, 7, 0, 7, 10, 0, 10, 11, 1, 5, 9, 5, 11, 4, 11, 10, 2, 10, 7, 6, 7, 1, 8, 3, 9, 4, 3, 4, 2, 3, 2, 6, 3, 6, 8, 3, 8, 9, 4, 9, 5, 2, 4, 11, 6, 2, 10, 8, 6, 7, 9, 8, 1]);
    const quad = new THREE.PlaneGeometry(2, 2);
    const tAttr = [['aI', 4], ['aJ', 3]];
    const tArr = levels(TREES, TREE_LV, tAttr, () => { const I = new Float32Array(TREES * 4), J = new Float32Array(TREES * 3); for (let i = 0; i < TREES; i++) { I.set([R(), (R() * 2 - 1) * Math.PI, 0, R()], i * 4); J.set([R(), R(), R()], i * 3); } return [I, J]; });
    this.treeU = { ...cu, cT1: v(pal.t1), cT2: v(pal.t2), cT3: v(pal.t3), uLo: v(TREE_LV[0] + 1), uHi: v(TREE_LV[1] + 1), uSway: v(0.3) };
    this.trees = new THREE.Mesh(instanced(ico, TREES * (TREE_LV[1] - TREE_LV[0] + 1), tAttr, tArr), new THREE.ShaderMaterial({ vertexShader: TREE_VS, fragmentShader: TREE_FS, uniforms: this.treeU }));
    this.trees.frustumCulled = false; this.scene.add(this.trees);
    // leaves
    const mAttr = [['aI', 4], ['aJ', 4]];
    const mArr = levels(MOTES, MOTE_LV, mAttr, () => { const I = new Float32Array(MOTES * 4), J = new Float32Array(MOTES * 4); for (let i = 0; i < MOTES; i++) { I.set([R(), (R() * 2 - 1) * Math.PI, 0, R()], i * 4); J.set([0.06 + R() * 1.05, R(), R(), R()], i * 4); } return [I, J]; });
    this.moteU = { ...cu, cM1: v(pal.m1), cM2: v(pal.m2), cM3: v(pal.m3), uLo: v(MOTE_LV[0] + 1), uHi: v(MOTE_LV[1] + 1), uLeaves: v(0.5), uMoteT: v(0), uRain: v(0), uGlint: v(0.3) };
    this.motes = new THREE.Mesh(instanced(quad, MOTES * (MOTE_LV[1] - MOTE_LV[0] + 1), mAttr, mArr), new THREE.ShaderMaterial({ vertexShader: MOTE_VS, fragmentShader: MOTE_FS, uniforms: this.moteU, side: THREE.DoubleSide }));
    this.motes.frustumCulled = false; this.scene.add(this.motes);
    // clouds: clusters of puffs
    const cN = CLOUDS * PUFFS, cAttr = [['aI', 4], ['aJ', 4], ['aK', 3]];
    const cArr = levels(cN, CLOUD_LV, cAttr, () => {
      const I = new Float32Array(cN * 4), J = new Float32Array(cN * 4), K = new Float32Array(cN * 3);
      for (let c = 0; c < CLOUDS; c++) { const a = R(), b = (R() * 2 - 1) * Math.PI, w = R(), lift = 0.55 + R() * 0.5, sz = 0.13 + R() * 0.12;
        for (let q = 0; q < PUFFS; q++) { const i = c * PUFFS + q; I.set([a, b, 0, w], i * 4); J.set([lift, sz * (q === 0 ? 1 : 0.55 + R() * 0.4), 0, 0], i * 4); K.set(q === 0 ? [0, 0, 0] : [(R() * 2 - 1) * 1.5, (R() * 2 - 1) * 1.2, (R() - 0.35) * 1.1], i * 3); } }
      return [I, J, K];
    });
    this.cloudU = { ...cu, cCl: v(pal.cl), cCs: v(pal.cs), uLo: v(CLOUD_LV[0] + 1), uHi: v(CLOUD_LV[1] + 1), uCloud: v(0.5), uCloudT: v(0), uAlt: v(0) };
    this.clouds = new THREE.Mesh(instanced(quad, cN * (CLOUD_LV[1] - CLOUD_LV[0] + 1), cAttr, cArr), new THREE.ShaderMaterial({ vertexShader: CLOUD_VS, fragmentShader: CLOUD_FS, uniforms: this.cloudU, transparent: true, depthWrite: false }));
    this.clouds.frustumCulled = false; this.clouds.renderOrder = 2; this.scene.add(this.clouds);
    // the echo decks
    const dg = deckGeometry(), eg = new THREE.InstancedBufferGeometry();
    for (const name of ['position', 'normal', 'aC']) eg.setAttribute(name, dg.getAttribute(name));
    eg.setAttribute('aN', new THREE.InstancedBufferAttribute(new Float32Array(ECHOES), 1)); eg.instanceCount = ECHOES.length;
    this.echoU = { ...cu, cLabel: v(pal.label), uEcho: v(0), uEchoN: v(6), uTwin: v(0), uTwinAt: v(C.clone().addScaledVector(U, -0.5).addScaledVector(V, 0.2).addScaledVector(Z, 0.04)) };
    this.echo = new THREE.Mesh(eg, new THREE.ShaderMaterial({ vertexShader: ECHO_VS, fragmentShader: ECHO_FS, uniforms: this.echoU }));
    this.echo.frustumCulled = false; this.scene.add(this.echo);
    // houses
    const hg = houseGeometry(), hAttr = [['aI', 4], ['aJ', 3]];
    const hArr = levels(HOUSES, HOUSE_LV, hAttr, () => { const I = new Float32Array(HOUSES * 4), J = new Float32Array(HOUSES * 3); for (let i = 0; i < HOUSES; i++) { I.set([R(), (R() * 2 - 1) * Math.PI, 0, R()], i * 4); J.set([R(), R(), R()], i * 3); } return [I, J]; });
    const hig = instanced(hg, HOUSES * (HOUSE_LV[1] - HOUSE_LV[0] + 1), hAttr, hArr); hig.setAttribute('normal', hg.getAttribute('normal')); hig.setAttribute('aR', hg.getAttribute('aR'));
    this.houseU = { ...cu, cWall: v(pal.cap), cRoof: v(new THREE.Color('#b8452c')), uLo: v(HOUSE_LV[0] + 1), uHi: v(HOUSE_LV[1] + 1), uTown: v(0), uWin: v(0) };
    this.houses = new THREE.Mesh(hig, new THREE.ShaderMaterial({ vertexShader: HOUSE_VS, fragmentShader: HOUSE_FS, uniforms: this.houseU }));
    this.houses.frustumCulled = false; this.houses.visible = false; this.scene.add(this.houses);
  }

  ink() { return PALETTES[this.palName].ink; }
  post(post, p, s) {
    post.uThresh = this.palN.th;
    const dim = s.reduce ? 0.25 : 1;
    post.uFlash = Math.min(1, post.uFlash + (this.aflash * 0.5 + this.bolt * 0.35) * dim);
  }

  // p: the act's parameters (already blended), s: what the music is doing, loopT: the world's clock
  update(dt, p, s, loopT) {
    const cu = this.cu, kick = s.kick || 0, lp2 = !!s.lp2, auto = !!p.auto, en = s.energy || 0, high = s.high || 0;
    let dc = loopT - this.lastT; if (!(Math.abs(dc) < 1)) dc = 0; this.lastT = loopT;     // the record's own time: backwards on a scratch, folded in a loop
    if (s.seed !== this.seed) {                                    // a new song: its own valley
      const sd = this.seed = s.seed;
      cu.uSeed.value.set(Math.floor(sd * 97), Math.floor(rnd(sd * 31) * 61));
      cu.uMe.value.set((0.2 + 0.18 * rnd(sd * 7)) * (rnd(sd * 11) < 0.5 ? -1 : 1), 0, (0.07 + 0.09 * rnd(sd * 13)) * (rnd(sd * 17) < 0.5 ? -1 : 1), 0);
      this.sgn = rnd(sd * 19) < 0.5 ? -1 : 1; this.kN = [3, 2, 4, 1, 3, 5][Math.floor(rnd(sd * 23) * 6)];
    }
    // a song with no cue sheet: each section its own turn of the valley, and a new shot every eight bars
    let tTw = 0, tKal = 0, tYaw = 0, sgn = 1;
    if (auto) {
      const h = rnd(p.actIdx * 7.31 + s.seed * 100), h2 = rnd(p.actIdx * 3.17 + s.seed * 41 + 5), sp = s.secPhase || 0, f = smooth01(p.fold * 1.4);
      sgn = this.sgn * (h2 < 0.3 ? -1 : 1);
      tTw = ((h - 0.5) * 0.3 + 0.2 * sp) * f; tKal = p.fold > 0.7 && p.kalei < 0.5 && h > 0.62 ? 0.9 * smooth01(sp * 6) * smooth01((1 - sp) * 8) : 0; tYaw = (h2 - 0.5) * 0.3;
      const ph = Math.floor((s.bar || 0) / 8), w = s.sec === 'full' ? 1 : 0.55;
      p.camAz += (rnd(ph * 3.7 + s.seed * 91) - 0.35) * 0.55 * w; p.camEl += (rnd(ph * 5.3 + s.seed * 47) - 0.4) * 0.12 * w; p.camZoom += (rnd(ph * 2.9 + s.seed * 13) - 0.5) * 0.3 * w;
      p.camRoll += (rnd(ph * 4.1 + s.seed * 29) - 0.5) * 0.16 * w * f;
      if (p.actIdx !== this.lastAct) { if (this.lastAct >= 0 && s.playing && p.actIdx > this.lastAct) this.aflash = s.sec === 'full' ? 0.7 : 0.3; this.lastAct = p.actIdx; }
    } else this.lastAct = -1;
    const kv = 1 - Math.exp(-dt * 0.7);
    this.vTw += (tTw - this.vTw) * kv; this.vKal += (tKal - this.vKal) * kv; this.vYaw += (tYaw - this.vYaw) * kv;
    this.aflash *= Math.exp(-dt * 6);

    // colours ease toward the act's palette (which leans toward evening as an un-cued song runs on)
    const al = ALIAS[p.palette], name = al ? al[lp2 ? 1 : 0] : PALETTES[p.palette] ? p.palette : lp2 ? 'autumn' : 'sky';
    const tgt = PALETTES[name], late = auto && LATE[name] ? PALETTES[LATE[name]] : null, lw = late ? 0.5 * smooth01((s.progress || 0) * 1.2) : 0;
    const k = 1 - Math.exp(-dt * (p.palFast ? 12 : 1.3));
    for (let i = 0; i < KEYS.length; i++) { const key = KEYS[i]; this.tmp.copy(tgt.col[key]); if (late) this.tmp.lerp(late.col[key], lw); this.pal[key].lerp(this.tmp, k); }
    const N = this.palN; N.el += ((late ? tgt.el + (late.el - tgt.el) * lw : tgt.el) - N.el) * k; N.star += (tgt.star - N.star) * k; N.th += (tgt.th - N.th) * k; N.fk += (tgt.fk - N.fk) * k; N.ln += (tgt.ln - N.ln) * k;
    this.palName = name;

    // the fold's shape
    const fph = ((s.bar || 0) + (s.barPhase ?? (loopT * 0.5) % 1)) * Math.PI * 0.5, fl = p.fluct || 0;             // the fluctuation: four bars to a cycle
    const fold = Math.max(0, Math.min(1, p.fold + 0.025 * (s.low || 0) * p.pulse + fl * 0.2 * Math.sin(fph))), g = smooth01((fold - 0.06) / 0.5), deep = Math.max(0, p.deep);
    const D = D0 * (1 + 1.2 * deep), Pl = P0 / (1 + deep);
    const speed = p.flow * 0.2 * (0.7 + 0.6 * en) * (1 + p.recur);              // levels a second
    this.tau += dc * speed; this.tau -= Math.floor(this.tau);
    const kal = Math.max(0, Math.min(1, p.kalei + this.vKal));
    this.rot = wrapPi(this.rot + dc * p.spin * g - dt * this.rot * (1 - g) * 1.5);     // the turn unwinds as the valley opens
    cu.uD.value = D; cu.uTanB.value = R0 / D; cu.uP.value = Pl; cu.uTau.value = this.tau; cu.uRot.value = this.rot;
    cu.uTw.value = (p.twist * sgn + this.vTw + p.turb * 0.04 * Math.sin(loopT * 0.6)) * 1.05 * g;
    cu.uFold.value = fold; cu.uDz.value = DFLAT + (RT - DFLAT) * smooth01(fold) + (p.alt || 0) * 2.6 * (1 - smooth01(fold));
    cu.uHAmp.value = 0.55 * (1 - 0.55 * p.calm) * (1 + fl * 0.22 * Math.sin(fph * 2 + 1)); cu.uKal.value = kal; cu.uKN.value = Math.max(1, Math.round(p.act?.kaleiN || this.kN));
    cu.uTime.value = loopT; cu.uTurb.value = p.turb * (0.6 + 0.8 * high); cu.uKick.value = kick * p.pulse;
    // where it leads: downhill and away by default
    const tilt = Math.max(-1.45, Math.min(1.45, TILT0 + p.pitch * 1.2 + fl * 0.09 * Math.sin(fph + 0.8))), yaw = YAW0 + p.yaw + this.vYaw;
    this.dirF.copy(V).multiplyScalar(Math.cos(yaw)).addScaledVector(U, Math.sin(yaw)).multiplyScalar(Math.cos(tilt)).addScaledVector(Z, Math.sin(tilt));
    this.e1.crossVectors(this.dirF, Z).normalize(); this.e2.crossVectors(this.e1, this.dirF);
    cu.uAx.value.copy(this.dirF).negate(); cu.uE1.value.copy(this.e1); cu.uE2.value.copy(this.e2); cu.uF.value.copy(C).addScaledVector(this.dirF, D);

    // weather and light
    const storm = Math.max(0, p.storm), slot = Math.floor(loopT * 2.5), bh = rnd(slot * 1.37 + 3);
    this.bolt = storm > 0.05 && bh < 0.09 * storm ? Math.pow(1 - (loopT * 2.5 - slot), 2) * (0.6 + 0.4 * Math.sin(loopT * 70)) : 0;
    cu.uBolt.value = this.bolt * (s.reduce ? 0.25 : 1); cu.uFade.value = p.fade; cu.uFogK.value = N.fk * (1 + 0.8 * storm) + 0.1 * Math.max(0, p.alt || 0);
    cu.uSunK.value = p.sun * (1 + 0.25 * (s.low || 0) + 0.3 * kick * p.pulse) * (1 - 0.7 * Math.min(1, storm)); cu.uSunEl.value = N.el;
    const L = this.landU; L.uSpark.value = p.spark * (0.5 + (s.onset || 0) + 0.5 * high); L.uFlowT.value += dc * (0.5 + p.flow); L.uPulse.value = p.pulse; L.uLine.value = N.ln * (0.7 + 0.5 * (s.mid || 0) + 0.6 * kick * p.pulse);
    // every kick: a ring of light from the deck down to the vanishing point
    const ring = L.uRing.value; ring.x += dt; ring.y += dt; ring.z += dt; ring.w += dt;
    if (kick > 0.25 && kick - this.kPrev > 0.18) { ring.setComponent(this.ringI, 0); this.ringI = (this.ringI + 1) % 4; }
    this.kPrev = kick;
    this.treeU.uSway.value = 0.25 + p.turb + storm;
    const M = this.moteU; M.uLeaves.value = Math.min(1, (p.leaves * (0.55 + 0.6 * en) + storm) ); M.uMoteT.value += dc * (0.1 + 0.25 * p.flow) * (1 + high); M.uRain.value = smooth01(storm * 1.3); M.uGlint.value = p.spark * (0.3 + high);
    this.cloudU.uCloud.value = p.cloud; this.cloudU.uAlt.value = Math.max(0, Math.min(1, p.alt || 0)) * (1 - smooth01(fold)); this.cloudU.uCloudT.value += dc * 0.025 * (1 + p.turb + 2 * storm);
    const S = this.skyU; S.uCloud.value = Math.min(1, p.cloud + storm); S.uStar.value = N.star * (1 - Math.min(1, storm)); S.uSkyT.value += dc * (0.012 + speed * 0.25 + 0.05 * storm);
    this.clouds.visible = p.cloud > 0.01; this.motes.visible = M.uLeaves.value > 0.01;
    this.echoU.uEcho.value = p.echo; this.echoU.uTwin.value = p.twin || 0; this.echo.visible = p.echo > 0.005 || p.twin > 0.002;
    this.houseU.uTown.value = p.town || 0; this.houseU.uWin.value = Math.min(1, N.ln * 1.2 + 0.25 * smooth01((p.town - 0.5) * 2)); this.houses.visible = p.town > 0.005;
  }
  render(r, cam) {
    this.eye.setFromMatrixPosition(cam.matrixWorld);
    this.sky.position.copy(this.eye);
    r.render(this.scene, cam);
  }
}
