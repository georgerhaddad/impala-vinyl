// The stage: a music video around the deck, for the eras that have a world (so far: Currents).
// It shares the deck's WebGL context and depth buffer (three.js draws after the deck, into the same frame), so the
// world stands in the same space as the turntable; then a post pass treats the whole picture.
//
// What drives it, all read at the needle's place in the groove (so scratching runs it backwards, stopping the
// platter freezes it, and a needle drop jumps it):
//   a cue sheet (src/stage/cues/<song>.js) for songs choreographed by hand: acts that blend into each other, events
//   otherwise the song map's sections (assets/maps/<stem>.json, from tools/analyze.mjs), each given a preset
//   the deck's actual output (Listener): kicks, bass, treble, for everything that hits on the beat
//   time-synced lyrics from LRCLIB (lyrics.js), as words over the picture (words.js)
// Architecture after ilmc-vinyl's room (github.com/SunkenInTime/ilmc-vinyl, MIT); post.js and listener.js are its code.
import * as THREE from 'three';
import { Post } from './post.js';
import { Listener } from './listener.js';
import { Words } from './words.js';
import { loadMap } from './song.js';
import { loadLyrics } from './lyrics.js';
import { CurrentsWorld } from './worlds/currents.js';

const WORLDS = { currents: CurrentsWorld };
const CUES = { 'currents/01-let-it-happen': () => import('./cues/let-it-happen.js') };   // hand-choreographed songs

// every act parameter, and where it starts (see worlds/currents.js for what each one does)
export const DEFAULTS = {
  dive: 0, diveRise: 0, alt: 0, planet: 0, ring: 0, warp: 0, nebula: 0, galaxy: 0, into: 0,
  flow: 0.5, turb: 0.3, vortex: 0, calm: 0, lift: 0, width: 1, pulse: 0.5, spark: 0.6, rainbow: 0.5, fade: 1, orb: 0.35, sun: 0, stripes: 1,
  camAz: 0, camEl: 0, camZoom: -0.25, camRoll: 0, drift: 0.05,
  bloom: 0.55, grain: 0.04, vig: 0.8, split: 0.2, glitch: 0, trail: 0, zoomBlur: 0, mblur: 0.6,
  palette: 'violet', words: 'drift', fadeIn: 2,
};
const STEP = new Set(['dive']);                // switches, not blends
const NUM = Object.keys(DEFAULTS).filter((k) => typeof DEFAULTS[k] === 'number' && !STEP.has(k));
const smooth = (x) => { x = Math.max(0, Math.min(1, x)); return x * x * (3 - 2 * x); };

// a song with no cue sheet: an act per section of its map
function actsFromMap(song, lp2) {
  const P = {
    intro: { flow: 0.3, turb: 0.1, spark: 0.35, orb: 0.25, calm: 0.25, camZoom: -0.15 },
    quiet: { flow: 0.4, turb: 0.15, spark: 0.45, calm: 0.2, orb: 0.3 },
    build: { flow: 0.75, turb: 0.45, spark: 0.85, orb: 0.4, camZoom: -0.3, drift: 0.08 },
    full: { flow: 1.15, turb: 0.85, spark: 1, rainbow: 0.9, pulse: 1, bloom: 1, orb: 0.5, camZoom: -0.42, drift: 0.1, split: 0.5 },
    break: { flow: 0.3, turb: 0.1, calm: 0.6, palette: 'night', spark: 0.3, orb: 0.6, camZoom: -0.2 },
    outro: { flow: 0.3, turb: 0.2, fade: 0.55, orb: 0.55, calm: 0.3, camZoom: -0.5 },
    loop: { flow: 0.9, turb: 0.6, glitch: 0.25, trail: 0.4, palette: 'night' },
  };
  const base = { palette: lp2 ? 'mustard' : 'violet' };
  return (song?.sections?.length ? song.sections : [{ t0: 0, kind: 'full', e: 0.6 }]).map((s) => ({ t: s.t0, fadeIn: 2.5, ...base, ...(P[s.kind] || P.full) }));
}
// fill in each act from the one before it, so a cue sheet only says what changes
function resolve(acts) {
  let prev = { ...DEFAULTS, t: 0 };
  return acts.slice().sort((a, b) => a.t - b.t).map((a) => (prev = { ...prev, ...a }));
}
function paramsAt(acts, t) {
  let i = 0; while (i + 1 < acts.length && acts[i + 1].t <= t) i++;
  const cur = acts[i], prev = acts[Math.max(0, i - 1)], k = i === 0 ? 1 : smooth((t - cur.t) / Math.max(0.01, cur.fadeIn));
  const p = { ...cur };
  for (const key of NUM) p[key] = prev[key] + (cur[key] - prev[key]) * k;
  p.act = cur; p.actIdx = i; p.actK = k;
  return p;
}

export class Stage {
  constructor(gl, canvas, opts = {}) {
    const r = this.r = new THREE.WebGLRenderer({ canvas, context: gl, antialias: false });
    r.autoClear = false; r.toneMapping = THREE.ACESFilmicToneMapping; r.toneMappingExposure = 1; r.outputColorSpace = THREE.SRGBColorSpace;
    this.cam = new THREE.PerspectiveCamera(); this.cam.matrixAutoUpdate = false; this.cam.matrixWorldAutoUpdate = false;
    this.post = new Post(r); this.listener = new Listener();
    this.words = opts.words ? new Words(opts.words) : null;
    this.reduce = !!opts.reduceFlashing;
    this.worlds = {}; this.tracks = null; this.cur = null;
    this.clock = 0; this.flash = 0; this.glitch = 0; this.camOff = { az: 0, el: 0, zoom: -0.25, roll: 0 }; this.shake = 0;
  }
  attachAudio(ctx, node) { this.listener.attach(ctx, node); }
  setTap(tap) { this.tap = tap; }                // the cut walls, lightly, for the dive into the groove
  // the record's tracks, in groove order: [{ title, stem, era, lp2 }], or null when nothing on the platter has a world
  setTracks(list) { this.tracks = list && list.some((k) => WORLDS[k.era]) ? list : null; this.cur = null; }
  active() { return !!this.tracks; }
  // load what a track needs; until it arrives the world plays on the listener alone
  track(k) {
    const info = this.tracks[Math.max(0, Math.min(this.tracks.length - 1, k))];
    if (this.cur?.info === info) return this.cur;
    const cur = this.cur = { info, song: null, acts: resolve(actsFromMap(null, info.lp2)), cues: null, lyrics: [] };
    this.lastSongT = null;
    if (this.words) this.words.setLines([]);
    if (info.stem) loadMap(info.stem).then((song) => {
      if (this.cur !== cur) return;
      cur.song = song;
      if (!cur.cues) cur.acts = resolve(actsFromMap(song, info.lp2));
      loadLyrics(info.title, song?.dur, info.stem).then((lines) => { if (this.cur === cur) { cur.lyrics = lines; this.words?.setLines(lines); } });
    });
    else loadLyrics(info.title).then((lines) => { if (this.cur === cur) { cur.lyrics = lines; this.words?.setLines(lines); } });
    const cue = CUES[info.stem];
    if (cue) cue().then((m) => { if (this.cur === cur) { cur.cues = m.default; cur.acts = resolve(m.default.acts); } }).catch((e) => console.warn('cues', e));
    return cur;
  }

  // dt: real seconds since the last frame; pos: { k, t, on, rate } where the needle is (null: not on the record)
  update(dt, pos) {
    if (!this.tracks) { this.words?.show(false); return null; }
    if (this.forceT != null) { this.forceT += dt; pos = { k: this.forceK || 0, t: this.forceT, on: true, rate: 1 }; }   // debugging: play the video at a time, without the record
    const cur = this.track(pos?.k ?? 0), era = cur.info.era;
    const world = WORLDS[era] ? (this.worlds[era] ||= new WORLDS[era](this.r)) : null;
    if (!world) { this.words?.show(false); return null; }
    this.listener.update(dt);
    if (this.fake) Object.assign(this.listener, this.fake(pos ? Math.max(0, pos.t) : 0));   // offline rendering: the beat from the map
    const L = this.listener, playing = !!(pos && pos.on && Math.abs(pos.rate) > 0.05);
    const t = pos ? Math.max(0, pos.t) : 0, info = cur.song ? cur.song.at(t) : null;
    const p = paramsAt(cur.acts, t);
    // the world's clock follows the record: forwards, backwards, stopped. Inside a stuck loop it folds, so the
    // picture repeats exactly with the sound.
    const rep = info?.rep && (p.act.loop !== false) ? info.rep : p.act.loop && p.act.period ? { t0: p.act.t, period: p.act.period } : null;
    if (rep) {
      if (!this.loop || this.loop.t0 !== rep.t0) this.loop = { t0: rep.t0, base: this.clock, n: -1 };
      const n = Math.floor((t - rep.t0) / rep.period);
      if (n !== this.loop.n && playing) { this.loop.n = n; this.glitch = Math.max(this.glitch, n % 8 === 0 ? 0.55 : 0.1); if (n % 8 === 0) this.cut(n); }
      this.clock = this.loop.base + ((t - rep.t0) % rep.period);
    } else {
      this.loop = null;
      this.clock += dt * (pos ? (pos.on ? pos.rate : 0) : 0.25);
    }
    // events: only fired when played through, not when the needle jumps past them
    if (cur.cues?.events && this.lastSongT != null && playing && t > this.lastSongT && t - this.lastSongT < 0.5) {
      for (const e of cur.cues.events) if (e.t > this.lastSongT && e.t <= t) this.fire(e);
    }
    this.lastSongT = pos ? t : null;
    if (pos?.th != null && this.forceT == null) this.lastTh = pos.th;
    const kick = L.kick || 0, s = { tap: this.tap, th: this.forceT != null ? this.lastTh : pos?.th ?? this.lastTh, songT: t, kick, low: L.low, high: L.high, onset: info ? info.onset : L.level, energy: info ? info.energy : L.level, rate: playing ? 1 : 0.15 };
    world.update(dt, p, s, this.clock);
    // the camera: the act's shot, a slow drift, a shove on the kick; cuts jump straight there
    const drift = p.drift, tc = this.clock;
    const want = { az: p.camAz + drift * Math.sin(tc * 0.071) * 3, el: p.camEl + drift * Math.sin(tc * 0.053 + 1) * 1.2, zoom: p.camZoom + drift * 0.6 * Math.sin(tc * 0.037 + 2), roll: p.camRoll };
    const k = 1 - Math.exp(-dt * 1.2);
    for (const key of ['az', 'el', 'zoom', 'roll']) this.camOff[key] += (want[key] - this.camOff[key]) * k;
    this.shake = Math.max(this.shake * Math.exp(-dt * 10), kick * p.pulse * 0.012);
    this.flash *= Math.exp(-dt * 6); this.glitch *= Math.exp(-dt * 5);
    const dim = this.reduce ? 0.25 : 1;
    const post = {
      uBloom: p.bloom * 0.7 * (1 + 0.4 * kick), uFlash: this.flash * dim * 0.85, uSplit: (p.split * kick + this.glitch * 0.6) * dim, uZoom: p.zoomBlur, uGrain: p.grain, uVig: p.vig,
      uGlitch: Math.min(1, p.glitch + this.glitch) * dim * (world.diving ? 0.3 : 1), uTrail: p.trail, uMBlur: p.mblur, uTri: 0, uInv: 0, uPixel: 0, uThresh: 0.8, tint: [1, 1, 1],
    };
    if (this.words) {
      this.words.show(true);
      const pal = { violet: ['#f4eef7', '#e0322b'], night: ['#b79ad6', '#e0322b'], mustard: ['#fff4dc', '#e0322b'], dawn: ['#fff0f3', '#ff5a3a'], white: ['#2a1a45', '#e0322b'] }[p.palette] || ['#f4eef7', '#e0322b'];
      this.words.update(dt, pos && pos.on ? t : null, { style: p.words, keywords: cur.cues?.keywords, ink: pal[0], acc: pal[1], flow: p.flow * 2, reduce: this.reduce });
    }
    const sh = this.shake;
    return { cam: { az: this.camOff.az + sh * Math.sin(tc * 91), el: this.camOff.el + sh * Math.cos(tc * 77), zoom: this.camOff.zoom, roll: this.camOff.roll }, post, bare: true, world };
  }
  fire(e) {
    if (e.flash) this.flash = Math.max(this.flash, e.flash);
    if (e.glitch) this.glitch = Math.max(this.glitch, e.glitch);
    if (e.cut) Object.assign(this.camOff, e.cut);
    if (e.palette && this.cur) { /* palettes ease in the world; a hard cut is an act with palFast */ }
  }
  cut(n) {                                       // a jump cut inside a stuck loop: somewhere else, same moment
    const shots = [{ az: 0.6, el: 0.15, zoom: -0.1 }, { az: -0.8, el: -0.1, zoom: -0.5 }, { az: 1.9, el: 0.25, zoom: 0.25 }, { az: -0.2, el: 0.35, zoom: -0.3 }];
    Object.assign(this.camOff, shots[Math.floor(n / 8) % shots.length]);
  }

  // after the deck has drawn: the world into the same colour and depth, then the treatment over all of it
  render(deckCam, room) {
    const r = this.r, c = this.cam;
    r.resetState();
    c.projectionMatrix.fromArray(deckCam.proj); c.projectionMatrixInverse.copy(c.projectionMatrix).invert();
    c.matrixWorldInverse.fromArray(deckCam.m); c.matrixWorld.copy(c.matrixWorldInverse).invert();
    const w = r.domElement.width, h = r.domElement.height;
    r.setViewport(0, 0, w / r.getPixelRatio(), h / r.getPixelRatio());
    room.world.render(r, c);
    // how far the picture moved since the last frame, for the motion blur
    const vp = c.projectionMatrix.clone().multiply(c.matrixWorldInverse), at = new THREE.Vector3(0.042, 0, -0.03), now = at.clone().applyMatrix4(vp);
    if (room.world.diving) room.post.vel = [0, 0];                // the deck's camera is not what is on screen
    else if (this.prevVP) { const was = at.clone().applyMatrix4(this.prevVP); room.post.vel = [Math.max(-0.2, Math.min(0.2, (now.x - was.x) * 0.5)), Math.max(-0.2, Math.min(0.2, (now.y - was.y) * 0.5))]; }
    this.prevVP = vp;
    this.post.resize(w, h);
    this.post.run({ time: this.clock, post: room.post });
    r.resetState();
  }
}
