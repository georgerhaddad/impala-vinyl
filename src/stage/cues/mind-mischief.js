// "Mind Mischief" (Lonerism, side B, track 1): one of the crowd, in pink. He thinks she is coming over; for half a
// minute the railings sink and open; it was nothing. Times are seconds into the track; sections are
// from its song map (assets/maps/lonerism/04-mind-mischief.json), which hears this slow song at DOUBLE tempo
// (161 against a felt 80), so events here sit on every other downbeat and the pulse is kept low.
//   0:00  the riff: hazy noon through the bars, a soft crowd, one of them in pink
//   0:24  verse 1: she is picked out; slowly      0:48  the wrong way: the bars draw closer    1:00  the leak overflows
//   1:12  the verse again, in gold: she has started across the lawn        1:36  the phased break: only blobs and light
//   1:58  the bridge (the name line): she is at the railings, and they sink and spread until there is hardly a fence
//   2:24  the turn: the bars slam back, taller and closer than before; she turns and walks back in
//   2:48  seen from their side: the deck behind its bars, her one of the crowd again
//   3:03  the resolve: the lawn frozen mid step, bleached; backing away
//   3:38  the band comes back in: gold going to dusk, the lawn dancing without him
//   4:01  they go home; the last one left on the grass is pink     4:23  nobody
export default {
  title: 'Mind Mischief',
  keywords: /^(blow|slow|love|belong|astray|overflowed|name|change|messing|heart|mischief|mind|frozen|forever|sure|dreaming|aloud)$/i,
  acts: [
    // the riff: close on the bars, everything past them soft
    { t: 0, palette: 'noon', camEl: -0.57, camAz: 0.3, camZoom: 0.05, drift: 0.03, grain: 0.12, vig: 0.4, mblur: 0.4, bloom: 0.6, split: 0.1, flow: 0.4, turb: 0.25, pulse: 0.5, spark: 0.7,
      leak: 0.3, expo: 0, crowd: 0.1, near: -0.2, dance: 0.2, soft: 0.5, hero: 0.35, heroNear: 0, petals: 0.3, words: 'drift' },
    // verse 1: there she is
    { t: 24.66, fadeIn: 3, hero: 1, soft: 0.25, camZoom: -0.25, camAz: 0.1, leak: 0.45, flow: 0.5, dance: 0.4 },
    { t: 36.73, fadeIn: 5, heroNear: 0.2, camAz: -0.1 },
    // the second quatrain (things taken the wrong way): another angle, the bars closer together
    { t: 48.85, fadeIn: 2.5, camAz: 0.5, camZoom: -0.15, railGap: -0.3, expo: -0.1, leak: 0.3, dance: 0.2 },
    // the overflow line: the leak floods the frame
    { t: 60.49, fadeIn: 5, leak: 1.25, expo: 0.25, railGap: 0, spark: 1 },
    // the verse again, warmer: she has started across
    { t: 72.23, fadeIn: 3, palette: 'gold', leak: 0.55, expo: 0.05, heroNear: 0.4, camAz: -0.25, camZoom: -0.35, dance: 0.5, crowd: 0.3 },
    // the phased break: out of focus altogether, the camera drifting round
    { t: 96.51, fadeIn: 4, soft: 1, spark: 1.3, camAz: -0.9, camZoom: -0.2, flow: 0.7, petals: 0.8, leak: 0.7, heroNear: 0.55 },
    { t: 108.4, fadeIn: 9, camAz: 0.1, camZoom: -0.1 },
    // the bridge, the name line: she is at the railings. They sink, and open
    { t: 118.58, fadeIn: 2.5, heroNear: 1, soft: 0.7, near: -0.5, crowd: -0.2, railGap: 0.5, railH: -0.5, leak: 0.9, expo: 0.2, camAz: 0.1, camZoom: -0.3, spark: 1 },
    { t: 130.18, fadeIn: 7, railGap: 1, railH: -1.1, expo: 0.3 },
    // the turn: the bars slam back
    { t: 144.85, fadeIn: 0.5, palette: 'noon', railGap: -0.6, railH: 0.9, expo: -0.15, leak: 0.2, soft: 0.2, camZoom: -0.3, camAz: -0.2 },
    { t: 147, fadeIn: 8, heroNear: 0.55 },
    // the plea: she walks back into them
    { t: 155.24, fadeIn: 11, heroNear: 0, near: 0.2, crowd: 0.5, camAz: 0.3 },
    // the wordless refrain: from their side. The deck behind its bars; she is one of the crowd
    { t: 168.25, fadeIn: 4, hero: 0.3, camAz: 2.7, camEl: -0.44, camZoom: -0.35, dance: 0.6, flow: 0.8, railGap: -0.2 },
    // the title line: frozen. The lawn stops mid step, bleached
    { t: 183.37, fadeIn: 4, palette: 'bleach', calm: 1, flow: 0.05, dance: 0, hero: 0, camAz: 0, camEl: -0.57, camZoom: 0.05, railGap: -0.3, soft: 0.4, leak: 0.25, pulse: 0.2, drift: 0.02 },
    { t: 201.87, fadeIn: 11, camZoom: -0.5, crowd: -0.4, near: -0.5 },
    // 3:38 the band back in: gold, the lawn dancing without him
    { t: 218.71, fadeIn: 0.8, palFast: true, palette: 'gold', calm: 0, flow: 1, turb: 0.7, dance: 1, pulse: 0.8, crowd: 0.9, near: 0.5, railGap: 0, railH: 0.4, leak: 0.8, expo: 0.1, soft: 0, camAz: -0.6, camZoom: -0.55,
      drift: 0.05, spark: 1, bloom: 0.8, hero: 0.25 },
    { t: 232.13, fadeIn: 8, palFast: false, dayShift: 0.12, camAz: -0.3 },
    // the last lines: evening; they drift off home
    { t: 241.13, fadeIn: 12, palette: 'dusk', dayShift: 0, crowd: -0.3, near: -0.3, dance: 0.3, leak: 0.4, flow: 0.5, pulse: 0.5 },
    // the last one on the grass
    { t: 252.76, fadeIn: 8, crowd: -1, hero: 0.9, camZoom: -0.75, camAz: 0.1, railH: 0 },
    { t: 263.35, fadeIn: 4, hero: 0, flow: 0.15, pulse: 0.2, leak: 0.15, expo: -0.3, words: 'off' },
  ],
  events: [
    { t: 24.66, flash: 0.4 }, { t: 72.7, flash: 0.3 }, { t: 118.84, flash: 0.5 }, { t: 144.92, flash: 0.35, glitch: 0.9 }, { t: 168.36, cut: { az: 2.7, el: -0.44, zoom: -0.35 } },
    { t: 183.23, flash: 0.3, cut: { az: 0, el: -0.57, zoom: 0.05 } }, { t: 218.71, flash: 0.9 }, { t: 263.35, flash: 0.3 },
  ],
};
