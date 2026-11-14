// "My Old Ways" (Deadbeat, side A, track 1), choreographed by hand: the relapse. The work-light is the promise he
// made himself; the rave is the old ways. Times are seconds into the track; sections and downbeats are from its song
// map (assets/maps/deadbeat/01-my-old-ways.json), line starts from assets/lyrics. Knobs: ../worlds/deadbeat.js.
//   0:00  the piano demo: an empty clearing before anyone has come, the rig asleep, one work-light and its moths
//   0:37  the pre-chorus: the bulbs start to glow by themselves; on the line about sliding the camera sinks
//   1:02  the beat arrives, and the whole rave with it: stacks, strobes, a floor full of people
//   1:28  verse 2: it backs off, he looks about; 2:02 sliding again, lower, the stacks a little bigger
//   2:27  the chant: acid yellow, lasers, a flash on every beat, a new angle every four bars
//   3:22  the long instrumental: as deep as it goes, a tent of beams over the deck, the camera circling
//   3:52  the pre-chorus again, and a moment of clarity: the rig holds its breath, the work-light comes back on
//   4:10  the last refrains: the work-light goes out for good; the rig at its biggest
//   4:52  the song stops; the lights do not
export default {
  title: 'My Old Ways',
  keywords: /^(ways|again|human|never|temptation|sliding|powerless|descend|nothing|coping|blame)$/i,
  acts: [
    // the demo: nobody here yet
    { t: 0, palette: 'sodium', stacks: 1, work: 1, festoon: 0, smoke: 0.3, crowd: 0, torch: 0.05, shutter: 0.25, beams: 0, strobe: 0, flow: 0.25, turb: 0.1, pulse: 0.3, spark: 0.9, calm: 0.5,
      camAz: 0.3, camEl: -0.46, camZoom: -0.4, drift: 0.02, bloom: 0.65, grain: 0.08, vig: 1, split: 0.1, mblur: 0.8, words: 'drift' },
    { t: 15.31, fadeIn: 7, camZoom: -0.28, camEl: -0.4, smoke: 0.4 },                               // verse 1: closer
    // the pre-chorus: something is waking up out there
    { t: 36.87, fadeIn: 5, festoon: 0.15, camAz: 0.05, camZoom: -0.32 },
    { t: 47.8, fadeIn: 4, festoon: 0.45, beams: 0.15, beamForm: 3, smoke: 0.6, torch: 0.15 },        // the temptation line
    { t: 52.1, fadeIn: 8, camEl: -0.52, camZoom: -0.42, crowd: 0.4, beams: 0.3, work: 0.6, shutter: 0.6 },   // sliding: down we go
    { t: 60.14, fadeIn: 1.5, words: 'slam', festoon: 0.85, crowd: 0.65 },                             // the refrain, a bar early
    // 1:02 the beat
    { t: 62.31, fadeIn: 0.4, palette: 'flash', palFast: true, work: 0.1, festoon: 1, smoke: 0.9, crowd: 0.9, torch: 0.4, shutter: 1, beams: 1, beamForm: 1, strobe: 0.9, flow: 0.9, turb: 0.6, pulse: 1, calm: 0,
      camAz: 0, camEl: -0.5, camZoom: -0.5, drift: 0.08, bloom: 0.95, split: 0.4 },
    // verse 2: he takes a step back from it
    { t: 88.49, fadeIn: 3, palFast: false, words: 'drift', strobe: 0.4, beams: 0.7, beamForm: 2, torch: 0.3, shutter: 0.7, work: 0.3, camAz: 0.35, camEl: -0.38, camZoom: -0.3 },
    { t: 108.13, fadeIn: 3, camAz: -0.3, beams: 0.85, strobe: 0.5 },
    { t: 122.6, fadeIn: 7, camEl: -0.55, camZoom: -0.45, stacks: 1.15 },                              // sliding, again
    { t: 130.03, fadeIn: 1, words: 'slam', strobe: 1, beams: 1, beamForm: 1, crowd: 1, camAz: 0, work: 0, shutter: 1.1, torch: 0.45 },
    // 2:27 the chant: he knows what is coming
    { t: 147.59, fadeIn: 1, palette: 'acid', words: 'vocoder', strobe: 1.1, strobeRate: 1, beamForm: 4, laser: 0.7, turb: 1, flow: 1.2, drift: 0.1, glitch: 0.05, stacks: 1.2, trail: 0.2 },
    { t: 167.22, fadeIn: 2, stacks: 1.3, laser: 1, smoke: 1.2, camZoom: -0.6 },
    { t: 184.68, fadeIn: 2, camEl: -0.56, trail: 0.35 },
    // 3:22 the instrumental: all the way in
    { t: 202.13, fadeIn: 1.5, palette: 'flash', words: 'drift', strobeRate: 0, beamForm: 3, laser: 0.5, glitch: 0, trail: 0, camZoom: -0.55, camEl: -0.5, camAz: 0.3 },
    { t: 215.22, fadeIn: 15, camAz: 1.5 },
    // 3:52 "never again": for a moment he can see it for what it is
    { t: 232.15, fadeIn: 1.2, palette: 'sodium', work: 1, beams: 0.1, strobe: 0, laser: 0, festoon: 0.3, calm: 0.7, smoke: 0.8, shutter: 0.4, torch: 0.1, pulse: 0.4, flow: 0.3, turb: 0.1,
      camAz: 1.3, camEl: -0.3, camZoom: -0.2, drift: 0.03 },
    { t: 240.6, fadeIn: 7.5, camEl: -0.55, camZoom: -0.5, work: 0.35, beams: 0.5, festoon: 0.8, words: 'slam' },   // and down again
    // 4:10 the old ways, for good
    { t: 250.31, fadeIn: 0.4, palette: 'flash', palFast: true, work: 0, beams: 1.1, beamForm: 1, strobe: 1.1, laser: 0.6, festoon: 1, crowd: 1, calm: 0, smoke: 1.1, shutter: 1.3, torch: 0.5, stacks: 1.4,
      pulse: 1.1, flow: 1.1, turb: 0.9, bloom: 1, camAz: 1.3, camEl: -0.52, camZoom: -0.55, drift: 0.09 },
    { t: 265.58, fadeIn: 17, camAz: 2.6, camZoom: -0.65 },
    // 4:52 the song is over. The work-light stays off
    { t: 291.76, fadeIn: 3, palFast: false, words: 'off', strobe: 0, beams: 0.4, beamForm: 3, laser: 0, shutter: 0.6, torch: 0.15, camZoom: -0.75, drift: 0.03, flow: 0.3 },
  ],
  events: [
    { t: 62.31, flash: 0.8, cut: { az: 0, el: -0.5, zoom: -0.5 } }, { t: 88.49, flash: 0.3 }, { t: 130.03, flash: 0.5 }, { t: 132.31, flash: 0.6 },
    { t: 147.59, flash: 0.5, glitch: 0.5 }, { t: 158.49, cut: { az: 0.9, el: -0.45, zoom: -0.35 } }, { t: 167.22, flash: 0.4, cut: { az: -0.8, el: -0.55, zoom: -0.6 } },
    { t: 175.95, cut: { az: 1.9, el: -0.4, zoom: -0.3 } }, { t: 184.68, glitch: 0.6, cut: { az: 0, el: -0.56, zoom: -0.6 } }, { t: 193.41, cut: { az: -1.2, el: -0.5, zoom: -0.45 } },
    { t: 202.13, flash: 0.7 }, { t: 232.67, glitch: 0.4 }, { t: 250.31, flash: 0.9 }, { t: 267.76, flash: 0.4 }, { t: 291.76, flash: 0.3 },
  ],
};
