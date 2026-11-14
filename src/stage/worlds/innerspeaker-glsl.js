// Shaders for the Innerspeaker world (innerspeaker.js): the folding valley.
//
// The land is one sheet in "pattern space": a (how many Droste levels out from the deck's ring; the pattern repeats
// every level) and b (the angle across the valley, the river at b = 0). The sheet lies on a cone whose apex F is the
// vanishing point: a point of the sheet at log-distance u = a * P from the deck's ring sits at rho = D * exp(u) from
// F, and everything on it (width, hills, trees) is in units of rho, so scaling the world about F by exp(P) lands it
// on itself. Sliding the pattern along u (uTau) is then an endless zoom.
//   uFold   the sheet rolled up about the valley's axis: 0 a flat valley floor under the deck, 1 a closed tube
//   uTw     each level turned this much further than the one outside it (the spiral)      uRot  the whole pattern turned
//   uKal    the height field mirrored into uKN sectors (the kaleidoscope)
export const RT = 1.3;                 // the tube's radius when fully folded, in units of the cone's radius

export const COMMON = /* glsl */`
#define PI 3.14159265
#define TAU 6.28318531
const float RT = ${RT.toFixed(2)};
uniform vec3 uF, uAx, uE1, uE2, uEye, uC;
uniform float uD, uTanB, uP, uTau, uRot, uTw, uFold, uDz, uHAmp, uKal, uKN, uTime, uTurb, uKick;
uniform vec2 uSeed; uniform vec4 uMe;
float wrapPi(float x) { return mod(x + PI, TAU) - PI; }
float hsh(vec2 p) { vec3 q = fract(vec3(p.xyx) * 0.1031); q += dot(q, q.yzx + 33.33); return fract((q.x + q.y) * q.z); }
// value noise that tiles: per.x cells per level, per.y cells round the valley
float tnoise(vec2 x, vec2 per, float o) {
  vec2 i = floor(x), f = fract(x); f = f * f * (3.0 - 2.0 * f);
  vec2 i0 = mod(i, per) + uSeed + o, i1 = mod(i + 1.0, per) + uSeed + o;
  return mix(mix(hsh(i0), hsh(vec2(i1.x, i0.y)), f.x), mix(hsh(vec2(i0.x, i1.y)), hsh(i1), f.x), f.y);
}
float riverB(float a) { return uMe.x * sin(TAU * (a - 0.5)) + uMe.z * sin(2.0 * TAU * (a - 0.5)); }      // through the middle of every gate
float kfold(float b) { float s = TAU / max(1.0, uKN); return abs(mod(b + 0.5 * s, s) - 0.5 * s); }
float forest(float a, float b) { return tnoise(vec2(a, b / TAU) * vec2(5.0, 26.0), vec2(5.0, 26.0), 91.0); }
// the valley, 0..1: a river bed, flanks rising to a crest opposite it, and once per level a gate: a ridge right
// across the valley, highest in two peaks either side of the notch the river cuts through it
float height(float a, float b) {
  float ad = abs(wrapPi(b - riverB(a)));
  float gate = 0.5 + 0.5 * cos(TAU * (a - 0.5)); gate *= gate * gate;
  float w = mix(0.6, 0.3, gate);
  float t = 1.0 - exp(-ad * ad / (w * w));
  float flank = ad / PI;
  float peaks = gate * (0.5 + 0.5 * exp(-pow((ad - 0.85) / 0.45, 2.0)));
  vec2 x = vec2(a, b / TAU), per = vec2(2.0, 10.0); float n = 0.0, amp = 0.5;
  for (int i = 0; i < 4; i++) { float v = tnoise(x * per, per, float(i) * 17.0); n += amp * (i < 1 ? v : 1.0 - abs(2.0 * v - 1.0)); per *= 2.0; amp *= 0.5; }
  return t * (0.1 + 0.26 * flank * flank + 0.46 * peaks + 0.5 * n * (0.4 + 0.6 * flank));
}
float heightK(float a, float b) { float h = height(a, b); if (uKal > 0.002) h = mix(h, height(a, kfold(b)), uKal); return h; }
// the cross-section, in cone radii: where sheet angle th lies, h above the sheet; n is the sheet's normal there
vec2 xsec(float th, float h, out vec2 n) {
  float f = max(uFold, 0.02), Rc = RT / f, psi = th * f, s = sin(psi), sh = sin(psi * 0.5);
  n = vec2(-s, cos(psi));
  return vec2(Rc * s, -uDz + Rc * 2.0 * sh * sh) + n * h;
}
vec3 lift3(float u, vec2 q) { return uF + uD * exp(u) * (uAx + uTanB * (q.x * uE1 + q.y * uE2)); }
vec3 place(float u, float th, float h) { vec2 n; return lift3(u, xsec(th, h, n)); }
// the ground's height above the sheet (cone radii) at pattern (a, b), which is at (u, th) on the sheet
float surfH(float hN, float a, float b, float u, float th) {
  float h = hN * (1.0 + 0.16 * uKick);
  h += uTurb * 0.03 * sin(TAU * 3.0 * a + 5.0 * b + uTime * 1.6) * smoothstep(0.0, 0.2, h);
  h *= smoothstep(0.3, 1.1, distance(place(u, th, 0.0), uEye));       // hills never swallow the camera
  return h * uHAmp;
}
float surf(float a, float b, float u, float th) { return surfH(heightK(a, b), a, b, u, th); }
// 1 away from the line of sight to the deck, 0 on it: nothing soft hangs in front of the turntable
float clearOf(vec3 p, float r) { vec3 e = uC - uEye; float t = clamp(dot(p - uEye, e) / dot(e, e), 0.0, 1.0); return smoothstep(r, r * 2.0 + 0.15, distance(p, uEye + e * t)); }
`;

export const FOG = /* glsl */`
uniform vec3 cHaze, cGlow; uniform float uFade, uSunK, uFogK, uBolt;
// haze with distance, the glow of the vanishing point down the throat, the far levels lost in the sky
vec3 fogc(vec3 c, vec3 P, float u) {
  vec3 v = P - uEye; float d = length(v); v /= max(d, 1e-4);
  float s = max(dot(v, normalize(uF - uEye)), 0.0);
  vec3 hz = cHaze * (1.0 + uBolt);
  float fin = clamp((0.2 - u) / 3.8, 0.0, 1.0), fout = smoothstep(0.75, 1.95, u);      // every level in, a little paler
  vec3 fc = mix(hz, cGlow, fin * (0.2 + 0.5 * uSunK)) + cGlow * pow(s, 24.0) * 0.1 * uSunK;
  float f = 1.0 - (1.0 - pow(fin, 1.4)) * (1.0 - fout) * exp(-d * uFogK);
  return mix(hz, mix(c, fc, f), uFade);
}
`;

export const LAND_VS = COMMON + /* glsl */`
varying vec2 vAB; varying float vU, vH, vSl, vTh; varying vec3 vN, vNs, vP;
void main() {
  float u = position.x, th = position.y, A = u / uP, e = 0.014;
  float a = A - uTau, b = th - uTw * A + uRot;
  float h = surf(a, b, u, th);
  vec2 n2; vec3 P = lift3(u, xsec(th, h, n2));
  float A1 = (u + e) / uP;
  vec3 Pu = place(u + e, th, surf(A1 - uTau, th - uTw * A1 + uRot, u + e, th));
  vec3 Pt = place(u, th + e, surf(a, b + e, u, th + e));
  vec3 N = normalize(cross(Pu - P, Pt - P)), Ns = normalize(n2.x * uE1 + n2.y * uE2);
  vAB = vec2(a, b); vU = u; vTh = th; vH = h / max(uHAmp, 1e-4); vN = N; vNs = Ns; vP = P; vSl = 1.0 - max(dot(N, Ns), 0.0);
  gl_Position = projectionMatrix * viewMatrix * vec4(P, 1.0);
}`;

export const LAND_FS = COMMON + FOG + /* glsl */`
uniform vec3 cG1, cG2, cFo, cRock, cCap, cWater, cAmb, cLit, cHor;
uniform float uSunEl, uSpark, uFlowT, uPulse, uLine; uniform vec4 uRing;
varying vec2 vAB; varying float vU, vH, vSl, vTh; varying vec3 vN, vNs, vP;
void main() {
  float a = vAB.x, b = vAB.y, bk = kfold(b);
  // the sheet's two edges are a skyline, not a ruled line (until they meet overhead)
  float sk = tnoise(vec2(a * 6.0, vTh > 0.0 ? 0.5 : 2.5), vec2(6.0, 4.0), 7.0) * 0.6 + tnoise(vec2(a * 24.0, vTh > 0.0 ? 0.5 : 2.5), vec2(24.0, 4.0), 9.0) * 0.4;
  if (abs(vTh) > PI - 0.34 * sk * (1.0 - smoothstep(0.86, 0.99, uFold))) discard;
  float ad = abs(wrapPi(b - riverB(a)));
  if (uKal > 0.002) ad = mix(ad, abs(wrapPi(bk - riverB(a))), uKal);
  float bb = uKal > 0.5 ? bk : b;
  vec2 x = vec2(a, bb / TAU);
  float n1 = tnoise(x * vec2(16.0, 80.0), vec2(16.0, 80.0), 51.0), n2 = tnoise(x * vec2(64.0, 320.0), vec2(64.0, 320.0), 77.0);
  float fo = forest(a, bb);
  // the ground: meadow, forest floor, rock where it is steep (in strata), a pale cap on the peaks
  vec3 c = mix(cG1, cG2, clamp(n1 * 0.6 + vH * 1.1 - 0.1, 0.0, 1.0));
  c = mix(c, cFo, smoothstep(0.4, 0.58, fo) * 0.8 * (1.0 - smoothstep(0.55, 0.75, vH)));
  float rocky = smoothstep(0.2, 0.46, vSl + (n2 - 0.5) * 0.16);
  c = mix(c, cRock * (0.82 + 0.3 * n2) * (0.9 + 0.1 * sin(vH * 70.0 + n1 * 5.0)), rocky);
  c = mix(c, cCap, smoothstep(0.6, 0.78, vH + (n1 - 0.5) * 0.22));
  // light: the sun is down the valley, at the vanishing point, and the sky is whatever the sheet faces
  vec3 N = normalize(vN), Ns = normalize(vNs), L = normalize(-uAx * (1.0 - uSunEl) + Ns * (uSunEl + 0.3)), vd = normalize(vP - uEye);
  // fine relief the mesh is too coarse to carry, from the noise's screen-space slope
  float bh = (n1 * 0.6 + n2 * 0.4) * (0.3 + 0.7 * rocky) * 0.05 * distance(vP, uF) * uTanB;
  vec3 sS = dFdx(vP), sT = dFdy(vP), r1 = cross(sT, N), r2 = cross(N, sS); float det = dot(sS, r1);
  N = normalize(abs(det) * N - sign(det) * (dFdx(bh) * r1 + dFdy(bh) * r2));
  float dif = max(dot(N, L), 0.0), hemi = 0.5 + 0.5 * dot(N, Ns);
  // contour lines, like a map of itself
  float cx = vH * 13.0, cw = fwidth(cx), cl = (1.0 - smoothstep(0.6 + uLine, 1.6 + uLine * 1.5, abs(fract(cx - 0.5) - 0.5) / max(cw, 1e-5))) * (1.0 - smoothstep(0.2, 0.45, cw));
  c *= (1.0 + 0.07 * (mod(floor(cx), 2.0) * 2.0 - 1.0)) * (1.0 - 0.28 * cl);
  vec3 col = c * (cAmb * (0.45 + 0.55 * hemi) + cLit * (0.08 + dif * 0.95));
  col += cLit * c * pow(1.0 - abs(dot(N, vd)), 3.0) * 0.5 * smoothstep(-0.3, 0.4, dot(N, L));      // light catching the ridgelines
  col *= 0.72 + 0.28 * smoothstep(0.0, 0.3, vH);                        // the valley floor sits in shade
  col += cGlow * cl * uLine * (0.55 + 0.45 * sin(vH * 9.0 - uFlowT * 1.5 + a * TAU));     // in the dark the contours are lit: a map of itself in neon
  vec3 dC = vP - uC; float under = -dot(dC, uE2);                    // the turntable's shadow on the land under it
  col *= 1.0 - 0.36 * smoothstep(0.44, 0.2, length(dC + uE2 * under)) * smoothstep(0.02, 0.25, under) * (1.0 - smoothstep(0.75, 1.5, under));
  // the river: the sky in it, the sun's path on it, glitter running downstream
  float wr = 0.07, wm = smoothstep(wr, wr * 0.65, ad);
  if (wm > 0.0) {
    vec3 toF = normalize(uF - vP);
    float fr = pow(1.0 - max(dot(-vd, Ns), 0.0), 3.0);
    float rip = tnoise(vec2(a * 48.0 + uFlowT * 2.0, ad * 60.0), vec2(48.0, 4096.0), 13.0);
    float gl = pow(max(dot(reflect(vd, normalize(Ns + (rip - 0.5) * 0.35 * uAx)), toF), 0.0), 30.0);
    float tw = smoothstep(0.86 - 0.08 * uSpark, 0.95, tnoise(vec2(a * 420.0 + uFlowT * 9.0, ad * 150.0), vec2(420.0, 4096.0), 29.0));
    vec3 wc = mix(cWater * (0.75 + 0.25 * rip), cHor, 0.3 + 0.6 * fr) + cLit * (gl * (0.25 + 0.45 * uSunK) + tw * uSpark * 0.5);
    col = mix(col, wc, wm);
  }
  col = mix(col, col * 0.72 + cG2 * 0.1, smoothstep(wr * 2.4, wr, ad) * (1.0 - wm));   // the wet bank
  // each kick sends a ring of light down the valley into the vanishing point
  float ring = 0.0;
  for (int i = 0; i < 4; i++) { float ur = 0.35 - uRing[i] * 2.2; ring += exp(-pow((vU - ur) / 0.1, 2.0)) * exp(-uRing[i] * 1.3); }
  col += (cLit * 0.5 + c * 0.9) * ring * uPulse * 0.8;
  gl_FragColor = vec4(fogc(col, vP, vU), 1.0);
}`;

// trees: one blob each, the same few thousand on every level, standing where the forest noise says
export const TREE_VS = COMMON + /* glsl */`
attribute vec4 aI; attribute vec3 aJ;       // aI: a, b, level, random    aJ: size, colour, stretch
uniform vec3 cT1, cT2, cT3, cAmb, cLit; uniform float uSunEl, uLo, uHi, uSway;
varying vec3 vCol, vP; varying float vU;
void main() {
  float a = aI.x, b = aI.y, A = a + aI.z + uTau, u = A * uP;
  float th = wrapPi(b + uTw * A - uRot);
  float hN = heightK(a, b), bk = uKal > 0.5 ? kfold(b) : b;
  float ad = abs(wrapPi(bk - riverB(a)));
  float keep = step(0.44 + 0.2 * aI.w, forest(a, bk)) * smoothstep(0.04, 0.1, hN) * (1.0 - smoothstep(0.55, 0.7, hN)) * smoothstep(0.11, 0.17, ad);
  keep *= smoothstep(uLo, uLo + 0.5, A) * (1.0 - smoothstep(uHi - 0.5, uHi, A));
  vec2 n2; vec3 base = lift3(u, xsec(th, surfH(hN, a, b, u, th), n2));
  vec3 up = normalize(n2.x * uE1 + n2.y * uE2), t1 = n2.y * uE1 - n2.x * uE2;
  float r = (0.012 + 0.011 * aJ.x) * uD * exp(u) * uTanB * keep, st = 1.15 + 1.1 * aJ.z;
  vec3 lp = position;
  vec3 off = t1 * lp.x + uAx * lp.y + up * (lp.z * st + st * 0.7);
  off += t1 * sin(uTime * 2.6 + aI.w * 40.0) * 0.22 * uSway * (lp.z + 1.0);
  vec3 P = base + off * r;
  vec3 N = normalize(t1 * lp.x + uAx * lp.y + up * lp.z / st), L = normalize(-uAx * (1.0 - uSunEl) + up * (uSunEl + 0.3));
  vec3 c = aJ.y < 0.42 ? cT1 : (aJ.y < 0.78 ? cT2 : cT3);
  c *= 0.82 + 0.36 * fract(aJ.y * 17.3);
  float dif = max(dot(N, L), 0.0), hemi = 0.5 + 0.5 * dot(N, up);
  vCol = c * (cAmb * (0.55 + 0.45 * hemi) + cLit * (0.25 + dif * 0.8)) * (0.7 + 0.3 * smoothstep(-1.0, 0.5, lp.z));
  vP = P; vU = u;
  gl_Position = projectionMatrix * viewMatrix * vec4(P, 1.0);
}`;
const FOGU = 'uniform vec3 uF, uEye;\n' + FOG;
export const TREE_FS = FOGU + /* glsl */`
varying vec3 vCol, vP; varying float vU;
void main() { gl_FragColor = vec4(fogc(vCol, vP, vU), 1.0); }`;

// clouds: soft puffs in clusters, hanging in the valley and carried along with it
export const CLOUD_VS = COMMON + /* glsl */`
attribute vec4 aI; attribute vec4 aJ; attribute vec3 aK;      // aI: a, b, level, random   aJ: lift, size, -, -   aK: this puff's offset in its cluster
uniform float uLo, uHi, uCloud, uCloudT, uAlt;
varying vec2 vUv; varying vec3 vP; varying float vU, vA, vR;
void main() {
  float a0 = aI.x + uCloudT * (0.4 + 0.6 * aI.w), a = fract(a0), A = a + aI.z + uTau, u = A * uP + aK.y * 0.12;
  float th = wrapPi(aI.y + uTw * A - uRot + aK.x * 0.11);
  vec2 n2; vec2 q = xsec(th, aJ.x + aK.z * 0.09, n2);
  q *= max(1.0, 0.62 / max(length(q), 1e-3));                      // clear of the deck's own air
  vec3 ctr = lift3(u, q);
  float sz = aJ.y * uD * exp(u) * uTanB * (1.0 + 0.1 * sin(uTime * 0.4 + aI.w * 30.0)) * (1.0 + 1.6 * uAlt);      // from high up it is a deck of cloud
  vec3 rt = vec3(viewMatrix[0][0], viewMatrix[1][0], viewMatrix[2][0]), upv = vec3(viewMatrix[0][1], viewMatrix[1][1], viewMatrix[2][1]);
  vec3 P = ctr + (rt * position.x + upv * position.y) * sz;
  float show = step(aI.w, uCloud * 1.15 + uAlt) * smoothstep(-2.6, -1.3, A) * (1.0 - smoothstep(uHi - 0.6, uHi, A));
  vA = show * clearOf(ctr, sz + 0.28) * smoothstep(sz * 0.6 + 0.3, sz * 1.5 + 1.0, distance(ctr, uEye));
  vUv = position.xy; vP = ctr; vU = u; vR = aI.w;
  gl_Position = vA > 0.001 ? projectionMatrix * viewMatrix * vec4(P, 1.0) : vec4(2.0, 2.0, 2.0, 1.0);
}`;
export const CLOUD_FS = FOGU + /* glsl */`
uniform vec3 cCl, cCs;
varying vec2 vUv; varying vec3 vP; varying float vU, vA, vR;
float ch(vec2 p) { p = fract(p * vec2(123.34, 456.21)); p += dot(p, p + 45.32); return fract(p.x * p.y); }
void main() {
  float r2 = dot(vUv, vUv); if (r2 > 1.0) discard;
  vec2 q = vUv * 2.3 + vR * 37.0; vec2 qi = floor(q), qf = fract(q); qf = qf * qf * (3.0 - 2.0 * qf);
  float n = mix(mix(ch(qi), ch(qi + vec2(1, 0)), qf.x), mix(ch(qi + vec2(0, 1)), ch(qi + vec2(1, 1)), qf.x), qf.y);
  float al = smoothstep(0.0, 0.55, (1.0 - r2) * (0.55 + 0.9 * n)) * vA * 0.62;
  vec3 c = mix(cCs, cCl, clamp(0.72 + 0.42 * vUv.y - 0.2 * r2 + 0.25 * (n - 0.5), 0.0, 1.0));
  gl_FragColor = vec4(fogc(c, vP, vU * 0.55), al);
}`;

// leaves (or seed fluff, or rain): small tumbling quads that outrun the land
export const MOTE_VS = COMMON + /* glsl */`
attribute vec4 aI; attribute vec4 aJ;       // aI: a, b, level, random   aJ: lift, size, phase, colour
uniform vec3 cM1, cM2, cM3, cHaze; uniform float uLo, uHi, uLeaves, uMoteT, uRain, uGlint;
varying vec2 vUv; varying vec3 vCol, vP; varying float vU;
void main() {
  float a = fract(aI.x + uMoteT * (0.5 + aJ.z)), A = a + aI.z + uTau, u = A * uP;
  float lift = mix(aJ.x + 0.05 * sin(uTime * (0.6 + aJ.z) + aI.w * 40.0), fract(aJ.x - uTime * (0.9 + 0.5 * aI.w)) * 1.25, uRain);
  float th = wrapPi(aI.y + uTw * A - uRot + 0.07 * sin(uTime * 0.5 + aI.w * 63.0));
  vec2 n2; vec2 q = xsec(th, lift, n2);
  q *= max(1.0, 0.24 / max(length(q), 1e-3));
  vec3 ctr = lift3(u, q);
  float sz = (0.007 + 0.011 * aJ.y) * uD * exp(u) * uTanB;
  vec3 rt = vec3(viewMatrix[0][0], viewMatrix[1][0], viewMatrix[2][0]), upv = vec3(viewMatrix[0][1], viewMatrix[1][1], viewMatrix[2][1]);
  float tumble = cos(uTime * (2.0 + 4.0 * aJ.z) + aI.w * 50.0), ang = aJ.z * TAU + uTime * (1.0 + 2.5 * aI.w);
  vec2 down = normalize(vec2(dot(uE2, rt), dot(uE2, upv)) + 1e-4);
  vec2 c = position.xy * mix(vec2(0.55 * (0.25 + 0.75 * abs(tumble)), 1.0), vec2(0.07, 3.2), uRain);
  float ca = cos(ang), sa = sin(ang);
  vec2 cr = mix(vec2(c.x * ca - c.y * sa, c.x * sa + c.y * ca), c.x * vec2(down.y, -down.x) + c.y * down, uRain);
  float show = step(aI.w, uLeaves) * smoothstep(uLo, uLo + 0.5, A) * (1.0 - smoothstep(uHi - 0.5, uHi, A)) * smoothstep(0.4, 0.9, distance(ctr, uEye));
  vec3 P = ctr + (rt * cr.x + upv * cr.y) * sz * show;
  vec3 col = aJ.w < 0.4 ? cM1 : (aJ.w < 0.75 ? cM2 : cM3);
  vCol = mix(col * (0.8 + 0.35 * tumble * tumble + uGlint * step(0.92, abs(tumble))), cHaze * 1.25 + 0.15, uRain);
  vUv = position.xy; vP = ctr; vU = u;
  gl_Position = projectionMatrix * viewMatrix * vec4(P, 1.0);
}`;
export const MOTE_FS = FOGU + /* glsl */`
varying vec2 vUv; varying vec3 vCol, vP; varying float vU;
void main() {
  if (abs(vUv.x) * 0.9 + vUv.y * vUv.y > 1.0) discard;
  gl_FragColor = vec4(fogc(vCol, vP, vU * 0.7), 1.0);
}`;

export const SKY_VS = /* glsl */`varying vec3 vD; void main() { vD = position; gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); gl_Position.z = gl_Position.w * 0.99999; }`;
export const SKY_FS = /* glsl */`
uniform vec3 uF, uEye, uAx, uE1, uE2, cTop, cHor, cLow, cSun, cGlow, cCl, cCs;
uniform float uSunK, uStar, uCloud, uSkyT, uTime, uBolt, uFade;
varying vec3 vD;
float h21(vec2 p) { p = fract(p * vec2(123.34, 456.21)); p += dot(p, p + 45.32); return fract(p.x * p.y); }
float vn(vec2 p) { vec2 i = floor(p), f = fract(p); f = f * f * (3.0 - 2.0 * f); return mix(mix(h21(i), h21(i + vec2(1, 0)), f.x), mix(h21(i + vec2(0, 1)), h21(i + vec2(1, 1)), f.x), f.y); }
float fbm(vec2 p) { float s = 0.0, a = 0.5; for (int i = 0; i < 4; i++) { s += a * vn(p); p = p * 2.03 + 7.1; a *= 0.5; } return s; }
void main() {
  vec3 d = normalize(vD), dF = normalize(uF - uEye);
  float el = dot(d, uE2) - dot(dF, uE2);                             // the horizon runs through the vanishing point
  vec3 c = el > 0.0 ? mix(cHor, cTop, pow(min(1.0, el * 1.2), 0.6)) : mix(cHor, cLow, pow(min(1.0, -el * 2.2), 0.55));
  if (el > 0.0 && uCloud > 0.01) {                                   // a deck of cloud overhead, sliding with the zoom
    vec2 q = vec2(dot(d, uE1), dot(d, uAx)) / (el + 0.16);
    float n = fbm(q * 0.9 + vec2(0.0, uSkyT)), n2 = fbm(q * 2.3 + 3.0 - vec2(0.0, uSkyT * 1.4));
    float m = smoothstep(0.62 - 0.22 * uCloud, 0.86, n * 0.75 + n2 * 0.4) * smoothstep(0.0, 0.14, el);
    c = mix(c, mix(cCs, cCl, smoothstep(0.35, 0.8, n2)), m * 0.9);
  }
  if (uStar > 0.01) {
    vec2 g = vec2(atan(d.y, d.x) * 60.0, d.z * 90.0), ci = floor(g); float h = h21(ci);
    if (h > 0.9) c += vec3(0.9, 0.95, 1.0) * smoothstep(0.12, 0.0, length(fract(g) - 0.3 - 0.4 * vec2(h21(ci + 3.1), h21(ci + 7.7)))) * (h - 0.9) * 10.0 * uStar * (0.6 + 0.4 * sin(uTime * (1.0 + h * 3.0) + h * 40.0));
  }
  float s = max(dot(d, dF), 0.0);
  c += cSun * (smoothstep(0.99935, 0.9997, s) * uSunK + pow(s, 260.0) * 0.45 * uSunK) + cGlow * pow(s, 12.0) * (0.06 + 0.2 * uSunK);
  c *= 1.0 + uBolt * 0.8;
  gl_FragColor = vec4(c * mix(0.75, 1.0, uFade), 1.0);
}`;

// the echo: the deck again at every level, smaller toward the vanishing point (and vast, behind the viewer)
export const ECHO_VS = COMMON + /* glsl */`
attribute float aN; attribute vec2 aC;      // aN: the level (1 = one level in); aC: grey, label
uniform vec3 cLabel, cAmb, cLit, uTwinAt; uniform float uEcho, uEchoN, uTwin;
varying vec3 vCol, vP, vL; varying float vU;
void main() {
  bool twin = aN > 50.0; float n = twin ? 1.0 : aN, tk = smoothstep(0.0, 1.0, uTwin);
  float sc = exp(-uP * n), show = twin ? step(0.002, uTwin) : smoothstep(0.0, 1.0, uEcho * uEchoN - (abs(n) - 1.0));
  vec3 ctr = uF + uD * sc * uAx + vec3(0.0, 0.0, 0.012 * sc * sin(uTime * 0.7 + aN * 1.9));
  if (twin) { sc = mix(sc, 0.86, tk); ctr = mix(ctr, uTwinAt + vec3(0.0, 0.0, 0.02 * sin(uTime * 0.9)), tk); }      // the one out of the fold, come to sit alongside
  vec3 P = ctr + (position - uC) * sc * show;
  vec3 L = normalize(vec3(-0.3, -0.45, 0.85));
  vec3 base = mix(twin ? vec3(0.8, 0.86, 0.94) - aC.x * 1.6 : vec3(aC.x), twin ? vec3(0.76, 0.25, 0.17) : cLabel, aC.y);      // the twin is the deck in negative
  vCol = base * (cAmb * (0.55 + 0.45 * normal.z) + cLit * (0.2 + 0.8 * max(dot(normal, L), 0.0)));
  vP = P; vU = twin ? -uP * (1.0 - tk) : -uP * aN; vL = vec3(position.xy, position.z > -0.0015 && normal.z > 0.5 ? 1.0 : 0.0);
  gl_Position = show > 0.001 ? projectionMatrix * viewMatrix * vec4(P, 1.0) : vec4(2.0, 2.0, 2.0, 1.0);
}`;
export const ECHO_FS = FOGU + /* glsl */`
varying vec3 vCol, vP, vL; varying float vU;
void main() {
  float r = length(vL.xy), top = vL.z * step(0.052, r) * step(r, 0.15);        // the record: grooves, and the sheen across them
  vec3 c = vCol * (1.0 + top * (0.25 * sin(r * 1400.0) + 1.6 * pow(abs(sin(atan(vL.y, vL.x) + 0.5)), 10.0)));
  gl_FragColor = vec4(fogc(c, vP, vU), 1.0);
}`;

// houses, and a city: boxes with roofs on the low ground by the river; past town = 0.5 they grow into towers
export const HOUSE_VS = COMMON + /* glsl */`
attribute vec4 aI; attribute vec3 aJ; attribute float aR;      // aI: a, b, level, random   aJ: size, tint, turn   aR: 1 on the roof
uniform vec3 cWall, cRoof, cAmb, cLit; uniform float uSunEl, uLo, uHi, uTown;
varying vec3 vCol, vP, vL; varying float vU, vWin;
void main() {
  float a = aI.x, b = aI.y, A = a + aI.z + uTau, u = A * uP;
  float th = wrapPi(b + uTw * A - uRot);
  float hN = heightK(a, b), bk = uKal > 0.5 ? kfold(b) : b, ad = abs(wrapPi(bk - riverB(a)));
  float city = smoothstep(0.5, 1.0, uTown), cl = tnoise(vec2(a, bk / TAU) * vec2(3.0, 14.0), vec2(3.0, 14.0), 131.0);
  float keep = step(aI.w, min(1.0, uTown * 2.0) * smoothstep(0.32, 0.55, cl + 0.2 * city)) * (1.0 - smoothstep(0.24, 0.36, hN)) * smoothstep(0.1, 0.15, ad);
  keep *= smoothstep(uLo, uLo + 0.5, A) * (1.0 - smoothstep(uHi - 0.5, uHi, A));
  vec2 n2; vec3 base = lift3(u, xsec(th, surfH(hN, a, b, u, th), n2));
  vec3 up = normalize(n2.x * uE1 + n2.y * uE2), t1 = n2.y * uE1 - n2.x * uE2;
  float r = (0.013 + 0.008 * aJ.x) * uD * exp(u) * uTanB * keep;
  float tall = 1.0 + city * (0.6 + 7.0 * aJ.x * aJ.x * smoothstep(0.45, 0.8, cl));
  float ang = floor(aJ.z * 4.0) * 1.5708 + (aJ.z - 0.5) * 0.3 * (1.0 - city), ca = cos(ang), sa = sin(ang);
  vec3 lp = position; lp.z = aR > 0.5 ? 1.2 * tall + (lp.z - 1.2) * (1.0 - 0.85 * city) : lp.z * tall;
  vec3 P = base + (t1 * (lp.x * ca - lp.y * sa) + uAx * (lp.x * sa + lp.y * ca) + up * lp.z) * r;
  vec3 N = normalize(t1 * (normal.x * ca - normal.y * sa) + uAx * (normal.x * sa + normal.y * ca) + up * normal.z), L = normalize(-uAx * (1.0 - uSunEl) + up * (uSunEl + 0.3));
  vec3 c = aR > 0.5 ? mix(cRoof * (0.8 + 0.4 * aJ.y), cWall * 0.55, city) : cWall * (0.78 + 0.3 * aJ.y);
  vCol = c * (cAmb * (0.55 + 0.45 * max(dot(N, up), 0.0)) + cLit * (0.2 + 0.8 * max(dot(N, L), 0.0)));
  vL = vec3(position.xy, lp.z); vWin = aR < 0.5 && abs(normal.z) < 0.5 ? 1.0 : 0.0; vP = P; vU = u;
  gl_Position = keep > 0.001 ? projectionMatrix * viewMatrix * vec4(P, 1.0) : vec4(2.0, 2.0, 2.0, 1.0);
}`;
export const HOUSE_FS = FOGU + /* glsl */`
uniform vec3 cLit; uniform float uWin;
varying vec3 vCol, vP, vL; varying float vU, vWin;
void main() {
  float w = vWin * step(0.5, fract(vL.z * 2.0 + 0.25)) * step(0.4, fract((vL.x + vL.y) * 1.6 + 0.2));
  vec3 c = mix(vCol, vCol * 0.5, w * (1.0 - uWin)) + cLit * w * uWin;
  gl_FragColor = vec4(fogc(c, vP, vU), 1.0);
}`;
