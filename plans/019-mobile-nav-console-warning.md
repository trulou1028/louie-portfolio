# Plan 019: Silence the mobile-nav Base UI warning without breaking link semantics

> **Executor instructions**: Follow this plan step by step. Run every
> verification command and confirm the expected result before moving to the
> next step. If anything in the "STOP conditions" section occurs, stop and
> report — do not improvise. When done, update the status row for this plan
> in `plans/README.md` — unless a reviewer dispatched you and told you they
> maintain the index.
>
> **Base**: branch from `main` at commit `8441fdc`.
>
> **Drift check (run first)**:
> `git diff --stat 8441fdc..HEAD -- components/app-shell components/ui/sheet.tsx e2e/home.spec.ts`
> Expect no output. Anything else is a STOP condition.

## Status

- **Priority**: P3
- **Effort**: S
- **Risk**: MED — the change is small, but it touches navigation that every
  mobile visitor uses, and the obvious fix is known to be wrong (see below)
- **Depends on**: none (plans 014–018 all merged)
- **Category**: bug / a11y
- **Planned at**: commit `8441fdc`, 2026-08-25

## Why this matters

Every page load below `lg` logs a Base UI error to the console:

> Base UI: A component that acts as a button expected a native `<button>`
> because the `nativeButton` prop is true. Rendering a non-`<button>` removes
> native button semantics, which can impact forms and accessibility. Use a real
> `<button>` in the `render` prop, or set `nativeButton` to `false`.

The menu itself works correctly — it opens, navigates, closes, and its items
measure 44px. The cost is noise: a console that always has a red error in it is
a console nobody reads, so the next real error hides in plain sight.

**The fix the warning suggests is wrong.** Plan 016 tried
`nativeButton={false}` and the executor caught it. Base UI's own source
(`internals/use-button/useButton.js`, around line 183) reads:

```js
}, isNativeButton ? {
  type: 'button'
} : {
  role: 'button'
}, focusableWhenDisabledProps, otherExternalProps);
```

So `nativeButton={false}` **adds `role="button"`** to the rendered `<a href>`.
A Playwright accessibility snapshot then showed the nav items exposed as
`button "Home"`, `button "Work"`, and so on, and two pre-existing tests in
`e2e/home.spec.ts` that query them via `getByRole("link")` failed consistently.
That trade — misreporting links as buttons to screen readers, to silence a
cosmetic console message — is strictly worse than the warning. **Do not take
it.** This is recorded in `plans/README.md` under the plan 016 entry.

The nav items are genuinely links: they navigate to a URL and must stay
middle-clickable, copyable, and openable in a new tab.

## Current state

`components/app-shell/mobile-nav.tsx` — the whole component is uncontrolled,
and the comment says so explicitly (lines 33–34):

```tsx
      {/* Uncontrolled: each SheetClose below dismisses the drawer on
          navigation, so no open-state effect is needed. */}
      <Sheet>
        <SheetTrigger
          className="focus-ring inline-flex size-11 items-center justify-center rounded-sm text-foreground-muted transition-colors duration-(--duration-fast) hover:bg-surface-muted hover:text-foreground"
          aria-label="Open navigation menu"
        >
          <Menu aria-hidden="true" className="size-5" />
        </SheetTrigger>
```

The offending block is lines 51–60:

```tsx
          <nav aria-label="Primary" className="flex flex-col gap-0.5 px-3">
            {NAV_ITEMS.map((item) => (
              <SheetClose
                key={item.href}
                render={
                  <NavItem href={item.href} label={item.label} size="sheet" />
                }
              />
            ))}
          </nav>
```

`components/ui/sheet.tsx` is a thin passthrough over Base UI's `Dialog`
(line 4: `import { Dialog as SheetPrimitive } from "@base-ui/react/dialog"`).
`SheetClose` at lines 18–20:

```tsx
function SheetClose({ ...props }: SheetPrimitive.Close.Props) {
  return <SheetPrimitive.Close data-slot="sheet-close" {...props} />
}
```

`Sheet` at lines 10–12 spreads all props into `SheetPrimitive.Root`, and Base
UI's `Dialog.Root` accepts `open`, `onOpenChange`, and `defaultOpen` (verified
in `dialog/root/DialogRoot.d.ts`). **So controlling the sheet needs no change
to `sheet.tsx`** — pass the props through the existing `Sheet` component.

`components/app-shell/nav-item.tsx` renders a `next/link` (an `<a>`). It
accepts `React.ComponentPropsWithoutRef<typeof Link>`, so it already forwards
`onClick`. Leave it alone.

`mobile-nav.tsx` is currently a **server component** — it has no `"use client"`
directive. Adding React state makes it a client component. That is acceptable
(it is small, below-`lg` only, and already ships Base UI's dialog to the
client), but it must be a deliberate, stated change, not an accident.

### The tests that already pin this behavior

`e2e/home.spec.ts` — do not modify these; they are the regression guard:

- line 260–261: `nav.getByRole("link").first()` and
  `nav.getByRole("link").allTextContents()`
- line 296: `page.getByRole("dialog").getByRole("link", { name: "Work" }).click()`

They passed on baseline and failed under `nativeButton={false}`. **They must
keep passing, unmodified.** If a change requires editing them, the change is
wrong.

## Commands you will need

| Purpose   | Command            | Expected on success |
|-----------|--------------------|---------------------|
| Install   | `pnpm install`     | exit 0 |
| Typecheck | `pnpm typecheck`   | exit 0 |
| Lint      | `pnpm lint`        | exit 0 |
| Unit      | `pnpm test`        | 66 pass |
| E2E       | `pnpm test:e2e`    | 172 passed / 8 skipped / 0 failed at baseline |
| Build     | `pnpm build`       | exit 0 |

**Browser note**: use a production build (`pnpm build && pnpm start --port
3106` or higher). Reproduce the warning at a mobile viewport before changing
anything, so you can prove it is gone afterwards rather than assuming.

## Scope

**In scope**:
- `components/app-shell/mobile-nav.tsx`
- `e2e/home.spec.ts` — **only** to add a new console-error assertion. Do not
  touch the three existing link-role assertions listed above.

**Out of scope**:
- `components/ui/sheet.tsx` — the passthrough is correct, and other
  `SheetClose` consumers may legitimately be buttons. Fix at the call site.
- `components/app-shell/nav-item.tsx` — the items are correctly links.
- `nativeButton` in any form. See "Why this matters".
- The desktop `left-rail.tsx` — it does not use `SheetClose`.

## Git workflow

- Branch `plan-019`, created from `8441fdc`.
- One or two commits; message style matches `git log` (short imperative).
- Do NOT push. A push to `main` is a production deploy on this project.

## Steps

### Step 1: Reproduce the warning and capture the baseline

Build, serve, and load the site at a 375px viewport. Open the drawer. Record
the exact console error text and its count.

Then confirm the menu currently works, so you can tell a regression from a
pre-existing condition: tapping a nav item navigates **and** closes the drawer.

**Verify**: report the console error text verbatim, and confirm both
behaviors. If the warning does **not** appear, STOP — something has changed
since this plan was written.

### Step 2: Make the sheet controlled and close it on navigation

Replace the `SheetClose` wrapper with explicit open state.

- Add `"use client"` at the top of `mobile-nav.tsx`, and state the reason in
  the doc comment: the drawer now owns its open state so nav items can stay
  real links.
- Hold `const [open, setOpen] = React.useState(false)` and pass
  `open={open} onOpenChange={setOpen}` to `<Sheet>`.
- Render each `NavItem` directly inside the `<nav>` — no `SheetClose` wrapper —
  with `onClick={() => setOpen(false)}`.
- Remove the now-inaccurate "Uncontrolled:" comment (lines 33–34) and replace
  it with one describing the new arrangement and **why**: `SheetClose` applies
  button semantics to whatever it renders, and these must remain links.
- Remove `SheetClose` from the import list in `mobile-nav.tsx` if nothing else
  in the file uses it.

Do not add `nativeButton` anywhere.

**Verify**:
- `pnpm typecheck` → exit 0, `pnpm lint` → exit 0
- `grep -n "SheetClose\|nativeButton" components/app-shell/mobile-nav.tsx` →
  no matches
- Rebuild, load at 375px, open the drawer: the console error from Step 1 is
  **gone**, and no new error replaces it. Report the console output.
- Tap a nav item: it navigates **and** the drawer closes. Both, not one.

### Step 3: Confirm the semantics did not regress

This is the check that the previous attempt failed.

Take a Playwright accessibility snapshot of the open drawer, or query the
rendered roles directly, and confirm the nav items are exposed as **links**,
not buttons.

**Verify**:
- The items report as `link`, not `button`. Report what you observed.
- `pnpm test:e2e` → the three existing assertions at `home.spec.ts` lines
  ~260, ~261, and ~296 pass **unmodified**. If any fails, STOP.

### Step 4: Add a regression test for the console

Add one test to `e2e/home.spec.ts` that loads the homepage at a mobile
viewport, opens the drawer, and asserts **no console errors** were emitted.

Collect them with `page.on("console", …)` filtered to `msg.type() === "error"`,
registered before `page.goto`. Assert the collected array is empty, and include
the collected text in the failure message so a future breakage is diagnosable
rather than just red.

Guard it to the mobile project with
`test.skip(testInfo.project.name !== "mobile", "mobile only")`, matching the
pattern used by the existing mobile-only tests in `e2e/ai-louie.spec.ts` and
`e2e/accessibility.spec.ts`.

If unrelated console errors already exist on that page (they should not — check
during Step 1), do **not** loosen the assertion to make it pass. Report them
and stop; a test that ignores some errors is not a guard.

**Verify**: `pnpm test:e2e` → all pass, including the new test (expect
174 passed / 8 skipped, or 173/9 depending on how the skip lands). `pnpm build`
→ exit 0.

## Test plan

- New: no-console-errors on the mobile homepage with the drawer open.
- Unchanged and must still pass: the three link-role assertions in
  `home.spec.ts`, and the full 172-test baseline.
- Full gates: `pnpm typecheck && pnpm lint && pnpm test && pnpm test:e2e && pnpm build`.

## Done criteria

ALL must hold:

- [ ] `pnpm typecheck`, `pnpm lint`, `pnpm test`, `pnpm test:e2e`, `pnpm build` all exit 0
- [ ] `grep -rn "nativeButton" components app` → no matches
- [ ] `grep -n "SheetClose" components/app-shell/mobile-nav.tsx` → no matches
- [ ] The Base UI console error no longer appears at a mobile viewport
- [ ] Mobile nav items are exposed as links, not buttons
- [ ] Tapping a nav item navigates and closes the drawer
- [ ] `e2e/home.spec.ts`'s three existing link-role assertions are unmodified
      (`git diff` shows only the added test)
- [ ] No files outside the in-scope list modified (`git status`)

## STOP conditions

Stop and report back (do not improvise) if:

- The warning does not reproduce in Step 1.
- Any of the three existing link-role assertions fails.
- The drawer stops closing on navigation, or stops opening.
- Silencing the warning appears to require `nativeButton`, editing
  `sheet.tsx`, or changing what `NavItem` renders.
- Unrelated console errors exist on the mobile homepage, making Step 4's
  assertion impossible to write honestly.
- Making `mobile-nav.tsx` a client component breaks the build or produces a
  hydration warning — report the exact message rather than patching around it.

## Maintenance notes

- The lesson worth keeping: Base UI's `nativeButton={false}` does not mean
  "this is not a button, stop warning." It means "polyfill button behavior on
  this non-button element," which includes `role="button"`. Any future
  `SheetClose`/`Dialog.Close` wrapping a link hits the same trap.
- After this lands, `SheetClose` has no consumers in the app. Leave it in
  `components/ui/sheet.tsx` — it is vendor-shaped shadcn code and a future
  sheet may legitimately want a real close button.
- A reviewer should check the accessibility snapshot in Step 3 specifically,
  not just that the tests pass. The previous attempt passed typecheck and lint
  while breaking screen-reader semantics.
