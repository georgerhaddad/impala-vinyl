// "Apocalypse Dreams" (Lonerism, side A, track 3): the dream that today is the day everything changes, and the
// print that burns out with it. Times are seconds into the track; sections are from its song map
// (assets/maps/lonerism/03-apocalypse-dreams.json). The knobs are in ../worlds/lonerism.js.
//   0:00  the stomp: morning, close on the bars, the lawn bouncing far off        0:12  verse 1: hope; they come nearer
//   0:35  the beat falls away: soft, slow, the sun swelling        0:47  verse 2: afraid; the bars drawn closer together
//   1:11  the lines about sleep: gold, the crowd at the railings    1:34  the line about change: the day slides on
//   1:48  the turning-pages lines: seen from their side, the deck sits behind its bars while the lawn runs in fast forward
//   2:02  the song stops: bleached, the lawn empty; then far figures, coming closer and never arriving
//   2:27  the beat back: the sky gone blood orange, the sun low and huge behind the crowd
//   2:57  along the railings into the sun            3:30  the last verse: everyone at the bars
//   4:06  the long ride out: the sun swells until the print burns white; only the bars and the deck are left
//   5:25  dusk, the lawn empty: a day like any other
export default {
  title: 'Apocalypse Dreams',
  keywords: /^(day|dreams|true|terrified|success|mystified|sleep|changing|changes|pages|closer|matter|window|morning|yesterday|miss|excited)$/i,
  acts: [
    // the stomp: morning light, down at the deck's level behind the bars, the crowd small and jumping
    { t: 0, palette: 'morning', camEl: -0.57, camAz: 0.25, camZoom: 0, drift: 0.035, grain: 0.11, vig: 0.4, mblur: 0.4, bloom: 0.6, split: 0.15, flow: 0.6, turb: 0.4, pulse: 0.9, spark: 0.6,
      leak: 0.2, expo: -0.05, crowd: -0.1, near: -0.45, dance: 0.8, petals: 0.2, words: 'drift' },
    // verse 1, the hopeful one: pulling back; they come closer
    { t: 11.64, fadeIn: 6, camZoom: -0.3, camAz: 0, crowd: 0.3, near: 0.1, leak: 0.4, flow: 0.8 },
    { t: 25.08, fadeIn: 4, palette: 'noon', near: 0.35, expo: 0.1, leak: 0.55 },
    // the beat falls away: the dream itself. Soft, slow, the sun swelling
    { t: 35.01, fadeIn: 2, calm: 0.7, flow: 0.25, soft: 0.8, dance: 0, sunBig: 0.25, leak: 0.7, expo: 0.25, camZoom: -0.1, camAz: -0.35, pulse: 0.3 },
    // verse 2, the frightened one: the beat again, and the bars drawn closer together
    { t: 47.19, fadeIn: 1.2, calm: 0, soft: 0, sunBig: 0, flow: 0.9, turb: 0.6, dance: 0.8, pulse: 1, railGap: -0.4, railH: 0.3, leak: 0.35, expo: 0, camAz: 0.4, camZoom: -0.25, crowd: 0.3, near: 0.2 },
    { t: 62.74, fadeIn: 3, railGap: -0.15, camAz: 0.15 },
    // the lines about sleep: gold, and they come right up to the railings
    { t: 71.57, fadeIn: 1.5, palette: 'gold', railGap: 0.2, railH: 0, crowd: 0.8, near: 0.65, dance: 1, flow: 1.1, turb: 0.8, spark: 1, leak: 0.8, expo: 0.12, bloom: 0.8, split: 0.3, camZoom: -0.5, camAz: -0.45, drift: 0.05 },
    { t: 82.75, fadeIn: 3, camAz: -0.2 },
    // the line about change: the afternoon slides away under it, the shadows swinging round
    { t: 93.98, fadeIn: 14, dayShift: 0.2, leak: 1, sunBig: 0.3, camAz: -0.6 },
    // the turning-pages lines: from their side, the deck behind its bars, the lawn in fast forward and the day running back
    { t: 108.48, fadeIn: 2.5, camAz: 2.65, camEl: -0.44, camZoom: -0.35, railH: 0.6, flow: 2.6, dance: 0.3, leak: 0.5, sunBig: 0 },
    { t: 111, fadeIn: 11, dayShift: -0.3 },
    // 2:02 the song stops. Bleached; nobody
    { t: 122.16, fadeIn: 1.5, palFast: true, palette: 'bleach', dayShift: 0, crowd: -1, near: -0.8, calm: 0.9, flow: 0.1, soft: 1, dance: 0, leak: 0.3, sunBig: 0.4, camAz: 0, camEl: -0.57, camZoom: 0.1, railGap: 0, railH: 0, drift: 0.02, pulse: 0.2, turb: 0.1 },
    // the questions: figures, far off, coming nearer, never in focus
    { t: 135.26, fadeIn: 11, palFast: false, crowd: -0.2, near: 0, soft: 0.7, leak: 0.5 },
    // 2:27 the beat back, and it is the end of the world: blood-orange sky, the sun low and huge behind them
    { t: 147.05, fadeIn: 1, palFast: true, palette: 'apoc', dayShift: 0.06, calm: 0, soft: 0, flow: 1.3, turb: 0.9, dance: 1, pulse: 1.1, crowd: 0.7, near: 0.5, sunBig: 0.45, leak: 0.8, expo: 0, railH: 0.5,
      camAz: -0.75, camEl: -0.56, camZoom: -0.45, drift: 0.05, bloom: 0.85, split: 0.35, spark: 1, petals: 0.6 },
    { t: 160.6, fadeIn: 6, camAz: -0.4, camZoom: -0.3 },
    // the instrumental: along the railings, into the sun
    { t: 177.06, fadeIn: 3, palFast: false, camAz: -1.2, camZoom: -0.3, railH: 0.2, near: 0.3, crowd: 0.5, sunBig: 0.55 },
    { t: 193.47, fadeIn: 9, camAz: -0.55, camZoom: -0.55, near: 0.7, crowd: 0.9 },
    // 3:30 the last verse: everyone, at the bars
    { t: 210.33, fadeIn: 1.2, crowd: 1, near: 0.9, dance: 1, sunBig: 0.7, leak: 1, expo: 0.1, camAz: -0.8, camZoom: -0.6, pulse: 1.2 },
    { t: 224.09, fadeIn: 5, camAz: -0.55, camZoom: -0.4 },
    // 4:06 the ride out: the sun goes on swelling, and the print starts to burn
    { t: 245.96, fadeIn: 30, sunBig: 1, burn: 0.4, dayShift: 0.1, camZoom: -0.45, camAz: -0.9 },
    { t: 276, fadeIn: 24, burn: 0.72, crowd: 0.4, camAz: -0.65, leak: 1.3 },
    { t: 300.32, fadeIn: 22, burn: 1, crowd: -0.5, camZoom: -0.15, camAz: -0.5 },
    // 5:25 after it: dusk, an empty lawn, a day like any other
    { t: 324.7, fadeIn: 5, palette: 'dusk', dayShift: 0, burn: 0, sunBig: 0, crowd: -1, near: -0.8, dance: 0, flow: 0.2, turb: 0.1, calm: 0.4, leak: 0.2, expo: -0.2, railH: 0, camAz: 0.2, camEl: -0.53, camZoom: -0.7,
      pulse: 0.3, spark: 0.4, drift: 0.04, bloom: 0.5, split: 0.1, petals: 0.2, words: 'off' },
  ],
  events: [
    { t: 47.19, flash: 0.5 }, { t: 71.57, flash: 0.6 }, { t: 108.59, flash: 0.35, cut: { az: 2.65, el: -0.44, zoom: -0.35 } }, { t: 122.16, flash: 1, cut: { az: 0, el: -0.57, zoom: 0.1 } },
    { t: 147.05, flash: 0.8, cut: { az: -0.75, el: -0.56, zoom: -0.45 } }, { t: 177.06, flash: 0.3 }, { t: 210.33, flash: 0.8 }, { t: 245.96, flash: 0.4 }, { t: 324.7, flash: 0.7 },
  ],
};
