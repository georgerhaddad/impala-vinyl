// Builds the static site into dist/: the page, its modules and the synthesised test pressing (assets/record.*).
// There is no bundler: the browser loads src/ as is.
//
// Tame Impala sides cut from your own library (assets/<side>/, records/) are left out, so a public deploy
// never serves the music; visitors bring their own files instead. `node build.mjs --with-audio` includes
// them, for a private build you only serve to yourself.
import { cpSync, existsSync, rmSync, readdirSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = fileURLToPath(new URL('.', import.meta.url)), dist = join(root, 'dist');
const withAudio = process.argv.includes('--with-audio');
if (!existsSync(join(root, 'assets/record.json'))) {
  console.error('the test pressing is not cut yet: run `node lathe.mjs` (needs ffmpeg) and commit assets/record.*');
  process.exit(1);
}

rmSync(dist, { recursive: true, force: true });
const skip = (src) => !/(\.building|\.tmp)$/.test(src);
for (const f of ['index.html', 'og.png', 'src']) cpSync(join(root, f), join(dist, f), { recursive: true, filter: skip });
for (const f of readdirSync(join(root, 'assets'))) if (/^record\./.test(f)) cpSync(join(root, 'assets', f), join(dist, 'assets', f));
for (const d of ['maps', 'lyrics']) if (existsSync(join(root, 'assets', d))) cpSync(join(root, 'assets', d), join(dist, 'assets', d), { recursive: true });   // song maps and lyric timings: no audio, no lyric text
let sides = 0;
if (withAudio) {
  for (const d of readdirSync(join(root, 'assets'), { withFileTypes: true })) {
    if (d.isDirectory() && existsSync(join(root, 'assets', d.name, 'record.json'))) { cpSync(join(root, 'assets', d.name), join(dist, 'assets', d.name), { recursive: true, filter: skip }); sides++; }
  }
  if (existsSync(join(root, 'records'))) cpSync(join(root, 'records'), join(dist, 'records'), { recursive: true });
}
console.log(`dist/: index.html, src/, assets/record.* (test pressing), assets/maps/, assets/lyrics/${withAudio ? `, ${sides} cut sides and records/ (PRIVATE: do not deploy publicly)` : ''}`);
