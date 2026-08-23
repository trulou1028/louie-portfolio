# Plan 011: Restructure the homepage — new headline, trimmed nav, work-first main column

> **Executor instructions**: Follow this plan step by step. Run every
> verification command and confirm the expected result before moving to the
> next step. If anything in the "STOP conditions" section occurs, stop and
> report — do not improvise. When done, update the status row for this plan
> in `plans/README.md`.
>
> **Drift check (run first)**: `git diff --stat 64b620e..HEAD -- app/page.tsx lib/routes.ts content/profile.ts lib/content.test.ts e2e/home.spec.ts`
> If any in-scope file changed since this plan was written, compare the
> "Current state" excerpts against the live code before proceeding; on a
> mismatch, treat it as a STOP condition.

## Status

- **Priority**: P1
- **Effort**: M
- **Risk**: LOW
- **Depends on**: none (executes on branch `restyle/rhea-dark`)
- **Category**: direction
- **Planned at**: commit `64b620e` (branch `restyle/rhea-dark`), 2026-08-23

## Why this matters

Louie reviewed the live homepage on 2026-08-23 and gave four directives: the
headline becomes "I design & ship AI products."; Writing and Experiments
leave the primary nav; the homepage's right rail currently reads as filler;
and hiring managers should reach the work as fast as possible. This plan does
the mechanical restructure — headline, nav, and moving Featured Work and
"Louie in brief" into the main column — while **deliberately leaving the AI
thread in the main column** so every intermediate state keeps the e2e suite
green. Plan 012 then moves AI into the vacated rail.

These are owner decisions that supersede the spec
(`LOUIE_PORTFOLIO_V2_IMPLEMENTATION_SPEC.md` §11 specifies the old headline
and homepage sections verbatim). Record the supersession, do not silently
diverge (spec §39.14).

## Current state

Work happens on branch `restyle/rhea-dark` (dark Nova/Rhea skin; Roboto Slab
display via `font-serif`, Outfit body, amber/rust accent split).

- `content/profile.ts:15` — `primary: "I design AI products and build them."`
  with `primaryEmphasis: "and build them."` just below. **Invariant**:
  `primaryEmphasis` must remain a suffix of `primary`
  (`lib/content.test.ts` "keeps the emphasised tail a suffix" asserts this;
  the homepage slices `primary` to style the tail in accent italic).
- `lib/content.test.ts:20-27` and `e2e/home.spec.ts:28,90` pin the OLD
  spec-verbatim headline — all three must change together.
- `lib/routes.ts` — `NAV_ITEMS` lists Home, Work, AI Systems, Experiments,
  Writing, About, Resume. `ROUTES` (separate constant, same file) is the AI
  navigation allowlist and the sitemap source — it must NOT lose entries.
- `app/page.tsx` — `Home()` builds `rail` (aside: Featured work
  `RailWorkCard`s, Experiments `ExperimentTile` grid, "Louie in brief"
  Surface, philosophy quote) and returns
  `<Canvas rail={rail} stackRail railDefaultSize={30}>` with main column =
  hero section + `#ask-ai-louie` section (`AiLouieThread`).
- Components: `components/portfolio/rail-work-card.tsx` (compact horizontal
  card), `components/portfolio/experiment-tile.tsx`,
  `components/system/rail-section.tsx`. A full-width `WorkCard` does NOT
  exist yet — `/work` (`app/work/page.tsx`) also renders `RailWorkCard`s.
- Conventions: tokens only (no raw hex/px — see `AGENTS.md`); wrapped
  primitives, not raw shadcn; `cn()` from `lib/utils`; motion via
  `--duration-*` tokens.

## Commands you will need

| Purpose    | Command          | Expected on success |
|------------|------------------|---------------------|
| Typecheck  | `pnpm typecheck` | exit 0              |
| Lint       | `pnpm lint`      | exit 0              |
| Unit       | `pnpm test`      | all pass            |
| E2E        | `pnpm test:e2e`  | all pass (keyless)  |
| Build      | `pnpm build`     | exit 0, evidence validator prints 18 entries |

## Scope

**In scope**:
- `content/profile.ts` (headline pair), `lib/content.test.ts`,
  `e2e/home.spec.ts` (headline assertions)
- `lib/routes.ts` (`NAV_ITEMS` only)
- `app/page.tsx`, a new `components/portfolio/work-card.tsx` (full-width),
  restyled "Louie in brief" block
- `app/work/page.tsx` (add an "Explorations" link so `/experiments` is not
  orphaned)
- `README.md` deviations ledger (one entry)

**Out of scope** (do NOT touch):
- `ROUTES`, sitemap, robots — `/writing` and `/experiments` remain live
  stable URLs (spec §28)
- `components/ai/*` and the AI thread's placement (Plan 012)
- The evidence index (no entry cites the headline — verified)
- The spec file itself

## Git workflow

- Work on `restyle/rhea-dark`. Commit per step, imperative subjects, matching
  `git log` style. Do NOT push or merge unless the operator says so.

## Steps

### Step 1: Headline

In `content/profile.ts` set:

```ts
primary: "I design & ship AI products.",
primaryEmphasis: "ship AI products.",
```

(The suffix invariant holds; the accent-italic tail reads "…ship AI
products." Louie may later shrink the emphasis — keep it a suffix.)
Update `lib/content.test.ts` to assert the new `primary` verbatim, and both
`e2e/home.spec.ts` accessible-name assertions to
`"I design & ship AI products."`. Add one line to the README "Deviations"
ledger: headline superseded by owner decision, 2026-08-23 (spec §11).

**Verify**: `pnpm test` → all pass; `pnpm test:e2e e2e/home.spec.ts` → all pass.

### Step 2: Trim the nav

Remove the Experiments and Writing entries from `NAV_ITEMS` in
`lib/routes.ts`. Leave `ROUTES` and `NAV_ICONS` untouched (unused icon map
entries are harmless). In `app/work/page.tsx`, add beneath the work cards a
quiet line using the existing `InlineLink`:
"Smaller explorations live in the lab → /experiments".

**Verify**: `pnpm test:e2e e2e/landmarks.spec.ts` passes;
`curl -s localhost:3000/experiments` (dev server) → 200; the primary nav
renders 5 items (check via `pnpm test:e2e e2e/home.spec.ts` — update any nav
count assertions it contains to 5).

### Step 3: Full-width WorkCard

Create `components/portfolio/work-card.tsx`: a `Surface variant="interactive"`
rendered via `render={<Link …/>}` (see `rail-work-card.tsx` for the exact
composition idiom), laid out for the main column: image slot left (16:10,
`data-pending-asset` dashed placeholder until real assets exist — copy the
pattern from `rail-work-card.tsx`), then name (`text-heading-md
font-serif`), full editorial `title` (`text-body text-foreground-muted`),
summary, and the full tag row as `SystemLabel`-style chips. Stacks vertically
below `sm`.

**Verify**: `pnpm typecheck` exit 0.

### Step 4: Recompose the homepage main column

In `app/page.tsx`, new main-column order (rail: see Step 5):

1. Hero (unchanged apart from the Step 1 copy).
2. **Featured work** — `SectionLabel` "Featured work" + the two new
   `WorkCard`s + a ghost `Action` "All work →" (`/work`). This section sits
   immediately after the hero: work before anything else.
3. `#ask-ai-louie` section with `AiLouieThread` — **unchanged, still in the
   main column** (Plan 012 relocates it).
4. **Louie in brief** — restyled for the main column: a bordered-top section
   (not a boxed Surface): `SectionLabel` "In brief", the five `profile.brief`
   points as a two-column list at `sm+` (`grid sm:grid-cols-2`), the
   philosophy quote (`profile.quotes.philosophy`) as a closing blockquote,
   and a secondary `Action` "About Louie" → `/about`.

Delete from the page: the `rail` aside, `RailSection`/`ExperimentTile`
imports, and the experiments tile grid (the tiles remain used by nothing on
this page; leave the components on disk — `/experiments` detail pages and
Plan 012's answer surface may reuse them).

**Verify**: `pnpm test:e2e e2e/home.spec.ts` — update its rail-scoped
assertions: the "featured work in the contextual rail" and "rail content is
present once" tests now assert the cards live in `main` (one card per
project, `page.locator('main a[href="/work/offboard"]')` count 1 — the AI
suggestion chips also link there, so scope to the featured-work section by
`getByRole("region")` or a `data-testid="featured-work"` on the section).
All other suites pass.

### Step 5: Rail handling until Plan 012

Render the homepage with **no rail**: `<Canvas>` without the `rail`/
`stackRail` props (the Canvas renders a single scroller; the pane group and
`louie-canvas` saved layout simply don't mount). Do not delete
`RailWorkCard`/`RailSection`/`ExperimentTile` files.

**Verify**: at 1440px the homepage shows two columns only (left nav +
content); `pnpm test:e2e` full suite passes; `pnpm build` exit 0.

## Test plan

- Update in place: `e2e/home.spec.ts` (headline ×2, nav count, featured-work
  location assertions), `lib/content.test.ts` (headline).
- New: extend `e2e/home.spec.ts` — "work appears before the AI panel in
  document order" (compare `boundingBox().y` of the featured-work section vs
  `#ask-ai-louie`), and "primary nav omits Writing and Experiments".
- Full gates: `pnpm test && pnpm typecheck && pnpm lint && pnpm build &&
  pnpm test:e2e` all green, keyless.

## Done criteria

- [ ] Headline renders and is asserted as "I design & ship AI products."
      with the accent-italic tail intact
- [ ] Primary nav = Home, Work, AI Systems, About, Resume (5 items)
- [ ] `/experiments` and `/writing` still return 200 and remain in
      `ROUTES`/sitemap; `/work` links to `/experiments`
- [ ] Featured work renders in the main column directly after the hero;
      "Louie in brief" follows the AI section; no homepage rail
- [ ] README deviations ledger records the supersessions (headline, §11
      section changes, nav trim)
- [ ] All five gates green

## STOP conditions

- The suffix invariant cannot hold for the emphasis Louie wants — report,
  don't drop the invariant.
- Removing the rail breaks `e2e/accessibility.spec.ts` (a landmark test may
  expect the `complementary` region on `/`) — update that expectation only
  for `/`, not globally; if more than that one expectation fails, STOP.
- Anything requires editing `ROUTES` or deleting a route directory.

## Maintenance notes

- Plan 012 assumes: homepage `Canvas` has no rail, `AiLouieThread` still in
  main, `WorkCard` exists. Reviewers: check no `RailSection` import remains
  in `app/page.tsx`.
- `/work` may later adopt the full-width `WorkCard` too — nice, not required.
