// "Yes I'm Changing" (Currents, side B, track 1), choreographed by hand: one slow change, start to finish, with no
// way back. The river's straight lines curl up, a few at a time from the middle outwards, into rings round the deck;
// the night goes violet, then lilac; a door of light opens on the horizon, and at the end the deck goes through it.
// Times are seconds into the track; sections and downbeats from assets/maps/currents/04-yes-im-changing.json.
//   0:00  night: straight lines, hardly moving                0:24  verse 1: the river starts to run
//   0:45  the first refrain: the innermost lines let go and close into rings
//   1:07  verse 2: more rings      1:31  the line about what is waiting: a door ajar on the horizon, a line of light
//   1:49  verse 3: another angle on it     2:04  the answer to the saying about people: half the field is rings
//   2:11  the second refrain: no stopping it; by the line about a new self, from above, all of it is rings
//   2:42  the call: the door stands open, and the rings start to swell outwards
//   3:01  the call, three times, each time nearer        3:38  the last verse: the door grows, and grows
//   4:20  through it       4:23  the other side: white, the same rings in violet, still
export default {
  title: "Yes I'm Changing",
  keywords: /^(changing|gone|older|moving|future|blue|change|version|last|world|calling|arise|door|through|yours|you)$/i,
  acts: [
    // night: straight strata, hardly moving
    { t: 0, palette: 'night', flow: 0.1, turb: 0, calm: 1, spark: 0.3, fade: 0.6, orb: 0.22, rainbow: 0.2, camEl: 0.15, camAz: 0.1, camZoom: -0.3, drift: 0.02, pulse: 0.5, bloom: 0.8, split: 0.1, words: 'drift' },
    { t: 12.27, fadeIn: 10, fade: 0.8, flow: 0.18, camEl: 0 },
    // verse 1: the river starts to run
    { t: 22.93, fadeIn: 6, palette: 'violet', calm: 0.5, flow: 0.4, turb: 0.2, fade: 1, spark: 0.55, camAz: -0.1, camEl: -0.05 },
    { t: 33.5, fadeIn: 6, calm: 0.25, camAz: 0.2 },
    // the first refrain: the innermost lines let go
    { t: 45.7, fadeIn: 5, rings: 0.12, flow: 0.5, camEl: 0.3, camZoom: -0.45, camAz: 0 },
    { t: 51.1, fadeIn: 8, rings: 0.2, calm: 0.1 },
    // verse 2: faster
    { t: 67.4, fadeIn: 6, rings: 0.24, flow: 0.7, turb: 0.4, spark: 0.75, camEl: 0, camAz: -0.3, camZoom: -0.4, drift: 0.04 },
    { t: 82.0, fadeIn: 8, rings: 0.28, orb: 0, camEl: -0.3, camAz: -0.05, camZoom: -0.5, drift: 0.02 },
    // what is waiting: a door ajar on the horizon
    { t: 91.7, fadeIn: 5, door: 0.07, camEl: -0.5, camAz: 0, camZoom: -0.5 },
    { t: 97.3, fadeIn: 8, door: 0.12, rings: 0.32, ripple: 0.2 },
    // verse 3: another angle on it, then straight at the door
    { t: 109.7, fadeIn: 5, camAz: 0.5, camEl: 0.1, camZoom: -0.6, rings: 0.36 },
    { t: 115.1, fadeIn: 4, camAz: 0.05, camEl: -0.5, camZoom: -0.3, door: 0.17 },
    // the saying about people, and its answer
    { t: 119.2, fadeIn: 5, rings: 0.42, flow: 0.8 },
    { t: 124.5, fadeIn: 3, rings: 0.58, palette: 'lilac', spark: 0.9, camEl: 0.2, camZoom: -0.7, camAz: -0.2, ripple: 0.35 },
    // the second refrain: no stopping it
    { t: 131.2, fadeIn: 5, rings: 0.75, flow: 0.9, turb: 0.5, rainbow: 0.8, bloom: 0.9 },
    // a new self: from above, all of it is rings
    { t: 140.4, fadeIn: 5, rings: 1, ripple: 0.5, camEl: 0.7, camZoom: -1.0, camAz: 0.3, drift: 0.03 },
    // out of hiding: back down to the horizon
    { t: 152.2, fadeIn: 6, camEl: -0.3, camAz: 0.15, camZoom: -0.6, door: 0.2, drift: 0.02 },
    // the call: the door stands open, the rings swell outwards
    { t: 161.9, fadeIn: 4, door: 0.3, ripple: 1, camEl: -0.52, camAz: 0, camZoom: -0.55, flow: 0.7, spark: 1, bloom: 0.8 },
    { t: 173.61, fadeIn: 3, camZoom: -0.85, camAz: -0.25, pulse: 1.1 },
    // the call, three times: each time nearer
    { t: 181.9, fadeIn: 4, door: 0.35, camAz: 0.2, camZoom: -0.6 },
    { t: 192.6, fadeIn: 4, door: 0.39, camAz: -0.15, camZoom: -0.45 },
    { t: 203.3, fadeIn: 2.2, door: 0.43, camAz: 0, camZoom: -0.75 },
    { t: 205.61, fadeIn: 6, flow: 0.4, turb: 0.2, pulse: 0.6, camZoom: -0.35 },                // the break: holding its breath in front of it
    // the last verse: up, and toward it. The door grows
    { t: 217.61, fadeIn: 4, flow: 0.9, turb: 0.5, pulse: 1.1, door: 0.47, camZoom: -0.55, bloom: 0.85, words: 'slam' },
    { t: 229.0, fadeIn: 10, door: 0.56, camZoom: -0.4 },
    { t: 239.7, fadeIn: 9, door: 0.64, camZoom: -0.25, bloom: 0.75 },
    { t: 249.7, fadeIn: 7.8, door: 0.72, camZoom: -0.1, bloom: 0.6 },
    // through it
    { t: 257.62, fadeIn: 5.2, door: 1, flow: 0.5, bloom: 0.25 },
    // the other side: white, the same rings in violet, still
    { t: 262.97, fadeIn: 0.5, palette: 'white', palFast: true, flow: 0.2, turb: 0.05, ripple: 0.4, spark: 0.5, rainbow: 0.25, pulse: 0.4, width: 0.7, fade: 0.75, camEl: 0.05, camZoom: -0.6, camAz: 0.25, drift: 0.03, bloom: 0.15, vig: 0.25, split: 0.05, words: 'off' },
  ],
  events: [
    { t: 22.93, flash: 0.3 }, { t: 46.93, flash: 0.3 }, { t: 126.94, flash: 0.4 }, { t: 132.27, flash: 0.35 }, { t: 162.95, flash: 0.4 }, { t: 173.61, flash: 0.45 },
    { t: 184.28, flash: 0.3 }, { t: 194.95, flash: 0.3 }, { t: 217.61, flash: 0.5 }, { t: 262.97, flash: 1, cut: { az: 0.25, el: 0.05, zoom: -0.6 } },
  ],
};
