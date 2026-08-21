# Plan 005: Build the curated evidence index and deterministic search

> **Executor instructions**: Follow this plan step by step. Run every
> verification command and confirm the expected result before moving to the
> next step. If anything in the "STOP conditions" section occurs, stop and
> report — do not improvise. When done, update the status row for this plan
> in `plans/README.md`.
>
> **Drift check (run first)**: Confirm both case studies render with all
> anchors (Plan 004 done criteria) and `lib/routes.ts` exports the anchor
> lists. On mismatch, STOP.

## Status

- **Priority**: P1
- **Effort**: M
- **Risk**: LOW
- **Depends on**: plans/004-case-studies.md
- **Category**: direction (Phase 4 of the spec's build sequence)
- **Planned at**: post-004 (record starting SHA in first commit), 2026-08-21

## Why this matters

The evidence index is the grounding layer that makes AI Louie trustworthy:
every factual answer must cite it (spec §16.2), retrieval searches it (spec
§17), and deep links resolve through it. The spec's ordering is explicit:
"Do not start AI retrieval until the evidence is structured" (§35 Phase 3–4).
This plan delivers the schema, the humanly-curated index skeleton,
deterministic server-side search, and the deep-link + highlight behavior —
all testable without any model call.

## Current state

- Case studies exist with stable anchors; `content/evidence/evidence.ts` is
  an empty typed array (Plan 001 stub) using the `EvidenceItem` type from
  spec §16.3 (fields: `id`, `project`, `title`, `summary`, `detail`, `route`,
  `anchor?`, `tags`, `skills`, `technologies?`, `evidenceType`).
- **Read spec §16.2–16.3 (grounding + schema), §17 (retrieval strategy), §31
  (fallbacks) before starting.**
- Spec §17: deterministic weighted search over exact tags, skills, title,
  summary, detail, project. "A vector database is not required." No
  embeddings, no external services.
- Spec §16.3: the index is written and reviewed by a human; never scraped at
  runtime. So this plan writes evidence entries **only where every field is
  derivable from the spec/case-study structure**, and marks `detail` bodies
  needing Louie's verification with `TODO(content)`.
- No test runner for unit tests exists yet — this plan introduces Vitest.

## Commands you will need

| Purpose    | Command          | Expected on success |
|------------|------------------|---------------------|
| Typecheck  | `pnpm typecheck` | exit 0              |
| Unit tests | `pnpm test`      | all pass (add Vitest: `pnpm add -D vitest`) |
| Build      | `pnpm build`     | exit 0              |
| E2E        | `pnpm test:e2e`  | all pass            |

## Scope

**In scope**:
- `content/evidence/evidence.ts` (populate), `lib/ai/schemas.ts` (Zod
  schemas), `lib/ai/portfolio-search.ts` (search), + their unit tests
- A build-time validation script `scripts/validate-evidence.ts`
- Deep-link highlight behavior (small client component + CSS)
- `vitest` setup + `"test"` script

**Out of scope** (do NOT touch):
- `/api/chat`, model providers, assistant-ui — Plan 006
- Case-study MDX content (except adding `id`s if one is missing)
- Any network calls or vector/embedding dependencies

## Git workflow

- Branch `advisor/005-evidence`; commits: schema, index entries, search +
  tests, deep-link behavior. Do not push unless instructed.

## Steps

### Step 1: Zod schema + validation script

`lib/ai/schemas.ts`: `evidenceItemSchema` mirroring spec §16.3 exactly
(`project` enum `"offboard" | "flexi" | "career" | "experiment"`,
`evidenceType` enum `"product" | "research" | "technical" | "strategy" |
"outcome" | "career"`). `scripts/validate-evidence.ts`: parse every entry;
assert `id` uniqueness; assert `route` is in `ROUTES` (from `lib/routes.ts`)
and `anchor`, when present, is in that route's exported anchor list. Wire it
as `"validate:evidence": "tsx scripts/validate-evidence.ts"` and call it from
the build (`prebuild` script), so a bad entry fails CI/deploys.

**Verify**: add a deliberately broken entry (bad anchor) → `pnpm validate:evidence`
exits non-zero naming the entry; remove it → exits 0.

### Step 2: Populate the index skeleton

Write 12–20 entries covering both case studies' major sections and career
basics. Structure-derived fields (id, project, title, route, anchor, tags,
skills, evidenceType) are fully filled; `summary` one factual line; `detail`
carries `TODO(content): Louie to review/expand` where depth would require
unverified claims. Include at minimum the spec's own example
(`offboard-hitl-actions` → `/work/offboard#decision-control`, spec §16.3)
plus one entry per required case-study anchor section that represents a
decision or system (skip `#product` galleries). No entry for outcomes until
metrics are verified — evidenceType `outcome` entries stay out of the index
rather than in with fake numbers.

**Verify**: `pnpm validate:evidence` → exit 0, prints entry count ≥12.

### Step 3: Deterministic search

`lib/ai/portfolio-search.ts`:

```ts
export function searchEvidence(input: {
  query: string
  project?: EvidenceItem["project"]
  evidenceType?: EvidenceItem["evidenceType"]
  limit?: number   // default 5, max 10
}): { results: EvidenceItem[] }
```

Pure function, no I/O. Tokenize query (lowercase, strip punctuation); score
per item with explicit weights — exact tag match highest, then skills, then
title, then summary, then detail, then project name (spec §17 field order);
sum across tokens; stable sort (score desc, then id asc) so results are
deterministic. Filters apply before scoring. Return empty results rather than
low-relevance junk: apply a minimum-score threshold.

**Verify**: `pnpm test` unit suite (Step 5) passes.

### Step 4: Deep-link + highlight behavior

The contract consumed by AI navigation (Plan 006) and usable today from plain
URLS: navigating to `/work/offboard#decision-control` scrolls to the section
and applies a highlight that fades after ~1.5s (spec §18 Tool 2). Implement:
a small client component mounted in the case-study layout that, on hash
presence, scrolls (`scrollIntoView({ behavior: "smooth" })`, instant under
reduced motion) and toggles a `data-highlight` attribute; CSS animates a soft
`accent-muted` background wash out over 1.5s. Focus moves to the section
heading (`tabIndex={-1}` + `.focus()`) for a11y (spec §26: "focus should move
predictably after AI-triggered navigation").

**Verify**: `pnpm dev`, open `localhost:3000/work/offboard#decision-control`
→ scrolls, highlights, fades; heading receives focus (check with devtools
`document.activeElement`).

### Step 5: Tests

Vitest unit tests in `lib/ai/portfolio-search.test.ts`:
- exact tag match outranks summary-only match
- `project` and `evidenceType` filters exclude correctly
- `limit` respected; default 5; cap 10
- nonsense query → `results: []`
- determinism: same input twice → deeply equal output
- every index entry: schema-valid (reuse validator as a test)

Playwright: add hash-navigation spec (deep link scrolls + highlights).

**Verify**: `pnpm test && pnpm test:e2e` → all pass.

## Test plan

Covered in Step 5 (this plan introduces the unit test layer — Vitest config
kept minimal, `environment: "node"`). Later plans model their unit tests on
`portfolio-search.test.ts`.

## Done criteria

- [ ] `evidenceItemSchema` matches spec §16.3 field-for-field
- [ ] ≥12 validated entries; `offboard-hitl-actions` example present
- [ ] `pnpm validate:evidence` wired into `prebuild` and exits 0
- [ ] `searchEvidence` is pure, deterministic, threshold-gated
- [ ] Hash deep links scroll + 1.5s highlight + focus move, honoring reduced motion
- [ ] `pnpm test && pnpm typecheck && pnpm build && pnpm test:e2e` all pass
- [ ] No new runtime dependencies beyond dev tooling (vitest/tsx)
- [ ] `plans/README.md` row updated

## STOP conditions

Stop and report back (do not improvise) if:

- An evidence entry cannot be written without asserting a fact absent from
  the spec (list the wanted entries for Louie instead of guessing).
- Anchor lists in `lib/routes.ts` don't match what's rendered (Plan 004
  drifted — fix belongs there, report it).
- You feel the need for embeddings/fuzzy libraries — the spec explicitly
  defers that (§17); the deterministic version is the deliverable.

## Maintenance notes

- The index is the single source of truth for AI claims. New portfolio
  content ⇒ new evidence entries + validator run. Louie must review every
  `detail` TODO before launch (re-checked in Plan 008).
- If retrieval quality proves insufficient later, spec §17 allows adding
  embeddings behind the same `searchEvidence` signature — keep the UI
  contract stable.
