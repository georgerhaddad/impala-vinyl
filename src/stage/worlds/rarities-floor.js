// The sheet the deck stands on, and the void around it (shaders for worlds/rarities.js).
// The floor is paper, and everything on it is drawn: a spiral the lathe scribes outward from the deck as the song
// plays (its wiggle is the music, kept in a texture as it is heard), a degree ring, the run-out etching, register
// marks, a printer's control strip that is also a level meter and a sweep. Two songs turn it into other drawings:
// a clock face (dial) and a sea chart (sea).
export const FLOORZ = -0.08, RIN = 0.66, ROUT = 2.3;

export const COMMON = `
#define TAU 6.2831853
#define FLOORZ ${FLOORZ.toFixed(3)}
uniform vec4 uSwell;       // swell height (m), its clock, distance travelled (m), how much of a sea it is
uniform vec2 uHeading;     // which way the deck is travelling
float h11(float n) { return fract(sin(n * 127.1) * 43758.5453); }
float h21(vec2 p) { p = fract(p * vec2(123.34, 456.21)); p += dot(p, p + 45.32); return fract(p.x * p.y); }
float vn(vec2 p) { vec2 i = floor(p), f = fract(p); f = f * f * (3.0 - 2.0 * f); return mix(mix(h21(i), h21(i + vec2(1, 0)), f.x), mix(h21(i + vec2(0, 1)), h21(i + vec2(1, 1)), f.x), f.y); }
// the sheet heaving like water (0 unless a song asks); flat under the deck itself
float swell(vec2 p) {
  if (uSwell.x <= 0.0) return 0.0;
  vec2 q = p + uHeading * uSwell.z, a = vec2(uHeading.y, -uHeading.x); float t = uSwell.y;
  float w = sin(dot(q, uHeading) * 2.3 + t * 1.1) * 0.55 + sin(dot(q, uHeading * 0.8 + a * 0.6) * 3.9 - t * 0.7) * 0.3 + sin(dot(q, a) * 1.7 + dot(q, uHeading) * 5.3 + t * 1.9) * 0.15;
  return uSwell.x * w * smoothstep(0.45, 1.6, length(p));
}`;

export const FLOOR_VS = `${COMMON}
varying vec3 vW;
void main() {
  vec3 p = position; p.z = FLOORZ + swell(p.xy);
  vW = p;
  gl_Position = projectionMatrix * viewMatrix * vec4(p, 1.0);
}`;

export const FLOOR_FS = `${COMMON}
uniform vec3 uPaper, uHor, uInk, uInk2, uAcc, uShadowC, uL;
uniform float uT, uFade, uGrid, uLathe, uTip, uPitch, uTotal, uRailA, uMarks, uSweep, uSweepT, uStrip, uStripA, uSeed, uInkRed, uKick, uLevel, uBold, uRing;
uniform float uDial, uCourse, uBear, uStroke, uShade, uOar;
uniform vec3 uHands;       // the clock: minute, hour and second hands (radians, clockwise from "twelve")
uniform sampler2D tSong, tAtlas;
uniform vec4 uEtch, uDigits;
varying vec3 vW;
const float RIN = ${RIN.toFixed(3)}, ROUT = ${ROUT.toFixed(3)};

float rbox(vec2 p, vec2 c, vec2 b, float r) { vec2 d = abs(p - c) - b + r; return length(max(d, 0.0)) + min(max(d.x, d.y), 0.0) - r; }
// a drawn line: d is the distance to it and w its half width, both in metres
float ln(float d, float w) { float aa = fwidth(d) * 0.8 + 1e-6; return 1.0 - smoothstep(w - aa, w + aa, abs(d)); }
float seg(vec2 p, vec2 a, vec2 b) { vec2 pa = p - a, ba = b - a; return length(pa - ba * clamp(dot(pa, ba) / dot(ba, ba), 0.0, 1.0)); }

void main() {
  vec2 p = vW.xy; float r = length(p), th = atan(p.y, p.x);
  float dist = length(vW - cameraPosition), px = length(fwidth(p)) * 0.6 + 1e-6;   // px: about a pixel, in metres
  float far = 1.0 - smoothstep(4.0, 26.0, dist);                 // the drawing gives out toward the horizon
  vec2 pg = p + uHeading * uSwell.z;                              // the sheet's own coordinates: it slides under a travelling deck
  float sea = uSwell.w;
  float ink = 0.0, ink2 = 0.0, red = 0.0;
  vec3 col = uPaper * (0.985 + 0.035 * (vn(pg * 41.0) - 0.5) + 0.03 * (vn(pg * 2.3 + 7.0) - 0.5));

  // the deck's shadow: its footprint swept along the light, soft at the far end
  vec2 o = -uL.xy / max(0.14, uL.z) * 0.062;
  float dsh = 1e3;
  for (int i = 0; i < 5; i++) dsh = min(dsh, rbox(p - o * (float(i) * 0.25), vec2(0.0425, 0.0), vec2(0.2275, 0.19), 0.03));
  float sh = (1.0 - smoothstep(-0.012, 0.014 + 0.3 * length(o), dsh)) * 0.62;
  sh = max(sh, (1.0 - smoothstep(-0.07, 0.06, rbox(p, vec2(0.0425, 0.0), vec2(0.2275, 0.19), 0.03))) * 0.55);

  // graph paper: 5 cm squares, heavier every 25 cm
  if (uGrid > 0.001) {
    vec2 g1 = pg / 0.05, g5 = pg / 0.25, w1 = fwidth(g1), w5 = fwidth(g5);
    vec2 f1 = abs(fract(g1 + 0.5) - 0.5), f5 = abs(fract(g5 + 0.5) - 0.5);
    float l1 = max(1.0 - smoothstep(0.0, w1.x * 1.3, f1.x), 1.0 - smoothstep(0.0, w1.y * 1.3, f1.y)) * (1.0 - smoothstep(0.1, 0.35, max(w1.x, w1.y)));
    float l5 = max(1.0 - smoothstep(0.0, w5.x * 1.6, f5.x), 1.0 - smoothstep(0.0, w5.y * 1.6, f5.y)) * (1.0 - smoothstep(0.1, 0.35, max(w5.x, w5.y)));
    ink2 += (l1 * 0.16 + l5 * 0.3) * uGrid;
  }

  // the lathe's spiral, scribed outward from the deck: one turn every few seconds, its wiggle what was playing then
  if (uLathe > 0.001) {
    float af = fract((th - uRailA) / TAU);
    float q = (r - RIN) / uPitch - af, n = floor(q + 0.5), k = n + af;                  // k: turns along the spiral
    float on = step(-0.5, n) * step(k, uTip) * step(r, ROUT + uPitch);
    vec4 hs = texture2D(tSong, vec2(clamp(k / uTotal, 0.0, 1.0), 0.5));
    float amp = mix(0.22 + 0.55 * vn(vec2(k * 2.3, uSeed * 31.0)) * vn(vec2(k * 11.0, 3.0)), hs.r, hs.a);
    float hi = mix(0.25, hs.g, hs.a);
    float ph = k * TAU, fr = 96.0 + 22.0 * floor(uSeed * 4.0);
    float wv = amp * 0.3 * sin(ph * fr + 1.7 * sin(ph * 7.0)) + hi * 0.05 * sin(ph * fr * 3.37);
    float sl = (amp * 0.3 * fr + hi * 0.05 * fr * 3.37) * uPitch / max(r, 0.2) * 0.6;   // about how steep the wiggle gets
    float d = abs(q - n - wv) * uPitch / sqrt(1.0 + sl * sl);
    float hw = (0.0009 + 0.0011 * amp) * uBold;
    float g = 1.0 - smoothstep(hw - px, hw + px, d);
    g = mix(g, min(1.0, 2.0 * hw / uPitch * 1.5), smoothstep(0.3, 0.8, px / uPitch));
    ink += g * on * uLathe * (0.55 + 0.45 * amp);
    // the cutter head, on its arm
    float rt = RIN + uPitch * uTip, ha = uRailA + TAU * uTip;
    vec2 hd = vec2(cos(ha), sin(ha)), hp = hd * rt;
    float al = dot(p, hd), pe = dot(p, vec2(-hd.y, hd.x));
    float arm = ln(pe, 0.0011) * step(0.36, al) * step(al, rt + 0.09);
    float tick = (1.0 - smoothstep(0.0, px * 1.5, abs(fract(al / 0.05 + 0.5) - 0.5) * 0.05)) * step(abs(pe), mod(floor(al / 0.05 + 0.5), 5.0) < 0.5 ? 0.014 : 0.007) * step(0.36, al) * step(al, rt + 0.09);
    ink2 += max(arm, tick) * 0.8 * uLathe;
    float dh = length(p - hp);
    ink += ln(dh - 0.026, 0.0012) * uLathe;
    red += (1.0 - smoothstep(0.009 - px, 0.009 + px, dh)) * uLathe;
    red += ln(dh - (0.03 + 0.07 * uKick), 0.0012) * uKick * uLathe;
    // where the cut may go: the edge of the lacquer, and the lead-in
    ink2 += (ln(r - (ROUT + 0.14), 0.0016) + ln(r - (ROUT + 0.165), 0.0007)) * 0.8 * uLathe;
  }

  // a degree ring round the deck, and the run-out etching inside it
  if (uRing > 0.001) {
    float a5 = th / TAU * 72.0, i5 = floor(a5 + 0.5), da = abs(a5 - i5) / 72.0 * TAU * r;
    float len = mod(i5, 9.0) < 0.5 ? 0.034 : (mod(i5, 3.0) < 0.5 ? 0.02 : 0.011);
    float clockK = step(0.5, uDial);
    ink += (1.0 - smoothstep(0.0009 - px, 0.0009 + px, da)) * step(0.425, r) * step(r, 0.425 + len) * uRing * (1.0 - clockK);
    ink += ln(r - 0.425, 0.0009) * uRing;
    float ev = (r - 0.468) / 0.046;
    vec2 euv = vec2(fract(-th / TAU * 3.0 + uSeed), ev);
    vec4 e = texture2D(tAtlas, vec2(mix(uEtch.x, uEtch.z, euv.x), mix(uEtch.y, uEtch.w, clamp(ev, 0.0, 1.0))), -0.5);
    ink2 += e.a * step(0.0, ev) * step(ev, 1.0) * uRing * (1.0 - clockK) * 0.95;
  }

  // the clock (Patience): the ring becomes a face, sixty ticks and three hands; the deck is its hub
  if (uDial > 0.001) {
    float a60 = th / TAU * 60.0, i60 = floor(a60 + 0.5), da = abs(a60 - i60) / 60.0 * TAU * r;
    float hour = step(mod(i60 + 0.25, 5.0), 0.5);
    float t0 = mix(0.585, 0.555, hour);
    ink += (1.0 - smoothstep(mix(0.0009, 0.0026, hour) - px, mix(0.0009, 0.0026, hour) + px, da)) * step(t0, r) * step(r, 0.615) * uDial;
    ink += ln(r - 0.622, 0.0011) * uDial;
    for (int i = 0; i < 3; i++) {
      float a = i == 0 ? uHands.x : (i == 1 ? uHands.y : uHands.z);
      vec2 hd = vec2(sin(a), cos(a));
      float l1 = i == 0 ? 0.6 : (i == 1 ? 0.5 : 0.615), w = i == 0 ? 0.0028 : (i == 1 ? 0.0052 : 0.0012);
      float dd = seg(p, hd * 0.2, hd * l1);
      float h = 1.0 - smoothstep(w - px, w + px, dd);
      if (i == 2) red += h * uDial; else ink += h * uDial;
    }
  }

  // register marks on a lattice: a target here and there, corner ticks between
  if (uMarks > 0.001) {
    vec2 g = pg / 0.8, id = floor(g + 0.5), f = (g - id) * 0.8;
    float hh = h21(id + uSeed * 17.0), keep = step(hh, uMarks * 0.75) * step(0.7, length(id * 0.8 - (pg - p)));
    float t = max(ln(length(f) - 0.021, 0.0011), max(ln(f.x, 0.0011) * step(abs(f.y), 0.042), ln(f.y, 0.0011) * step(abs(f.x), 0.042)));
    ink += t * keep * 0.9;
    vec2 g2 = pg / 0.8 + 0.5, id2 = floor(g2 + 0.5), f2 = abs((g2 - id2) * 0.8);
    float c = max(ln(f2.x, 0.0009) * step(0.012, f2.y) * step(f2.y, 0.05), ln(f2.y, 0.0009) * step(0.012, f2.x) * step(f2.x, 0.05));
    ink2 += c * step(h21(id2 + 3.0 + uSeed * 5.0), uMarks) * 0.9 * step(0.62, length(id2 * 0.8 - 0.4 - (pg - p)));
  }

  // the control strip, a slip of its own lying over the drawing: a step wedge that fills with the level,
  // then bars that sweep up in pitch
  if (uStrip > 0.001) {
    vec2 sd = vec2(cos(uStripA), sin(uStripA)), st = vec2(-sd.y, sd.x);
    float sy = dot(p, sd) - 0.86, sx = dot(p, st);
    float mask = (1.0 - smoothstep(0.031 - px, 0.031 + px, abs(sy))) * (1.0 - smoothstep(0.66 - px, 0.66 + px, abs(sx))) * uStrip;
    ink *= 1.0 - mask; ink2 *= 1.0 - mask; red *= 1.0 - mask;
    float cx = sx / 0.05 + 12.0, ci = floor(cx);                     // 12 squares to the left of the middle
    vec2 f = vec2(fract(cx) - 0.5, sy / 0.05);
    float box = (max(abs(f.x), abs(f.y)) - 0.36) * 0.05, inb = step(0.0, ci) * step(ci, 11.5), hot = step(9.5, ci);
    float fill = (1.0 - smoothstep(-px, px, box)) * step((ci + 0.5) / 12.0, uLevel), edge = 1.0 - smoothstep(0.0008 - px, 0.0008 + px, abs(box));
    red += max(fill, edge) * inb * hot * uStrip;
    ink += max(fill * (0.4 + 0.6 * ci / 9.0), edge) * inb * (1.0 - hot) * uStrip;
    float u = sx / 0.62;                                             // the sweep, to the right of the middle
    float phs = (u * u * 26.0 + u * 5.0) - uSweepT, wph = px / 0.62 * (52.0 * abs(u) + 5.0) * TAU;
    float bars = mix(smoothstep(-wph, wph, sin(phs * TAU)), 0.5, smoothstep(1.2, 2.6, wph));
    ink += bars * step(0.06, u) * step(u, 1.0) * step(abs(sy), 0.021) * uSweep * uStrip;
    ink2 += (1.0 - smoothstep(0.0008 - px, 0.0008 + px, abs(abs(sy) - 0.031))) * step(abs(sx), 0.66) * uStrip;
  }

  // the sea chart (The Boat I Row): rows of engraved waves sliding under the deck, soundings and their contours,
  // the oars and the rings they leave, the course
  if (sea > 0.001) {
    vec2 hd = uHeading, ac = vec2(hd.y, -hd.x);
    float along = dot(pg, hd), across = dot(pg, ac), sp = 0.062, clear = smoothstep(0.34, 0.5, r);
    // an engraver shades water by the weight of the line: heavy on the faces turned from the light
    vec3 nn = normalize(cross(dFdx(vW), dFdy(vW))); nn *= sign(nn.z + 1e-6);
    float lee = clamp(0.5 - dot(nn.xy, normalize(uL.xy + 1e-5)) * 2.6, 0.0, 1.0);
    float row = along / sp, n = floor(row + 0.5);
    float wvv = 0.24 * sin(across * 34.0 + n * 2.4 + 0.7 * sin(across * 7.0 + n)) + 0.06 * sin(across * 71.0 + n * 5.0);
    float d = abs(row - n - wvv) * sp, wr = fwidth(along) / sp;
    float stroke = smoothstep(0.36 - 0.2 * lee, 0.46 - 0.2 * lee, vn(vec2(across * 3.4 + n * 7.3, n * 1.7)));
    float hw = 0.0008 + 0.0022 * lee * lee;
    float g = (1.0 - smoothstep(hw - px, hw + px, d)) * stroke;
    g = mix(g, 0.1 + 0.35 * lee, smoothstep(0.3, 0.75, wr));
    ink += g * sea * (0.55 + 0.45 * lee) * clear;
    float cz = vn(pg * 0.42 + 11.0) * 7.0, cw = fwidth(cz);        // depth contours, dotted
    float cl = (1.0 - smoothstep(0.0, cw * 1.6, abs(fract(cz + 0.5) - 0.5))) * step(0.5, fract(across * 14.0 + along * 14.0)) * (1.0 - smoothstep(0.15, 0.4, cw));
    ink2 += cl * sea * 0.8;
    // soundings: a figure in most squares of the chart
    vec2 sg = pg / 0.45, sid = floor(sg), sf = (fract(sg) - 0.5 - (vec2(h21(sid), h21(sid + 9.1)) - 0.5) * 0.5) * 0.45;
    float sh2 = h21(sid + 4.7);
    vec2 st2 = sf / vec2(0.034, 0.03) + 0.5;
    float dg = st2.x < 0.5 ? floor(sh2 * 9.99) : floor(fract(sh2 * 10.0) * 9.99);
    vec4 dt = texture2D(tAtlas, vec2(mix(uDigits.x, uDigits.z, (dg + clamp(fract(st2.x * 2.0), 0.03, 0.97)) / 15.0), mix(uDigits.y, uDigits.w, clamp(st2.y, 0.0, 1.0))));
    ink2 += dt.a * step(0.0, st2.x) * step(st2.x, 1.0) * step(0.0, st2.y) * step(st2.y, 1.0) * step(sh2, 0.7) * sea * clear * (1.0 - smoothstep(2.5, 6.0, dist));
    float pa = dot(p, hd), pc = dot(p, ac);
    // the oars: two strokes of the pen, swung from the deck's sides
    for (int s = 0; s < 2; s++) {
      float sgn = s == 0 ? 1.0 : -1.0;
      vec2 a0 = vec2(0.02, sgn * 0.27), dir = vec2(sin(uOar), sgn * cos(uOar)), a1 = a0 + dir * 0.52;
      vec2 q = vec2(pa, pc);
      float dd = seg(q, a0, a1), bl = seg(q, a0 + dir * 0.4, a1);
      ink += max(1.0 - smoothstep(0.0022 - px, 0.0022 + px, dd), 1.0 - smoothstep(0.011 - px, 0.011 + px, bl)) * sea;
    }
    // ...and the pair of rings each stroke leaves, widening as they fall astern
    if (uStroke > 0.0) {
      float fr = fract(uSwell.z / uStroke);
      for (int i = 0; i < 5; i++) {
        float back = (float(i) + fr) * uStroke, age = back / (uStroke * 5.0);
        float rr = 0.03 + 0.36 * age;
        for (int s = 0; s < 2; s++) {
          vec2 cc = vec2(-back - 0.1, (s == 0 ? 1.0 : -1.0) * 0.7);
          float dd = length(vec2(pa, pc) - cc);
          ink += (ln(dd - rr, 0.0016) + 0.7 * ln(dd - rr * 0.62, 0.0012) + 0.5 * ln(dd - rr * 0.3, 0.001)) * (1.0 - age) * (1.0 - age) * sea;
        }
      }
    }
    // the course: one line ahead, dashed, and the wake spreading behind
    float cd = abs(pc);
    float ahead = step(0.34, pa), dpx = fwidth(pa) / 0.14;                 // dashes, until they are too fine to draw: then a line
    float dsh2 = mix(step(0.42, fract(pa / 0.14 - uSwell.z / 0.14)), 0.62, smoothstep(0.2, 0.5, dpx));
    float cw2 = max(0.0026, px * 1.5);
    red += (1.0 - smoothstep(cw2 - px, cw2 + px, cd)) * ahead * dsh2 * uCourse * (1.0 - smoothstep(30.0, 70.0, dist));
    float wk = abs(cd - 0.2 - max(0.0, -pa - 0.2) * 0.3);
    ink += (1.0 - smoothstep(0.0012 - px, 0.0012 + px, wk)) * step(pa, -0.22) * step(0.5, fract(pa / 0.05)) * uCourse * 0.9 * (1.0 - smoothstep(1.0, 6.0, -pa));
    // a fan of other bearings out of the deck
    if (uBear > 0.001) {
      float ba = atan(pc, pa), nb = 11.0, bi = floor(ba / TAU * nb + 0.5), bd = abs(ba - bi / nb * TAU) * r;
      float dash3 = step(0.4, fract(r / 0.09 - uT * 0.3 + bi * 0.37));
      float reach = 1.4 + 3.0 * h11(bi + 20.0 + uSeed);
      ink += (1.0 - smoothstep(0.0017 - px, 0.0017 + px, bd)) * dash3 * step(0.44, r) * step(0.5, abs(bi)) * uBear * (1.0 - smoothstep(reach * 0.6, reach, r));
      float tip = length(vec2(r - reach * 0.6, bd));                 // each ends in a small ring: a place one could go
      ink += ln(tip - 0.03, 0.0014) * step(0.5, abs(bi)) * uBear;
    }
  }

  // put the ink down
  float fade = uFade * far;
  col = mix(col, uShadowC, sh * uShade);
  col = mix(col, uInk2, clamp(ink2, 0.0, 1.0) * fade * 0.75);
  vec3 inkc = mix(uInk, uAcc, uInkRed);
  col = mix(col, inkc, clamp(ink, 0.0, 1.0) * fade);
  col = mix(col, uHor, smoothstep(3.5, 46.0, dist));
  col = mix(col, uAcc, clamp(red, 0.0, 1.0) * min(1.0, uFade * 1.3) * max(far, sea * uCourse));       // the course is seen all the way to the horizon
  gl_FragColor = vec4(col, 1.0);
}`;

export const SKY_VS = `varying vec3 vD; void main() { vD = position; gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); gl_Position.z = gl_Position.w * 0.99999; }`;
export const SKY_FS = `
#define TAU 6.2831853
uniform vec3 uSky, uHor, uInk, uInk2, uCard, uAcc, uLabelDir, uSleeveDir;
uniform float uT, uGrid, uFade, uKick, uInkRed, uSkyMarks;
uniform sampler2D tAtlas; uniform vec4 uStampUV;
varying vec3 vD;
float lnA(float d, float w) { float aa = fwidth(d) * 0.8 + 1e-6; return 1.0 - smoothstep(w - aa, w + aa, abs(d)); }
void main() {
  vec3 d = normalize(vD); float el = asin(clamp(d.z, -1.0, 1.0)), az = atan(d.y, d.x);
  vec3 c = mix(uHor, uSky, smoothstep(0.0, 0.4, d.z));
  float ink = 0.0, ink2 = 0.0, red = 0.0;
  // the horizon: a ruled line, a tick every five degrees
  float a5 = az / TAU * 72.0, i5 = floor(a5 + 0.5), da = abs(a5 - i5) / 72.0 * TAU * cos(el);
  float len = mod(i5, 6.0) < 0.5 ? 0.022 : 0.009;
  ink2 += lnA(el - 0.0005, 0.0005) * 0.9;
  ink2 += lnA(da, 0.0005) * step(0.0, el) * step(el, len) * 0.8;
  // polar graph paper all the way up
  float lat = el / 0.17453, wl = fwidth(lat);
  ink2 += (1.0 - smoothstep(0.0, wl * 1.3, abs(fract(lat + 0.5) - 0.5))) * 0.22 * uGrid * step(0.03, el);
  float lon = az / TAU * 24.0, wn = fwidth(lon);
  if (wn < 0.5) ink2 += (1.0 - smoothstep(0.0, wn * 1.3, abs(fract(lon + 0.5) - 0.5))) * 0.14 * uGrid * step(0.03, el) * smoothstep(1.45, 1.2, el);
  // a blank label the size of a hill, coming up over the horizon
  {
    vec3 L0 = normalize(uLabelDir), rt = normalize(cross(L0, vec3(0.0, 0.0, 1.0))), up = cross(rt, L0);
    float rho = 0.13 * (1.0 + 0.012 * uKick);
    vec2 q = vec2(dot(d, rt), dot(d, up)) / rho; float rr = length(q), fw = fwidth(rr);
    if (dot(d, L0) > 0.0 && rr < 1.2) {
      float inside = 1.0 - smoothstep(1.0 - fw, 1.0 + fw, rr);
      float hole = 1.0 - smoothstep(0.045 - fw, 0.045 + fw, rr);
      c = mix(c, uCard, inside * (1.0 - hole) * uSkyMarks);
      ink += ((1.0 - smoothstep(0.0, fw * 1.6, abs(rr - 1.0))) + (1.0 - smoothstep(0.0, fw * 1.3, abs(rr - 0.045)))) * uSkyMarks;
      ink2 += ((1.0 - smoothstep(0.0, fw * 1.3, abs(rr - 0.93))) + (1.0 - smoothstep(0.0, fw * 1.3, abs(rr - 0.34)))) * inside * uSkyMarks;
      vec2 su = (q - vec2(0.0, 0.52)) / vec2(0.52, 0.26) * 0.5 + 0.5;
      vec4 s = texture2D(tAtlas, mix(uStampUV.xy, uStampUV.zw, clamp(su, 0.0, 1.0)));
      red += s.a * inside * step(0.0, su.x) * step(su.x, 1.0) * step(0.0, su.y) * step(su.y, 1.0) * uSkyMarks * 0.9;
    }
  }
  // and a plain sleeve, square to nothing
  {
    vec3 L0 = normalize(uSleeveDir), rt = normalize(cross(L0, vec3(0.0, 0.0, 1.0))), up = cross(rt, L0);
    vec2 q = vec2(dot(d, rt), dot(d, up)) / 0.1; q = mat2(0.978, -0.208, 0.208, 0.978) * q;
    float bx = max(abs(q.x), abs(q.y)), fw = fwidth(bx), rr = length(q), fr = fwidth(rr);
    if (dot(d, L0) > 0.0 && bx < 1.2) {
      float inside = 1.0 - smoothstep(1.0 - fw, 1.0 + fw, bx), hole = 1.0 - smoothstep(0.33 - fr, 0.33 + fr, rr);
      c = mix(c, uCard, inside * (1.0 - hole) * uSkyMarks);
      ink += ((1.0 - smoothstep(0.0, fw * 1.6, abs(bx - 1.0))) + (1.0 - smoothstep(0.0, fr * 1.4, abs(rr - 0.33)))) * uSkyMarks;
    }
  }
  c = mix(c, uInk2, clamp(ink2, 0.0, 1.0) * uFade * 0.7);
  c = mix(c, mix(uInk, uAcc, uInkRed), clamp(ink, 0.0, 1.0) * uFade);
  c = mix(c, uAcc, clamp(red, 0.0, 1.0) * uFade);
  gl_FragColor = vec4(c, 1.0);
}`;
