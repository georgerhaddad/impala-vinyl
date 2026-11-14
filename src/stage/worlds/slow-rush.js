// The Slow Rush: an abandoned room that the desert is taking back. The deck sits on the sand in the middle of it;
// hard sunlight comes through the windows, the doorways and the holes in the roof and lies on the sand in patches,
// and stands in the dusty air in shafts; sand falls from the ceiling in streams and slides in through every opening
// the dunes outside have reached. The room does not fill up, it sinks: the deck rides the surface, so over a song the
// windows come down to the sand, and in the end the walls go under and there are only dunes.
//
// Time is what the cue sheets play with (the era's own knobs, in DEFAULTS, ../index.js):
//   sand      how far the room has sunk (it also creeps up by itself as the song goes by)
//   pour      the streams from the ceiling and the sand sliding in through the openings
//   haze      dust in the air: the light shafts          storm   a sandstorm: the sky and the distance go
//   hour      the sun's place, in hours from where the song has carried it (the sun crosses the sky once per song)
//   sunHold   1 stops that crossing: the sun stands still (then `hour` counts from noon)
//   rush      time-lapse: days going by (the sun wheels over, night falls and lifts); negative runs it backwards,
//             and the streams fall upwards
//   open      the roof goes, then the walls drop one by one: open dunes
//   glass     an hourglass standing in the sand (its size); glassTurn turns it over (in half turns)
//   drain     the floor gives way like the neck of an hourglass: a funnel the sand runs into
//   paint     0 the red room, 1 the blue room (LP2)
// and the shared ones: flow (how fast it all runs), turb (wind over the sand, dust swirling), pulse (the sand jumping
// on the kick), spark (glitter in the sand, motes in the light), calm, fade, palette.
import * as THREE from 'three';
import { X0, Y0, Y1, HH, TT, ZB, FLOOR, AZ, NF, FANS, CONES, DRAIN, COMMON } from './slow-rush-room.js';
import { Hourglass } from './slow-rush-glass.js';

const C = new THREE.Vector3(0.042, 0, -0.03);
const U = new THREE.Vector3(Math.cos(AZ), Math.sin(AZ), 0), V = new THREE.Vector3(-Math.sin(AZ), Math.cos(AZ), 0);
const smooth01 = (x) => { x = Math.max(0, Math.min(1, x)); return x * x * (3 - 2 * x); };
const hex = (h) => new THREE.Color(h);
// palettes: sky top and horizon, the light, the light when it is low, the shade, sand, the two paints (wall and
// dado, red room and blue room), and numbers: k how strong the light is, ak how strong the shade, st stars
export const PALETTES = {
  day: { top: hex('#1763c7'), hor: hex('#a8d2ee'), sun: hex('#fff0d4'), low: hex('#ff6a2c'), amb: hex('#6f76c4'), sand: hex('#e6b47a'), wall: hex('#cf4027'), trim: hex('#9c2a1d'), wall2: hex('#2f7fc6'), trim2: hex('#1d558f'), k: 1.75, ak: 0.62, st: 0 },
  noon: { top: hex('#2d7fe0'), hor: hex('#e6ecea'), sun: hex('#ffffff'), low: hex('#ffb070'), amb: hex('#8a92cf'), sand: hex('#f0d2a2'), wall: hex('#dd6a4c'), trim: hex('#b84a35'), wall2: hex('#5d9fd6'), trim2: hex('#3b76ad'), k: 2.0, ak: 0.75, st: 0 },
  dawn: { top: hex('#3558a6'), hor: hex('#ffc2ad'), sun: hex('#ffd2b0'), low: hex('#ff7d6a'), amb: hex('#7b6cb5'), sand: hex('#e8b99c'), wall: hex('#cc4a3a'), trim: hex('#96302a'), wall2: hex('#4a7fc0'), trim2: hex('#2f5690'), k: 1.5, ak: 0.6, st: 0.15 },
  dusk: { top: hex('#231f6b'), hor: hex('#ff7c40'), sun: hex('#ff9a55'), low: hex('#ff3d1f'), amb: hex('#5b3f95'), sand: hex('#dc9762'), wall: hex('#bd3524'), trim: hex('#84221c'), wall2: hex('#3a62b0'), trim2: hex('#263f80'), k: 1.6, ak: 0.55, st: 0.25 },
  ember: { top: hex('#2a0c2c'), hor: hex('#f0411f'), sun: hex('#ff5a2a'), low: hex('#ff2a12'), amb: hex('#5a2048'), sand: hex('#cf6a3e'), wall: hex('#a8241c'), trim: hex('#701712'), wall2: hex('#3d3f8f'), trim2: hex('#272962'), k: 1.7, ak: 0.5, st: 0.35 },
  night: { top: hex('#040a22'), hor: hex('#182c5e'), sun: hex('#a9c0ff'), low: hex('#7f9cff'), amb: hex('#222e66'), sand: hex('#b9a48f'), wall: hex('#8a3038'), trim: hex('#5c1f2a'), wall2: hex('#2c5aa0'), trim2: hex('#1b3a70'), k: 0.9, ak: 0.8, st: 1 },
  faded: { top: hex('#8296d2'), hor: hex('#f2d9d2'), sun: hex('#fff2e4'), low: hex('#ffab8f'), amb: hex('#9a8fc4'), sand: hex('#ead0bb'), wall: hex('#d98a80'), trim: hex('#b5645e'), wall2: hex('#8fb0d8'), trim2: hex('#6688b4'), k: 1.45, ak: 0.8, st: 0 },
};
const COLS = ['top', 'hor', 'sun', 'low', 'amb', 'sand', 'wall', 'trim', 'wall2', 'trim2'], NUMS = ['k', 'ak', 'st'];
const NIGHT = { top: hex('#03081c'), hor: hex('#0f1a3e'), amb: hex('#27346f') };
// the words over each palette: ink, accent. Dark on the bright sand, light in the dark
// (indoors the picture is mostly shade and red wall: light ink; out on the open dunes by day: dark ink)
const INK_OUT = { day: ['#2a0f08', '#1746b0'], noon: ['#2a0f08', '#b3261e'], dawn: ['#2c1220', '#a8281f'], faded: ['#3a1c22', '#b03a48'] };
const INK_IN = { day: ['#fff3df', '#ffd27a'], noon: ['#fff6e6', '#ffd27a'], dawn: ['#fff0e6', '#ffc9a0'], dusk: ['#fff1dc', '#ffd166'], ember: ['#ffe9d2', '#ffc24a'], night: ['#f1e6d6', '#ff9a62'], faded: ['#fff6ee', '#ffd0c0'] };

const SKY_VS = `varying vec3 vD; void main() { vD = normalize(position); gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); gl_Position.z = gl_Position.w * 0.99999; }`;
const SKY_FS = COMMON + `
uniform vec3 uTop, uHor, uSunW, uDisc, uGlow; uniform float uStars, uStorm;
varying vec3 vD;
float stars(vec3 d, float scale) {
  float az = atan(d.y, d.x), el = asin(clamp(d.z, -1.0, 1.0));
  vec2 g = vec2(az * scale / 6.2832 * cos(el) * 2.0, el * scale / 3.1416), c = floor(g), f = fract(g); float h = h21(c);
  if (h < 0.9) return 0.0;
  vec2 q = vec2(h21(c + 3.1), h21(c + 7.7)) * 0.7 + 0.15;
  return smoothstep(0.1, 0.0, length(f - q)) * (h - 0.9) / 0.1 * (0.65 + 0.35 * sin(uT * (1.0 + h * 3.0) + h * 40.0));
}
void main() {
  vec3 d = normalize(vD); float z = d.z;
  vec3 c = mix(uHor, uTop, pow(clamp(z, 0.0, 1.0), 0.5));
  float sd = max(dot(d, uSunW), 0.0);
  c += uGlow * (pow(sd, 4.0) * 0.45 + pow(sd, 22.0) * 0.6) * exp(-max(z, 0.0) * 3.0);        // the low sun in the dust
  c += uDisc * (smoothstep(0.99945, 0.9997, sd) * 5.0 + pow(sd, 700.0) * 1.6 + pow(sd, 70.0) * 0.22);
  c += vec3(0.9, 0.93, 1.0) * (stars(d, 240.0) + 0.6 * stars(d.yzx, 480.0)) * uStars * smoothstep(0.0, 0.12, z);
  c = mix(c, uFogC, uStorm * 0.9);
  gl_FragColor = vec4(finish(c), 1.0);
}`;

const SAND_VS = COMMON + `
varying vec3 vR;
void main() { vR = vec3(position.xy, sandH(position.xy)); gl_Position = projectionMatrix * viewMatrix * vec4(toWorld(vR), 1.0); }`;
const SAND_FS = COMMON + `
uniform vec3 uSandC, uSunW; uniform float uSpark, uHigh, uTurb, uPour, uStorm;
varying vec3 vR;
void main() {
  vec2 p = vR.xy;
  float dist = length(vR - uEyeR), e = 0.003 + dist * 0.0015;
  float h0 = sandH(p), hx = sandH(p + vec2(e, 0.0)), hy = sandH(p + vec2(0.0, e));
  vec3 n = normalize(vec3(h0 - hx, h0 - hy, e)), r = vec3(p, h0), vd = normalize(r - uEyeR);
  float sdRoom = max(abs(p.x) - X0, max(p.y - Y1, -Y0 - p.y)), indoors = step(sdRoom, 0.0) * (1.0 - uOpen);
  // wind ripples, finer than the drifts; they fade into the distance before they can shimmer
  vec2 wd = vec2(0.8, 0.6);
  float ph = dot(p, wd) * 130.0 + 11.0 * vn(p * 3.1) + 3.5 * vn(p * 11.0), rf = smoothstep(1.6, 0.5, fwidth(ph)) * (0.3 + 0.7 * vn(p * 2.3 + 8.0));
  n = normalize(n + vec3(wd * cos(ph), 0.0) * 0.11 * rf * smoothstep(0.3, 0.04, 1.0 - n.z));
  vec3 alb = uSandC * (0.84 + 0.22 * vn(p * 47.0) + 0.12 * (h21(floor(p * 700.0)) - 0.5) * rf) * (1.0 + 0.05 * sin(ph) * rf);
  // sand on the move: sliding down the fans under the openings and the heaps under the streams
  float slide = 0.0;
  if (indoors * uPour > 0.01) {
  for (int i = 0; i < ${NF}; i++) { vec2 d = p - uFan[i].xy; float l = length(d); slide += smoothstep(0.03, 0.0, h0 - ZB - fanH(uFan[i].z, l)) * step(0.03, uFan[i].z) * vn(vec2(d.x / max(l, 0.01) * 9.0 + float(i) * 7.0, l * 7.0 - uFlowT * 1.3)); }
  for (int i = 0; i < 3; i++) { vec2 d = p - uCone[i].xy; float l = length(d); slide += smoothstep(0.04, 0.0, h0 - ZB - (uCone[i].z - l * 0.62)) * step(0.02, uCone[i].z) * vn(vec2(d.x / max(l, 0.01) * 7.0 + float(i) * 3.0, l * 12.0 - uFlowT * 2.0)); }
  }
  alb *= 1.0 + (smoothstep(0.45, 0.8, slide) - 0.25 * smoothstep(0.5, 0.2, slide)) * 0.35 * min(uPour, 1.5) * indoors;
  // the funnel: lines running in to the neck, and the dark of the hole itself
  vec2 dd = p - uDrain.xy; float dl = length(dd);
  alb *= 1.0 + uDrain.z * smoothstep(0.5, 0.1, dl) * (vn(vec2(atan(dd.y, dd.x) * 5.0, dl * 16.0 + uFlowT * 2.4)) - 0.5) * 0.7;
  alb *= 1.0 - uDrain.z * smoothstep(0.07, 0.015, dl);
  // wind: streamers of sand snaking over the surface
  float st = vn(vec2(dot(p, wd) * 1.3 - uFlowT * 0.8, dot(p, vec2(-wd.y, wd.x)) * 13.0 + 2.0 * vn(p * 0.7)));
  alb = mix(alb, uSandC * 1.25, smoothstep(0.6, 0.95, st) * vn(p * 0.6 - uFlowT * 0.1) * min(uTurb, 1.5) * 0.6 * (1.0 - 0.5 * indoors));
  float vis = sunVis(r + n * 0.004);
  // the deck's own shadow, and the dark it sits in
  vec3 W = toWorld(r);
  vec3 inv = 1.0 / (uSunW + vec3(equal(uSunW, vec3(0.0))) * 1e-5), ta = (vec3(-0.185, -0.19, -0.1) - W) * inv, tb = (vec3(0.27, 0.19, -0.02) - W) * inv, mn = min(ta, tb), mx = max(ta, tb);
  float t0 = max(max(mn.x, mn.y), mn.z), t1 = min(mx.x, min(mx.y, mx.z));
  if (t1 > max(t0, 0.0)) vis *= 0.0;
  vec2 fq = max(abs(W.xy - vec2(0.0425, 0.0)) - vec2(0.2275, 0.19), 0.0);
  float ao = 1.0 - 0.62 * exp(-length(fq) / 0.045);
  vec3 c = lit(alb, n, vis, indoors) * ao;
  // glitter: grains that catch the sun as the view turns; the treble lights more of them
  vec2 g = p * 330.0, gc = floor(g); float gh = h21(gc);
  vec3 hv = normalize(uSunR - vd);
  float tw = fract(gh * 7.31 + dot(hv.xy, vec2(h21(gc + 1.7), h21(gc + 5.3)) - 0.5) * 9.0 + uT * 0.12 * (gh - 0.5));
  float gl = smoothstep(1.0 - (0.006 + 0.05 * uHigh) * uSpark, 1.0, tw) * smoothstep(0.42, 0.12, length(fract(g) - 0.5));
  c += uSunCol * (0.05 + 0.95 * vis) * gl * 1.5 * ao / (1.0 + dist * 0.5);
  c = fogged(c, dist * (1.0 + uStorm * 30.0 * smoothstep(0.5, 6.0, dist)));
  gl_FragColor = vec4(finish(c), 1.0);
}`;

const WALL_VS = COMMON + `
attribute float aWall, aKind; attribute vec3 aN;
varying vec3 vR, vN; varying vec2 vQ; varying float vWall, vKind;
void main() {
  int id = int(aWall + 0.5);
  float drop = id == 0 ? uDrop.x : id == 1 ? uDrop.y : id == 2 ? uDrop.z : uDrop.w;
  vR = vec3(position.xy, position.z - uSink - drop); vN = aN; vWall = aWall; vKind = aKind;
  vQ = vec2(id == 0 || id == 2 ? position.x : position.y, position.z);
  gl_Position = projectionMatrix * viewMatrix * vec4(toWorld(vR), 1.0);
}`;
const WALL_FS = COMMON + `
uniform vec3 uWallC, uTrimC, uSandC;
varying vec3 vR, vN; varying vec2 vQ; varying float vWall, vKind;
vec3 plaster(vec2 q, float z) {
  float n = vn(q * vec2(2.3, 3.1) + 3.0), n2 = vn(q * 9.0), n3 = vn(q * vec2(31.0, 4.0));
  vec3 c = mix(uWallC, uTrimC, smoothstep(0.40, 0.385, q.y));                          // two paints: a darker dado
  c = mix(c, uWallC * 1.3 + 0.04, smoothstep(0.009, 0.003, abs(q.y - 0.405)) * 0.7);    // and the line between them
  c *= 0.8 + 0.34 * n;                                                                // sun-fade and stains
  c *= 1.0 - 0.3 * smoothstep(0.55, 0.9, n3) * smoothstep(0.8, 0.3, q.y);             // runs down from the top
  float peel = smoothstep(0.7, 0.73, vn(q * 4.7 + 11.0) * 0.6 + n2 * 0.25 + vn(q * 37.0) * 0.2 + 0.22 * exp(-max(z, 0.0) / 0.2));
  c = mix(c, mix(c, vec3(0.7, 0.52, 0.4), 0.55) * (0.85 + 0.3 * n2), peel);                         // paint gone, plaster showing
  return mix(c, uSandC * 0.85, 0.6 * exp(-max(z - 0.02, 0.0) / 0.09));               // sand-blasted and dusty low down
}
void main() {
  int id = int(vWall + 0.5);
  float inside = id == 0 ? Y1 - uEyeR.y : id == 1 ? X0 - uEyeR.x : id == 2 ? uEyeR.y + Y0 : uEyeR.x + X0;
  if (smoothstep(0.0, 0.2, inside) <= ign(gl_FragCoord.xy)) discard;                  // the wall the camera is behind is cut away
  vec3 nOut = id == 0 ? vec3(0.0, 1.0, 0.0) : id == 1 ? vec3(1.0, 0.0, 0.0) : id == 2 ? vec3(0.0, -1.0, 0.0) : vec3(-1.0, 0.0, 0.0);
  vec3 ax = id == 0 || id == 2 ? vec3(1.0, 0.0, 0.0) : vec3(0.0, 1.0, 0.0);
  vec3 r = vR, n = vN, alb; float indoors = 1.0, vis = 1.0;
  if (vKind > 1.5) { alb = plaster(vQ, r.z) * 0.9; vis = sunVis(r + n * 0.01); indoors = 0.3; }
  else if (vKind > 0.5) { alb = mix(uWallC, vec3(0.62, 0.5, 0.4), 0.5) * (0.8 + 0.3 * vn(r.xy * 9.0)); indoors = 0.0; }
  else {
    float sd = sdWall(id, vQ);
    if (sd > 0.0) alb = plaster(vQ, r.z) * (1.0 - 0.25 * smoothstep(0.03, 0.0, sd));
    else if (barsWall(id, vQ) < 0.0) alb = vec3(0.16, 0.1, 0.07) * (0.7 + 0.6 * vn(vQ * vec2(40.0, 9.0)));      // what is left of a frame
    else {
      // the wall is thick: look through the hole, and see its reveal where the ray meets the far side of it
      vec3 d = normalize(vR - uEyeR); float dn = dot(d, nOut);
      if (dn < 1e-3) discard;
      vec2 dq = vec2(dot(d, ax), d.z) / dn * TT;
      if (sdWall(id, vQ + dq) < 0.0) discard;
      float lo = 0.0, hi = 1.0;
      for (int i = 0; i < 6; i++) { float m = 0.5 * (lo + hi); if (sdWall(id, vQ + dq * m) < 0.0) lo = m; else hi = m; }
      vec2 qh = vQ + dq * hi; r = vR + d * (hi * TT / dn);
      if (r.z < sandH(r.xy)) discard;                                                  // the sand lying in the opening
      vec2 gr = vec2(sdWall(id, qh + vec2(0.004, 0.0)) - sdWall(id, qh - vec2(0.004, 0.0)), sdWall(id, qh + vec2(0.0, 0.004)) - sdWall(id, qh - vec2(0.0, 0.004)));
      gr = normalize(gr + 1e-5); n = -(ax * gr.x + vec3(0.0, 0.0, gr.y));
      alb = plaster(qh + 0.37, r.z) * 1.05; vis = step(0.0, dot(uSunR, nOut)); indoors = 0.5;
      gl_FragColor = vec4(finish(fogged(lit(alb, n, vis, indoors), length(r - uEyeR))), 1.0); return;
    }
    vis = sunVis(r + n * 0.004);
  }
  gl_FragColor = vec4(finish(fogged(lit(alb, n, vis, indoors), length(r - uEyeR))), 1.0);
}`;

// the light standing in the dust: a short march through the room along each view ray, asking sunVis as it goes
const SHAFT_VS = `varying vec2 vNdc; void main() { vNdc = position.xy; gl_Position = vec4(position.xy, 0.0, 1.0); }`;
const SHAFT_FS = COMMON + `
uniform mat4 uInvVP; uniform vec3 uEyeW; uniform float uHaze, uTurb;
varying vec2 vNdc;
void main() {
  vec4 pw = uInvVP * vec4(vNdc, 1.0, 1.0); vec3 dW = normalize(pw.xyz / pw.w - uEyeW), d = dirToRoom(dW), o = uEyeR;
  vec3 inv = 1.0 / (d + vec3(equal(d, vec3(0.0))) * 1e-5);
  vec3 ta = (vec3(-X0, -Y0, ZB) - o) * inv, tb = (vec3(X0, Y1, max(HH - uSink, ZB + 0.01)) - o) * inv, mn = min(ta, tb), mx = max(ta, tb);
  float t0 = max(max(mn.x, mn.y), max(mn.z, 0.0)), t1 = min(mx.x, min(mx.y, mx.z));
  // the deck is in the way of whatever is behind it
  vec3 invW = 1.0 / (dW + vec3(equal(dW, vec3(0.0))) * 1e-5), da = (vec3(-0.185, -0.19, -0.1) - uEyeW) * invW, db = (vec3(0.27, 0.19, -0.004) - uEyeW) * invW, dmn = min(da, db), dmx = max(da, db);
  float e0 = max(max(dmn.x, dmn.y), dmn.z), e1 = min(dmx.x, min(dmx.y, dmx.z));
  if (e1 > max(e0, 0.0)) t1 = min(t1, e0);
  if (t1 <= t0) discard;
  float jit = h21(gl_FragCoord.xy * 0.731 + fract(uT * 7.13) * 61.0), dt = (t1 - t0) / 24.0, acc = 0.0;
  for (int i = 0; i < 24; i++) {
    vec3 p = o + d * (t0 + (float(i) + jit) * dt);
    float dens = 0.35 + 1.3 * vn(p.xy * 2.3 + p.z * vec2(1.7, 0.9) + vec2(uFlowT * 0.07, -uFlowT * 0.05)) * (0.6 + 0.8 * uTurb);
    acc += sunVis(p) * dens * exp(-max(p.z, 0.0) * 0.5);
  }
  float cs = dot(d, uSunR), g = 0.55, phase = (1.0 - g * g) / pow(1.0 + g * g - 2.0 * g * cs, 1.5) * 0.4 + 0.1;
  vec3 c = uSunCol * acc * dt * phase * uHaze * 0.34 * (1.0 - uRoof) * uFade;
  gl_FragColor = vec4(pow(1.0 - exp(-c), vec3(0.75)), 1.0);
}`;

// motes: specks of dust that only show where the sun reaches them
const MOTE_VS = COMMON + `
uniform float uSpark, uHigh, uPx, uTurb;
attribute vec4 aRnd;
varying float vA;
void main() {
  float top = max(HH - uSink, 0.3);
  vec3 r = vec3(mix(-X0, X0, aRnd.x), mix(-Y0, Y1, aRnd.y), 0.0);
  float tt = uFlowT * (0.04 + 0.05 * aRnd.w);
  r.xy += 0.12 * vec2(sin(tt * 3.0 + aRnd.z * 40.0), cos(tt * 2.3 + aRnd.w * 31.0)) * (0.5 + uTurb);
  r.z = ZB + 0.02 + fract(aRnd.z - tt * 0.5) * (top - 0.04);
  float vis = sunVis(r) * (1.0 - uRoof);
  vec4 mv = viewMatrix * vec4(toWorld(r), 1.0);
  float tw = 0.5 + 0.5 * sin(uT * (2.0 + aRnd.w * 5.0) + aRnd.x * 60.0);
  vA = vis * (0.25 + 0.75 * tw * (0.4 + 1.2 * uHigh)) * uSpark * uFade;
  gl_PointSize = clamp(uPx * (0.0016 + 0.003 * aRnd.w) / max(0.05, -mv.z), 1.0, 5.0);
  gl_Position = vis < 0.01 ? vec4(2.0, 2.0, 2.0, 1.0) : projectionMatrix * mv;
}`;
const MOTE_FS = `uniform vec3 uSunCol; varying float vA; void main() { float d = length(gl_PointCoord - 0.5); gl_FragColor = vec4(uSunCol * 0.45 * vA * smoothstep(0.5, 0.1, d), 1.0); }`;

// the sand on the move in the air: grains round the deck that jump on every kick
const GRAIN_VS = COMMON + `
uniform float uPx; uniform vec3 uSandC;
attribute vec4 aRnd;
varying vec3 vC; varying float vA;
void main() {
  float ang = aRnd.x * 6.2832, rad = 0.27 + 1.05 * aRnd.y * aRnd.y;
  vec2 p = rad * vec2(cos(ang), sin(ang));
  float t = uKick.x, v = uKick.y * (0.25 + 0.75 * aRnd.z) * exp(-(rad - 0.27) * 1.5) * 0.85;
  float up = max(0.0, v * t - 2.6 * t * t);
  p += normalize(p) * up * 0.5 * (aRnd.w - 0.3);
  vec3 r = vec3(p, sandH(p) + up);
  vec4 mv = viewMatrix * vec4(toWorld(r), 1.0);
  vC = uSandC * (uSunCol * (0.5 + 0.5 * sunVis(r)) + uAmb + uBounce) * 1.1;
  vA = smoothstep(0.0, 0.004, up);
  gl_PointSize = clamp(uPx * (0.0011 + 0.0017 * aRnd.w) / max(0.05, -mv.z), 1.0, 3.5);
  gl_Position = up <= 0.0 ? vec4(2.0, 2.0, 2.0, 1.0) : projectionMatrix * mv;
}`;
const GRAIN_FS = COMMON + `varying vec3 vC; varying float vA; void main() { float d = length(gl_PointCoord - 0.5); if (d > 0.5) discard; gl_FragColor = vec4(finish(vC), vA * smoothstep(0.5, 0.3, d)); }`;

// the streams from the ceiling: thin falls of sand, turned to the camera, with the dust they raise where they land
const STREAM_VS = COMMON + `
uniform float uPour;
attribute vec3 aBase;                                              // x, y in the room, and which stream
varying vec2 vUv; varying vec3 vR; varying float vK;
void main() {
  float top = max(HH - uSink, 0.2), z0 = ZB + uCone[int(aBase.z + 0.5)].z - 0.01 - (aBase.z < 0.5 ? 0.19 * uDrain.z : 0.0);
  float z = mix(z0, top, position.y);
  vec3 r = vec3(aBase.xy, z);
  vec2 side = normalize(vec2(uEyeR.y - r.y, -(uEyeR.x - r.x)));
  float k = min(uPour, 1.6) * (aBase.z < 0.5 ? 1.0 : 0.6);
  float wdt = (0.005 + 0.012 * k) * (1.0 + 0.25 * sin(z * 14.0 - uFlowT * 5.0 + aBase.z * 2.0)) + 0.028 * k * smoothstep(0.06, 0.0, z - z0);
  r.xy += side * position.x * wdt;
  vUv = vec2(position.x, z - z0); vR = r; vK = k;
  gl_Position = projectionMatrix * viewMatrix * vec4(toWorld(r), 1.0);
}`;
const STREAM_FS = COMMON + `
uniform vec3 uSandC;
varying vec2 vUv; varying vec3 vR; varying float vK;
void main() {
  float x = vUv.x, z = vUv.y;
  float core = pow(max(0.0, 1.0 - x * x), 1.5), puff = smoothstep(0.07, 0.0, z);
  float streak = vn(vec2(x * 3.0, z * 22.0 + uFlowT * 9.0)) * 0.6 + vn(vec2(x * 9.0, z * 70.0 + uFlowT * 26.0)) * 0.4;
  float a = core * (0.35 + 0.65 * streak) * mix(1.0, 0.45, puff) * smoothstep(0.0, 0.25, vK);
  vec3 c = lit(uSandC * 1.1, normalize(vec3(-x * 0.6, 0.0, 0.5) + uSunR * 0.5), 0.35 + 0.65 * sunVis(vR), 1.0);
  gl_FragColor = vec4(finish(c), clamp(a * 1.3, 0.0, 1.0));
}`;

export default class SlowRushWorld {
  static WORDS = { font: 'Syncopate, Michroma, sans-serif', wide: 'Syncopate, Michroma, sans-serif', weight: 700, upper: true, track: 0.7, streak: 0, chroma: false, rise: -0.012 };
  static base(info) { return { paint: info.lp2 ? 1 : 0, haze: 0.8, sand: 0, storm: 0, rush: 0, open: 0, drain: 0, glass: 0, hour: 0, sunHold: 0, words: 'drift', vig: 0.7, grain: 0.05 }; }
  static SECTIONS = {
    intro: { palette: 'dawn', hour: -0.6, haze: 0.6, pour: 0.15, flow: 0.3, turb: 0.1, spark: 0.45, pulse: 0.4, camEl: -0.4, camZoom: -0.15, drift: 0.02, bloom: 0.55 },
    quiet: { palette: 'day', haze: 0.75, pour: 0.3, flow: 0.4, turb: 0.15, spark: 0.55, pulse: 0.5, camEl: -0.36, camZoom: -0.25, drift: 0.03, bloom: 0.55 },
    build: { palette: 'day', haze: 0.95, pour: 0.65, flow: 0.7, turb: 0.5, spark: 0.8, pulse: 0.8, camEl: -0.42, camZoom: -0.35, drift: 0.04, bloom: 0.65 },
    full: { palette: 'day', haze: 1, pour: 1, flow: 1, turb: 0.6, spark: 1, pulse: 1, bloom: 0.75, camEl: -0.47, camZoom: -0.45, drift: 0.045, split: 0.35 },
    break: { palette: 'night', haze: 0.9, pour: 0.15, flow: 0.25, turb: 0.1, spark: 1, pulse: 0.5, calm: 0.6, camEl: -0.4, camZoom: -0.2, drift: 0.03, bloom: 0.8 },
    outro: { palette: 'dusk', hour: 0.8, open: 1, haze: 0.5, pour: 0.2, flow: 0.3, turb: 0.25, spark: 0.6, pulse: 0.4, camEl: -0.5, camZoom: -0.6, drift: 0.03, bloom: 0.7 },
    loop: { palette: 'day', rush: 1, haze: 1, pour: 0.8, flow: 0.9, turb: 0.5, glitch: 0.2, trail: 0.3, camEl: -0.4, camZoom: -0.4 },
  };

  ink(p) { return this.nightK > 0.5 ? INK_IN.night : (this.outK > 0.6 && INK_OUT[p.palette]) || INK_IN[p.palette] || INK_IN.day; }
  post(post, p, s) {
    post.uThresh = 0.93;
    const st = Math.min(1, p.storm || 0);
    if (st > 0) { post.tint[1] = 1 - 0.08 * st; post.tint[2] = 1 - 0.2 * st; post.uGrain += 0.05 * st; }
  }

  constructor(r) {
    this.r = r;
    this.scene = new THREE.Scene();
    this.pal = {}; for (const k of COLS) this.pal[k] = PALETTES.day[k].clone();
    this.num = { k: PALETTES.day.k, ak: PALETTES.day.ak, st: 0 };
    this.eye = new THREE.Vector3(); this.tmp = new THREE.Vector3(); this.cTmp = new THREE.Color();
    this.flowT = 0; this.dayT = 0; this.kAge = 9; this.kAmp = 0; this.kPrev = 0; this.nightK = 0; this.sunZ = 1; this.outK = 0; this.px = 700; this.hue = new THREE.Color();
    const v3 = () => ({ value: new THREE.Vector3() }), col = () => ({ value: new THREE.Color() }), f = (x = 0) => ({ value: x });
    // one set of uniforms, shared by every material
    this.U = {
      uSunR: v3(), uSunW: v3(), uSunCol: col(), uAmb: col(), uBounce: col(), uFogC: col(), uEyeR: v3(), uEyeW: v3(), uKick: v3(), uDrain: { value: new THREE.Vector3(DRAIN[0], DRAIN[1], 0) },
      uDrop: { value: new THREE.Vector4() }, uBank: { value: new THREE.Vector4() }, uDriftA: { value: new THREE.Vector4() },
      uFan: { value: FANS.map((o) => new THREE.Vector3(o.x, o.y, 0)) }, uCone: { value: CONES.map((c) => new THREE.Vector3(c[0], c[1], 0)) }, uSeedV: { value: new THREE.Vector2() },
      uSink: f(0.3), uRoof: f(), uOpen: f(), uFogK: f(0.01), uFade: f(1), uT: f(), uFlowT: f(),
      uTop: col(), uHor: col(), uDisc: col(), uGlow: col(), uStars: f(), uStorm: f(),
      uSandC: col(), uWallC: col(), uTrimC: col(), uSpark: f(), uHigh: f(), uTurb: f(), uPour: f(), uHaze: f(), uPx: f(700),
      uInvVP: { value: new THREE.Matrix4() },
    };
    this.buildSky(); this.buildSand(); this.buildWalls(); this.buildStreams(); this.buildGrains(); this.buildMotes(); this.buildShafts();
    this.glass = new Hourglass(this.scene, this.U);
  }
  mat(vs, fs, o = {}) { return new THREE.ShaderMaterial({ vertexShader: vs, fragmentShader: fs, uniforms: this.U, ...o }); }
  add(mesh, order = 0) { mesh.frustumCulled = false; mesh.renderOrder = order; this.scene.add(mesh); return mesh; }
  buildSky() {
    const sky = this.add(new THREE.Mesh(new THREE.SphereGeometry(120, 48, 24), this.mat(SKY_VS, SKY_FS, { side: THREE.BackSide, depthWrite: false })), -10);
    sky.position.copy(C); sky.updateMatrixWorld();
  }
  // the ground: rings round the deck, fine near it and coarser out to the horizon; the height is the shader's
  buildSand() {
    const NA = 384, radii = [];
    for (let r = 0.05; r < 115; r *= 1.024) radii.push(r);
    const NR = radii.length, pos = new Float32Array((1 + NR * NA) * 3), idx = [];
    for (let i = 0; i < NR; i++) for (let a = 0; a < NA; a++) { const th = (a + (i % 2) * 0.5) / NA * Math.PI * 2, o = (1 + i * NA + a) * 3; pos[o] = radii[i] * Math.cos(th); pos[o + 1] = radii[i] * Math.sin(th); }
    for (let a = 0; a < NA; a++) idx.push(0, 1 + a, 1 + (a + 1) % NA);
    for (let i = 0; i + 1 < NR; i++) for (let a = 0; a < NA; a++) {
      const a1 = (a + 1) % NA, p0 = 1 + i * NA + a, p1 = 1 + i * NA + a1, q0 = 1 + (i + 1) * NA + a, q1 = 1 + (i + 1) * NA + a1;
      if (i % 2) idx.push(p0, p1, q0, p1, q1, q0); else idx.push(p0, p1, q1, p0, q1, q0);
    }
    const g = new THREE.BufferGeometry(); g.setAttribute('position', new THREE.BufferAttribute(pos, 3)); g.setIndex(idx);
    this.sand = this.add(new THREE.Mesh(g, this.mat(SAND_VS, SAND_FS, { side: THREE.DoubleSide })), 0);
  }
  buildWalls() {
    const pos = [], nrm = [], wall = [], kind = [], idx = [];
    const quad = (pts, n, id, k) => { const b = pos.length / 3; for (const p of pts) { pos.push(...p); nrm.push(...n); wall.push(id); kind.push(k); } idx.push(b, b + 1, b + 2, b, b + 2, b + 3); };
    const E = X0 + TT;
    // inner faces (kind 0), tops (1), ends (2)
    quad([[-E, Y1, 0], [E, Y1, 0], [E, Y1, HH], [-E, Y1, HH]], [0, -1, 0], 0, 0);
    quad([[X0, -Y0, 0], [X0, Y1, 0], [X0, Y1, HH], [X0, -Y0, HH]], [-1, 0, 0], 1, 0);
    quad([[-E, -Y0, 0], [E, -Y0, 0], [E, -Y0, HH], [-E, -Y0, HH]], [0, 1, 0], 2, 0);
    quad([[-X0, -Y0, 0], [-X0, Y1, 0], [-X0, Y1, HH], [-X0, -Y0, HH]], [1, 0, 0], 3, 0);
    quad([[-E, Y1, HH], [E, Y1, HH], [E, Y1 + TT, HH], [-E, Y1 + TT, HH]], [0, 0, 1], 0, 1);
    quad([[X0, -Y0, HH], [E, -Y0, HH], [E, Y1, HH], [X0, Y1, HH]], [0, 0, 1], 1, 1);
    quad([[-E, -Y0 - TT, HH], [E, -Y0 - TT, HH], [E, -Y0, HH], [-E, -Y0, HH]], [0, 0, 1], 2, 1);
    quad([[-E, -Y0, HH], [-X0, -Y0, HH], [-X0, Y1, HH], [-E, Y1, HH]], [0, 0, 1], 3, 1);
    for (const sx of [-1, 1]) {
      quad([[sx * E, Y1, 0], [sx * E, Y1 + TT, 0], [sx * E, Y1 + TT, HH], [sx * E, Y1, HH]], [sx, 0, 0], 0, 2);
      quad([[sx * E, -Y0 - TT, 0], [sx * E, -Y0, 0], [sx * E, -Y0, HH], [sx * E, -Y0 - TT, HH]], [sx, 0, 0], 2, 2);
      quad([[sx * X0, -Y0, 0], [sx * E, -Y0, 0], [sx * E, -Y0, HH], [sx * X0, -Y0, HH]], [0, -1, 0], sx > 0 ? 1 : 3, 2);
      quad([[sx * X0, Y1, 0], [sx * E, Y1, 0], [sx * E, Y1, HH], [sx * X0, Y1, HH]], [0, 1, 0], sx > 0 ? 1 : 3, 2);
    }
    const g = new THREE.BufferGeometry();
    g.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3)); g.setAttribute('aN', new THREE.Float32BufferAttribute(nrm, 3));
    g.setAttribute('aWall', new THREE.Float32BufferAttribute(wall, 1)); g.setAttribute('aKind', new THREE.Float32BufferAttribute(kind, 1)); g.setIndex(idx);
    this.walls = this.add(new THREE.Mesh(g, this.mat(WALL_VS, WALL_FS, { side: THREE.DoubleSide })), 1);
  }
  buildStreams() {
    const pos = [], base = [], idx = [], SEG = 24;
    CONES.forEach((c, k) => {
      const b = pos.length / 3;
      for (let i = 0; i <= SEG; i++) { const y = Math.pow(i / SEG, 2.2); for (const x of [-1, 1]) { pos.push(x, y, 0); base.push(c[0], c[1], k); } }
      for (let i = 0; i < SEG; i++) { const a = b + i * 2; idx.push(a, a + 1, a + 2, a + 1, a + 3, a + 2); }
    });
    const g = new THREE.BufferGeometry(); g.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3)); g.setAttribute('aBase', new THREE.Float32BufferAttribute(base, 3)); g.setIndex(idx);
    this.streams = this.add(new THREE.Mesh(g, this.mat(STREAM_VS, STREAM_FS, { side: THREE.DoubleSide, transparent: true, depthWrite: false })), 5);
  }
  points(n, vs, fs, o, order) {
    const rnd = new Float32Array(n * 4); let s = 12345;
    for (let i = 0; i < rnd.length; i++) { s = (Math.imul(s, 1664525) + 1013904223) >>> 0; rnd[i] = s / 4294967296; }
    const g = new THREE.BufferGeometry(); g.setAttribute('position', new THREE.BufferAttribute(new Float32Array(n * 3), 3)); g.setAttribute('aRnd', new THREE.BufferAttribute(rnd, 4));
    return this.add(new THREE.Points(g, this.mat(vs, fs, o)), order);
  }
  buildGrains() { this.grains = this.points(7000, GRAIN_VS, GRAIN_FS, { transparent: true, depthWrite: false }, 6); }
  buildMotes() { this.motes = this.points(2600, MOTE_VS, MOTE_FS, { transparent: true, depthWrite: false, blending: THREE.AdditiveBlending }, 7); }
  buildShafts() {
    this.shafts = this.add(new THREE.Mesh(new THREE.PlaneGeometry(2, 2), this.mat(SHAFT_VS, SHAFT_FS, { transparent: true, depthWrite: false, depthTest: false, blending: THREE.AdditiveBlending })), 20);
  }

  // p: the act's parameters (already blended), s: what the music is doing, dt: seconds of real time, loopT: the world's clock
  update(dt, p, s, loopT) {
    const u = this.U, rate = s.rate ?? 1, kick = s.kick || 0, seed = s.seed || 0, prog = s.progress || 0;
    // colours ease toward the act's palette
    const target = PALETTES[p.palette] || PALETTES.day, k = 1 - Math.exp(-dt * (p.palFast ? 12 : 1.3));
    for (let i = 0; i < COLS.length; i++) this.pal[COLS[i]].lerp(target[COLS[i]], k);
    for (let i = 0; i < NUMS.length; i++) this.num[NUMS[i]] += (target[NUMS[i]] - this.num[NUMS[i]]) * k;
    const calm = 1 - 0.7 * (p.calm || 0), rush = p.rush || 0;
    this.flowT += dt * rate * p.flow * (1 + 0.5 * (s.energy || 0)) * (1 + 2 * Math.abs(rush)) * (rush < -0.05 ? -1 : 1);
    // the sun: once across the sky per song (left to right, or the other way, by the song), plus the act's hours,
    // plus the days a time-lapse has run. Past the horizon it is night until it comes round again.
    if (Math.abs(rush) > 0.01) this.dayT += dt * rate * rush * 34 * (1 + 3 * smooth01((0.12 - this.sunZ) / 0.1));      // a time-lapse hurries through its nights
    else { this.dayT = ((this.dayT % 240) + 240) % 240; if (this.dayT > 120) this.dayT -= 240; this.dayT *= Math.exp(-dt * 1.5); }
    const a0 = s.lp2 ? -22 + seed * 14 : -56 + seed * 16, a1 = s.lp2 ? 66 : 44 + seed * 14;
    let th = (1 - (p.sunHold || 0)) * (a0 + (a1 - a0) * prog) + (p.hour || 0) * 15 + this.dayT;
    th = ((th + 120) % 240 + 240) % 240 - 120;
    const H = th * Math.PI / 180, e0 = 0.68, side = (seed * 7.3) % 1 < 0.5 ? 1 : -1, S = u.uSunR.value;
    S.set(Math.sin(H) * side, Math.cos(H) * Math.cos(e0), Math.cos(H) * Math.sin(e0)).normalize();
    u.uSunW.value.set(U.x * S.x + V.x * S.y, U.y * S.x + V.y * S.y, S.z); this.sunZ = S.z;
    const up = smooth01(S.z / 0.12), low = 1 - smooth01((S.z - 0.03) / 0.42), night = this.nightK = smooth01((0.05 - S.z) / 0.17);
    const storm = Math.min(1.2, p.storm || 0), pal = this.pal, num = this.num, fade = p.fade;
    u.uSunCol.value.copy(pal.sun).lerp(pal.low, low * 0.85).multiplyScalar(num.k * up * (1 - night) * (1 - 0.55 * Math.min(1, storm)));
    u.uAmb.value.copy(pal.amb).multiplyScalar(num.ak).lerp(NIGHT.amb, night * 0.85).lerp(this.cTmp.copy(pal.sand).multiplyScalar(0.5), Math.min(1, storm) * 0.7);
    u.uBounce.value.copy(pal.sand).lerp(pal.wall, 0.5).multiply(u.uSunCol.value).multiplyScalar(0.34 * Math.max(0.35, S.z + 0.2));
    u.uTop.value.copy(pal.top).lerp(NIGHT.top, night);
    u.uHor.value.copy(pal.hor).lerp(pal.low, low * 0.45 * (1 - num.st)).lerp(NIGHT.hor, night);
    u.uFogC.value.copy(u.uHor.value).lerp(this.cTmp.copy(pal.sand).multiplyScalar(0.8), Math.min(1, storm) * 0.8);
    u.uDisc.value.copy(pal.sun).lerp(pal.low, low * 0.7).multiplyScalar((0.5 + 0.5 * up) * (1 - Math.min(1, storm) * 0.8));
    u.uGlow.value.copy(pal.low).multiplyScalar(low * (1 - night) * 0.9);
    u.uStars.value = Math.max(num.st, night) * (1 - Math.min(1, storm)); u.uStorm.value = Math.min(1, storm);
    u.uFogK.value = 0.011 + 0.03 * storm; u.uFade.value = fade;
    u.uSandC.value.copy(pal.sand);
    const paint = Math.max(0, Math.min(1, p.paint || 0));
    // each song's room is its own red: toward orange, or toward rose
    this.hue.set(seed < 0.5 ? 0xd9682a : 0xc22f58); const hk = Math.abs(seed - 0.5) * 0.7 * (1 - paint);
    u.uWallC.value.copy(pal.wall).lerp(pal.wall2, paint).lerp(this.hue, hk); u.uTrimC.value.copy(pal.trim).lerp(pal.trim2, paint).lerp(this.hue, hk * 0.5);
    // how deep the room has sunk, how far it has opened, and what that does to the sand round it
    const open = Math.max(0, Math.min(1, p.open || 0)), Q = Math.max(0, Math.min(1.5, (p.sand || 0) + 0.3 * prog));
    const sink = 0.62 * Q, d = u.uDrop.value;
    d.set(HH * smooth01((open - 0.6) / 0.38), HH * smooth01((open - 0.3) / 0.35), HH * smooth01((open - 0.12) / 0.3), HH * smooth01((open - 0.45) / 0.35));
    u.uSink.value = sink; u.uRoof.value = Math.max(smooth01(open / 0.3), smooth01((Q - 0.5) / 0.3));   // by the time the walls are half under, the roof has gone u.uOpen.value = smooth01((open - 0.25) / 0.75);
    const pour = Math.max(0, p.pour || 0), b = u.uBank.value, keep = 1 - u.uOpen.value;
    b.set(0.15 + 0.04 * seed, 0.11, 0.08, 0.13 - 0.03 * seed).multiplyScalar((1 + 1.2 * Q + 0.3 * Math.min(pour, 1.5)) * keep);
    u.uDriftA.value.set(0.07, 0.05, 0.05, 0.06).multiplyScalar(1 + 0.8 * Q + 0.3 * Math.min(pour, 1.5));
    for (let i = 0; i < FANS.length; i++) {            // a fan under each opening the sand outside has reached
      const o = FANS[i], bank = b.getComponent(o.wall), sill = o.sill - sink, lintel = o.top - sink - 0.06;
      u.uFan.value[i].z = Math.max(0, Math.min(bank * 0.92, lintel, 0.3)) * smooth01((bank - sill + 0.02) / 0.14) * (1 - smooth01(d.getComponent(o.wall) / 0.5));
    }
    const drain = u.uDrain.value.z = Math.max(0, Math.min(1, p.drain || 0));
    for (let i = 0; i < 3; i++) u.uCone.value[i].z = (0.02 + (i ? 0.05 : 0.09) * Math.min(pour, 1.6) + 0.03 * Q) * (1 - u.uRoof.value) * smooth01(pour / 0.08) * (i ? 1 : 1 - drain);
    u.uSeedV.value.set(seed * 17.31 + (s.lp2 ? 5.7 : 0), seed * 9.17 + (s.k || 0) * 2.3);
    // the kick: the sand round the deck jumps, and a ring runs out through it
    if (kick > this.kPrev + 0.2 && kick > 0.4) { this.kAge = 0; this.kAmp = kick; }
    this.kPrev = kick; this.kAge += dt;
    u.uKick.value.set(this.kAge, this.kAmp * p.pulse * (0.7 + 0.5 * (s.low || 0)), 0);
    u.uT.value = loopT; u.uFlowT.value = this.flowT;
    u.uSpark.value = p.spark * (0.7 + 0.6 * (s.onset || 0)); u.uHigh.value = s.high || 0;
    u.uTurb.value = p.turb * calm * (0.7 + 0.6 * (s.mid || 0)) + storm; u.uPour.value = pour * (1 + 0.25 * kick * p.pulse); u.uHaze.value = (p.haze || 0) * (1 + 0.15 * (s.low || 0));
    this.outK = u.uRoof.value * (1 - storm * 0.5);
    this.streams.visible = pour > 0.02 && u.uRoof.value < 0.98; this.shafts.visible = u.uHaze.value > 0.01 && u.uRoof.value < 0.99 && up * (1 - night) > 0.01;
    this.motes.visible = this.shafts.visible && p.spark > 0.02; this.grains.visible = this.kAge < 1.2 && u.uKick.value.y > 0.02;
    this.walls.visible = sink + Math.min(d.x, d.y, d.z, d.w) < HH + 0.02;
    this.glass.update(dt, p, s, loopT, this.flowT);
  }
  render(r, cam) {
    const u = this.U, e = this.eye.setFromMatrixPosition(cam.matrixWorld);
    u.uEyeW.value.copy(e);
    u.uEyeR.value.set((e.x - C.x) * U.x + (e.y - C.y) * U.y, (e.x - C.x) * V.x + (e.y - C.y) * V.y, e.z - FLOOR);
    u.uInvVP.value.multiplyMatrices(cam.matrixWorld, cam.projectionMatrixInverse);
    u.uPx.value = r.domElement.height * cam.projectionMatrix.elements[5] * 0.5;
    r.render(this.scene, cam);
  }
}
