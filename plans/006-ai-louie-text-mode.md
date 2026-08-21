# Plan 006: Ship AI Louie text mode — chat API, tools, and grounded answers

> **Executor instructions**: Follow this plan step by step. Run every
> verification command and confirm the expected result before moving to the
> next step. If anything in the "STOP conditions" section occurs, stop and
> report — do not improvise. When done, update the status row for this plan
> in `plans/README.md`.
>
> **Drift check (run first)**: Confirm Plan 005 landed: `searchEvidence`
> exists with passing tests, evidence validator wired into prebuild, deep-link
> highlight works. On mismatch, STOP.

## Status

- **Priority**: P1
- **Effort**: L
- **Risk**: HIGH (external API, streaming, tool-calling, security surface)
- **Depends on**: plans/005-evidence-system.md
- **Category**: direction (Phase 5 of the spec's build sequence)
- **Planned at**: post-005 (record starting SHA in first commit), 2026-08-21

## Why this matters

AI Louie is the portfolio's differentiator (spec §16) — a grounded,
tool-using guide that retrieves evidence and drives the interface. This plan
replaces Plan 003's static AI surface with the real thing: assistant-ui
thread, a server chat route calling the OpenAI Responses API through an
adapter, the constrained toolset (spec §18), generative evidence UI (spec
§19), and the full failure-mode behavior (spec §31). The site must remain
fully usable when AI is down — that degradation path is part of this plan,
not an afterthought.

## Current state

- Static AI entry surface exists (`components/ai/ai-louie-thread.tsx`,
  Plan 003 Step 4) — its visual frame stays, internals are replaced.
- `searchEvidence` (pure, tested), evidence index, Zod schemas, `ROUTES` +
  anchor allowlists, deep-link highlight — all from Plans 004–005.
- `/api/chat/route.ts` is a 503 stub; `lib/ai/provider.ts` reads
  `OPENAI_MODEL` from env (Plan 001).
- **Read spec §16 (AI requirements + personality), §17 (retrieval flow), §18
  (all five tools, verbatim I/O shapes), §19 (generative UI allowlist), §20
  (system-prompt rules — copy them verbatim), §21 (interaction design), §31
  (errors), §32 (security) before starting.**
- Key stack decisions (spec §3): **assistant-ui** (`@assistant-ui/react`) for
  thread/composer/tool UI; **OpenAI Responses API** behind a small adapter;
  model name only from env.
- Secrets: `OPENAI_API_KEY` is server-only — never in client bundles, never
  logged, never committed. The operator sets it in `.env.local` and in the
  Vercel project settings (they have accounts for both; leave a TODO in the
  README deployment section rather than handling credentials yourself).

## Commands you will need

| Purpose    | Command          | Expected on success |
|------------|------------------|---------------------|
| Typecheck  | `pnpm typecheck` | exit 0              |
| Unit tests | `pnpm test`      | all pass            |
| Build      | `pnpm build`     | exit 0              |
| E2E        | `pnpm test:e2e`  | all pass            |
| Dev        | `pnpm dev`       | localhost:3000      |

## Scope

**In scope**:
- `lib/ai/`: `provider.ts`, `system-prompt.ts`, `tools.ts` (+ tests)
- `app/api/chat/route.ts`
- `components/ai/`: `ai-louie-thread.tsx`, `ai-louie-composer.tsx`,
  `evidence-result.tsx`, `tool-status.tsx`
- Rate limiting for the chat route
- `README.md` deployment/env notes

**Out of scope** (do NOT touch):
- `compare_job_description` tool + job-fit UI — Plan 007 (register the tool
  name as reserved, do not implement)
- Voice anything — Plan 009
- Case-study content, evidence entries (flag gaps, don't edit)
- Analytics events — Plan 008

## Git workflow

- Branch `advisor/006-ai-text`; commit per step. Do not push unless
  instructed. NEVER commit `.env*` files.

## Steps

### Step 1: Provider adapter + system prompt

`lib/ai/provider.ts`: one exported function the chat route calls, wrapping
the OpenAI Responses API (`pnpm add openai @assistant-ui/react` plus
assistant-ui's edge/runtime helper packages per its current Next.js App
Router docs — check https://www.assistant-ui.com/docs for the exact package
set; if assistant-ui ships a first-class OpenAI Responses adapter, use it
rather than hand-rolling). Model from `process.env.OPENAI_MODEL`, key from
`process.env.OPENAI_API_KEY`; throw a typed `AIUnavailableError` when either
is missing. `lib/ai/system-prompt.ts`: export the prompt containing the 11
rules from spec §20 **verbatim**, plus the §16.1 personality notes and the
preferred self-description line.

**Verify**: `pnpm typecheck` exit 0; unit test: prompt string contains all 11
numbered rules; missing-env test throws `AIUnavailableError`.

### Step 2: Chat route with retrieval flow

`app/api/chat/route.ts` (POST): validate body with Zod (messages array;
reject >32 messages or >8k chars per message — spec §32 "limit prompt size");
run the spec §17 flow — the model gets the system prompt and the
`search_portfolio` tool; tool executes `searchEvidence` server-side and
returns `{ results }`. Stream the response via assistant-ui's runtime.
Errors: catch everything; map to a JSON shape
`{ error: "ai_unavailable" }` with 503 — never leak provider error bodies
(spec §31 "Do not show raw API errors").

**Verify**: with `OPENAI_API_KEY` set in `.env.local`: `curl -N -X POST
localhost:3000/api/chat -H 'content-type: application/json' -d
'{"messages":[{"role":"user","content":"What is Louie'\''s strongest AI work?"}]}'`
→ streamed response mentioning evidence. With the key unset: 503 +
`ai_unavailable`, dev server does not crash.

### Step 3: Rate limiting

In-memory sliding-window limiter keyed by IP (e.g. 20 requests / 5 min),
implemented as a small `lib/ai/rate-limit.ts` with unit tests. On limit: 429
`{ error: "rate_limited" }`. Note in README: on Vercel's serverless runtime
an in-memory limiter is per-instance best-effort; if stronger guarantees are
wanted later, Vercel KV / Upstash is the upgrade path (do NOT add it now —
spec §3 forbids unnecessary infrastructure).

**Verify**: unit test: 21st call within window → limited; window expiry resets.

### Step 4: Client tools (navigate, show_evidence, set_context_panel)

`lib/ai/tools.ts`: define all tool schemas with Zod, exactly the I/O shapes
of spec §18. Client-side handlers registered through assistant-ui:

- `navigate_portfolio`: validate `route` against `ROUTES` and `anchor`
  against that route's anchor list — reject anything else *client-side*
  (spec §32: model output is never trusted as routing data). Use Next router
  push; the Plan 005 highlight behavior fires on arrival. Never navigate
  mid-stream — queue until the message completes (spec §18: no navigation
  "while the model is still composing").
- `show_evidence`: look up `evidenceId` in the index; unknown id → tool
  returns an error result the model can recover from; known → render
  `EvidenceCard` in-thread and offer open action.
- `set_context_panel`: accept only the 7 view names from spec §18 Tool 5;
  update a client store (React context or zustand-free useState lifted to the
  shell) that `ContextualRail` reads.

**Verify**: unit tests on the Zod validators (bad route rejected, bad view
rejected, valid inputs pass). Manual: ask "Show me Offboard" → thread shows
tool status, then navigates to `/work/offboard` with highlight.

### Step 5: Thread UI + evidence rendering

Rebuild `ai-louie-thread.tsx` internals on assistant-ui primitives, styled to
spec §21: user messages minimal; assistant messages open editorial text (no
giant bubbles); `tool-status.tsx` renders states like "Searching portfolio" /
"Found 4 relevant examples" / "Opening Offboard" — never chain-of-thought.
`evidence-result.tsx`: composes the Plan 004 `EvidenceCard` (project label,
title, one-line relevance, open action — spec §21). Generative UI stays
inside the spec §19 allowlist — the model composes approved components only;
no raw HTML/markdown-with-html rendering (sanitize/escape assistant text).
PromptChips from Plan 003 now insert/submit into the composer. Initial
message + placeholder copy stay verbatim from spec §11. Long-conversation
behavior (spec §21): when a thread is active, the canvas transitions to a
conversation workspace layout rather than pushing the homepage down.

**Verify**: manual conversation covering: evidence-backed answer with
citation card; "I don't have enough portfolio evidence" on an unanswerable
question (spec §31); a navigation; prompt chips working. No hydration
warnings, no console errors.

### Step 6: Failure modes + a11y

AI unavailable (503 from route): surface the exact spec §31 copy ("AI Louie
is temporarily unavailable. You can still explore all of Louie's work
below.") in the thread surface; rest of site unaffected. Tool fail: inline
status + manual fallback link ("Open Offboard manually"). A11y (spec §26):
composer labeled; new-message + AI-triggered UI changes announced through one
restrained `aria-live="polite"` region; thread keyboard-navigable; focus
lands on the target section after AI navigation (Plan 005 behavior).

**Verify**: unset the key → homepage fully browsable, fallback copy shows,
`pnpm test:e2e` (which must not require an API key — see Test plan) passes.

## Test plan

- Unit (`lib/ai/*.test.ts`): tool input validation (route allowlist, anchor
  allowlist, panel-view enum, evidenceId lookup), rate limiter, prompt
  content, request-body limits. Model after `portfolio-search.test.ts`.
- E2E without a real key (deterministic, CI-safe): mock `/api/chat` via
  Playwright `page.route()` with a canned streamed response + tool call;
  assert thread renders answer + evidence card, and the AI-unavailable state
  renders the spec copy when the mock 503s.
- One manual smoke script documented in README (real key, 5 golden
  questions from spec §2 Ask-mode list + expected behaviors).
- Verification: `pnpm test && pnpm test:e2e` → all pass with NO
  `OPENAI_API_KEY` set.

## Done criteria

- [ ] All spec §20 rules verbatim in the system prompt
- [ ] `search_portfolio`, `navigate_portfolio`, `show_evidence`,
      `set_context_panel` implemented with spec §18 exact I/O shapes;
      `compare_job_description` reserved but absent
- [ ] Route/anchor/view allowlist validation is client-side and tested
- [ ] Substantive answers render ≥1 evidence card (manual smoke)
- [ ] Rate limiting + body limits + 503/429 shapes; no raw provider errors
- [ ] Site fully usable with no API key; spec §31 copy shown
- [ ] No model name hard-coded (`grep -rn "gpt-\|o3\|o4" app lib components --include='*.ts*'` → no matches outside comments)
- [ ] `pnpm test && pnpm typecheck && pnpm lint && pnpm build && pnpm test:e2e` all pass without a key
- [ ] `plans/README.md` row updated

## STOP conditions

Stop and report back (do not improvise) if:

- assistant-ui's current API cannot bridge the OpenAI Responses API without
  substantial custom runtime code (report the gap + the closest supported
  path, e.g. its ChatCompletions or AI-SDK adapter — switching is a spec §3
  deviation needing operator sign-off and a README note).
- Streaming tool calls + App Router produce hydration or double-invoke
  problems you cannot resolve in two attempts.
- Any design would require the API key or evidence-filtering to run
  client-side.
- You are about to log conversation text — spec §30 forbids it by default.

## Maintenance notes

- The adapter boundary (`lib/ai/provider.ts`) is the seam for swapping model
  vendors later — keep the chat route ignorant of OpenAI specifics.
- Reviewers: scrutinize the allowlist validation and that no assistant output
  path renders unsanitized HTML (spec §32). Check bundle: `openai` must not
  appear in any client chunk.
- In-memory rate limiter is best-effort on serverless — revisit if abuse
  appears (upgrade path noted in README).
