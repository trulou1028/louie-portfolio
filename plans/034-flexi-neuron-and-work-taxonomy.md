# Plan 034: Complete Flexi and add Neuron Shift without duplicating the anchor stories

**Status:** IMPLEMENTED AND VERIFIED LOCALLY | **Priority:** P2 | **Effort:** M | **Depends on:** 030 and 031; can follow flagship launch  
**Read:** spec §§14-18, 26-29, 39; existing experiment route, schemas, and evidence index.

## Flexi: preserve a distinct argument

Keep `/work/flexi` as a production case study. Its question is learning behavior: how to help a student without replacing the learning. Analytics is about the teacher's interpretation and intervention. Cross-link them once and do not repeat a long CK-12 company introduction in both.

Proposed title: **Helping students get unstuck without doing the learning for them.** Story: student situation → Louie's role and collaborators → tutoring loop → one source-backed adaptation from research → teacher visibility and limits → evaluation and next question. Keep two or three decision chapters, not a catalogue of safety principles.

Import the useful active legacy narrative: the emotional barrier to asking, follow-up scaffolding, reading-level/tone problems, and the distinction between activity and learning. Verify the underlying reports and chronology before attributing each to Louie's work. Later research may inform a reflection; it cannot retroactively become research that drove an earlier decision. Observed question-pattern changes do not prove the interface caused learning gains.

The older HTML also contains an apparently inactive draft with highly specific pilot metrics. Do not treat that draft as another approved source. Reconcile the 20M+/265M+ context, team sizes, dates, and named controls through Plan 030. Do not claim legal compliance merely from a privacy design description.

Required imagery: real tutoring exchange, a substantiated follow-up/recovery pattern, and an actual teacher visibility surface if that decision remains. If a product behavior is unverified, remove that claim and update its evidence entry rather than presenting a conceptual flow as a screenshot of a shipped feature. Preserve all existing Flexi anchors even when some become brief limitation notes. Keep it secondary until the essential evidence is ready.

## Neuron Shift: a short exploration with a working artifact

Add `/experiments/neuron-shift` to the existing experiments system. It deserves a named card and direct live-demo link, not burial inside a generic “design engineering” category.

Proposed title: **Preserving operator judgment across shift changes.** Above the demo link state: independent exploratory prototype; simulated operational data; no live model integration; not affiliated with or endorsed by Teserac. Explain that the user model is a hypothesis based on public material and that no operators were interviewed. A deployed demo is not a production operational deployment.

Use this compact sequence:

1. At shift change, the incoming operator needs the reason behind a prior decision, not just an alarm history.
2. Demonstrate one inherited item → inspect asset/impact → defer or decide with a reason → see that decision reflected in the record.
3. Explain three choices: attach intelligence to assets, scale friction to reversibility, and preserve defer/override reasoning.
4. Explain one engineering consequence, such as computed reachability or persistence consistency, with its limitations. Link to source for deeper debugging detail.
5. Close with the largest untested assumption and the next research task: a real operator trying the handoff and authoring the outgoing record.

Keep the six-field decision record diagram. Condense the detailed persona, color semantics, debugging catalogue, and AI-assisted process into optional notes. Remove the extended cross-industry essay from the primary path. A future essay needs its own primary-source research; do not republish its medical, financial, or incident assertions as established facts in this case study.

The supplied [case study](https://neuron-shift.vercel.app/case-study#premise), [demo](https://neuron-shift.vercel.app/), and [source repository](https://github.com/trulou1028/neuron-shift) remain explicit external links. Prefer a still and a short captioned recording/static walkthrough on the portfolio; do not embed a heavy live canvas by default. Keep the disclosure if the external demo becomes unavailable.

## Implementation details

The current experiment detail page only renders summary/placeholder content. Extend it with an explicit content mapping or a small typed body component for Neuron; avoid introducing a CMS. Add summary, demo/source links, image and prototype status to experiment metadata as necessary.

Register `/experiments/neuron-shift` in the AI route allowlist, plus a named anchor list if evidence cites sections. The sitemap already enumerates experiment pages separately: deduplicate the new route if it now appears in both sources. Keep evidence project `experiment` unless a justified schema change is made, and tag Neuron specifically for retrieval. Add a `ck12-analytics` project enum consistently for Plan 032; don't conflate the projects in search.

Stop promoting the four unbuilt placeholder categories in featured discovery. Preserve their direct routes initially with honest status; deleting or redirecting them requires a concrete mapping. Keep `/experiments` reachable from Work and Neuron. Update `/ai-systems` to use a few reviewed examples from the broader set, not duplicate all case-study prose.

## Acceptance

Every card clearly distinguishes production work from an exploration. Neither site nor AI Louie claims Neuron has real users, real telemetry, a live model, or employer sponsorship. Flexi and analytics return different evidence for different questions. All listed routes, anchors, related links, and sitemap entries resolve without duplicates. Run milestone checks and targeted experiment/case-study/AI retrieval tests.

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
