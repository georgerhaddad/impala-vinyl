# impala-vinyl

Tame Impala, every era, on a record player simulated "from the groove up". A fork of [rauchg/vinyl](https://github.com/rauchg/vinyl), in the spirit of [ilmc-vinyl](https://github.com/SunkenInTime/ilmc-vinyl).

The music isn't played back from a file. It is cut into a spiral groove, and a simulated stylus, cantilever, tonearm and cartridge read it back on the audio thread.

## What's here

- **The whole discography as records.** Each side of each era is its own record on the shelf, split the way the vinyl pressings split it:
  - the 2008 EP (2 sides)
  - *Innerspeaker*, *Lonerism*, *Currents*, *The Slow Rush* and *Deadbeat* (4 sides each)
  - a white-label *B-Sides & Rarities* (3 sides)
- **A label and a room per era.** Every label is drawn in code ([`src/label.js`](src/label.js)): a painted sun, a valley folding into itself, railings in summer light, flow lines bending round a chrome sphere, a room filling with sand, a speaker cone at 4 a.m. The page's accent colour, type and the glow around the deck change with the record. These are original fan designs that nod to each era; none of the real artwork is used.
- **No Tame Impala audio in this repository.** Your own library is cut locally. Anyone else gets a prompt to bring their own files, which are matched to the catalogue by title tag or file name ([`src/tags.js`](src/tags.js)), put in album order and cut in the browser. Nothing is uploaded.

## The music video (Currents, so far)

On a Currents side the deck plays inside a music video ([`src/stage/`](src/stage/)), after [ilmc-vinyl](https://github.com/SunkenInTime/ilmc-vinyl)'s room:

- **The world.** The turntable floats over a river of flow lines that parts round it, like the sphere on the Currents cover. The wake behind it goes turbulent and rainbow-coloured, and a chrome orb hangs in the sky ([`worlds/currents.js`](src/stage/worlds/currents.js)).
- **Everything follows the needle.** Scratch the record and the video runs backwards, stop the platter and it freezes, drop the needle and it jumps.
- **"Let It Happen" is a journey off the ground**, choreographed by hand ([`cues/let-it-happen.js`](src/stage/cues/let-it-happen.js)):
  - The whirlwind lifts the deck off the river, it takes off, climbs through the clouds into space, and a planet rises beneath ([`worlds/space.js`](src/stage/worlds/space.js)).
  - At 3:49, where the record sticks on one beat, the camera goes down the stylus into the groove. The canyon's walls are the real cut under the needle, sampled as it plays, so they loop with the music ([`worlds/groove.js`](src/stage/worlds/groove.js)).
  - At 4:43 it comes out at dawn in orbit; the planet's ring is a record.
  - Then hyperspace, a mustard nebula for the vocoder, a galaxy wound like a groove, and finally into the chrome sun.
- **Other songs follow the sections of their song map.** `npm run analyze` writes [`assets/maps/`](assets/maps/): beats, bars, sections, stuck loops and loudness envelopes. These are derived data, not audio, so they are committed and deployed.
- **Lyrics** come from [LRCLIB](https://lrclib.net) when a song plays; the text is not stored here. LRCLIB only times lines, by hand, so `npm run align` ([`tools/align-lyrics.py`](tools/align-lyrics.py)) listens to your copy of each song with Whisper (on the GPU) and times every sung word. It writes [`assets/lyrics/`](assets/lyrics/): word times and a hash of each line, no text. These are committed, so the public site is in sync too. One-time setup: `python -m venv tools/.venv`, then `tools/.venv/Scripts/pip install faster-whisper nvidia-cublas-cu12 "nvidia-cudnn-cu12==9.*"`. The first run downloads the large-v3 model, about 3 GB.
- `Video off` in the top bar, or `?plain`, turns it off. Flashing is toned down when the system asks for reduced motion.

## Running it with your own library

You need Node 22+ and `ffmpeg` on PATH.

```bash
$ npm run import    # find your Tame Impala files (default ~/Music) and copy them into records/
$ npm run lathe     # cut every side whose tracks were all found into assets/<side>/ (about 25 s per side)
$ npm run serve     # http://localhost:4173
```

What `npm run import` does:

- It matches each track in [`src/catalog.js`](src/catalog.js) to a file by title. A file only counts if its name, a folder above it, or its artist tag says Tame Impala.
- Lossless copies win over lossy ones.
- It never reads a folder named `tame impala unreleased`.
- To point it somewhere else: `npm run import -- "D:\Music"`, or set `MUSIC_DIR`.

What `npm run lathe` does:

- A loud side that doesn't fit on one side of a 12" disc is cut quieter until it does, as a mastering engineer would.
- Plain `node lathe.mjs` re-cuts only the synthesised test pressing; `node lathe.mjs currents-a` re-cuts just that side.

`records/` and `assets/<side>/` are git-ignored. They hold about 3.5 GB, and that is copyrighted music, so they are never committed and never deployed.

## Deploying

```bash
$ npm run build                      # dist/: the page, src/ and the test pressing; no music
$ node build.mjs --with-audio        # also your cut sides and records/: for a private build only
$ npm test                           # offline checks of the physics
```

On a public deploy the page opens on the synthesised test pressing. Picking any side asks for the visitor's own files.

## How it works

**1️⃣ Cut.** The lathe ([`src/cut.js`](src/cut.js)) turns audio into the shape of the two walls of a [45/45 stereo groove](https://en.wikipedia.org/wiki/Phonograph_record#Stereophonic_sound) at 33⅓ rpm: RIAA pre-emphasis, an acceleration limiter so the cutter could have cut it, and a spiral pitched so the side fits on a 12" disc.

**2️⃣ Press.** The pressing plant ([`src/press.js`](src/press.js)) changes the geometry itself: wall roughness, dust, scratches, warp, an off-centre hole, groove echo. Nothing in it is an audio effect. It's seeded, so the same record always presses the same way.

**3️⃣ Play.** The engine ([`src/engine.js`](src/engine.js), [`src/engine-core.js`](src/engine-core.js), [`src/groove.js`](src/groove.js)) rides the stylus over those walls. A tip of finite radius can't follow the wall exactly, and that's where tracing distortion, pinch effect and inner-groove loss come from. Too little tracking force and it leaves the wall.

**4️⃣ Draw.** The deck ([`src/render.js`](src/render.js), [`src/shaders.js`](src/shaders.js)) draws the disc from the cut itself: the actual spiral, lit by how hard each revolution is modulated.

## Records and the catalogue

- [`src/catalog.js`](src/catalog.js) lists the eras, their sides and track titles, and each era's theme.
- [`src/records.js`](src/records.js) turns every side into a shelf record.
- [`src/label.js`](src/label.js) has one painter per era.

To change a side, edit its titles in the catalogue, then run `npm run import` and `node lathe.mjs <side-id>` (for example `node lathe.mjs currents-a`).

The cut ships as 16-bit [DPCM](https://en.wikipedia.org/wiki/Differential_pulse-code_modulation) inside FLAC, within a quarter of a nanometre of the cut wall, and the page presses it with a seed.

## Credits

- The record player, the physics and the rendering: [Guillermo Rauch's vinyl](https://github.com/rauchg/vinyl) (MIT).
- The idea of an artist-themed fork: [ilmc-vinyl](https://github.com/SunkenInTime/ilmc-vinyl).
- Music: Tame Impala (Kevin Parker). This is an unofficial fan project, not affiliated with the artist or the labels. Bring your own copies.
