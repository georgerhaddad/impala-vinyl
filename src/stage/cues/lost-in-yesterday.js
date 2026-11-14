// "Lost In Yesterday" (The Slow Rush, side C, track 2), choreographed by hand: a memory replayed until it comes out
// better than it was. Times are seconds into the track; sections are from its song map
// (assets/maps/slow-rush/08-lost-in-yesterday.json), acts start on its downbeats. It starts where things really are:
// a ruin, the walls under the dunes, the colour bleached out. Then time runs backwards (rush < 0: the sun goes east,
// the sand falls upwards) and the room comes back out of the sand, and every time round it is rosier.
//   0:00  the present: open dunes, faded        0:07  the bass: time starts to run backwards
//   0:16  verse 1: the walls rise out of the sand        0:39  the line about bad memories turning good: the roof is back, rose light
//   0:55  the erase line: the picture smears          1:03  chorus: the replay, in full colour, sand streaming up to the ceiling
//   1:23  the same-day-again line: a jump cut back to where the chorus began
//   1:43  verse 2 (start over): the hourglass is turned over       2:12  the room repainted blue
//   2:32  chorus 2: brighter than it ever was; 2:50 the jump cut again
//   3:03  the break: the colour drains        3:19  the embrace-it/face-it outro: time runs forward at last
//   3:35  and the sand comes back up the walls; 3:56 the present again
export default {
  title: 'Lost In Yesterday',
  keywords: /^(heaven|hated|memories|great|embrace|erase|yesterday|someday|groundhog|planned|over|afraid|worry|face|mad|matters)$/i,
  acts: [
    { t: 0, palette: 'faded', paint: 0, sunHold: 1, hour: 4.5, open: 1, sand: 0.5, haze: 0.6, pour: 0, storm: 0, rush: 0, flow: 0.3, turb: 0.4, spark: 0.6, pulse: 0.7,
      camEl: -0.48, camZoom: -0.55, camAz: -0.4, drift: 0.03, bloom: 0.7, split: 0.2, vig: 0.85, grain: 0.07, words: 'drift' },
    { t: 7.27, fadeIn: 1.5, rush: -0.6, pulse: 1, camZoom: -0.45 },
    // verse 1: the room comes back
    { t: 15.61, fadeIn: 9, open: 0.45, sand: 0.35, rush: -0.35, camAz: -0.2 },
    { t: 31.37, fadeIn: 6, open: 0.2, sand: 0.25, camAz: -0.05 },
    { t: 39.23, fadeIn: 6, palette: 'dawn', open: 0, sand: 0.1, rush: 0, hour: 2.5, haze: 1, pour: 0.3, grain: 0.05 },
    { t: 45.13, fadeIn: 4, glass: 1, camZoom: -0.3, camAz: 0.2, camEl: -0.44 },
    { t: 54.96, fadeIn: 1, glitch: 0.15, trail: 0.35, fade: 0.8 },                   // erased
    // chorus: the replay
    { t: 62.84, fadeIn: 1.2, glitch: 0, trail: 0, fade: 1, palette: 'day', rush: -1, pour: 1, flow: 1, pulse: 1.1, camEl: -0.47, camZoom: -0.5, camAz: -0.25, bloom: 0.85, split: 0.4 },
    { t: 71.2, fadeIn: 11, camAz: 0.3 },
    { t: 83.0, fadeIn: 0.3, camAz: -0.25 },                                          // the same day again
    { t: 94.81, fadeIn: 3, rush: -0.4, pour: 0.6, pulse: 0.9 },
    // verse 2: to start over
    { t: 102.68, fadeIn: 5, palette: 'dawn', rush: -0.3, glassTurn: 1, pour: 0.4, flow: 0.6, camAz: 0.35, camZoom: -0.3, camEl: -0.44, bloom: 0.7 },
    { t: 118.41, fadeIn: 6, palette: 'day', haze: 1.2, camAz: 0 },
    { t: 132.19, fadeIn: 3, paint: 1, flow: 0.4, pour: 0.3, calm: 0.4, rush: 0 },   // rewritten
    { t: 140.05, fadeIn: 1, glitch: 0.15, trail: 0.35, fade: 0.8 },
    // chorus 2: better than it ever was
    { t: 151.85, fadeIn: 1.2, glitch: 0, trail: 0, fade: 1, calm: 0, palette: 'noon', rush: -1.2, pour: 1.2, flow: 1, pulse: 1.2, camEl: -0.48, camZoom: -0.55, camAz: 0.25, bloom: 0.95, split: 0.45 },
    { t: 159.72, fadeIn: 9, camAz: -0.25 },
    { t: 169.55, fadeIn: 0.3, camAz: 0.25, glassTurn: 2 },
    // the break: the colour drains out of it
    { t: 183.33, fadeIn: 4, rush: 0, palette: 'faded', paint: 0, flow: 0.3, pour: 0.2, pulse: 0.6, glass: 0, camZoom: -0.25, camEl: -0.4, bloom: 0.7, split: 0.2 },
    // the outro: face it. Time goes forward again, and the sand comes back
    { t: 199.07, fadeIn: 2, palette: 'day', rush: 0.5, pour: 1, flow: 1, pulse: 1.1, camZoom: -0.5, camEl: -0.47, camAz: -0.2, bloom: 0.85, split: 0.4 },
    { t: 214.8, fadeIn: 8, sand: 0.4, open: 0.3, camAz: 0.2 },
    { t: 228.57, fadeIn: 8, open: 0.7, sand: 0.5, palette: 'dusk', pour: 0.3 },
    { t: 236.44, fadeIn: 5, open: 1, rush: 0, palette: 'faded', camZoom: -0.6, camAz: -0.4, camEl: -0.48, grain: 0.07 },
    { t: 244.31, fadeIn: 4, fade: 0.5, words: 'off' },
  ],
  events: [
    { t: 7.27, flash: 0.3, glitch: 0.4 }, { t: 39.23, flash: 0.3 }, { t: 62.84, flash: 0.7 }, { t: 83.0, flash: 0.35, glitch: 0.7, cut: { az: -0.25, el: -0.47, zoom: -0.5 } },
    { t: 102.68, flash: 0.25 }, { t: 132.19, glitch: 0.4 }, { t: 151.85, flash: 0.8 }, { t: 169.55, flash: 0.35, glitch: 0.7, cut: { az: 0.25, el: -0.48, zoom: -0.55 } },
    { t: 199.07, flash: 0.7 }, { t: 236.44, flash: 0.5, glitch: 0.5 },
  ],
};
