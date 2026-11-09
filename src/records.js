// The record shelf: one record per side of every Tame Impala era (src/catalog.js), plus the synthesised
// test pressing the page can always play.
//
// Tame Impala's audio is not shipped. `npm run import` copies your own copies into records/ and writes
// records/index.json (track stem -> file), then `npm run lathe` cuts each side into assets/<id>/. Both are
// git-ignored and left out of `npm run build`. A side that isn't there asks the visitor for their copies.
import { SIDES } from './catalog.js';

export const RECORDS = [
  { id: 'house', title: 'Test Pressing', by: 'synthesised', credit: 'Synthesised by this page, with a test band' },
  ...SIDES.map((s) => ({
    id: s.id, title: `${s.era.title} · Side ${s.side}`, by: String(s.era.year), era: s.era, side: s.side,
    credit: `Tame Impala · ${s.era.title} (${s.era.year}, ${s.era.label})`,
    tracks: s.tracks.map((t) => ({ title: t.title, file: t.file, n: t.n })),
  })),
];
