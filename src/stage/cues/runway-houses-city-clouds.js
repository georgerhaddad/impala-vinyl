// "Runway Houses City Clouds" (Innerspeaker, side D, track 1), choreographed by hand. The title is the view from the
// window on the way up, so that is the first half: the deck takes off down the valley at dusk and climbs over
// houses, a city, through the cloud. The long instrumental second half is the flight itself: the land comes up
// round the deck in the dark and folds, and it comes out the other end of the night somewhere new.
// Times are seconds into the track; sections from assets/maps/innerspeaker/10-runway-houses-city-clouds.json.
//   0:00  runway: dusk, flat ground close under the deck, starting to roll
//   0:33  houses: off the ground, roofs gathering by the river below
//   1:21  city: towers, lit windows, a red sun
//   1:50  clouds: up into them, white-out, and out on top into gold; the camera lets the deck go small
//   2:40  sunset over the cloud; 3:00 a look back the way it came, where a vast echo of the deck hangs
//   3:22  the jam: night. The land rises up round the deck and closes, city lights on the inside of the fold
//   4:21  the long stretch: deep in a tunnel of lit contours, six mirrors; it swings, unwinds and winds the other way,
//         opens on a ribbon of stars, and at 5:25 the first light finds it
//   6:13  morning, and green: a different valley. Down through the cloud to new roofs, and a landing
export default {
  title: 'Runway Houses City Clouds',
  keywords: /^(home|everywhere|change|window|ascend|sky|behind|safe|same|notice)$/i,
  acts: [
    // runway
    { t: 0, palette: 'dusk', fold: 0, twist: 0, spin: 0, kalei: 0, kaleiN: 3, recur: 0, deep: 0, alt: -0.1, pitch: 0.3, yaw: 0, town: 0, echo: 0, flow: 0.15, turb: 0, calm: 1, cloud: 0.3, leaves: 0, sun: 0.8, spark: 0.5, pulse: 0.3, fade: 1,
      camAz: 0.05, camEl: -0.42, camZoom: -0.2, camRoll: 0, drift: 0.015, bloom: 0.6, vig: 0.7, grain: 0.04, split: 0.15, mblur: 0.5, words: 'drift' },
    { t: 16.95, fadeIn: 14, flow: 1.3, recur: 0.5, pulse: 0.7, camZoom: -0.3 },                 // the roll
    // houses: off the ground
    { t: 33.09, fadeIn: 8, palette: 'autumn', alt: 0.12, calm: 0.4, pitch: 0.15, town: 0.45, flow: 1, recur: 0, leaves: 0.3, camEl: -0.15, camZoom: -0.36, drift: 0.03 },
    { t: 48.65, fadeIn: 5, alt: 0.24, camEl: 0.08, camAz: 0.16 },
    { t: 53.25, fadeIn: 2, alt: 0.3, town: 0.6, fold: 0.15, calm: 0.15, flow: 1.1, pulse: 1, turb: 0.3, sun: 1, leaves: 0.5, camZoom: -0.42 },
    { t: 62.64, fadeIn: 5, town: 0.78, camEl: 0.3, camAz: -0.1 },                               // the line about noticing
    { t: 76.76, fadeIn: 4, alt: 0.36, camEl: 0.14, camAz: 0.05 },
    // city
    { t: 81.49, fadeIn: 1.5, palette: 'dusk', town: 1, alt: 0.42, fold: 0.25, twist: 0.1, calm: 0, flow: 1.2, pulse: 1.2, turb: 0.4, sun: 1.1, camEl: 0.12, camAz: -0.2, camZoom: -0.45, bloom: 0.8, split: 0.45, words: 'slam' },
    { t: 97.6, fadeIn: 6, alt: 0.5, camAz: 0.25, camEl: 0.2 },
    // clouds: the ascent verse
    { t: 109.73, fadeIn: 7, alt: 0.72, pitch: 0.3, cloud: 1, town: 0.8, fold: 0, twist: 0, camAz: 0.05, camEl: 0.05, words: 'drift', split: 0.2 },
    { t: 119.79, fadeIn: 3.5, palette: 'cloud', alt: 0.9, sun: 1.3, bloom: 0.5 },               // inside it
    { t: 127.86, fadeIn: 4, palette: 'amber', alt: 1.05, pitch: 0.2, town: 0, calm: 0.3, flow: 0.9, sun: 1.3, leaves: 0, camZoom: -0.5, bloom: 0.8 },      // and out on top
    { t: 137.72, fadeIn: 7, camZoom: -0.95, camEl: 0.14, camAz: -0.15 },                        // the left-behind line
    { t: 145.62, fadeIn: 4, turb: 0.5, camRoll: 0.07 },                                         // the unsafe line
    { t: 153.86, fadeIn: 5, camRoll: 0, camZoom: -0.6, camAz: 0.1 },
    // sunset over the cloud
    { t: 160.11, fadeIn: 8, palette: 'dusk', flow: 0.7, turb: 0.2, pulse: 0.8, sun: 1, camEl: 0.02, camAz: 0 },
    // a look back the way it came
    { t: 180.31, fadeIn: 5, echo: 0.3, pitch: 0.4, flow: 0.4, pulse: 0.5, camAz: 3.2, camEl: -0.35, camZoom: -0.6, drift: 0.02 },
    { t: 190.42, fadeIn: 7, palette: 'ember', echo: 0, pitch: 0.2, camAz: 0, camEl: 0.04, camZoom: -0.45, alt: 0.6, cloud: 0.5, sun: 0.7 },
    // the jam: the land comes up round the deck in the dark, and folds
    { t: 202.5, fadeIn: 9, alt: 0, pitch: 0, fold: 0.62, twist: 0.4, calm: 0, flow: 1.2, turb: 0.4, pulse: 1.2, echo: 0.5, town: 0.55, cloud: 0.15, leaves: 0.6, sun: 0.9, spark: 1, camZoom: -0.42, drift: 0.04, bloom: 0.9, split: 0.45 },
    { t: 218.63, fadeIn: 8, fold: 0.86, twist: 0.6, spin: 0.15, kalei: 0.5, kaleiN: 2, camAz: 0.15 },
    { t: 234.77, fadeIn: 6, fold: 1, kalei: 1, kaleiN: 3, spin: 0.3, deep: 0.4, echo: 1, camAz: -0.12 },
    { t: 250.91, fadeIn: 5, kaleiN: 4, twist: 0.9, deep: 0.7, camAz: 0.05, camZoom: -0.5 },
    // the long stretch: deep in it
    { t: 260.98, fadeIn: 5, palette: 'night', kaleiN: 6, spin: 0.2, recur: -0.3, deep: 1, twist: 1, flow: 0.8, turb: 0.3, pulse: 1, town: 0.3, leaves: 0.8, sun: 0.8, camZoom: -0.3, split: 0.3 },
    { t: 276.1, fadeIn: 12, kaleiN: 3, yaw: 0.28, pitch: 0.14, camAz: 0.15, camZoom: -0.4 },       // the tunnel swings away ahead
    { t: 292.25, fadeIn: 14, palette: 'ember', twist: -0.8, spin: -0.25, yaw: 0.1, pitch: 0, camAz: -0.1 },      // it unwinds, and winds up the other way
    { t: 308.41, fadeIn: 9, fold: 0.7, kalei: 0.5, town: 0.6, deep: 0.6, camZoom: -0.5, camEl: 0.1 },             // open along the top: a ribbon of stars
    { t: 324.53, fadeIn: 9, palette: 'dusk', fold: 1, kalei: 1, kaleiN: 2, twist: 0.5, spin: 0.15, recur: 0.3, flow: 1.1, yaw: 0, sun: 1.1, camEl: 0.04, camAz: 0.1 },      // first light
    { t: 340.65, fadeIn: 10, palette: 'dawn', kaleiN: 1, fold: 0.8, spin: 0.1, deep: 0.3, town: 0.2, camAz: -0.1 },
    { t: 356.79, fadeIn: 10, fold: 0.5, kalei: 0.4, twist: 0.3, spin: 0, deep: 0, town: 0, echo: 0.34, cloud: 0.5 },
    // morning, somewhere else
    { t: 372.92, fadeIn: 3, palette: 'sky', fold: 0.2, kalei: 0, twist: 0.1, recur: 0, flow: 1, alt: 0.4, cloud: 0.8, leaves: 0.6, sun: 1, echo: 0.17, pulse: 1, camAz: 0, camEl: 0.06, camZoom: -0.5, bloom: 0.6, split: 0.3 },
    { t: 389.01, fadeIn: 10, alt: 0.16, town: 0.42, fold: 0.1, camEl: 0.22, camAz: 0.15 },       // new roofs
    { t: 405.19, fadeIn: 10, alt: 0, calm: 0.5, pitch: 0.2, flow: 0.7, camEl: -0.18, camAz: 0.05, camZoom: -0.36 },
    { t: 419.33, fadeIn: 8, alt: -0.1, calm: 1, pitch: 0.3, flow: 0.25, pulse: 0.4, camEl: -0.4, camZoom: -0.22, words: 'off' },      // and a landing
    { t: 429.4, fadeIn: 5, flow: 0.05, fade: 0.8 },
  ],
  events: [
    { t: 33.09, flash: 0.3 }, { t: 53.25, flash: 0.5 }, { t: 81.49, flash: 0.8, cut: { az: -0.2, el: 0.12, zoom: -0.5 } }, { t: 97.6, flash: 0.3 }, { t: 127.86, flash: 0.7 },
    { t: 202.5, flash: 0.6 }, { t: 234.77, flash: 0.5 }, { t: 250.91, flash: 0.4 }, { t: 260.98, flash: 0.6, cut: { az: 0, el: 0.04, zoom: -0.3 } }, { t: 324.53, flash: 0.35 },
    { t: 372.92, flash: 0.85, cut: { az: 0, el: 0.06, zoom: -0.55 } },
  ],
};
