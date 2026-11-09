// "Let It Happen" (Currents, side A, track 1), choreographed by hand: a journey off the ground. Times are seconds
// into the track; sections are from its song map (assets/maps/currents/01-let-it-happen.json).
// Each act says only what changes and blends in over `fadeIn` seconds (DEFAULTS in ../index.js lists the knobs).
//   0:00  the river           1:45  the whirlwind lifts the deck     2:25  take-off
//   2:36  the climb: through the clouds, the sky goes black, a planet rises beneath
//   3:49  the record sticks: down the stylus and into the groove itself, its walls the music, looping with it
//   4:43  dawn from orbit: sunrise over the planet's curve; its ring is a record
//   5:06  the drop: hyperspace      5:29  the vocoder: a mustard nebula
//   7:01  the final refrain: the galaxy, then into the chrome sun      7:31  drifting
export default {
  title: 'Let It Happen',
  keywords: /^(happen|happens|whirlwind|ready|vanish|moment|sound|sorry|alarm|shadow|closer|scare|story|morning|back)$/i,
  acts: [
    // the arpeggio in the dark: a few lines, barely moving, the orb far away
    { t: 0, palette: 'night', flow: 0.22, turb: 0.05, calm: 0.55, spark: 0.35, fade: 0.55, orb: 0.12, camZoom: -0.05, camEl: 0.05, drift: 0.03, bloom: 0.7, words: 'drift' },
    { t: 12, fadeIn: 10, palette: 'violet', flow: 0.45, calm: 0.25, fade: 0.85, orb: 0.25, camZoom: -0.2 },
    // verse 1
    { t: 28.4, fadeIn: 3, flow: 0.6, turb: 0.3, calm: 0, fade: 1, spark: 0.6, camAz: 0.1 },
    // the first refrain
    { t: 39.7, fadeIn: 1.2, flow: 0.95, turb: 0.55, spark: 1, orb: 0.55, camZoom: -0.4, rainbow: 0.8, split: 0.5, words: 'slam' },
    { t: 51.4, fadeIn: 2, flow: 1.0, turb: 0.7, pulse: 1, words: 'drift', drift: 0.09 },
    // verse 2
    { t: 57.4, fadeIn: 3, flow: 0.7, turb: 0.35, spark: 0.7, orb: 0.4, camZoom: -0.25, camAz: -0.15, split: 0.25 },
    { t: 80.8, fadeIn: 1, glitch: 0.12 },                                    // the alarm line
    { t: 84.6, fadeIn: 4, glitch: 0, palette: 'dawn', sun: 0.45, orb: 0.6 },  // the morning line
    // the instrumental: full current, rainbow wake
    { t: 87.4, fadeIn: 2.5, palette: 'violet', sun: 0, flow: 1.15, turb: 0.9, rainbow: 1, spark: 1, pulse: 1, camZoom: -0.5, drift: 0.11, bloom: 1, split: 0.5 },
    // the whirlwind verse: the field winds up, and starts to lift the deck
    { t: 104.7, fadeIn: 5, vortex: 0.35, turb: 0.5, flow: 0.9, camZoom: -0.35, camEl: 0.12, drift: 0.06 },
    { t: 110.7, fadeIn: 4, vortex: 0.8, alt: 0.04, orb: 0.7 },              // carried off
    { t: 115.6, fadeIn: 3, vortex: 1.0, alt: 0.07, camRoll: 0.06 },          // the build
    { t: 122.3, fadeIn: 1.5, vortex: 0.3, alt: 0.03, camRoll: 0, words: 'slam', flow: 1.1 },   // the refrain again
    // verse 3
    { t: 130.2, fadeIn: 3, vortex: 0, alt: 0, flow: 0.75, turb: 0.4, words: 'drift', camZoom: -0.3, camAz: 0.2 },
    // the take-off line: it doesn't fail
    { t: 145.4, fadeIn: 7, alt: 0.08, flow: 1.2, camEl: -0.05, camRoll: 0.05, camZoom: -0.4 },
    { t: 152.9, fadeIn: 4, alt: 0.16, flow: 1.6, orb: 0.8 },                 // never coming back
    // 2:36, the long drive: the climb. Up through the clouds...
    { t: 156.5, fadeIn: 14, alt: 0.32, flow: 1.3, turb: 1, rainbow: 1, pulse: 1, spark: 1, camZoom: -0.4, camEl: 0.1, camRoll: 0, drift: 0.1, bloom: 1.05, split: 0.5 },
    // ...above them, the sky darkening, the first stars...
    { t: 176, fadeIn: 18, alt: 0.6, camEl: 0.05, camAz: 0.3, orb: 0.6 },
    // ...and out. A planet rises underneath
    { t: 196, fadeIn: 20, alt: 0.95, planet: 0.55, camEl: -0.3, camZoom: -0.5, camAz: 0.1, drift: 0.07 },
    { t: 214, fadeIn: 8, planet: 0.75, ring: 0.6 },
    // something's wrong with the record: the camera goes down to the needle...
    { t: 222, fadeIn: 7, camZoom: 0.9, camEl: 0.25, camAz: -0.1, drift: 0.01, words: 'off' },
    // 3:49: ...and into the groove. The canyon is the cut under the stylus (its walls are the music), so when the
    // record sticks on one beat the canyon repeats with it. A new angle every two bars.
    { t: 229.5, fadeIn: 0.3, dive: 1, diveRise: 0, palette: 'night', palFast: true, glitch: 0.02, trail: 0, split: 0.35, mblur: 0, bloom: 1.1 },
    // 4:05: still stuck, the strings come in under it: the light comes up, and the camera rises over the spiral's turns
    { t: 245, fadeIn: 24, palFast: false, palette: 'dawn', sun: 0.7, diveRise: 0.45, glitch: 0, trail: 0, split: 0.25, orb: 0.9, planet: 0.9, ring: 0.8 },
    { t: 269, fadeIn: 13, diveRise: 1 },
    // 4:43: free. Out of the groove and back to orbit: dawn, sunrise over the planet's curve, its ring a record
    { t: 283.2, fadeIn: 5, dive: 0, diveRise: 0, mblur: 0.6, sun: 1, orb: 1, planet: 1, ring: 1, calm: 0.7, flow: 0.25, glitch: 0, trail: 0, camEl: -0.4, camZoom: -0.65, camAz: -0.25, drift: 0.035, split: 0.1, bloom: 1.1, grain: 0.05, words: 'drift' },
    // 5:06, the drop: hyperspace
    { t: 306.3, fadeIn: 0.6, palette: 'violet', warp: 1, planet: 0, ring: 0, sun: 0.3, orb: 0.5, pulse: 1.1, camEl: -0.32, camZoom: -0.35, camAz: 0, drift: 0.05, split: 0.6, bloom: 1.05, mblur: 1 },
    // 5:29 the vocoder vocal: out of the tunnel into a mustard nebula
    { t: 329.2, fadeIn: 1.2, palFast: true, palette: 'mustard', warp: 0.12, nebula: 1, camEl: -0.1, camAz: -0.35, camZoom: -0.3, words: 'vocoder', drift: 0.08, split: 0.45 },
    // 6:13: back into the tunnel
    { t: 373.5, fadeIn: 1.2, palFast: false, palette: 'violet', warp: 0.9, nebula: 0.3, words: 'drift', camEl: -0.3, camAz: 0.15, camZoom: -0.4 },
    // 6:38: the vocoder again, and a galaxy ahead, wound like a record's groove
    { t: 398.4, fadeIn: 1.2, palFast: true, palette: 'mustard', warp: 0.12, nebula: 1, galaxy: 0.6, words: 'vocoder', camAz: -0.4, camEl: -0.15 },
    // 7:01 the final refrain: everything, then towards the chrome sun...
    { t: 421.6, fadeIn: 1.5, palFast: false, palette: 'violet', warp: 0.35, nebula: 0.5, galaxy: 1, sun: 1, orb: 0.9, bloom: 1.2, pulse: 1.2, camZoom: -0.5, camEl: -0.48, camAz: 0.05, drift: 0.1, words: 'slam', split: 0.6 },
    { t: 432, fadeIn: 14, warp: 0.1, into: 0.55, galaxy: 0.6, camEl: -0.52, camAz: 0.15 },
    { t: 444, fadeIn: 7, into: 1, warp: 0 },
    // 7:31: ...through it, and drifting in the dark
    { t: 451.3, fadeIn: 0.5, into: 0, sun: 0.25, orb: 0.35, galaxy: 0.5, nebula: 0.35, fade: 0.3, calm: 0.6, flow: 0.2, camZoom: -0.8, camEl: 0, camAz: 0.3, drift: 0.04, words: 'off', bloom: 0.8 },
  ],
  events: [
    { t: 39.75, flash: 0.6 }, { t: 80.83, glitch: 0.9 }, { t: 87.41, flash: 0.4 }, { t: 104.98, flash: 0.35 }, { t: 122.3, flash: 0.7 },
    { t: 156.52, flash: 0.45 }, { t: 229.84, flash: 0.5, glitch: 1 }, { t: 283.26, flash: 0.3 }, { t: 306.29, flash: 0.9 },
    { t: 329.24, flash: 0.6, cut: { az: -0.35, el: -0.1, zoom: -0.3 } }, { t: 373.5, flash: 0.6 }, { t: 398.41, flash: 0.6, cut: { az: -0.4, el: -0.15, zoom: -0.25 } },
    { t: 421.65, flash: 0.9 }, { t: 451.26, flash: 1 },
  ],
};
