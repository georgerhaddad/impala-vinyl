// Deadbeat: a bush rave at 4 a.m. The deck is on a trestle table on a low rise in a clearing; the dancefloor is the
// red dirt round it, ringed by speaker stacks, ringed by scrub and gums, under the southern sky. The look is a flash
// photograph on a slow shutter: the light on the camera burns the near things orange and falls off to black, and
// every small light drags a streak. It runs on the beat: cones on the kick, strobes on the song map's beats, smoke
// on the bass, streaks on the treble. (deadbeat-bush.js: the place. deadbeat-rig.js: the sound system and lights.)
//
// Its knobs (all 0 = absent, so a cue sheet's first act says what the night is like):
//   strobe      how hard the flash and the rig's strobes hit on the beat      strobeRate  flashes per beat (0: every other beat; never above ~2.8 a second)
//   half        1: the song map counts this song at double tempo; halve everything that runs on its beats
//   torch       the light on the camera held on (the frozen-flash look, without the flashing)
//   smoke       haze: fog, puffs, halos, how much the beams show             beams       the moving heads on the stacks
//   beamForm    0: the formation changes every four bars; 1 sky fan, 2 sweeping the floor, 3 a tent over the deck, 4 chase
//   shutter     how long the light trails are                                 stacks      size of the speaker stacks (1 = a big rig)
//   work        the work-light on its tripod by the deck (and its moths)      festoon     the strings of bulbs
//   crowd       how much of the floor is dancing                              laser       fans of laser from two of the stacks
//   moon        a low moon                                                    dawn        0 night .. 0.3 first light .. 0.6 sunrise colours .. 1 the sun is up
//   moonAz      where the moon stands, radians round from straight ahead (0: just left of where the sun will rise)
//   bats        flying foxes over the clearing                                far         the party seen from a long way off: a glow behind the trees
//   link        a thread of light from the record straight up
//   rise        1: lights and strobes climb through the section (builds)
//   ride        1: the rig follows the song map's loudness by itself, bar by bar (drops and breakdowns land without an act)
// and the shared ones: flow (how fast the lights move), turb (how restless), pulse (cones, grass, cameras on the kick),
// spark (stars, sparkle), calm (the floor settles), fade (0: lights out), palette (PALETTES in deadbeat-lib.js).
import * as THREE from 'three';
import { C, U, V, Z, NBEAM, NSTACK, PALETTES, lightUniforms, smooth01, clamp01, hash1 } from './deadbeat-lib.js';
import { Bush } from './deadbeat-bush.js';
import { Rig, TABLE } from './deadbeat-rig.js';

const hex = (h) => new THREE.Color(h);
// the sky through the dawn: zenith, horizon under the sun, horizon away from it, cloud, the light it gives
const SKY = {
  zen: ['#010206', '#040817', '#12264f', '#38629f', '#5f97d0'].map(hex),
  horS: ['#030308', '#3c1206', '#c4521c', '#f2933f', '#f7c873'].map(hex),
  horA: ['#020206', '#050818', '#262b56', '#7c6590', '#b79aa8'].map(hex),
  cloud: ['#020203', '#2a100c', '#c9553a', '#ff9c6c', '#ffdcb4'].map(hex),
  amb: ['#010102', '#03050b', '#161b2c', '#4a4a5c', '#8c8684'].map(hex),
};
const key = (arr, d, out) => { const f = clamp01(d) * (arr.length - 1), i = Math.min(arr.length - 2, Math.floor(f)); return out.copy(arr[i]).lerp(arr[i + 1], f - i); };
const PAL_KEYS = ['flash', 'a', 'b', 'strobe', 'laser', 'moon'];
const INK = { flash: '#f06a2a', sodium: '#ffb84a', acid: '#d9f23a', blood: '#ff3b24', uv: '#a98cff', ether: '#5cf2ff', ember: '#e0602a', cold: '#f2d34b', dawn: '#ff7a4a' };
const INK_DAY = ['#1b130f', '#b3360c'];
const hashStr = (str) => { let h = 0x811c9dc5; for (let i = 0; i < str.length; i++) h = Math.imul(h ^ str.charCodeAt(i), 0x01000193) >>> 0; return h / 4294967296; };

// what every section preset starts from, so each one is a whole look and not a patch on the last
const SEC = { strobe: 0, strobeRate: 0, torch: 0.2, smoke: 0.6, beams: 0, beamForm: 0, shutter: 0.4, work: 0.5, festoon: 0.6, crowd: 0.7, laser: 0, rise: 0,
  flow: 0.5, turb: 0.3, pulse: 0.7, calm: 0, fade: 1, camAz: 0, camEl: -0.4, camZoom: -0.3, camRoll: 0, drift: 0.05, bloom: 0.7, split: 0.2, glitch: 0, trail: 0, zoomBlur: 0, words: 'drift' };
const sec = (o) => ({ ...SEC, ...o });

export default class DeadbeatWorld {
  static SECTIONS = {
    // the dark, the smoke and one work-light: close on the deck
    intro: sec({ work: 1, festoon: 0.2, smoke: 0.4, shutter: 0.25, torch: 0.1, crowd: 0.3, flow: 0.3, turb: 0.1, pulse: 0.4, camEl: -0.43, camZoom: -0.36, camAz: 0.25, drift: 0.03, bloom: 0.6 }),
    quiet: sec({ work: 0.75, festoon: 0.7, smoke: 0.55, beams: 0.3, beamForm: 1, strobe: 0.12, shutter: 0.5, torch: 0.25, crowd: 0.65, flow: 0.4, turb: 0.2, camEl: -0.38, camZoom: -0.25, camAz: 0.22, drift: 0.05 }),
    build: sec({ work: 0.4, festoon: 0.85, smoke: 0.8, beams: 0.75, strobe: 0.55, rise: 1, shutter: 0.7, torch: 0.3, crowd: 0.85, flow: 0.7, turb: 0.5, pulse: 0.9, camEl: -0.46, camZoom: -0.36, camAz: -0.2, drift: 0.07, bloom: 0.8 }),
    // everything: stacks pumping, strobes, beams, the floor going off
    full: sec({ work: 0.15, festoon: 1, smoke: 1, beams: 1, strobe: 1, shutter: 1, torch: 0.4, crowd: 1, flow: 1, turb: 0.8, pulse: 1, camEl: -0.5, camZoom: -0.5, drift: 0.085, bloom: 0.95, split: 0.4, words: 'slam' }),
    break: sec({ work: 0.9, festoon: 0.35, smoke: 0.95, beams: 0.18, beamForm: 3, shutter: 0.55, torch: 0.12, crowd: 0.75, calm: 0.6, flow: 0.3, turb: 0.1, pulse: 0.5, camEl: -0.32, camZoom: -0.16, camAz: 0.45, drift: 0.04 }),
    outro: sec({ work: 0.7, festoon: 0.5, smoke: 0.65, beams: 0.1, beamForm: 1, shutter: 0.4, torch: 0.15, crowd: 0.45, calm: 0.4, fade: 0.8, flow: 0.3, turb: 0.15, pulse: 0.4, camEl: -0.47, camZoom: -0.6, camAz: -0.3, drift: 0.04 }),
    loop: sec({ work: 0.1, festoon: 1, smoke: 1, beams: 1, beamForm: 4, strobe: 1.1, strobeRate: 1, shutter: 1.3, torch: 0.5, crowd: 1, flow: 1.2, turb: 1, pulse: 1, camEl: -0.5, camZoom: -0.4, glitch: 0.2, trail: 0.4, split: 0.5 }),
  };
  // each song its own rig and hour: the first record is deep night, the second runs toward first light
  static base(info) {
    const h = hashStr(info.stem || info.title || ''), h2 = hash1(h * 91.7), h3 = hash1(h * 37.3);
    const pals = info.lp2 ? ['cold', 'uv', 'ember', 'acid'] : ['flash', 'sodium', 'acid', 'uv'];
    return { palette: pals[Math.floor(h * pals.length)], stacks: 0.85 + 0.3 * h2, dawn: info.lp2 ? 0.13 + 0.15 * h3 : 0, moon: !info.lp2 && h3 > 0.45 ? 0.85 : 0, bats: info.lp2 ? 0 : 0.4, mblur: 0.8, grain: 0.07, vig: 0.9 };
  }
  static WORDS = { font: '"Archivo Black", "Arial Black", sans-serif', wide: '"Archivo Black", "Arial Black", sans-serif', weight: 400, upper: true, track: 0.25, streak: 1, chroma: false, rise: 0 };

  constructor(r) {
    this.r = r;
    this.scene = new THREE.Scene(); this.root = new THREE.Group(); this.scene.add(this.root);
    const vecs = (n) => ({ value: Array.from({ length: n }, () => new THREE.Vector3()) });
    this.LU = lightUniforms();
    this.beamU = { uBO: vecs(NBEAM), uBD: vecs(NBEAM), uBC: vecs(NBEAM) };
    this.stackU = { uStk: vecs(NSTACK), uStkCol: vecs(NSTACK), uStkN: vecs(NSTACK) };
    this.bush = new Bush(this.root, this.LU, this.beamU, this.stackU, TABLE);
    this.rig = new Rig(this.root, this.LU, this.beamU, this.stackU, this.bush.dancers);
    this.rig.stackG.forEach((G, i) => { this.stackU.uStk.value[i].copy(G).addScaledVector(this.rig.stackN[i], 1.5); for (const j of [0, 1]) this.beamU.uBD.value[i * 2 + j].copy(this.rig.stackN[i]); });
    this.LU.uWorkPos.value.copy(this.rig.workPos); this.LU.uWorkDir.value.copy(this.rig.workDir);
    this.pal = Object.fromEntries(PAL_KEYS.map((k) => [k, PALETTES.flash[k].clone()]));
    this.c1 = new THREE.Color(); this.c2 = new THREE.Color(); this.sv = new THREE.Vector3(); this.tv = new THREE.Vector3(); this.eye = new THREE.Vector3();
    this.sunAz = new THREE.Vector3().copy(V).addScaledVector(U, 0.09).normalize();
    this.bush.skyU.uFarDir.value.copy(V).multiplyScalar(Math.cos(0.2)).addScaledVector(U, Math.sin(0.2));
    this.deaf = 1; this.freeBeat = 0; this.freeT = 9; this.freeN = 0; this.smokeT = 0; this.trDir = 0.4; this.flashOut = 0; this.dawnK = 0; this.dawnS = 0; this.lastT = null; this.lastTitle = ''; this.smokeK = 0; this.inkNight = ['#fff1d2', INK.flash];
  }
  ink(p) { if (this.dawnK > 0.72) return INK_DAY; this.inkNight[1] = INK[p.palette] || INK.flash; return this.inkNight; }

  // dt: real seconds; p: the act's knobs, blended; s: what the music is doing; loopT: the world's clock
  update(dt, p, s, loopT) {
    const LU = this.LU, rig = this.rig, bush = this.bush, pal = this.pal, c1 = this.c1, c2 = this.c2, rate = s.rate ?? 1;
    const target = PALETTES[p.palette] || PALETTES.flash, pk = 1 - Math.exp(-dt * (p.palFast ? 12 : 1.4));
    for (let i = 0; i < PAL_KEYS.length; i++) pal[PAL_KEYS[i]].lerp(target[PAL_KEYS[i]], pk);

    // the beat: the song map's (halved where the map counts double), or free-running off the kicks without one
    const hasMap = s.beatPhase != null, live = hasMap && s.beat >= 0 && s.playing, half = p.half > 0.5;
    let beatF, bLen = s.beatLen || 0.5;
    if (hasMap) beatF = s.beat + s.beatPhase; else { this.freeBeat += dt * rate * 2; beatF = this.freeBeat; }
    if (half) { beatF *= 0.5; bLen *= 2; }
    const since = (beatF - Math.floor(beatF)) * bLen, energy = s.energy || 0;
    // what it hears: the deck's output; where there is none (no sound, film mode), the map stands in
    const deafNow = (s.low || 0) < 0.003 && (s.high || 0) < 0.003 && (s.kick || 0) < 0.003 ? 1 : 0;
    this.deaf += (deafNow - this.deaf) * (1 - Math.exp(-dt * 3));
    const mapKick = live ? Math.exp(-since * 9) * (0.3 + 0.7 * energy) : 0;
    const kick = Math.max(s.kick || 0, mapKick * this.deaf);
    const low = Math.max(s.low || 0, this.deaf * (live ? energy * (0.45 + 0.55 * Math.exp(-since * 5)) : 0));
    const high = Math.max(s.high || 0, this.deaf * Math.min(1, (s.onset || 0) * 1.2));
    const mid = s.mid || 0;

    // the dawn comes on slowly whatever the cue sheet's steps are (a needle drop goes straight there)
    if (this.lastT == null || Math.abs(s.songT - this.lastT) > 1.5 || s.title !== this.lastTitle || Math.abs(p.dawn - this.dawnS) > 0.4) this.dawnS = p.dawn;
    else this.dawnS += (p.dawn - this.dawnS) * (1 - Math.exp(-dt * rate * 0.14));
    this.lastT = s.songT; this.lastTitle = s.title;
    const fade = p.fade, smoke = p.smoke * (0.85 + 0.3 * (s.progress || 0)), dawn = clamp01(this.dawnS), stacks = p.stacks;
    const rideK = 1 - (p.ride || 0) * (1 - smooth01((energy - 0.38) / 0.4));
    const riseK = (1 - (p.rise || 0) * 0.75 * (1 - (s.secPhase || 0))) * rideK, dim = s.reduce ? 0.25 : 1;
    this.dawnK = dawn; this.smokeK = smoke;

    // flashes: the camera's on one beat, the rig's strobe on the beat between; never closer together than 0.36 s
    let bpf = p.strobeRate > 0 ? 1 / p.strobeRate : 2; bpf = bpf <= 1.5 ? 1 : bpf <= 3 ? 2 : bpf <= 6 ? 4 : 8;
    while (bLen * bpf < 0.36) bpf *= 2;
    const off = bpf >= 2 && bLen * bpf * 0.5 >= 0.36 ? 0.5 : 0, fb = beatF / bpf, sb = fb + off;
    let fEnv = 0, sEnv = 0, sN = Math.floor(sb);
    if (live) { fEnv = Math.exp(-(fb - Math.floor(fb)) * bpf * bLen / 0.085); sEnv = Math.exp(-(sb - Math.floor(sb)) * bpf * bLen / 0.07); }
    else if (!hasMap && s.playing) { this.freeT += dt; if (kick > 0.85 && this.freeT > 0.42) { this.freeT = 0; this.freeN++; } fEnv = sEnv = Math.exp(-this.freeT / 0.085); sN = this.freeN; }
    const sAmt = p.strobe * riseK * (0.4 + 0.6 * energy) * dim * fade;
    this.flashOut = fEnv * sAmt;
    const sIdx = Math.floor(hash1(sN * 1.37 + 5) * NSTACK) % NSTACK;

    // lights
    LU.uTime.value = loopT;
    LU.uFlashCol.value.copy(pal.flash).multiplyScalar((p.torch * 0.5 * (0.3 + 0.7 * rideK) + fEnv * sAmt * 3) * fade);
    LU.uStrobeCol.value.copy(pal.strobe).multiplyScalar(sEnv * sAmt * (off ? 2.4 : 1.3));
    rig.onStack(rig.strobeLocal[sIdx], sIdx, stacks, LU.uStrobePos.value);
    LU.uWorkCol.value.setRGB(1, 0.7, 0.4).multiplyScalar(p.work * 2.6 * fade);
    const wash = fade * clamp01(stacks * 2) * (0.1 + 0.45 * clamp01(p.beams * riseK)) * (0.7 + 0.5 * low * p.pulse);
    for (let i = 0; i < NSTACK; i++) { const c = i % 2 ? pal.b : pal.a; this.stackU.uStkCol.value[i].set(c.r, c.g, c.b).multiplyScalar(wash); }
    c1.copy(pal.a).lerp(pal.b, 0.5);
    LU.uWashCol.value.copy(c1).multiplyScalar(wash * 0.5);
    // the sky, and the light it gives
    const sk = bush.skyU, moon = clamp01(p.moon);
    key(SKY.zen, dawn, sk.uZen.value); key(SKY.horS, dawn, sk.uHorS.value); key(SKY.horA, dawn, sk.uHorA.value); key(SKY.cloud, dawn, sk.uCloudCol.value);
    key(SKY.amb, dawn, LU.uAmb.value).multiplyScalar(0.55).add(c2.copy(pal.moon).multiplyScalar(0.007 * moon * (1 - dawn))).add(c2.setRGB(1, 0.55, 0.25).multiplyScalar(0.01 * p.festoon * fade));
    const sunUp = smooth01((dawn - 0.62) / 0.36), sunEl = -0.16 + 0.24 * dawn;
    LU.uSunDir.value.copy(this.sunAz).multiplyScalar(Math.cos(sunEl)).setZ(Math.max(0.03, Math.sin(sunEl)) ).normalize();
    LU.uSunCol.value.setRGB(1, 0.62, 0.36).multiplyScalar(sunUp * 1.5);
    sk.uSunCol.value.setRGB(1, 0.72, 0.4).multiplyScalar(sunUp * 1.3 * smooth01((sunEl + 0.03) / 0.06));
    sk.uT.value = loopT; sk.uStars.value = (1 - smooth01(dawn / 0.5)) * (0.55 + 0.45 * p.spark);
    const moonEl = 0.1 - (1 - moon) * 0.1;
    const mAz = -0.15 + (p.moonAz || 0);
    sk.uMoonDir.value.set(0, 0, 0).addScaledVector(V, Math.cos(mAz) * Math.cos(moonEl)).addScaledVector(U, Math.sin(mAz) * Math.cos(moonEl)).setZ(Math.sin(moonEl)).normalize();
    sk.uMoon.value = 0.042 * smooth01(moon * 1.5); sk.uMoonCol.value.copy(pal.moon).multiplyScalar(0.6 * (1 - 0.7 * dawn));
    sk.uGlow.value = 0.35 * Math.min(1.5, smoke); sk.uCloud.value = 0.2 + 0.8 * smooth01(dawn * 1.6);
    sk.uFar.value = p.far * (1 - 0.6 * dawn); sk.uFarPulse.value = kick; sk.uFarCol.value.copy(c1).multiplyScalar(0.5);
    // haze: dark at night, tinted by whatever is on; a mist at dawn
    const hz = LU.uHaze.value.setRGB(0.0025, 0.0025, 0.004).multiplyScalar(1 + 2 * moon);
    hz.add(c2.copy(c1).multiplyScalar(wash * (0.006 + 0.012 * low))).add(c2.copy(pal.strobe).multiplyScalar(sEnv * sAmt * 0.03)).add(c2.copy(pal.flash).multiplyScalar(fEnv * sAmt * 0.012));
    hz.add(c2.copy(sk.uHorA.value).lerp(sk.uHorS.value, 0.45).multiplyScalar(0.14 * smooth01(dawn * 1.2)));
    LU.uFogK.value = 0.004 + 0.013 * Math.min(1.6, smoke);

    // the bush
    bush.grassU.uWind.value = 0.22 + 0.5 * p.turb; bush.grassU.uThump.value = kick * p.pulse * 0.22;
    const dance = (0.2 + 0.8 * energy) * (1 - 0.6 * p.calm) * (s.playing ? 1 : 0.15), crowd = p.crowd * (0.75 + 0.25 * smooth01((s.progress || 0) * 4));
    bush.crowdU.uBeat.value = beatF; bush.crowdU.uDance.value = dance; bush.crowdU.uCrowd.value = crowd; bush.crowd.visible = crowd > 0.01;
    this.smokeT += dt * rate * (0.5 + p.flow) * 1.5;
    bush.smokeU.uSmokeT.value = this.smokeT; bush.smokeU.uSmoke.value = smoke * (0.8 + 0.5 * low); bush.smokeU.uLow.value = low * p.pulse; bush.smoke.visible = smoke > 0.02;

    bush.bats.geometry.instanceCount = Math.round(clamp01(p.bats) * bush.batN); bush.bats.visible = p.bats > 0.02;

    // the rig
    rig.boxU.uStack.value = stacks; rig.boxU.uStrobeIdx.value = sIdx; rig.boxes.visible = rig.cones.visible = stacks > 0.03;
    rig.coneU.uPumpLow.value = clamp01(kick * 1.05 + low * 0.12) * p.pulse; rig.coneU.uPumpMid.value = clamp01(mid * 0.5 + high * 0.5) * p.pulse * (0.5 + 0.5 * Math.sin(loopT * 38));
    rig.propU.uVU.value.set(clamp01(low * 0.8 + kick * 0.3), clamp01(mid * 0.7 + high * 0.4), kick); rig.propU.uWorkOn.value = p.work * fade;
    const bar = Math.floor((s.bar || 0) * (half ? 0.5 : 1)), form = p.beamForm > 0.5 ? Math.round(p.beamForm) - 1 : Math.floor(hash1(Math.floor(bar / 4) + s.seed * 97) * 4) % 4;
    const beamK = p.beams * riseK * fade * clamp01(stacks * 2) * (0.6 + 0.4 * Math.exp(-since * 4)) * (1 - 0.8 * smooth01(dawn * 1.2));
    this.aim(dt, p, loopT, beatF, form, stacks);
    for (let i = 0; i < NBEAM; i++) {
      const c = (i + (bar >> 1)) % 2 ? pal.b : pal.a, gate = form === 3 ? ((i + Math.floor(beatF)) % 3 === 0 ? 1.3 : 0.12) : 1;
      this.beamU.uBC.value[i].set(c.r, c.g, c.b).multiplyScalar(beamK * gate);
    }
    rig.beams.visible = beamK > 0.01; rig.beamMatU.uSmoke.value = clamp01(smoke);
    const laser = p.laser * fade * clamp01(stacks * 2) * rideK;
    rig.lasers.visible = laser > 0.01;
    if (laser > 0.01) {
      const lu = rig.laserU, ph = loopT * (0.12 + 0.2 * p.flow);
      for (let e = 0; e < 2; e++) rig.onStack(rig.strobeLocal[rig.laserStacks[e]], rig.laserStacks[e], stacks, lu.uLO.value[e]);
      lu.uLA.value.set(Math.sin(ph) * 0.7 + 0.35 * Math.sin(bar * 1.9), 0.22 + 0.5 * (0.5 + 0.5 * Math.sin(ph * 1.7 + 1)), 0.04 + 0.07 * Math.sin(ph * 0.8), 0);
      lu.uLaserCol.value.copy(pal.laser).multiplyScalar(laser * 1.1); lu.uSmoke.value = clamp01(smoke);
      lu.uGate.value = s.reduce || p.turb < 0.55 || !live ? -1 : Math.floor(beatF * 2);
    }
    rig.link.visible = p.link > 0.01;
    rig.linkU.uLinkCol.value.copy(pal.laser).multiplyScalar(p.link * (0.7 + 0.5 * kick) * (1 + 0.6 * (1 - rideK)) * fade); rig.linkU.uLinkPulse.value = clamp01(0.3 + low);
    const lt = rig.lightU, kb = lt.uKB.value;
    lt.uColA.value.copy(pal.a); lt.uColB.value.copy(pal.b); lt.uStrobeTint.value.copy(pal.strobe).multiplyScalar(sEnv * sAmt * 2);
    lt.uBeat.value = beatF; lt.uDance.value = dance; lt.uCrowd.value = crowd;
    kb[0] = p.festoon * fade * (0.75 + 0.5 * p.spark); kb[1] = fade * (0.45 + 0.55 * energy) * (0.6 + 0.6 * p.spark) * (crowd > 0.01 ? 1 : 0); kb[2] = p.work * fade * 0.8; kb[3] = 1.3; kb[4] = 1; kb[5] = p.work * fade * 2.2;
    lt.uHalo.value = (0.3 + 0.9 * Math.min(1.5, smoke)) * (1 - 0.7 * dawn);
    // streaks: longer with the treble, a new direction every bar
    let want = hash1(bar * 3.1 + s.seed * 11) * 6.283, dd = want - this.trDir; dd -= Math.round(dd / 6.283) * 6.283;
    this.trDir += dd * (1 - Math.exp(-dt * 4));
    lt.uTr.value.set(p.shutter * (0.07 + 0.1 * high + 0.05 * kick) * (s.playing ? 1 : 0.4), 0.22 + 0.5 * p.turb, this.trDir, lt.uTr.value.w);
    lt.uTrPh.value.set(loopT * 2.3, loopT * 3.7, loopT * 1.6, 0);
    rig.trails.visible = p.shutter > 0.01;
  }
  // where the moving heads point
  aim(dt, p, loopT, beatF, form, stacks) {
    const rig = this.rig, k = 1 - Math.exp(-dt * 5), ph = loopT * (0.25 + 0.5 * p.flow), sv = this.sv, T = this.tv;
    for (let i = 0; i < NBEAM; i++) {
      const si = i >> 1, side = i & 1 ? 1 : -1, n = rig.stackN[si], o = this.beamU.uBO.value[i], d = this.beamU.uBD.value[i];
      rig.onStack(rig.moverLocal[i], si, stacks, o);
      if (form === 2) sv.set(C.x + 0.9 * Math.cos(ph * 0.9 + i), C.y + 0.9 * Math.sin(ph * 0.9 + i), 2.2 + 1.2 * Math.sin(ph * 0.6)).sub(o).normalize();     // a tent over the deck
      else {
        let pan, tilt;
        if (form === 0) { tilt = 0.5 + 0.28 * Math.sin(ph * 0.7 + i * 1.1); pan = side * 0.3 + 0.55 * Math.sin(ph + si * 1.3); }                          // fanned at the sky
        else if (form === 1) { tilt = -0.36 + 0.14 * Math.sin(ph * 1.3 + i * 2.1); pan = 0.85 * Math.sin(ph * 0.9 + i * 0.8); }                          // sweeping the floor
        else { tilt = (Math.floor(beatF) + i) % 2 === 0 ? 0.8 : -0.22; pan = side * 0.55; }                                                             // chase: up, down, on the beat
        tilt += p.turb * 0.07 * Math.sin(loopT * 7 + i * 3);
        const ct = Math.cos(tilt); T.crossVectors(Z, n);
        sv.set(0, 0, Math.sin(tilt)).addScaledVector(n, Math.cos(pan) * ct).addScaledVector(T, Math.sin(pan) * ct);
      }
      d.lerp(sv, k).normalize();
    }
  }
  // the photograph: the flash lifts the whole frame warm for an instant and smears it outward a little
  post(post, p, s) {
    const f = this.flashOut, fc = this.pal.flash, d = this.dawnK;
    post.tint[0] = (0.94 + 0.06 * d) * (1 + f * 0.45 * Math.sqrt(fc.r)); post.tint[1] = (0.93 + 0.07 * d) * (1 + f * 0.45 * Math.sqrt(fc.g)); post.tint[2] = (0.96 + 0.04 * d) * (1 + f * 0.45 * Math.sqrt(fc.b));
    post.uZoom += f * 0.05;
    post.uBloom *= (1 + 0.35 * Math.min(1.5, this.smokeK)) * (1 - 0.7 * d);
    post.uThresh = 0.7 + 0.2 * d;
    post.uGrain += 0.02 + 0.03 * f;
    post.uVig *= 1 - 0.35 * d;
  }
  render(r, cam) {
    this.eye.setFromMatrixPosition(cam.matrixWorld); this.LU.uEye.value.copy(this.eye);
    const pe = cam.projectionMatrix.elements, lt = this.rig.lightU;
    lt.uTr.value.w = pe[5] / pe[0]; lt.uRes.value.set(r.domElement.width, r.domElement.height);
    r.render(this.scene, cam);
  }
}
