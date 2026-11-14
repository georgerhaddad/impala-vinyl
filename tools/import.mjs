// Copies your own Tame Impala audio into records/ so the lathe can cut it, and writes records/index.json.
//
//   npm run import                      # looks in ~/Music
//   npm run import -- "path/to/music"   # or anywhere else (MUSIC_DIR works too)
//   MUSIC_SKIP="demos;bootlegs"         # folder names never read, separated by ;
//
// Every track in src/catalog.js is matched by title against the audio files it finds. A file only counts if
// something says it is Tame Impala: its name, a folder above it, or its artist tag (read with ffprobe).
// Lossless beats lossy, then the bigger file wins. MUSIC_DIR and MUSIC_SKIP can also go in a git-ignored .env.
// Nothing in your library is changed; records/ is git-ignored and never deployed.
import { spawnSync } from 'node:child_process';
import { copyFileSync, mkdirSync, readdirSync, statSync, writeFileSync, rmSync, existsSync } from 'node:fs';
import { homedir } from 'node:os';
import { join, extname, basename, dirname, relative } from 'node:path';
import { fileURLToPath } from 'node:url';
import { ALL_TRACKS, norm } from '../src/catalog.js';

const root = fileURLToPath(new URL('..', import.meta.url)), out = join(root, 'records');
try { process.loadEnvFile(join(root, '.env')); } catch {}
const music = process.argv[2] || process.env.MUSIC_DIR || join(homedir(), 'Music');
const SKIP_DIR = new Set(['.git', 'node_modules', ...(process.env.MUSIC_SKIP || '').split(';').map((s) => s.trim().toLowerCase()).filter(Boolean)]);
const AUDIO = /\.(flac|wav|aiff?|m4a|mp3|ogg|opus|aac)$/i, LOSSLESS = /\.(flac|wav|aiff?)$/i;
const SAYS_TI = /tame[\s_-]*impala|kevin parker/i;
const ffprobe = spawnSync('ffprobe', ['-version']).status === 0;

if (!existsSync(music)) { console.error(`no music folder at ${music}`); process.exit(1); }
console.log(`looking in ${music}`);

const files = [];
(function walk(dir, depth) {
  let ents; try { ents = readdirSync(dir, { withFileTypes: true }); } catch { return; }
  for (const e of ents) {
    const p = join(dir, e.name);
    if (e.isDirectory()) { if (!SKIP_DIR.has(e.name.toLowerCase()) && depth < 12) walk(p, depth + 1); }
    else if (e.isFile() && AUDIO.test(e.name)) files.push(p);
  }
})(music, 0);

const wanted = new Map(ALL_TRACKS.map((t) => [norm(t.title), t]));
const artistTag = (f) => {
  if (!ffprobe) return '';
  const r = spawnSync('ffprobe', ['-v', 'quiet', '-show_entries', 'format_tags=artist,album_artist', '-of', 'json', f], { encoding: 'utf8' });
  try { const t = JSON.parse(r.stdout).format?.tags || {}; return Object.entries(t).map(([, v]) => v).join(' '); } catch { return ''; }
};
const best = new Map();       // norm(title) -> { file, lossless, size }
for (const f of files) {
  const key = norm(basename(f));
  if (!wanted.has(key)) continue;
  const rel = relative(music, f);
  if (!SAYS_TI.test(rel) && !/deadbeat|innerspeaker|lonerism|currents|slow rush/i.test(dirname(rel)) && !SAYS_TI.test(artistTag(f))) continue;
  const c = { file: f, lossless: LOSSLESS.test(f), size: statSync(f).size };
  const was = best.get(key);
  if (!was || c.lossless > was.lossless || (c.lossless === was.lossless && c.size > was.size)) best.set(key, c);
}

rmSync(out, { recursive: true, force: true });
const index = {}, missing = [];
for (const [key, t] of wanted) {
  const b = best.get(key);
  if (!b) { missing.push(`${t.side.era.title} ${t.side.side}${t.n}: ${t.title}`); continue; }
  const name = t.file + extname(b.file).toLowerCase();
  mkdirSync(dirname(join(out, name)), { recursive: true });
  copyFileSync(b.file, join(out, name));
  index[t.file] = name;
  console.log(`  ${name.padEnd(64)} <- ${relative(music, b.file)}`);
}
writeFileSync(join(out, 'index.json'), JSON.stringify(index, null, 1));
console.log(`\n${Object.keys(index).length} of ${wanted.size} tracks copied into records/.`);
if (missing.length) console.log(`missing (those sides will ask for the files instead):\n  ${missing.join('\n  ')}`);
console.log('next: npm run lathe   (cuts every side that has all its tracks; needs ffmpeg)');
