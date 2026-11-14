// Lonerism: the wrong side of the park railings. The deck stands on the paving in a gap of sun; beyond a line of
// tall iron bars a lawn, a crowd and a line of trees are all out of focus and overexposed, like a 35 mm print left
// in the light: hazed, faded, grainy, with a pink leak coming in at one edge of the frame. The sun is behind the
// crowd, so the bars' shadows reach across the paving to the deck, and every figure has a burning edge.
//
// Nothing is a picture: the bars are geometry (one instance each, so spacing and height are uniforms), the figures
// are little distance fields on cards, and the day itself is a dial (dawn, morning, noon, gold, dusk) that the
// palettes are stops on. What a cue sheet (or the song map) can move:
//   leak      the light leak, 0 none .. 1 flooding in (leakSide: -1 / 1 picks the edge; by default, by song)
//   expo      exposure, in stops either side of the era's (already too bright) print
//   crowd     how many are on the lawn, -1 nobody .. 1 packed       near   how close they stand, -1 far .. 1 at the bars
//   dance     0 standing about .. 1 jumping on the kick, arms up     soft   focus, -1 sharp .. 1 nothing but blobs
//   railGap   bar spacing, -1 half (a cage) .. 1 double              railH  bar height, -1 knee high .. 1 towering
//   hum       the bars ringing like strings (they always answer the bass a little)
//   dayShift  the day moved on (+) or back (-) from the palette's hour; 1 is dawn to dusk
//   sunBig    the sun swollen, 0 .. 1          burn   the print burning out to white from the middle
//   hero      one figure picked out of the crowd, in pink        heroNear  0 back among them .. 1 up at the railings
//   giant     something huge on the lawn, never drawn: only its shadow (it walks a step on every kick, its trunk
//             swinging) and the crowd parting round it; past 1 it comes up to the railings, until at 2 its shadow
//             lies across the paving and the deck          giantX  where along the lawn, -1 .. 1
//   petals    blossom in the air (it falls; with flow negative the whole lawn runs backwards, and it rises)
// and the shared ones: flow (how fast the park moves), turb (agitation), pulse (how hard the kick lands: the ring
// through the ground, the ripple down the fence, the exposure), spark (bokeh), calm (stillness), fade (presence).
import * as THREE from 'three';
import * as G from './lonerism-glsl.js';

const AZ = Math.atan2(-0.479, 0.878);                     // this frame's turn from the world's: x runs along the screen
const hex = (h) => new THREE.Color().setHex(h, THREE.LinearSRGBColorSpace);   // colours are worked in display values
const clamp = (x, a, b) => Math.max(a, Math.min(b, x));
const lum = (c) => 0.3 * c.r + 0.59 * c.g + 0.11 * c.b;
const smooth01 = (x) => { x = clamp(x, 0, 1); return x * x * (3 - 2 * x); };
function rng(seed) { let a = seed >>> 0; return () => { a = (a + 0x6d2b79f5) | 0; let t = Math.imul(a ^ (a >>> 15), 1 | a); t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t; return ((t ^ (t >>> 14)) >>> 0) / 4294967296; }; }

// the day: colours at each hour, blended along T. top/haze: the sky overhead and at the horizon (which is also what
// distance fades to); sun: the light; shade: what shadow multiplies by; lift: the print's faded blacks
const CK = ['top', 'haze', 'sun', 'lawn', 'pave', 'shade', 'tree', 'leakA', 'leakB', 'lift'], NK = ['hazeK', 'expo', 'sat', 'glare'];
const stop = (o) => { for (const k of CK) o[k] = hex(o[k]); return o; };
const AXIS = [
  stop({ T: 0, top: 0x9db0d8, haze: 0xf7d8d6, sun: 0xffcdb8, lawn: 0x7f9c7a, pave: 0xb9adb6, shade: 0x9c9cc6, tree: 0x5d7a62, leakA: 0xff6fa8, leakB: 0xffb890, lift: 0x2c1d33, hazeK: 0.12, expo: 1.25, sat: 0.82, glare: 0.8 }),
  stop({ T: 0.25, top: 0x86bce6, haze: 0xfdf2e0, sun: 0xfff0d2, lawn: 0x9cc060, pave: 0xdccdb4, shade: 0x8490d0, tree: 0x5f8f47, leakA: 0xff5fa2, leakB: 0xffb070, lift: 0x241a26, hazeK: 0.045, expo: 1.45, sat: 1.0, glare: 0.9 }),
  stop({ T: 0.5, top: 0xa4cdea, haze: 0xfff8ec, sun: 0xfff6e2, lawn: 0xb4cb66, pave: 0xe0d0b4, shade: 0x8286cc, tree: 0x6b9a46, leakA: 0xff4f9a, leakB: 0xff9a5c, lift: 0x2a1c22, hazeK: 0.055, expo: 1.5, sat: 1.0, glare: 1.0 }),
  stop({ T: 0.76, top: 0xd8c2b4, haze: 0xffe0ae, sun: 0xffbf74, lawn: 0xb9ad56, pave: 0xe4c59c, shade: 0x8a6c9c, tree: 0x7d8a3c, leakA: 0xff3f8e, leakB: 0xff8a3c, lift: 0x30181c, hazeK: 0.065, expo: 1.4, sat: 0.97, glare: 1.2 }),
  stop({ T: 1, top: 0x6a5890, haze: 0xf5a08c, sun: 0xff8462, lawn: 0x56684f, pave: 0xa38894, shade: 0x7a68a2, tree: 0x3d5040, leakA: 0xff3a94, leakB: 0xff7a50, lift: 0x2a1630, hazeK: 0.06, expo: 1.2, sat: 1, glare: 1.2 }),
];
// looks that are not an hour of the day: they take over from it
const ALT = {
  bleach: stop({ top: 0xe9e6e0, haze: 0xffffff, sun: 0xffffff, lawn: 0xdfe2c0, pave: 0xf2ece2, shade: 0xb4b4d2, tree: 0xa9bd93, leakA: 0xff8fc0, leakB: 0xffd0a0, lift: 0x3a3030, hazeK: 0.09, expo: 1.9, sat: 0.6, glare: 1.4 }),
  apoc: stop({ top: 0xc04a26, haze: 0xffc86e, sun: 0xfff0b8, lawn: 0xb06a34, pave: 0xd89668, shade: 0x8c3c50, tree: 0x6a3a26, leakA: 0xff2a6a, leakB: 0xff7a1e, lift: 0x3a1410, hazeK: 0.08, expo: 1.5, sat: 1.1, glare: 1.6 }),
  hard: stop({ top: 0x3c7fd6, haze: 0xf2e6c2, sun: 0xfff2d0, lawn: 0x7fb536, pave: 0xd9c39c, shade: 0x4c4680, tree: 0x3f7a2e, leakA: 0xff3a8a, leakB: 0xff8a2a, lift: 0x120c10, hazeK: 0.05, expo: 1.45, sat: 1.15, glare: 0.8 }),
};
// the palette names an act may use: an hour, or a look at an hour
export const PALETTES = {
  dawn: { T: 0.04 }, morning: { T: 0.25 }, noon: { T: 0.5 }, gold: { T: 0.76 }, dusk: { T: 0.97 },
  bleach: { T: 0.5, alt: 'bleach' }, apoc: { T: 0.82, alt: 'apoc' }, hard: { T: 0.44, alt: 'hard' },
};

// every act of a song with no cue sheet starts from one of these (each sets the same keys, so nothing is left over
// from the section before); camAz and palette come from base(), per song
const REST = { flow: 0.5, turb: 0.3, pulse: 0.6, spark: 0.6, fade: 1, calm: 0, leak: 0.35, expo: 0, crowd: 0, near: 0, dance: 0.2, soft: 0, railGap: 0, railH: 0, dayShift: 0,
  camEl: -0.56, camZoom: -0.25, camRoll: 0, drift: 0.045, bloom: 0.6, split: 0.12, glitch: 0, trail: 0, zoomBlur: 0, words: 'drift' };

export default class LonerismWorld {
  static WORDS = { font: '"Archivo Black", "Arial Black", sans-serif', wide: '"Archivo Black", "Arial Black", sans-serif', weight: 400, upper: true, track: 0.4, streak: 0.3, chroma: false, rise: 0.012 };
  static SECTIONS = {
    // early: almost nobody about, the camera down at the deck's level, looking through the bars
    intro: { ...REST, flow: 0.25, turb: 0.1, pulse: 0.35, spark: 0.4, leak: 0.15, expo: -0.08, crowd: -0.65, near: -0.5, dance: 0, soft: 0.3, camEl: -0.57, camZoom: 0.02, drift: 0.03, bloom: 0.5 },
    quiet: { ...REST, flow: 0.35, turb: 0.15, leak: 0.28, crowd: -0.25, near: -0.15, dance: 0.1, camAz: 0.32, camEl: -0.55, camZoom: -0.15, drift: 0.04 },
    // they gather, and come closer; the bars start to ring
    build: { ...REST, flow: 0.7, turb: 0.55, pulse: 0.8, spark: 0.8, leak: 0.55, expo: 0.12, crowd: 0.35, near: 0.35, dance: 0.55, railH: 0.2, camAz: -0.28, camEl: -0.56, camZoom: -0.35, drift: 0.05 },
    // the whole lawn up and jumping, the print at its brightest
    full: { ...REST, flow: 1, turb: 0.8, pulse: 1, spark: 1, leak: 0.8, expo: 0.1, crowd: 0.85, near: 0.6, dance: 1, camEl: -0.56, camZoom: -0.5, drift: 0.055, bloom: 0.8, split: 0.3 },
    // from their side: the deck behind bars, in the shade, everything stopped and bleached
    break: { ...REST, flow: 0.12, turb: 0.05, calm: 0.7, pulse: 0.3, spark: 0.5, leak: 0.5, expo: 0.25, crowd: -0.4, near: -0.6, dance: 0, soft: 0.5, railGap: -0.2, railH: 0.7, camAz: 2.7, camEl: -0.44, camZoom: -0.35, drift: 0.03 },
    // the day goes; they have all gone home
    outro: { ...REST, flow: 0.2, turb: 0.1, pulse: 0.3, spark: 0.4, fade: 0.85, leak: 0.2, expo: -0.3, crowd: -0.95, near: -0.8, dance: 0, dayShift: 0.3, camEl: -0.53, camZoom: -0.7, drift: 0.04, bloom: 0.5 },
    loop: { ...REST, flow: 0.9, turb: 0.7, pulse: 1, leak: 0.7, crowd: 0.6, near: 0.5, dance: 1, glitch: 0.25, trail: 0.4 },
  };
  // each song its own hour and its own place along the railings
  static base(info) {
    const t = info.title || ''; let h = 0; for (let i = 0; i < t.length; i++) h = (h * 31 + t.charCodeAt(i)) >>> 0;
    const hour = /coming up/i.test(t) ? 'dawn' : /believe me/i.test(t) ? 'dusk' : /above it/i.test(t) ? 'morning' : /walk home|lying|nothing that/i.test(t) ? 'gold' : info.lp2 ? 'gold' : 'noon';
    return { palette: hour, camAz: ((h % 97) / 96 - 0.5) * 0.7, grain: 0.11, vig: 0.4, mblur: 0.4, petals: info.lp2 ? 0.5 : 0.2 };
  }

  constructor(r) {
    this.r = r; this.scene = new THREE.Scene();
    const root = this.root = new THREE.Group(); root.position.set(0.042, 0, 0); root.rotation.z = AZ; this.scene.add(root); root.updateMatrixWorld(true);
    this.inv = new THREE.Matrix4().copy(root.matrixWorld).invert();
    this.pal = {}; this.altCol = {}; this.num = {}; this.altNum = {};
    for (const k of CK) { this.pal[k] = AXIS[2][k].clone(); this.altCol[k] = ALT.bleach[k].clone(); }
    for (const k of NK) { this.num[k] = AXIS[2][k]; this.altNum[k] = ALT.bleach[k]; }
    this.dayT = null; this.altK = 0; this.side = 0; this.dark = true; this._tint = [1.03, 1, 0.96];
    this.walkT = 0; this.airT = 0; this.flowT = 0; this.lastT = 0; this.prevKick = 0; this.giantJ = 0; this.step = 0; this.stepT = 0;
    this.eye = new THREE.Vector3(0, -1.2, 0.3); this.sunDir = new THREE.Vector3(0, 0.8, 0.6); this.camR = new THREE.Vector3(1, 0, 0); this.camUp = new THREE.Vector3(0, 0, 1);
    this.kickAge = new THREE.Vector4(9, 9, 9, 9); this.kickAmp = new THREE.Vector4();
    // what every shader shares
    const P = this.pal;
    this.U = {
      uEye: { value: this.eye }, uSunDir: { value: this.sunDir }, uSunCol: { value: P.sun }, uHaze: { value: P.haze }, uShade: { value: P.shade },
      uExpo: { value: 1.6 }, uHazeK: { value: 0.11 }, uGlare: { value: 1 }, uT: { value: 0 }, uSat: { value: 0.9 },
      uGap: { value: G.GAP0 }, uH: { value: G.H0 }, uShadowK: { value: 1 }, uFlowT: { value: 0 }, uPulse: { value: 0.5 }, uKickAge: { value: this.kickAge }, uKickAmp: { value: this.kickAmp },
      uLawn: { value: P.lawn }, uPave: { value: P.pave }, uTree: { value: P.tree }, uFade: { value: 1 }, uSoft: { value: 0 }, uKickEnv: { value: 0 }, uDance: { value: 0 }, uWalkT: { value: 0 },
      uCamR: { value: this.camR }, uCamUp: { value: this.camUp }, uSpark: { value: 0.6 },
    };
    this.buildSky(); this.buildGround(); this.buildFence(); this.buildTrees(); this.buildCrowd(); this.buildLights(); this.buildOver();
  }
  mat(vs, fs, own, opts) { return new THREE.ShaderMaterial({ vertexShader: vs, fragmentShader: fs, uniforms: { ...this.U, ...own }, ...opts }); }
  add(mesh, order) { mesh.frustumCulled = false; mesh.renderOrder = order; this.root.add(mesh); return mesh; }
  // cards placed in the shader: a unit quad and per-instance attributes
  cards(n, attrs, feet) {
    const q = new THREE.PlaneGeometry(1, 1); if (feet) q.translate(0, 0.5, 0);
    const g = new THREE.InstancedBufferGeometry(); g.index = q.index; g.setAttribute('position', q.attributes.position); g.instanceCount = n;
    for (const k in attrs) g.setAttribute(k, new THREE.InstancedBufferAttribute(new Float32Array(attrs[k]), attrs[k].length / n));
    return g;
  }
  buildSky() {
    this.skyU = { uTop: { value: this.pal.top }, uSunR: { value: 0.035 }, uBurn: { value: 0 } };
    this.add(new THREE.Mesh(new THREE.SphereGeometry(100, 48, 24), this.mat(G.SKY_VS, G.SKY_FS, this.skyU, { side: THREE.BackSide, depthWrite: false })), -10);
  }
  buildGround() {
    this.giantV = new THREE.Vector4(0, 4, 2.6, 0); this.groundU = { uGiant: { value: this.giantV }, uRingC: { value: new THREE.Vector2() }, uDirect: { value: 1 }, uGiantPh: { value: 0 } };
    this.add(new THREE.Mesh(new THREE.PlaneGeometry(260, 260).translate(0, 0, G.GROUND), this.mat(G.GROUND_VS, G.GROUND_FS, this.groundU)), -5);
  }
  buildFence() {
    const pos = [], nrm = [], aa = [];
    const part = (g, fn) => {
      g = g.index ? g.toNonIndexed() : g; const p = g.attributes.position, n = g.attributes.normal;
      for (let i = 0; i < p.count; i++) { const o = fn(p.getX(i), p.getY(i), p.getZ(i)); pos.push(o[0], o[1], o[2]); nrm.push(n.getX(i), n.getY(i), n.getZ(i)); aa.push(o[3], o[4], o[5]); }
    };
    // aA: x 1 = stretches with the spacing, y how much of the height it rides on, z 1 = stone
    part(new THREE.CylinderGeometry(0.0065, 0.0065, 1, 7, 1, true).rotateX(Math.PI / 2), (x, y, z) => [x, y, z > 0 ? -0.055 : 0.02, 0, z > 0 ? 1 : 0, 0]);        // the bar
    part(new THREE.LatheGeometry([[0.0066, -0.06], [0.0105, -0.054], [0.0066, -0.047], [0.0135, -0.034], [0.0001, 0]].map((v) => new THREE.Vector2(v[0], v[1])), 6).rotateX(Math.PI / 2), (x, y, z) => [x, y, z, 0, 1, 0]);   // its spear
    part(new THREE.BoxGeometry(G.GAP0, 0.012, 0.02), (x, y, z) => [x, y, z - 0.095, 1, 1, 0]);      // top rail
    part(new THREE.BoxGeometry(G.GAP0, 0.012, 0.02), (x, y, z) => [x, y, z + 0.095, 1, 0, 0]);      // bottom rail
    part(new THREE.BoxGeometry(G.GAP0, 0.13, 0.045), (x, y, z) => [x, y, z + 0.0225, 1, 0, 1]);     // the kerb they stand in
    const n = 600, g = new THREE.InstancedBufferGeometry();
    g.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3)); g.setAttribute('normal', new THREE.Float32BufferAttribute(nrm, 3)); g.setAttribute('aA', new THREE.Float32BufferAttribute(aa, 3));
    g.setAttribute('aI', new THREE.InstancedBufferAttribute(Float32Array.from({ length: n }, (_, i) => i - n / 2), 1)); g.instanceCount = n;
    this.fenceU = { uHum: { value: 0 }, uIron: { value: hex(0x0e1513) }, uStone: { value: hex(0xcbc2b4) } };
    this.add(new THREE.Mesh(g, this.mat(G.FENCE_VS, G.FENCE_FS, this.fenceU, { side: THREE.DoubleSide })), 0);
  }
  buildTrees() {
    const R = rng(11), list = [];
    for (let i = 0; i < 44; i++) list.push([(R() - 0.5) * 46, 8.5 + R() * 9, 2.1 + R() * 1.7, R()]);           // across the lawn
    for (let i = 0; i < 16; i++) list.push([(R() - 0.5) * 22, -3.4 - R() * 4.5, 3.2 + R() * 1.6, R()]);        // over this side
    list.sort((a, b) => Math.abs(b[1]) - Math.abs(a[1]));
    const g = this.cards(list.length, { aP: list.flat() }, true);
    this.add(new THREE.Mesh(g, this.mat(G.TREE_VS, G.TREE_FS, {}, { transparent: true, depthWrite: false, side: THREE.DoubleSide })), 1);
  }
  buildCrowd() {
    const R = rng(2012), n = 180, fig = [];
    for (let i = 0; i < n; i++) fig.push({ u: R() * 2 - 1, rank: 0.02 + 0.98 * Math.pow(R(), 1.25), s1: R(), s2: R(), h: R() < 0.12 ? 0.3 + R() * 0.06 : 0.46 + R() * 0.12, pres: 0.03 + 0.97 * R(), walk: R() < 0.42 ? 0 : (R() < 0.5 ? -1 : 1) * (0.35 + 0.65 * R()), hero: 0 });
    fig.sort((a, b) => b.rank - a.rank);                              // far ones first, so the near are drawn over them
    fig.push({ u: 0.12, rank: 0.3, s1: 0.37, s2: 0.2, h: 0.52, pres: 0.4, walk: 0, hero: 1 });   // the one a song may pick out, drawn last
    const aA = fig.flatMap((o) => [o.u, o.rank, o.s1, o.s2]), aB = fig.flatMap((o) => [o.h, o.pres, o.walk, o.hero]);
    this.crowdU = { uNear: { value: 0 }, uCrowd: { value: 0.5 }, uHero: { value: new THREE.Vector4(0, 0.5, 3, 0) }, uGiant: { value: this.giantV }, uGiant3: { value: new THREE.Vector3(0, 2.2, 0) }, uTilt: { value: 0 }, uHeroCol: { value: hex(0xff2f7a) } };
    const opts = { transparent: true, depthWrite: false, side: THREE.DoubleSide };
    this.add(new THREE.Mesh(this.cards(fig.length, { aA, aB }, true), this.mat(G.FSH_VS, G.FSH_FS, this.crowdU, opts)), 2);
    this.add(new THREE.Mesh(this.cards(fig.length, { aA, aB }, true), this.mat(G.FIG_VS, G.FIG_FS, this.crowdU, opts)), 3);
  }
  buildLights() {
    const R = rng(77), bp = [], bs = [];
    for (let i = 0; i < 150; i++) {
      const k = R();
      if (k < 0.5) { bp.push((R() - 0.5) * 36, 8.5 + R() * 8, 0.7 + R() * 2.6, 0); bs.push(0.14 + 0.3 * R(), R(), R() * 0.5, 0); }               // in the far trees
      else if (k < 0.85) { bp.push((R() - 0.5) * 16, 1.4 + R() * 9, G.GROUND + 0.02 + R() * 0.2, 0); bs.push(0.04 + 0.1 * R(), R(), R(), 0); }   // low over the grass
      else { bp.push((R() - 0.5) * 16, -3 - R() * 3.5, 1 + R() * 2.5, 0); bs.push(0.12 + 0.2 * R(), R(), R() * 0.5, 0); }                       // in the trees behind
    }
    const opts = { transparent: true, depthWrite: false, side: THREE.DoubleSide, blending: THREE.CustomBlending, blendEquation: THREE.AddEquation, blendSrc: THREE.OneFactor, blendDst: THREE.OneFactor };
    this.add(new THREE.Mesh(this.cards(150, { aP: bp, aS: bs }), this.mat(G.BOKEH_VS, G.BOKEH_FS, {}, opts)), 4);
    const mp = [], ms = [];
    for (let i = 0; i < 320; i++) { mp.push((R() - 0.5) * 5, (R() - 0.5) * 5, (R() - 0.5) * 1.3, 0); ms.push(R(), R(), R(), 0); }
    this.moteU = { uAirT: { value: 0 }, uTurb: { value: 0.3 }, uPetal: { value: 0 }, uSpark: { value: 0.8 } };
    this.add(new THREE.Mesh(this.cards(320, { aP: mp, aS: ms }), this.mat(G.MOTE_VS, G.MOTE_FS, this.moteU, opts)), 5);
  }
  buildOver() {
    this.overU = { uLeakA: { value: this.pal.leakA }, uLeakB: { value: this.pal.leakB }, uLift: { value: new THREE.Color() }, uLeak: { value: 0 }, uSide: { value: -1 }, uT: { value: 0 }, uDust: { value: 0.6 }, uBurn: { value: 0 }, uAsp: { value: 1.78 } };
    const m = new THREE.Mesh(new THREE.PlaneGeometry(2, 2), new THREE.ShaderMaterial({ vertexShader: G.OVER_VS, fragmentShader: G.OVER_FS, uniforms: this.overU, depthTest: false, depthWrite: false, transparent: true,
      blending: THREE.CustomBlending, blendEquation: THREE.AddEquation, blendSrc: THREE.OneFactor, blendDst: THREE.OneMinusSrcAlphaFactor }));       // laid over, premultiplied
    m.frustumCulled = false; m.renderOrder = 100; this.scene.add(m);
  }

  // dark ink while the print is bright; pale once the day has gone
  ink() { return this.dark ? ['#2b1433', '#d2185f'] : ['#fff1e4', '#ff7fae']; }
  post(post, p, s) {
    post.uThresh = 0.9; post.uBloom *= 0.55; post.uGrain = p.grain + 0.05 + 0.03 * (s.high || 0); post.uVig = p.vig * 0.6; post.tint = this._tint;
  }

  update(dt, p, s, loopT) {
    const U = this.U, kick = s.kick || 0, low = s.low || 0, high = s.high || 0, en = s.energy || 0, prog = s.progress || 0;
    // the record's own time step: backwards on a scratch, nothing when the platter stops
    let dl = loopT - this.lastT; this.lastT = loopT; if (!(Math.abs(dl) < 0.25)) dl = 0;
    // (a negative flow runs the lawn backwards)
    const still = 1 - 0.85 * p.calm, air = p.flow + 0.3 * clamp(p.flow * 5, -1, 1);
    this.walkT += dl * p.flow * still * (0.7 + 0.6 * en) * 2; this.airT += dl * air * still; this.flowT += dl * air;
    // kicks, remembered for the ripples they send out
    const ka = this.kickAge, km = this.kickAmp, adt = Math.abs(dl);
    ka.x += adt; ka.y += adt; ka.z += adt;
    if (kick - this.prevKick > 0.25 && ka.x > 0.12) { ka.z = ka.y; km.z = km.y; ka.y = ka.x; km.y = km.x; ka.x = 0; km.x = kick; this.stepT += Math.PI * 0.5; }
    this.prevKick = kick;
    // the hour, and the look over it
    const tgt = PALETTES[p.palette] || PALETTES.noon, alt = tgt.alt ? ALT[tgt.alt] : null;
    const k = this.dayT == null ? 1 : 1 - Math.exp(-dt * (p.palFast ? 10 : 0.9));
    if (this.dayT == null) this.dayT = tgt.T;
    this.dayT += (tgt.T - this.dayT) * k;
    if (alt) { const ka2 = this.altK < 0.02 ? 1 : k; for (let i = 0; i < CK.length; i++) this.altCol[CK[i]].lerp(alt[CK[i]], ka2); for (let i = 0; i < NK.length; i++) this.altNum[NK[i]] += (alt[NK[i]] - this.altNum[NK[i]]) * ka2; }
    this.altK += ((alt ? 1 : 0) - this.altK) * k;
    const T = clamp(this.dayT + (p.dayShift || 0) + (prog - 0.5) * 0.08, 0, 1);
    let i0 = 0; while (i0 < AXIS.length - 2 && AXIS[i0 + 1].T <= T) i0++;
    const a = AXIS[i0], b = AXIS[i0 + 1], f = clamp((T - a.T) / (b.T - a.T), 0, 1), ak = this.altK;
    for (let i = 0; i < CK.length; i++) { const key = CK[i]; this.pal[key].lerpColors(a[key], b[key], f).lerp(this.altCol[key], ak); }
    for (let i = 0; i < NK.length; i++) { const key = NK[i]; this.num[key] = (a[key] + (b[key] - a[key]) * f) * (1 - ak) + this.altNum[key] * ak; }
    // the sun crosses behind the crowd, left to right, low at both ends of the day
    const az = (T - 0.5) * 1.9 + ((s.seed ?? 0.5) - 0.5) * 0.5, el = 0.02 + 0.62 * Math.pow(Math.sin(Math.PI * T), 1.3);
    this.sunDir.set(Math.sin(az) * Math.cos(el), Math.cos(az) * Math.cos(el), Math.sin(el));
    const N = this.num, fade = clamp(p.fade, 0, 1);
    const burn = clamp(p.burn || 0, 0, 1);
    U.uExpo.value = N.expo * Math.pow(2, p.expo || 0) * (1 + 0.1 * kick * p.pulse) * (1 + 2.5 * burn * burn);
    U.uHazeK.value = N.hazeK * (1 + (1 - fade) * 2.5 + 2.5 * burn); U.uGlare.value = N.glare * (1 + 0.6 * (p.sunBig || 0)) * (1 - 0.5 * burn); U.uSat.value = N.sat; U.uT.value = loopT; U.uFlowT.value = this.flowT;
    U.uShadowK.value = smooth01((el - 0.03) / 0.12); this.groundU.uDirect.value = 0.3 + 0.7 * smooth01(el / 0.3);
    U.uGap.value = G.GAP0 * Math.exp(0.693 * (p.railGap || 0)); U.uH.value = G.H0 * Math.exp(0.9 * (p.railH || 0));
    U.uPulse.value = p.pulse; U.uFade.value = fade; U.uSoft.value = p.soft || 0; U.uKickEnv.value = kick;
    U.uDance.value = clamp((p.dance || 0) * (0.55 + 0.7 * en), 0, 1.3) * still; U.uWalkT.value = this.walkT;
    U.uSpark.value = p.spark * (0.4 + 0.9 * high + 0.3 * (s.onset || 0));
    this.fenceU.uHum.value = ((p.hum || 0) + p.turb * 0.5) * (0.25 + low) * still;
    this.skyU.uSunR.value = 0.035 * (1 + 7 * (p.sunBig || 0)); this.skyU.uBurn.value = burn * 0.7;
    const C = this.crowdU;
    C.uCrowd.value = clamp(0.5 + 0.5 * (p.crowd || 0) + (prog - 0.3) * 0.12, 0, 1.1); C.uNear.value = (p.near || 0) + 0.12 * en;
    C.uHero.value.set(clamp(p.hero || 0, 0, 1), 0.28 + 0.05 * Math.sin(loopT * 0.4), 4.2 + (0.45 - 4.2) * smooth01(p.heroNear || 0), 0);
    // the giant: it comes on with the kick
    this.giantJ = Math.max(this.giantJ * Math.exp(-dt * 5), kick); this.step += (this.stepT - this.step) * (1 - Math.exp(-dt * 9)); this.groundU.uGiantPh.value = this.step;
    const gx = (p.giantX || 0) * 7, gg = clamp(p.giant || 0, 0, 2), ga = Math.min(1, gg), grow = Math.max(0, gg - 1), gv = G.FV + 3.4 - 2.55 * grow;
    this.giantV.set(gx, gv, 1.8 * (1 + 0.06 * this.giantJ), ga * 0.9); C.uGiant3.value.set(gx, 1.7, ga * 1.5);
    this.groundU.uRingC.value.set(gx * ga, gv * ga);
    const M = this.moteU; M.uAirT.value = this.airT; M.uTurb.value = p.turb; M.uPetal.value = p.petals || 0; M.uSpark.value = 0.45 + 0.5 * p.spark;
    // the leak breathes with the bass, and changes edge now and then
    const O = this.overU, want = p.leakSide ? Math.sign(p.leakSide) : (s.seed ?? 0) > 0.5 ? 1 : -1;
    this.side += (want - this.side) * (this.side === 0 ? 1 : 1 - Math.exp(-dt * 0.8));
    O.uSide.value = this.side; O.uLeak.value = Math.max(0, (p.leak || 0) * (0.7 + 0.5 * low + 0.4 * kick * p.pulse)); O.uT.value = loopT;
    O.uLift.value.copy(this.pal.lift).multiplyScalar(0.85); O.uDust.value = s.reduce ? 0.15 : 0.6; O.uBurn.value = burn * 0.4;
    // is the picture bright enough for dark words?
    const dk = this.groundU.uDirect.value, P = this.pal;
    const l = 1 - Math.exp(-Math.pow(lum(P.pave) * (1.3 * dk * lum(P.sun) + (0.1 + 0.75 * (1 - dk)) * lum(P.shade)) * U.uExpo.value, 1.35));
    this.dark = l > (this.dark ? 0.32 : 0.4);
  }
  render(r, cam) {
    this.eye.setFromMatrixPosition(cam.matrixWorld).applyMatrix4(this.inv);
    this.camR.setFromMatrixColumn(cam.matrixWorld, 0).transformDirection(this.inv);
    this.camUp.setFromMatrixColumn(cam.matrixWorld, 1).transformDirection(this.inv);
    this.crowdU.uTilt.value = smooth01((0.9 - this.camUp.z) / 0.55) * 0.85;
    this.overU.uAsp.value = r.domElement.width / Math.max(1, r.domElement.height);
    r.render(this.scene, cam);
  }
}
