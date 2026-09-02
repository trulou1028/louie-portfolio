# Plan 026: Delete the components and modules nothing imports

> **Executor instructions**: Follow this plan step by step. Run every
> verification command and confirm the expected result before moving to the
> next step. If anything in the "STOP conditions" section occurs, stop and
> report — do not improvise. When done, update the status row for this plan
> in `plans/README.md` — unless a reviewer dispatched you and told you they
> maintain the index.
>
> **Drift check (run first)**: `git diff --stat 50e98a4..HEAD -- components lib/ai/tools.ts lib/ai/tools.test.ts lib/ai/portfolio-search.ts lib/ai/portfolio-search.test.ts`
> If any in-scope file changed since this plan was written, re-run the
> importer grep in Step 1 before deleting anything; on a mismatch, treat it
> as a STOP condition.

## Status

- **Priority**: P2
- **Effort**: S
- **Risk**: LOW
- **Depends on**: none
- **Category**: tech-debt
- **Planned at**: commit `50e98a4`, 2026-08-31. **Re-verified 2026-09-02** at
  `7699b63`, after 020, 021, 022, 023 and 025 merged: all nine target files
  still exist and still have **zero** importers. The check was widened beyond
  the original grep to cover relative imports (`./x`, `../x`), `e2e/`, and
  `scripts/` — still zero. `getEvidenceById`'s only non-test consumer remains
  `lib/ai/tools.ts`, which this plan deletes.
- **Recommended executor model**: **Haiku 4.5.** Pure deletion with grep-checkable done criteria; the only judgment is "does the grep say zero", and the STOP conditions cover the rest.

## Why this matters

Eleven files have zero importers outside their own tests. Three of them (`rail-work-card.tsx`, `experiment-tile.tsx`, `rail-section.tsx`) are near-copies of live components that an agent will plausibly "fix in both places" or resurrect; one (`ui/marker.tsx`) was orphaned this week when the thinking row moved to `thinking-orbs`; `lib/ai/tools.ts` validates browser-executed tools that Plan 014 removed, and its 173-line test passes while protecting nothing. Every one of them has to be read, typechecked, and linted for no product benefit.

`lib/analytics.ts` is also unused (no `track(` call anywhere in `app/` or `components/`) but is **not** deleted here — spec §30 names the events it defines, so whether to wire it or drop it is Louie's decision (see `plans/README.md` candidates).

## Current state

Verified 2026-08-31 with `grep -rl 'components/<path>"' app components lib mdx-components.tsx` (excluding self):

| File | Importers |
|---|---|
| `components/portfolio/rail-work-card.tsx` | 0 |
| `components/portfolio/experiment-tile.tsx` | 0 |
| `components/system/rail-section.tsx` | 0 |
| `components/ui/input.tsx` | 0 |
| `components/ui/marker.tsx` | 0 |
| `components/ui/scroll-area.tsx` | 0 |
| `components/ui/separator.tsx` | 0 |
| `components/ui/tooltip.tsx` | 0 |
| `lib/ai/tools.ts` | 0 (only `lib/ai/tools.test.ts`) |

Keep (one real importer each): `components/ui/skeleton.tsx` (job-description-dialog), `components/ui/message.tsx` (ai-louie-live), `components/portfolio/metric.tsx`, `components/portfolio/outcome-chart.tsx`, `components/ai/prompt-chip.tsx` (all three used by `app/design-system/page.tsx` — their disposition is a separate decision).

`lib/ai/portfolio-search.ts` exports `getEvidenceById` whose only non-test consumer is `lib/ai/tools.ts:88`. Check `lib/ai/portfolio-search.test.ts` for tests of it before removing.

## Commands you will need

| Purpose   | Command                  | Expected on success |
|-----------|--------------------------|---------------------|
| Typecheck | `pnpm typecheck`         | exit 0              |
| Lint      | `pnpm lint`              | exit 0              |
| Unit      | `pnpm test`              | all pass            |
| Build     | `pnpm build`             | exit 0              |
| E2E       | `pnpm test:e2e`          | `0 failed`          |

## Scope

**In scope** (delete):
- the nine files in the table above, plus `lib/ai/tools.test.ts`
- `lib/ai/portfolio-search.ts` — remove `getEvidenceById` **only if** Step 3's grep shows no consumer left
- `lib/ai/portfolio-search.test.ts` — remove tests of `getEvidenceById` only if the function is removed

**In scope (one-line comment fix, added 2026-09-02):**
- `components/portfolio/work-card.tsx:27-28` — its docblock ends
  "Same `data-pending-asset` pattern as `rail-work-card.tsx`." That sentence
  points at a file this plan deletes. Change it to stop naming the deleted
  file — e.g. end the sentence at "...represented as real")." and drop the
  trailing clause. **Touch nothing else in that file**; `work-card.tsx` is
  live and its `data-pending-asset` markup at `:62` stays exactly as is.
  Leaving the reference would create precisely the doc drift Plan 027 exists
  to clean up, so it is fixed here at source rather than deferred.

**Out of scope**:
- `lib/analytics.ts`, `lib/analytics.test.ts` — decision pending (see above).
- `components/portfolio/metric.tsx`, `outcome-chart.tsx`, `components/ui/chart.tsx`, `components/ai/prompt-chip.tsx`, `recharts` — used by `/design-system`; disposition is a separate decision.
- `plans/011-*.md` mentions of the deleted components — historical record; leave.

## Git workflow

- Branch: `plan-026`
- Two commits: (1) `components/portfolio` + `components/system` + `lib/ai` deletions, (2) `components/ui` deletions — so re-adding an upstream shadcn primitive later is a clean `shadcn add`.
- Do NOT push or open a PR unless the operator instructed it.

## Steps

### Step 1: Re-verify importers at HEAD

Run, for each path `P` in the table: `grep -rl "components/P\"" app components lib mdx-components.tsx | grep -v "components/P.tsx"` and for tools: `grep -rl 'lib/ai/tools"' app components lib | grep -v test`.

**Verify**: every command prints nothing. If any prints a file, STOP.

### Step 2: Delete the app-level dead code

`git rm components/portfolio/rail-work-card.tsx components/portfolio/experiment-tile.tsx components/system/rail-section.tsx lib/ai/tools.ts lib/ai/tools.test.ts`

**Verify**: `pnpm typecheck && pnpm lint && pnpm test` → exit 0. The unit count is **87** at `7699b63` (not the 75 an earlier draft of this plan assumed — plans 022 and 023 added tests since). It will drop by however many lived in `tools.test.ts`; record the exact new number rather than predicting it.

### Step 3: `getEvidenceById`

`grep -rn "getEvidenceById" app components lib` → if only `lib/ai/portfolio-search.ts` (definition) and `lib/ai/portfolio-search.test.ts` remain, remove the function, its docblock, and its tests. Otherwise leave it and note the consumer.

**Verify**: `pnpm typecheck && pnpm test` → exit 0.

### Step 4: Delete the unused shadcn copies

`git rm components/ui/input.tsx components/ui/marker.tsx components/ui/scroll-area.tsx components/ui/separator.tsx components/ui/tooltip.tsx`

**Verify**: `pnpm typecheck && pnpm lint && pnpm build` → exit 0.

### Step 5: Full gate

**Verify**: `pnpm test:e2e` → `0 failed`.

## Test plan

No new tests: the deletions are verified by the compiler, the linter, and the full suites.

## Done criteria

- [ ] All nine table files and `lib/ai/tools.test.ts` are gone (`ls` each → "No such file")
- [ ] `grep -rn "rail-work-card\|experiment-tile\|rail-section\|ai/tools\"" app components lib content e2e scripts mdx-components.tsx` → **no output** (no surviving reference, in code or comment, to anything deleted)
- [ ] `pnpm typecheck && pnpm lint && pnpm test && pnpm build` exit 0
- [ ] `pnpm test:e2e` → `0 failed`
- [ ] `git diff --name-only <base>..HEAD` shows only: the ten deletions, the `work-card.tsx` comment fix, and at most `lib/ai/portfolio-search.ts` + `lib/ai/portfolio-search.test.ts`. Nothing else.
- [ ] `plans/README.md` status row updated, with the new unit-test count

## STOP conditions

- Any Step 1 grep prints a file.
- `pnpm build` fails on a missing module: the MDX pipeline resolves components through `mdx-components.tsx` — check it; if it references a deleted component, STOP rather than editing it.
- `getEvidenceById` has a consumer outside `lib/ai/tools.ts`.

## Maintenance notes

- `components/ui/*` are upstream copies; if a primitive is needed again, `pnpm dlx shadcn@latest add <name>` restores it (the CLI is a dev dependency after Plan 020).
- Consider a periodic `knip` or `ts-prune` run in CI to catch this class automatically — deliberately not added here (new tooling is its own decision).
