// "End of Summer" (Deadbeat, side D, track 3: the last song on the record), choreographed by hand: the night ending.
// One thing happens, slowly, the whole way through: it gets light. It starts in the blue before dawn with the rig
// still going, and every act lets a little more morning in, until the beams and the bulbs mean nothing, the sun
// comes over the ridge on the line about making it brighter, and the last of the floor dances the final chant in
// daylight. (The world eases the dawn between acts by itself, so the steps below come out as one long sunrise.)
// Times are seconds into the track (map: assets/maps/deadbeat/12-end-of-summer.json). Knobs: ../worlds/deadbeat.js.
//   0:00  blue hour: a tired floor, the work-light, a few stars left          0:24  the beat
//   0:47  the verses, close in, the east going from grey to red                2:07  the pre-chorus, acid yellow
//   2:39  the chant: strobes on every beat, lasers, the rig's last big hour
//   3:17  the bottom drops out; the acid line climbs for half a minute, facing the colour in the east
//   3:48  the drop: the last of the night        4:26  the break: mist, a pink and orange sky, the lights going pale
//   5:00  it builds again under a bright sky     5:49  brighter: the sun comes over the ridge
//   6:23  the last chant, in daylight: no strobes, just the stacks, the dust and whoever is left
//   6:55  the song goes; a long way back, the clearing in the morning
export default {
  title: 'End of Summer',
  keywords: /^(summer|time|tomorrow|own|brighter|shadow|nothing|friend|bones|overwhelming|shallow|beside)$/i,
  acts: [
    { t: 0, palette: 'cold', stacks: 1.1, dawn: 0.14, bats: 0.2, work: 0.8, festoon: 0.6, smoke: 0.6, crowd: 0.55, torch: 0.12, shutter: 0.5, beams: 0.15, beamForm: 2, strobe: 0,
      flow: 0.35, turb: 0.2, pulse: 0.7, spark: 0.9, calm: 0.4, camAz: 0.25, camEl: -0.36, camZoom: -0.2, drift: 0.03, bloom: 0.7, grain: 0.07, vig: 0.95, split: 0.2, mblur: 0.8, words: 'drift' },
    { t: 23.77, fadeIn: 1, beams: 0.8, beamForm: 1, strobe: 0.5, crowd: 0.9, torch: 0.3, shutter: 0.9, festoon: 0.9, work: 0.3, calm: 0, dawn: 0.18, camAz: 0, camEl: -0.5, camZoom: -0.45, drift: 0.06 },
    // the verses
    { t: 47.07, fadeIn: 4, camZoom: -0.3, camEl: -0.42, camAz: -0.3, strobe: 0.35, dawn: 0.22 },
    { t: 78.31, fadeIn: 3, camAz: 0.1, camZoom: -0.5, camEl: -0.52, strobe: 0.6, beams: 1, dawn: 0.26 },
    { t: 95.17, fadeIn: 4, camAz: 0.45, camZoom: -0.3, camEl: -0.42, strobe: 0.35, beams: 0.8, dawn: 0.3 },
    { t: 110.5, fadeIn: 6, camZoom: -0.15 },                                                                              // arms around
    // 2:07 the pre-chorus
    { t: 126.91, fadeIn: 2, palette: 'acid', beamForm: 2, beams: 0.9, strobe: 0.5, dawn: 0.34, camAz: 0, camZoom: -0.4, camEl: -0.5 },
    { t: 150.71, fadeIn: 5, words: 'slam', festoon: 1, camZoom: -0.6 },                                                    // the title line: out of time
    // 2:39 the chant
    { t: 158.64, fadeIn: 0.5, words: 'vocoder', strobe: 1, strobeRate: 1, beams: 1.1, beamForm: 4, laser: 0.7, torch: 0.5, shutter: 1.2, turb: 0.9, flow: 1.1, dawn: 0.38, camZoom: -0.55, camEl: -0.54, drift: 0.09 },
    { t: 174.51, fadeIn: 2, words: 'drift', strobeRate: 0, beamForm: 1, laser: 0.4, camAz: -0.4 },
    // 3:17 the breakdown, and the long climb, looking east
    { t: 196.83, fadeIn: 1.5, strobe: 0, beams: 0.2, beamForm: 3, laser: 0, torch: 0.1, shutter: 0.5, calm: 0.5, work: 0.5, smoke: 0.9, festoon: 0.5, dawn: 0.44, camAz: 0.1, camZoom: -0.25, camEl: -0.45 },
    { t: 211.58, fadeIn: 16, beams: 0.9, strobe: 0.6, laser: 0.6, calm: 0, festoon: 1, turb: 0.8, dawn: 0.5, camZoom: -0.5, camEl: -0.55 },
    // 3:48 the drop
    { t: 228.07, fadeIn: 0.5, strobe: 1, strobeRate: 1, beams: 1.1, beamForm: 4, laser: 1, torch: 0.5, shutter: 1.3, work: 0, dawn: 0.54, camZoom: -0.6 },
    { t: 243.93, fadeIn: 18, camAz: 1.2, dawn: 0.58 },
    // 4:26 the break: morning colours
    { t: 265.75, fadeIn: 3, palette: 'dawn', strobe: 0, strobeRate: 0, beams: 0.25, beamForm: 2, laser: 0, torch: 0.05, shutter: 0.4, calm: 0.6, crowd: 0.6, smoke: 0.8, festoon: 0.6, bats: 0, dawn: 0.64,
      camAz: 0.15, camZoom: -0.3, camEl: -0.5, drift: 0.035 },
    { t: 299.47, fadeIn: 2, beams: 0.7, strobe: 0.4, calm: 0, crowd: 0.75, dawn: 0.7, camZoom: -0.5, camEl: -0.54, drift: 0.06 },
    { t: 315.34, fadeIn: 15, camAz: -0.35, dawn: 0.75 },
    { t: 333.19, fadeIn: 4, camAz: 0.05, camZoom: -0.35, dawn: 0.79, strobe: 0.2, festoon: 0.4 },                            // no shadow
    // 5:49 brighter
    { t: 349.06, fadeIn: 3, words: 'slam', dawn: 0.9, beams: 0.5, festoon: 0.25, camZoom: -0.55 },
    { t: 364.93, fadeIn: 3, words: 'drift', strobe: 0, beams: 0.2, calm: 0.5, dawn: 0.94, camZoom: -0.3, camEl: -0.45 },
    // 6:23 the last chant, in the sun
    { t: 382.77, fadeIn: 0.5, words: 'vocoder', calm: 0, crowd: 0.7, beams: 0.8, strobe: 0.3, pulse: 1.2, turb: 0.9, flow: 1.1, festoon: 0.15, smoke: 0.5, shutter: 0.3, dawn: 1, camZoom: -0.6, camEl: -0.55, drift: 0.1 },
    { t: 398.65, fadeIn: 14, camAz: 0.9 },
    // 6:55 morning
    { t: 414.51, fadeIn: 6, words: 'off', crowd: 0.3, beams: 0, strobe: 0, festoon: 0, calm: 0.6, pulse: 0.5, camAz: 0.3, camZoom: -0.85, camEl: -0.45, drift: 0.02 },
  ],
  events: [
    { t: 23.77, flash: 0.5 }, { t: 79.31, flash: 0.3 }, { t: 126.91, flash: 0.3 }, { t: 158.64, flash: 0.8 }, { t: 196.83, glitch: 0.4 },
    { t: 228.07, flash: 0.9 }, { t: 265.75, flash: 0.3 }, { t: 299.47, flash: 0.3 }, { t: 349.06, flash: 0.7 }, { t: 382.77, flash: 0.8 },
  ],
};
