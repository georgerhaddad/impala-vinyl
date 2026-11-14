// "New Person, Same Old Mistakes" (Currents, side D, track 3), choreographed by hand: two sides. The river divides
// round the deck into two streams of two colours running against each other, and the song is an argument between
// them; when it is over the river is one again, and runs the other way. Times are seconds into the track; sections
// and downbeats from assets/maps/currents/13-new-person-same-old-mistakes.json.
//   0:00  one river, mustard, heavy with the bass
//   0:41  verse 1: a hairline opens down the middle, and the near side starts to take another colour
//   1:09  the line about being of two minds: the river forks, the near stream turns and runs backwards, the orb divides in two
//   1:12  out of its depth: the near stream comes up over the deck
//   1:22  the chorus, call and answer, from above: the lead voice lights one stream, the voice that answers it the other
//   2:03  verse 2: the colour goes out of it, and at the line that refuses that, floods back
//   2:38  chorus 2, the same argument seen from the other bank
//   3:04  the bridge: the two streams wind round each other, a slow two-coloured whirlpool
//   4:02  the instrumental: a blue night, the streams close up, the river runs down to slack water under the stars,
//         and overhead the two orbs close into one       4:28  ...and it starts back the other way
//   4:39  the last section: one river, violet, running the other way, the wake on the other side, one orb
//   5:38  the fade: the hairline is opening again
export default {
  title: 'New Person, Same Old Mistakes',
  keywords: /^(person|mistakes|love|late|fake|right|flight|sides|deep|stake|demons|regrets|direction|far)$/i,
  acts: [
    // one river
    { t: 0, palette: 'night', flow: 0.25, turb: 0.1, calm: 0.3, spark: 0.4, fade: 0.65, orb: 0.3, rainbow: 0.5, camEl: -0.1, camAz: 0, camZoom: -0.2, drift: 0.03, pulse: 1.1, bloom: 0.8, words: 'drift' },
    { t: 3.17, fadeIn: 1, palette: 'mustard', palFast: true, flow: 0.65, turb: 0.45, calm: 0, fade: 1, spark: 0.75, camZoom: -0.35 },
    { t: 22.13, fadeIn: 9, palFast: false, camAz: 0.35, camEl: 0.05, camZoom: -0.5, flow: 0.75, drift: 0.05 },
    // verse 1: a hairline down the middle
    { t: 41.0, fadeIn: 7, fork: 0.14, flow: 0.5, turb: 0.3, camEl: 0.2, camZoom: -0.7, camAz: 0.1 },
    { t: 50.0, fadeIn: 3.4, camAz: 0.6, fork: 0.2 },                                           // the other way of looking at it
    { t: 53.5, fadeIn: 8, camAz: 0.9, fork: 0.38, flow: 0.65, turb: 0.5, spark: 0.9 },                    // the second colour gains
    { t: 62.7, fadeIn: 6, camAz: 0.2, camEl: -0.2, fork: 0.5, camZoom: -0.8 },
    // of two minds: the fork, the near stream turning back, the orb in two
    { t: 69.0, fadeIn: 3.5, fork: 0.9, counter: 1, orbTwin: 1, orb: 0.36, camAz: 0.1, camEl: -0.54, camZoom: -0.9, drift: 0.015 },
    // out of its depth: the near stream comes up over the deck
    { t: 72.6, fadeIn: 4.5, lift: -0.2, flow: 0.8 },
    // the last line of the verse: up, to where both streams can be seen; the bars of quiet before the chorus
    { t: 77.4, fadeIn: 5, lift: 0, fork: 0.55, camAz: 0, camEl: 0.5, camZoom: -1.15, flow: 0.4, turb: 0.2, spark: 0.5, drift: 0.02 },
    // the chorus: call (the far stream) and answer (the near one)
    { t: 82.6, fadeIn: 0.4, voice: 1, flow: 1.1, turb: 0.8, spark: 1, pulse: 1.2, bloom: 1, split: 0.5, words: 'slam' },
    { t: 84.7, fadeIn: 0.4, voice: -1 }, { t: 87.4, fadeIn: 0.4, voice: 1 }, { t: 91.0, fadeIn: 0.4, voice: -1 }, { t: 94.1, fadeIn: 0.4, voice: 1, camAz: 0.5, camEl: 0.4 },
    { t: 98.7, fadeIn: 0.4, voice: -1 }, { t: 100.4, fadeIn: 0.4, voice: 1 }, { t: 102.8, fadeIn: 0.4, voice: -1, camAz: -0.4, camEl: 0.58, camZoom: -1.25 }, { t: 105.9, fadeIn: 0.4, voice: -0.8 },
    { t: 108.97, fadeIn: 0.6, voice: 0.6 },
    // both at once, twice round
    { t: 111.0, fadeIn: 2, voice: 0, camAz: 0.3, camEl: 0.3, camZoom: -1.0, camRoll: 0.05, rainbow: 1 }, { t: 117.0, fadeIn: 2, camAz: -0.2, camRoll: -0.04 },
    // verse 2; and then what the others think of it: the colour goes out
    { t: 121.62, fadeIn: 3, fork: 0.55, camRoll: 0, camAz: 0, camEl: 0.5, camZoom: -1.0, flow: 0.6, turb: 0.35, pulse: 0.8, split: 0.2, drift: 0.04, words: 'drift' },
    { t: 125.8, fadeIn: 2.5, palette: 'mono', rainbow: 0 },
    { t: 133.85, fadeIn: 2, flow: 0.9, turb: 0.6, camAz: 0.3 },
    { t: 137.7, fadeIn: 0.6, palette: 'mustard', palFast: true, rainbow: 1, spark: 1, pulse: 1.1 },   // the colour comes back
    { t: 144.9, fadeIn: 6, palFast: false, camEl: 0.3, camAz: 0.7, camZoom: -0.9 },
    // the last line of the verse again: the two orbs over the two streams
    { t: 151.5, fadeIn: 5, fork: 0.9, camAz: 0.1, camEl: -0.54, camZoom: -0.9, flow: 0.4, turb: 0.2, drift: 0.015 },
    // chorus 2: the same argument from the other bank
    { t: 158.4, fadeIn: 0.4, voice: 1, flow: 1.15, turb: 0.9, pulse: 1.2, bloom: 1.05, split: 0.5, fork: 0.55, camAz: 3.0, camEl: 0.5, camZoom: -1.15, drift: 0.02, words: 'slam' },
    { t: 161.8, fadeIn: 0.4, voice: -1 }, { t: 163.7, fadeIn: 0.4, voice: 1 }, { t: 166.5, fadeIn: 0.4, voice: -1 }, { t: 170.9, fadeIn: 0.4, voice: 1, camAz: 2.5, camEl: 0.35 },
    { t: 174.7, fadeIn: 0.4, voice: -1 }, { t: 175.9, fadeIn: 0.6, voice: 0, camAz: 3.4, camRoll: 0.05 }, { t: 180.0, fadeIn: 0.4, voice: -0.8 },
    // the bridge: the two wind round each other
    { t: 184.41, fadeIn: 7, voice: 0, vortex: 0.55, fork: 0.7, flow: 0.5, turb: 0.25, rainbow: 0.5, palette: 'dusk', camRoll: 0, camAz: 3.3, camEl: 0.55, camZoom: -0.9, pulse: 0.7, split: 0.2, bloom: 0.9, words: 'drift' },
    { t: 203.6, fadeIn: 10, vortex: 0.9, camEl: 0.3, camAz: 3.9, camZoom: -0.7 },             // the bridge's second couplet
    { t: 216.2, fadeIn: 10, vortex: 0.7, camAz: 4.7, camEl: 0.0 },
    { t: 228.5, fadeIn: 9, vortex: 1, camAz: 5.6, camEl: 0.45, camZoom: -1.0 },
    // the instrumental: a blue night comes down, the streams close up, the river runs down to nothing
    { t: 242.77, fadeIn: 9, vortex: 0, fork: 0.35, counter: 0.5, palette: 'midnight', stars: 0.8, flow: 0.2, turb: 0.1, calm: 0.5, spark: 0.4, camAz: 6.38, camEl: -0.56, camZoom: -0.95, drift: 0.015 },
    // slack water; overhead the two orbs close into one
    { t: 254.27, fadeIn: 9, fork: 0, orbTwin: 0, orb: 0.4, reverse: 0.5, calm: 0.9, flow: 0.1, camEl: -0.58, camZoom: -1.1 },
    // ...and the river starts back the other way
    { t: 268.49, fadeIn: 9, reverse: 1, counter: 0, calm: 0.3, flow: 0.45, palette: 'violet', stars: 0, spark: 0.7, camEl: 0.25, camAz: 6.1, camZoom: -0.7, drift: 0.03 },
    // the last section: the other way
    { t: 279.53, fadeIn: 1, calm: 0, flow: 1.15, turb: 0.9, rainbow: 1, spark: 1, pulse: 1.2, bloom: 1.05, split: 0.5, camAz: 6.18, camEl: -0.32, camZoom: -0.45, drift: 0.08, words: 'slam' },
    { t: 291.2, fadeIn: 3, camAz: 6.8, camEl: 0.2, camZoom: -0.7 },                           // from above: the wake on the other side
    { t: 301.4, fadeIn: 5, camAz: 5.9, camEl: -0.42, camZoom: -0.5, words: 'drift' },
    { t: 309.2, fadeIn: 3, camAz: 6.5, camZoom: -0.3, palette: 'lilac', words: 'slam' },
    { t: 320.2, fadeIn: 6, camAz: 6.0, camEl: -0.1, camZoom: -0.6 },
    { t: 333.1, fadeIn: 4.5, palette: 'violet', flow: 0.8, turb: 0.5, words: 'drift' },
    // the fade: the hairline opens again
    { t: 337.93, fadeIn: 11, fork: 0.3, counter: 0.6, flow: 0.35, turb: 0.2, pulse: 0.5, fade: 0.55, palette: 'night', camEl: 0.25, camAz: 6.38, camZoom: -0.8, drift: 0.03, split: 0.1 },
    { t: 349.0, fadeIn: 8, fork: 0.5, fade: 0.3, words: 'off' },
  ],
  events: [
    { t: 3.17, flash: 0.5 }, { t: 53.71, flash: 0.3 }, { t: 69.51, glitch: 0.5 }, { t: 85.29, flash: 0.7 }, { t: 110.55, flash: 0.4 },
    { t: 121.62, flash: 0.3, cut: { az: 0, el: 0.5, zoom: -1.0 } }, { t: 138.59, flash: 0.5 }, { t: 160.69, flash: 0.7, cut: { az: 3.0, el: 0.5, zoom: -1.15 } }, { t: 176.49, flash: 0.4 },
    { t: 184.41, glitch: 0.5 }, { t: 242.77, glitch: 0.3 }, { t: 279.53, flash: 0.9, cut: { az: 6.18, el: -0.32, zoom: -0.45 } }, { t: 292.14, flash: 0.35 }, { t: 309.51, flash: 0.4 },
  ],
};
