# Plan 007: Build the job-description evaluator

> **Executor instructions**: Follow this plan step by step. Run every
> verification command and confirm the expected result before moving to the
> next step. If anything in the "STOP conditions" section occurs, stop and
> report — do not improvise. When done, update the status row for this plan
> in `plans/README.md`.
>
> **Drift check (run first)**: Confirm Plan 006 landed: `/api/chat` streams
> grounded answers, tools registered in `lib/ai/tools.ts`, e2e suite green
> without an API key. On mismatch, STOP.

## Status

- **Priority**: P2
- **Effort**: M
- **Risk**: MED
- **Depends on**: plans/006-ai-louie-text-mode.md
- **Category**: direction (Phase 6 of the spec's build sequence)
- **Planned at**: post-006 (record starting SHA in first commit), 2026-08-21

## Why this matters

The evaluator is the recruiter-specific entry point (spec §22): paste a job
description, get an evidence-grounded fit view with honest gaps. It is an
"evidence navigation feature, not an applicant tracking score" — no
percentages, no fabricated fit. It exercises the whole stack built so far:
structured model output, evidence linking, the context panel, and privacy
rules.

## Current state

- Working chat route with tool registry (`lib/ai/tools.ts`), evidence index +
  `searchEvidence`, `set_context_panel` store, `JobFitTable`-less UI.
  `compare_job_description` was explicitly reserved in Plan 006.
- **Read spec §18 Tool 4 (verbatim I/O schema), §22 (interaction + output
  sections), §30 (privacy: never log job descriptions), §32 (sanitize
  user-provided display) before starting.**
- Output schema (spec §18): `{ summary, strongestMatches: [{ requirement,
  evidenceIds, explanation }], weakerAreas: [{ requirement, explanation }],
  suggestedProjectsToReview }`.
- Rules (spec §18/§22): no fabricated fit; surface gaps; **no numerical match
  percentages**; a requirement is "matched" only with evidence; JDs never
  sent to analytics; no account required.
- Components live at `components/ai/job-fit-result.tsx` (spec §4).

## Commands you will need

| Purpose    | Command          | Expected on success |
|------------|------------------|---------------------|
| Typecheck  | `pnpm typecheck` | exit 0              |
| Unit tests | `pnpm test`      | all pass            |
| Build      | `pnpm build`     | exit 0              |
| E2E        | `pnpm test:e2e`  | all pass (still keyless) |

## Scope

**In scope**:
- `lib/ai/tools.ts` (add `compare_job_description`), server implementation +
  Zod output schema in `lib/ai/schemas.ts`
- `components/ai/job-fit-result.tsx`, JD input experience (expanded
  composer/modal), homepage CTA ("Evaluating Louie for a role?")
- Context panel `job-fit` view content
- Unit + e2e tests

**Out of scope** (do NOT touch):
- Evidence index contents (consume only; report gaps)
- Rate limiter internals (reuse; JD requests count against the same budget)
- Analytics (Plan 008 — but leave NO code path that could log JD text)
- Accounts/persistence of any kind (spec §22: "Do not require an account";
  spec §37: no visitor profiles)

## Git workflow

- Branch `advisor/007-job-fit`; commit per step. Do not push unless instructed.

## Steps

### Step 1: Tool + structured output

Register `compare_job_description` (server-side, spec §18 Tool 4): input
`{ jobDescription: string }` (Zod: trim, min 200 chars — shorter input gets a
friendly "paste the full description" tool error; max ~15k chars per spec
§32 prompt-size limits). Implementation: extract requirements from the JD via
the model with a **structured output** call (the Responses API's
JSON-schema/structured-outputs mode) against the spec §18 output schema; for
each claimed match the implementation verifies every `evidenceIds` entry
exists in the index and drops matches whose evidence doesn't — a match
without valid evidence moves to `weakerAreas` (spec: "do not claim a
requirement is satisfied unless supported by evidence"). Give the comparison
call its own system prompt section restating spec §22 rules (critical
treatment, gaps surfaced, no percentages, no "perfect fit" language).

**Verify**: unit tests with a mocked model response: invalid evidenceIds are
dropped/demoted; output parses against the Zod schema; >15k input rejected.

### Step 2: Input experience

Homepage CTA block (spec §22 copy: "Evaluating Louie for a role?" / "Paste a
job description") + a prompt chip route into it. Opens an expanded composer
(shadcn `Dialog` on desktop, `Sheet` on mobile) with a labeled `<textarea>`,
char counter, and the privacy line: "Used only to compare against portfolio
evidence. Not stored, not sent to analytics." Submit runs the tool through
the existing thread so the result lands in conversation context.

**Verify**: keyboard-only run-through: open dialog → paste → submit → close;
focus returns to the trigger (a11y, spec §26).

### Step 3: Job-fit result UI

`job-fit-result.tsx` rendering the four spec §22 sections in order: Strong
evidence (requirement + linked `EvidenceCard`s), Relevant work to review
(deep links via validated `navigate_portfolio` targets), Gaps or unclear
areas (plain, non-apologetic), Suggested questions. Sanitize any echoed JD
text (render as plain text nodes only — spec §32). Trigger the context
panel's `job-fit` view with a compact summary so it persists while the
visitor browses case studies.

**Verify**: mocked e2e: paste fixture JD → all four sections render;
evidence links navigate + highlight; no `%` character in any rendered match
copy (assert in test).

### Step 4: Privacy audit

Grep the diff for any logging/analytics touchpoints on the JD path. The JD
string must exist only: in the request body, in the model call, and in the
transient UI. Verify the chat route's error paths don't echo request bodies
into logs.

**Verify**: `grep -rn "jobDescription" app lib components | grep -in
"console\.\|log\|track\|analytics"` → no matches.

## Test plan

- Unit: schema round-trip; evidence-verification demotion logic; input
  bounds. Model after Plan 006's tool tests.
- E2E (keyless, mocked route as in Plan 006): the full paste→result flow,
  four sections, deep-link click-through, dialog a11y (Esc, focus trap,
  focus return).
- Manual smoke with a real key: one genuine JD (a public staff product
  designer posting), checking tone rules — gaps honestly stated, no
  percentages, no "perfect candidate" phrasing.

## Done criteria

- [ ] Tool matches spec §18 Tool 4 I/O exactly; structured output validated by Zod
- [ ] Evidence-unbacked matches demoted automatically (tested)
- [ ] Four-section result UI + `job-fit` context panel view
- [ ] No numerical scores anywhere; no JD text in logs/analytics (grep clean)
- [ ] Works keyless via mocks in CI; degrades to spec §31 unavailable copy
- [ ] `pnpm test && pnpm typecheck && pnpm lint && pnpm build && pnpm test:e2e` all pass
- [ ] `plans/README.md` row updated

## STOP conditions

Stop and report back (do not improvise) if:

- The evidence index lacks entries to support ANY plausible strong match for
  common design-role requirements (signals Plan 005 content gaps — report the
  missing evidence topics for Louie rather than padding the index yourself).
- Structured-output mode fights the streaming runtime after two attempts
  (fallback design — separate non-streamed endpoint for the comparison — is
  acceptable but note it in README deviations).
- Anything would persist or transmit the JD beyond the model call.

## Maintenance notes

- The demotion logic is the integrity core — reviewers should try to defeat
  it (fake evidenceIds, empty arrays) before approving.
- If Louie later wants JD analytics, spec §30 requires an explicit privacy
  design first; the current "never log" stance is load-bearing in the UI
  copy.
