// "One More Hour" (The Slow Rush, side D, track 3), choreographed by hand: the album's last hour of daylight. Times
// are seconds into the track; sections are from its song map (assets/maps/slow-rush/12-one-more-hour.json), acts start
// on its downbeats. The sun is placed by hand (sunHold: 1) and only ever goes down: every act lowers it a little,
// from late afternoon at the first note to the horizon at the last chant. The quiet passages are the dust settling;
// each heavy one is a sandstorm that leaves the room deeper under.
//   0:00  the piano: the blue room, late light, an hourglass, nothing moving
//   0:50  the first heavy passage: a storm through every opening        1:32  the long quiet: the dust settles, the light turns
//   2:03  the turn in the lyric: from above, the floor gives way under the stream; the room is the neck of an hourglass
//   3:28  the second heavy passage: the roof goes, the room half under, the light red
//   4:45  the lines that plead for the hour of the title: turning to face the sun
//   5:16  the long build: the walls go down one by one; open dunes, the sun straight ahead
//   6:38  the last chant: the sun touches the horizon        6:50  it is gone: stars; then the first grey of another year
export default {
  title: 'One More Hour',
  keywords: /^(moment|chance|still|racin'?|racing|love|fun|fame|money|now|again|more|alone|am|strange|hour|rage|minute|share|year)$/i,
  acts: [
    { t: 0, palette: 'day', paint: 1, sunHold: 1, hour: 3.6, haze: 1, pour: 0, storm: 0, rush: 0, open: 0, drain: 0, sand: 0.12, glass: 1, flow: 0.15, turb: 0.05, calm: 0.8, spark: 0.6, pulse: 0.3,
      camEl: -0.4, camZoom: 0, camAz: -0.3, drift: 0.015, bloom: 0.7, split: 0.15, vig: 0.85, grain: 0.06, words: 'drift' },
    { t: 20.29, fadeIn: 13, camZoom: -0.25, camAz: -0.6 },
    { t: 42.94, fadeIn: 5, flow: 0.03, camZoom: -0.35 },                            // everything still
    // the first heavy passage
    { t: 49.99, fadeIn: 0.6, storm: 0.45, pour: 1.4, flow: 1.1, turb: 1, calm: 0, pulse: 1.3, hour: 4.0, sand: 0.28, camEl: -0.5, camZoom: -0.55, camAz: 0.2, bloom: 0.9, split: 0.5, words: 'slam' },
    { t: 71.17, fadeIn: 6, camAz: -0.25, sand: 0.36 },
    // the dust settles
    { t: 92.34, fadeIn: 5, palette: 'dusk', storm: 0, pour: 0.15, flow: 0.2, turb: 0.1, calm: 0.7, pulse: 0.4, hour: 4.3, camEl: -0.35, camZoom: -0.15, camAz: -0.5, bloom: 0.7, split: 0.15, words: 'drift' },
    // the neck of the hourglass, from above
    { t: 122.93, fadeIn: 10, drain: 1, pour: 0.6, flow: 0.5, glass: 0, camEl: 0.3, camZoom: -0.3, camAz: -0.2 },
    { t: 137.05, fadeIn: 9, camAz: 0.3 },
    { t: 162.93, fadeIn: 9, drain: 0.35, hour: 4.6, camEl: -0.3, camZoom: -0.3 },
    { t: 184.11, fadeIn: 11, drain: 0, pour: 0.3, camAz: -0.9, camEl: -0.45 },
    // the second heavy passage: the roof goes
    { t: 207.61, fadeIn: 0.8, palette: 'ember', storm: 0.6, pour: 1.5, sand: 0.6, flow: 1.2, turb: 1, calm: 0, pulse: 1.4, hour: 4.9, camEl: -0.5, camZoom: -0.6, camAz: 0.25, bloom: 1, split: 0.6, words: 'slam' },
    { t: 228.81, fadeIn: 5, camAz: -0.3 },
    { t: 249.98, fadeIn: 4, storm: 0.8, camZoom: -0.7 },
    { t: 268.81, fadeIn: 6, camAz: 0.4, sand: 0.68, storm: 0.5 },
    // one more hour: turning to face the sun
    { t: 285.28, fadeIn: 5, palette: 'dusk', storm: 0.08, pour: 0.3, flow: 0.3, turb: 0.3, pulse: 0.6, hour: 5.2, camAz: -1.1, camEl: -0.48, camZoom: -0.4, bloom: 0.85, split: 0.2, words: 'drift' },
    // the long build: the walls go down one by one
    { t: 315.86, fadeIn: 6, open: 0.5, pour: 0, pulse: 0.9, hour: 5.4, sand: 0.72, camAz: -1.42, camZoom: -0.5 },
    { t: 339.4, fadeIn: 10, open: 0.8, storm: 0.22, turb: 0.7, pulse: 1.1, camZoom: -0.6 },
    { t: 360.57, fadeIn: 8, open: 1, palette: 'ember', hour: 5.6, bloom: 1, camEl: -0.52 },
    { t: 384.1, fadeIn: 8, storm: 0, camZoom: -0.75, hour: 5.75 },
    // the last chant: the sun on the horizon
    { t: 398.22, fadeIn: 6, hour: 5.92, flow: 0.2, turb: 0.15, pulse: 0.5 },
    // gone. Stars; and then the first grey of another year, behind us
    { t: 409.99, fadeIn: 11, hour: 6.6, palette: 'night', camZoom: -0.9, camAz: -1.2, bloom: 0.8 },
    { t: 424.11, fadeIn: 8, hour: 10.35, palette: 'dawn', fade: 0.7, words: 'off' },
  ],
  events: [
    { t: 49.99, flash: 0.9 }, { t: 61.75, flash: 0.35 }, { t: 71.17, flash: 0.35 }, { t: 82.93, flash: 0.35 }, { t: 92.34, flash: 0.25 },
    { t: 207.61, flash: 1 }, { t: 228.81, flash: 0.4 }, { t: 249.98, flash: 0.5 }, { t: 268.81, flash: 0.4 }, { t: 285.28, flash: 0.3 },
    { t: 360.57, flash: 0.4 }, { t: 409.99, flash: 0.2 },
  ],
};
