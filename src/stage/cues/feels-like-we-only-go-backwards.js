// "Feels Like We Only Go Backwards" (Lonerism, side C, track 1): a day in the park, played from its end to its
// beginning. It opens at dusk and every chorus winds the day further back (the sun crossing the sky the wrong way,
// the shadows swinging round, the walkers going backwards, the blossom rising into the trees, the words sliding
// off to the left), while the camera is dragged further from the railings. The verses lean in and go forwards for
// a while. It ends at dawn, before anyone came. Times are seconds into the track; sections are from its song map
// (assets/maps/lonerism/07-feels-like-we-only-go-backwards.json). `flow` below zero is what runs the lawn in
// reverse; `dayShift` is how far the day has been wound back from the palette's hour.
//   0:00  dusk, the last of them leaving, backwards        0:33  verse 1: forwards, leaning in
//   0:56  chorus: back through the afternoon to noon, the lawn filling up as it gets earlier
//   1:24  verse 2: forwards again, from further off       1:45  it stops
//   1:47  chorus: noon back to morning      2:13  again: early, long shadows the other way, a few of them far off
//   2:39  again: dawn and mist, nobody yet, the camera as far back as it goes         3:05  the tape runs out
export default {
  title: 'Feels Like We Only Go Backwards',
  keywords: /^(backwards|ahead|hopes|again|silly|name|hope|maybe|indecision|decided|real|feels)$/i,
  acts: [
    // the end of the day, which is where this starts: looking into the low sun, close on the bars
    { t: 0, palette: 'dusk', camEl: -0.56, camAz: -0.55, camZoom: 0, drift: 0.035, grain: 0.12, vig: 0.4, mblur: 0.4, bloom: 0.65, split: 0.15, flow: -0.5, turb: 0.3, pulse: 0.8, spark: 0.7,
      leak: 0.45, expo: 0, crowd: -0.5, near: -0.3, dance: 0.2, petals: 0.7, trail: 0.25, dayShift: 0, words: 'drift' },
    // the chorus, the first time: the evening unwinding
    { t: 4.02, fadeIn: 26, dayShift: -0.14, crowd: 0, camZoom: -0.3, camAz: -0.3 },
    // verse 1: forwards, for a while. The camera leans in; they come nearer
    { t: 32.95, fadeIn: 3, flow: 0.55, trail: 0, dayShift: -0.1, camZoom: -0.05, camAz: 0.15, leak: 0.3, crowd: 0.3, near: 0.2, dance: 0.4, pulse: 0.6 },
    { t: 45.93, fadeIn: 8, near: 0.5, camZoom: 0.1 },
    // chorus: pulled back, further than before; the afternoon runs in reverse to noon
    { t: 56.12, fadeIn: 1.5, flow: -1.1, trail: 0.3, camZoom: -0.5, camAz: -0.25, leak: 0.8, dance: 0.9, crowd: 0.8, near: 0.3, pulse: 1, spark: 1, split: 0.3, bloom: 0.8 },
    { t: 58, fadeIn: 24, dayShift: -0.45 },
    // verse 2: forwards again
    { t: 84.12, fadeIn: 3, flow: 0.6, trail: 0, dayShift: -0.41, camZoom: -0.25, camAz: 0.3, leak: 0.35, dance: 0.4, near: 0.4, pulse: 0.6, split: 0.15 },
    { t: 96.12, fadeIn: 8, camZoom: -0.1, near: 0.6 },
    // the two-word line before the chorus: everything stops
    { t: 104.93, fadeIn: 0.6, flow: 0, calm: 1, dance: 0 },
    // chorus: and back. Noon to morning; fewer of them, the earlier it gets
    { t: 107.46, fadeIn: 1.2, calm: 0, flow: -1.3, trail: 0.35, camZoom: -0.6, camAz: -0.1, leak: 0.85, dance: 0.9, pulse: 1, crowd: 0.6, near: 0.1, split: 0.3 },
    { t: 109.5, fadeIn: 23, dayShift: -0.68, crowd: 0.1 },
    // again: early morning, long shadows lying the other way
    { t: 133.38, fadeIn: 1.5, flow: -1.6, camZoom: -0.72, camAz: 0.2, leak: 0.6, near: -0.3 },
    { t: 135.2, fadeIn: 22, dayShift: -0.84, crowd: -0.5, dance: 0.4 },
    // again: back before anyone came
    { t: 158.98, fadeIn: 1.5, flow: -1.8, camZoom: -0.85, camAz: 0.45, leak: 0.4, expo: -0.1 },
    { t: 160.8, fadeIn: 22, dayShift: -0.95, crowd: -1, near: -0.8, dance: 0, soft: 0.5 },
    // the tape runs out
    { t: 184.91, fadeIn: 3, flow: -0.15, trail: 0, calm: 0.5, pulse: 0.2, leak: 0.2, fade: 0.8, words: 'off' },
  ],
  events: [
    { t: 4.14, glitch: 0.5 }, { t: 32.95, flash: 0.3 }, { t: 56.13, flash: 0.5, glitch: 0.7 }, { t: 84.12, flash: 0.3 }, { t: 107.31, flash: 0.6, glitch: 0.7 },
    { t: 133.34, flash: 0.4, glitch: 0.7 }, { t: 158.93, flash: 0.4, glitch: 0.7 }, { t: 184.91, flash: 0.3 },
  ],
};
