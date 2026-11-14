// "The Boat I Row" (B-Sides & Rarities, side C, track 2), choreographed by hand: a journey under one's own power.
// The sheet is a sea chart and the deck is the boat: the chart slides under it with a pull on every bar, the oars
// leave a pair of rings astern on each stroke, and the course is plotted ahead in the one red, toward the blank
// label on the horizon. Times are seconds into the track; sections and downbeats are from its song map
// (assets/maps/rarities/08-the-boat-i-row.json), line starts from assets/lyrics/rarities/08-the-boat-i-row.json.
// Each act says only what changes (worlds/rarities.js lists the knobs; with `sea` up, `flow` is the rowing speed).
//   0:00  at rest on the chart, from above: a fan of bearings out of the deck, every way there is
//   0:13  verse 1: the experts stand up all round, stamped and metered
//   0:29  the monster: the light drops and their shadows reach across the sheet; 0:32 a blink of the negative
//   0:40  push off. The chart slides under, the course is plotted ahead
//   1:03  verse 2; 1:13 the line about the chosen way: the other bearings are gone; 1:22 the title line
//   1:26  the bridge: a storm on carbon paper, the sea standing up, and straight on through it
//   1:54  the calm after, from high above: the wake long behind
//   2:07  rowing again; the other bearings come back, and the course stays
//   2:32  the peak; 2:45 slack water
//   2:57  the last storm; 3:22 the sea drops, and from high up the whole chart: still rowing
//   3:46  the pencil lifts
export default {
  title: 'The Boat I Row',
  keywords: /^(ways|go|pro|obvious|know|monster|shadow|running|easy|hundred|thousand|chose|boat|row|endless|relentless|oblivious|breathless|onward)$/i,
  acts: [
    // at rest on the chart
    { t: 0, palette: 'paper', sea: 1, swell: 0.12, course: 0, bearings: 0.5, sleeves: 0, vu: 0, lissa: 0, chart: 0, lathe: 0, sweep: 0, typing: 0, stamp: 1, graph: 0.8, regmarks: 0.9, layout: 0, lowsun: 0.2, dial: 0, day: 0, pages: 0,
      flow: 0.12, turb: 0.3, pulse: 0.6, fade: 1, bloom: 0.5, vig: 0.6, grain: 0.05, split: 0.1, mblur: 0.4, camEl: 0.55, camZoom: -0.15, camAz: -0.3, drift: 0.02, words: 'drift' },
    { t: 6.78, fadeIn: 5, bearings: 1, camZoom: -0.3, camEl: 0.4 },
    // 0:13 verse 1: the experts stand round
    { t: 12.97, fadeIn: 1.5, sleeves: 0.9, vu: 1, flow: 0.15, camEl: -0.46, camZoom: -0.45, camAz: 0.1, drift: 0.05, pulse: 0.9 },
    { t: 22.46, fadeIn: 3, sleeves: 1, camEl: -0.5, camAz: 0.45 },
    { t: 28.77, fadeIn: 2.5, lowsun: 1, camEl: -0.5, camAz: -0.2, camZoom: -0.25 },            // the monster: long shadows
    { t: 31.93, fadeIn: 0.3, palette: 'flip', palFast: true },                                 // ...which is nothing: a blink of the negative
    { t: 35.09, fadeIn: 1.5, palette: 'paper', palFast: false, lowsun: 0.4, bearings: 0.4 },   // the verse's last line
    // 0:40 push off
    { t: 39.81, fadeIn: 2.5, flow: 0.9, course: 1, swell: 0.4, sleeves: 0.9, vu: 0, bearings: 0.25, camAz: -0.8, camEl: -0.5, camZoom: -0.4, pulse: 1 },
    { t: 52.45, fadeIn: 5, camAz: 0.3, camEl: -0.05, camZoom: -0.6, swell: 0.5 },              // from abeam and above: the oars, the rings, the wake
    // 1:03 verse 2
    { t: 63.5, fadeIn: 3, flow: 1, camAz: -1.15, camEl: -0.44, camZoom: -0.35 },
    { t: 72.97, fadeIn: 2, bearings: 0, camAz: -0.8, camEl: -0.5 },                           // the chosen way: the other bearings go
    { t: 82.45, fadeIn: 0.8, flow: 1.25, swell: 0.6, camZoom: -0.5, words: 'slam' },           // the title line
    // 1:26 the bridge: a storm on carbon paper
    { t: 85.61, fadeIn: 2, palette: 'flip', swell: 1, flow: 1.4, turb: 1, lowsun: 0.8, camEl: -0.4, camAz: -0.5, camRoll: 0.07, drift: 0.12, pulse: 1.2, words: 'drift', split: 0.35, bloom: 0.9 },
    { t: 98.24, fadeIn: 3, camAz: -1.2, camRoll: -0.08, camEl: -0.45 },
    { t: 107.71, fadeIn: 3, camAz: -0.8, camRoll: 0.04, flow: 1.6 },                           // the bridge's last line: faster
    // 1:54 the calm after
    { t: 114.03, fadeIn: 3, palette: 'paper', swell: 0.22, flow: 0.4, turb: 0.2, lowsun: 0.1, lissa: 0.5, sleeves: 0.5, camRoll: 0, camEl: 0.6, camZoom: -0.5, camAz: -0.4, drift: 0.02, pulse: 0.5, split: 0.1, bloom: 0.5 },
    { t: 120.34, fadeIn: 5, flow: 0.25, camZoom: -0.7, bearings: 0.5 },
    // 2:07 rowing again
    { t: 126.66, fadeIn: 1.5, flow: 1, swell: 0.5, lowsun: 0.5, lissa: 0, sleeves: 0.9, camEl: -0.46, camZoom: -0.45, camAz: -0.95, drift: 0.07, pulse: 1 },
    { t: 139.29, fadeIn: 3, bearings: 0.8, camAz: -0.3, camEl: -0.3 },           // verse 1 again: the bearings come back, the course stays
    // 2:32 the peak
    { t: 151.92, fadeIn: 0.8, flow: 1.3, swell: 0.7, lowsun: 1, bearings: 0.3, camAz: -1.3, camEl: -0.5, camZoom: -0.3, split: 0.3 },
    { t: 161.4, fadeIn: 2, bearings: 0, camAz: -0.8 },
    // 2:45 slack water
    { t: 164.56, fadeIn: 3, flow: 0.45, swell: 0.3, lowsun: 0.3, sleeves: 0.6, camEl: 0.2, camZoom: -0.5, camAz: -0.5, drift: 0.03, pulse: 0.6, split: 0.1 },
    // 2:57 the last storm
    { t: 177.19, fadeIn: 1.2, palette: 'flip', swell: 1, flow: 1.6, turb: 1, lowsun: 0.8, sleeves: 0.9, camEl: -0.44, camAz: -1, camRoll: 0.08, drift: 0.13, pulse: 1.3, split: 0.4, bloom: 1 },
    { t: 189.81, fadeIn: 3, camAz: -0.6, camRoll: -0.07, camEl: -0.48 },
    // 3:22 the sea drops, and from high up the whole chart
    { t: 202.45, fadeIn: 4, palette: 'paper', swell: 0.2, flow: 0.7, turb: 0.2, lowsun: 0.2, sleeves: 0.6, camRoll: 0, camEl: 0.5, camZoom: -0.75, camAz: -0.8, drift: 0.03, pulse: 0.6, split: 0.1, bloom: 0.5 },
    { t: 213.48, fadeIn: 8, camZoom: -0.95, camEl: 0.7, flow: 0.5 },
    // 3:46 the pencil lifts
    { t: 226.11, fadeIn: 7, fade: 0.25, flow: 0.2, course: 0.4, swell: 0.1, sleeves: 0 },
  ],
  events: [
    { t: 12.97, flash: 0.5 }, { t: 31.93, glitch: 0.6 }, { t: 39.81, flash: 0.6 }, { t: 74.55, flash: 0.5 }, { t: 82.45, flash: 0.8 },
    { t: 85.61, flash: 0.5, glitch: 0.7 }, { t: 114.03, flash: 0.5 }, { t: 126.66, flash: 0.6 }, { t: 151.92, flash: 0.9 },
    { t: 177.19, flash: 0.9, glitch: 0.6 }, { t: 202.45, flash: 0.7 },
  ],
};
