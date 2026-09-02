# Plan 025: Fix the stranded deep-link highlight, and make the rail breakpoint one constant with a guard

> **Executor instructions**: Follow this plan step by step. Run every
> verification command and confirm the expected result before moving to the
> next step. If anything in the "STOP conditions" section occurs, stop and
> report — do not improvise. When done, update the status row for this plan
> in `plans/README.md` — unless a reviewer dispatched you and told you they
> maintain the index.
>
> **Drift check (run first)**: `git diff --stat 50e98a4..HEAD -- components/portfolio/deep-link-highlight.tsx components/app-shell/contextual-rail.tsx components/app-shell/app-shell.tsx lib/use-breakpoint.ts e2e/deep-link.spec.ts e2e/home.spec.ts`
> If any in-scope file changed since this plan was written, compare the
> "Current state" excerpts against the live code before proceeding; on a
> mismatch, treat it as a STOP condition.

## Status

- **Priority**: P2
- **Effort**: S
- **Risk**: LOW
- **Depends on**: none (020 for CI)
- **Category**: bug + tech-debt
- **Planned at**: commit `50e98a4`, 2026-08-31
- **Recommended executor model**: **Sonnet 5.** Two small, well-bounded changes; the e2e additions follow existing files closely.

## Why this matters

**Deep link.** `DeepLinkHighlight` keeps one `timeout` for every reveal, but each pending timer closes over *its own* `target`. Reveal A then reveal B within 1.5s: B's reveal clears A's pending removal, so A keeps `data-highlight="true"` for ever while only B's is scheduled. The component's own comment says back-to-back reveals are a real sequence (mount pass + `hashchange`), and the effect cleanup on route change cancels the timer without removing the attribute — a section can stay accent-washed after navigating away and back.

**Breakpoint.** The rail becomes its own pane at 1024px. That number lives in JS (`useMinWidth(1024)` in `app-shell.tsx`, `RAIL_BREAKPOINT_PX = 1024` in `contextual-rail.tsx` — not exported) and in Tailwind `lg:`/`max-lg:` classes in at least six files. The `contextual-rail.tsx` docstring says "three places"; there are more. If the two halves disagree, the Ask panel renders inside a CSS-hidden container with no stacked fallback and silently disappears at one viewport band — Plan 015's execution log records exactly this happening. No test asserts the JS and CSS agree.

## Current state

- `components/portfolio/deep-link-highlight.tsx:39-85`:
  ```ts
  React.useEffect(() => {
    let timeout: ReturnType<typeof setTimeout> | undefined;
    const reveal = () => {
      const id = (window.location.hash || window.__deepLinkHash || "").slice(1);
      if (!id) return;
      const target = document.getElementById(id);
      if (!target) return;
      …scrollIntoView / focus…
      target.setAttribute("data-highlight", "true");
      if (timeout) clearTimeout(timeout);
      timeout = setTimeout(() => {
        target.removeAttribute("data-highlight");
      }, HIGHLIGHT_MS);
    };
    const frame = requestAnimationFrame(reveal);
    window.addEventListener("hashchange", reveal);
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener("hashchange", reveal);
      if (timeout) clearTimeout(timeout);
    };
  }, [pathname]);
  ```
- `components/app-shell/contextual-rail.tsx:20` — `const RAIL_BREAKPOINT_PX = 1024;` (not exported; `:236` exports only `ContextualRail, Canvas`). Docstring `:12-19` says the value is "encoded in three places that MUST agree".
- `components/app-shell/app-shell.tsx:34` — `const isLg = useMinWidth(1024);` (literal).
- CSS half (all must equal Tailwind's `lg` = 1024px): `app-shell.tsx:67,72` (`max-lg:hidden`), `contextual-rail.tsx:57` (`lg:overflow-y-auto`), `:216,230` (`max-lg:hidden`), `components/ai/ask-panel.tsx:45` (`max-lg:…`), `components/app-shell/mobile-nav.tsx` (`lg:hidden`), `components/portfolio/table-of-contents.tsx:52` (`lg:hidden`), `app/globals.css` (a numeric pre-hydration guard near line 290-310 — grep `1023.98`).
- `lib/use-breakpoint.ts` — `useMinWidth(px)`; SSR returns `true`.
- `e2e/deep-link.spec.ts` (109 lines) — throttles CPU via CDP and asserts `[data-highlight="true"]` appears on the targeted section; reuse its setup.
- `e2e/case-studies.spec.ts:129` region — existing tests that resize the viewport to 1100 to exercise the rail; reuse the resize pattern.

## Commands you will need

| Purpose   | Command                  | Expected on success |
|-----------|--------------------------|---------------------|
| Typecheck | `pnpm typecheck`         | exit 0              |
| Lint      | `pnpm lint`              | exit 0              |
| E2E (these suites) | `pnpm test:e2e -- e2e/deep-link.spec.ts e2e/home.spec.ts` | `0 failed` |
| E2E (all) | `pnpm test:e2e`          | `0 failed`          |

## Scope

**In scope**:
- `components/portfolio/deep-link-highlight.tsx`
- `components/app-shell/contextual-rail.tsx` (export the constant; fix the docstring)
- `components/app-shell/app-shell.tsx` (import the constant)
- `e2e/deep-link.spec.ts`, `e2e/home.spec.ts` (one new test each)

**Out of scope**:
- Changing the breakpoint value or any Tailwind class — this plan makes the existing agreement checkable, it does not move it.
- `lib/use-breakpoint.ts` — correct as is.
- `app/globals.css` — the numeric guard is part of the "must agree" set; listing it in the docstring is in scope, editing it is not.

## Git workflow

- Branch: `plan-025`
- One commit per step, imperative sentence, no prefix.
- Do NOT push or open a PR unless the operator instructed it.

## Steps

### Step 1: Track the highlighted element, not just the timer

In `deep-link-highlight.tsx` replace the effect body so that:
- `let highlighted: HTMLElement | null = null;` sits beside `timeout`.
- A `const clear = () => { if (timeout) clearTimeout(timeout); timeout = undefined; highlighted?.removeAttribute("data-highlight"); highlighted = null; };` helper exists.
- `reveal()` calls `clear()` **before** setting the new attribute, then sets `highlighted = target`, then schedules `timeout = setTimeout(clear, HIGHLIGHT_MS)`.
- The effect cleanup calls `clear()` (plus the existing `cancelAnimationFrame` and listener removal).
- Update the comment block (`:64-69`) to say: a new reveal clears the previous target's highlight immediately rather than letting two sections glow, and route changes clear it too.

**Verify**: `pnpm typecheck && pnpm lint` → exit 0.

### Step 2: e2e — two reveals leave exactly one highlight, and none after navigation

In `e2e/deep-link.spec.ts` add:
- Go to `/work/offboard#context`; wait for `#context[data-highlight="true"]`; within 500ms run `page.evaluate(() => { location.hash = "#system"; })`; wait 1,700ms; assert `page.locator('[data-highlight="true"]')` count is **0** (both expired) — then repeat the sequence and assert at ~800ms after the second hash that the count is exactly **1** and it is `#system`.
- Go to `/work/offboard#context`, immediately click the nav link to `/about` (or `page.goto("/about")`), then `page.goBack()`, wait 1,700ms, assert `[data-highlight="true"]` count is 0.

**Verify**: `pnpm test:e2e -- e2e/deep-link.spec.ts` → `0 failed`. Then `git stash` the Step 1 change and re-run only the first new test: it must **fail** (count 1 or 2 instead of 0 / wrong element). `git stash pop`.

### Step 3: One constant for the rail breakpoint

In `contextual-rail.tsx` change `const RAIL_BREAKPOINT_PX = 1024;` to `export const RAIL_BREAKPOINT_PX = 1024;` and rewrite the docstring above it to list every site that must agree (the CSS list from "Current state", including `app/globals.css`'s numeric guard — grep for its exact line and cite it). In `app-shell.tsx` import it and replace `useMinWidth(1024)` with `useMinWidth(RAIL_BREAKPOINT_PX)`.

**Verify**: `grep -rn "useMinWidth(1024)" components app` → no output. `grep -n "export const RAIL_BREAKPOINT_PX" components/app-shell/contextual-rail.tsx` → 1. `pnpm typecheck` → exit 0.

### Step 4: e2e — the Ask panel exists exactly once on both sides of the boundary

In `e2e/home.spec.ts` (desktop project only — mirror how existing tests in that file skip the mobile project), add one test that for each of `1023` and `1025`:
- `page.setViewportSize({ width, height: 900 })`, `page.goto("/")`
- `const panel = page.locator("#ask-ai-louie")`; `await expect(panel).toHaveCount(1)`; `await panel.scrollIntoViewIfNeeded()`; `await expect(panel).toBeVisible()`
- at 1025 additionally assert `page.locator('[data-slot="resizable-handle"][aria-label="Resize context panel"]')` is visible (the pane exists); at 1023 assert it has count 0 (stacked).

**Verify**: `pnpm test:e2e -- e2e/home.spec.ts` → `0 failed`.

### Step 5: Full gate

**Verify**: `pnpm typecheck && pnpm lint && pnpm test && pnpm build` → exit 0; `pnpm test:e2e` → `0 failed`.

## Test plan

- Step 2: two-reveal and navigate-away highlight tests (deep-link.spec.ts), proved non-vacuous by the stash check.
- Step 4: boundary test at 1023/1025 (home.spec.ts).

## Done criteria

- [ ] `grep -n "highlighted" components/portfolio/deep-link-highlight.tsx` → ≥ 3 matches
- [ ] `grep -rn "useMinWidth(1024)" components app` → no output
- [ ] `pnpm test:e2e` → `0 failed`; deep-link.spec.ts +2 tests, home.spec.ts +1 test
- [ ] Stash check performed and recorded
- [ ] No files outside the in-scope list modified
- [ ] `plans/README.md` status row updated

## STOP conditions

- The 1023/1025 test fails at `50e98a4` before any change — that would mean the boundary is already broken; report the measured behaviour, do not adjust the numbers.
- The deep-link test is flaky under `fullyParallel` — the existing suite throttles CPU via CDP for this reason; use the same setup, and if it still flakes, report rather than adding retries.

## Maintenance notes

- Anyone changing `--breakpoint-lg` or `RAIL_BREAKPOINT_PX` must change both, and Step 4's test is what will catch a miss.
- `data-highlight` styling lives in `app/globals.css`; unchanged here.
