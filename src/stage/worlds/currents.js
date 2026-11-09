// Currents: the turntable floats above a river of ribbons, and is the obstacle in it. Seen from above, the
// ribbons follow the streamlines of potential flow round a cylinder the size of the deck: they part round its
// footprint and close up behind it, where the wake turns turbulent and rainbow-coloured. A chrome orb hangs in
// the violet sky and reflects all of it.
//
// Everything that moves is a uniform, so a cue sheet (src/stage/cues/) can bend the whole field at no cost:
//   flow     how fast the current runs (the dashes travel along the lines)
//   turb     turbulence in the wake          vortex  the field wound up into a whirlwind round the deck
//   calm     streamlines relaxed into straight strata      lift  the world dropping away (the deck "takes off")
//   spark    how bright the travelling dashes are          width ribbon width      rainbow  colour in the wake
//   orb      size of the chrome orb          sun   a low sun behind it (the dawn)
//   and the journey off the ground (worlds/space.js): alt, planet, ring, warp, nebula, galaxy, into
import * as THREE from 'three';
import { Space } from './space.js';
import { Groove } from './groove.js';

export const C = new THREE.Vector3(0.042, 0, -0.03);             // the middle of the deck, world space (z up, metres)
const U = new THREE.Vector3(0.878, -0.479, 0).normalize();        // flow direction: left to right from the default camera
const V = new THREE.Vector3(0, 0, 1).cross(U);                    // across the flow, away from the viewer (ahead)
const Z = new THREE.Vector3(0, 0, 1);
const SUN = V.clone().addScaledVector(U, 0.22).addScaledVector(Z, 0.03).normalize();   // where the sun rises
const A = 0.36, L = 3.4;                                          // the obstacle's radius (the deck's footprint), half the field's length

const smooth01 = (x) => { x = Math.max(0, Math.min(1, x)); return x * x * (3 - 2 * x); };
// palettes: sky top / horizon / bottom, line colour, accent (the red line), sun
const hex = (h) => new THREE.Color(h);
export const PALETTES = {
  violet: { top: hex('#120a24'), mid: hex('#4a2f78'), bot: hex('#07040e'), line: hex('#efe6f7'), acc: hex('#e0322b'), sun: hex('#000000') },
  night: { top: hex('#040208'), mid: hex('#160d26'), bot: hex('#020104'), line: hex('#9d86c4'), acc: hex('#e0322b'), sun: hex('#000000') },
  mustard: { top: hex('#2a1a05'), mid: hex('#b9862a'), bot: hex('#120a02'), line: hex('#fff4dc'), acc: hex('#e0322b'), sun: hex('#000000') },
  dawn: { top: hex('#1b1035'), mid: hex('#d9725e'), bot: hex('#0c0716'), line: hex('#ffe6ee'), acc: hex('#ff5a3a'), sun: hex('#ffcf8a') },
  white: { top: hex('#cfc6dc'), mid: hex('#f4eef7'), bot: hex('#9b8fb0'), line: hex('#4a2f78'), acc: hex('#e0322b'), sun: hex('#ffffff') },
};

// potential flow past a cylinder of radius A at the origin (in plan: u along the stream, v across it)
function vel(p, out) {
  const r2 = p.x * p.x + p.y * p.y, r4 = r2 * r2 || 1, a2 = A * A;
  return out.set(1 - a2 * (p.x * p.x - p.y * p.y) / r4, -2 * a2 * p.x * p.y / r4, 0);
}

const LINE_VS = `
uniform float uT, uFlowT, uTurb, uVortex, uCalm, uLift, uWidth, uPulse, uLoopT;
uniform vec3 uC, uU, uV;
attribute float aSide, aS, aId;
attribute vec3 aN;
attribute vec2 aSeed;
varying float vS, vId, vWake, vU, vFog;
varying vec3 vP;
void main() {
  vec3 p = position;
  vec3 d = p - uC; float u = dot(d, uU);
  // the wake: behind the obstacle, near the middle, the lines start to wander
  float lat = abs(dot(d, uV));
  float wake = smoothstep(0.1, 1.2, u) * exp(-pow(lat / 0.9, 2.0));
  float tt = uLoopT;
  vec3 tw = vec3(sin(u * 7.0 - tt * 1.7 + aId * 6.0) + 0.5 * sin(u * 17.0 + tt * 2.3), 0.0, cos(u * 5.0 - tt * 1.3 + aId * 4.0));
  p += (uU * tw.z * 0.4 + uV * tw.x) * wake * uTurb * 0.2;
  // calm: relaxed back toward the straight line the streamline started on
  vec3 straight = uC + uU * u + uV * aSeed.x + vec3(0.0, 0.0, aSeed.y);
  p = mix(p, straight, uCalm);
  // the whirlwind: wound round the deck's axis, tighter near it
  vec2 q = p.xy - uC.xy; float rq = length(q);
  float ang = uVortex * (tt * 0.9 + 1.4 / (rq + 0.3));
  float ca = cos(ang), sa = sin(ang);
  q = vec2(q.x * ca - q.y * sa, q.x * sa + q.y * ca) * mix(1.0, 0.55 + 0.25 * rq, uVortex * 0.6);
  p.xy = uC.xy + q; p.z += uVortex * 0.06 * sin(rq * 3.0 - tt * 1.2 + aId * 3.0);
  p.z -= uLift;
  vec3 n = aN; n.xy = vec2(n.x * ca - n.y * sa, n.x * sa + n.y * ca);
  p += n * aSide * uWidth * (1.0 + uPulse * 0.8) * (aId > 0.995 ? 1.7 : 1.0);
  vS = aS; vId = aId; vWake = wake; vU = u; vP = p;
  vec4 mv = modelViewMatrix * vec4(p, 1.0);
  vFog = -mv.z;
  gl_Position = projectionMatrix * mv;
}`;
const LINE_FS = `
uniform float uFlowT, uSpark, uRainbow, uFade, uT;
uniform vec3 uLine, uAcc, uSky;
varying float vS, vId, vWake, vU, vFog;
varying vec3 vP;
vec3 hue(float h) { return clamp(abs(mod(h * 6.0 + vec3(0.0, 4.0, 2.0), 6.0) - 3.0) - 1.0, 0.0, 1.0); }
void main() {
  float ends = smoothstep(${L.toFixed(1)}, ${(L - 0.9).toFixed(1)}, abs(vU));
  float dash = pow(fract(vS * 1.1 - uFlowT * (0.55 + 0.6 * fract(vId * 13.7)) + vId * 7.0), 7.0);
  vec3 c = uLine * (0.22 + 0.4 * fract(vId * 3.1 + 0.3));
  c = mix(c, hue(vU * 0.35 + uT * 0.05 + vId) * 1.3, vWake * uRainbow);
  if (vId > 0.995) c = uAcc * 1.4;
  c += uLine * dash * uSpark * 0.9;
  float fog = exp(-max(0.0, vFog - 1.2) * 0.22);
  vec3 col = mix(uSky, c, fog);
  gl_FragColor = vec4(col, ends * uFade * (0.55 + 0.45 * fog));
}`;
const SKY_VS = `varying vec3 vD; void main() { vD = normalize(position); gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); gl_Position.z = gl_Position.w * 0.99999; }`;
const SKY_FS = `
uniform vec3 uTop, uMid, uBot, uSun, uSunDir, uNebA, uNebB; uniform float uT, uStripes, uSunK, uFlash, uSpace, uNebula, uWarp;
varying vec3 vD;
float h21(vec2 p) { p = fract(p * vec2(123.34, 456.21)); p += dot(p, p + 45.32); return fract(p.x * p.y); }
float vn(vec2 p) { vec2 i = floor(p), f = fract(p); f = f * f * (3.0 - 2.0 * f); return mix(mix(h21(i), h21(i + vec2(1, 0)), f.x), mix(h21(i + vec2(0, 1)), h21(i + vec2(1, 1)), f.x), f.y); }
float fbm(vec2 p) { float s = 0.0, a = 0.5; for (int i = 0; i < 5; i++) { s += a * vn(p); p = p * 2.07 + 11.3; a *= 0.5; } return s; }
// stars: one candidate per cell of a lat/long grid, most cells empty; dashes, like the flow, when warping
float stars(vec3 d, float scale) {
  float az = atan(d.y, d.x), el = asin(clamp(d.z, -1.0, 1.0));
  vec2 g = vec2(az * scale / 6.2832 * cos(el) * 2.0, el * scale / 3.1416);
  vec2 c = floor(g), f = fract(g); float h = h21(c);
  if (h < 0.93) return 0.0;
  vec2 q = vec2(h21(c + 3.1), h21(c + 7.7)) * 0.7 + 0.15;
  vec2 dd = (f - q) * vec2(1.0, 1.0 + uWarp * 6.0);
  float tw = 0.65 + 0.35 * sin(uT * (1.0 + h * 3.0) + h * 40.0);
  return smoothstep(0.09, 0.0, length(dd)) * (h - 0.93) / 0.07 * tw;
}
void main() {
  float z = vD.z;
  vec3 c = z > 0.0 ? mix(uMid, uTop, pow(z, 0.6)) : mix(uMid, uBot, pow(-z, 0.5));
  float az = atan(vD.y, vD.x);
  float st = sin((z * 26.0 + 0.5 * sin(az * 2.0 + uT * 0.07)) * 3.14159);
  c *= 1.0 + uStripes * 0.12 * smoothstep(0.6, 1.0, st) * (1.0 - uSpace);
  // leaving the atmosphere: the sky goes black, stars come out, and the nebula is the palette's colour in the dark
  c = mix(c, vec3(0.006, 0.004, 0.012), uSpace);
  float n = fbm(vec2(az * 2.0, z * 3.0) + uT * 0.004), n2 = fbm(vec2(az * 5.0 + 4.0, z * 7.0) - uT * 0.006);
  c += (uNebA * smoothstep(0.45, 0.85, n) * 0.9 + uNebB * smoothstep(0.55, 0.9, n2) * 0.6) * uNebula * uSpace;
  c += vec3(0.95, 0.92, 1.0) * (stars(vD, 260.0) + 0.6 * stars(vD.yzx, 520.0)) * uSpace;
  float s = max(0.0, dot(vD, uSunDir));
  c += uSun * uSunK * (pow(s, 40.0) * 2.5 + pow(s, 6.0) * 0.35);
  c = mix(c, vec3(1.0), uFlash);
  gl_FragColor = vec4(c, 1.0);
}`;

export class CurrentsWorld {
  constructor(r) {
    this.r = r;
    this.scene = new THREE.Scene();
    this.root = new THREE.Group(); this.scene.add(this.root);
    this.pal = Object.fromEntries(Object.entries(PALETTES.violet).map(([k, c]) => [k, c.clone()]));
    this.flowT = 0;
    this.buildSky(); this.buildLines(); this.buildOrb();
    this.space = new Space(this.root, C, U, V);
    this.groove = null;                                              // made the first time a cue dives into the cut
  }
  buildSky() {
    this.skyU = {
      uTop: { value: this.pal.top }, uMid: { value: this.pal.mid }, uBot: { value: this.pal.bot }, uSun: { value: this.pal.sun },
      uSunDir: { value: SUN.clone() }, uT: { value: 0 }, uStripes: { value: 1 }, uSunK: { value: 0 }, uFlash: { value: 0 },
      uSpace: { value: 0 }, uNebula: { value: 0 }, uWarp: { value: 0 }, uNebA: { value: new THREE.Color() }, uNebB: { value: new THREE.Color() },
    };
    const sky = new THREE.Mesh(new THREE.SphereGeometry(60, 48, 24), new THREE.ShaderMaterial({ vertexShader: SKY_VS, fragmentShader: SKY_FS, uniforms: this.skyU, side: THREE.BackSide, depthWrite: false }));
    sky.position.copy(C); sky.frustumCulled = false; sky.renderOrder = -1;
    this.sky = sky; this.root.add(sky);
  }
  buildLines() {
    const pos = [], nrm = [], side = [], arc = [], ids = [], seeds = [], idx = [];
    const p = new THREE.Vector3(), v1 = new THREE.Vector3(), v2 = new THREE.Vector3(), q = new THREE.Vector3(), t = new THREE.Vector3(), n = new THREE.Vector3();
    // sheets of ribbons below the deck (its feet are at z = -0.08), the deeper ones dimmer through the fog
    const layers = [-0.10, -0.17, -0.26, -0.38, -0.55].map((z) => z - C.z), H = 0.03;
    let line = 0, vert = 0;
    const red = { v: 0.62, w: layers[0] };
    for (const w0 of layers) {
      for (let v0 = -3.0; v0 <= 3.0 + 1e-9; v0 += 0.048) {
        const vv = v0 + (Math.abs(w0) * 0.37 % 0.024);        // stagger the sheets so their lines don't stack exactly
        if (Math.abs(vv) < 0.012) continue;                   // the line straight into the stagnation point
        const id = Math.abs(vv - red.v) < 0.024 && w0 === red.w ? 0.999 : (Math.sin(line * 12.9898) * 43758.5453) % 1 * 0.5 + 0.5 - 0.006;
        p.set(-L, vv, w0); let s = 0, n0 = vert;
        for (let k = 0; k < 260 && p.x < L; k++) {
          vel(p, v1); q.copy(p).addScaledVector(v1.normalize(), H * 0.5); vel(q, v2); t.copy(v2).normalize();
          const wp = C.clone().addScaledVector(U, p.x).addScaledVector(V, p.y).addScaledVector(Z, p.z);
          const wt = U.clone().multiplyScalar(t.x).addScaledVector(V, t.y);
          n.set(-wt.y, wt.x, 0).normalize();
          for (const sd of [-1, 1]) { pos.push(wp.x, wp.y, wp.z); nrm.push(n.x, n.y, n.z); side.push(sd); arc.push(s); ids.push(id); seeds.push(vv, w0); }
          if (vert > n0) { const a = vert - 2; idx.push(a, a + 1, vert, a + 1, vert + 1, vert); }
          vert += 2; p.addScaledVector(t, H); s += H;
        }
        line++;
      }
    }
    const g = new THREE.BufferGeometry();
    g.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3)); g.setAttribute('aN', new THREE.Float32BufferAttribute(nrm, 3));
    g.setAttribute('aSide', new THREE.Float32BufferAttribute(side, 1)); g.setAttribute('aS', new THREE.Float32BufferAttribute(arc, 1));
    g.setAttribute('aId', new THREE.Float32BufferAttribute(ids, 1)); g.setAttribute('aSeed', new THREE.Float32BufferAttribute(seeds, 2));
    g.setIndex(idx);
    this.lineU = {
      uT: { value: 0 }, uFlowT: { value: 0 }, uLoopT: { value: 0 }, uTurb: { value: 0.3 }, uVortex: { value: 0 }, uCalm: { value: 0 }, uLift: { value: 0 }, uWidth: { value: 0.006 }, uPulse: { value: 0 },
      uSpark: { value: 0.6 }, uRainbow: { value: 0.6 }, uFade: { value: 1 }, uC: { value: C }, uU: { value: U }, uV: { value: V },
      uLine: { value: this.pal.line }, uAcc: { value: this.pal.acc }, uSky: { value: this.pal.mid },
    };
    const mat = new THREE.ShaderMaterial({ vertexShader: LINE_VS, fragmentShader: LINE_FS, uniforms: this.lineU, transparent: true, depthWrite: false, side: THREE.DoubleSide, blending: THREE.NormalBlending });
    this.lines = new THREE.Mesh(g, mat); this.lines.frustumCulled = false;
    this.root.add(this.lines);
    this.lineCount = line;
  }
  buildOrb() {
    this.cube = new THREE.WebGLCubeRenderTarget(128, { type: THREE.HalfFloatType, generateMipmaps: true, minFilter: THREE.LinearMipmapLinearFilter });
    this.cubeCam = new THREE.CubeCamera(0.05, 100, this.cube);
    this.orbHome = C.clone().addScaledVector(V, 3.2).addScaledVector(U, 0.9).addScaledVector(Z, 0.9);
    this.orb = new THREE.Mesh(new THREE.SphereGeometry(1, 96, 48), new THREE.MeshStandardMaterial({ color: 0xffffff, metalness: 1, roughness: 0.04, envMap: this.cube.texture, envMapIntensity: 1.25 }));
    this.orb.position.copy(this.orbHome); this.orb.scale.setScalar(0.001);
    this.root.add(this.orb); this.root.add(this.cubeCam);
    this.frame = 0;
  }

  // p: the act's parameters (already blended), s: what the music is doing, dt: seconds of real time, loopT: the world's clock
  update(dt, p, s, loopT) {
    const u = this.lineU, kick = s.kick || 0;
    // colours ease toward the act's palette
    const target = PALETTES[p.palette] || PALETTES.violet, k = 1 - Math.exp(-dt * (p.palFast ? 12 : 1.4));
    for (const key of Object.keys(this.pal)) this.pal[key].lerp(target[key], k);
    this.flowT += dt * p.flow * (1 + 0.6 * (s.energy || 0)) * (s.rate ?? 1);
    this.diving = p.dive > 0.5 && !!s.tap;
    if (this.diving) (this.groove ||= new Groove()).update(dt, p, s, s.tap, s.th, this.pal, s.songT ?? loopT);
    const sp = this.space.update(dt, p, s, loopT, this.pal, SUN);
    const alt = p.alt || 0, gone = 1 - smooth01((alt - 0.18) / 0.3);          // the river falls away as the deck climbs
    u.uT.value = loopT; u.uLoopT.value = loopT; u.uFlowT.value = p.loopFlow != null ? p.loopFlow : this.flowT;
    u.uTurb.value = p.turb * (0.6 + 0.8 * (s.high || 0)); u.uVortex.value = p.vortex; u.uCalm.value = p.calm; u.uLift.value = p.lift + alt * 6;
    u.uWidth.value = 0.006 * p.width; u.uPulse.value = kick * p.pulse; u.uSpark.value = p.spark * (0.5 + (s.onset || 0)); u.uRainbow.value = p.rainbow; u.uFade.value = p.fade * gone;
    u.uSky.value = this.pal.mid;
    const su = this.skyU; su.uT.value = loopT; su.uSunK.value = p.sun * (1 - sp.space * 0.25); su.uStripes.value = p.stripes ?? 1; su.uFlash.value = 0;
    su.uSpace.value = sp.space; su.uNebula.value = p.nebula || 0; su.uWarp.value = p.warp || 0;
    su.uNebA.value.copy(this.pal.mid).multiplyScalar(1.3); su.uNebB.value.copy(this.pal.acc).lerp(this.pal.line, 0.4);
    const orbR = Math.max(0.001, p.orb * (1 + 0.06 * (s.low || 0) + 0.05 * kick));
    this.orb.scale.setScalar(orbR);
    this.orb.position.copy(this.orbHome).addScaledVector(Z, Math.sin(loopT * 0.21) * 0.06 - p.lift * 0.35);
    // in space the orb is the sun, far off where it rises; `into` flies the deck right up to it
    const into = p.into || 0;
    if (sp.space > 0 || into > 0) {
      // flying into it: it comes to meet the camera head on, just beyond the deck
      const fwd = this.eye ? C.clone().sub(this.eye).setZ(0).normalize() : SUN;
      const far = C.clone().addScaledVector(SUN, 14), near = C.clone().addScaledVector(fwd, 1.3).addScaledVector(Z, 0.12);
      this.orb.position.lerp(far, sp.space).lerp(near, smooth01(into));
      this.orb.scale.setScalar(orbR * (1 + sp.space * 0.15) * (1 - 0.5 * smooth01(into)));
    }
    // chrome reflects nothing in the dark, so out there the orb burns
    this.orb.material.emissive.copy(this.pal.sun.r + this.pal.sun.g + this.pal.sun.b > 0.3 ? this.pal.sun : this.pal.line).multiplyScalar(sp.space * 0.3 * p.sun + into * 0.45);
    this.orb.visible = orbR > 0.01;
    this.lines.visible = p.fade * gone > 0.003;
  }
  render(r, cam) {
    if (this.diving && this.groove?.on) return this.groove.render(r, r.domElement.width, r.domElement.height);
    this.eye = new THREE.Vector3().setFromMatrixPosition(cam.matrixWorld);
    this.space.aim(this.eye, C);
    if (this.orb.visible && this.frame++ % 3 === 0) {               // what the chrome sees, refreshed every third frame
      this.orb.visible = false; this.cubeCam.position.copy(this.orb.position);
      const ac = r.autoClear; r.autoClear = true;                  // each face starts clean
      this.cubeCam.update(r, this.scene); this.orb.visible = true; r.autoClear = ac;
    }
    r.render(this.scene, cam);
  }
}
