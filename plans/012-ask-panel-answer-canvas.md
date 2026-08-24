# Plan 012: The Ask panel and the Answer Canvas — AI chat as the right rail, answers as the page

> **Executor instructions**: Follow this plan step by step. Run every
> verification command and confirm the expected result before moving to the
> next step. If anything in the "STOP conditions" section occurs, stop and
> report — do not improvise. When done, update the status row for this plan
> in `plans/README.md`.
>
> **Drift check (run first)**: `git diff --stat 64b620e..HEAD -- components/ai app/page.tsx components/app-shell/contextual-rail.tsx`
> Plan 011 is EXPECTED to have changed `app/page.tsx` — read it as landed.
> For everything else, compare the "Current state" excerpts against the live
> code; on a mismatch, treat it as a STOP condition.

## Status

- **Priority**: P1
- **Effort**: L
- **Risk**: MED (interaction-heavy; the signature feature of the site)
- **Depends on**: plans/011-homepage-restructure.md
- **Category**: direction
- **Planned at**: commit `64b620e` (branch `restyle/rhea-dark`), 2026-08-23

## Why this matters

Louie's brief (2026-08-23): the homepage side panel should BE the AI chat —
title, input, suggested questions, with real loading/thinking states and
clean animation — and the experience needs a hook that designers and hiring
managers remember, "not just another chat UX," demonstrating serious,
current AI-product skill.

### The hook (decided, with alternatives recorded)

**"Ask the panel; the site answers." The chat panel is a control surface —
the portfolio itself is the display.** A visitor asks a question in the rail;
the answer does not pile up as bubbles in a sidebar. Instead the **main
canvas composes an Answer Sheet**: the question set large in the display
face, a concise grounded answer as editorial text, the supporting evidence as
cards, and deep links into the case studies — assembled live from the same
allowlisted component vocabulary the spec already mandates for generative UI
(spec §19). The panel keeps only a compact transcript and the visible
reasoning trail ("Searching portfolio → 4 sources → composing"), so the
grounding machinery — Louie's actual specialty — is part of the aesthetic.

Why this hook: it is the spec's own thesis sharpened ("the portfolio itself
is an example of how Louie thinks about AI products", spec §40; "AI mode can
transition the main canvas into a dedicated conversational workspace", §21),
it demonstrates agentic UI control + generative UI + visible grounding in one
gesture, and it reuses the shipped tool layer (§18) rather than inventing
infrastructure. Memorable one-liner for a hiring manager: *"I asked the
portfolio a question and it rearranged itself into the answer."*

Alternatives considered (recorded so they aren't re-litigated): (b)
glass-box reasoning trail alone — lower risk, folded INTO this design as the
panel's activity states; (c) "interview mode" where AI Louie asks the
visitor about their role first — deferred, it layers naturally on the
job-fit machinery later (spec §22).

## Current state

Branch `restyle/rhea-dark`, after Plan 011: homepage `Canvas` has no rail;
`AiLouieThread` still renders in the main column at `#ask-ai-louie`.

- `components/ai/ai-louie-thread.tsx` — lazy wrapper: `Surface variant="ai"`
  panel, header + `SystemLabel` "AI Louie" pill, IntersectionObserver
  (`rootMargin: "600px"`) gating a `dynamic(() => import("./ai-louie-live"))`
  (~840KB chunk), `ThreadSkeleton` while loading, one `aria-live="polite"`
  region.
- `components/ai/ai-louie-live.tsx` — assistant-ui: `AiLouieRuntime`
  (provider), `ThreadPrimitive.Root/Viewport/Messages`, `SUGGESTIONS` const
  (5 spec questions), `ThreadPrimitive.Suggestion` chips (`autoSend`),
  `JobDescriptionDialog` chip, `ThreadError` via `useAISDKError` (spec §31
  copy), `AiLouieComposer`, per-message components `UserMessage` /
  `AssistantMessage` (`MessagePrimitive.Parts` with `Reasoning: () => null` —
  chain-of-thought must never render, spec §21).
- `components/ai/client-tools.tsx` — registers browser tools
  (`navigate_portfolio`, `show_evidence`, `set_context_panel`) via
  assistant-ui; validators in `lib/ai/tools.ts` (allowlists — model output is
  never trusted as routing data, spec §32).
- `components/ai/context-panel-store.tsx` — small client store the
  `set_context_panel` tool writes; the exemplar for the new answer store.
- `components/ai/tool-status.tsx` — plain-language activity states (spec
  §21: "Searching portfolio", never chain-of-thought).
- `components/ai/evidence-result.tsx` → renders `EvidenceCard`s in-thread.
- `components/app-shell/contextual-rail.tsx` — `Canvas({ rail, stackRail,
  railDefaultSize })`: rail = independent scroll pane on `xl+`
  (`PersistentPanelGroup` storageKey "canvas", pixel sizes, `min 260 / max
  520`), stacked after content below `xl` when `stackRail`.
- Motion: `motion` package installed; duration tokens
  `--duration-instant/fast/standard/deliberate`; global
  `prefers-reduced-motion` kill-switch in `app/globals.css`.
- E2E: `e2e/home.spec.ts` (suggestions, keyboard), `e2e/job-fit.spec.ts`
  (dialog opens from the suggestion list), `e2e/accessibility.spec.ts`
  (axe on `/`, dialog open). All run keyless — AI tests intercept
  `/api/chat` with `page.route()`.

## Commands you will need

| Purpose    | Command          | Expected on success |
|------------|------------------|---------------------|
| Typecheck  | `pnpm typecheck` | exit 0              |
| Lint       | `pnpm lint`      | exit 0              |
| Unit       | `pnpm test`      | all pass            |
| E2E        | `pnpm test:e2e`  | all pass (keyless)  |
| Manual AI  | real key in `.env.local`, `pnpm dev` | smoke script below |

## Scope

**In scope**:
- `components/ai/`: new `ask-panel.tsx`, new `answer-canvas.tsx`, new
  `answer-store.tsx`; edits to `ai-louie-live.tsx` (split panel/canvas
  rendering), `tool-status.tsx` (animated states), `ai-louie-thread.tsx`
  (becomes the rail-mounted lazy wrapper)
- `app/page.tsx` (mount panel as rail; answer canvas in main)
- `e2e/` updates + one new spec

**Out of scope** (do NOT touch):
- `app/api/chat/route.ts`, `lib/ai/*` server logic, the system prompt, the
  evidence index — the server contract is stable and tested
- `components/ai/job-fit-result.tsx`, `job-description-dialog.tsx` internals
  (the dialog moves as-is into the panel's suggestion area)
- Voice anything (Plan 009)

## Git workflow

- Branch `restyle/rhea-dark`, commit per step. No push/merge without the
  operator.

## Steps

### Step 1: Answer store

`components/ai/answer-store.tsx`, modeled line-for-line on
`context-panel-store.tsx`'s idiom: state `{ status: "idle" } | { status:
"asked", question } | { status: "answering", question } | { status:
"answered", question, answerText, evidenceIds: string[] }`. Written by the
thread lifecycle (Step 3) and read by the Answer Canvas. Evidence ids are
validated through the existing `validateEvidenceId` before storage — unknown
ids are dropped (spec §32).

**Verify**: `pnpm typecheck` exit 0; unit test file
`components/ai/answer-store.test.ts`? No — store tests live in
`lib`-style vitest only if pure; if the store is a React context, cover it
via the e2e in Step 6 instead.

### Step 2: The Ask panel

`components/ai/ask-panel.tsx` — the rail experience, composed from the
existing pieces (this is a re-layout, not a rewrite):

- Header: `SectionLabel` "ASK" + "AI Louie" title row + the existing status
  pill; one-line subhead. Compact — the panel is a tool, not a hero.
- Suggested questions: the existing 5 `SUGGESTIONS` + the
  `JobDescriptionDialog` trigger, restyled as a vertical list of quiet
  buttons (full-width, left-aligned — vertical fits a 300–420px pane better
  than wrapping chips). Keyboard-reachable (they already are — keep
  `ThreadPrimitive.Suggestion`).
- Transcript: user turns + assistant turns in COMPACT form — assistant
  messages render a 2–3 line clamp (`line-clamp-3`) with "View on canvas →"
  focusing the Answer Sheet; the full text lives on the canvas. Reasoning
  parts stay suppressed.
- Activity: `tool-status.tsx` states with a subtle shimmer while a tool call
  is in flight; sequence reads "Searching portfolio…" → "Found N sources" →
  "Composing answer…". Timings on `--duration-standard`; honor reduced
  motion (the global kill-switch already covers CSS transitions).
- Composer pinned to the panel bottom (`AiLouieComposer` as-is).
- Unavailable/error: the existing `ThreadError` spec §31 copy, panel-sized.

**Verify**: renders in Storybook-less fashion — mount temporarily on
`/design-system` (dev-only page) OR proceed to Step 4 and verify in situ;
`pnpm typecheck && pnpm lint` exit 0.

### Step 3: Wire the lifecycle

In `ai-louie-live.tsx`: on user submit → `answerStore.asked(question)`; when
the run starts streaming text → `answering`; on message completion, collect
the final assistant text and every evidence id surfaced by
`search_portfolio`/`show_evidence` results in that run (the tool results are
already visible to the client via assistant-ui message parts — reuse how
`evidence-result.tsx` extracts them) → `answered`. AI-triggered navigation
(`navigate_portfolio`) continues to work unchanged and takes precedence over
the Answer Sheet when the model chooses it.

**Verify**: with a real key: ask "How technical is Louie?" → store reaches
`answered` with ≥1 evidence id (inspect via React devtools or a temporary
`console.debug` REMOVED before commit).

### Step 4: The Answer Canvas

`components/ai/answer-canvas.tsx`, mounted in the homepage main column
(replacing the old in-column thread section):

- `idle`: renders nothing — the page is the normal homepage (hero, featured
  work, in brief). The canvas is additive, never a takeover of the whole
  page's DOM.
- `asked`/`answering`: below the hero, an Answer Sheet skeleton materializes
  (Motion: opacity + 8px rise, `--duration-standard`): the question set in
  `font-serif text-heading-xl`, shimmer lines for the pending answer.
- `answered`: question headline; answer text as editorial body (max 62ch);
  evidence as a responsive grid of the existing `EvidenceCard`s; a "Sources"
  `SectionLabel` above them (the glass-box trail: "Grounded in N portfolio
  sources"); actions row: primary `Action` deep-linking to the strongest
  evidence (first id), ghost "Clear" → store back to `idle`.
- The section gets `id="answer"`, `tabIndex={-1}`; on `answered`, move focus
  to the headline and announce via the existing `aria-live` region (spec
  §26: predictable focus after AI-driven UI change).
- Reduced motion: entrance renders instantly (global kill-switch suffices —
  verify, don't assume).

**Verify**: keyless, with `page.route()` mocking `/api/chat` to stream a
canned answer + tool result (copy the fixture idiom from
`e2e/job-fit.spec.ts`): asking via a suggestion renders the Answer Sheet in
`main` with ≥1 evidence card; "Clear" restores the homepage; focus lands on
the answer headline.

### Step 5: Mount as the rail

- `app/page.tsx`: `<Canvas rail={<AskPanel />} stackRail railDefaultSize={360}>`
  — panel in its own pane on `xl+`, stacked after content below (the mobile
  spec behavior: composer near the bottom, spec §10). Remove the
  `#ask-ai-louie` main-column section; keep an `id="ask-ai-louie"` anchor on
  the rail panel so the hero's "Ask AI Louie" `Action` still lands somewhere
  (it can also just focus the composer — do that: on click, focus the
  composer input; keep the href fallback).
- `ai-louie-thread.tsx`'s lazy-mount logic (IntersectionObserver + skeleton
  + `aria-live`) wraps the panel — on `xl+` the rail is immediately visible
  so the runtime loads on paint; below `xl` it still defers until scrolled
  near. That preserves the spec §27 deferral where it matters (mobile).
- Delete now-unused homepage AI-section styling; run
  `pnpm lint` for unused imports.

**Verify**: 1440px: three columns — nav | content | Ask panel — each
independently scrollable, divider draggable (drag it; sizes persist on
reload). 375px: panel stacks after "In brief", composer usable. `pnpm
test:e2e` full suite after Step 6 updates.

### Step 6: Tests

- Update `e2e/home.spec.ts`: suggestions now live in the rail
  (`getByRole("complementary")` scope on `xl`), keyboard reachability holds.
- Update `e2e/job-fit.spec.ts`: the dialog trigger is inside the panel now —
  same `getByRole("button", { name: "Paste a job description" })` should
  still resolve; fix scoping if it doubles.
- New `e2e/answer-canvas.spec.ts` (mock `/api/chat` — never a real key):
  ask → skeleton appears → answer + evidence cards render in `main` → focus
  on headline → Clear restores → axe pass with the sheet open.
- `pnpm test && pnpm test:e2e` green keyless; then the manual smoke (real
  key): the five spec §2 questions, confirming answers compose the canvas,
  the panel stays compact, navigation-style asks ("Show me Offboard") still
  navigate.

## Done criteria

- [ ] Homepage rail IS the Ask panel: header, vertical suggestions,
      composer, compact transcript, animated thinking states
- [ ] Substantive answers render as an Answer Sheet in the main canvas with
      evidence cards; panel never accumulates walls of bubbles
- [ ] `navigate_portfolio` asks still navigate; job-fit dialog still opens;
      spec §31 unavailable copy still renders keyless
- [ ] Focus + `aria-live` behave per spec §26; axe green with sheet open
- [ ] Reasoning parts still render as nothing (spec §21)
- [ ] All gates green keyless; manual smoke passes with a real key
- [ ] `plans/README.md` row updated

## STOP conditions

- assistant-ui's message-parts API cannot expose tool results needed for the
  evidence-id collection without patching the library — report the exact gap.
- The Answer Sheet requires rendering model-provided HTML/markdown-as-HTML
  anywhere — that violates spec §19/§32; plain text + allowlisted components
  only.
- Panel + canvas coupling forces the AI runtime into the shared bundle for
  non-home routes (check: `/about` first-load JS must stay ≈ what it is at
  the drift-check SHA; > +50KB is a STOP).
- More than the two named e2e specs need rewriting — broad breakage means a
  wrong turn, not more fixing.

## Maintenance notes

- The answer store is the seam voice mode (Plan 009) will reuse: spoken
  answers should compose the same canvas. Keep it transport-agnostic.
- If Louie later wants Answer Sheets on other routes, mount `AnswerCanvas`
  per-page — the store is global; the canvas is deliberately per-page.
- Reviewers: scrutinize evidence-id validation at the store boundary and
  that no `console.debug` from Step 3 survives.
