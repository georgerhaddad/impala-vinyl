// B-Sides & Rarities: a white-label test pressing. The deck stands on a sheet of paper in a bright, near-white void,
// and the world is the paperwork of the cutting room, drawn in graphite with one stamp-pad colour:
//   the floor is the drawing: a spiral the lathe scribes outward from the deck through the song (its wiggle is what
//     was playing as it passed), a degree ring and the run-out etching, register marks, a control strip whose step
//     wedge is a level meter and whose bars are a test-tone sweep, the typed job slip ticking on the beat
//   a pop-up book stands on it: plain sleeves, blank labels and VU meters lie flat as drawings in the quiet parts and
//     lift to stand round the deck in the full ones (and lie back down wherever they would hide it from the camera)
//   a chart-recorder tape runs past with the last half minute of bass and treble on it; a Lissajous figure hangs in
//     the air and throws its drawing on the paper; a blank label the size of a hill comes up over the horizon
// Every song gets its own paper stock, stamp colour, deal of the cards and figure (s.seed), and a negative of
// itself (white ink on black) for its breaks. Helpers: rarities-marks.js (the sheet of stamps and type),
// rarities-floor.js (the floor and sky), rarities-props.js (everything that stands or flies).
//
// Knobs (in DEFAULTS, ../index.js; all 0 = absent):
//   sleeves  0..1 the pop-up cards: ~0.4 drawn flat, 1 all standing        vu      0..1 the three meters, the same way
//   lissa    0..1 the Lissajous figure: a small loop growing into the song's knot
//   chart    0..1 the recorder tape fed out, its far end lifting           lathe   0..1 the scribed spiral
//   sweep    0..1 the test-tone bars on the control strip                  typing  0..1 the job slip, ticket and captions
//   stamp    0..1 the stamps on the cards                                  graph   0..1 graph paper (floor and sky)
//   regmarks 0..1 register and crop marks                                  layout  0,1,2.. which deal of the cards (a page turn)
//   lowsun   0..1 the light comes down: long shadows
//   dial     0..1 the ring becomes a clock face with hands (Patience)      day     how fast the day goes: turns of the light (and the
//                                                                            hour hand) round the deck per minute; 0 stops the clock
//   pages    0..1 day sheets blowing off a calendar                        swell   0..1 the sheet heaves like water
//   sea      0..1 the sheet becomes a sea chart sliding under the deck (The Boat I Row); `flow` is the rowing speed
//   course   0..1 the plotted course ahead and the wake behind             bearings 0..1 the fan of other bearings
import * as THREE from 'three';
import { Marks, CELL, uvOf } from './rarities-marks.js';
import { FLOOR_VS, FLOOR_FS, SKY_VS, SKY_FS, RIN, ROUT } from './rarities-floor.js';
import { buildCards, buildTapes, buildLissa, buildPages } from './rarities-props.js';

const TAU = Math.PI * 2;
// colours go to the screen as written (these shaders do no colour management), so keep the hex values as they are
const hex = (h) => new THREE.Color(h).convertLinearToSRGB();
// paper stocks: sky, horizon, floor, card, ink, light ink, shadow; `dark` for the negatives
export const PALETTES = {
  paper: { sky: hex('#f6f4ee'), hor: hex('#e7e4dc'), floor: hex('#f1efe8'), card: hex('#fdfcf8'), ink: hex('#1b1b1d'), ink2: hex('#77756f'), shadow: hex('#a6a39a'), dark: 0 },
  bone: { sky: hex('#f3eee1'), hor: hex('#e4dccb'), floor: hex('#eee7d8'), card: hex('#fbf7ec'), ink: hex('#221f1a'), ink2: hex('#7f7868'), shadow: hex('#a89e8a'), dark: 0 },
  newsprint: { sky: hex('#e1e0db'), hor: hex('#cfcec8'), floor: hex('#d9d8d2'), card: hex('#edece7'), ink: hex('#151516'), ink2: hex('#6a6965'), shadow: hex('#96948d'), dark: 0 },
  manila: { sky: hex('#ecdfbf'), hor: hex('#dccba2'), floor: hex('#e6d7b2'), card: hex('#f5ead0'), ink: hex('#2a2015'), ink2: hex('#86734f'), shadow: hex('#a48e5c'), dark: 0 },
  negative: { sky: hex('#060607'), hor: hex('#151517'), floor: hex('#0b0b0c'), card: hex('#141416'), ink: hex('#efede7'), ink2: hex('#8f8d88'), shadow: hex('#3a3a40'), dark: 1 },
  carbon: { sky: hex('#090c12'), hor: hex('#171c27'), floor: hex('#0c1017'), card: hex('#141a26'), ink: hex('#d7dfee'), ink2: hex('#7f8aa0'), shadow: hex('#2f3a52'), dark: 1 },
};
const KEYS = ['sky', 'hor', 'floor', 'card', 'ink', 'ink2', 'shadow'];
const LIGHT = ['paper', 'bone', 'newsprint', 'paper', 'manila'], DARK = ['negative', 'carbon', 'negative'];
// the stamp pad: mostly red
const PADS = ['#d8452b', '#d8452b', '#c9302c', '#1f3a8a', '#d8452b', '#6a3d9a', '#e0562a', '#1e7a52'];
// the songs of the compilation, where their name says what they want (a night song starts on its negative)
const SONGS = {
  'Sundown Syndrome': { stock: 'manila', flip: 'carbon', pad: '#d8452b' },
  'Remember Me': { stock: 'paper', flip: 'negative', pad: '#1f3a8a' },
  'Beverly Laurel': { stock: 'bone', flip: 'negative', pad: '#d8452b' },
  'List Of People (To Try And Forget About)': { stock: 'newsprint', flip: 'negative', pad: '#c9302c' },
  'Powerlines': { stock: 'negative', flip: 'paper', pad: '#e0562a' },
  "Taxi's Here": { stock: 'carbon', flip: 'bone', pad: '#e0b040' },
  'Patience': { stock: 'paper', flip: 'negative', pad: '#d8452b' },
  'The Boat I Row': { stock: 'paper', flip: 'carbon', pad: '#d8452b' },
  'No Choice': { stock: 'newsprint', flip: 'carbon', pad: '#6a3d9a' },
  'Wings Of Time': { stock: 'bone', flip: 'negative', pad: '#1e7a52' },
};
const FIGS = [[1, 2, 3], [2, 3, 1], [3, 4, 2], [3, 2, 5], [1, 3, 2], [4, 3, 1], [2, 5, 3], [5, 4, 3], [3, 5, 4], [2, 3, 5]];
const WHITE = new THREE.Color('#efede7');
const smooth01 = (x) => { x = Math.max(0, Math.min(1, x)); return x * x * (3 - 2 * x); };
const frac = (x) => x - Math.floor(x);
const mulberry = (a) => () => { a = (a + 0x6d2b79f5) | 0; let t = Math.imul(a ^ (a >>> 15), 1 | a); t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t; return ((t ^ (t >>> 14)) >>> 0) / 4294967296; };
const hash01 = (str) => { let h = 0x811c9dc5; for (let i = 0; i < str.length; i++) h = Math.imul(h ^ str.charCodeAt(i), 0x01000193) >>> 0; return h / 4294967296; };

// ---- what each kind of section looks like when a song has no cue sheet ----
// Most of these songs are "full" nearly all the way through, so full (and quiet) come in several shots that are
// dealt in turn: base() is called once per track, before its sections are read, and resets the deal.
const EVERY = {
  palette: 'stock', sleeves: 0.5, vu: 0.4, lissa: 0.4, chart: 0.5, lathe: 1, sweep: 0, typing: 1, stamp: 0.6, graph: 0.5, regmarks: 0.6, lowsun: 0.2, layout: 0, rota: 0,
  dial: 0, day: 0, pages: 0, swell: 0, sea: 0, course: 0, bearings: 0,
  flow: 0.5, turb: 0.3, pulse: 0.6, fade: 1, bloom: 0.5, vig: 0.7, grain: 0.05, split: 0.1, mblur: 0.4, glitch: 0, trail: 0, zoomBlur: 0, camAz: 0, camEl: 0, camZoom: -0.2, camRoll: 0, drift: 0.04, words: 'drift',
};
const FULL = { sleeves: 1, vu: 1, lissa: 1, chart: 1, stamp: 1, sweep: 0.6, pulse: 1, flow: 1, turb: 0.7, graph: 0.4, regmarks: 0.8, drift: 0.09, split: 0.22, rota: 1 };
const SHOTS = {
  // a clean sheet from straight above
  intro: [{ sleeves: 0.12, vu: 0, lissa: 0.12, chart: 0.12, stamp: 0, graph: 0.9, regmarks: 0.3, camEl: 0.5, camZoom: -0.05, drift: 0.02, flow: 0.3, lowsun: 0, rota: 0.25 }],
  // the drawing, with a thing or two stood up on it
  quiet: [
    { sleeves: 0.58, vu: 0.8, lissa: 0.35, chart: 0.55, stamp: 0.5, camEl: -0.06, camZoom: -0.42, camAz: -0.15, lowsun: 0.3, layout: 5, rota: 0.6 },
    { sleeves: 0.62, vu: 0.5, lissa: 0.55, chart: 0.35, stamp: 0.5, camEl: -0.2, camZoom: -0.3, camAz: 0.4, lowsun: 0.45, layout: 6, rota: 0.6 },
  ],
  build: [{ sleeves: 0.74, vu: 0.9, lissa: 0.65, chart: 0.85, sweep: 1, stamp: 0.6, camEl: -0.3, camZoom: -0.4, camAz: 0.2, drift: 0.07, flow: 0.8, turb: 0.5, lowsun: 0.55, layout: 7, rota: 0.8 }],
  // the book open: down among the cards
  full: [
    { ...FULL, camEl: -0.4, camZoom: -0.45, camAz: 0.1, lowsun: 0.7, layout: 1 },
    { ...FULL, camEl: -0.5, camZoom: -0.32, camAz: -0.42, lowsun: 0.88, layout: 2 },           // right down on the paper: the horizon, the label rising
    { ...FULL, camEl: -0.33, camZoom: -0.6, camAz: 0.5, lowsun: 0.5, layout: 3 },
    { ...FULL, camEl: -0.46, camZoom: -0.5, camAz: 0.8, lowsun: 1, layout: 4 },
  ],
  // the negative
  break: [{ palette: 'flip', sleeves: 0.45, vu: 0.3, lissa: 0.9, chart: 0.4, stamp: 0.25, graph: 1, camEl: 0.22, camZoom: -0.3, drift: 0.03, flow: 0.35, lowsun: 0.1, bloom: 0.8, layout: 8, rota: 0.4 }],
  outro: [{ sleeves: 0.25, vu: 0, lissa: 0.2, chart: 0.2, stamp: 0.4, fade: 0.55, camEl: 0.5, camZoom: -0.65, drift: 0.03, flow: 0.25 }],
  loop: [{ palette: 'flip', glitch: 0.2, trail: 0.3, sleeves: 0.8, lissa: 1, chart: 0.6 }],
};
// A section can run for two minutes on one act, so a generated act (`rota`: how far it may wander) moves its shot on
// every eight bars: round the deck, nearer, further, and now and then right up for the whole drawing. Every sixteen
// the page turns. (update() adds these to the act's own camera before the Stage reads it.)
const ROTA = [{ az: 0, el: 0, zoom: 0 }, { az: 0.6, el: 0.06, zoom: -0.08 }, { az: -0.55, el: -0.04, zoom: 0.1 }, { az: 1.15, el: 0.12, zoom: -0.18 }, { az: -1, el: 0, zoom: -0.05 }, { az: 0.3, el: 0, zoom: 0, top: 1 }];
const ORDER = [0, 1, 2, 3, 0, 4, 5, 2];
const DEAL = { n: 0, off: 0 };
const SECTIONS = {};
for (const kind of Object.keys(SHOTS)) Object.defineProperty(SECTIONS, kind, { enumerable: true, get() { const v = SHOTS[kind]; return v[(DEAL.off + (v.length > 1 ? DEAL.n++ : 0)) % v.length]; } });

export default class RaritiesWorld {
  static SECTIONS = SECTIONS;
  static base(info) { DEAL.n = 0; DEAL.off = Math.floor(hash01(info.stem || info.title || '') * 4); return EVERY; }
  static WORDS = { font: '"Space Mono", ui-monospace, monospace', wide: '"Space Mono", ui-monospace, monospace', weight: 700, upper: true, track: 0.35, streak: 0.25, chroma: false, rise: 0 };

  constructor(r) {
    this.r = r;
    this.scene = new THREE.Scene();
    this.marks = new Marks(r);
    this.pal = {}; for (const k of KEYS) this.pal[k] = PALETTES.paper[k].clone();
    this.acc = hex(PADS[0]); this.accWant = hex(PADS[0]); this.accTmp = new THREE.Color();
    this.darkK = 0; this.title = null; this.song = SONGS.Patience; this.seed = 0;
    this.inkLight = ['#1b1b1d', PADS[0]]; this.inkDark = ['#efede7', PADS[0]];
    this.eye = new THREE.Vector3(-0.6, -1.1, 0.7); this.camA = Math.atan2(-1.1, -0.6);
    this.low = 0; this.high = 0; this.needle = [0, 0, 0]; this.needleV = [0, 0, 0]; this.needleT = [0, 0, 0];
    this.lay = 0; this.layWant = 0; this.fold = 1; this.folding = 0;
    this.travel = 0; this.day = 0; this.lastT = 0; this.sweepT = 0; this.tapeT = 0; this.pageT = 0; this.swellT = 0; this.beam = 0; this.lisA = 1.07; this.phase = [0, 0, 0];
    // what has been heard: the whole song by progress (for the spiral), and the last half minute (for the tape)
    this.songBuf = new Uint8Array(4096 * 4); this.songTex = new THREE.DataTexture(this.songBuf, 4096, 1, THREE.RGBAFormat);
    this.songTex.magFilter = this.songTex.minFilter = THREE.LinearFilter; this.songTex.needsUpdate = true; this.songIdx = -1;
    this.tapeBuf = new Uint8Array(1024 * 4); this.tapeTex = new THREE.DataTexture(this.tapeBuf, 1024, 1, THREE.RGBAFormat);
    this.tapeTex.magFilter = this.tapeTex.minFilter = THREE.LinearFilter; this.tapeTex.wrapS = THREE.RepeatWrapping; this.tapeTex.needsUpdate = true; this.tapeIdx = 0;

    const P = this.pal, V4 = (c) => uvOf(c);
    this.uvs = { stamps: CELL.stamps.map(V4), hands: CELL.hands.map(V4), glyphs: CELL.glyphs.map(V4), typed: CELL.typed.map(V4), small: CELL.small.map(V4), misc: CELL.misc.map(V4), vu: V4(CELL.vu), ticket: V4(CELL.ticket), digits: V4(CELL.digits), etch: V4(CELL.etch) };
    // one set of uniforms for everything that shares the paper, the ink and the light
    const sh = this.u = {
      uSky: { value: P.sky }, uHor: { value: P.hor }, uPaper: { value: P.floor }, uCard: { value: P.card }, uInk: { value: P.ink }, uInk2: { value: P.ink2 }, uShadowC: { value: P.shadow }, uAcc: { value: this.acc },
      uL: { value: new THREE.Vector3(-0.5, -0.2, 0.84) }, uT: { value: 0 }, uFade: { value: 1 }, uInkRed: { value: 0 }, uKick: { value: 0 }, uShade: { value: 1 }, uDarkK: { value: 0 },
      uSwell: { value: new THREE.Vector4() }, uHeading: { value: new THREE.Vector2(0.6, 0.8) }, tAtlas: { value: this.marks.tex },
      uKnob: { value: new THREE.Vector4() }, uLay: { value: 0 }, uLayRot: { value: 0 }, uFold: { value: 1 }, uCamDir: { value: new THREE.Vector2(-0.48, -0.88) },
      uVUn: { value: new THREE.Vector3() }, uRead: { value: new THREE.Vector4() }, uType: { value: 0 },
      tTape: { value: this.tapeTex }, uHead: { value: 0 }, uChart: { value: 0 }, uNow: { value: new THREE.Vector3() }, uSpeed: { value: 0.15 }, uTapeRot: { value: new THREE.Vector4(1, 0, -1, 0) }, uTapeRise: { value: new THREE.Vector2() },
      uCtr: { value: new THREE.Vector3() }, uFreq: { value: new THREE.Vector3(1, 2, 3) }, uPhase: { value: new THREE.Vector3() }, uR: { value: 0.2 }, uWide: { value: 0.002 }, uDist: { value: 0 }, uCx: { value: 0 }, uA: { value: 0 }, uBeam: { value: 0 },
      uPages: { value: 0 }, uPageT: { value: 0 }, uDay: { value: 0 }, uWind: { value: new THREE.Vector2(0.8, 0.6) }, uResY: { value: 720 },
    };
    this.fu = {
      ...sh, uGrid: { value: 0.5 }, uLathe: { value: 1 }, uTip: { value: 0 }, uPitch: { value: 0.05 }, uTotal: { value: 30 }, uRailA: { value: 0 }, uMarks: { value: 0.5 }, uSweep: { value: 0 }, uSweepT: { value: 0 },
      uStrip: { value: 1 }, uStripA: { value: 1 }, uSeed: { value: 0 }, uLevel: { value: 0 }, uBold: { value: 1 }, uRing: { value: 1 }, uDial: { value: 0 }, uCourse: { value: 0 }, uBear: { value: 0 }, uStroke: { value: 0 },
      uHands: { value: new THREE.Vector3() }, tSong: { value: this.songTex }, uEtch: { value: this.uvs.etch }, uDigits: { value: this.uvs.digits }, uOar: { value: 0 },
    };
    this.su = { ...sh, uGrid: { value: 0.3 }, uSkyMarks: { value: 1 }, uStampUV: { value: this.uvs.stamps[0] }, uLabelDir: { value: new THREE.Vector3(0.48, 0.88, 0) }, uSleeveDir: { value: new THREE.Vector3(-0.9, 0.4, 0) } };

    const sky = this.sky = new THREE.Mesh(new THREE.SphereGeometry(70, 48, 24), new THREE.ShaderMaterial({ vertexShader: SKY_VS, fragmentShader: SKY_FS, uniforms: this.su, side: THREE.BackSide, depthWrite: false }));
    sky.frustumCulled = false; sky.renderOrder = -10; this.scene.add(sky);
    this.scene.add(this.floor = this.buildFloor());
    const R = mulberry(20092023);
    const cards = buildCards(sh, R, this.uvs); this.cards = cards.cards; this.scene.add(cards.shadows, cards.cards);
    const tapes = buildTapes(sh); this.tapes = tapes.tapes; this.tapeSh = tapes.shadows; this.scene.add(tapes.shadows, tapes.tapes);
    const lis = buildLissa(sh); this.lissa = lis.fig; this.lissaSh = lis.shadow; this.scene.add(lis.shadow, lis.fig);
    this.pages = buildPages(sh, R, this.uvs); this.pages.visible = false; this.scene.add(this.pages);
  }
  // the sheet: a disc, finely divided near the deck so it can heave
  buildFloor() {
    const NR = 120, NS = 144, pos = new Float32Array((NR + 1) * NS * 3), idx = [];
    for (let j = 0; j <= NR; j++) {
      const rr = 90 * Math.pow(j / NR, 2.6);
      for (let i = 0; i < NS; i++) { const a = i / NS * TAU, o = (j * NS + i) * 3; pos[o] = rr * Math.cos(a); pos[o + 1] = rr * Math.sin(a); }
      if (j) for (let i = 0; i < NS; i++) { const a = (j - 1) * NS + i, b = (j - 1) * NS + (i + 1) % NS, c = j * NS + i, d = j * NS + (i + 1) % NS; idx.push(a, b, c, b, d, c); }
    }
    const g = new THREE.BufferGeometry(); g.setAttribute('position', new THREE.BufferAttribute(pos, 3)); g.setIndex(idx);
    const m = new THREE.Mesh(g, new THREE.ShaderMaterial({ vertexShader: FLOOR_VS, fragmentShader: FLOOR_FS, uniforms: this.fu, side: THREE.DoubleSide }));
    m.frustumCulled = false; m.renderOrder = -6;
    return m;
  }

  ink() { return this.darkK > 0.5 ? this.inkDark : this.inkLight; }

  // a new song on the deck: its stock, its pad, its figure, a clean sheet
  newSong(s) {
    this.title = s.title; this.seed = s.seed || 0;
    const sd = this.seed, song = this.song = SONGS[s.title] || { stock: LIGHT[Math.floor(sd * 5)], flip: DARK[Math.floor(frac(sd * 7.3) * 3)], pad: PADS[Math.floor(frac(sd * 13.7) * PADS.length)] };
    this.accWant.set(song.pad).convertLinearToSRGB();
    this.inkLight = ['#1b1b1d', song.pad]; this.inkDark = ['#efede7', `#${this.accTmp.set(song.pad).lerp(WHITE, 0.3).getHexString()}`];
    this.marks.setTrack(s.title);
    this.songBuf.fill(0); this.songTex.needsUpdate = true; this.songIdx = -1;
    this.tapeBuf.fill(0); this.tapeTex.needsUpdate = true;
    const fig = FIGS[Math.floor(frac(sd * 31.7) * FIGS.length)]; this.u.uFreq.value.set(fig[0], fig[1], fig[2]);
    this.fu.uSeed.value = sd; this.fu.uRailA.value = frac(sd * 5.3) * TAU; this.fu.uStripA.value = 1.07 + (frac(sd * 9.1) - 0.5) * 2.4;
    this.su.uStampUV.value = this.uvs.stamps[Math.floor(frac(sd * 17.3) * 8)];
    this.lay = this.layWant; this.fold = 1; this.folding = 0; this.travel = 0; this.day = 0;
  }

  update(dt, p, s, loopT) {
    if (s.title !== this.title) this.newSong(s);
    const u = this.u, fu = this.fu, sd = this.seed, kick = s.kick || 0, rate = s.rate ?? 1, run = s.playing ? 1 : 0;
    // the paper and the ink ease toward the act's stock ('flip' is this song's negative; anything unknown, its own stock)
    const name = p.palette === 'flip' ? this.song.flip : PALETTES[p.palette] ? p.palette : this.song.stock, target = PALETTES[name];
    const k = 1 - Math.exp(-dt * (p.palFast ? 14 : 1.6));
    for (const key of KEYS) this.pal[key].lerp(target[key], k);
    this.darkK += (target.dark - this.darkK) * k;
    this.acc.lerp(this.accTmp.copy(this.accWant).lerp(PALETTES.negative.ink, 0.22 * this.darkK), k);
    // the level, as a meter sees it: quick up, slow down
    const low = s.low || 0, high = s.high || 0;
    this.low += (low - this.low) * (1 - Math.exp(-dt * (low > this.low ? 28 : 5)));
    this.high += (high - this.high) * (1 - Math.exp(-dt * (high > this.high ? 28 : 6)));
    const tg = this.needleT; tg[0] = Math.min(1, this.low * 1.05 + kick * 0.2); tg[1] = Math.min(1, this.high * 1.15); tg[2] = Math.min(1, 0.25 + kick * 0.8);
    for (let i = 0; i < 3; i++) {                                   // needles have mass
      this.needleV[i] += ((tg[i] - this.needle[i]) * 260 - this.needleV[i] * 19) * Math.min(dt, 0.033);
      this.needle[i] = Math.max(-0.03, Math.min(1.04, this.needle[i] + this.needleV[i] * Math.min(dt, 0.033)));
    }
    u.uVUn.value.set(this.needle[0], this.needle[1], this.needle[2]);
    u.uT.value = loopT; u.uKick.value = kick * p.pulse; u.uFade.value = p.fade; u.uDarkK.value = this.darkK;
    u.uInkRed.value = Math.min(1, (s.flash || 0) * 1.4) * (s.reduce ? 0.4 : 1);
    u.uShade.value = 1 - 0.25 * this.darkK;

    // the light: high and to one side; `lowsun` brings it down, `day` takes it round the deck like a sun
    const dl = Math.max(-0.2, Math.min(0.2, loopT - this.lastT)); this.lastT = loopT;
    this.day += dl * (p.day || 0) / 60;
    const day = this.day, el = (1.0 - 0.8 * (p.lowsun || 0)) * (0.45 + 0.55 * (0.5 + 0.5 * Math.cos(day * TAU))), az = -2.8 + frac(sd * 3.7) * 0.9 - day * TAU;
    u.uL.value.set(Math.cos(el) * Math.cos(az), Math.cos(el) * Math.sin(az), Math.sin(el));

    // which deal of the cards: a change folds the book shut, turns the page and opens it again
    // a generated act wanders: a new shot every eight bars, a new page every sixteen
    let phrase = 0;
    if (p.rota) {
      phrase = s.barPhase != null ? Math.floor(Math.max(0, s.bar) / 8) : Math.floor(loopT / 18);
      const ro = ROTA[ORDER[(phrase + Math.floor(sd * 8)) % ORDER.length]], w = p.rota;
      if (ro.top && w >= 1) { p.camEl = 0.86; p.camZoom = -1.45; p.camAz += ro.az; }
      else if (!ro.top) { p.camAz += ro.az * w; p.camEl += ro.el * w; p.camZoom += ro.zoom * w; }
    }
    const lay = Math.round(p.act?.layout ?? p.layout ?? 0) * 5 + (phrase >> 1);      // the act's own number, not the blend on the way to it
    if (lay !== this.layWant) { this.layWant = lay; this.folding = 1; }
    if (this.folding) { this.fold -= dt * 3.2; if (this.fold <= 0) { this.fold = 0; this.folding = 0; this.lay = this.layWant; } }
    else this.fold = Math.min(1, this.fold + dt * 1.5);
    u.uFold.value = smooth01(this.fold); u.uLay.value = sd * 10 + this.lay * 1.7; u.uLayRot.value = sd * TAU + this.lay * 0.9;
    u.uKnob.value.set((p.sleeves || 0), (p.vu || 0), (p.typing || 0), (p.stamp || 0));
    this.camA = Math.atan2(this.eye.y, this.eye.x); u.uCamDir.value.set(Math.cos(this.camA), Math.sin(this.camA));

    // the job slip: four characters a beat, a line every seven beats, the sheet pulled every sixty-four
    const beats = s.beatPhase != null ? s.beat + s.beatPhase : loopT * 2;
    u.uType.value = ((beats % 64) + 64) % 64;
    const t = s.songT || 0;
    u.uRead.value.set(Math.max(0, (s.bar || 0) + 1) % 10000, s.barPhase != null ? 1 + Math.min(3, Math.floor(s.barPhase * 4)) : 1 + (Math.floor(beats) & 3), Math.floor(t / 60), Math.floor(t % 60));

    // the spiral: as many turns as the song is long, each turn a few seconds, written down as it is heard
    const dur = s.progress > 0.003 ? t / s.progress : 240, turns = Math.max(26, Math.min(50, dur * 0.125)), prog = Math.min(1, t / dur);
    fu.uTotal.value = turns; fu.uPitch.value = (ROUT - RIN) / turns; fu.uTip.value = prog * turns;
    const si = Math.floor(prog * 4095);
    if (si !== this.songIdx && run) {
      const from = si > this.songIdx && si - this.songIdx < 12 ? this.songIdx + 1 : si, b = this.songBuf;
      for (let i = from; i <= si; i++) { b[i * 4] = Math.min(255, (low * 0.75 + kick * 0.45) * 255); b[i * 4 + 1] = high * 255; b[i * 4 + 2] = kick * 255; b[i * 4 + 3] = 255; }
      this.songIdx = si; this.songTex.needsUpdate = true;
    }
    fu.uLathe.value = (p.lathe || 0) * (1 - (p.sea || 0)); fu.uGrid.value = (p.graph || 0); fu.uMarks.value = (p.regmarks || 0); fu.uBold.value = 0.85 + 0.5 * (s.energy || 0);
    fu.uRing.value = 1; fu.uStrip.value = smooth01((p.typing || 0) * 2) * (1 - (p.sea || 0)); fu.uLevel.value = Math.min(1, this.low * 1.1 + kick * p.pulse * 0.25); fu.uSweep.value = (p.sweep || 0);
    this.sweepT += dt * rate * run * (0.4 + p.flow) * (0.6 + 1.2 * (s.energy || 0)); fu.uSweepT.value = this.sweepT;

    // the tape: thirty samples a second
    this.tapeT += dt * run * 30;
    const ti = Math.floor(this.tapeT);
    if (ti !== this.tapeIdx) {
      const b = this.tapeBuf;
      for (let i = Math.max(this.tapeIdx + 1, ti - 3); i <= ti; i++) { const o = (i & 1023) * 4; b[o] = low * 255; b[o + 1] = high * 255; b[o + 2] = kick * 255; b[o + 3] = 255; }
      this.tapeIdx = ti; this.tapeTex.needsUpdate = true;
    }
    const chart = (p.chart || 0) * (1 - (p.sea || 0));
    u.uHead.value = this.tapeT; u.uChart.value = chart; u.uNow.value.set(low, high, kick);
    const a0 = (frac(sd * 23.1) - 0.5) * 0.9, a1 = a0 + Math.PI + (frac(sd * 41.3) - 0.5) * 0.8, lift = smooth01((chart - 0.55) / 0.45) * u.uFold.value;
    u.uTapeRot.value.set(Math.cos(a0), Math.sin(a0), Math.cos(a1), Math.sin(a1));
    u.uTapeRise.value.set(lift * (1 - smooth01((Math.cos(a0 + 0.28 - this.camA) - 0.05) / 0.5)), lift * (1 - smooth01((Math.cos(a1 + 0.36 - this.camA) - 0.05) / 0.5)));
    this.tapes.visible = this.tapeSh.visible = chart > 0.01;

    // the figure: it keeps to the far side of the deck from the camera
    const lis = (p.lissa || 0), want = this.camA + Math.PI + (frac(sd * 11.3) - 0.5) * 1.5;
    this.lisA += Math.atan2(Math.sin(want - this.lisA), Math.cos(want - this.lisA)) * (1 - Math.exp(-dt * 1.2));
    const fl = (0.25 + p.flow) * rate;
    this.phase[0] += dt * fl * 0.37; this.phase[1] += dt * fl * 0.29; this.phase[2] += dt * fl * 0.21; this.beam += dt * rate * (0.25 + 0.5 * p.flow);
    u.uCtr.value.set(Math.cos(this.lisA) * 0.6, Math.sin(this.lisA) * 0.6, 0.1 + 0.12 * lis);
    u.uPhase.value.set(this.phase[0] + sd * 9, this.phase[1] + sd * 5, this.phase[2] + sd * 3);
    u.uR.value = (0.07 + 0.15 * lis) * (1 + 0.12 * this.low + 0.08 * kick * p.pulse); u.uCx.value = smooth01((lis - 0.25) / 0.6);
    u.uDist.value = p.turb * (0.25 + 0.9 * this.high) * lis; u.uWide.value = (0.0011 + 0.0009 * lis + 0.0009 * kick * p.pulse) * (1 + 0.5 * this.darkK); u.uA.value = smooth01(lis / 0.12); u.uBeam.value = this.beam;
    this.lissa.visible = this.lissaSh.visible = lis > 0.005;

    // the sky's own paperwork comes up with the cards
    const rise = smooth01((p.sleeves || 0) * 1.15 - 0.2) * (0.75 + 0.25 * (s.progress || 0));
    const la = 1.07 + (frac(sd * 2.9) - 0.5) * 1.6, le = -0.16 + 0.19 * rise, sa = la + 1.2 + frac(sd * 6.1), se = -0.15 + 0.2 * rise;
    this.su.uLabelDir.value.set(Math.cos(la) * Math.cos(le), Math.sin(la) * Math.cos(le), Math.sin(le));
    u.uHeading.value.set(Math.cos(la), Math.sin(la));                 // a travelling deck makes for the label on the horizon
    this.su.uSleeveDir.value.set(Math.cos(sa) * Math.cos(se), Math.sin(sa) * Math.cos(se), Math.sin(se));
    this.su.uGrid.value = (p.graph || 0) * 0.6;

    // the clock, the pages (Patience) and the sea (The Boat I Row)
    const dial = (p.dial || 0), sea = (p.sea || 0);
    fu.uDial.value = dial;
    if (dial > 0) fu.uHands.value.set(day * TAU * 12, day * TAU, Math.floor(beats) * TAU / 60 + Math.min(1, frac(beats) * 6) * TAU / 60);
    const pages = (p.pages || 0);
    this.pages.visible = pages > 0.01;
    if (pages > 0.01) { this.pageT += dt * rate * (0.6 + p.flow); u.uPages.value = pages; u.uPageT.value = this.pageT; u.uDay.value = Math.floor(beats / 4); u.uWind.value.set(Math.cos(this.camA + 2.2), Math.sin(this.camA + 2.2)); }
    // rowing: a pull on every bar, a glide between
    const bp = s.barPhase != null ? s.barPhase : frac(loopT * 0.5), pull = 0.45 + 1.6 * Math.exp(-bp * 3.2);
    this.travel += dt * rate * run * sea * p.flow * 0.55 * pull;
    this.swellT += dt * rate * (0.5 + p.flow);
    u.uSwell.value.set((p.swell || 0) * (0.075 + 0.075 * sea), this.swellT, this.travel, sea);
    fu.uOar.value = bp < 0.38 ? 0.62 - 1.24 * smooth01(bp / 0.38) : -0.62 + 1.24 * smooth01((bp - 0.38) / 0.62);   // reach, pull, and back
    fu.uCourse.value = (p.course || 0); fu.uBear.value = (p.bearings || 0); fu.uStroke.value = sea > 0 ? Math.max(0.2, 0.55 * p.flow * 0.93 * (s.beatLen || 0.5) * 4) : 0;
  }

  render(r, cam) {
    this.eye.setFromMatrixPosition(cam.matrixWorld); this.u.uResY.value = r.domElement.height;
    r.render(this.scene, cam);
  }

  // paper does not glow: bloom and vignette belong to the negatives. A flash on white paper is the ink going red
  // (in the shaders) and a blink of the negative
  post(post, p, s) {
    const d = this.darkK;
    post.uBloom *= 0.04 + 0.6 * d; post.uThresh = 0.82 - 0.25 * d;
    post.uVig *= 0.42 + 0.58 * d; post.uGrain = Math.max(post.uGrain, 0.04);
    post.uSplit *= 0.5 + 0.5 * d;
    if (d < 0.5) { const f = post.uFlash; post.uFlash = f * 0.3; if (f > 0.42 && !s.reduce) post.uInv = 1; }
  }
}
