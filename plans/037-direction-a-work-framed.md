# Plan 037: Direction A, "The work, framed," with decision marks

Status: IMPLEMENTED LOCALLY, not merged or deployed. Date: September 27, 2026.

## Decision

Louie reviewed three static homepage mocks and chose direction A, plus
direction B's amber markup inside the case studies.

- **A, The work, framed:** light neutral shell; each project on a plate in
  its own brand color; employers and years beside the headline.
- **B, Decision layer:** one amber signal color used only to redline the
  decision inside each real screenshot.
- **C, Committed moss** was not chosen.

## Why

A visual audit found the site read as a careful text document rather than a
designer's showcase:

- Dark stone with a violet accent is the most common AI-generated palette in
  2026, and it had drifted from spec §6 (light, restrained).
- Small mono uppercase labels sat above every section, and violet side
  stripes marked callouts. Both read as template scaffolding.
- Recruiters could not see employers or years on the homepage.
- Every project card was the same grey, so the projects blurred together.
- The persistent left rail spent a quarter of the screen on four links.

## What changed

See the README section "Direction A". Key files:

- `app/globals.css`: light tokens, plate tokens, `signal`, Archivo roles,
  `.portfolio-wide` centered at 1320px, decision-mark styles.
- `components/app-shell/site-header.tsx` replaces `left-rail.tsx`.
- `components/portfolio/work-plate.tsx`, `project-plates.tsx`: plates.
- `components/portfolio/decision-mark.tsx`, `lib/decision-mark.ts`, and the
  `marks` prop on `ArtifactFrame`.
- `components/portfolio/next-case-study.tsx`.
- `content/work/projects.ts`: `plate`, `facts`, `gallery`, `imageMarks`.
- `content/resume.ts`: `scale` lines condensed from each role's highlights.

## Content rules applied

- Every fact on a plate or in the hero record is resume-stated.
- Decision-mark labels restate a caption, alt text, or case-study sentence.
- No UI was redrawn; marks sit over the supplied screenshots.
- Missing images are `need` entries, shown only in development.

## Open asset requests (TODO(asset))

- Offboard: the risk gate pausing for the person's choice; a Job Packet on a
  phone.
- Foresights: one range with the not-enough-data state; an early sketch or
  the rejected single-score concept.
- Flexi: Flexi on a phone inside a lesson; a research artifact from the
  classroom study.

## Neuron Shift disclaimer

At Louie's request, the page and its evidence entry now say "Independent
concept prototype, not built for a customer. Not affiliated with or endorsed
by any company." The earlier text named the interview it was prepared for.
Both statements are true; the new one no longer points a recruiter at another
company's hiring process.

## Not done

- The word-by-word heading reveal still runs on every page.
- Lighthouse was not re-measured.
