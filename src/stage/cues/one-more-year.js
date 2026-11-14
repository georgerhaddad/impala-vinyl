// "One More Year" (The Slow Rush, side A, track 1), choreographed by hand: a year standing still. Times are seconds
// into the track; sections are from its song map (assets/maps/slow-rush/01-one-more-year.json), acts start on its
// downbeats. The sun is nailed in place for most of the song (sunHold): the day does not move, however much happens.
//   0:00  high noon, held. Nothing falls, nothing drifts: the gated choir, an hourglass, dust hanging in the light
//   0:29  the beat: sand starts to come down from the roof, in slow motion. The sun still does not move
//   1:47  the line about a fairground ride that never gets anywhere: one whole day wheels round in four seconds and lands on the same noon
//   2:00  the vow: the room at full blaze             2:27  the fear: everything slows almost to a stop
//   2:44  the refrain: the days start rolling by, one after another, and the sand creeps up the walls
//   3:32  the count (weeks, days, seasons): faster; on the seasons line the light changes with each bar
//   3:56  "from today": the year at full tilt, days strobing past, a sandstorm, the room going under
//   4:38  the last-time line: the rush stops, and for the first time the sun moves by itself: down
//   4:55  the last light on the horizon, over dunes where the room was; then night
export default {
  title: 'One More Year',
  keywords: /^(year|remember|ago|slow|rollercoaster|whim|die|fear|way|weeks|seasons|reason|today|last|time)$/i,
  acts: [
    { t: 0, palette: 'noon', paint: 0, sunHold: 1, hour: 0.6, haze: 0.95, pour: 0, storm: 0, rush: 0, open: 0, sand: 0.04, glass: 1, flow: 0.04, turb: 0, calm: 1, spark: 0.55, pulse: 0.3,
      camEl: -0.42, camZoom: -0.05, camAz: 0.14, drift: 0.012, bloom: 0.6, split: 0.15, vig: 0.75, grain: 0.05, words: 'drift' },
    { t: 14.35, fadeIn: 13, camZoom: -0.3, camAz: -0.06 },
    // the beat: the sand lets go
    { t: 29.07, fadeIn: 1.5, pour: 0.55, flow: 0.35, calm: 0.3, pulse: 0.9, spark: 0.8, camEl: -0.46, camZoom: -0.4 },
    // verse 1: where they stood a year ago
    { t: 63.29, fadeIn: 3, flow: 0.22, haze: 1.05, camAz: 0.22, camZoom: -0.25 },
    { t: 88.55, fadeIn: 2.5, pour: 0.7, flow: 0.35, camAz: -0.2, camZoom: -0.38 },
    // the loop: a day goes all the way round and comes back to exactly where it was
    { t: 107.5, fadeIn: 0.8, rush: 1.6, camZoom: -0.5 },
    { t: 111.71, fadeIn: 0.6, rush: 0 },
    // the vow
    { t: 120.12, fadeIn: 1.5, palette: 'day', pour: 1, flow: 0.5, calm: 0, turb: 0.4, pulse: 1, camEl: -0.48, camZoom: -0.5, camAz: -0.1, bloom: 0.8, split: 0.35 },
    { t: 134.86, fadeIn: 5, camAz: 0.25 },
    // the fear: slower and slower
    { t: 146.97, fadeIn: 3, flow: 0.16, pour: 0.4, turb: 0.1, camZoom: -0.2, camEl: -0.38, bloom: 0.65 },
    { t: 153.29, fadeIn: 5, haze: 1.2, camAz: 0 },
    // the refrain: one more, and one more: the days roll
    { t: 163.81, fadeIn: 2.5, rush: 0.45, sand: 0.15, pour: 0.6, flow: 0.5, turb: 0.3, haze: 1, camZoom: -0.45, camEl: -0.47, camAz: -0.15 },
    { t: 191.18, fadeIn: 2, rush: 0.8, sand: 0.3, pour: 0.9, pulse: 1, camAz: 0.2, bloom: 0.8 },
    // the count
    { t: 212.23, fadeIn: 1.5, rush: 1.5, sand: 0.4, storm: 0.15, camZoom: -0.55 },
    { t: 222.76, fadeIn: 0.3, palFast: true, palette: 'faded' },                    // four seasons, a bar each
    { t: 224.71, fadeIn: 0.3, palette: 'noon' },
    { t: 226.97, fadeIn: 0.3, palette: 'dusk' },
    { t: 229.07, fadeIn: 0.3, palette: 'day' },
    // from today: the year, running
    { t: 235.91, fadeIn: 1, palFast: false, glass: 0, rush: 2.2, pour: 1.3, sand: 0.52, storm: 0.3, turb: 0.9, flow: 1, pulse: 1.2, camEl: -0.5, camZoom: -0.6, camAz: 0.15, bloom: 0.9, split: 0.5 },
    { t: 261.17, fadeIn: 6, camAz: -0.3 },
    { t: 269.6, fadeIn: 4, rush: 0.5, storm: 0.05, palette: 'dusk', pour: 0.6, pulse: 0.9 },
    // the last one for all time: the rush stops; the sun, let go at last, goes down
    { t: 278.02, fadeIn: 1.5, rush: 0, storm: 0, split: 0.2 },
    { t: 280.12, fadeIn: 14, hour: 5.0, open: 1, flow: 0.4, turb: 0.25, camAz: 1.1, camEl: -0.5, camZoom: -0.5 },
    { t: 294.86, fadeIn: 10, palette: 'ember', hour: 5.75, pour: 0.1, flow: 0.15, haze: 0.6, pulse: 0.4, camAz: 1.42, camZoom: -0.7, bloom: 1 },
    { t: 311.71, fadeIn: 10, hour: 6.5, palette: 'night', fade: 0.6, words: 'off' },
  ],
  events: [
    { t: 29.07, flash: 0.4 }, { t: 107.5, glitch: 0.5 }, { t: 111.71, flash: 0.35 }, { t: 120.12, flash: 0.6 }, { t: 163.81, flash: 0.3 }, { t: 191.18, flash: 0.5 },
    { t: 212.23, flash: 0.4 }, { t: 222.76, flash: 0.35 }, { t: 224.71, flash: 0.35 }, { t: 226.97, flash: 0.35 }, { t: 229.07, flash: 0.35 },
    { t: 235.91, flash: 0.9 }, { t: 278.02, flash: 0.3 },
  ],
};
