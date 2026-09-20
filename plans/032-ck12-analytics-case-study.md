# Plan 032: Add CK-12 Foresights & Insights as the lead case study

**Status:** IMPLEMENTED; collaboration episode pending | **Priority:** P1 | **Effort:** M | **Depends on:** 030; uses 031 shell when ready  
**Read:** spec §§12, 16-18, 26-29, 39; source review and approved claim ledger.

## Editorial direction

Proposed title: **Turning learning predictions into teacher decisions.** Preserve the supplied “Predictive analytics teachers could trust” as an alternative, but do not imply trust or comprehension was fully solved.

This story demonstrates judgment across a connected learning system. Its strongest honest ending is that perceived value exceeded comprehension, which changes what should be tested next.

## New article sequence and source mapping

| Article beat | Material from the 16-section source deck | Edit |
|---|---|---|
| Stakes, role, product and honest result | 01, 03, 06, 14 | Put teacher decision and personal scope first; show an interface immediately |
| Why this was a system problem | 04, 05, brief excerpt from 02 | Explain before/after assignment and conflicting signals; move the full content taxonomy later |
| Decision 1: separate prediction from diagnosis | 08 | Show the two moments and what combining them would obscure |
| Decision 2: make uncertainty interpretable | 09 | Range/bands versus false precision; include actual chart and missing-data state |
| Decision 3: keep skill and engagement separate | 10 + 11 | Show scan → inspect → decide; fold investigation into the chart story |
| What changed beyond the screen | 13 + confirmed collaboration | Explain concept-level evidence dependency; attribute the broader platform decision accurately |
| Evaluation and limitation | 12 + 14 | Separate expected value, tested comprehension, and production outcomes |
| What I would change | 15 + brief 16 | Plain-language takeaway first; next test asks teachers to interpret and act |

Fold constraints and criteria into the decisions they explain. Do not retain 16 full-height slide sections on the website. Keep the original deck as the presentation source while the article uses normal scrolling and anchors.

## Evidence treatment

The published [Foresights review](https://info.ck12.org/impact-team-studies/foresights-teacher-analysis) and [Insights review](https://info.ck12.org/impact-team-studies/insights-study-analysis-bzcgn) each describe ten teachers using a demo class. They report mean comprehension scores of 75% and 73%, respectively, and difficulty with the key graph for half of participants. Expected time savings are perception data, not measured savings. Do not describe these results as a controlled experiment, broad adoption, or causal learning improvement.

Use a compact table distinguishing method, perception, observed comprehension, and limitation. Preserve attribution as subsequent evaluation unless the timeline proves otherwise. The reports do not establish Louie's personal ownership; the supplied narrative and owner confirmation establish that separately.

## Required artifacts and missing leadership detail

Use the supplied Foresights range screenshot and Insights scatterplot/detail screenshot with demo-data labels. Add a compact concept → assignment → evidence → teacher decision diagram. One concrete collaboration episode must identify a constraint, Louie's recommendation, and what Product/Data Science/Engineering chose. If unavailable, keep the accurate scope statement and omit an embellished influence claim. Do not use the platform's overall user count as the feature outcome.

## Implementation

Add `/work/ck12-analytics`, `content/work/ck12-analytics.mdx`, and metadata in `content/work/projects.ts`. Proposed anchors: `context`, `role`, `decision-prediction`, `decision-uncertainty`, `decision-investigation`, `system`, `evaluation`, `learnings`. Add them to `lib/routes.ts` and the evidence schema/project enum where needed. Keep `/work/flexi` intact. Include page metadata, structured data, TOC, tracking, sitemap inclusion, and related Flexi link. Use existing wrappers.

Add reviewed evidence entries atomically with the page so AI Louie can distinguish teacher analytics from the student tutor. Update `content/evidence/evidence.ts`, `lib/ai/schemas.ts`, relevant retrieval tests, and any exhaustive project mapping. Do not defer validity of this new route to final QA.

## Acceptance

A skimmer can explain the teacher's problem, Louie's role, one key choice, and the limitation. A detailed reader can find original study sources and tell what was measured. Every advertised section and citation resolves in the DOM, not just in the route registry. The main design story contains at least two real product images. Run milestone commands and focused case-study/SEO/retrieval checks; list any pending owner facts.

## Recommended implementation models (2026-09-19)

- Codex: GPT-6 Astra (`gpt-6-astra`), high.
- Claude Code: Claude Opus 5 (`claude-opus-5`).
- Rationale: Cross-source editorial judgment and attribution are the main risks. Use stronger reasoning for reconciliation; routine copy insertion does not need the same cost.
- Escalation: use GPT-6 Astra at xhigh or Claude Opus 5 when unresolved evidence or cross-surface behavior requires deeper review; a model cannot resolve missing autobiographical facts.

Availability checked 2026-09-19 against the local Codex host catalog (`models_cache.json` and this task's host tool catalog) and [official Claude Code model documentation](https://code.claude.com/docs/en/model-config). Claude account/provider access must be checked at execution; documentation availability is not proof of account entitlement. These recommendations do not change settings or dispatch agents.

## Execution contract

Louie authorized implementation of Plans 029-035 on 2026-09-19. Publishing and production/domain changes remain separate. Baseline: `feedf6e`, inspected 2026-09-19; the working tree was clean before this planning pass. Recheck Git status and these files before execution; preserve unrelated edits. Read AGENTS.md, the named spec sections, and the current README deviations ledger. The adopted changes are recorded in the README deviations ledger; other spec requirements remain authoritative. Record adopted deviations in README; do not silently rewrite the spec or erase earlier decisions.

Keep the existing stack, tokens, typography, wrapped components, and static browsing. No new database, CMS, auth, vector search, or model migration. Before code changes, read relevant installed Next.js guides under `node_modules/next/dist/docs/`. Missing facts remain labeled TODO(content)/TODO(asset) in editorial drafts. Omit unsupported public claims rather than filling gaps. Stop only the affected claim or deliverable when evidence is missing; continue independent work.

For a code milestone run `pnpm typecheck && pnpm lint && pnpm test && pnpm build`, plus relevant production Playwright tests using `pnpm exec playwright test <file>` after the build. Inspect affected pages at mobile and desktop widths, with keyboard and reduced motion. Run the full mobile/WebKit project locally at final release. Report blocked checks accurately. Documentation-only phases need link, scope, consistency, and whitespace checks, not an application rebuild.
