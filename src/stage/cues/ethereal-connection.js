// "Ethereal Connection" (Deadbeat, side C, track 3), choreographed by hand: seven and a half minutes of techno, one
// slow ride. The camera never stops circling the deck (three turns by the end, each act carrying it further round),
// a thread of light stands from the record to the sky, and the rig is left to `ride` the song map: it slams on and
// drops out with the track, bar by bar, so the acts only have to steer. Colour is teal and white, not the era's orange.
// Times are seconds into the track (map: assets/maps/deadbeat/09-ethereal-connection.json). Knobs: ../worlds/deadbeat.js.
//   0:00  dark: stars, a low moon, the thread coming up out of the record     0:29  the kick: a tent of beams over the deck
//   1:11  full: fans at the sky, lasers, a strobe on every beat      1:54  chase; the stacks grow
//   2:37  the breakdown and the first verse: close, everything off but the thread and what the crowd is holding up
//   3:13  the second verse over the beat      3:55  the first peak      4:24  a breath
//   4:38  the second peak     5:06  the long breath     5:35  the last peak: the tent again, the thread up its middle
//   6:03  the goodbye: lights out one at a time, the floor emptying, a first line of light in the east
//   7:11  the thread thins and goes
export default {
  title: 'Ethereal Connection',
  keywords: /^(magic|something|ride|goodbye|describe|side|time|happens|end|believe)$/i,
  acts: [
    { t: 0, palette: 'ether', ride: 1, stacks: 1.15, moon: 0.7, moonAz: 1.3, link: 0.3, beams: 1, beamForm: 3, strobe: 0.8, strobeRate: 0.5, laser: 0, work: 0, festoon: 0.2, smoke: 0.6, crowd: 0.9,
      torch: 0.3, shutter: 0.9, flow: 0.5, turb: 0.3, pulse: 1, spark: 1.1, camAz: 0, camEl: -0.3, camZoom: -0.05, drift: 0.02, bloom: 0.85, grain: 0.07, vig: 1, split: 0.25, mblur: 0.7, words: 'drift' },
    { t: 0.5, fadeIn: 27.5, camAz: 0.7, camEl: -0.5, camZoom: -0.4, link: 0.8, smoke: 0.9 },                          // pulling back; the thread
    { t: 28.55, fadeIn: 28, camAz: 2.0, festoon: 0.5 },                                                             // the kick
    { t: 56.99, fadeIn: 14, camAz: 2.5, laser: 0.6, camZoom: -0.3 },                                                // it thins: the lasers warm up
    { t: 71.22, fadeIn: 42, camAz: 4.7, strobeRate: 1, beamForm: 1, laser: 0.8, shutter: 1.1, camZoom: -0.52, flow: 0.8, turb: 0.6 },
    { t: 113.89, fadeIn: 36, camAz: 6.6, beamForm: 4, laser: 1, camEl: -0.56, turb: 0.9, stacks: 1.3 },
    { t: 149.89, fadeIn: 7, laser: 0.4, beamForm: 3 },
    // 2:37 the breakdown, the first verse: there is something, and he cannot describe it
    { t: 157.0, fadeIn: 35, camAz: 7.6, camZoom: -0.15, camEl: -0.36, link: 1.3, smoke: 1.1, laser: 0.5, calm: 0.5, turb: 0.4 },
    // 3:13 the second verse, over the beat: whatever happens
    { t: 192.55, fadeIn: 28, camAz: 9.2, camZoom: -0.5, camEl: -0.52, calm: 0, laser: 0.8, beamForm: 1, link: 0.9, turb: 0.7 },
    { t: 221.0, fadeIn: 14, camAz: 10.0, laser: 1, stacks: 1.4 },
    { t: 235.21, fadeIn: 28, camAz: 12.0, beamForm: 4, strobe: 1.1, camZoom: -0.6, turb: 1 },                         // the first peak
    { t: 263.66, fadeIn: 14, camAz: 12.5, camZoom: -0.2, camEl: -0.4, link: 1.5 },                                    // a breath
    { t: 277.89, fadeIn: 28, camAz: 14.6, camZoom: -0.6, camEl: -0.55, beamForm: 1, link: 0.9 },                      // the second peak
    { t: 306.33, fadeIn: 28, camAz: 15.5, camZoom: -0.25, camEl: -0.42, link: 1.5, dawn: 0.06 },                      // the long breath
    { t: 334.77, fadeIn: 28, camAz: 17.8, camZoom: -0.65, camEl: -0.56, beamForm: 3, stacks: 1.5, laser: 1, link: 1.1, dawn: 0.1 },   // the last peak
    // 6:03 goodbye
    { t: 363.23, fadeIn: 30, camAz: 18.6, camZoom: -0.2, camEl: -0.38, link: 1.4, calm: 0.7, crowd: 0.7, stacks: 1.2, festoon: 0.3, laser: 0.3, dawn: 0.14 },
    { t: 397.01, fadeIn: 33, camAz: 19.3, camZoom: -0.45, camEl: -0.5, crowd: 0.35, link: 1, festoon: 0.1, smoke: 0.6, beams: 0.3, laser: 0, dawn: 0.2 },
    { t: 430.79, fadeIn: 25, camAz: 19.7, camZoom: -0.7, crowd: 0.1, link: 0.2, stacks: 1, work: 0.3, dawn: 0.24, words: 'off' },
  ],
  events: [
    { t: 28.55, flash: 0.8 }, { t: 71.22, flash: 0.6 }, { t: 113.89, flash: 0.4 }, { t: 192.55, flash: 0.6 }, { t: 235.21, flash: 0.9 },
    { t: 277.89, flash: 0.9 }, { t: 334.77, flash: 1 }, { t: 363.23, flash: 0.3 },
  ],
};
