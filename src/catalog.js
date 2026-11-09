// The Tame Impala catalogue: every era, split into sides the way the vinyl pressings split them.
// Each side becomes one record on the shelf (src/records.js). The audio is NOT in this repository:
// `npm run import` copies it from your own music library into records/ (see tools/import.mjs), and
// anyone else can drop their own copies of a side's tracks onto the page.
//
// `theme` drives the page around the deck (index.html reads the CSS variables) and the paper label
// (src/label.js paints one design per era). The designs are original and only nod to each era.

export const ERAS = [
  {
    id: 'ep', title: 'Tame Impala EP', year: 2008, label: 'Modular',
    theme: {
      acc: '#f4c542', acc2: '#d8452b', tint: '#f4c542', bg: [0.012, 0.008, 0.006], font: '"Fredoka", ui-rounded, system-ui, sans-serif',
      blurb: 'A painted sun over wavy hills. Where it started.',
    },
    sides: {
      A: ['Half Full Glass Of Wine', 'Skeleton Tiger', 'Slide Through My Fingers'],
      B: ['41 Mosquitoes Flying In Formation', 'Wander'],
    },
  },
  {
    id: 'innerspeaker', title: 'Innerspeaker', year: 2010, label: 'Modular',
    theme: {
      acc: '#8fc3e6', acc2: '#c2412b', tint: '#8fc3e6', bg: [0.006, 0.009, 0.012], font: '"Oswald", "Arial Narrow", sans-serif',
      blurb: 'A valley that folds into itself, forever. Cloud on one disc, autumn on the other.',
    },
    sides: {
      A: ['It Is Not Meant To Be', 'Desire Be Desire Go', 'Alter Ego'],
      B: ['Lucidity', "Why Won't You Make Up Your Mind?", 'Solitude Is Bliss'],
      C: ["Jeremy's Storm", 'Expectation', 'The Bold Arrow Of Time'],
      D: ['Runway Houses City Clouds', "I Don't Really Mind"],
    },
  },
  {
    id: 'lonerism', title: 'Lonerism', year: 2012, label: 'Modular',
    theme: {
      acc: '#f2b48a', acc2: '#7fa35b', tint: '#e08a4f', bg: [0.010, 0.006, 0.010], font: '"Archivo Black", "Arial Black", sans-serif',
      blurb: 'Watching the crowd from the wrong side of the railings, in overexposed summer light.',
    },
    sides: {
      A: ['Be Above It', 'Endors Toi', 'Apocalypse Dreams'],
      B: ['Mind Mischief', 'Music To Walk Home By', "Why Won't They Talk To Me?"],
      C: ['Feels Like We Only Go Backwards', 'Keep On Lying', 'Elephant'],
      D: ["She Just Won't Believe Me", 'Nothing That Has Happened So Far Has Been Anything We Could Control', "Sun's Coming Up"],
    },
  },
  {
    id: 'currents', title: 'Currents', year: 2015, label: 'Modular / Interscope',
    theme: {
      acc: '#b79ad6', acc2: '#e0322b', tint: '#5b3a8c', bg: [0.008, 0.005, 0.014], font: '"Michroma", "Eurostile", sans-serif',
      blurb: 'Lines of flow bending around something solid. Turbulence in the wake.',
    },
    sides: {
      A: ['Let It Happen', 'Nangs', 'The Moment'],
      B: ["Yes I'm Changing", 'Eventually', 'Gossip'],
      C: ['The Less I Know The Better', 'Past Life', 'Disciples', "'Cause I'm A Man"],
      D: ['Reality In Motion', 'Love/Paranoia', 'New Person, Same Old Mistakes'],
    },
  },
  {
    id: 'slow-rush', title: 'The Slow Rush', year: 2020, label: 'Modular / Island',
    theme: {
      acc: '#d9a46b', acc2: '#c8352b', tint: '#c8352b', bg: [0.013, 0.006, 0.004], font: '"Syncopate", "Arial", sans-serif',
      blurb: 'Time piling up like sand in an empty room.',
    },
    sides: {
      A: ['One More Year', 'Instant Destiny', 'Borderline'],
      B: ['Posthumous Forgiveness', 'Breathe Deeper', "Tomorrow's Dust"],
      C: ['On Track', 'Lost In Yesterday', 'Is It True'],
      D: ['It Might Be Time', 'Glimmer', 'One More Hour'],
    },
  },
  {
    id: 'deadbeat', title: 'Deadbeat', year: 2025, label: 'Columbia',
    theme: {
      acc: '#f06a2a', acc2: '#f2d34b', tint: '#f06a2a', bg: [0.009, 0.008, 0.007], font: '"Archivo Black", "Arial Black", sans-serif',
      blurb: 'Speaker stacks in the bush at 4 a.m. Grain, flash and smoke.',
    },
    sides: {
      A: ['My Old Ways', 'No Reply', 'Dracula'],
      B: ['Loser', 'Oblivion', 'Not My World'],
      C: ['Piece of Heaven', 'Obsolete', 'Ethereal Connection'],
      D: ["See You on Monday (You're Lost)", 'Afterthought', 'End of Summer'],
    },
  },
  {
    id: 'rarities', title: 'B-Sides & Rarities', year: '2009–2023', label: 'white label',
    theme: {
      acc: '#e8e4dd', acc2: '#d8452b', tint: '#c4c0b9', bg: [0.006, 0.006, 0.006], font: '"Space Mono", ui-monospace, monospace',
      blurb: 'A white-label test pressing of the ones that got away.',
    },
    sides: {
      A: ['Sundown Syndrome', 'Remember Me', 'Beverly Laurel'],
      B: ['List Of People (To Try And Forget About)', 'Powerlines', "Taxi's Here"],
      C: ['Patience', 'The Boat I Row', 'No Choice', 'Wings Of Time'],
    },
  },
];

export const slug = (s) => s.normalize('NFKD').toLowerCase().replace(/['’]/g, '').replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
// what two titles are compared on: case, accents, punctuation, curly quotes and a leading "Tame Impala - " or "07 - " don't count
export const norm = (s) => s.normalize('NFKD').toLowerCase()
  .replace(/\.[a-z0-9]{2,4}$/, '').replace(/^\s*(tame impala\s*-\s*)?(\d{1,2}\s*[-._)]\s*)?(tame impala\s*-\s*)?/, '')
  .replace(/\s*[([](from|feat\b|ft\b|with\b|remaster)[^)\]]*[)\]]/g, '')      // "(From the Motion Picture ...)", "(feat. ...)"
  .replace(/[^a-z0-9]+/g, '');

// One entry per side: { id, era, side, title, tracks: [{ title, file, n }] }. `file` is under records/.
export const SIDES = ERAS.flatMap((era) => {
  let n = 0;
  return Object.entries(era.sides).map(([side, titles]) => ({
    id: `${era.id}-${side.toLowerCase()}`, era, side,
    tracks: titles.map((title) => ({ title, n: ++n, file: `${era.id}/${String(n).padStart(2, '0')}-${slug(title)}` })),
  }));
});
export const ALL_TRACKS = SIDES.flatMap((s) => s.tracks.map((t) => ({ ...t, side: s })));
const byNorm = new Map(ALL_TRACKS.map((t) => [norm(t.title), t]));
export const findTrack = (name) => byNorm.get(norm(name || '')) || null;
