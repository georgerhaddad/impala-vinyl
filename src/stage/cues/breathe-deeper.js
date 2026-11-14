// "Breathe Deeper" (The Slow Rush, side B, track 2), choreographed by hand: a room that breathes, and colours that
// run. Times are seconds into the track; sections are from its song map (assets/maps/slow-rush/05-breathe-deeper.json),
// acts start on its downbeats. In the verses the room sits low in the sand; on every chorus it breathes in: the walls
// rise up out of it, the light opens out, and on the line about the colours the red paint runs to blue (and, the next
// time, back). The long instrumental coda is another song: the after-hours, in time-lapse.
//   0:00  dawn, the groove           0:18  verse 1, by day            0:57  the groove at full strength
//   1:13  chorus: the room breathes in; 1:20 the colours run: red to blue        1:31  verse 2 in the blue room
//   2:35  chorus: in again; the blue runs back to red          2:53  the breakdown: night, a moon, an hourglass
//   3:22  back in at dusk            3:40  chorus 3              4:35  the adults-and-children lines: night, nearly still
//   4:55  the build: wind gets up, the hourglass turns over
//   5:12  the coda: days going by; 5:31 backwards (the sand falls up); 5:44 forwards, the roof and the walls go
//   6:00  sunrise on open dunes
export default {
  title: 'Breathe Deeper',
  keywords: /^(breathe|deeper|undone|colours|run|fun|forever|special|groove|slow|woman|sun|children|livin'?)$/i,
  acts: [
    { t: 0, palette: 'dawn', paint: 0, hour: 0, sunHold: 0, haze: 0.8, pour: 0.25, storm: 0, rush: 0, open: 0, sand: 0.3, flow: 0.5, turb: 0.2, spark: 0.7, pulse: 0.8,
      camEl: -0.42, camZoom: -0.15, camAz: -0.2, drift: 0.03, bloom: 0.65, split: 0.2, vig: 0.75, grain: 0.05, words: 'drift' },
    { t: 17.79, fadeIn: 2, palette: 'day', pour: 0.6, flow: 0.8, pulse: 1, camZoom: -0.35, camAz: 0.15, camEl: -0.46 },
    { t: 36.09, fadeIn: 5, camAz: -0.25 },
    { t: 56.67, fadeIn: 1.5, pour: 1, turb: 0.6, bloom: 0.8, camZoom: -0.5, split: 0.4 },
    // chorus 1: in... and the colours run
    { t: 72.66, fadeIn: 3, sand: 0, haze: 1.3, palette: 'noon', camZoom: -0.6, camEl: -0.5, camAz: 0 },
    { t: 79.53, fadeIn: 5, paint: 1 },
    // ...and out. Verse 2, in the blue room
    { t: 90.95, fadeIn: 4, sand: 0.4, palette: 'day', haze: 0.9, pour: 0.7, camZoom: -0.3, camAz: 0.25, camEl: -0.45 },
    { t: 120.67, fadeIn: 2, pour: 1, camAz: -0.2, camZoom: -0.45 },
    { t: 150.38, fadeIn: 2, flow: 0.3, camZoom: -0.25 },                             // the slow line
    // chorus 2: in; the blue runs back
    { t: 154.95, fadeIn: 3, sand: 0, haze: 1.3, palette: 'noon', flow: 0.8, camZoom: -0.6, camEl: -0.5, camAz: 0.1 },
    { t: 161.81, fadeIn: 5, paint: 0 },
    // the breakdown: night comes down
    { t: 173.23, fadeIn: 4, palette: 'night', hour: 12, sand: 0.35, calm: 0.6, pour: 0.2, flow: 0.3, pulse: 0.6, spark: 1, glass: 1, camZoom: -0.2, camAz: 0.3, camEl: -0.42, bloom: 0.8 },
    { t: 183.53, fadeIn: 9, camAz: -0.3 },
    { t: 201.81, fadeIn: 2, palette: 'dusk', hour: 19, calm: 0, pour: 1, flow: 0.9, pulse: 1.1, glass: 0, camZoom: -0.5, camEl: -0.48, camAz: 0.1, bloom: 0.85, split: 0.4 },
    // chorus 3
    { t: 220.09, fadeIn: 3, sand: 0, haze: 1.4, paint: 1, camZoom: -0.65, camEl: -0.5 },
    { t: 236.09, fadeIn: 6, paint: 0, camAz: 0.3 },
    { t: 252.09, fadeIn: 8, sand: 0.3, camAz: -0.2, camZoom: -0.4 },
    // the last lines: night again, nearly still, the hourglass almost run out
    { t: 274.93, fadeIn: 4, palette: 'night', hour: 28, flow: 0.2, pour: 0.1, calm: 0.7, pulse: 0.4, glass: 1.3, camZoom: -0.15, camEl: -0.4, camAz: 0.25, haze: 0.9, bloom: 0.8, split: 0.2 },
    { t: 295.49, fadeIn: 14, storm: 0.45, turb: 1, calm: 0, glassTurn: 1, camZoom: -0.4, camAz: 0 },
    // the coda: the after-hours, in time-lapse
    { t: 312.37, fadeIn: 1, rush: 1.4, storm: 0.12, palette: 'day', paint: 1, pour: 1.3, flow: 1.2, pulse: 1.2, spark: 1, camEl: -0.5, camZoom: -0.55, camAz: 0.4, bloom: 0.9, split: 0.5 },
    { t: 330.65, fadeIn: 1, rush: -1.4, paint: 0, camAz: -0.4 },                     // and back the other way
    { t: 344.37, fadeIn: 2.5, rush: 1.8, open: 0.6, glass: 0, camAz: 0.2, camZoom: -0.7 },
    { t: 360.37, fadeIn: 7, rush: 0, open: 1, storm: 0, palette: 'dawn', sunHold: 1, hour: 26.8, pour: 0, flow: 0.4, pulse: 0.6, camAz: -1.35, camEl: -0.5, camZoom: -0.6, bloom: 1 },
    { t: 367.22, fadeIn: 5, fade: 0.5, words: 'off' },
  ],
  events: [
    { t: 17.79, flash: 0.35 }, { t: 56.67, flash: 0.5 }, { t: 72.66, flash: 0.4 }, { t: 120.67, flash: 0.4 }, { t: 154.95, flash: 0.4 }, { t: 201.81, flash: 0.6 }, { t: 220.09, flash: 0.4 },
    { t: 312.37, flash: 0.9, cut: { az: 0.4, el: -0.5, zoom: -0.5 } }, { t: 330.65, flash: 0.5, glitch: 0.6, cut: { az: -0.4, el: -0.5, zoom: -0.55 } }, { t: 344.37, flash: 0.6 }, { t: 360.37, flash: 0.4 },
  ],
};
