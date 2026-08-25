# Plan 015: Make the Ask panel reachable below 1280px

> **Executor instructions**: Follow this plan step by step. Run every
> verification command and confirm the expected result before moving to the
> next step. If anything in the "STOP conditions" section occurs, stop and
> report — do not improvise. When done, update the status row for this plan
> in `plans/README.md` — unless a reviewer dispatched you and told you they
> maintain the index.
>
> **Drift check (run first)**:
> `git diff --stat 3e26ed8..HEAD -- components/app-shell app/page.tsx components/ai/ask-panel.tsx lib/use-breakpoint.ts`
> If any in-scope file changed since this plan was written, compare the
> "Current state" excerpts against the live code before proceeding; on a
> mismatch, treat it as a STOP condition.

## Status

- **Priority**: P1
- **Effort**: M
- **Risk**: MED (touches the shell's layout switch, which every page uses)
- **Depends on**: plans/014-ask-panel-basic-qa.md (branch `worktree-agent-ab66fecd4febee279`)
- **Category**: bug
- **Planned at**: commit `3e26ed8`, 2026-08-24

## Why this matters

The Ask panel is the portfolio's signature interaction, and below 1280px a
visitor effectively never sees it. Measured in a real browser on the plan-014
build, with a fresh page load at each width:

| Viewport | Where the Ask panel starts | Scrolling to reach it |
|---|---|---|
| 1280px+ | side rail, on screen at paint | none |
| 1279px | 1,656px down the page | 2.1 screens |
| 768px | stacked at the bottom | ~2.5 screens |
| 375px | 2,381px down the page (68% of the page) | 3.2 screens |

At 1279px the layout also wastes 379px of horizontal room: the content column
is capped at 900px while the rail that would have used the remainder is gone.
The switch is a one-pixel cliff — 1280px gives a full-height rail, 1279px
buries the panel under the hero, Featured work, and In brief.

The panel itself is not broken. Once found, it works correctly at every width
(verified: asked "Tell me about Flexi" at 375px, the answer streamed and the
panel grew to 936px with no clipping and no inner scroll trap). This is
purely a placement and breakpoint problem.

## Current state

- `lib/use-breakpoint.ts` — `useMinWidth(px)` returns viewport state as a
  boolean. SSR and the first client render return `true` on purpose so the
  server-rendered DOM is the desktop tree and hydration never mismatches:

  ```ts
  export function useMinWidth(px: number): boolean {
    const query = `(min-width: ${px}px)`;
    // ...useSyncExternalStore over matchMedia...
    return mounted ? matches : true;
  }
  ```

  This implementation is correct — do not rewrite it. (An automated-resize
  test appeared to show it not reacting to window resizes; that was a test
  harness artifact — `matchMedia` `change` events do not fire under CDP
  viewport overrides. Real browsers fire them.)

- `components/app-shell/contextual-rail.tsx` — `Canvas` owns the switch. The
  breakpoint is hardcoded in two places that must agree:

  ```tsx
  const isXl = useMinWidth(1280);          // line ~93 — the JS half
  const showPanes = Boolean(rail) && isXl;
  ```

  ```tsx
  {rail && stackRail && !isXl ? (          // line ~124 — the stacked fallback
    <div className="mt-16">{rail}</div>
  ) : null}
  ```

  ```tsx
  <div className="relative h-full max-xl:hidden">{rail}</div>   // line ~159 — the CSS half
  ```

  The `max-xl:hidden` guard and `useMinWidth(1280)` are the same threshold
  expressed twice (Tailwind `xl` = 1280px). **If you change one you must
  change the other, or the rail renders in a hidden container with no
  stacked fallback and disappears entirely.** That coupling is the main risk
  in this plan.

- **The 1280 threshold is encoded in FIVE places, not three.** An earlier
  revision of this plan listed only three and a first execution attempt
  correctly STOPPED when the rail vanished at 1100px. All five must move
  together:

  1. `components/app-shell/contextual-rail.tsx` — `useMinWidth(1280)` (JS)
  2. `components/app-shell/contextual-rail.tsx` — `max-xl:hidden` on the rail
     pane wrapper and the resize handle, plus `xl:h-full` /
     `xl:overflow-y-auto` on the `ContextualRail` aside (Tailwind)
  3. `components/ai/ask-panel.tsx` — `xl:border-l` and the `max-xl:*` group
  4. `app/globals.css:307` — a **pre-hydration `!important` guard** that the
     Tailwind greps do not find, because it lives in `app/` and spells the
     breakpoint numerically:

     ```css
     @media (max-width: 1279.98px) {
       [data-panel][id="canvas-rail"] { display: none !important; }
       [data-panel][id="canvas-content"] { flex: 1 1 auto !important; }
     }
     ```

     This is why moving only 1–3 makes the panel disappear entirely between
     1024 and 1279: React mounts the pane tree (because the JS half now says
     "rail"), this rule forces `display:none` on it, and the stacked fallback
     is skipped (because `hasRailPane` is true). Worse than the original bug.
     Note the sibling rule directly above it at `app/globals.css:297` already
     uses `1023.98px` — that one governs the **left rail**, is already on the
     1024 threshold, and must NOT be touched.
  5. `components/portfolio/table-of-contents.tsx:52` — `xl:hidden` on
     `TableOfContentsInline`, the collapsed disclosure shown "for narrow
     screens where the rail is not available". Left at `xl`, case-study pages
     would render the inline TOC *and* the rail TOC simultaneously between
     1024 and 1279.

  `Canvas` also caps the content column:

  ```tsx
  <div className={cn("mx-auto w-full max-w-[900px] px-6 py-10 sm:px-8 lg:py-14", className)}>
  ```

  and the rail pane is `defaultSize={railDefaultSize}` with
  `minSize={260} maxSize={520}`.

- `app/page.tsx` — the homepage passes `stackRail` and `railDefaultSize={350}`
  and renders children in this order: hero `<section>`, Featured work
  `<section data-testid="featured-work">`, In brief `<section>`. The rail is
  appended **after all of them** by `Canvas`, which is why it lands last.

- `components/ai/ask-panel.tsx` — the panel's own responsive classes:

  ```tsx
  "flex h-full min-h-0 flex-col gap-4 bg-accent-soft/40 p-5",
  "scroll-mt-8 xl:border-l xl:border-border-subtle",
  "max-xl:h-auto max-xl:rounded-panel max-xl:border max-xl:border-accent-muted/70",
  ```

  These `xl:`/`max-xl:` variants are the third place the 1280 threshold is
  encoded.

- Owner decision to respect (Plan 011, 2026-08-23, recorded in
  `plans/README.md`): Featured work sits directly after the hero, **ahead of
  the AI surface** — "a recruiter should reach the work as fast as possible".
  Do **not** move the Ask panel above Featured work.

Conventions: components carry doc comments explaining intent with spec/plan
references; styling uses repo tokens only (`text-body-sm`, `bg-accent-soft`,
`focus-ring`, `duration-(--duration-fast)`), never raw hex or arbitrary
values.

## Commands you will need

| Purpose   | Command            | Expected on success |
|-----------|--------------------|---------------------|
| Install   | `pnpm install`     | exit 0 |
| Typecheck | `pnpm typecheck`   | exit 0 |
| Lint      | `pnpm lint`        | exit 0 |
| Unit      | `pnpm test`        | all pass |
| E2E       | `pnpm test:e2e`    | all pass |
| Build     | `pnpm build`       | exit 0 |

## Scope

**In scope**:
- `components/app-shell/contextual-rail.tsx`
- `components/ai/ask-panel.tsx`
- `app/page.tsx`
- `app/globals.css` — **only** the `max-width: 1279.98px` media query at
  line 307. Do not touch the `1023.98px` rule at line 297 (that is the left
  rail, already correct).
- `components/portfolio/table-of-contents.tsx` — **only** the `xl:hidden`
  class on line 52.
- `e2e/home.spec.ts`, `e2e/ai-louie.spec.ts` (breakpoint assertions)

**Out of scope**:
- `lib/use-breakpoint.ts` — the hook is correct; changing it risks the
  hydration contract described in its doc comment.
- `components/app-shell/persistent-panel-group.tsx` and
  `components/ui/resizable.tsx` — panel persistence works; leave it.
- The order of the hero and Featured work sections (owner decision above).
- Anything under `components/ai/` other than `ask-panel.tsx` — the chat
  itself is verified working at all widths.
- Footer link sizing — tracked separately as a P3 (see Maintenance notes).

## Git workflow

- Branch off `worktree-agent-ab66fecd4febee279` (the plan-014 tip `3e26ed8`).
- Commit per step; message style matches `git log` (short imperative, e.g.
  "Lower the rail breakpoint so laptops keep the Ask panel").
- Do NOT push or open a PR.

## Steps

### Step 1: Introduce a single source of truth for the rail breakpoint

In `components/app-shell/contextual-rail.tsx`, add near the top:

```tsx
/**
 * The width at which the contextual rail becomes its own pane.
 *
 * This value is encoded in three places that MUST agree: this constant (the
 * JS half), the `max-lg:hidden` guard on the rail pane, and the `lg:`/
 * `max-lg:` variants in `ask-panel.tsx`. If they disagree, the rail renders
 * inside a CSS-hidden container with no stacked fallback and vanishes.
 */
const RAIL_BREAKPOINT_PX = 1024;
```

Replace `useMinWidth(1280)` with `useMinWidth(RAIL_BREAKPOINT_PX)`, and
rename the local from `isXl` to `hasRailPane` so nothing reads as "xl" when
it no longer is.

Do **not** change the CSS guards yet — Step 2 does that, and the two steps
together are one atomic change. Expect the layout to be briefly inconsistent
between steps 1 and 2; that is why Step 2's verification is the real gate.

**Verify**: `pnpm typecheck` → exit 0.

### Step 2: Move the CSS guards to the same breakpoint

Three edits, all switching `xl` → `lg` (Tailwind `lg` = 1024px):

1. `contextual-rail.tsx`, the rail pane wrapper:
   `<div className="relative h-full max-xl:hidden">` →
   `<div className="relative h-full max-lg:hidden">`
2. `contextual-rail.tsx`, the `ContextualRail` aside:
   `"flex min-h-0 flex-col xl:h-full"` → `"flex min-h-0 flex-col lg:h-full"`,
   and `bare ? undefined : "gap-6 px-5 py-10 lg:py-14 xl:overflow-y-auto"` →
   `... lg:overflow-y-auto`
3. `contextual-rail.tsx`, the resize handle: `max-xl:hidden` → `max-lg:hidden`
4. `components/ai/ask-panel.tsx`: `xl:border-l xl:border-border-subtle` →
   `lg:border-l lg:border-border-subtle`, and
   `max-xl:h-auto max-xl:rounded-panel max-xl:border max-xl:border-accent-muted/70`
   → the `max-lg:` equivalents.

5. `app/globals.css` line 307: `@media (max-width: 1279.98px)` →
   `@media (max-width: 1023.98px)`. **Change only this one.** The rule at
   line 297 already reads `1023.98px` and governs the left rail — leave it
   exactly as it is. After the edit two sibling media queries will both read
   `1023.98px`; that is correct and expected, since they now share a
   threshold. Do not merge them — they are separate concerns.
6. `components/portfolio/table-of-contents.tsx` line 52: `xl:hidden` →
   `lg:hidden`, so the collapsed inline table of contents stops rendering at
   exactly the width where the rail TOC starts.

Then confirm no 1280-based rail guard survives anywhere (note the wider
search path — the previous revision of this plan grepped only `components/`
and therefore missed the `app/globals.css` rule):

**Verify**:
- `grep -rn "1279\|1280" app components lib --include="*.ts" --include="*.tsx" --include="*.css"` → no matches
- `grep -rn "xl:hidden\|max-xl:\|xl:h-full\|xl:overflow-y-auto" app components | grep -v "2xl\|lg:"` → no matches
- `grep -rn "useMinWidth(1280)" components/` → no matches
- `pnpm typecheck` → exit 0, `pnpm lint` → exit 0
- **Browser gate (this is the real one — the greps above passed last time
  while the panel was invisible):** start the dev server, load a FRESH page
  at 1100×800, and run:

  ```js
  (() => { const p = document.querySelector('#ask-ai-louie');
    const r = p.getBoundingClientRect();
    return { w: Math.round(r.width), h: Math.round(r.height),
             display: getComputedStyle(p.closest('[data-panel]') || p).display }; })()
  ```

  Expect a non-zero width and height and `display` that is not `"none"`. If
  width or height is 0, STOP — some encoding of the breakpoint still
  disagrees; report which selector is hiding it.

### Step 3: Reduce the scroll distance below 1024px

Below the rail breakpoint the panel still stacks, and today it lands after
**every** section. Move it up one section — after Featured work, before In
brief — so it is reachable without crossing the whole page, while keeping
Featured work ahead of it per the Plan 011 owner decision.

In `components/app-shell/contextual-rail.tsx`, `Canvas` currently appends the
stacked rail after `{children}`. Add an optional prop so a page can place it
itself:

```tsx
/**
 * Below the rail breakpoint the rail stacks into the content column. By
 * default it appends after all children; a page that wants it earlier
 * renders `<StackedRailSlot />` at the chosen position instead.
 */
```

Implement whichever of these two shapes is cleaner in this codebase, and say
which you chose in your report:
- **(a)** a `stackedRailAfter?: "content" | "featured-work"` prop on `Canvas`, or
- **(b)** exposing the stacked rail via context so `app/page.tsx` can render a
  slot component between its Featured work and In brief sections.

Prefer **(a)** — it keeps the layout decision inside the shell and needs no
new context. Whichever you pick, the desktop pane tree must be untouched.

**Verify**: `pnpm typecheck` → exit 0, and with the dev server running at
375px width the panel's offset from the top of the page is **under 1,800px**
(it was 2,381px). Measure with:

```js
(() => { const p=document.querySelector('#ask-ai-louie'); const s=document.querySelector('[data-canvas-scroll]');
  return Math.round((p.getBoundingClientRect().top - s.getBoundingClientRect().top) + s.scrollTop); })()
```

**Revised gate (2026-08-24, after a first execution attempt):** the original
1,800px figure was an estimate, not a measured threshold. The implemented
change lands at **1,932px** (down from 2,381px — a 449px reduction), and the
remaining distance is dominated by the Featured work section's own height
(1,233px for two cards), which is content this plan is not allowed to trim.

The gate is therefore **under 2,000px**, plus a working one-tap path from the
hero. The hero's "Ask Louie" link (`AskAILouieLink` → `#ask-ai-louie`) was
verified to scroll the panel to 88px from the top of the viewport in one
activation, so absolute scroll distance is a secondary concern — nobody has
to scroll to reach the panel unless they choose to.

If the measurement exceeds 2,000px, or the hero link no longer lands the
panel within the top half of the viewport, STOP and report both numbers.

**Also fix (found in review):** the stacked rail wrapper carries `mt-16`
(64px) while sitting inside a `flex flex-col gap-14` (56px) column, so it
gets 120px of space above it where every other section boundary gets 56px.
Drop the `mt-16` from the stacked rail wrapper so spacing is uniform. Verify
with:

```js
(() => { const col = document.querySelector('[data-canvas-scroll]').firstElementChild;
  const w = [...col.children].find(c => c.querySelector('#ask-ai-louie'));
  return { marginTop: getComputedStyle(w).marginTop, gap: getComputedStyle(col).rowGap }; })()
```

Expect `marginTop: "0px"` and `gap: "56px"`.

### Step 4: Update the e2e breakpoint assertions

`e2e/home.spec.ts` and `e2e/ai-louie.spec.ts` contain comments and helpers
that describe the switch as happening at `xl`/1280 (e.g. the
`scrollToAskPanel` helper's doc comment in `ai-louie.spec.ts`, and
`home.spec.ts`'s rail-placement test). Update the wording to 1024 and adjust
any hardcoded viewport width that was chosen to sit between 1024 and 1280 —
such a width now yields a rail, not a stacked panel, and a test written
against the old assumption will fail for the right reason.

Add one new test to `e2e/home.spec.ts`: at a 1100×800 viewport the Ask panel
is visible without scrolling — `await expect(panel).toBeInViewport()`.

**Verify**: `pnpm test:e2e` → all pass, including the new test. `pnpm build`
→ exit 0.

## Test plan

- New e2e: Ask panel in viewport without scrolling at 1100×800
  (`e2e/home.spec.ts`, model after the existing rail-placement test).
- Existing e2e must all still pass; if a test fails because its viewport now
  produces a rail instead of a stacked panel, update the test's expectation —
  do not weaken the assertion.
- Manual measurement from Step 3 (mobile scroll distance under 1,800px).

## Done criteria

ALL must hold:

- [ ] `pnpm typecheck`, `pnpm lint`, `pnpm test`, `pnpm test:e2e`, `pnpm build` all exit 0
- [ ] `grep -rn "useMinWidth(1280)" components/` → no matches
- [ ] `grep -rn "1279\|1280" app components lib --include="*.ts" --include="*.tsx" --include="*.css"` → no matches
- [ ] `grep -rn "xl:hidden\|max-xl:" app components | grep -v "2xl\|lg:"` → no matches
- [ ] At 1100×800 on a fresh load, `#ask-ai-louie` has non-zero width and height
- [ ] On a case-study page (`/work/offboard`) at 1100×800, the collapsed
      "On this page" disclosure is NOT visible (the rail TOC replaces it) —
      exactly one table of contents renders
- [ ] At 1100×800, `#ask-ai-louie` is on screen at page load with no scrolling
- [ ] At 375×812, `#ask-ai-louie` starts under 2,000px from the top of the page
- [ ] At 375×812, activating the hero's "Ask Louie" link scrolls the panel to
      within the top half of the viewport
- [ ] The stacked rail wrapper has `margin-top: 0px` (uniform 56px section spacing)
- [ ] At 1440×900, the rail still renders as a resizable side pane and its
      width still persists across a reload
- [ ] Featured work still appears before the Ask panel at every width
- [ ] No files outside the in-scope list modified (`git status`)

## STOP conditions

Stop and report back (do not improvise) if:

- After Step 2 the rail disappears at any width — that means the JS and CSS
  halves disagree; report both values rather than patching one side.
- The measured mobile offset in Step 3 is not under 1,800px.
- Panel width persistence (`storageKey="canvas-v2"`) breaks — a stored
  desktop layout must not corrupt the 1024–1279 range.
- Any case-study page's table-of-contents rail regresses; those pages use
  `ContextualRail` without `stackRail`, so they must simply gain the rail
  earlier, never lose it.
- More than two existing e2e tests fail — that suggests the breakpoint change
  has a wider blast radius than this plan assumed.

## Maintenance notes

- The three-place breakpoint coupling is the fragile part. Step 1's constant
  documents it, but Tailwind variants cannot read a JS constant, so the CSS
  half stays manual. A reviewer should check all three moved together.
- **Deferred P2**: after an answer on mobile the panel grows past the
  viewport (measured 936px tall in an 812px viewport) and the composer ends
  up ~3,216px down the page, so asking a follow-up needs a scroll. Options
  are capping the stacked panel's height with an inner scroll, or making the
  composer sticky within it. Not fixed here because it changes the reading
  experience and is worth a design decision first.
- **Deferred P3**: seven interactive targets on the homepage are under 44px,
  and the footer links (Resume, LinkedIn, Email, Book time) measure 22px
  tall — just under the 24px WCAG 2.2 AA minimum. Fix by adding vertical
  padding in `components/app-shell/site-footer.tsx:15`.
- Verified sound and needing no work: no horizontal overflow at 375/768/1279
  on `/`, `/work/offboard`; mobile menu button is exactly 44×44; case-study
  media is contained.
