// "Loser" (Deadbeat, side B, track 1), choreographed by hand: the one person at the party who is not at the party.
// The song map counts this one at double tempo (166 for 83), so `half` is on throughout and the hits below are on
// every other map downbeat. Times are seconds into the track (map: assets/maps/deadbeat/04-loser.json).
// Knobs: ../worlds/deadbeat.js.
//   0:00  close on the deck under the work-light, looking down; the rave is a blur at the edge of the frame
//   0:59  the chorus: pulled back and low, and there it all is, everybody dancing round him
//   1:21  verse 2: head down again      2:03  chorus 2
//   2:25  the bridge, the line about leaving alone: the lights go, the stacks go, the floor empties. He has walked
//         out into the bush: the party is a glow behind the trees, thumping, and overhead there are the stars
//   2:51  the last verse, still out there, turning back to look at the glow
//   3:17  wanted: the glow fades. One work-light, and the last word
export default {
  title: 'Loser',
  keywords: /^(loser|tragedy|crisis|closure|composure|alone|stars|night|needed|wanted|heart|mess|life|defeated)$/i,
  acts: [
    { t: 0, half: 1, palette: 'ember', stacks: 0.9, moon: 0.6, bats: 0.3, work: 0.9, festoon: 0.4, smoke: 0.6, crowd: 0.55, torch: 0.1, shutter: 0.5, beams: 0.2, beamForm: 2, strobe: 0,
      flow: 0.3, turb: 0.15, pulse: 0.6, spark: 0.8, calm: 0.3, camAz: 0.3, camEl: -0.15, camZoom: 0, drift: 0.025, bloom: 0.65, grain: 0.08, vig: 1.05, split: 0.15, mblur: 0.8, words: 'drift' },
    { t: 11.02, fadeIn: 2, beams: 0.5, crowd: 0.8, festoon: 0.7, strobe: 0.25, camZoom: -0.12, camEl: -0.22 },                // the beat: he does not look up
    { t: 34.9, fadeIn: 4, camAz: -0.25, camEl: -0.3, camZoom: -0.2, beams: 0.6, strobe: 0.35 },
    { t: 47.55, fadeIn: 5, camEl: -0.4, camZoom: -0.3, glitch: 0.04 },                                                         // a crisis
    // 0:59 the chorus: the whole floor, and him in the middle of it
    { t: 59.45, fadeIn: 1, palette: 'sodium', words: 'slam', beams: 1, strobe: 0.8, crowd: 1, torch: 0.45, shutter: 1, festoon: 1, work: 0.3, smoke: 0.95, pulse: 1, flow: 0.7, turb: 0.5, calm: 0, glitch: 0,
      camAz: 0, camEl: -0.52, camZoom: -0.55, drift: 0.07 },
    // verse 2
    { t: 81.13, fadeIn: 3, palette: 'ember', words: 'drift', beams: 0.4, strobe: 0.2, torch: 0.15, shutter: 0.6, work: 0.8, calm: 0.3, camAz: 0.5, camEl: -0.25, camZoom: -0.1, drift: 0.03 },
    { t: 98.5, fadeIn: 3, beams: 0.6, strobe: 0.35, camAz: 0.9, camEl: -0.35, camZoom: -0.25 },
    { t: 110.79, fadeIn: 5, camZoom: -0.35, camEl: -0.45 },
    { t: 123.07, fadeIn: 1, palette: 'sodium', words: 'slam', beams: 1, strobe: 0.9, torch: 0.5, shutter: 1.1, work: 0.2, calm: 0, camAz: 0.2, camEl: -0.52, camZoom: -0.55, drift: 0.08 },   // chorus 2
    // 2:25 he leaves alone. First the lights, then (in the dark) everything else
    { t: 145.15, fadeIn: 2.5, palette: 'cold', words: 'drift', beams: 0, strobe: 0, festoon: 0, crowd: 0, torch: 0.2, work: 0.35, shutter: 0.3, smoke: 0.25, calm: 0.8, pulse: 0.5, bloom: 0.75,
      far: 0.6, camAz: 0.1, camEl: -0.5, camZoom: -0.4, drift: 0.03 },
    { t: 148.37, fadeIn: 1.5, stacks: 0, far: 1, moon: 0.9, bats: 0.6, spark: 1.4 },
    { t: 162.47, fadeIn: 4, spark: 2, camEl: -0.58, camZoom: -0.6 },                                                           // the stars
    // the last verse: looking back at it
    { t: 171.51, fadeIn: 6, far: 1.3, torch: 0.3, work: 0.2, camAz: 0.25, camZoom: -0.5 },
    { t: 196.78, fadeIn: 6, far: 0.8, work: 0.6, camZoom: -0.25, camEl: -0.36 },                                               // needed
    { t: 209.09, fadeIn: 0.3, far: 0.15, work: 1, glitch: 0.25 },                                                              // the last word
    { t: 210.6, fadeIn: 3, glitch: 0, far: 0, work: 0.7, words: 'off', camZoom: -0.1, spark: 1 },
  ],
  events: [
    { t: 11.02, flash: 0.3 }, { t: 59.45, flash: 0.7 }, { t: 71.01, flash: 0.3 }, { t: 123.07, flash: 0.7 }, { t: 134.63, flash: 0.3 },
    { t: 145.48, glitch: 0.5 }, { t: 171.51, flash: 0.2 }, { t: 209.09, flash: 0.5, glitch: 1 },
  ],
};
