# Plan 016: Three small mobile/accessibility fixes

> **Executor instructions**: Follow this plan step by step. Run every
> verification command and confirm the expected result before moving to the
> next step. If anything in the "STOP conditions" section occurs, stop and
> report — do not improvise. When done, update the status row for this plan
> in `plans/README.md` — unless a reviewer dispatched you and told you they
> maintain the index.
>
> **Drift check (run first)**:
> `git diff --stat 2688643..HEAD -- components/app-shell components/ai/ask-panel.tsx components/system/inline-link.tsx`
> If any in-scope file changed since this plan was written, compare the
> "Current state" excerpts against the live code before proceeding; on a
> mismatch, treat it as a STOP condition.

## Status

- **Priority**: P2
- **Effort**: S (steps 1–2) + M (step 3)
- **Risk**: LOW for steps 1–2, MED for step 3 (changes panel layout behavior)
- **Depends on**: plans/015-ask-panel-responsive.md (commit `2688643`)
- **Category**: bug / a11y
- **Planned at**: commit `2688643`, 2026-08-24

## Why this matters

Three independent small defects, bundled because each is a few lines and they
share a verification pass. They are ordered by confidence: steps 1 and 2 are
certain and mechanical; step 3 is a real problem whose fix needs empirical
confirmation, so it is last and has its own escape hatch.

1. **Console error on every page load.** The mobile menu logs a Base UI error
   about button semantics. Verified pre-existing (identical code at `a74e7eb`,
   untouched by plans 014/015) and verified **cosmetic**: the menu opens,
   navigates, and closes correctly, and its items measure 44px tall. It is
   noise that will mask a real error later.
2. **Footer links are below the minimum tap target.** Measured 22px tall;
   WCAG 2.2 AA (2.5.8) requires 24px. Affects Resume, LinkedIn, Email, and
   Book time on every page.
3. **On a phone, the composer ends up below the fold after an answer.**
   Measured at 375×812: after asking "Tell me about Flexi" the panel grew to
   936px tall inside an 812px viewport, putting the text box ~3,216px down
   the page. Asking a follow-up requires scrolling back. On desktop this
   never happens because the panel has a bounded height and the composer is
   pinned by flex layout; below the rail breakpoint the panel is `h-auto` and
   simply grows.

## Current state

### Step 1 — the mobile nav

`components/app-shell/mobile-nav.tsx:52-59`:

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

`components/ui/sheet.tsx:18-20` — a thin passthrough over Base UI:

```tsx
function SheetClose({ ...props }: SheetPrimitive.Close.Props) {
  return <SheetPrimitive.Close data-slot="sheet-close" {...props} />
}
```

`components/app-shell/nav-item.tsx:30-56` renders a **`next/link`** (an
`<a>`), not a `<button>`. Base UI's `Close` defaults `nativeButton` to true,
so it warns that the rendered element is not a native button.

The exact console error:

> Base UI: A component that acts as a button expected a native `<button>`
> because the `nativeButton` prop is true. […] Use a real `<button>` in the
> `render` prop, or set `nativeButton` to `false`.

**These are correctly links, not buttons** — they navigate to a URL, and must
stay middle-clickable, copyable, and openable in a new tab. Do **not**
convert them to buttons. Declaring `nativeButton={false}` is telling Base UI
the truth about the rendered element.

There is no existing `nativeButton` usage in the repo (`grep -rn
"nativeButton" components app` → no matches), so there is no precedent to
match; follow the Base UI API.

### Step 2 — the footer

`components/app-shell/site-footer.tsx:13-30`:

```tsx
<footer className="border-t border-border-subtle">
  <div className="mx-auto flex w-full max-w-[1240px] flex-wrap items-center gap-x-6 gap-y-3 px-6 py-8 text-body-sm text-foreground-muted sm:px-8">
    <InlineLink href="/resume">Resume</InlineLink>
    {links.linkedin ? (<InlineLink href={links.linkedin}>LinkedIn</InlineLink>) : null}
    {links.email ? (<InlineLink href={`mailto:${links.email}`}>Email</InlineLink>) : null}
    {links.calendly ? (<InlineLink href={links.calendly}>Book time</InlineLink>) : null}
    <span className="ml-auto">© {year} {profile.name}</span>
  </div>
</footer>
```

`components/system/inline-link.tsx` is the shared prose-link component:

```tsx
const classes = cn(
  "font-medium text-accent underline-offset-4 hover:underline focus-ring rounded-xs",
  "transition-colors duration-(--duration-instant) hover:text-accent-hover",
  className,
);
```

**Do NOT add padding inside `InlineLink`.** It is used inline in prose
throughout the case studies; vertical padding there would disturb line boxes
and change body copy. Add the padding at the footer's call sites instead.

This works cleanly because the footer's container is `flex flex-wrap
items-center`, so each link is a **flex item** and is blockified — vertical
padding affects its box normally rather than only its hit area.

### Step 3 — the mobile composer

`components/ai/ask-panel.tsx:28-40` — the panel's height behavior:

```tsx
<div
  id="ask-ai-louie"
  className={cn(
    "flex h-full min-h-0 flex-col gap-4 bg-accent-soft/40 p-5",
    "scroll-mt-8 lg:border-l lg:border-border-subtle",
    // Below lg there is no pane: it sits in the page flow, so it reads as
    // a card again and takes its natural height.
    "max-lg:h-auto max-lg:rounded-panel max-lg:border max-lg:border-accent-muted/70",
  )}
>
```

`max-lg:h-auto` is the cause: with no bounded height the panel grows to fit
the whole conversation, so the pinned composer is pushed down the page.

`components/ai/ai-louie-live.tsx:150-160` — the machinery that already
solves this on desktop is present and needs only a bounded height to work:

```tsx
<ThreadPrimitive.Root className="flex min-h-0 flex-1 flex-col gap-4">
  <ThreadPrimitive.Viewport
    autoScroll
    className="flex min-h-0 flex-1 flex-col gap-5 overflow-y-auto"
  >
```

The viewport is already `flex-1 min-h-0 overflow-y-auto`, and the composer
already sits in a `shrink-0` footer below it. Give the panel a bounded height
below `lg` and the existing layout pins the composer and scrolls the
transcript, exactly as on desktop.

## Commands you will need

| Purpose   | Command            | Expected on success |
|-----------|--------------------|---------------------|
| Install   | `pnpm install`     | exit 0 |
| Typecheck | `pnpm typecheck`   | exit 0 |
| Lint      | `pnpm lint`        | exit 0 |
| Unit      | `pnpm test`        | all pass |
| E2E       | `pnpm test:e2e`    | all pass |
| Build     | `pnpm build`       | exit 0 |

**Important about previewing**: `pnpm test:e2e` runs against a **production
build** (`playwright.config.ts:35` → `pnpm build && pnpm start`). The AI
panel's lazy runtime is gated on `IntersectionObserver`; if you drive a
browser manually, prefer `pnpm build && pnpm start` over `pnpm dev` — the dev
server was observed getting stuck on the panel's loading skeleton. Also note
that **`IntersectionObserver` callbacks do not fire under some browser
automation**, which makes the lazy panel look permanently stuck when it is
not. If your manual probe shows the panel never loading, verify with a
control (`new IntersectionObserver(cb).observe(document.body)`) before
concluding anything, and trust `pnpm test:e2e` over the probe.

## Scope

**In scope**:
- `components/app-shell/mobile-nav.tsx` (step 1)
- `components/app-shell/site-footer.tsx` (step 2)
- `components/ai/ask-panel.tsx` (step 3)
- `e2e/accessibility.spec.ts` or `e2e/home.spec.ts` (new assertions)
- `e2e/ai-louie.spec.ts` (step 3 assertion)

**Out of scope**:
- `components/system/inline-link.tsx` — shared by prose across the site; see
  the warning in Step 2's current state.
- `components/ui/sheet.tsx` — the passthrough is fine; fix at the call site
  so other `SheetClose` users (which may legitimately be buttons) are
  unaffected.
- `components/app-shell/nav-item.tsx` — the items are correctly links.
- `components/ai/ai-louie-live.tsx` — its flex layout is already correct and
  is what makes step 3 work; changing it is not needed.
- Anything to do with the rail breakpoint — plan 015 settled that; all five
  encodings are on `lg`/1024 and must stay in sync.

## Git workflow

- Branch off `plan-015`'s tip `2688643`: `git switch -c plan-016 2688643`.
- Commit per step (three commits), message style matches `git log`.
- Do NOT push or open a PR.

## Steps

### Step 1: Tell Base UI the nav items are links, not buttons

In `components/app-shell/mobile-nav.tsx`, add `nativeButton={false}` to the
`SheetClose` inside the `NAV_ITEMS.map`. Add a brief comment in the repo's
voice explaining why (the rendered element is a `next/link`, and these must
stay real links).

Do not change `SheetClose` itself, and do not change what `NavItem` renders.

**Verify**:
- `pnpm typecheck` → exit 0, `pnpm lint` → exit 0
- Load the site (production build, see the note above) at a mobile viewport,
  open the menu, and confirm **zero** console errors mentioning
  `nativeButton`. Report the console output you observed.
- Confirm behavior is unchanged: tapping a nav item navigates AND closes the
  menu. (Baseline, measured before this change: it already did both, and the
  items measured 44px tall.)

### Step 2: Bring the footer links to at least 24px

In `components/app-shell/site-footer.tsx`, give each footer `InlineLink` a
`className` that guarantees a minimum 24px box — e.g. `py-1` on each, or a
shared local constant applied to all four. Keep the `gap-y-3` wrapping
behavior intact.

Do not touch `InlineLink` itself.

**Verify**:
- `pnpm typecheck` → exit 0, `pnpm lint` → exit 0
- At 375×812, every footer link measures **at least 24px** tall:

  ```js
  [...document.querySelectorAll('footer a')].map(a => ({
    t: a.textContent.trim().slice(0,12),
    h: Math.round(a.getBoundingClientRect().height)
  }))
  ```

  Every `h` must be ≥ 24. Report the actual array.
- The footer still lays out on one row at 1440px (no unintended wrapping).

### Step 3: Keep the composer on screen after an answer

Give the panel a bounded height below `lg` so the existing flex layout pins
the composer and scrolls the transcript — the same behavior desktop already
has.

In `components/ai/ask-panel.tsx`, replace `max-lg:h-auto` with a bounded
height. Recommended starting point:

```
max-lg:max-h-[80svh]
```

`svh` (small viewport height) is deliberate: on mobile browsers `vh` ignores
the collapsing address bar and overshoots. Keep `max-h` rather than `h` so a
short, empty panel stays compact instead of always reserving 80% of the
screen.

This may require the panel to also be a bounded flex container for the inner
`flex-1 min-h-0` viewport to scroll rather than overflow. If a plain
`max-h-*` does not produce inner scrolling, try `max-lg:h-[80svh]` on a
conversation-started state, or bound `AiLouieThread`'s wrapper instead.
**Choose whichever produces the verified behavior below, and report exactly
what you used and why.**

**Verify** — all four must hold at 375×812, on a production build, after
sending a question that produces a multi-paragraph answer:
1. The composer (`#ask-ai-louie textarea`) is within the viewport
   (`rect.top < innerHeight && rect.bottom > 0`).
2. The transcript scrolls **inside** the panel:
   `viewport.scrollHeight > viewport.clientHeight + 4` where `viewport` is
   `#ask-ai-louie [class*="overflow-y-auto"]`.
3. With **no** conversation started, the panel is still compact — under
   600px tall (baseline: 535px). It must not reserve 80% of the screen while
   empty.
4. At 1440×900 the desktop rail is visually and behaviorally unchanged.

Report the measured numbers for all four. If you cannot make 1 and 3 both
true after two attempts, STOP and report what you tried and the numbers you
got — an alternative is a sticky composer, which is a design decision the
owner should make rather than something to improvise.

### Step 4: Lock the fixes in with tests

Add assertions so these do not regress:
- Footer tap targets ≥24px at a mobile viewport (put it in
  `e2e/accessibility.spec.ts` if that file exists, matching its existing
  style; otherwise `e2e/home.spec.ts`).
- The composer stays in the viewport after an answer, at a mobile viewport,
  in `e2e/ai-louie.spec.ts`. Mock `/api/chat` the way that file's existing
  tests do — do **not** call a real provider — and make the mocked answer
  long enough to overflow the panel.

For the console error there is no natural assertion; skip it rather than
inventing a brittle one, and say so in your report.

**Verify**: `pnpm test:e2e` → all pass including the new tests.
`pnpm build` → exit 0.

## Test plan

- New e2e: footer tap-target heights; composer-in-viewport after a mocked
  answer. Model both on the existing tests in the file you add them to.
- Full gates: `pnpm typecheck && pnpm lint && pnpm test && pnpm test:e2e && pnpm build`.

## Done criteria

ALL must hold:

- [ ] `pnpm typecheck`, `pnpm lint`, `pnpm test`, `pnpm test:e2e`, `pnpm build` all exit 0
- [ ] No console error mentioning `nativeButton` when opening the mobile menu
- [ ] Mobile menu still navigates and closes on tap
- [ ] Every `footer a` measures ≥24px tall at 375×812
- [ ] After an answer at 375×812, the composer is within the viewport and the
      transcript scrolls inside the panel
- [ ] With no conversation, the panel is under 600px tall at 375×812
- [ ] Desktop rail unchanged at 1440×900
- [ ] No files outside the in-scope list modified (`git status`)

## STOP conditions

Stop and report back (do not improvise) if:

- `nativeButton={false}` changes the menu's behavior in any way (it should be
  purely a semantics declaration).
- Adding footer padding causes the footer to wrap at desktop widths.
- Step 3's criteria 1 and 3 cannot both be satisfied after two attempts.
- Step 3's change affects the desktop rail in any visible way — the desktop
  path must be untouched.
- Any existing e2e test fails. These are three small fixes; a failure means
  something broader is wrong.

## Maintenance notes

- Step 1 is the first `nativeButton` usage in the repo. If more Base UI
  components get `render` props pointing at links, the same declaration will
  be needed; a reviewer should watch for the same warning elsewhere.
- Step 3's `svh` unit has no effect on desktop and is safe, but it is
  relatively modern CSS — if the site ever needs to support much older
  mobile browsers, add a `vh` fallback.
- The AI panel's lazy load is gated on `IntersectionObserver`, which does not
  fire under some browser automation. Any future manual verification of that
  panel should run a control observer first, and treat `pnpm test:e2e`
  (production build, both desktop and mobile projects) as the source of
  truth. 22 `ai-louie` tests pass across both projects at `2688643`.
