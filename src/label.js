// The paper label at the centre of the record, drawn into a canvas and used as a texture.
// Every Tame Impala era gets its own original design: a nod to the period, not a copy of a sleeve.
// Each painter draws at the brightness it should look; finish() then adds paper grain, shelf wear and
// the pressing ring, and darkens the whole thing, because the scene's key light is several times unity
// and the disc shader squares the texel.
import { TAU, rng } from './dsp.js';

const S = 1024, C = S / 2;                      // texture size; the label is 100 mm across, so about 10 px per mm
const DARKEN = 0.4;
// fonts the painters use (index.html loads them; main.js waits for them and redraws the label)
export const LABEL_FONTS = ['600 40px Fredoka', '700 40px "Courier Prime"', '600 40px Oswald', '400 40px "Archivo Black"', '600 40px Archivo',
  '400 40px Michroma', '700 40px Syncopate', '500 40px Lexend', '700 40px "Source Serif 4"', '700 40px "Space Mono"', '600 40px Caveat'];

// What is on the platter: { era, side, tracks: [{ title, n }] } from the shelf, or null for anything else
let info = null;
export const setLabelInfo = (i) => { info = i; };

const sheet = () => { const c = document.createElement('canvas'); c.width = c.height = S; return c; };
function noise(n, R, asAlpha) {                 // n x n random texels, to be stretched over the label
  const c = document.createElement('canvas'); c.width = c.height = n;
  const x = c.getContext('2d'), d = x.createImageData(n, n);
  for (let i = 0; i < n * n; i++) {
    const v = R();
    d.data[i * 4] = d.data[i * 4 + 1] = d.data[i * 4 + 2] = asAlpha ? 255 : 28 + v * 200; d.data[i * 4 + 3] = asAlpha ? v * 255 : 255;
  }
  x.putImageData(d, 0, 0);
  return c;
}
const stretch = (x, tex) => { const m = S / tex.width; x.imageSmoothingEnabled = true; x.imageSmoothingQuality = 'high'; x.drawImage(tex, -m, -m, S + 2 * m, S + 2 * m); };
const disc = (x, r, cx = C, cy = C) => { x.beginPath(); x.arc(cx, cy, r, 0, TAU); };
const lerp = (a, b, t) => a + (b - a) * t;

// ---------- type ----------
function arcBottom(k, text, r, gap) {           // along the bottom edge, centred, reading left to right
  const chars = [...text], adv = chars.map((ch) => k.measureText(ch).width + gap);
  const total = adv.reduce((a, b) => a + b, 0);
  let th = Math.PI / 2 + total / r / 2;
  chars.forEach((ch, i) => {
    th -= adv[i] / r / 2;
    k.save(); k.translate(C + r * Math.cos(th), C + r * Math.sin(th)); k.rotate(th - Math.PI / 2); k.fillText(ch, 0, 0); k.restore();
    th -= adv[i] / r / 2;
  });
}
function arcTop(k, text, r, gap) {              // along the top edge, centred, reading left to right
  const chars = [...text], adv = chars.map((ch) => k.measureText(ch).width + gap);
  const total = adv.reduce((a, b) => a + b, 0);
  let th = -Math.PI / 2 - total / r / 2;
  chars.forEach((ch, i) => {
    th += adv[i] / r / 2;
    k.save(); k.translate(C + r * Math.cos(th), C + r * Math.sin(th)); k.rotate(th + Math.PI / 2); k.fillText(ch, 0, 0); k.restore();
    th += adv[i] / r / 2;
  });
}
// one line of centred text at height y, shrunk (then squeezed) to stay inside a circle of radius rIn
function line(k, text, y, font, size, rIn = 440, cx = C) {
  const dy = y - C, w = 2 * Math.sqrt(Math.max(0, rIn * rIn - dy * dy)) - 30;
  let s = size;
  k.font = font.replace('$', s + 'px');
  while (s > size * 0.62 && k.measureText(text).width > w) { s -= 1; k.font = font.replace('$', s + 'px'); }
  k.fillText(text, cx, y, Math.max(10, w));
}
// the side's tracks, numbered the way the album numbers them
function tracks(k, list, y0, dy, font, size, { upper = false, rIn = 440 } = {}) {
  const n = list.length, step = n > 3 ? dy * 3 / n * 1.15 : dy;
  list.forEach((t, i) => line(k, `${t.n}. ${upper ? t.title.toUpperCase() : t.title}`, y0 + i * Math.min(dy, step), font, n > 3 ? size * 0.92 : size, rIn));
}
const sideTracks = (titles) => info?.tracks || titles.filter(Boolean).map((title, i) => ({ title, n: i + 1 }));

// ---------- painters: (k, R, titles) -> the art at the brightness it should look ----------
const PAINT = {
  // 2008: a painted sun of rings over wavy bands
  ep(k, R, titles) {
    k.fillStyle = '#efe2c4'; k.fillRect(0, 0, S, S);
    const sx = C, sy = C - 175, rings = ['#d8452b', '#e8692e', '#f08a2b', '#f4a834', '#f4c542', '#f7dc77'];
    for (let r = 230, i = 0; r > 10; r -= 22, i++) { disc(k, r + Math.sin(i * 1.7) * 3, sx, sy); k.fillStyle = rings[i % rings.length]; k.fill(); }
    const bands = ['#6b4c9a', '#3d6fb4', '#e9b949', '#7a4a2a', '#6b4c9a', '#3d6fb4'];
    bands.forEach((col, b) => {
      const y0 = C + 270 + b * 40, a = 16 + b * 3, f = 0.010 + b * 0.002, ph = b * 1.3;
      k.beginPath(); k.moveTo(0, S);
      for (let x = 0; x <= S; x += 8) k.lineTo(x, y0 + Math.sin(x * f + ph) * a + Math.sin(x * f * 2.7 + ph) * a * 0.3);
      k.lineTo(S, S); k.closePath(); k.fillStyle = col; k.fill();
    });
    k.fillStyle = 'rgba(122,74,42,.10)'; for (let i = 0; i < 900; i++) k.fillRect(R() * S, R() * S, 1 + R() * 3, 1 + R() * 2);   // gouache tooth
    k.fillStyle = '#3a2a1e'; k.textAlign = 'center'; k.textBaseline = 'middle';
    k.font = '600 34px Fredoka'; arcTop(k, 'tame impala', 455, 4);
    k.font = '700 22px "Courier Prime"'; k.fillText('SIDE ' + (info?.side || 'A'), C - 290, C); k.fillText('33⅓ RPM', C + 290, C);
    tracks(k, sideTracks(titles), C + 105, 40, '700 $ "Courier Prime"', 26, { rIn: 400 });
  },

  // 2010: a valley that folds into itself; cloud on the first disc, autumn on the second
  innerspeaker(k, R, titles) {
    const warm = 'CD'.includes(info?.side), base = sheet(), b = base.getContext('2d');
    let g = b.createLinearGradient(0, 0, 0, S);
    if (warm) { g.addColorStop(0, '#e39a3b'); g.addColorStop(0.5, '#c2412b'); g.addColorStop(1, '#2c3b2a'); }
    else { g.addColorStop(0, '#5fa3d6'); g.addColorStop(0.6, '#cfe6f3'); g.addColorStop(1, '#2f6f7a'); }
    b.fillStyle = g; b.fillRect(0, 0, S, S);
    for (let i = 0; i < (warm ? 2600 : 70); i++) {      // foliage specks, or clouds
      const px = R() * S, py = R() * S, r = warm ? 2 + R() * 7 : 30 + R() * 90;
      if (warm) { b.fillStyle = ['#c2412b', '#e39a3b', '#8a2a1a', '#f2c14e', '#2c3b2a'][Math.floor(R() * 5)]; b.globalAlpha = 0.55; disc(b, r, px, py); b.fill(); }
      else { const cg = b.createRadialGradient(px, py, 0, px, py, r); cg.addColorStop(0, 'rgba(238,243,245,.55)'); cg.addColorStop(1, 'rgba(238,243,245,0)'); b.fillStyle = cg; b.fillRect(px - r, py - r, 2 * r, 2 * r); }
    }
    b.globalAlpha = 1;
    b.beginPath(); b.moveTo(0, C + 120);                // a ridge line
    for (let x = 0; x <= S; x += 6) b.lineTo(x, C + 120 + 70 * Math.exp(-(((x - C) / 260) ** 2)) + Math.sin(x * 0.03) * 10 + Math.sin(x * 0.011) * 26);
    b.lineTo(S, S); b.lineTo(0, S); b.closePath(); b.fillStyle = warm ? 'rgba(44,59,42,.85)' : 'rgba(47,111,122,.75)'; b.fill();
    // the Droste fold: the scene nested inside a heart-shaped window, again and again, vanishing into the spindle
    const heart = (x, s) => {
      x.beginPath(); x.moveTo(C, C + 150 * s);
      x.bezierCurveTo(C - 260 * s, C - 20 * s, C - 150 * s, C - 230 * s, C, C - 110 * s);
      x.bezierCurveTo(C + 150 * s, C - 230 * s, C + 260 * s, C - 20 * s, C, C + 150 * s); x.closePath();
    };
    for (let i = 0; i < 6; i++) {
      const copy = sheet(); copy.getContext('2d').drawImage(base, 0, 0);
      const s = 0.62;
      b.save(); heart(b, 1.25); b.clip();
      b.translate(C, C); b.rotate(0.12); b.scale(s, s); b.translate(-C, -C); b.drawImage(copy, 0, 0); b.restore();
      b.save(); heart(b, 1.25); b.lineWidth = 5; b.strokeStyle = 'rgba(238,243,245,.8)'; b.stroke(); b.restore();
    }
    k.drawImage(base, 0, 0);
    k.lineWidth = 74; k.strokeStyle = '#eef3f5'; disc(k, 466); k.stroke();
    k.fillStyle = '#1d2b4a'; k.textAlign = 'center'; k.textBaseline = 'middle';
    k.font = '600 30px Oswald'; arcTop(k, 'TAME IMPALA  ·  INNERSPEAKER', 456, 6);
    k.font = '600 19px Oswald';
    arcBottom(k, sideTracks(titles).map((t) => `${t.n}. ${t.title.toUpperCase()}`).join('   ·   '), 460, 2.5);
    disc(k, 46, C + 300, C); k.fillStyle = '#1d2b4a'; k.fill();
    k.fillStyle = '#eef3f5'; k.font = '600 44px Oswald'; k.fillText(info?.side || 'A', C + 300, C + 2);
  },

  // 2012: behind the railings, in overexposed summer light
  lonerism(k, R, titles) {
    const second = 'CD'.includes(info?.side);
    let g = k.createLinearGradient(0, 0, 0, S);
    if (second) { g.addColorStop(0, '#f2b48a'); g.addColorStop(0.55, '#e08a4f'); g.addColorStop(1, '#8e5a6b'); }
    else { g.addColorStop(0, '#3a2440'); g.addColorStop(0.6, '#8e5a6b'); g.addColorStop(1, '#e08a4f'); }
    k.fillStyle = g; k.fillRect(0, 0, S, S);
    // a tree line on the horizon, glowing from behind
    const glow = k.createLinearGradient(0, C + 170, 0, C + 330);
    glow.addColorStop(0, 'rgba(127,163,91,0)'); glow.addColorStop(1, second ? 'rgba(242,180,138,.0)' : 'rgba(127,163,91,.85)');
    k.fillStyle = glow; k.fillRect(0, C + 170, S, 160);
    k.fillStyle = second ? '#3a2440' : '#1a1020'; k.beginPath(); k.moveTo(0, S);
    for (let x = 0; x <= S; x += 5) k.lineTo(x, C + 300 - Math.abs(Math.sin(x * 0.05) * 30 + Math.sin(x * 0.013 + 1) * 40 + Math.sin(x * 0.17) * 6));
    k.lineTo(S, S); k.closePath(); k.fill();
    // the fence: bars with spear tips, a rail low down
    k.fillStyle = 'rgba(10,6,10,.92)';
    for (let x = 35; x < S; x += 74) {
      k.fillRect(x - 7, C - 150, 14, 900);
      k.beginPath(); k.moveTo(x - 15, C - 150); k.lineTo(x, C - 196); k.lineTo(x + 15, C - 150); k.closePath(); k.fill();
    }
    k.fillRect(0, C + 205, S, 18); k.fillRect(0, C - 140, S, 12);
    // a pink light leak in the corner, where the film fogged
    const leak = k.createRadialGradient(S * 0.9, S * 0.12, 0, S * 0.9, S * 0.12, 520);
    leak.addColorStop(0, 'rgba(243,198,184,.9)'); leak.addColorStop(0.4, 'rgba(243,150,150,.35)'); leak.addColorStop(1, 'rgba(243,198,184,0)');
    k.globalCompositeOperation = 'screen'; k.fillStyle = leak; k.fillRect(0, 0, S, S); k.globalCompositeOperation = 'source-over';
    const plate = k.createLinearGradient(0, C + 80, 0, C + 200);     // a shadow behind the track list, so the bars don't cut it up
    plate.addColorStop(0, 'rgba(20,10,22,0)'); plate.addColorStop(0.25, 'rgba(20,10,22,.62)'); plate.addColorStop(0.8, 'rgba(20,10,22,.62)'); plate.addColorStop(1, 'rgba(20,10,22,0)');
    k.fillStyle = plate; k.fillRect(0, C + 80, S, 125);
    k.fillStyle = '#fff6ee'; k.textAlign = 'center'; k.textBaseline = 'middle'; k.shadowColor = 'rgba(0,0,0,.45)'; k.shadowBlur = 8;
    line(k, 'TAME IMPALA', C - 330, '400 $ "Archivo Black"', 58);
    line(k, 'LONERISM', C - 262, '400 $ "Archivo Black"', 46);
    k.lineWidth = 4; k.strokeStyle = '#fff6ee'; disc(k, 34, C - 290, C); k.stroke();
    k.font = '400 34px "Archivo Black"'; k.fillText(info?.side || 'A', C - 290, C + 2);
    k.font = '600 20px Archivo'; k.fillText('33⅓', C + 290, C);
    tracks(k, sideTracks(titles), C + 110, 38, '600 $ Archivo', 26, { upper: true, rIn: 420 });
    k.shadowBlur = 0;
  },

  // 2015: lines of flow bending round a chrome sphere, turbulence in the wake
  currents(k, R, titles) {
    const second = 'CD'.includes(info?.side), a = 150;
    const bg = second ? '#d9a23a' : '#5b3a8c', stripe = second ? '#fbf3df' : '#f4eef7';
    k.fillStyle = bg; k.fillRect(0, 0, S, S);
    // streamlines of potential flow past a cylinder, traced by integrating the velocity field
    const vel = (x, y) => { const r2 = x * x + y * y, r4 = r2 * r2 || 1; return [1 - a * a * (x * x - y * y) / r4, -2 * a * a * x * y / r4]; };
    k.lineCap = 'round';
    for (let y0 = -520, i = 0; y0 <= 520; y0 += 17, i++) {
      if (Math.abs(y0) < 4) continue;
      let x = -560, y = y0;
      k.beginPath(); k.moveTo(C + x, C + y);
      for (let s = 0; s < 400 && x < 560; s++) {
        const [u, v] = vel(x, y), m = Math.hypot(u, v) || 1;
        x += 4 * u / m; y += 4 * v / m;
        const wake = x > 0 ? Math.min(1, x / 260) * Math.exp(-(((Math.abs(y) - a * 0.6) / 170) ** 2)) : 0;   // swirl behind the sphere
        k.lineTo(C + x, C + y + wake * (Math.sin(x * 0.045 + y * 0.03 + i) * 22 + Math.sin(x * 0.11 - i) * 7));
      }
      const red = i === 25;
      k.strokeStyle = red ? '#e0322b' : stripe; k.lineWidth = red ? 9 : 7; k.stroke();
    }
    // the sphere: chrome, so it shows a warped sky and floor
    const sg = k.createRadialGradient(C - 50, C - 60, 10, C, C, a);
    sg.addColorStop(0, '#ffffff'); sg.addColorStop(0.35, '#e7e3ee'); sg.addColorStop(0.7, '#a7a9b5'); sg.addColorStop(0.92, '#55576a'); sg.addColorStop(1, '#2a2638');
    disc(k, a - 2); k.fillStyle = sg; k.fill();
    k.save(); disc(k, a - 2); k.clip();
    k.globalAlpha = 0.35; k.fillStyle = second ? '#d9a23a' : '#5b3a8c'; k.fillRect(C - a, C + 20, 2 * a, a);
    k.globalAlpha = 1; k.restore();
    k.lineWidth = 70; k.strokeStyle = second ? '#8a5f14' : '#2a1a45'; disc(k, 468); k.stroke();
    k.fillStyle = '#f4eef7'; k.textAlign = 'center'; k.textBaseline = 'middle';
    k.font = '400 25px Michroma'; arcTop(k, 'TAME IMPALA  ·  CURRENTS', 458, 7);
    k.font = '400 15px Michroma';
    arcBottom(k, sideTracks(titles).map((t) => `${t.n} ${t.title.toUpperCase()}`).join('  /  '), 462, 2);
    k.fillStyle = '#2a2638'; k.font = '400 30px Michroma'; k.fillText(info?.side || 'A', C, C - 92);
    k.font = '400 13px Michroma'; k.fillText('33⅓ RPM', C, C + 92);
  },

  // 2020: a room filling up with sand; a rule through the spindle
  'slow-rush'(k, R, titles) {
    const red = 'CD'.includes(info?.side), wall = red ? '#c8352b' : '#3e86c6';
    k.fillStyle = wall; k.fillRect(0, 0, S, S);
    const shade = k.createRadialGradient(C, C - 120, 60, C, C, 620);
    shade.addColorStop(0, 'rgba(255,240,220,.18)'); shade.addColorStop(1, 'rgba(40,10,5,.35)');
    k.fillStyle = shade; k.fillRect(0, 0, S, S);
    // an arched window at the top, the sky behind it pale with dust
    k.save(); k.beginPath(); k.moveTo(C - 85, C - 175); k.lineTo(C - 85, C - 300); k.arc(C, C - 300, 85, Math.PI, 0); k.lineTo(C + 85, C - 175); k.closePath();
    const sky = k.createLinearGradient(0, C - 385, 0, C - 175); sky.addColorStop(0, '#f7e7cf'); sky.addColorStop(1, '#e9c6a0');
    k.fillStyle = sky; k.fill(); k.lineWidth = 10; k.strokeStyle = 'rgba(60,20,10,.35)'; k.stroke(); k.restore();
    // dunes drifting in from the bottom
    [['#e9c6a0', 250, 0.0], ['#d9a46b', 290, 1.9], ['#c08850', 330, 3.1], ['#8a4e2c', 380, 4.4]].forEach(([col, y0, ph]) => {
      k.beginPath(); k.moveTo(0, S);
      for (let x = 0; x <= S; x += 6) k.lineTo(x, C + y0 - 40 * Math.sin(x * 0.006 + ph) - 18 * Math.sin(x * 0.017 + ph * 2) - 50 * Math.exp(-(((x - 300 - ph * 90) / 160) ** 2)));
      k.lineTo(S, S); k.closePath(); k.fillStyle = col; k.fill();
    });
    k.fillStyle = 'rgba(255,236,200,.35)'; for (let i = 0; i < 3500; i++) { const y = C + 180 + R() * 330; k.fillRect(R() * S, y, 1.4, 1.4); }   // sand grain
    k.strokeStyle = '#fff4e6'; k.lineWidth = 3; k.beginPath(); k.moveTo(C - 440, C); k.lineTo(C - 60, C); k.moveTo(C + 60, C); k.lineTo(C + 440, C); k.stroke();
    k.fillStyle = '#fff4e6'; k.textAlign = 'center'; k.textBaseline = 'middle';
    line(k, 'TAME IMPALA', C - 52, '700 $ Syncopate', 40);
    line(k, 'THE SLOW RUSH', C + 50, '700 $ Syncopate', 34);
    k.font = '700 17px Syncopate'; k.textAlign = 'left'; k.fillText('SIDE ' + (info?.side || 'A'), C - 425, C - 22);
    k.textAlign = 'right'; k.fillText('33⅓', C + 425, C - 22); k.textAlign = 'center';
    tracks(k, sideTracks(titles), C + 120, 34, '500 $ Lexend', 23, { rIn: 400 });
  },

  // 2025: a speaker cone at 4 a.m.; flash, smear and grain
  deadbeat(k, R, titles) {
    k.fillStyle = '#f2a66b'; k.fillRect(0, 0, S, S);
    // flash smear: a motion-blurred streak of orange and yellow across the middle
    for (let i = 0; i < 26; i++) {
      const y = C - 40 + (R() - 0.5) * 220, h = 4 + R() * 26;
      const g = k.createLinearGradient(0, 0, S, 0);
      const col = R() < 0.5 ? '240,106,42' : '242,211,75';
      g.addColorStop(0, `rgba(${col},0)`); g.addColorStop(0.2 + R() * 0.3, `rgba(${col},${0.25 + R() * 0.35})`); g.addColorStop(1, `rgba(${col},0)`);
      k.fillStyle = g; k.fillRect(0, y, S, h);
    }
    // the cone: surround, cone, dust cap, around the spindle
    const cg = k.createRadialGradient(C, C, 40, C, C, 190);
    cg.addColorStop(0, '#1a1716'); cg.addColorStop(0.3, '#2c2724'); cg.addColorStop(0.82, '#151312'); cg.addColorStop(0.86, '#3a3431'); cg.addColorStop(0.93, '#0d0c0b'); cg.addColorStop(1, 'rgba(13,12,11,0)');
    disc(k, 190); k.fillStyle = cg; k.fill();
    for (let r = 70; r < 160; r += 9) { k.lineWidth = 1.2; k.strokeStyle = 'rgba(255,255,255,.05)'; disc(k, r); k.stroke(); }
    // grille dots in a band around the outside
    k.fillStyle = 'rgba(17,17,17,.75)';
    for (let r = 418; r < 500; r += 13) for (let a = 0, n = Math.floor(TAU * r / 13); a < n; a++) { disc(k, 2.6, C + r * Math.cos(a / n * TAU + r), C + r * Math.sin(a / n * TAU + r)); k.fill(); }
    k.fillStyle = '#111'; k.textAlign = 'center'; k.textBaseline = 'middle';
    k.fillStyle = 'rgba(17,17,17,.42)'; line(k, 'TAME IMPALA', C - 335, '400 $ "Archivo Black"', 30, 400);
    k.fillStyle = '#111'; line(k, 'DEADBEAT', C - 260, '400 $ "Archivo Black"', 92, 400);
    k.font = '400 64px "Archivo Black"'; k.fillText(info?.side || 'A', C + 285, C + 4);
    k.font = '700 17px "Source Serif 4"'; k.fillText('33⅓ RPM', C - 285, C - 12); k.fillText('STEREO', C - 285, C + 14);
    tracks(k, sideTracks(titles), C + 238, 36, '700 $ "Source Serif 4"', 25, { upper: true, rIn: 405 });
  },

  // a white-label test pressing: stamped and written on by hand
  rarities(k, R, titles, house) {
    k.fillStyle = '#ecebe6'; k.fillRect(0, 0, S, S);
    k.strokeStyle = 'rgba(17,17,17,.7)'; k.lineWidth = 2; disc(k, 440); k.stroke();
    k.fillStyle = '#1b1b1b'; k.textAlign = 'center'; k.textBaseline = 'middle';
    k.font = '700 22px "Space Mono"'; arcTop(k, house ? 'TEST PRESSING  ·  NOT FOR SALE' : 'TAME IMPALA  ·  B-SIDES & RARITIES', 412, 5);
    k.font = '700 16px "Space Mono"';
    k.fillText('SIDE', C - 300, C - 18); k.fillText('RPM', C + 300, C - 18);
    k.font = '600 46px Caveat'; k.fillStyle = '#1f3a8a'; k.fillText(house ? '–' : (info?.side || 'A'), C - 300, C + 22); k.fillText('33', C + 300, C + 22);
    // ruled lines, with the titles written in over them
    const list = house ? titles.filter(Boolean).map((title, i) => ({ title, n: i + 1 })) : sideTracks(titles);
    for (let i = 0; i < 5; i++) { const y = C + 150 + i * 46; const w = Math.sqrt(400 * 400 - (y - C) ** 2) - 20; k.strokeStyle = 'rgba(17,17,17,.3)'; k.lineWidth = 1.2; k.beginPath(); k.moveTo(C - w, y + 14); k.lineTo(C + w, y + 14); k.stroke(); }
    k.fillStyle = '#1f3a8a';
    list.slice(0, 5).forEach((t, i) => { const y = C + 150 + i * 46; k.save(); k.translate(C, y); k.rotate((R() - 0.5) * 0.03); k.translate(-C, -y); line(k, `${t.n}. ${t.title}`, y, '600 $ Caveat', 38, 400); k.restore(); });
    // the stamp
    k.save(); k.translate(C, C - 220); k.rotate(-0.09);
    k.strokeStyle = k.fillStyle = 'rgba(216,69,43,.85)'; k.lineWidth = 6; k.strokeRect(-200, -42, 400, 84);
    k.font = '700 40px "Space Mono"'; k.fillText(house ? 'SYNTHESISED' : 'WHITE LABEL', 0, 3); k.restore();
  },
};
// ---------- paper, wear and the press ----------
function finish(x, R) {
  x.globalCompositeOperation = 'overlay';       // mottling: soft blotches at three scales
  for (const [n, a] of [[5, 0.16], [19, 0.12], [77, 0.10]]) { x.globalAlpha = a; stretch(x, noise(n, R)); }
  x.globalCompositeOperation = 'source-over'; x.globalAlpha = 1;
  for (let i = 0; i < 900; i++) {               // fibres
    const px = R() * S, py = R() * S, len = 5 + R() * 26, a = R() * TAU, b = a + (R() - 0.5) * 1.2;
    x.lineWidth = 0.5 + R() * 0.8;
    x.strokeStyle = R() < 0.6 ? `rgba(255,250,240,${0.03 + R() * 0.06})` : `rgba(0,0,0,${0.04 + R() * 0.08})`;
    x.beginPath(); x.moveTo(px, py);
    x.quadraticCurveTo(px + Math.cos(b) * len * 0.5, py + Math.sin(b) * len * 0.5, px + Math.cos(a) * len, py + Math.sin(a) * len); x.stroke();
  }
  const img = x.getImageData(0, 0, S, S), p = img.data;
  for (let i = 0; i < p.length; i += 4) { const g = (R() + R() - 1) * 12; p[i] += g; p[i + 1] += g; p[i + 2] += g * 0.92; }   // grain
  x.putImageData(img, 0, 0);
  let g = x.createRadialGradient(C, C, C * 0.45, C, C, C);     // darker toward the rim
  g.addColorStop(0, 'rgba(0,0,0,0)'); g.addColorStop(0.82, 'rgba(0,0,0,.08)'); g.addColorStop(1, 'rgba(0,0,0,.3)');
  x.fillStyle = g; x.fillRect(0, 0, S, S);
  x.lineCap = 'round';
  for (let i = 0; i < 40; i++) {                // spindle trails
    const a = R() * TAU, r0 = 38 + R() * 24, r1 = r0 + 10 + R() * 50, bend = (R() - 0.5) * 0.9;
    x.lineWidth = 0.7 + R() * 1.3; x.strokeStyle = `rgba(255,250,240,${0.05 + R() * 0.14})`;
    x.beginPath(); x.moveTo(C + r0 * Math.cos(a), C + r0 * Math.sin(a)); x.lineTo(C + r1 * Math.cos(a + bend), C + r1 * Math.sin(a + bend)); x.stroke();
  }
  for (let i = 0; i < 40; i++) {                // ring wear from years in a sleeve
    const a = R() * TAU, r = 120 + R() * 380;
    x.lineWidth = 0.6 + R() * 2; x.strokeStyle = `rgba(255,250,240,${0.02 + R() * 0.06})`;
    x.beginPath(); x.arc(C, C, r, a, a + 0.1 + R() * 1.1); x.stroke();
  }
  x.globalCompositeOperation = 'multiply'; x.fillStyle = `rgb(${DARKEN * 255},${DARKEN * 255},${DARKEN * 255})`; x.fillRect(0, 0, S, S);
  x.globalCompositeOperation = 'source-over';
  x.lineWidth = 3.5; x.strokeStyle = 'rgba(0,0,0,.30)'; disc(x, 158); x.stroke();      // pressing ring
  x.lineWidth = 2; x.strokeStyle = 'rgba(255,255,255,.03)'; disc(x, 162); x.stroke();
}

export function drawLabel(titles = []) {
  const c = sheet(), x = c.getContext('2d'), era = info?.era?.id;
  const R = rng(era ? era.length * 131 + (info.side || 'A').charCodeAt(0) : 41);
  x.save();
  try { (PAINT[era] || PAINT.rarities)(x, R, titles, !era); }
  catch (err) { console.error('label', err); }
  x.restore();
  x.globalAlpha = 1; x.shadowBlur = 0; x.globalCompositeOperation = 'source-over';
  finish(x, R);
  return c;
}
