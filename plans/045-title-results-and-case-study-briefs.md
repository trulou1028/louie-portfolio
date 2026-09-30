# Plan 045: One title, sourced results, and case-study briefs

Status: shipped, 2026-09-30.

## What changed

1. **One title.** "Founding Product Designer & AI Systems Lead" everywhere: header, page titles, share image, structured data, resume page, and the re-rendered resume PDF (headline "| Complex Workflows").
2. **Briefs.** `CaseStudyBrief` (Problem / What I did / Result) sits under the quick facts on each /work case study, before the hero image. `WorkProject.brief` holds the text. It replaces the status/result line after the hero image.
3. **Offboard results** from `lumo-plan-builder/coach/` evidence files (read-only production queries recorded there, Aug to Sep 2026). Reported as shares of a named group. Owner decision (2026-09-30): keep the 8% first-packet and 72% single-packet figures, framed as the case for plan-first and the next design problem. Revenue, subscriber counts, and account totals are left out on purpose. Placeholder testimonials in that repo are fictional and not used.
4. **CK-12 results** from https://info.ck12.org/efficacy-studies:
   - Flexi: the Spring 2025 study was run by Leanlab Education (external); teacher comparison (9 of 10 preferred Flexi); dialogue analysis (answer-seeking questions 72% to 52% by the eighth question, body-text figures, Flexi in Adaptive Practice).
   - Foresights and Insights: menu interpretation (90%), recommend rates (70%, 90%), and the focus-group need (6 of 8 teachers cite opaque AI assessment).
   - Every finding is attributed to CK-12 or Leanlab, not to Louie, and marked descriptive where the source says so.
5. **Ask Louie evidence** updated to match (`offboard-outcome-limits`, `flexi-research`, `flexi-evaluation-limits`, `analytics-evaluation`).
