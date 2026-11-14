// "Dracula" (Deadbeat, side A, track 3), choreographed by hand: a night creature with the morning coming. The camera
// keeps its back to where the sun will rise and its face to a blood moon; every chorus is a run, a full turn of the
// clearing that comes round to the east exactly on the line about the view; and at the end the view wins.
// Times are seconds into the track (map: assets/maps/deadbeat/03-dracula.json). Knobs: ../worlds/deadbeat.js.
// camAz: 0 (and every 2 pi) faces the dawn; pi (and every odd pi) faces the moon.
//   0:00  the hook: red moon, flying foxes, the rig warming up       0:29  verse 1: one look east, a thin line of light, and back
//   0:42  the title line     0:47  the pre-chorus, in the dark: lights low, close
//   1:02  verse 2: back to the dark, the line on the horizon pushed down
//   1:34  chorus: the run, once round; 1:47 it comes out facing the first colour
//   1:53  the hook again, facing the moon      2:09  the bridge: almost nothing on, the sky getting lighter behind
//   2:40  the last choruses: three more runs, the sky brighter each time round, the moon going down
//   3:18  the last line: the sun comes over the ridge, and that is that
const PI = Math.PI;
export default {
  title: 'Dracula',
  keywords: /^(dracula|sunlight|sun|darkness|dark|daylight|light|run|spectacular|shadows|night|leave|blue)$/i,
  acts: [
    { t: 0, palette: 'blood', stacks: 1.1, moon: 1, moonAz: 3.3, bats: 1, dawn: 0.16, work: 0, festoon: 0.5, smoke: 0.7, crowd: 0.8, torch: 0.15, shutter: 0.6, beams: 0.4, beamForm: 3, strobe: 0.3,
      flow: 0.6, turb: 0.4, pulse: 0.9, spark: 1, camAz: PI, camEl: -0.54, camZoom: -0.45, drift: 0.035, bloom: 0.8, grain: 0.08, vig: 1, split: 0.3, mblur: 1, words: 'drift' },
    { t: 8.51, fadeIn: 1, beams: 0.8, beamForm: 1, strobe: 0.6, crowd: 1, torch: 0.3, shutter: 0.9 },                       // the groove
    // verse 1: the morning line. One look east
    { t: 28.85, fadeIn: 2.5, camAz: 2 * PI + 0.1, dawn: 0.3, strobe: 0.25, beams: 0.5, beamForm: 3, torch: 0.2 },
    { t: 37.2, fadeIn: 2, camAz: 3 * PI - 0.15, camZoom: -0.3, camEl: -0.46, torch: 0.5, strobe: 0.7, dawn: 0.24 },         // the shadows line: back, and the flash loves him
    { t: 41.9, fadeIn: 0.6, words: 'slam', strobe: 1, beams: 0.9, beamForm: 4 },                                             // the title line
    // the pre-chorus: in the dark he would never leave
    { t: 46.59, fadeIn: 2, words: 'drift', strobe: 0.15, beams: 0.35, beamForm: 3, torch: 0.08, festoon: 0.25, dawn: 0.2, smoke: 1, calm: 0.4, camAz: 3 * PI - 0.45, camZoom: -0.2, camEl: -0.42 },
    // verse 2: he runs back to the dark
    { t: 62.25, fadeIn: 1.5, dawn: 0.12, strobe: 0.7, beams: 0.9, beamForm: 1, torch: 0.35, calm: 0, festoon: 0.6, camAz: 3 * PI + 0.35, camZoom: -0.45, camEl: -0.54 },
    { t: 70.59, fadeIn: 4, camAz: 3 * PI + 0.9 },
    { t: 79.99, fadeIn: 2, strobe: 0.2, beams: 0.45, beamForm: 3, torch: 0.1, calm: 0.4, dawn: 0.26, camZoom: -0.25 },       // pre-chorus 2
    { t: 87.4, fadeIn: 6, camAz: 4 * PI - 0.25, dawn: 0.36 },                                                                // they both saw it coming: round to face it
    // 1:34 the chorus: run. Once round the clearing
    { t: 94.09, fadeIn: 0.5, words: 'slam', strobe: 1, beams: 1, beamForm: 4, torch: 0.5, shutter: 1.2, calm: 0, festoon: 0.9, camZoom: -0.45, camEl: -0.54 },
    { t: 94.8, fadeIn: 12.6, camAz: 6 * PI, dawn: 0.45 },
    { t: 106.59, fadeIn: 1.5, words: 'drift', strobe: 0.3, beams: 0.5, camZoom: -0.6 },                                       // the view
    // the hook again: the moon's side
    { t: 112.86, fadeIn: 1.5, camAz: 7 * PI, dawn: 0.32, strobe: 0.9, beams: 1, beamForm: 1, camZoom: -0.45 },
    // 2:09 the bridge: the question, with nearly everything off
    { t: 129.03, fadeIn: 2, strobe: 0, beams: 0.15, beamForm: 3, festoon: 0.2, torch: 0.08, work: 0.25, smoke: 1.1, calm: 0.7, crowd: 0.6, pulse: 0.4, dawn: 0.4, camAz: 7 * PI + 0.25, camZoom: -0.1, camEl: -0.4, drift: 0.025 },
    { t: 139.4, fadeIn: 2.5, beams: 0.5, festoon: 0.5 },
    { t: 142.07, fadeIn: 0.6, strobe: 0.6, beams: 0.8, beamForm: 3, crowd: 1, calm: 0, pulse: 1, torch: 0.3, work: 0, festoon: 0.7, dawn: 0.46, camZoom: -0.4, camEl: -0.52, drift: 0.035 },
    { t: 154, fadeIn: 6, camAz: 8 * PI - 0.2, dawn: 0.54 },                                                                   // coming from afar: round to face it again
    // 2:40 the last choruses: three runs, and it gets lighter every time he comes round
    { t: 160.33, fadeIn: 0.5, words: 'slam', strobe: 1.1, beams: 1.1, beamForm: 4, torch: 0.55, shutter: 1.3 },
    { t: 161, fadeIn: 12.4, camAz: 10 * PI, dawn: 0.62 },
    { t: 173.4, fadeIn: 11.7, camAz: 12 * PI, dawn: 0.72, moon: 0.45 },
    { t: 185.9, fadeIn: 2, strobe: 0.5, beams: 0.6, camZoom: -0.6 },
    { t: 188.01, fadeIn: 10, camAz: 14 * PI, dawn: 0.88, moon: 0, bats: 0.3, festoon: 0.3, crowd: 0.6, smoke: 0.5 },
    // 3:18 the sun
    { t: 198.43, fadeIn: 3, palette: 'dawn', words: 'drift', dawn: 1, strobe: 0, beams: 0, torch: 0, bats: 0, shutter: 0.2, festoon: 0, camZoom: -0.7, camEl: -0.5, drift: 0.02 },
  ],
  events: [
    { t: 8.51, flash: 0.4 }, { t: 41.9, flash: 0.7 }, { t: 62.77, flash: 0.3 }, { t: 94.09, flash: 0.8 }, { t: 106.59, flash: 0.4 }, { t: 112.86, flash: 0.6 },
    { t: 142.07, flash: 0.5 }, { t: 160.86, flash: 0.8 }, { t: 173.4, flash: 0.4 }, { t: 185.9, flash: 0.4 }, { t: 198.43, flash: 1 },
  ],
};
