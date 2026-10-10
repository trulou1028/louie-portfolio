# Plan 050: A calmer homepage loop

Status: on branch, 2026-10-10. Louie's review: the Plan 048 loop showed the
whole Motif studio at half size, three panels and 20-plus controls moving
at once, which read as busy next to "Clear decisions."

## What changed

- **Two parts, not the whole studio.** The loop keeps only the "What are you
  building?" block and the app's settings area, each on its own card over
  the Motif plate (`scripts/motif-hero/backdrop.html`). Everything else is
  cropped away. Nothing is redrawn: both cards are the recorded site.
- **One change at a time.** Work tools, Kids & games, Banking & health, back
  to Work tools, each held about 3.5 seconds. No menu, switch, or Shuffle.
- **Sharper.** The screencast captures at 1x, so the page is magnified with
  pinch zoom (1.3) before recording instead of being scaled up afterward.
- **Lighter.** About 115 KB per format, 10 seconds, 1600x1000.
