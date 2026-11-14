// "The Less I Know The Better" (Currents, side C, track 1), choreographed by hand: a triangle. The deck is the one
// left out; the chrome orb is her; a red orb comes up out of the river upstream and its wake runs straight into the
// deck. Times are seconds into the track; sections and downbeats from assets/maps/currents/07-the-less-i-know-the-better.json.
//   0:00  the bass line alone in the dark: the deck's pulse runs down the red line, a beat a pulse
//   0:11  the groove: the mustard river
//   0:24  verse 1: the rival surfaces upstream, the river parts round it, its red wake reaches the deck
//   0:33  the orb comes down out of the sky and sits at the rival's side      0:53  the title line: looking the other way
//   1:06  the chorus is the wish: rose light, the rival gone, the orb at the deck's side with the deck in its chrome
//   1:14  ...and back to how it is, and the wish again, line by line        1:39  the last word of it: she goes back
//   1:47  verse 2, the waiting: the river slows almost to a stop, the two of them small and far off
//   2:20  the wish once more, with the rival still there behind it
//   2:36  the vamp: all of it at once, ember red, the pulse racing, the wake full on the deck
//   3:05  the last line, three times: closer each time     3:32  they are gone; the line goes flat
export default {
  title: 'The Less I Know The Better',
  keywords: /^(together|better|love|side|shoulder|mind|goodbye|never|forever|fine|face|eyes|line)$/i,
  acts: [
    // the bass alone: night, a few slow lines, the pulse on the red one
    { t: 0, palette: 'night', flow: 0.25, turb: 0.05, calm: 0.45, spark: 0.3, fade: 0.6, orb: 0.3, rainbow: 0.3, ekg: 0.95, camEl: -0.3, camAz: 0.2, camZoom: -0.3, drift: 0.02, bloom: 0.85, pulse: 0.8, words: 'drift' },
    // the fill, then the groove
    { t: 8.61, fadeIn: 2, fade: 0.9, flow: 0.5, calm: 0.2 },
    { t: 10.67, fadeIn: 1.5, palette: 'mustard', palFast: true, flow: 0.85, turb: 0.4, calm: 0, spark: 0.85, fade: 1, rainbow: 0.6, ekg: 0.6, camZoom: -0.3, camEl: -0.3, camAz: 0, drift: 0.06, pulse: 0.9 },
    // verse 1: the news. Something surfaces upstream
    { t: 24.5, fadeIn: 5, palFast: false, rival: 1, camAz: 0.85, camEl: -0.36, camZoom: -0.5, drift: 0.04 },
    // seen with him: the orb goes down to it
    { t: 33.1, fadeIn: 5, pair: 1, orb: 0.21 },
    { t: 41.0, fadeIn: 4, camAz: 0.55, camZoom: -0.4, turb: 0.6 },
    // the worst of it: the pulse racing
    { t: 49.0, fadeIn: 2, ekg: 1, turb: 0.9, flow: 1.05, split: 0.5, camAz: 0.95, camZoom: -0.6 },
    // the title line: turning away from them, downstream
    { t: 53.5, fadeIn: 4, camAz: -0.75, camEl: -0.22, camZoom: -0.3, turb: 0.5, ekg: 0.6, split: 0.2 },
    { t: 62.0, fadeIn: 3, camAz: -0.35, camEl: -0.3 },
    // the chorus is the wish: she is at the deck's side, and there is no one upstream
    { t: 66.1, fadeIn: 1.6, palette: 'rose', palFast: true, rival: 0, pair: 0, beside: 1, orb: 0.18, sun: 0.22, flow: 0.9, turb: 0.5, rainbow: 1, spark: 1, ekg: 0.35, camAz: 0.45, camEl: -0.3, camZoom: -0.55, drift: 0.02, bloom: 0.9, split: 0.4, words: 'slam' },
    // the chorus's second line: how it is
    { t: 74.1, fadeIn: 1.6, palette: 'mustard', rival: 1, pair: 1, beside: 0, sun: 0, rainbow: 0.5, ekg: 0.9, camAz: 0.85, camEl: -0.36, camZoom: -0.5, words: 'drift' },
    // its third: the wish again, wider
    { t: 82.1, fadeIn: 1.6, palette: 'rose', rival: 0, pair: 0, beside: 1, sun: 0.25, rainbow: 1, ekg: 0.35, camAz: 0.55, camEl: -0.36, camZoom: -0.65, words: 'slam' },
    { t: 91.0, fadeIn: 5, rival: 0.6, camAz: 0.55, camZoom: -0.6, words: 'drift' },                // its fourth: the rival begins to come back
    // its last word: she goes back
    { t: 99.1, fadeIn: 4, palette: 'mustard', palFast: false, rival: 1, pair: 1, beside: 0, sun: 0, rainbow: 0.5, ekg: 0.7, drift: 0.04, camAz: 0.8, camEl: -0.3, camZoom: -0.55 },
    // verse 2: told to wait. The river slows almost to a stop, and they are a long way off
    { t: 106.9, fadeIn: 5, flow: 0.3, calm: 0.4, turb: 0.2, camZoom: -0.95, camEl: -0.2, camAz: 1.0, drift: 0.03, spark: 0.5, pulse: 0.6 },
    { t: 115.1, fadeIn: 4, flow: 0.14, calm: 0.65, camZoom: -1.1 },
    { t: 128.1, fadeIn: 6, flow: 0.07, calm: 0.8, palette: 'dusk', camAz: 0.75, camEl: -0.4 },     // still waiting
    // chorus 2: the wish, bigger; but this time the rival does not go away
    { t: 139.91, fadeIn: 1.4, palette: 'rose', palFast: true, pair: 0, beside: 1, rival: 0.5, orb: 0.2, sun: 0.25, flow: 0.95, calm: 0, turb: 0.55, rainbow: 1, spark: 1, pulse: 1, ekg: 0.4, camAz: 0.45, camEl: -0.3, camZoom: -0.6, drift: 0.02, words: 'slam' },
    { t: 148.1, fadeIn: 5, rival: 1, camAz: 0.6, camEl: -0.36, camZoom: -0.7, words: 'drift' },
    // the vamp: everything at once
    { t: 156.5, fadeIn: 1.5, palette: 'ember', palFast: true, pair: 1, beside: 0, rival: 1, sun: 0.12, flow: 1.2, turb: 1, rainbow: 0.7, ekg: 1, pulse: 1.2, split: 0.6, bloom: 1.05, camAz: 0.95, camEl: -0.4, camZoom: -0.45, drift: 0.09 },
    { t: 165.0, fadeIn: 4, camAz: 0.5, camZoom: -0.65, camRoll: 0.04 },
    { t: 173.6, fadeIn: 3, camAz: 1.15, camEl: -0.3, camZoom: -0.4, camRoll: -0.04 },
    { t: 177.1, fadeIn: 3, camAz: -0.6, camRoll: 0, camZoom: -0.3 },                              // looking away
    // the last line, three times: each time nearer to the two of them
    { t: 185.0, fadeIn: 1.2, palette: 'mustard', camAz: 0.75, camEl: -0.38, camZoom: -0.75, words: 'slam', glitch: 0.06 },
    { t: 193.6, fadeIn: 1.2, palette: 'ember', camAz: 0.95, camZoom: -0.5 },
    { t: 201.6, fadeIn: 1.2, palette: 'mustard', camAz: 1.1, camZoom: -0.3, glitch: 0.1 },
    // they go; what is left is the red line, and then that goes flat
    { t: 206.59, fadeIn: 6, palFast: false, palette: 'night', rival: 0, orb: 0.004, glitch: 0, flow: 0.4, turb: 0.2, calm: 0.5, rainbow: 0.2, fade: 0.5, camAz: 0.2, camEl: -0.38, camZoom: -0.15, drift: 0.02, split: 0.1, words: 'off' },
    { t: 212.74, fadeIn: 1.2, ekg: 0, flow: 0.15, fade: 0.35 },
  ],
  events: [
    { t: 10.67, flash: 0.6 }, { t: 49.64, glitch: 0.5 }, { t: 68.12, flash: 0.55 }, { t: 74.27, flash: 0.25, cut: { az: 0.85, el: -0.36, zoom: -0.5 } },
    { t: 82.48, flash: 0.45, cut: { az: 0.55, el: -0.36, zoom: -0.65 } }, { t: 98.89, glitch: 0.4 }, { t: 139.91, flash: 0.7, cut: { az: 0.45, el: -0.3, zoom: -0.6 } },
    { t: 157.35, flash: 0.6, glitch: 0.7 }, { t: 161.46, glitch: 0.4 }, { t: 169.67, flash: 0.3 }, { t: 186.08, flash: 0.5, cut: { az: 0.75, el: -0.38, zoom: -0.75 } },
    { t: 194.29, flash: 0.6, cut: { az: 0.95, el: -0.38, zoom: -0.5 } }, { t: 202.49, flash: 0.7, cut: { az: 1.1, el: -0.38, zoom: -0.3 } }, { t: 212.74, flash: 0.35 },
  ],
};
