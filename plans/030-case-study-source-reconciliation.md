# Plan 030: Reconcile claims, ownership, and assets

**Status:** IMPLEMENTED WITH OPEN EVIDENCE GAPS | **Priority:** P1 | **Effort:** M | **Depends on:** 029 direction  
**Read:** spec §§13-17, 29, 39; `plans/CONTENT-TODOS.md`; [source review](portfolio-strategy/source-review.md).

## Deliverables

Create `plans/portfolio-strategy/claim-ledger.md`, `asset-manifest.md`, and `editorial-briefs.md`. These are editorial inputs, not a new runtime content system. Refresh CONTENT-TODOS after checking actual completion; its older portrait and share-image entries already lag the repository.

The claim ledger needs: ID, project, exact claim, source URL/artifact and date, product version/time period, Louie's ownership, research owner, evidence type, caveat, approved wording, and status. Use `supported`, `owner-confirmation-needed`, `conflicting`, or `omit`. A public portfolio assertion is a supplied source, not independent proof of a metric.

## Reconcile these first

| Claim family | Required resolution |
|---|---|
| CK-12 scale: 20M+ versus 265M+ | Identify annual/active/cumulative definitions and dates. Neither automatically means Flexi users or users affected by Louie's design. Use no large-number headline until resolved. |
| CK-12 role and dates | Match resume, supplied history, and each project's period. Separate employment dates from feature and study dates. |
| Foresights/Insights research | Public reports substantiate ten-teacher demo-class reviews. Preserve methodology, comprehension results, and limitations; confirm whether Louie participated and when. |
| Concept-per-assignment change | Obtain the public release source and Louie's actual contribution. A later platform change supports a dependency, not sole ownership. |
| Flexi's legacy pilot metrics | Quarantine the older extracted draft's satisfaction, speed, learning-gain, session, workload, and projected-dollar claims until original evidence exists. Do not merge hidden legacy page text into the active case study. |
| Flexi controls and uncertainty | Confirm the exact UI and shipped version for Pause Flexi, Rephrase Response, Asked on Flexi, confidence/uncertainty, and adaptive reading level. A principle is not proof a control shipped. |
| Flexi independent research | Verify the underlying LeanLab and conversation-pattern reports. Distinguish later evaluation from formative research Louie personally ran; avoid causal language from observational patterns. |
| Offboard timing, price, and architecture | Verify eight agents, 2-3 minute timing, risk threshold 70, 30-day cache freshness, credits/refunds, and the current plan-first stage placement. These may describe historical versions. |
| Offboard strategic correction | Obtain the dated observation/query or owner account behind packet-first → plan-first. Distinguish the decision from any unmeasured improvement. |
| Offboard control boundaries | The newer deck says the tracker files automatically; the old prose implies every change is confirmed. Describe automatic workspace bookkeeping separately from gated costly/consequential steps and human sending. |
| Neuron Shift | Preserve independent prototype, simulated data, no live model, no real operators interviewed, and no Teserac endorsement. Product behavior is demonstration, not field validation. |

## Asset manifest

For each image record source, original file, intended section, product version/date, demo versus real data, publication suitability, crop, alt text, and the decision it proves. Prefer original supplied screens over screenshots of screenshots. Public images can seed the manifest; do not manufacture missing interface states with image generation.

Minimum launch set: Foresights range view; Insights class-to-student evidence view; Offboard packet review; risk/partial state; a before/after entry point if substantiated; Neuron inherited decision and risk gate. Add a real Flexi exchange and teacher surface for its later publication. Use demo or appropriately redacted data.

## Targeted owner questions for execution

Ask one bundled set after exhausting supplied sources: Which CK-12 decision changed because of your recommendation, who was involved, and what artifact shows the change? What observation led you to move Job Packets, and what was measured afterward? Which Flexi interface states and research did you own personally? Request only remaining gaps, not a new autobiography.

## Acceptance

Every planned numeric, dated, research, team, or influence claim has a ledger row. Each featured project has a viable image and a truthful ownership statement. Unresolved claims have omission/fallback wording. Agree a canonical Offboard name and distinguish the two CK-12 projects. Keep draft notes out of AI Louie's curated runtime evidence until reviewed. No source-site edits or database access are part of this phase.

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
