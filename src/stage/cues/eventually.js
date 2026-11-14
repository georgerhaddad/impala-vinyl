// "Eventually" (Currents, side B, track 2), choreographed by hand: the end of a day. The sun is a disc low over the
// river; the song is it going down, the long night after, and (eventually) the light coming back on the other side.
// Times are seconds into the track; sections from assets/maps/currents/05-eventually.json. That map counts this song
// at double tempo (156 for 78), so hits here sit on every second downbeat, and nothing below leans on its beats.
// The camera stays low throughout (the horizon has to be in the frame), with almost no drift.
//   0:00  the last gold hour: the sun just above the deck, its light a path of glitter across the river
//   0:05  the riff: the river thrown into a storm, the sky gone ember       0:16  verse 1: it sinks, the riff tearing at it
//   1:06  the quiet promise: the sun on the horizon, the deck a shape against it, the river going smooth
//   1:35  the first chorus: half of it gone        1:50  the hush: it has set. Afterglow under the clouds, the first stars
//   2:13  verse 2: the storm again, in the dusk        2:38  the promise again, in the dark; a moon comes up
//   2:57  chorus 2 and the bridge: a blue night, the moon's path on a river lying still, the stars on it
//   3:31  the word, eight times: the long calm. The camera turns, slowly, away from the moon, past the band of
//         the galaxy, right round to face the other horizon
//   4:17  first light there       4:32  the sun comes up       4:59  day, and the fade
export default {
  title: 'Eventually',
  keywords: /^(eventually|happier|murder|heart|stranger|soon|way|never|life)$/i,
  acts: [
    // the last gold hour
    { t: 0, palette: 'gold', disc: 1, sunEl: 0.09, sun: 0.05, orb: 0, flow: 0.25, turb: 0.1, calm: 0.5, spark: 0.5, rainbow: 0.2, fade: 0.9, camAz: -0.2, camEl: -0.56, camZoom: -0.45, drift: 0.008, bloom: 0.5, pulse: 0.6, words: 'drift' },
    // 0:05.5 the riff: a storm
    { t: 5.54, fadeIn: 0.5, palette: 'ember', palFast: true, flow: 1.3, turb: 1, calm: 0, spark: 1, rainbow: 0.5, sun: 0.12, pulse: 1.3, split: 0.6, bloom: 0.7, camZoom: -0.65, camRoll: 0.05, camAz: -0.02 },
    // verse 1: it sinks through the lines of cloud; the riff comes back at it between the lines of the verse
    { t: 16.35, fadeIn: 3, palFast: false, palette: 'gold', flow: 0.65, turb: 0.45, sun: 0.05, pulse: 0.9, split: 0.3, bloom: 0.5, camRoll: 0, camZoom: -0.4, camAz: -0.4, sunEl: 0.082 },
    { t: 28.5, fadeIn: 10, sunEl: 0.074, camAz: -0.12, camZoom: -0.55 },
    { t: 40.8, fadeIn: 7, sunEl: 0.066, camAz: -0.3, camZoom: -0.3 },
    { t: 48.23, fadeIn: 1, palette: 'ember', turb: 1, flow: 1.1, sun: 0.1, camZoom: -0.6, camRoll: -0.04, bloom: 0.7 },       // the riff again
    { t: 54.44, fadeIn: 2.5, palette: 'gold', turb: 0.45, flow: 0.65, sun: 0.05, camRoll: 0, sunEl: 0.06, camAz: -0.08, bloom: 0.5 },
    { t: 60.55, fadeIn: 1, palette: 'ember', turb: 1, flow: 1.1, sun: 0.1, camZoom: -0.7, camRoll: 0.04, bloom: 0.7, sunEl: 0.055 },
    // the quiet promise: the sun on the horizon behind the deck, the river going smooth under it
    { t: 66.32, fadeIn: 6, flow: 0.28, turb: 0.12, calm: 0.65, sunEl: 0.04, sun: 0.07, spark: 0.6, rainbow: 0.15, pulse: 0.5, split: 0.15, camRoll: 0, camZoom: -0.75, camEl: -0.57, camAz: -0.215, bloom: 0.55 },
    { t: 84.6, fadeIn: 9, sunEl: 0.012, camZoom: -0.5 },
    // the first chorus: half gone
    { t: 94.0, fadeIn: 3, flow: 0.55, turb: 0.35, calm: 0.3, sunEl: -0.03, sun: 0.12, spark: 0.9, camZoom: -0.95, camAz: -0.32, bloom: 0.65, words: 'slam' },
    { t: 101.6, fadeIn: 8, sunEl: -0.078, camAz: -0.12 },
    // the hush: it has set
    { t: 110.17, fadeIn: 10, palette: 'dusk', sunEl: -0.14, sun: 0.4, stars: 0.4, flow: 0.18, turb: 0.05, calm: 0.75, spark: 0.4, fade: 0.8, camZoom: -0.5, camAz: 0.0, bloom: 0.6, words: 'drift' },
    { t: 122.47, fadeIn: 9, sunEl: -0.2, stars: 0.55, camAz: -0.3 },
    // verse 2: the storm again, in the dusk
    { t: 132.85, fadeIn: 1, flow: 1.0, turb: 0.9, calm: 0, spark: 0.9, fade: 1, pulse: 1.2, split: 0.5, sun: 0.3, camZoom: -0.6, camAz: -0.45, rainbow: 0.4, bloom: 0.7 },
    { t: 145.3, fadeIn: 7, sunEl: -0.28, stars: 0.7, camAz: 0.05 },
    { t: 152.88, fadeIn: 1, turb: 1, flow: 1.2, camRoll: 0.04, camZoom: -0.75 },                                               // the riff
    // the promise again, in the dark: blue night; under the horizon the disc goes round to where the moon comes up
    { t: 159.03, fadeIn: 5, palette: 'midnight', flow: 0.25, turb: 0.1, calm: 0.7, sun: 0, sunEl: -0.3, sunAz: 0.62, disc: 0.62, stars: 0.9, spark: 0.5, pulse: 0.5, split: 0.15, camRoll: 0, camZoom: -0.4, camAz: -0.2 },
    { t: 167.7, fadeIn: 9, sunEl: 0.07, sun: 0.1, camAz: 0.15, camZoom: -0.6 },                                                // moonrise
    // chorus 2: the moon's path on a river lying still
    { t: 176.9, fadeIn: 4, stars: 1, calm: 0.9, flow: 0.35, spark: 0.9, fade: 0.8, sunEl: 0.1, camZoom: -0.9, camAz: 0.22, bloom: 0.7, words: 'slam' },
    // the bridge: the decision
    { t: 192.4, fadeIn: 6, flow: 0.5, calm: 0.6, camZoom: -0.5, camAz: 0.62, words: 'drift' },
    // the word, eight times: the long calm, and the slow turn away from the moon, round to the other horizon
    { t: 210.9, fadeIn: 15, calm: 1, flow: 0.16, turb: 0, rainbow: 0.12, fade: 0.75, camAz: 1.25, camZoom: -0.65, words: 'slam' },
    { t: 226.3, fadeIn: 15, camAz: 2.1, sunEl: -0.3, sun: 0 },                                                                 // (the moon sets behind the camera)
    { t: 241.8, fadeIn: 15, camAz: 2.93, sunAz: 3.14159, disc: 1 },
    // first light
    { t: 257.1, fadeIn: 14, palette: 'dusk', sun: 0.45, sunEl: -0.13, stars: 0.6 },
    // the sun comes up
    { t: 271.86, fadeIn: 15, palette: 'ember', sunEl: -0.01, sun: 0.12, stars: 0.12, flow: 0.3, calm: 0.75, fade: 0.9, bloom: 0.6, camZoom: -0.8, words: 'drift' },
    { t: 288.65, fadeIn: 10, palette: 'gold', sunEl: 0.05, sun: 0.06, stars: 0, calm: 0.5, flow: 0.4, bloom: 0.5 },
    // day, and the fade
    { t: 299.4, fadeIn: 14, sunEl: 0.09, camZoom: -1.0, fade: 0.75, words: 'off' },
  ],
  events: [
    { t: 5.54, flash: 0.7 }, { t: 24.01, flash: 0.2 }, { t: 48.23, flash: 0.35 }, { t: 60.55, flash: 0.35 }, { t: 94.97, flash: 0.4 },
    { t: 132.85, flash: 0.5, cut: { az: -0.45, el: -0.57, zoom: -0.6 } }, { t: 152.88, flash: 0.3 }, { t: 178.3, flash: 0.35 }, { t: 212.01, flash: 0.2 },
  ],
};
