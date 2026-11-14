// "Borderline" (The Slow Rush, side A, track 3), choreographed by hand: the line between day and night, and what
// is on the other side of it. Times are seconds into the track; sections are from its song map
// (assets/maps/slow-rush/03-borderline.json), acts start on its downbeats. The sun is placed by hand all the way
// (sunHold: 1, `hour` counted from noon; the sky turns once in 16 of these hours, so 12 is a high moon, 26.75 a sunrise).
//   0:00  golden hour in the room: low sun raking in from the left, the deck at the edge of a patch of light
//   0:25  the title line: the sun on the horizon, seen through the wall; the room goes red
//   0:45  over the line: the sun is gone. Dark, then a moon climbs on the other side (the loner verse)
//   1:21  the line that likens time to a train: days and nights strobe past
//   1:31  the chant: the room is gone, open dunes under the moon, the sand jumping
//   2:20  the line that greets the sun: the moon sets, it is dark, and the sun comes up on the far side
//   2:37  verse again, the morning after: the walls back, deeper in the sand than last night
//   2:57  the last choruses in full daylight, time running free; out under a high sun
export default {
  title: 'Borderline',
  keywords: /^(borderline|far|rushing|sunday|loner|rapture|time|train|loved|trust|sober|enough|sun)$/i,
  acts: [
    { t: 0, palette: 'dusk', paint: 0, sunHold: 1, hour: 4.4, haze: 1, pour: 0.3, storm: 0, rush: 0, open: 0, sand: 0.08, flow: 0.4, turb: 0.2, spark: 0.7, pulse: 0.6,
      camEl: -0.44, camZoom: -0.2, camAz: 0.5, drift: 0.03, bloom: 0.7, split: 0.2, vig: 0.75, grain: 0.05, words: 'drift' },
    { t: 5.36, fadeIn: 7, camAz: 0.8, camZoom: -0.35 },
    // on the borderline: the sun sits on the horizon
    { t: 24.95, fadeIn: 2.5, palette: 'ember', hour: 5.5, pour: 0.6, pulse: 1, camAz: 1.3, camEl: -0.5, camZoom: -0.45, bloom: 0.95 },
    // over it
    { t: 44.55, fadeIn: 4, palette: 'night', hour: 7, pour: 0.2, flow: 0.25, calm: 0.5, pulse: 0.6, spark: 1, camAz: 0.4, camEl: -0.42, camZoom: -0.25, bloom: 0.8 },
    { t: 49.45, fadeIn: 9, hour: 12.2, camAz: -0.3 },                               // moonrise, for the loner verse
    { t: 66.59, fadeIn: 1.5, pulse: 1, pour: 0.6, calm: 0, camAz: -0.6, camZoom: -0.4, bloom: 0.9 },
    { t: 76.39, fadeIn: 2, camZoom: -0.3 },
    // time, speeding by
    { t: 81.28, fadeIn: 1, rush: 2, turb: 0.8, flow: 1, camZoom: -0.55, split: 0.5 },
    // the chant: the walls are gone; open dunes under the moon
    { t: 91.07, fadeIn: 1.2, rush: 0, hour: 13, open: 1, pour: 0, turb: 0.4, pulse: 1.15, spark: 1, camEl: -0.5, camZoom: -0.55, camAz: 0.3, drift: 0.05, bloom: 0.9, split: 0.4 },
    { t: 108.22, fadeIn: 8, camAz: -0.4, hour: 14 },
    { t: 130.26, fadeIn: 4, calm: 0.7, flow: 0.2, pulse: 0.5, camZoom: -0.3 },
    // here it comes: moonset, the dark, sunrise on the far side
    { t: 140.05, fadeIn: 5, hour: 22.3, camAz: -1.0, camEl: -0.5, camZoom: -0.6, calm: 0.2 },
    { t: 144.95, fadeIn: 7, palette: 'dawn', hour: 26.75, camAz: -1.42, bloom: 1 },
    // the morning after, back indoors
    { t: 157.2, fadeIn: 5, open: 0, hour: 27.6, palette: 'day', sand: 0.3, pour: 0.5, haze: 1, flow: 0.5, pulse: 0.8, camAz: -0.5, camZoom: -0.35, camEl: -0.44, bloom: 0.7 },
    // the last choruses, by day
    { t: 176.79, fadeIn: 1.5, hour: 29, pour: 1, pulse: 1.1, flow: 1, turb: 0.6, camEl: -0.48, camZoom: -0.5, camAz: 0.2, bloom: 0.85, split: 0.4 },
    { t: 186.59, fadeIn: 3, rush: 0.35, camAz: -0.2 },
    { t: 204.95, fadeIn: 8, camAz: 0.35, sand: 0.42 },
    { t: 222.09, fadeIn: 6, rush: 0, hour: 31, haze: 1.1, bloom: 0.8, camZoom: -0.7, camEl: -0.44 },
    { t: 231.89, fadeIn: 5, fade: 0.45, words: 'off' },
  ],
  events: [
    { t: 24.95, flash: 0.5 }, { t: 44.55, flash: 0.25 }, { t: 66.59, flash: 0.4 }, { t: 81.28, glitch: 0.5 },
    { t: 91.07, flash: 0.8, cut: { az: 0.3, el: -0.5, zoom: -0.5 } }, { t: 152.3, flash: 0.3 }, { t: 176.79, flash: 0.7 }, { t: 222.09, flash: 0.4 },
  ],
};
