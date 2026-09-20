# Plan 031: Build the work-first layout and shared case-study shell

**Status:** IMPLEMENTED AND VERIFIED LOCALLY | **Priority:** P1 | **Effort:** M | **Depends on:** adopted 029 and metadata/assets from 030  
**Read:** spec §§5-12, 24-29, 33-34, 39; Plans 011-015 and 025.

## Scope

Likely files: `app/page.tsx`, `app/work/page.tsx`, `components/portfolio/work-card.tsx`, `case-study-header.tsx`, `project-meta.tsx`, `artifact-frame.tsx`, relevant `components/app-shell/*`, `content/profile.ts`, `content/work/projects.ts`, `lib/routes.ts`, `README.md`, and affected home/case-study e2e tests. Inspect actual AskPanel trigger and shell ownership before choosing files; do not duplicate the chat session.

## Steps

1. Add metadata fields for confirmed role, timeframe, status, short decision summary, and featured placement, using existing conventions. Avoid encoding selection purely as array order. Widen the existing two-value project slug type only as new studies are introduced. Keep titles and summaries centralized.
2. Make the homepage a short introduction and two prominent project rows, followed by smaller production-work and exploration sections. Use ready projects only: no dead links to future routes, no blank hero assets. CK-12 analytics becomes first when Plan 032 is ready; Offboard stays reachable throughout.
3. Make Ask Louie closed on initial homepage load and reachable through an explicit trigger. Reuse the working responsive surface and preserve drafts/history across open/close. Return focus when closing; label the control and dialog. No automatic welcome expansion, no requirement to converse before reading work.
4. Reduce repetitive left-rail biography/quote content on the homepage. Keep identity, navigation, contact, and availability. Retain the rail architecture initially. Relocate AI Systems to a secondary visible link from Work/About. Preserve all existing routes and assistant allowlisting.
5. Enhance the article opening: title, stakes, role/scope, status and dates if confirmed, a representative product artifact, and a short “At a glance” summary. Skip missing dates/team size rather than substituting plausible ones. Include an early truthful result/limitation rather than waiting until the bottom.
6. Put a real artifact beside or immediately after each decision. Keep article prose in a readable column and allow diagrams/images enough width. Render primary story sections normally. Optional native disclosure may hold engineering depth, but citations must reveal and reach their targets. Keep stable existing anchors visible or maintain explicit compatible targets.
7. Replace placeholder thumbnails with source-approved imagery. Captions should explain a choice, not say “dashboard.” Do not use logos as the sole artifact. Limit card tags to the two or three most useful distinctions.
8. Record adopted deviations from spec §§10-11 and previous shell decisions in README. Preserve typography and palette, including light theme behavior through tokens.

## Acceptance and checks

At 390, 768, 1024, and 1440 CSS px: project titles and links remain legible, no horizontal page overflow, screenshots remain understandable, and the closed assistant does not obscure content. Test keyboard navigation and reduced motion. Open/close/reopen Ask Louie, confirm mobile access, and verify the existing composer and job-fit flow remain reachable. Do not send real private job descriptions during QA.

Update behavior-specific assertions affected by the new shell; retain regression coverage for the known rail breakpoint bug. Use full milestone commands and relevant `e2e/home.spec.ts`, `e2e/case-studies.spec.ts`, and `e2e/ai-louie.spec.ts`. Final release gates are in Plan 035. Rendering the layout with unavailable case-study assets is not completion.

## Recommended implementation models (2026-09-19)

- Codex: GPT-5.6 Sol (`gpt-5.6-sol`), high.
- Claude Code: Claude Sonnet 5 (`claude-sonnet-5`).
- Rationale: The layout is specified and reuses existing components. A workhorse model is appropriate; responsive panel state and focus behavior justify high reasoning and targeted browser checks.
- Escalation: use GPT-6 Astra at xhigh or Claude Opus 5 when unresolved evidence or cross-surface behavior requires deeper review; a model cannot resolve missing autobiographical facts.

Availability checked 2026-09-19 against the local Codex host catalog (`models_cache.json` and this task's host tool catalog) and [official Claude Code model documentation](https://code.claude.com/docs/en/model-config). Claude account/provider access must be checked at execution; documentation availability is not proof of account entitlement. These recommendations do not change settings or dispatch agents.

## Execution contract

Louie authorized implementation of Plans 029-035 on 2026-09-19. Publishing and production/domain changes remain separate. Baseline: `feedf6e`, inspected 2026-09-19; the working tree was clean before this planning pass. Recheck Git status and these files before execution; preserve unrelated edits. Read AGENTS.md, the named spec sections, and the current README deviations ledger. The adopted changes are recorded in the README deviations ledger; other spec requirements remain authoritative. Record adopted deviations in README; do not silently rewrite the spec or erase earlier decisions.

Keep the existing stack, tokens, typography, wrapped components, and static browsing. No new database, CMS, auth, vector search, or model migration. Before code changes, read relevant installed Next.js guides under `node_modules/next/dist/docs/`. Missing facts remain labeled TODO(content)/TODO(asset) in editorial drafts. Omit unsupported public claims rather than filling gaps. Stop only the affected claim or deliverable when evidence is missing; continue independent work.

For a code milestone run `pnpm typecheck && pnpm lint && pnpm test && pnpm build`, plus relevant production Playwright tests using `pnpm exec playwright test <file>` after the build. Inspect affected pages at mobile and desktop widths, with keyboard and reduced motion. Run the full mobile/WebKit project locally at final release. Report blocked checks accurately. Documentation-only phases need link, scope, consistency, and whitespace checks, not an application rebuild.
