# Plan 048: Motif leads the experiments and the homepage hero

Status: shipped to branch, 2026-10-10. Louie's request: Motif is the more
attractive piece, so it comes before Neuron Shift.

## What changed

1. **Order.** Motif is first in `content/experiments/experiments.ts`, so it
   comes before Neuron Shift on `/work`, `/experiments`, and the homepage
   grid. On the homepage Motif takes the large tile beside Flexi; Neuron
   Shift takes the wide last row.
2. **Hero loop.** The homepage hero plays a 15-second screen recording of
   the live Motif studio (`public/work/motif/hero-loop.*`, about 360 KB
   each): Kids & games, a menu, Banking & health, a switch, Shuffle, then
   back to Work tools, so the loop closes. `scripts/record-motif-hero.cjs`
   re-records it. Same rules as before: no autoplay with reduced motion,
   plays only on screen, visible pause control.
3. **Neuron Shift loop kept.** Its files stay in `public/work/neuron-shift/`
   and `scripts/record-neuron-hero.cjs` still records it.

The "How I work" principle "Build something that can be questioned" still
links to Neuron Shift's limits section. It fits that project's argument.
