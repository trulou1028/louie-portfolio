# Plan 047: Motif as a second experiment

Status: shipped to branch, 2026-10-10. Awaiting Louie's review.

## What changed

1. **New experiment, `/experiments/motif`.** A case study for Motif, Louie's
   motion design system (motif-ui-kappa.vercel.app). Seven sections: premise,
   system, what I cut, the AI rules file, getting it into an app, building
   it, and limits. Brief (Problem / What I did / Result) like Neuron Shift.
2. **Sources.** Every claim comes from the Motif repository (SPEC.md,
   NOTES.md, dogfood/REPORT.md, git log) or the live site. Six screenshots
   were captured from the live site on 2026-10-10 into `public/work/motif/`.
   The repository is private, so the page does not link to source.
3. **Experiments are data-driven.** `Experiment` gains `name`, `plate`,
   `badge`, `meta`, and `demoLabel`. The experiment page renders any slug in
   its `WRITE_UPS` table; plates, tiles, and cards read the new fields
   instead of hard-coding Neuron Shift.
4. **Motif plate.** `--plate-motif*` tokens match the Motif site's near-black
   canvas. Motif is a `prototype`, so it also appears on `/work` under the
   case studies, like Neuron Shift. The homepage is unchanged.
5. **Ask Louie.** Seven evidence entries (one per section), three page
   questions, and Motif in the answer-link, job-fit, job-compare, and
   thinking-state lists. The system prompt forbids treating Motif as a
   customer deployment.
6. **Claim ledger.** Source M and claims M01 to M03.

## Follow-up, same day (Louie's review)

7. **Homepage.** Motif joins the Selected work grid after Neuron Shift.
   Five tiles leave one alone in the last row, so that tile uses a new
   `wide` shape: copy on the left, screenshot on the right, full row.
8. **Studio screenshot** re-captured on the Settings view instead of Blog.
9. **CK-12 placeholder removed.** The "early sketch" asset request is gone
   from the CK-12 gallery. It only ever showed on the dev server.
10. **Contact in the header.** A Contact button opens a panel with the email
    address as text (with Copy), LinkedIn, Book time, and Resume. The mobile
    menu shows the same list under its nav. Built on a new
    `components/ui/popover.tsx` (upstream shadcn, Base UI).

## Open for Louie

- `TODO(content)` in `content/experiments/motif.mdx`: the plan for the first
  test with real users.
- Confirm the "How it was built" paragraph: "made every product and design
  call" and "the AI wrote most of the code" mirror the Neuron Shift wording.
- Status is `prototype`. Change to `shipped` if Louie wants the live site
  framed as shipped.
