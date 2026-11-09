// Time-synced lyrics, fetched by the page from LRCLIB (lrclib.net, a free community database) when a song plays.
// The text is not stored in the repository; the browser keeps a copy so a song only asks once.
// LRCLIB times lines by hand, for some release of the song. Where tools/align-lyrics.py has listened to the track,
// assets/lyrics/<stem>.json has every word's time (times only, and a hash of each line's text, so they are only
// used on the same lyrics). Otherwise the words are spread over the line by their length.
const cache = new Map();
const KEY = (title) => 'lrc:' + title.toLowerCase();

export function parseLRC(text, dur) {
  const lines = [];
  for (const raw of (text || '').split(/\r?\n/)) {
    const m = raw.match(/^\[(\d+):(\d+(?:\.\d+)?)\]\s*(.*)$/);
    if (m) lines.push({ t: +m[1] * 60 + +m[2], text: m[3].trim() });
  }
  lines.sort((a, b) => a.t - b.t);
  const out = [];
  lines.forEach((l, i) => {
    const next = lines[i + 1]?.t ?? (dur || l.t + 6);
    if (!l.text || /^[♪♫\s]*$/.test(l.text)) return;             // instrumental markers
    const words = l.text.split(/\s+/), w = words.map((x) => 1 + x.replace(/[^a-z0-9]/gi, '').length);
    const sum = w.reduce((a, b) => a + b, 0), span = Math.min(next - l.t, Math.max(1.2, sum * 0.075));   // sung at roughly 13 letters a second
    let acc = 0;
    out.push({ t: l.t, end: Math.min(next, l.t + span + 1.2), text: l.text, words: words.map((x, k) => { const t = l.t + span * acc / sum; acc += w[k]; return { t, w: x }; }) });
  });
  return out;
}

// the line's words, as the aligner sees them (tools/align-lyrics.py norm_words), and its FNV-1a hash
const normWords = (s) => s.normalize('NFKD').toLowerCase().replace(/’/g, "'").replace(/[^a-z0-9' ]+/g, ' ').replace(/'/g, '').split(/\s+/).filter(Boolean);
function lineHash(text) {
  let h = 0x811c9dc5;
  for (const b of new TextEncoder().encode(normWords(text).join(' '))) h = Math.imul(h ^ b, 0x01000193) >>> 0;
  return h;
}
// put the aligner's word times on the lines they belong to (in order; a line whose text differs keeps its estimate)
function applyTimes(lines, tm) {
  if (!tm?.lines) return lines;
  let j = 0;
  for (const l of lines) {
    const h = lineHash(l.text);
    let k = j; while (k < tm.lines.length && tm.lines[k].h !== h) k++;
    if (k >= tm.lines.length) continue;
    const x = tm.lines[k]; j = k + 1;
    if (x.n !== l.words.length) continue;
    if (x.t) l.words.forEach((w, i) => { w.t = x.t[i]; });
    else l.words.forEach((w) => { w.t += x.s - l.t; });
    const last = l.words[l.words.length - 1].t;
    l.t = l.words[0].t - 0.12;                                   // the subtitle a moment before the first word
    l.end = Math.max(last + 0.9, x.e ? x.e + 0.4 : 0);
    l.aligned = true;
  }
  return lines;
}
const timings = (stem) => (stem ? fetch(new URL(`../../assets/lyrics/${stem}.json`, import.meta.url)).then((r) => (r.ok ? r.json() : null)).catch(() => null) : Promise.resolve(null));

export function loadLyrics(title, dur, stem) {
  if (cache.has(title)) return cache.get(title);
  const p = (async () => {
    const tm = timings(stem);
    try { const s = localStorage.getItem(KEY(title)); if (s) return applyTimes(parseLRC(s, dur), await tm); } catch {}
    const q = new URLSearchParams({ artist_name: 'Tame Impala', track_name: title });
    if (dur) q.set('duration', String(Math.round(dur)));
    let r = await fetch('https://lrclib.net/api/get?' + q);
    if (!r.ok) r = await fetch('https://lrclib.net/api/get?' + new URLSearchParams({ artist_name: 'Tame Impala', track_name: title }));   // duration off by more than LRCLIB allows
    if (!r.ok) return [];
    const j = await r.json(), text = j.syncedLyrics || '';
    try { if (text) localStorage.setItem(KEY(title), text); } catch {}
    return applyTimes(parseLRC(text, dur), await tm);
  })().catch(() => []);
  cache.set(title, p);
  return p;
}
