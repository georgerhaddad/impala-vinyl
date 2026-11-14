// "Elephant" (Lonerism, side C, track 3): something enormous is on the lawn. It is never seen: only its shadow,
// the crowd making room for it, and its weight (every stomp of the riff sends a ring through the ground from
// where it stands and a ripple down the railings). It comes over until its shadow lies across the bars and the
// deck; the last verse lets the air out of it. Times are seconds into the track; sections are from its song map
// (assets/maps/lonerism/09-elephant.json).
//   0:00  the riff: hard light, long bar shadows, the camera down on the paving
//   0:05  verse 1: his shadow comes onto the lawn from the left         0:22  the band stops dead for a beat
//   0:28  verse 2: he is in the middle of the lawn, and the picture sinks
//   0:51  verse 3: the crowd backs off; along the railings      0:58  the stairs line: the bars grow
//   1:11  stop       1:14  the arrival: his shadow over the railings and the deck, the whole lawn stomping
//   1:45  the organ: from their side, the deck in his shadow behind the bars; on round
//   2:16  the riff bare again: he moves off, the light comes back
//   2:40  the last verse: the shadow shrinks to nothing, the crowd closes over where it was
//   3:11  as if nothing had happened: the lawn as it was, in gold      3:21  the last stomps, and it just stops
export default {
  title: 'Elephant',
  keywords: /^(elephant|trunk|dreaming|slim|shy|dark|scared|fear|disappeared|stairs|comes|mirrors|fact|collar|cried|home|end)$/i,
  acts: [
    // the riff: the day pushed on so the bars' shadows reach right across the paving
    { t: 0, palette: 'hard', dayShift: 0.3, camEl: -0.52, camAz: 0.2, camZoom: 0.1, drift: 0.03, grain: 0.1, vig: 0.5, mblur: 0.5, bloom: 0.55, split: 0.25, flow: 0.7, turb: 0.6, pulse: 1.3, spark: 0.6, hum: 1,
      leak: 0.2, expo: -0.1, crowd: 0.2, near: -0.1, dance: 0.6, giant: 0, giantX: -1.3, words: 'drift' },
    // verse 1: his shadow comes on from the left; they make room
    { t: 4.66, fadeIn: 3, giant: 1, camEl: -0.42, camZoom: -0.5, camAz: 0.35 },
    { t: 6.84, fadeIn: 14, giantX: -0.3 },
    // the band stops dead
    { t: 22.3, fadeIn: 0.25, calm: 1, flow: 0, pulse: 0.2 },
    { t: 22.8, fadeIn: 0.4, calm: 0, flow: 0.7, pulse: 1.3 },
    // verse 2 (the dark): he is in the middle of the lawn, and the picture sinks
    { t: 27.8, fadeIn: 3, expo: -0.4, giant: 1.45, camAz: -0.3, camEl: -0.38, camZoom: -0.55, railH: 0.3, leak: 0.1 },
    { t: 30.6, fadeIn: 13, giantX: 0.1 },
    { t: 43.11, fadeIn: 3, expo: -0.2 },
    // verse 3 (the fear): the crowd backs off; along the railings
    { t: 51.31, fadeIn: 3, camAz: 1.1, camEl: -0.46, camZoom: -0.35, crowd: -0.2, near: -0.5, dance: 0.3, giant: 1.2 },
    // the stairs line: the bars grow
    { t: 58.3, fadeIn: 8, railH: 0.9, railGap: -0.25, giant: 1.65, giantX: 0.12, camAz: 0.6 },
    // stop
    { t: 71.58, fadeIn: 0.3, calm: 1, flow: 0, pulse: 0.2, expo: -0.5, camAz: 0, camEl: -0.56, camZoom: 0.05 },
    // the arrival: his shadow over the railings, over the deck; the whole lawn stomping
    { t: 74.03, fadeIn: 0.5, calm: 0, flow: 1.2, turb: 1, pulse: 1.6, hum: 1.5, giant: 2, expo: 0.15, crowd: 0.9, near: 0.5, dance: 1, railH: 0.5, railGap: 0, giantX: 0.14, camEl: -0.12, camZoom: -0.75, camAz: -0.35, drift: 0.05,
      leak: 0.7, spark: 1, bloom: 0.8, split: 0.45 },
    { t: 89.62, fadeIn: 2, camAz: 0.7, camEl: -0.32, camZoom: -0.6, giantX: 0.2 },
    // the organ takes it: from their side, the deck in his shadow behind the bars
    { t: 105.21, fadeIn: 2, camAz: 2.7, camEl: -0.3, camZoom: -0.5, giantX: 0.12, leak: 0.9 },
    { t: 120.83, fadeIn: 3, camAz: 4.3, camEl: 0.1, camZoom: -0.7, giantX: 0.16 },
    // the riff bare again: he moves off, and the light comes back
    { t: 136.45, fadeIn: 4, camAz: 6, camEl: -0.56, camZoom: -0.3, giant: 1, giantX: 0.5, expo: 0, pulse: 1.3, dance: 0.7, crowd: 0.5, near: 0.2, leak: 0.4, split: 0.25 },
    { t: 148.12, fadeIn: 8, giantX: 0.8, camAz: 6.5 },
    // the last verse: what he is like. The shadow shrinks; they close in over where it was
    { t: 159.85, fadeIn: 2, pulse: 1.5, dance: 1, crowd: 0.9, near: 0.6, camZoom: -0.55, camAz: 6.1, leak: 0.7, expo: 0.1 },
    { t: 168.31, fadeIn: 14, palette: 'noon', dayShift: 0.2, giant: 0.5, giantX: 0.4 },
    // the collar line, and the one after it: gone
    { t: 184.08, fadeIn: 6, giant: 0, railH: 0, giantX: 1.2 },
    // the last lines: the lawn as it was
    { t: 191.32, fadeIn: 4, palette: 'gold', dayShift: 0, camAz: 6.45, camZoom: -0.35, near: 0.3, hum: 0.5 },
    // the last stomps, and it just stops
    { t: 200.83, fadeIn: 1.5, camZoom: 0.05, camAz: 6.3, crowd: 0.2, dance: 0.6, leak: 0.3 },
  ],
  events: [
    { t: 0.84, flash: 0.3 }, { t: 22.3, glitch: 0.6 }, { t: 22.8, flash: 0.5 }, { t: 28.63, flash: 0.3 }, { t: 52.05, flash: 0.3 }, { t: 71.58, glitch: 0.8 },
    { t: 74.03, flash: 1, cut: { az: -0.35, el: -0.12, zoom: -0.75 } }, { t: 89.62, flash: 0.5 }, { t: 105.21, flash: 0.6, cut: { az: 2.7, el: -0.3, zoom: -0.5 } }, { t: 120.83, flash: 0.4 },
    { t: 136.45, flash: 0.5 }, { t: 159.85, flash: 0.7 }, { t: 200.83, flash: 0.3 },
  ],
};
