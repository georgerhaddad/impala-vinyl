// The Slow Rush: the room's plan, and the GLSL that every part of the world shares (the sand, the walls, the light
// shafts, the dust, the grains all ask the same two questions: how high is the sand here, and does the sun reach here).
//
// Room space: origin on the floor under the middle of the deck, x along the screen (left to right from the default
// camera), y away from the viewer, z up, metres. The room is a box x: -X0..X0, y: -Y0..Y1, walls HH tall and TT thick.
// It does not fill with sand: it SINKS into it (uSink), so the deck always rides the surface and the windows come
// down to meet the dunes. Each wall can also drop on its own (uDrop), which is how the room opens out.
export const X0 = 1.25, Y0 = 1.45, Y1 = 1.05, HH = 0.74, TT = 0.09, ZB = 0.006, FLOOR = -0.08, AZ = -0.5;
export const NF = 13;
const f = (x) => { const s = Number(x).toFixed(4); return s; };

// openings, per wall (0 back, 1 right, 2 front, 3 left): [centre along the wall, half-width, sill, top, arched, barred]
// heights are up the wall from its foot; "along" is x for the back and front walls, y for the side walls
export const OPENINGS = [
  [[-0.85, 0.11, 0.14, 0.62, 1, 1], [-0.3, 0.11, 0.14, 0.62, 1, 0], [0.5, 0.16, 0.0, 0.6, 0, 0], [1.0, 0.09, 0.2, 0.56, 1, 0]],
  [[-0.55, 0.15, 0.0, 0.58, 0, 0], [0.1, 0.11, 0.14, 0.62, 1, 1], [0.62, 0.11, 0.14, 0.62, 1, 0]],
  [[-0.6, 0.11, 0.14, 0.62, 1, 0], [0.0, 0.11, 0.14, 0.62, 1, 1], [0.6, 0.11, 0.14, 0.62, 1, 0]],
  [[-0.75, 0.11, 0.14, 0.62, 1, 0], [-0.2, 0.11, 0.14, 0.62, 1, 1], [0.45, 0.11, 0.14, 0.62, 1, 0]],
];
// where sand comes in: one fan per opening { wall, x, y, sill, top }
export const FANS = OPENINGS.flatMap((list, wall) => list.map(([c, hw, sill, top]) => ({
  wall, sill, top, hw, x: wall === 0 || wall === 2 ? c : wall === 1 ? X0 : -X0, y: wall === 0 ? Y1 : wall === 2 ? -Y0 : c,
})));
// the holes in the ceiling that sand falls through (an oculus, and two cracks), and the heaps under them
export const CONES = [[-0.4, 0.3], [0.8525, 0.3325], [-0.8, 0.475]];
export const DRAIN = CONES[0];                                   // where the floor gives way, right under the main stream: the room is an hourglass's neck

const wallSd = (list) => list.map(([c, hw, z0, z1, arch]) => `sdWin(q, ${f(c)}, ${f(hw)}, ${f(z0)}, ${f(z1)}, ${f(arch)})`).reduce((a, b) => `min(${a}, ${b})`);
const wallBars = (list) => list.filter((o) => o[5]).map(([c, hw, z0, z1, arch]) => `max(sdWin(q, ${f(c)}, ${f(hw)}, ${f(z0)}, ${f(z1)}, ${f(arch)}), sdBars(q, ${f(c)}, ${f(z0)}))`).reduce((a, b) => `min(${a}, ${b})`, '1.0');

export const COMMON = `
const float X0 = ${f(X0)}, Y0 = ${f(Y0)}, Y1 = ${f(Y1)}, HH = ${f(HH)}, TT = ${f(TT)}, ZB = ${f(ZB)};
const vec2 RU = vec2(${f(Math.cos(AZ))}, ${f(Math.sin(AZ))}), RV = vec2(${f(-Math.sin(AZ))}, ${f(Math.cos(AZ))});
const vec3 RO = vec3(0.042, 0.0, ${f(FLOOR)});
uniform vec3 uSunR, uSunCol, uAmb, uBounce, uFogC, uEyeR, uKick, uDrain;
uniform vec4 uDrop, uBank, uDriftA;
uniform vec3 uFan[${NF}], uCone[3];
uniform vec2 uSeedV;
uniform float uSink, uRoof, uOpen, uFogK, uFade, uT, uFlowT;
vec3 toRoom(vec3 P) { vec2 d = P.xy - RO.xy; return vec3(dot(d, RU), dot(d, RV), P.z - RO.z); }
vec3 toWorld(vec3 r) { return vec3(RO.xy + RU * r.x + RV * r.y, RO.z + r.z); }
vec3 dirToRoom(vec3 d) { return vec3(dot(d.xy, RU), dot(d.xy, RV), d.z); }
float h21(vec2 p) { p = fract(p * vec2(123.34, 456.21)); p += dot(p, p + 45.32); return fract(p.x * p.y); }
float vn(vec2 p) { vec2 i = floor(p), f = fract(p); f = f * f * (3.0 - 2.0 * f); return mix(mix(h21(i), h21(i + vec2(1, 0)), f.x), mix(h21(i + vec2(0, 1)), h21(i + vec2(1, 1)), f.x), f.y); }
float ign(vec2 p) { return fract(52.9829189 * fract(dot(p, vec2(0.06711056, 0.00583715)))); }
float smax(float a, float b, float k) { float h = clamp(0.5 + 0.5 * (a - b) / k, 0.0, 1.0); return mix(b, a, h) + k * h * (1.0 - h); }
// the picture's curve: straight up to the highlights, then a soft shoulder; and the world's presence (fade)
vec3 finish(vec3 c) { c *= uFade; vec3 s = 0.72 + 0.28 * (1.0 - exp(-(c - 0.72) / 0.28)); c = mix(c, s, step(0.72, c)); return pow(max(c, 0.0), vec3(0.4545)); }
vec3 fogged(vec3 c, float dist) { return mix(c, uFogC, 1.0 - exp(-dist * uFogK)); }

// the openings: signed distance in a wall's own plane, q = (along the wall, up the wall), negative in a hole
float sdWin(vec2 q, float c, float hw, float z0, float z1, float arch) {
  vec2 d = vec2(abs(q.x - c) - hw, max(z0 - q.y, q.y - (z1 - hw * arch)));
  float box = max(d.x, d.y);
  return arch > 0.5 ? min(box, length(q - vec2(c, z1 - hw)) - hw) : box;
}
float sdBars(vec2 q, float c, float z0) { return min(abs(q.x - c) - 0.006, abs(mod(q.y - z0, 0.16) - 0.08) - 0.006); }
float sdSeg(vec2 p, vec2 a, vec2 b, float r) { vec2 pa = p - a, ba = b - a; return length(pa - ba * clamp(dot(pa, ba) / dot(ba, ba), 0.0, 1.0)) - r; }
float sdWall(int id, vec2 q) {
  if (id == 0) return ${wallSd(OPENINGS[0])};
  if (id == 1) return ${wallSd(OPENINGS[1])};
  if (id == 2) return ${wallSd(OPENINGS[2])};
  return ${wallSd(OPENINGS[3])};
}
float barsWall(int id, vec2 q) {
  if (id == 0) return ${wallBars(OPENINGS[0])};
  if (id == 1) return ${wallBars(OPENINGS[1])};
  if (id == 2) return ${wallBars(OPENINGS[2])};
  return ${wallBars(OPENINGS[3])};
}
float sdCeil(vec2 c) {
  return min(length(c - vec2(${f(CONES[0][0])}, ${f(CONES[0][1])})) - 0.12, min(sdSeg(c, vec2(0.3, -0.9), vec2(0.95, 0.55), 0.013), sdSeg(c, vec2(-1.05, 0.1), vec2(-0.55, 0.85), 0.011)));
}
// does the sun reach this point (room space)? Inside, the ray to the sun leaves through one wall or the ceiling:
// it is lit if it leaves through a hole. The edge softens with the distance to the hole, like a real penumbra.
float sunVis(vec3 r) {
  vec3 S = uSunR;
  if (S.z <= 0.002) return 0.0;
  float sd = max(abs(r.x) - X0, max(r.y - Y1, -Y0 - r.y)), vis;
  if (sd < 0.0) {
    float tx = ((S.x > 0.0 ? X0 : -X0) - r.x) / (abs(S.x) > 1e-4 ? S.x : 1e-4);
    float ty = ((S.y > 0.0 ? Y1 : -Y0) - r.y) / (abs(S.y) > 1e-4 ? S.y : 1e-4);
    float tw = min(tx, ty); vec3 e = r + S * tw; vec2 q; int id;
    if (tx < ty) { id = S.x > 0.0 ? 1 : 3; q = vec2(e.y, e.z + uSink + (S.x > 0.0 ? uDrop.y : uDrop.w)); }
    else { id = S.y > 0.0 ? 0 : 2; q = vec2(e.x, e.z + uSink + (S.y > 0.0 ? uDrop.x : uDrop.z)); }
    if (q.y > HH) {                                                   // over the top of that wall: through the roof
      float tc = (HH - uSink - r.z) / S.z, pen = 0.003 + 0.007 * tc;
      vis = tc > tw ? 1.0 : max(uRoof, smoothstep(pen, -pen, sdCeil(r.xy + S.xy * tc)));
    } else {
      float pen = 0.003 + 0.007 * tw;
      vis = smoothstep(pen, -pen, max(sdWall(id, q), -barsWall(id, q)));
    }
  } else {                                                            // outside: the building's own shadow
    vec2 inv = 1.0 / vec2(abs(S.x) > 1e-4 ? S.x : 1e-4, abs(S.y) > 1e-4 ? S.y : 1e-4);
    vec2 ta = (vec2(-X0 - TT, -Y0 - TT) - r.xy) * inv, tb = (vec2(X0 + TT, Y1 + TT) - r.xy) * inv;
    vec2 mn = min(ta, tb), mx = max(ta, tb);
    float t0 = max(max(mn.x, mn.y), 0.0), t1 = min(mx.x, mx.y);
    float top = HH - uSink - min(min(uDrop.x, uDrop.y), min(uDrop.z, uDrop.w));
    vis = t1 > t0 && r.z + S.z * t0 < top ? uRoof : 1.0;
  }
  return vis * smoothstep(0.0, 0.1, S.z);
}

// the sand's height above the floor line (room z): dunes outside, banked up against the walls; inside, drifts along
// the walls, a fan under every opening the dunes have reached, a heap under every stream from the ceiling; flat
// round the deck; a ring running out from the deck on every kick
float dunes(vec2 p) {
  vec2 q = p * 0.17 + uSeedV;
  q += 0.8 * vec2(vn(q * 0.7 + 1.3), vn(q * 0.7 + 5.2));
  float u = fract(q.x + 0.7 * vn(q * 0.9 + 9.1));
  float ridge = -smax(-pow(u / 0.7, 1.35), -(1.0 - u) / 0.3, 0.3);                // a long windward slope, a short slip face, the crest rounded
  return ridge * (0.5 + 0.7 * vn(q * 0.31 + 2.0)) + 0.3 * vn(q * 2.3 + 4.0);
}
// a drift spilling in through an opening: level in the opening, then down to the floor in a smooth toe
float fanH(float top, float l) { float x = clamp(l / (top / 0.4 + 0.12), 0.0, 1.0); return top * (1.0 - x * x * (3.0 - 2.0 * x)); }
float sandH(vec2 p) {
  vec4 d4 = vec4(p.y - Y1, p.x - X0, -Y0 - p.y, -X0 - p.x);
  float sd = max(max(d4.x, d4.y), max(d4.z, d4.w)), rr = length(p);
  float far = smoothstep(0.4, 6.0, mix(sd, rr - 1.6, uOpen));
  float n1 = vn(p * 1.7 + uSeedV * 3.0);
  vec4 w = exp(5.0 * (d4 - sd));
  float bank = dot(uBank, w) / (w.x + w.y + w.z + w.w) * exp(-max(sd, 0.0) / 0.8) * (0.75 + 0.5 * n1);
  float hOut = 0.0;
  if (sd > 0.0 || uOpen > 0.0) hOut = bank + dunes(p) * (mix(0.10, 0.05, uOpen) + far * (0.55 + min(0.012 * rr, 0.9)));
  float h = hOut;
  if (sd < TT) {
    float hIn = dot(uDriftA, exp(min(d4, 0.0) / 0.26)) * (0.5 + 0.9 * n1);
    for (int i = 0; i < ${NF}; i++) if (uFan[i].z > 0.004) hIn = smax(hIn, fanH(uFan[i].z, length(p - uFan[i].xy) * (0.85 + 0.3 * n1)), 0.04);
    for (int i = 0; i < 3; i++) hIn = smax(hIn, uCone[i].z - length(p - uCone[i].xy) * 0.62, 0.03);
    hIn += 0.014 * (vn(p * 4.3 + 7.0) - 0.5);
    h = mix(hOut, mix(hIn, hOut, uOpen), 1.0 - smoothstep(0.01, TT - 0.01, sd));
  }
  h -= uDrain.z * 0.2 * max(0.0, 1.0 - length(p - uDrain.xy) / 0.4);
  h *= smoothstep(0.30, 0.78, rr);
  h += uKick.y * 0.011 * exp(-uKick.x * 3.5) * exp(-pow((rr - 0.26 - 1.5 * uKick.x) / 0.05, 2.0));
  // the sand never buries the camera, nor rises between it and the deck: it parts along the line of sight
  float es = clamp(dot(p - uEyeR.xy, -uEyeR.xy) / max(dot(uEyeR.xy, uEyeR.xy), 1e-4), 0.0, 1.0);
  h = min(h, mix(uEyeR.z, 0.13, es) - ZB - 0.08 + 0.3 * length(p - uEyeR.xy * (1.0 - es)));
  return ZB + h;
}
// light on a surface: the sun where it reaches, the sky's blue in the shade, a warm bounce off the lit sand indoors
vec3 lit(vec3 alb, vec3 n, float vis, float indoors) {
  float in01 = indoors * (1.0 - uRoof);
  return alb * (uSunCol * max(dot(n, uSunR), 0.0) * vis + uAmb * (0.55 + 0.45 * n.z) * (1.0 - 0.5 * in01) + uBounce * (0.7 + 0.3 * in01));
}
`;
