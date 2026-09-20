# Plan 033: Consolidate Offboard around decisions, Job Packets, and product learning

**Status:** IMPLEMENTED; workflow assets and dated observation pending | **Priority:** P1 | **Effort:** M | **Depends on:** 030; uses 031 shell  
**Read:** spec §§12-13, 16-18, 29, 39; existing Offboard MDX and architecture data.

## Editorial direction

Proposed title: **Building a career-transition product around the next useful step.** Use Job Packets to make that concrete, with “The human hits send” as a chapter heading. Keep the career-transition context short; do not introduce every product module before the reader sees one useful workflow.

Lead with the user and product tension, show the built experience, then reveal that the flagship workflow was not the right first step for every new user. This is stronger strategic evidence than a catalogue of eight agents, provided the decision's basis is documented.

## Recommended arc

1. **Situation and responsibility:** a person must evaluate a role, research it, and produce credible materials while already overwhelmed. Louie owned product direction, design, implementation, and iteration as the supplied sources state. Separate solo ownership from team influence.
2. **The bet:** organize role-specific work into one persistent packet. Show a real reviewed packet before describing the full architecture. Explain why fully manual work and mass auto-apply both fail the intended goal; avoid universal claims about recruiter behavior.
3. **Decision 1, automation boundaries:** risk gate, resume evidence gate, editable outputs, human sending. Show the branching states. Explicitly distinguish auto-filing into the tracker from sending an application or outreach.
4. **Decision 2, context and resource use:** parse once, reuse research, compose downstream work. Explain the UX consequence: less repeated entry and honest progress/recovery. Put agent names, cache implementation, credit ledger, and detailed orchestration behind optional technical depth. No unmeasured latency/cost improvement percentages.
5. **Decision 3, willingness to change the entry point:** packet-first assumption → observed mismatch → plan-first decision → what changed → measurement still needed. Introduce this reversal in the opening summary and develop it here. If the usage evidence is unavailable, attribute it as Louie's qualitative account or frame the redesign as a hypothesis; do not say conversion improved.
6. **Result and next question:** distinguish shipped behavior from observed usage and proven user benefit. Show dates/cohorts for any verified analytics, and clearly state remaining uncertainty. A useful next measure is whether a new user completes a meaningful plan action and returns, not merely whether a packet was generated; finalize the operational definition from actual instrumentation.

## Merge and trim map

| Source | Keep | Consolidate / demote |
|---|---|---|
| Current `/work/offboard` | Persistent opportunity, risk gate, context, real architecture map | Repeated conceptual diagrams and end-only product gallery |
| Job Packets deck 02-04 | User task and automation tension | Universal “one hour” claims without research; repetitive principles |
| Deck 05-08, 12 | Workflow, control points, shared context, failure/partial states | Agent-name inventory and stack detail into technical appendix |
| Deck 09-11 | Grounded writing, editable output, sending boundary | Combine into one control/voice decision; cut duplicate manifesto copy and decorative 0/1/100% pseudo-outcomes |
| Deck 13 | Entry-point revision | Move from late aside into the strategic spine |
| Legacy site | Career-transition motivation and accurate ownership | Broad list of every module, repeated philosophy, conflicting confirmation claims |

Retain a short voice example only with supplied before/after output grounded in a real or labeled demo resume. Do not expose a real seeker's personal data.

## Route and evidence compatibility

Keep `/work/offboard` canonical. Retain all existing anchors: `context`, `system`, `decision-risk`, `decision-control`, `decision-context`, `architecture`, `product`, `outcomes`, `learnings`. Reorder and retitle sections as needed. Add a stable `decision-entry-point` anchor for the strategic revision. If imagery is interleaved, keep `product` as a compact workflow recap/link target, not a duplicate gallery. Keep `architecture` reachable directly without relying on a closed disclosure hiding the target.

Update corresponding evidence entries at the same time, particularly the broad statement that all consequential actions have identical preview/confirm behavior. AI Louie must not say the repositioning improved outcomes unless evidence supports it. Update architecture labels only when the underlying version is confirmed; do not redraw from inference.

Likely files: Offboard MDX/page, project metadata, architecture content if necessary, routes, curated evidence, relevant schema/retrieval tests, real assets, README. No changes to the Offboard product repository or its database are authorized by this portfolio plan.

## Acceptance

There is one canonical Offboard story. A reviewer can see what Louie decided, an alternative, a working interface, a change of direction, and honest result boundaries. No agent inventory precedes the user problem. Screenshots show review, a gate, and a recovery/partial state when available. Verify every old deep link and run milestone checks.

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
