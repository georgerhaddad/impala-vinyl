// "Alter Ego" (Innerspeaker, side A, track 3), choreographed by hand: the other one. The fold keeps a copy of the
// turntable at every level; this is the song where one of them comes up out of it. Times are seconds into the track;
// sections are from its song map (assets/maps/innerspeaker/03-alter-ego.json). Knobs: ../worlds/innerspeaker.js.
//   0:00  dawn in the open valley, one small echo of the deck far down it
//   0:08  the band: the valley starts to curl, an echo more with every phrase
//   1:06  the first sung line, from a long way off: everything holds still, and the echoes stand in a line down the valley
//   1:43  the answering voice: the valley mirrored down its middle, one half the other's reflection
//   2:12  the dream line: an echo rises out of the fold and settles beside the deck, the deck in negative
//   2:34  the chorus: the land closes overhead into a turning kaleidoscope
//   2:47  night, the contours lit; the echoes go out one by one until only the twin is left
//   3:00  the line about its only judge: the twin goes too. Wide open sky, alone and fast
//   3:27  the parting line: mirrored again; 4:03 the twin comes back; 4:24 the last chorus, three ways round
//   4:38  backing out of the fold at dawn; the twin sinks away into it
export default {
  title: 'Alter Ego',
  keywords: /^(voice|afar|hard|long|meant|dream|next|alter|ego|love|yourself|nobody|part)$/i,
  acts: [
    // dawn, the open valley, one echo
    { t: 0, palette: 'dawn', fold: 0, twist: 0, spin: 0, kalei: 0, kaleiN: 1, recur: 0, echo: 0.17, twin: 0, flow: 0.3, turb: 0.1, calm: 0.3, cloud: 0.75, leaves: 0.2, sun: 0.5, spark: 0.4, pulse: 0.4, fade: 1,
      camAz: 0, camEl: 0.06, camZoom: -0.6, camRoll: 0, drift: 0.03, bloom: 0.5, vig: 0.65, grain: 0.035, split: 0.15, mblur: 0.45, words: 'drift' },
    // the band comes in: daylight, and the floor begins to curl
    { t: 7.89, fadeIn: 2, palette: 'sky', fold: 0.25, twist: 0.1, flow: 0.85, calm: 0, turb: 0.3, pulse: 0.9, spark: 0.8, leaves: 0.5, sun: 0.7, camZoom: -0.42, bloom: 0.55 },
    { t: 23.69, fadeIn: 6, fold: 0.45, twist: 0.25, flow: 1, echo: 0.34, camAz: 0.14 },
    { t: 38.58, fadeIn: 6, fold: 0.6, twist: 0.4, echo: 0.5, leaves: 0.7, camAz: -0.08, camZoom: -0.46 },
    { t: 53.46, fadeIn: 6, fold: 0.7, twist: 0.5, spin: 0.05, flow: 1.1, echo: 0.67, sun: 0.9 },
    // the distant voice: stillness, and the whole line of echoes down the valley, seen from the side
    { t: 66.33, fadeIn: 3.5, recur: -0.78, fold: 0.22, twist: 0.05, spin: 0, echo: 1, sun: 1.1, cloud: 0.2, calm: 0.3, turb: 0.1, leaves: 0.3, pitch: -0.04, yaw: -0.4, camAz: 0.05, camZoom: -0.85, drift: 0.02 },
    // the verse: moving again
    { t: 83.23, fadeIn: 2, recur: 0, fold: 0.5, twist: 0.3, flow: 0.95, calm: 0, turb: 0.35, echo: 0.6, leaves: 0.6, cloud: 0.45, sun: 0.85, pitch: 0, yaw: 0, camAz: 0, camZoom: -0.42, drift: 0.04 },
    // the answering voice: the valley and its reflection
    { t: 102.99, fadeIn: 3, kalei: 1, kaleiN: 1, fold: 0.58, camAz: -0.1 },
    { t: 118.57, fadeIn: 4, fold: 0.64, twist: 0.38, sun: 1 },
    { t: 125.52, fadeIn: 4, pitch: 0.1, bloom: 0.75 },                       // the line about being enough
    // the one from the dream: out of the fold, to sit alongside
    { t: 131.88, fadeIn: 7.5, twin: 1, kalei: 0.45, pitch: 0, camAz: 0.2, camZoom: -0.32, drift: 0.025 },
    { t: 144.3, fadeIn: 3, recur: -0.6, turb: 0.65, camRoll: 0.06 },          // the hesitation
    // the chorus: closed overhead, a kaleidoscope
    { t: 153.92, fadeIn: 0.8, cloud: 0.12, fold: 1, kalei: 1, kaleiN: 2, twist: 0.7, spin: 0.35, recur: 0.5, flow: 1.2, turb: 0.5, pulse: 1.2, echo: 1, sun: 1.1, camAz: 0, camZoom: -0.5, camRoll: 0, drift: 0.05, bloom: 0.85, split: 0.5, words: 'slam' },
    { t: 162.37, fadeIn: 3, camAz: -0.16, twist: 0.85 },
    // night: the contours lit, the judges going out one by one
    { t: 167.05, fadeIn: 2.5, palette: 'night', recur: -0.5, spin: 0.15, twist: 0.3, flow: 0.8, leaves: 0.3, sun: 0.7, pulse: 0.8, camZoom: -0.32, bloom: 0.9, split: 0.2, words: 'drift' },
    { t: 175.57, fadeIn: 4.4, echo: 0, kalei: 0.4, camAz: 0.18 },             // the judge line
    // alone: open sky
    { t: 179.97, fadeIn: 2, palette: 'sky', palFast: true, fold: 0.2, kalei: 0, twist: 0.1, spin: 0, recur: 0.4, flow: 1.2, cloud: 0.65, leaves: 0.8, sun: 1, pulse: 1, camAz: 0, camZoom: -0.58, drift: 0.05, bloom: 0.6, split: 0.4 },
    { t: 183.03, fadeIn: 4, twin: 0, palFast: false },
    { t: 190.46, fadeIn: 5, fold: 0.1, camZoom: -0.75, camEl: 0.12 },
    { t: 194.86, fadeIn: 10, fold: 0.45, twist: 0.3, flow: 1.3, camZoom: -0.45, camEl: 0.06, camAz: 0.12 },
    // the parting line: two halves again
    { t: 207.35, fadeIn: 5, kalei: 1, kaleiN: 1, fold: 0.55, camAz: -0.1 },
    { t: 215.32, fadeIn: 5, echo: 0.6, twist: 0.4 },
    { t: 222.77, fadeIn: 6, fold: 0.65, twist: 0.45, sun: 1.1 },
    { t: 237.17, fadeIn: 4, pitch: 0.1, bloom: 0.75 },
    // the one from the dream, again
    { t: 243.36, fadeIn: 7.5, twin: 1, kalei: 0.45, pitch: 0, camAz: 0.2, camZoom: -0.32, drift: 0.025 },
    { t: 259.12, fadeIn: 3, recur: -0.6, turb: 0.65, camRoll: -0.06 },
    // the last chorus: everything, three ways round, then four
    { t: 263.69, fadeIn: 0.8, cloud: 0.12, fold: 1, kalei: 1, kaleiN: 3, twist: 0.8, spin: 0.5, recur: 0.6, flow: 1.3, turb: 0.5, pulse: 1.2, echo: 1, sun: 1.2, camAz: 0, camZoom: -0.5, camRoll: 0, drift: 0.05, bloom: 0.95, split: 0.5, words: 'slam' },
    { t: 271.14, fadeIn: 0.3, kaleiN: 4, camAz: 0.15 },
    // out of the fold, backwards, at dawn
    { t: 278.47, fadeIn: 3.5, palette: 'dawn', fold: 0, kalei: 0, twist: 0, spin: 0, recur: -1.8, flow: 0.6, twin: 0, echo: 0.17, cloud: 0.85, leaves: 0.25, calm: 0.3, turb: 0.1, pulse: 0.3, sun: 0.8, fade: 0.8, camAz: 0, camZoom: -0.72, bloom: 0.6, split: 0.15, words: 'off' },
  ],
  events: [
    { t: 7.89, flash: 0.5 }, { t: 83.23, flash: 0.4 }, { t: 153.92, flash: 0.8, cut: { az: 0, el: 0.02, zoom: -0.55 } }, { t: 167.05, flash: 0.3 },
    { t: 179.97, flash: 0.7, cut: { az: 0.1, el: 0.08, zoom: -0.5 } }, { t: 263.69, flash: 0.9, cut: { az: 0, el: 0.02, zoom: -0.55 } }, { t: 271.14, flash: 0.5 }, { t: 278.47, flash: 0.4 },
  ],
};
