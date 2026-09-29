# Plan 038: Compact hero and bento grid

Status: IMPLEMENTED LOCALLY, not merged or deployed. Date: September 27, 2026.

## Decision

After Plan 037 set a new baseline, Louie reviewed four homepage variations
and chose:

- Variation 1's compact hero, so the work starts in the first screen.
- Variation 3's bento grid for the four projects.
- Variation 4's amber decision mark, applied to "Clear decisions."

## What changed

- `components/portfolio/reveal-heading.tsx`: `markLabel` and
  `breakAfterQuiet` props. The accessible name stays the plain sentence.
- `app/globals.css`: `.headline-mark` styles; the mark waits for the
  entrance to finish; compact `--text-home-hero`.
- `components/portfolio/work-tile.tsx`: bento tile on the plate tokens.
- `components/portfolio/project-plates.tsx`: `ProjectTile`, `ExperimentTile`,
  and a fact line that keeps "At CK-12: 2016 to 2025" labeled, so it does not
  read as a project timeline.
- `app/page.tsx`: new hero and grid; "More work" section removed.

## Verification

In headless Chromium against the dev server, the hero entrance completes in
0.9 to 1.2 seconds at 390, 1100, and 1440px. The in-app preview pane throttles
animation and is not a reliable timing source.
