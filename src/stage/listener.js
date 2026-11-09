// From ilmc-vinyl (github.com/SunkenInTime/ilmc-vinyl, MIT, (c) 2026 Dara Adedeji): the deck's real output, as the scene hears it.
const BINS = 128, WAVE = 512;

export class Listener {
  constructor() {
    this.spec = new Float32Array(BINS);          // 0..1, log-spaced 30 Hz .. 16 kHz, smoothed
    this.peak = new Float32Array(BINS);          // falling peak caps
    this.wavL = new Float32Array(WAVE); this.wavR = new Float32Array(WAVE);
    this.level = 0; this.sub = 0; this.low = 0; this.mid = 0; this.high = 0;
    this.kick = 0; this.snare = 0; this.hat = 0;    // onset envelopes, 1 on a hit, decaying
    this.kicks = 0;                               // count of detected kicks
    this._avg = { low: 0, mid: 0, high: 0 }; this._prev = { low: 0, mid: 0, high: 0 };
  }
  attach(ctx, node) {
    if (this.ctx === ctx) return;
    this.ctx = ctx;
    const fft = this.fft = ctx.createAnalyser(); fft.fftSize = 4096; fft.smoothingTimeConstant = 0.5; fft.minDecibels = -90; fft.maxDecibels = -12;
    const split = ctx.createChannelSplitter(2), aL = this.aL = ctx.createAnalyser(), aR = this.aR = ctx.createAnalyser();
    aL.fftSize = aR.fftSize = 1024;
    node.connect(fft); node.connect(split); split.connect(aL, 0); split.connect(aR, 1);
    this.fbuf = new Float32Array(fft.frequencyBinCount); this.tL = new Float32Array(1024); this.tR = new Float32Array(1024);
    const hz = ctx.sampleRate / fft.fftSize;
    this.map = Array.from({ length: BINS + 1 }, (_, i) => Math.max(1, Math.round(30 * Math.pow(16000 / 30, i / BINS) / hz)));
    this.hzBin = (f) => Math.round(f / hz);
  }
  update(dt) {
    if (!this.fft) return;
    const f = this.fbuf; this.fft.getFloatFrequencyData(f);
    const db = (i) => Math.max(0, Math.min(1, (f[i] + 90) / 78));
    for (let b = 0; b < BINS; b++) {
      let m = 0; for (let i = this.map[b]; i <= Math.max(this.map[b], this.map[b + 1] - 1); i++) m = Math.max(m, db(i));
      m = Math.pow(m, 1.6) * (0.75 + 0.5 * b / BINS);        // tilt: the top end is quieter on any record
      this.spec[b] += (m - this.spec[b]) * (m > this.spec[b] ? 0.7 : 0.25);
      this.peak[b] = Math.max(this.spec[b], this.peak[b] - dt * 0.6);
    }
    const band = (lo, hi) => { let s = 0, n = 0; for (let i = this.hzBin(lo); i <= this.hzBin(hi); i++) { s += Math.pow(10, f[i] / 20); n++; } return Math.sqrt(s / Math.max(1, n)); };
    const raw = { low: band(35, 130), mid: band(1500, 4500), high: band(7000, 14000) };
    const sub = band(25, 60);
    this.aL.getFloatTimeDomainData(this.tL); this.aR.getFloatTimeDomainData(this.tR);
    let rms = 0;
    for (let i = 0; i < WAVE; i++) { this.wavL[i] = this.tL[i * 2]; this.wavR[i] = this.tR[i * 2]; rms += this.tL[i * 2] ** 2 + this.tR[i * 2] ** 2; }
    rms = Math.sqrt(rms / (2 * WAVE));
    const k = 1 - Math.exp(-dt * 18);
    this.level += (Math.min(1, rms * 3.2) - this.level) * k;
    this.sub += (Math.min(1, sub * 14) - this.sub) * k;
    // onsets: a band jumping well above its own recent average
    const onset = (name, gain, thr) => {
      const v = raw[name], a = this._avg[name], p = this._prev[name];
      this._avg[name] = a + (v - a) * (1 - Math.exp(-dt * 3));
      this._prev[name] = v;
      return v > a * thr && v > p * 1.08 && v * gain > 0.12;
    };
    this.low += (Math.min(1, raw.low * 9) - this.low) * k; this.mid += (Math.min(1, raw.mid * 40) - this.mid) * k; this.high += (Math.min(1, raw.high * 90) - this.high) * k;
    const decay = Math.exp(-dt * 9);
    this.kick *= decay; this.snare *= decay; this.hat *= Math.exp(-dt * 16);
    if (onset('low', 9, 1.35) && this.kick < 0.5) { this.kick = 1; this.kicks++; }
    if (onset('mid', 40, 1.5) && this.snare < 0.5) this.snare = 1;
    if (onset('high', 90, 1.4) && this.hat < 0.5) this.hat = 1;
  }
}

