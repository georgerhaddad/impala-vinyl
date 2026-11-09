// Reads the title tag from the start of an audio file, so a dropped file can be matched to the catalogue
// even when its name is something like "track03.flac". ID3v2 (MP3), FLAC / Ogg Vorbis comments and
// MP4 (M4A) are understood; anything else returns '' and the file name is used instead.
const ascii = (b, o, n) => String.fromCharCode(...b.subarray(o, o + n));

function id3(b) {
  const v = b[3], flags = b[5], size = ((b[6] & 127) << 21) | ((b[7] & 127) << 14) | ((b[8] & 127) << 7) | (b[9] & 127);
  let o = 10;
  if (flags & 0x40 && v >= 3) o += v === 4 ? ((b[10] & 127) << 21) | ((b[11] & 127) << 14) | ((b[12] & 127) << 7) | (b[13] & 127) : 4 + ((b[10] << 24) | (b[11] << 16) | (b[12] << 8) | b[13]);
  const end = Math.min(b.length, 10 + size), short = v === 2;
  while (o + (short ? 6 : 10) <= end) {
    const id = ascii(b, o, short ? 3 : 4);
    if (!/^[A-Z0-9]{3,4}$/.test(id)) break;
    const n = short ? (b[o + 3] << 16) | (b[o + 4] << 8) | b[o + 5]
      : v === 4 ? ((b[o + 4] & 127) << 21) | ((b[o + 5] & 127) << 14) | ((b[o + 6] & 127) << 7) | (b[o + 7] & 127)
      : (b[o + 4] << 24) | (b[o + 5] << 16) | (b[o + 6] << 8) | b[o + 7];
    const body = o + (short ? 6 : 10);
    if (id === 'TIT2' || id === 'TT2') {
      const enc = b[body], raw = b.subarray(body + 1, body + n);
      const label = enc === 0 ? 'latin1' : enc === 1 ? 'utf-16' : enc === 2 ? 'utf-16be' : 'utf-8';
      return new TextDecoder(label).decode(raw).replace(/\0+$/, '').trim();
    }
    if (n <= 0) break;
    o = body + n;
  }
  return '';
}
function vorbis(b, o) {                          // a Vorbis comment block starting at o (little-endian lengths)
  const dv = new DataView(b.buffer, b.byteOffset), u32 = (p) => dv.getUint32(p, true);
  o += 4 + u32(o);
  const count = u32(o); o += 4;
  for (let i = 0; i < count && o + 4 <= b.length; i++) {
    const n = u32(o), s = new TextDecoder().decode(b.subarray(o + 4, o + 4 + n)); o += 4 + n;
    if (/^title=/i.test(s)) return s.slice(6).trim();
  }
  return '';
}
function flac(b) {
  for (let o = 4; o + 4 <= b.length;) {
    const last = b[o] & 128, type = b[o] & 127, n = (b[o + 1] << 16) | (b[o + 2] << 8) | b[o + 3];
    if (type === 4) return vorbis(b, o + 4);
    if (last) break;
    o += 4 + n;
  }
  return '';
}
function mp4(b) {                                // find moov/udta/meta/ilst/©nam/data
  const dv = new DataView(b.buffer, b.byteOffset);
  const walk = (o, end, path) => {
    while (o + 8 <= end) {
      const n = dv.getUint32(o), type = ascii(b, o + 4, 4), stop = n ? Math.min(end, o + n) : end;
      if (n < 8 && n !== 0) return '';
      if (type === '©nam') {
        const d = o + 8;
        if (ascii(b, d + 4, 4) === 'data') return new TextDecoder().decode(b.subarray(d + 16, stop)).trim();
      } else if (['moov', 'udta', 'ilst'].includes(type)) { const t = walk(o + 8, stop, path + '/' + type); if (t) return t; }
      else if (type === 'meta') { const t = walk(o + 12, stop, path + '/meta'); if (t) return t; }
      o = stop;
    }
    return '';
  };
  return walk(0, b.length, '');
}

export function readTitle(buf) {
  try {
    const b = new Uint8Array(buf, 0, Math.min(buf.byteLength, 4 << 20));
    if (ascii(b, 0, 3) === 'ID3') return id3(b);
    if (ascii(b, 0, 4) === 'fLaC') return flac(b);
    if (ascii(b, 4, 4) === 'ftyp') return mp4(new Uint8Array(buf));
    if (ascii(b, 0, 4) === 'OggS') { const i = ascii(b, 0, Math.min(b.length, 4096)).indexOf('\x03vorbis'); if (i >= 0) return vorbis(b, i + 7); }
  } catch {}
  return '';
}
