// "Patience" (B-Sides & Rarities, side C, track 1), choreographed by hand: a day on the sheet, and the waiting in it.
// The deck is the hub of a clock ruled on the paper; the light goes round it like a sun, so the deck's shadow is a
// sundial's and every card's shadow wheels with it. Times are seconds into the track; sections and downbeats are from
// its song map (assets/maps/rarities/07-patience.json), line starts from assets/lyrics/rarities/07-patience.json.
// Each act says only what changes (worlds/rarities.js lists the knobs; `day` is how fast the clock runs).
//   0:00  a blank sheet from above: a clock face is ruled in round the deck, its second hand ticking on the beat
//   0:17  the beat: the hands start, the light begins to go round
//   0:37  verse 1, the calendar: day sheets blow off it, the first cards are drawn
//   1:16  the chorus, a paper stock and a day to each line: bone, manila, newsprint; on the last the figure loses its shape
//   1:55  the line about being late: night comes down (the negative) and the clock runs away
//   2:15  it stops. The cards lie down and the sheet heaves like water under the deck: adrift, and nothing comes
//   2:52  first light; 3:11 the seasons again, quicker
//   3:58  the line about pages: a storm of them, then none; 4:09 the clock's last run
//   4:28  the sun goes down on the sheet, the cards fold, and it is night
export default {
  title: 'Patience',
  keywords: /^(long|days|round|time|life|stages|phases|season|changes|shapeless|late|waits|takes|floating|wave|pages|aimless|straight)$/i,
  acts: [
    // the piano alone: a blank sheet, seen from straight above
    { t: 0, palette: 'paper', sleeves: 0, vu: 0, lissa: 0, chart: 0, lathe: 0.6, sweep: 0, typing: 0.5, stamp: 0, graph: 1, regmarks: 0.3, layout: 0, lowsun: 0, dial: 0, day: 0, pages: 0, swell: 0, sea: 0, course: 0, bearings: 0,
      flow: 0.3, turb: 0.2, pulse: 0.5, fade: 1, bloom: 0.5, vig: 0.6, grain: 0.05, split: 0.08, mblur: 0.4, camEl: 0.62, camZoom: 0.02, camAz: 0.5, drift: 0.015, words: 'drift' },
    { t: 2.19, fadeIn: 12, dial: 1, camZoom: -0.14, camAz: 0.25 },                 // the face is ruled in
    // 0:17 the beat: the hands start
    { t: 16.66, fadeIn: 3, day: 0.6, lowsun: 0.55, typing: 1, lathe: 1, chart: 0.5, lissa: 0.3, camEl: 0.3, camZoom: -0.25, camAz: 0, drift: 0.04, flow: 0.5, pulse: 0.8 },
    { t: 26.55, fadeIn: 6, sleeves: 0.35, vu: 0.5, camEl: 0.12, camAz: -0.2 },
    // 0:37 verse 1: the calendar
    { t: 37.26, fadeIn: 2.5, pages: 0.35, day: 1, stamp: 0.5, camEl: 0, camAz: 0.15, camZoom: -0.3 },
    { t: 46.15, fadeIn: 4, pages: 0.55, sleeves: 0.5, camAz: 0.4 },                // the line about going in circles
    { t: 56.49, fadeIn: 3, vu: 1, sleeves: 0.62, lissa: 0.5, camEl: -0.15, camAz: -0.1, camZoom: -0.35 },   // the question it keeps asking
    { t: 68.59, fadeIn: 4, pages: 0.2, day: 0.4, lowsun: 0.8, camEl: -0.3, drift: 0.02 },     // the band drops out: it holds its breath
    // 1:16 the chorus: the book stands up, and each line is a season, on its own paper
    { t: 75.75, fadeIn: 0.8, palette: 'bone', sleeves: 1, vu: 1, stamp: 1, lissa: 0.8, sweep: 0.6, day: 5, lowsun: 0.75, pages: 0.4, camEl: -0.42, camZoom: -0.42, camAz: 0.2, drift: 0.08, pulse: 1, flow: 1, layout: 1 },
    { t: 84.68, fadeIn: 1.5, palette: 'manila', camAz: -0.3, layout: 2 },         // line 2
    { t: 94.06, fadeIn: 1.5, palette: 'newsprint', camAz: 0.5, camEl: -0.48, layout: 3 },     // line 3: a new season
    { t: 103.79, fadeIn: 2, palette: 'paper', lissa: 1, turb: 1, camAz: 0.1, camEl: -0.3, layout: 4 },   // line 4: the figure loses its shape
    // 1:55 the bridge: night, and the clock runs away
    { t: 115.35, fadeIn: 1.2, palette: 'negative', day: 9, pages: 0.8, sleeves: 0.7, lowsun: 0.9, turb: 0.5, camEl: -0.1, camZoom: -0.25, camAz: -0.2, bloom: 0.9 },
    { t: 124.95, fadeIn: 0.6, day: 14, pages: 1, sleeves: 1, camEl: -0.46, camZoom: -0.5, camAz: 0.35, split: 0.3, layout: 5 },
    // 2:15 it stops. Adrift
    { t: 134.55, fadeIn: 3, day: 0.25, pages: 0, sleeves: 0.3, vu: 0.2, chart: 0, lathe: 0.5, typing: 0, sweep: 0, swell: 0.45, lissa: 0.6, turb: 0.2, flow: 0.3, lowsun: 0.3, graph: 0.6, camEl: 0.5, camZoom: -0.3, camAz: 0, drift: 0.03, pulse: 0.5, split: 0.1 },
    { t: 144.15, fadeIn: 3, swell: 0.8, lissa: 1, flow: 0.6, camEl: 0, camZoom: -0.45, camAz: 0.3 },
    // 2:32 the verse adrift: the swell at its height
    { t: 152.48, fadeIn: 4, swell: 1, sleeves: 0.15, camEl: -0.42, camZoom: -0.4, camAz: -0.25, drift: 0.06 },
    { t: 162.51, fadeIn: 5, camAz: 0.2, camEl: -0.5, lissa: 0.8 },
    // 2:52 first light
    { t: 171.71, fadeIn: 8, palette: 'bone', swell: 0.4, day: 0.8, lowsun: 0.95, sleeves: 0.45, typing: 1, chart: 0.5, lathe: 1, graph: 1, camEl: -0.2, camAz: 0, bloom: 0.5 },
    { t: 181.35, fadeIn: 4, swell: 0.1, vu: 0.6, pages: 0.3, lissa: 0.4, camEl: 0.1, camZoom: -0.25 },
    // 3:11 the seasons again, quicker
    { t: 190.95, fadeIn: 0.8, palette: 'paper', swell: 0, sleeves: 1, vu: 1, lissa: 0.9, sweep: 0.6, day: 6, lowsun: 0.7, pages: 0.5, turb: 0.6, camEl: -0.44, camZoom: -0.45, camAz: -0.3, drift: 0.09, pulse: 1, flow: 1, layout: 6 },
    { t: 199.75, fadeIn: 1.5, palette: 'manila', camAz: 0.25, layout: 7 },
    { t: 208.98, fadeIn: 1.5, palette: 'newsprint', camAz: 0.6, camEl: -0.5, layout: 8 },
    { t: 218.68, fadeIn: 2, palette: 'bone', lissa: 1, turb: 1, camAz: 0, camEl: -0.3, layout: 9 },     // line 4 again
    { t: 228.38, fadeIn: 2, palette: 'paper', pages: 0.8, day: 8, camEl: -0.15, camZoom: -0.5, camAz: -0.4 },
    // 3:58 the line about pages: all of them at once...
    { t: 237.93, fadeIn: 1.5, pages: 1, flow: 1.4, camEl: -0.38, camAz: 0.3 },
    { t: 246.15, fadeIn: 2.2, pages: 0 },                                           // ...and none left
    // 4:09 the clock's last run
    { t: 248.55, fadeIn: 0.6, day: 14, lowsun: 0.9, turb: 0.6, flow: 1, camEl: -0.48, camZoom: -0.35, camAz: 0.1, split: 0.3, layout: 10 },
    { t: 258.16, fadeIn: 2, camAz: -0.35, camZoom: -0.5 },
    // 4:28 the sun goes down on the sheet
    { t: 267.76, fadeIn: 8, day: 1.5, sleeves: 0.4, vu: 0.2, lissa: 0.4, stamp: 0.4, sweep: 0, lowsun: 1, camEl: 0.1, camZoom: -0.55, camAz: 0.2, drift: 0.04, flow: 0.4, pulse: 0.6, split: 0.1 },
    { t: 279.75, fadeIn: 8, palette: 'negative', sleeves: 0.1, lissa: 0.15, chart: 0.2, day: 0.3, camEl: 0.5, camZoom: -0.3, fade: 0.6 },
  ],
  events: [
    { t: 16.66, flash: 0.4 }, { t: 75.75, flash: 0.7 }, { t: 115.35, glitch: 0.5 }, { t: 124.95, flash: 0.9, cut: { az: 0.35, el: -0.46, zoom: -0.5 } },
    { t: 144.15, flash: 0.35 }, { t: 190.95, flash: 0.8 }, { t: 248.55, flash: 0.9, cut: { az: 0.1, el: -0.48, zoom: -0.35 } },
  ],
};
