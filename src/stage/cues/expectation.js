// "Expectation" (Innerspeaker, side C, track 2), choreographed by hand: the sun at the end of the valley is the thing
// hoped for, and the fold is why it never arrives: always flying toward it, never any nearer. The valley rises and
// falls with the fluctuations of the chorus. Times are seconds into the track; sections from
// assets/maps/innerspeaker/08-expectation.json. Knobs: ../worlds/innerspeaker.js.
//   0:00  autumn, a low sun down the valley       0:10  the band: the floor starts to breathe
//   0:31  verse 1, doubt: cloud over the sun, and lightning twice (the line about a blow from overhead)
//   1:01  letting go: the leaves blow off; 1:22 the held word: everything hangs
//   1:28  the chorus: the whole valley heaving up and down, the sun flaring
//   1:50  a breath in the dusk; 2:10 the escape: flat out down an open valley
//   2:21  the loneliest line: night, the land far below, alone
//   2:51  the hope again: the valley tips up toward the sun, and an echo of the deck starts up out of the fold...
//   3:06  ...the held word, three times: it hangs halfway and the tube turns on the spot
//   3:22  the chorus, quietly, at dusk: the echo sinks back. 3:43 the chorus in full: closed, mirrored, heaving
//   4:15  the cost: it all runs down and stops. Embers, falling leaves, almost nothing
//   4:44  the long coda: light returns, the fold winds up again, and at last the deck climbs out of it into the gold
export default {
  title: 'Expectation',
  keywords: /^(lie|love|lose|above|holding|know|meanwhile|fluctuations|fluctuation|expectation|toll|soul|escape|universe|nobody|care|hair|old)$/i,
  acts: [
    { t: 0, palette: 'autumn', fold: 0.05, twist: 0, spin: 0, kalei: 0, kaleiN: 2, recur: 0, deep: 0, alt: 0, pitch: 0, yaw: 0, fluct: 0, storm: 0, echo: 0.17, twin: 0, flow: 0.3, turb: 0.1, calm: 0.25, cloud: 0.5, leaves: 0.35, sun: 0.7, spark: 0.5, pulse: 0.4, fade: 1,
      camAz: 0, camEl: 0.06, camZoom: -0.6, camRoll: 0, drift: 0.03, bloom: 0.55, vig: 0.65, grain: 0.04, split: 0.15, mblur: 0.45, words: 'drift' },
    // the band: the floor breathing already
    { t: 10.46, fadeIn: 1.5, fold: 0.35, twist: 0.15, flow: 0.9, calm: 0, turb: 0.3, fluct: 0.25, pulse: 1, spark: 0.8, leaves: 0.6, sun: 0.9, camZoom: -0.42 },
    { t: 21.18, fadeIn: 6, fold: 0.5, twist: 0.25, fluct: 0.4, camAz: 0.12 },
    // verse 1: doubt. Cloud over the sun
    { t: 31.31, fadeIn: 4, cloud: 0.9, sun: 0.4, storm: 0.12, fold: 0.42, fluct: 0.2, camAz: -0.1, camZoom: -0.38 },
    { t: 41.28, fadeIn: 3, storm: 0.3, turb: 0.5 },                            // the lightning lines (events)
    { t: 56.5, fadeIn: 4, storm: 0, turb: 0.3, cloud: 0.6, sun: 0.7 },
    // the letting-go line: the leaves blow off
    { t: 61.54, fadeIn: 3, leaves: 1, flow: 1.2, fold: 0.55, twist: 0.35, camAz: 0.15, camZoom: -0.45 },
    { t: 71.74, fadeIn: 5, palette: 'dusk', sun: 0.9, camAz: 0 },             // the wish line
    { t: 82.14, fadeIn: 2.5, recur: -0.8, fluct: 0.1, turb: 0.1, leaves: 0.4, camZoom: -0.3 },      // the held word
    // the chorus: fluctuations
    { t: 87.58, fadeIn: 1, palette: 'autumn', recur: 0.2, fluct: 1, fold: 0.6, twist: 0.45, flow: 1.1, turb: 0.6, leaves: 1, sun: 1.25, pulse: 1.2, cloud: 0.35, camZoom: -0.5, bloom: 0.8, split: 0.45, words: 'slam' },
    { t: 97.91, fadeIn: 3, camAz: -0.18, twist: 0.6 },
    { t: 102.76, fadeIn: 3, kalei: 0.8, kaleiN: 1, fluct: 0.5, words: 'drift', camAz: 0.1 },      // the first lines again, mirrored: which of them is true
    // a breath
    { t: 110.3, fadeIn: 2.5, palette: 'dusk', kalei: 0, fluct: 0.15, fold: 0.15, twist: 0.05, recur: -0.5, flow: 0.5, turb: 0.1, leaves: 0.4, sun: 0.7, pulse: 0.5, camAz: 0, camZoom: -0.36, bloom: 0.6, split: 0.15 },
    { t: 118.94, fadeIn: 5, palette: 'autumn', recur: 0, flow: 0.9, fold: 0.3, fluct: 0.3, pulse: 1, sun: 0.9 },
    // the escape: an open valley, flat out
    { t: 129.72, fadeIn: 3, fold: 0, twist: 0, fluct: 0, calm: 0.5, flow: 1.6, recur: 0.4, pitch: 0.16, sun: 1.3, cloud: 0.3, leaves: 0.8, camEl: -0.22, camAz: 0.08, camZoom: -0.36, bloom: 0.75, split: 0.4 },
    // the loneliest line: night, and the land a long way down
    { t: 140.97, fadeIn: 6, palette: 'ember', alt: 0.7, pitch: 0, calm: 0.2, flow: 0.6, recur: 0, echo: 0, sun: 0.5, cloud: 0.15, leaves: 0.3, camEl: 0.12, camAz: -0.1, camZoom: -0.95, bloom: 0.7, split: 0.2 },
    { t: 160.99, fadeIn: 6, palette: 'dusk', alt: 0.25, fold: 0.2, twist: 0.1, calm: 0, camZoom: -0.5, camEl: 0.06, camAz: 0.1, sun: 0.7, cloud: 0.4 },      // the shrug
    // the visit line: the valley tips up to the sun; an echo starts up out of the fold
    { t: 171.06, fadeIn: 7, palette: 'amber', alt: 0, pitch: 0.26, sun: 1.5, echo: 0.34, twin: 0.72, fold: 0.4, fluct: 0.3, flow: 1, leaves: 0.7, camAz: 0.22, camEl: 0.12, camZoom: -0.55, bloom: 0.85 },
    // the held word, three times: halfway, and turning on the spot
    { t: 185.48, fadeIn: 3, palette: 'autumn', recur: -0.9, spin: 0.5, fold: 0.85, twist: 0.5, fluct: 0.5, pitch: 0.2, sun: 1.1, camAz: 0.1, camEl: 0.08 },
    // the chorus, quietly: the echo sinks back
    { t: 202.41, fadeIn: 3, palette: 'dusk', recur: -0.3, spin: 0.1, twin: 0.15, echo: 0.17, fold: 0.45, twist: 0.3, fluct: 0.7, pitch: 0, flow: 0.7, sun: 0.7, leaves: 0.6, pulse: 0.6, camAz: -0.1, camEl: 0.06, camZoom: -0.4, bloom: 0.7 },
    // the chorus in full
    { t: 223.16, fadeIn: 0.8, palette: 'autumn', twin: 0, recur: 0.3, fluct: 1, fold: 0.8, kalei: 1, kaleiN: 2, twist: 0.6, spin: 0.25, flow: 1.2, turb: 0.6, leaves: 1, sun: 1.3, pulse: 1.2, echo: 0.6, camAz: 0, camZoom: -0.5, bloom: 0.85, split: 0.5, words: 'slam' },
    { t: 233.77, fadeIn: 0.3, kaleiN: 3, camAz: 0.16 },
    // running down
    { t: 243.59, fadeIn: 9, palette: 'dusk', fluct: 0.3, fold: 0.3, kalei: 0, twist: 0.1, spin: 0, recur: -0.85, flow: 0.5, turb: 0.1, sun: 0.5, pulse: 0.4, echo: 0.17, leaves: 0.7, camAz: 0, camZoom: -0.55, bloom: 0.6, split: 0.15, words: 'drift' },
    { t: 255.19, fadeIn: 6, palette: 'ember', fluct: 0, fold: 0, recur: -1, sun: 0.25, cloud: 0.2, leaves: 0.6, fade: 0.6, calm: 0.4, camZoom: -0.78, camEl: 0.1, drift: 0.02, words: 'off' },
    // the coda: the light comes back, the fold winds up once more
    { t: 284.32, fadeIn: 12, palette: 'dusk', recur: 0, fade: 1, flow: 0.6, fold: 0.3, twist: 0.15, calm: 0, sun: 0.7, pulse: 0.8, leaves: 0.7, cloud: 0.4, camZoom: -0.5, camEl: 0.06, drift: 0.04 },
    { t: 299.76, fadeIn: 13, palette: 'autumn', fold: 0.6, twist: 0.4, flow: 0.9, fluct: 0.3, echo: 0.5, turb: 0.4, sun: 0.9, pulse: 1, camAz: 0.14, bloom: 0.7 },
    { t: 315.19, fadeIn: 13, fold: 1, kalei: 1, kaleiN: 3, spin: 0.3, twist: 0.7, flow: 1.2, deep: 0.6, sun: 1.2, echo: 1, leaves: 1, pulse: 1.2, camAz: -0.12, camZoom: -0.45, bloom: 0.85, split: 0.4 },
    { t: 330.61, fadeIn: 10, palette: 'amber', pitch: 0.3, twist: 0.9, spin: 0.4, camAz: 0.1 },
    // ...and out of it, upward, into the gold
    { t: 344.32, fadeIn: 9, fold: 0, kalei: 0, twist: 0, spin: 0, fluct: 0, deep: 0, alt: 0.9, pitch: 0.5, cloud: 1, sun: 1.5, echo: 0, calm: 0.4, flow: 0.8, camAz: 0, camEl: -0.1, camZoom: -0.7, bloom: 1, split: 0.2 },
    { t: 355.5, fadeIn: 6, fade: 0.35, flow: 0.4, pulse: 0.3, leaves: 0.2 },
  ],
  events: [
    { t: 10.46, flash: 0.5 }, { t: 45.21, flash: 0.75, glitch: 0.3 }, { t: 55.47, flash: 0.75, glitch: 0.3 }, { t: 88.04, flash: 0.7, cut: { az: 0, el: 0.04, zoom: -0.55 } },
    { t: 110.3, flash: 0.3 }, { t: 129.17, flash: 0.5 }, { t: 187.47, flash: 0.4 }, { t: 223.49, flash: 0.85, cut: { az: 0, el: 0.04, zoom: -0.55 } }, { t: 233.77, flash: 0.5 },
    { t: 284.32, flash: 0.25 }, { t: 315.19, flash: 0.4 }, { t: 344.32, flash: 0.6 },
  ],
};
