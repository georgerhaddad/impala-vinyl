// Words over the picture, in the Currents manner: wide extended capitals that arrive on the current, sliding the
// way the lines flow and trailing streaks behind them. Key words land big in the accent colour; the vocoder
// sections echo each word in stacked copies; the line being sung runs small along the bottom.
// (The idea of sung words scattered over the frame is ilmc-vinyl's; this is a different treatment of it.)
// Other eras set them their own way, through o.look (a world's static WORDS):
//   font, wide   CSS font families (wide: the alternate that half the big words take)      weight  font weight
//   upper        false: as written, not capitals       track   letter-spacing, times the Currents spacing
//   streak       0..1 the streaks trailing each word   chroma  false: no red/cyan fringe on the big words
//   rise         how fast words float up the frame (negative: sink), in frame heights per second
// o.outline (a CSS colour, the third thing a world's ink() returns) draws a line round every word, for worlds where
// no one ink reads over the whole picture.
const FONT = 'Michroma, "Eurostile", sans-serif', WIDE = 'Syncopate, Michroma, sans-serif';
const hash = (n) => { n = Math.imul(n ^ 0x9e3779b9, 0x85ebca6b); n ^= n >>> 13; n = Math.imul(n, 0xc2b2ae35); return ((n ^ (n >>> 16)) >>> 0) / 4294967296; };

export class Words {
  constructor(el) {
    this.c = el; this.x = el.getContext('2d');
    this.lines = []; this.items = []; this.li = -1; this.wi = 0; this.lastT = null; this.n = 1; this.sub = ''; this.subLine = null; this.shown = false;
  }
  rnd() { return hash(this.n++ * 7919 + 17); }
  setLines(lines) { this.lines = lines || []; this.items = []; this.lastT = null; this.subLine = null; }
  resize() {
    const dpr = Math.min(2, devicePixelRatio || 1), w = Math.round(this.c.clientWidth * dpr), h = Math.round(this.c.clientHeight * dpr);
    if (this.c.width !== w || this.c.height !== h) { this.c.width = w; this.c.height = h; }
    this.dpr = dpr;
  }
  show(on) { if (on !== this.shown) { this.shown = on; this.c.classList.toggle('on', on); if (!on) this.x.clearRect(0, 0, this.c.width, this.c.height); } }
  // a sung word arrives
  spawn(word, o) {
    const W = this.c.width, H = this.c.height, base = Math.min(W * 0.7, H);
    const clean = word.replace(/^["'(]+|[",.!?)]+$/g, ''), key = o.keywords && o.keywords.test(clean);
    if (!clean) return;
    const style = o.style;
    if (style === 'slam' || (key && style !== 'vocoder')) for (const it of this.items) if (it.big) it.life = Math.min(it.life, it.age + 0.25);
    const big = style === 'slam' || key;
    const size = (big ? 0.085 + 0.035 * this.rnd() : 0.03 + 0.022 * this.rnd()) * base * (o.scale || 1);
    const lk = o.look || {}, wt = lk.weight || 400, trk = lk.track ?? 1;
    const text = lk.upper === false ? clean : clean.toUpperCase(), font = big && this.rnd() < 0.5 ? lk.wide || lk.font || WIDE : lk.font || FONT;
    this.x.font = `${wt} ${Math.round(size)}px ${font}`; this.x.letterSpacing = `${Math.round(size * (big ? 0.08 : 0.14) * trk)}px`;
    const w = this.x.measureText(text).width, h = size * (style === 'vocoder' ? 2.4 : 1.2), vx = (big ? 0.012 : 0.03 + 0.03 * this.rnd()) * W;
    // somewhere free: not on another word (where it will be in a second, too), and small words not on the deck
    let best = null;
    for (let k = 0; k < 28; k++) {
      const x = big ? W * (0.08 + 0.42 * this.rnd()) : W * (0.04 + 0.7 * this.rnd()), y = big ? H * (0.22 + 0.4 * this.rnd()) : H * (0.12 + 0.68 * this.rnd());
      let bad = 0;
      for (const it of this.items) {
        if (it.age > it.life - 0.3) continue;
        const ix = it.x + it.vx * 0.8, ox = Math.max(0, Math.min(x + w + vx * 0.8, ix + (it.w || it.size * it.text.length * 0.8)) - Math.max(x - size * 2, ix - it.size * 2));
        const oy = Math.max(0, Math.min(y + h / 2, it.y + it.size * 0.7) - Math.max(y - h / 2, it.y - it.size * 0.7));
        bad += ox * oy / (w * h);
      }
      if (!big) { const dx = (x + w / 2) / W - 0.5, dy = y / H - 0.55; bad += Math.max(0, 1 - Math.hypot(dx / 0.2, dy / 0.28)) * 0.8; }
      if (x + w > W * 0.97) bad += 0.5;
      if (!best || bad < best.bad) best = { x, y, bad };
      if (bad === 0) break;
    }
    const echo = style === 'vocoder';
    if (echo) { const live = this.items.filter((it) => it.age < it.life - 0.3); if (live.length >= 6) live[0].life = live[0].age + 0.3; }   // fast lines: keep it legible
    this.items.push({ text, x: best.x, y: best.y, size, big, key, w, echo, age: 0, life: big ? 2.4 : echo ? 1.5 : 2.0 + this.rnd() * 0.8, vx, vy: -(lk.rise || 0) * H * (0.6 + 0.8 * this.rnd()), font, wt, trk });
    if (this.items.length > 26) this.items.shift();
  }
  // t: seconds into the song (null: not playing). o: { style, keywords, acc, ink, flow, reduce, sub }
  update(dt, t, o) {
    this.resize();
    const x = this.x, W = this.c.width, H = this.c.height, dpr = this.dpr, lk = o.look || {}, streak = lk.streak ?? 1;
    x.clearRect(0, 0, W, H);
    if (t == null || o.style === 'off') { this.items.length = 0; this.lastT = t; return; }
    // which words were sung since the last frame (a jump - a needle drop - spawns nothing, it just moves the place)
    const jump = this.lastT == null || t < this.lastT - 0.05 || t - this.lastT > 0.6;
    for (let i = 0; i < this.lines.length; i++) {
      const l = this.lines[i];
      if (l.words[0].t > t + 0.01 || l.end < (this.lastT ?? t) - 1) continue;
      for (const wd of l.words) if (!jump && wd.t > this.lastT && wd.t <= t) this.spawn(wd.w, o);
    }
    this.lastT = t;
    const line = this.lines.find((l) => t >= l.t && t < l.end) || null;
    // the travelling words
    for (const it of this.items) {
      it.age += dt;
      it.x += it.vx * dt * (o.flow ?? 1); it.y += (it.vy || 0) * dt;
      const a = Math.min(1, it.age / 0.06) * Math.max(0, Math.min(1, (it.life - it.age) / 0.5));
      if (a <= 0) continue;
      const sc = it.big ? 1 + 0.25 * Math.exp(-it.age * 9) : 1;
      x.save(); x.translate(it.x, it.y); x.scale(sc * (it.big ? 1.08 : 1), sc);
      x.font = `${it.wt} ${Math.round(it.size)}px ${it.font}`; x.textBaseline = 'middle'; x.textAlign = 'left';
      x.letterSpacing = `${Math.round(it.size * (it.big ? 0.08 : 0.14) * it.trk)}px`;
      // streaks behind it, the way the current is going
      x.globalAlpha = a * 0.55 * streak; x.fillStyle = it.key ? o.acc : o.ink;
      if (streak > 0) for (let k = 0; k < 3; k++) { const yy = (k - 1) * it.size * 0.28, len = it.size * (2.5 + 2 * hash(k + it.size)); x.fillRect(-len - it.size * 0.3, yy - Math.max(1, it.size * 0.025), len, Math.max(1.5, it.size * 0.05)); }
      if (it.echo) for (let k = 3; k >= 1; k--) { x.globalAlpha = a * 0.16 * (4 - k); x.fillText(it.text, k * it.size * 0.05, -k * it.size * 0.42); x.fillText(it.text, -k * it.size * 0.05, k * it.size * 0.42); }
      x.globalAlpha = a; x.fillStyle = it.key ? o.acc : o.ink;
      if (it.big && !o.reduce && lk.chroma !== false) { x.globalAlpha = a * 0.5; x.fillStyle = '#ff2d55'; x.fillText(it.text, -it.size * 0.02, 0); x.fillStyle = '#3ad7ff'; x.fillText(it.text, it.size * 0.02, 0); x.globalAlpha = a; x.fillStyle = it.key ? o.acc : o.ink; }
      if (o.outline) { x.lineJoin = 'round'; x.lineWidth = it.size * 0.16; x.strokeStyle = o.outline; x.strokeText(it.text, 0, 0); }
      x.fillText(it.text, 0, 0);
      x.restore();
    }
    this.items = this.items.filter((it) => it.age < it.life);
    // the line being sung, small along the bottom, with how far through it we are
    if (line && o.sub !== false) {
      const fs = Math.round(12.5 * dpr), y = H - 64 * dpr;
      x.font = `${lk.weight || 400} ${fs}px ${lk.font || FONT}`; x.letterSpacing = `${Math.round(2.4 * dpr * (lk.track ?? 1))}px`; x.textAlign = 'center'; x.textBaseline = 'middle';
      const txt = lk.upper === false ? line.text : line.text.toUpperCase(), w = Math.min(W * 0.9, x.measureText(txt).width);
      const fade = Math.min(1, (t - line.t) / 0.2, (line.end - t) / 0.3);
      x.globalAlpha = Math.max(0, fade) * 0.92; x.fillStyle = o.ink;
      if (o.outline) { x.lineJoin = 'round'; x.lineWidth = fs * 0.3; x.strokeStyle = o.outline; x.strokeText(txt, W / 2, y, W * 0.9); }
      x.fillText(txt, W / 2, y, W * 0.9);
      const pr = Math.max(0, Math.min(1, (t - line.t) / Math.max(0.5, line.end - line.t - 1.2)));
      x.globalAlpha = Math.max(0, fade) * 0.35; x.fillRect(W / 2 - w / 2, y + fs * 1.2, w, Math.max(1, dpr));
      x.globalAlpha = Math.max(0, fade); x.fillStyle = o.acc; x.fillRect(W / 2 - w / 2, y + fs * 1.2 - dpr * 0.5, w * pr, Math.max(2, 2 * dpr));
      x.globalAlpha = 1;
    }
  }
}
