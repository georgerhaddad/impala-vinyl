// The marks a test pressing carries, drawn once into one sheet (an atlas texture) for the rarities world:
// rubber stamps, pencilled matrix numbers, typed job lines, a VU face, the figures for the counters.
// Everything here is invented: no real label, plant or catalogue number.
// Black on the sheet is "ink" and red is "the stamp-pad colour"; the shaders put the palette's own colours in.
import * as THREE from 'three';

const S = 2048;
const MONO = '"Space Mono", ui-monospace, monospace', HAND = 'Caveat, "Segoe Script", cursive';
const INK = '#000000', RED = '#ff0000';

// where things are on the sheet: [x, y, w, h] in pixels
const cells = (n, per, x0, y0, w, h, gx = 0, gy = 0) => Array.from({ length: n }, (_, i) => [x0 + (i % per) * (w + gx), y0 + Math.floor(i / per) * (h + gy), w, h]);
export const CELL = {
  stamps: cells(8, 4, 0, 0, 512, 256),              // 2:1, interchangeable
  hands: cells(8, 4, 0, 512, 512, 128),             // 4:1 pencil notes
  glyphs: cells(10, 10, 0, 768, 204, 256),          // big letters and figures
  digits: [0, 1030, 960, 112],                      // "0123456789:.-+ " in 15 equal cells
  typed: cells(8, 2, 0, 1150, 720, 52, 20, 4),      // typewriter lines, 24 characters each
  vu: [0, 1380, 640, 400],
  ticket: [660, 1380, 1000, 400],
  small: cells(8, 1, 1680, 1380, 360, 46, 0, 4),    // small captions
  etch: [0, 1790, 2040, 72],                        // the run-out etching, read round a circle
  misc: cells(12, 6, 0, 1870, 340, 84, 0, 2),       // dimensions and other figures
};
export const uvOf = ([x, y, w, h]) => new THREE.Vector4(x / S, 1 - (y + h) / S, (x + w) / S, 1 - y / S);

function mulberry(a) { return () => { a = (a + 0x6d2b79f5) | 0; let t = Math.imul(a ^ (a >>> 15), 1 | a); t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t; return ((t ^ (t >>> 14)) >>> 0) / 4294967296; }; }
const hashStr = (str) => { let h = 0x811c9dc5; for (let i = 0; i < str.length; i++) h = Math.imul(h ^ str.charCodeAt(i), 0x01000193) >>> 0; return h; };

// the ten songs of the compilation: side and band (anything else gets its numbers from its name)
const BANDS = {
  'Sundown Syndrome': ['A', 1], 'Remember Me': ['A', 2], 'Beverly Laurel': ['A', 3],
  'List Of People (To Try And Forget About)': ['B', 1], 'Powerlines': ['B', 2], "Taxi's Here": ['B', 3],
  'Patience': ['C', 1], 'The Boat I Row': ['C', 2], 'No Choice': ['C', 3], 'Wings Of Time': ['C', 4],
};

export class Marks {
  constructor(r) {
    this.c = document.createElement('canvas'); this.c.width = this.c.height = S;
    this.x = this.c.getContext('2d');
    this.tex = new THREE.CanvasTexture(this.c);
    this.tex.colorSpace = THREE.NoColorSpace; this.tex.anisotropy = Math.min(8, r.capabilities.getMaxAnisotropy());
    this.tex.minFilter = THREE.LinearMipmapLinearFilter; this.tex.magFilter = THREE.LinearFilter; this.tex.generateMipmaps = true;
    this.track = { title: 'Untitled', side: 'A', band: 1, job: '0417', cut: '03' };
    this.draw();
    // the web fonts may still be on their way: draw again when they are in
    const f = document.fonts;
    if (f?.load) Promise.all([f.load(`700 48px ${MONO}`), f.load(`400 48px ${MONO}`), f.load(`600 48px ${HAND}`)]).then(() => this.draw()).catch(() => {});
  }
  // a new song on the deck: its job ticket, matrix number, side and band
  setTrack(title) {
    const h = hashStr(title || ''), b = BANDS[title] || ['ABC'[h % 3], 1 + (h >>> 3) % 4];
    this.track = { title: title || 'Untitled', side: b[0], band: b[1], job: String(1000 + (h >>> 5) % 9000), cut: String(1 + (h >>> 9) % 8).padStart(2, '0') };
    this.drawTrack(); this.tex.needsUpdate = true;
  }
  cell(rc, fn) {
    const k = this.x, [x, y, w, h] = rc;
    k.save(); k.beginPath(); k.rect(x, y, w, h); k.clip(); k.clearRect(x, y, w, h); k.translate(x, y);
    k.textAlign = 'center'; k.textBaseline = 'middle'; k.lineJoin = 'round'; k.lineCap = 'round'; k.fillStyle = k.strokeStyle = INK; k.globalAlpha = 1;
    k.globalCompositeOperation = 'source-over';
    fn(k, w, h); k.restore();
  }
  // a rubber stamp never prints evenly: knock specks and streaks out of what was just drawn
  wear(rc, seed, amount = 1) {
    const k = this.x, [x, y, w, h] = rc, R = mulberry(seed);
    k.save(); k.beginPath(); k.rect(x, y, w, h); k.clip(); k.globalCompositeOperation = 'destination-out';
    for (let i = 0; i < 520 * amount; i++) { k.globalAlpha = 0.35 + R() * 0.65; const rr = 0.6 + R() * R() * 4.2; k.beginPath(); k.arc(x + R() * w, y + R() * h, rr, 0, 7); k.fill(); }
    for (let i = 0; i < 9 * amount; i++) {                      // dry streaks across it
      k.globalAlpha = 0.25 + R() * 0.3; k.lineWidth = 1 + R() * 5; const yy = y + R() * h, a = (R() - 0.5) * 0.2;
      k.beginPath(); k.moveTo(x, yy); k.lineTo(x + w, yy + a * w); k.stroke();
    }
    const g = k.createLinearGradient(x, y, x + w, y + h);       // one corner pressed lighter
    g.addColorStop(0, `rgba(0,0,0,${0.28 * R()})`); g.addColorStop(0.5, 'rgba(0,0,0,0)'); g.addColorStop(1, `rgba(0,0,0,${0.32 * R()})`);
    k.globalAlpha = 1; k.fillStyle = g; k.fillRect(x, y, w, h);
    k.restore();
  }
  mono(k, text, x, y, px, weight = 700, track = 0) {             // fixed pitch, set by hand so every character sits in its cell
    k.font = `${weight} ${px}px ${MONO}`; k.textAlign = 'center';
    const adv = px * 0.6 + track, x0 = x - (text.length - 1) * adv / 2;
    for (let i = 0; i < text.length; i++) if (text[i] !== ' ') k.fillText(text[i], x0 + i * adv, y);
  }

  draw() {
    const k = this.x; k.clearRect(0, 0, S, S);
    const st = CELL.stamps;
    // ---- the stamps (red) ----
    const stamp = (i, rot, fn) => { this.cell(st[i], (c, w, h) => { c.fillStyle = c.strokeStyle = RED; c.translate(w / 2, h / 2); c.rotate(rot); fn(c); }); this.wear(st[i], 11 + i * 7); };
    stamp(0, -0.055, (c) => { c.lineWidth = 9; c.strokeRect(-226, -62, 452, 124); this.mono(c, 'TEST PRESSING', 0, 3, 50); });
    stamp(1, 0.04, (c) => { c.lineWidth = 6; c.strokeRect(-218, -66, 436, 132); c.lineWidth = 2.5; c.strokeRect(-206, -54, 412, 108); this.mono(c, 'NOT FOR SALE', 0, 3, 48); });
    stamp(2, -0.03, (c) => { c.lineWidth = 8; c.beginPath(); c.roundRect(-214, -58, 428, 116, 26); c.stroke(); this.mono(c, 'WHITE LABEL', 0, 3, 52); });
    stamp(3, 0.12, (c) => {                                      // round quality-control stamp
      c.lineWidth = 6; c.beginPath(); c.arc(0, 0, 112, 0, 7); c.stroke(); c.lineWidth = 3; c.beginPath(); c.arc(0, 0, 74, 0, 7); c.stroke();
      const ring = 'QUALITY CONTROL · CUTTING ROOM 2 · ';
      c.font = `700 22px ${MONO}`;
      for (let i = 0; i < ring.length; i++) { const a = i / ring.length * Math.PI * 2 - Math.PI / 2; c.save(); c.rotate(a + Math.PI / 2); c.fillText(ring[i], 0, -93); c.restore(); }
      this.mono(c, 'OK', 0, -8, 58); this.mono(c, 'NO. 07', 0, 36, 20);
    });
    stamp(4, -0.02, (c) => { this.mono(c, 'APPROVED', 0, -24, 62); c.lineWidth = 5; c.beginPath(); c.moveTo(-190, 18); c.lineTo(190, 18); c.stroke(); this.mono(c, 'FOR PRESSING', 0, 52, 30, 700, 4); });
    stamp(5, 0.03, (c) => { c.lineWidth = 7; c.strokeRect(-200, -92, 400, 184); this.mono(c, 'REFERENCE', 0, -34, 56); this.mono(c, 'LACQUER', 0, 38, 56); });
    stamp(6, 0.085, (c) => { c.lineWidth = 14; c.strokeRect(-150, -66, 300, 132); this.mono(c, 'RE-CUT', 0, 4, 70); });
    stamp(7, -0.07, (c) => { c.lineWidth = 6; c.beginPath(); c.ellipse(0, 0, 216, 92, 0, 0, 7); c.stroke(); this.mono(c, '33 1/3 RPM', 0, -16, 50); this.mono(c, 'STEREO', 0, 40, 30, 700, 8); });

    // ---- pencil notes ----
    const notes = [null, 'cut 3 / take 2', '+1.5 dB @ 10k', null, 'ok to press', 're-cut ?', 'check phase', 'ref. lacquer'];
    notes.forEach((t, i) => { if (t) this.note(i, t); });
    // ---- big figures for the sleeves: 0, 1 are the side letter and band number (drawn per song) ----
    ['', '', '33', '45', '№', '×', '?', '△', '○', '+'].forEach((g, i) => { if (g) this.glyph(i, g); });
    // ---- the figures for the counters ----
    this.cell(CELL.digits, (c, w, h) => { c.font = `700 96px ${MONO}`; '0123456789:.-+ '.split('').forEach((ch, i) => c.fillText(ch, i * 64 + 32, h / 2 + 4)); });
    // ---- typed lines: 2.. are standing notes, 0 and 1 are the song's ----
    ['', '', 'LACQUER 14IN    CUT 03  ', 'REF TONE 1KHZ   0 VU    ', 'SWEEP 20HZ-20KHZ   L+R  ', 'GROOVE PITCH  VARIABLE  ', 'RUN-OUT / LOCKED GROOVE ', 'HANDLE BY EDGES ONLY    ']
      .forEach((t, i) => { if (t) this.typed(i, t); });
    // ---- the VU face ----
    this.cell(CELL.vu, (c, w, h) => {
      const px = w / 2, py = h * 1.075, R0 = h * 0.86, A = 0.87;                 // the needle's pivot is below the card
      const at = (v) => -Math.PI / 2 + (v * 2 - 1) * A;                          // v: 0..1 across the scale
      c.lineWidth = 3; c.beginPath(); c.arc(px, py, R0, at(0), at(0.72)); c.stroke();
      c.strokeStyle = RED; c.lineWidth = 12; c.beginPath(); c.arc(px, py, R0 + 5, at(0.72), at(1)); c.stroke(); c.strokeStyle = INK;
      const marks = [[0, '20'], [0.16, '10'], [0.29, '7'], [0.4, '5'], [0.52, '3'], [0.6, '2'], [0.66, '1'], [0.72, '0'], [0.81, '1'], [0.9, '2'], [1, '3']];
      for (const [v, t] of marks) {
        const a = at(v), ca = Math.cos(a), sa = Math.sin(a), red = v > 0.72;
        c.strokeStyle = c.fillStyle = red ? RED : INK; c.lineWidth = 3.5;
        c.beginPath(); c.moveTo(px + ca * R0, py + sa * R0); c.lineTo(px + ca * (R0 + 26), py + sa * (R0 + 26)); c.stroke();
        c.font = `700 26px ${MONO}`; c.fillText(t, px + ca * (R0 + 50), py + sa * (R0 + 50));
      }
      c.strokeStyle = c.fillStyle = INK; c.lineWidth = 1.5;
      for (let i = 0; i <= 44; i++) { const v = i / 44, a = at(v); c.beginPath(); c.moveTo(px + Math.cos(a) * R0, py + Math.sin(a) * R0); c.lineTo(px + Math.cos(a) * (R0 + 12), py + Math.sin(a) * (R0 + 12)); c.stroke(); }
      c.font = `700 54px ${MONO}`; c.fillText('VU', px, h * 0.6);
      c.font = `400 19px ${MONO}`; c.fillText('−', 56, 40); c.fillStyle = RED; c.fillText('+', w - 56, 40);
    });
    // ---- small captions ----
    ['LEAD-IN', 'RUN-OUT', 'CUTTER HEAD', 'PEN 1  LF', 'PEN 2  HF', 'DATUM  0,0', 'SWEEP', 'LEVEL'].forEach((t, i) => this.cell(CELL.small[i], (c, w, h) => { c.textAlign = 'left'; c.font = `700 30px ${MONO}`; c.fillText(t, 4, h / 2 + 2); }));
    // ---- dimensions and loose figures ----
    ['455', '380', 'Ø 302', 'N', '0°', '90°', '180°', '270°', 'A', 'B', '1:1', 'T+'].forEach((t, i) => this.cell(CELL.misc[i], (c, w, h) => { c.font = `700 52px ${MONO}`; c.fillText(t, w / 2, h / 2 + 3); }));
    this.drawTrack();
    this.tex.needsUpdate = true;
  }
  note(i, text, px = 92) {
    const R = mulberry(77 + i * 13 + hashStr(text));
    this.cell(CELL.hands[i], (c, w, h) => {
      c.font = `600 ${px}px ${HAND}`; let tw = c.measureText(text).width; if (tw > w - 40) { px *= (w - 40) / tw; c.font = `600 ${px}px ${HAND}`; }
      c.translate(w / 2, h / 2 + 4); c.rotate((R() - 0.5) * 0.06); c.globalAlpha = 0.9; c.fillText(text, 0, 0);
    });
  }
  glyph(i, g) { this.cell(CELL.glyphs[i], (c, w, h) => { let px = 210; c.font = `700 ${px}px ${MONO}`; const tw = c.measureText(g).width; if (tw > w - 16) c.font = `700 ${px * (w - 16) / tw}px ${MONO}`; c.fillText(g, w / 2, h / 2 + 10); }); }
  typed(i, text) { this.cell(CELL.typed[i], (c, w, h) => { c.font = `700 44px ${MONO}`; const t = text.toUpperCase().padEnd(24).slice(0, 24); for (let j = 0; j < 24; j++) if (t[j] !== ' ') c.fillText(t[j], j * 30 + 15, h / 2 + 2); }); }

  // everything that names the song on the deck
  drawTrack() {
    const t = this.track, mx = `TI-R${String(t.band).padStart(2, '0')}-${t.side}${1 + (+t.job % 3)}`;
    this.note(0, mx, 88);
    this.note(3, t.title.length > 26 ? t.title.slice(0, 25) + '…' : t.title, 96);
    this.glyph(0, t.side); this.glyph(1, String(t.band));
    this.typed(0, `SIDE ${t.side}  BAND ${String(t.band).padStart(2, '0')}  33 1/3`);
    this.typed(1, `JOB R-${t.job}  MX ${mx}`);
    this.cell(CELL.ticket, (c, w, h) => {
      c.lineWidth = 4; c.beginPath(); c.moveTo(10, 10); c.lineTo(w - 60, 10); c.lineTo(w - 10, 60); c.lineTo(w - 10, h - 10); c.lineTo(10, h - 10); c.closePath(); c.stroke();
      c.lineWidth = 2; c.beginPath(); c.moveTo(10, 92); c.lineTo(w - 10, 92); c.moveTo(10, h - 96); c.lineTo(w - 10, h - 96); c.stroke();
      c.textAlign = 'left'; c.font = `700 36px ${MONO}`; c.fillText(`JOB R-${t.job}`, 36, 54); c.fillText(`CUT ${t.cut}`, 420, 54);
      c.font = `400 30px ${MONO}`; c.fillText(`MATRIX  ${mx}`, 36, h - 52); c.fillText('33 1/3   STEREO', 560, h - 52);
      c.fillStyle = c.strokeStyle = RED; c.lineWidth = 5; c.strokeRect(660, 24, 250, 58); c.textAlign = 'center'; c.font = `700 36px ${MONO}`; c.fillText(`SIDE ${t.side} / ${t.band}`, 785, 55);
      c.fillStyle = INK; let px = 150; const ttl = t.title;
      c.font = `600 ${px}px ${HAND}`; const tw = c.measureText(ttl).width; if (tw > w - 90) { px *= (w - 90) / tw; c.font = `600 ${px}px ${HAND}`; }
      c.save(); c.translate(w / 2, h / 2 + 4); c.rotate(-0.018); c.globalAlpha = 0.92; c.fillText(ttl, 0, 0); c.restore();
    });
    this.cell(CELL.etch, (c, w, h) => {
      const text = `${mx}   △   33 1/3   ·   cut no. ${+t.cut}   ·   ref. lacquer   ·   not final   ·   side ${t.side}   ·   ok to press ?   ·`;
      let px = 62; c.font = `600 ${px}px ${HAND}`; const tw = c.measureText(text).width; c.font = `600 ${Math.min(px, px * (w - 30) / tw)}px ${HAND}`;
      c.textAlign = 'left'; c.globalAlpha = 0.85; c.fillText(text, 12, h / 2 + 2);
    });
  }
}
