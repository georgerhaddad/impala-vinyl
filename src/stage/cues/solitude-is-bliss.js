// "Solitude Is Bliss" (Innerspeaker, side B, track 3), choreographed by hand: nobody else in the picture. Every other
// song in the valley has echoes of the deck down the fold; here they are the crowd, and they never get near.
// Times are seconds into the track; sections from assets/maps/innerspeaker/06-solitude-is-bliss.json.
//   0:00  the riff alone: an open valley, an empty sky
//   0:28  verse 1: from straight above, the deck and its own shadow on the valley floor
//   0:46  the others: a line of echoes appears down the valley
//   0:56  the chorus: the whole world runs backwards, away from the deck, and the vanishing point retreats
//   1:14  verse 2 (space): the land drops away, the camera lets go of the deck, cloud below
//   1:33  the party line: shut inside a turning kaleidoscope at night, confetti, nobody else in it
//   1:41  chorus again    2:10  the riff: the valley curling
//   2:33  the bridge (the line about flowing): skimming a smooth floor, low and fast, in gold; then the climb
//   2:56  the watchers: echoes far below as the deck rises through the cloud
//   3:19  the last choruses: backing away, closing, mirrored    3:47  alone above the cloud
export default {
  title: 'Solitude Is Bliss',
  keywords: /^(shadow|kicks|friends|never|close|feel|space|breathe|soul|bliss|solitude|party|invited|flow|alone|free|watch)$/i,
  acts: [
    { t: 0, palette: 'sky', fold: 0, twist: 0, spin: 0, kalei: 0, kaleiN: 4, recur: 0, deep: 0, alt: 0, pitch: 0, echo: 0, flow: 0.4, turb: 0.1, calm: 0.25, cloud: 0.5, leaves: 0.2, sun: 0.6, spark: 0.5, pulse: 0.5, fade: 1,
      camAz: 0, camEl: 0.06, camZoom: -0.6, camRoll: 0, drift: 0.03, bloom: 0.5, vig: 0.65, grain: 0.035, split: 0.15, mblur: 0.45, words: 'drift' },
    // the band
    { t: 9.77, fadeIn: 1.5, fold: 0.3, twist: 0.12, flow: 0.9, calm: 0, turb: 0.3, pulse: 1, spark: 0.8, leaves: 0.5, sun: 0.8, camZoom: -0.42 },
    { t: 18.99, fadeIn: 6, fold: 0.46, twist: 0.22, camAz: 0.14 },
    // verse 1: looking down at its own shadow
    { t: 28.22, fadeIn: 3.5, fold: 0.12, twist: 0, calm: 0.45, flow: 0.7, leaves: 0.3, camAz: 0, camEl: 0.45, camZoom: -0.3, drift: 0.02 },
    { t: 37.35, fadeIn: 4, camEl: 0.62, camZoom: -0.18, camAz: -0.15 },
    // the others, down the valley
    { t: 46.13, fadeIn: 4, echo: 0.7, fold: 0.5, twist: 0.3, calm: 0, flow: 0.9, camEl: 0.05, camZoom: -0.42, camAz: 0.1, drift: 0.04 },
    // the chorus: nothing gets near. The world backs away
    { t: 55.62, fadeIn: 1, recur: -2.2, deep: 0.25, fold: 0.7, twist: 0.5, flow: 1.1, echo: 1, sun: 1.1, pulse: 1.1, turb: 0.5, leaves: 0.9, camAz: 0, camZoom: -0.5, bloom: 0.75, split: 0.45, words: 'slam' },
    { t: 65.1, fadeIn: 6, deep: 0.6, camAz: -0.2 },
    // verse 2: space
    { t: 74.12, fadeIn: 4, recur: 0, deep: 0, alt: 0.5, fold: 0, twist: 0, echo: 0, flow: 0.5, calm: 0.4, turb: 0.1, cloud: 0.9, leaves: 0.25, sun: 0.8, pulse: 0.5, camAz: 0.1, camEl: 0.1, camZoom: -0.78, bloom: 0.55, split: 0.15, words: 'drift' },
    { t: 79.03, fadeIn: 4, alt: 0.85, camZoom: -1.1, camEl: 0.22 },         // the out-of-body line
    { t: 87.95, fadeIn: 2.5, sun: 1.3, bloom: 0.85 },                      // the title line
    // the party line: shut in a kaleidoscope
    { t: 92.8, fadeIn: 2.5, palette: 'night', alt: 0, fold: 1, kalei: 1, kaleiN: 4, twist: 0.6, spin: 0.6, flow: 1, calm: 0, turb: 0.4, leaves: 1, cloud: 0.1, sun: 0.9, spark: 1, pulse: 1.2, camAz: 0, camEl: 0.04, camZoom: -0.36, bloom: 0.9 },
    // the chorus
    { t: 100.07, fadeIn: 1, palette: 'sky', palFast: true, fold: 0.7, kalei: 0, spin: 0, twist: 0.5, recur: -2.2, deep: 0.25, echo: 1, cloud: 0.5, sun: 1.1, pulse: 1.1, camZoom: -0.5, bloom: 0.75, split: 0.45, words: 'slam' },
    { t: 111.27, fadeIn: 6, deep: 0.6, camAz: 0.2 },
    { t: 120.53, fadeIn: 3, palFast: false, recur: 0, deep: 0, echo: 0, fold: 0.3, twist: 0.15, flow: 0.55, pulse: 0.6, leaves: 0.4, camAz: 0, camZoom: -0.4, bloom: 0.55, split: 0.15, words: 'drift' },
    // the riff
    { t: 129.79, fadeIn: 1.5, flow: 1.2, fold: 0.5, twist: 0.35, pulse: 1.2, turb: 0.5, leaves: 0.8, sun: 1, camZoom: -0.45, split: 0.4 },
    { t: 141.3, fadeIn: 6, fold: 0.64, twist: 0.45, spin: 0.1, camAz: -0.15 },
    // the bridge: low over a smooth floor, fast, in gold
    { t: 152.82, fadeIn: 5, palette: 'gold', fold: 0.1, twist: 0, spin: 0, calm: 0.75, turb: 0, flow: 1.6, recur: 0.5, pitch: 0.12, cloud: 0.5, leaves: 0.2, camAz: 0.05, camEl: -0.3, camZoom: -0.3, drift: 0.03, bloom: 0.7, split: 0.2, words: 'drift' },
    { t: 161.9, fadeIn: 5, alt: 0.2, camAz: 0.3, camRoll: 0.08 },
    { t: 171.19, fadeIn: 4.5, pitch: 0.42, alt: 0.6, cloud: 1, sun: 1.2, flow: 1.4, camRoll: 0, camAz: 0.1, camEl: -0.1 },     // the freedom line
    { t: 175.94, fadeIn: 5, echo: 1, alt: 0.9, camEl: 0.2, camAz: -0.2, camZoom: -0.5 },                                     // and the ones watching
    { t: 187.49, fadeIn: 6, palette: 'sky', pitch: 0, alt: 0.3, fold: 0.4, twist: 0.25, calm: 0, recur: 0, flow: 1, echo: 0.6, cloud: 0.6, camEl: 0.05, camAz: 0, camZoom: -0.42 },
    // the last choruses
    { t: 199.01, fadeIn: 1, alt: 0, recur: -2.2, deep: 0.3, fold: 0.75, twist: 0.55, flow: 1.2, echo: 1, sun: 1.2, pulse: 1.2, turb: 0.5, leaves: 1, camZoom: -0.5, bloom: 0.8, split: 0.5, words: 'slam' },
    { t: 208.25, fadeIn: 2, kalei: 0.7, kaleiN: 2, deep: 0.5, camAz: 0.18 },
    { t: 217.46, fadeIn: 2, kalei: 1, kaleiN: 3, fold: 1, spin: 0.3, deep: 0.7, camAz: -0.12 },
    // alone, above the cloud
    { t: 226.68, fadeIn: 2.5, fold: 0, kalei: 0, twist: 0, spin: 0, recur: -1, deep: 0, echo: 0, alt: 0.75, flow: 0.35, calm: 0.4, turb: 0.1, cloud: 1, leaves: 0.2, sun: 1, pulse: 0.3, fade: 0.85, camAz: 0, camEl: 0.12, camZoom: -1, bloom: 0.6, split: 0.15, words: 'off' },
  ],
  events: [
    { t: 9.77, flash: 0.5 }, { t: 55.95, flash: 0.7, cut: { az: 0, el: 0.04, zoom: -0.55 } }, { t: 65.16, flash: 0.3 }, { t: 90.25, flash: 0.45 }, { t: 92.57, glitch: 0.5 },
    { t: 100.07, flash: 0.8, cut: { az: 0.05, el: 0.04, zoom: -0.55 } }, { t: 111.31, flash: 0.3 }, { t: 129.79, flash: 0.5 }, { t: 199.01, flash: 0.8, cut: { az: 0, el: 0.04, zoom: -0.55 } },
    { t: 208.25, flash: 0.4 }, { t: 217.46, flash: 0.5 }, { t: 226.68, flash: 0.6 },
  ],
};
