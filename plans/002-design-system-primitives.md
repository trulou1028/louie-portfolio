# Plan 002: Build the design-system primitives and internal review page

> **Executor instructions**: Follow this plan step by step. Run every
> verification command and confirm the expected result before moving to the
> next step. If anything in the "STOP conditions" section occurs, stop and
> report — do not improvise. When done, update the status row for this plan
> in `plans/README.md`.
>
> **Drift check (run first)**: `git log --oneline` must show Plan 001's
> commits. Confirm `components/ui/` exists, globals CSS contains `--canvas`
> and `--accent`, and `pnpm build` exits 0 before starting. On mismatch, STOP.

## Status

- **Priority**: P1
- **Effort**: M
- **Risk**: LOW
- **Depends on**: plans/001-project-scaffold.md
- **Category**: direction (Phase 1 of the spec's build sequence)
- **Planned at**: post-001 (record the SHA you start from in your first commit message), 2026-08-21

## Why this matters

The spec's visual bar is "authored, not generated from default shadcn
components" (§5) and its shadcn rule is "infrastructure, not visual identity"
(§33). This plan creates the small vocabulary of wrapped primitives every
subsequent page is composed from. If pages are built before these exist,
default-shadcn styling leaks everywhere and must be unwound later.

## Current state

- Plan 001 delivered: token layer (spec §6 colors, §8 type scale, §9 radii,
  §24 motion durations) wired into Tailwind; fonts as `--font-serif/sans/mono`;
  stock shadcn components in `components/ui/`; empty `components/system/`,
  `components/portfolio/`, `components/app-shell/` folders.
- **Read spec §5 (design principles), §9 (surfaces), §33 (shadcn rules),
  §34 (component acceptance criteria) before writing any component.**
- Convention (spec §33): `components/ui/*` stays near-upstream; all
  portfolio-specific styling lives in wrappers under `components/system/` and
  `components/portfolio/`.

Components this plan must produce (names from spec §4 and §33–34):

| Component | File | Requirements (spec §34 / §33) |
|---|---|---|
| `Surface` | `components/system/surface.tsx` | variants: `default`, `muted`, `raised`, `interactive`, `ai`. Border-first hierarchy; shadow only on raised/floating; radius tokens. |
| `SectionLabel` | `components/system/section-label.tsx` | mono, 11–12px, letter-spaced uppercase eyebrow (e.g. `FEATURED CASE STUDY`) |
| `SystemLabel` | `components/system/system-label.tsx` | Badge wrapper for `AI SYSTEM`, `TOOL CALL` markers — mono, quiet |
| `StatusDot` | `components/system/status-dot.tsx` | small availability/status indicator, color + text (never color alone, spec §26) |
| `InlineLink` | `components/system/inline-link.tsx` | accent-colored link with visible focus ring |
| `Action` / `InlineAction` | `components/system/action.tsx` | Button wrappers: primary (accent), secondary (border), ghost inline |
| `NavItem` | `components/app-shell/nav-item.tsx` | left-rail item: quiet default, accent active state, `aria-current="page"` |
| `Metric` | `components/portfolio/metric.tsx` | number + caption pair for verified outcomes |
| `PromptChip` | `components/ai/prompt-chip.tsx` | keyboard-operable suggestion chip; wraps cleanly; configurable insert-vs-submit (spec §34) |

## Commands you will need

| Purpose   | Command          | Expected on success |
|-----------|------------------|---------------------|
| Typecheck | `pnpm typecheck` | exit 0              |
| Lint      | `pnpm lint`      | exit 0              |
| Build     | `pnpm build`     | exit 0              |
| Dev       | `pnpm dev`       | localhost:3000      |

## Scope

**In scope** (create/modify):
- `components/system/*`, `components/app-shell/nav-item.tsx`,
  `components/portfolio/metric.tsx`, `components/ai/prompt-chip.tsx`
- `app/design-system/page.tsx` (internal review route)
- Globals CSS only for shared focus-ring / reduced-motion rules

**Out of scope** (do NOT touch):
- `components/ui/*` internals (wrap, never restyle upstream files)
- Page routes other than `/design-system`
- Any AI logic, any content files
- `LOUIE_PORTFOLIO_V2_IMPLEMENTATION_SPEC.md`, `.claude/`

## Git workflow

- Branch off `main`: `advisor/002-design-system` (or commit directly to `main`
  if the operator prefers a linear greenfield history — note the choice in the
  plan's README row). Commit per component group.

## Steps

### Step 1: Surface

Build `Surface` with `class-variance-authority` (already a shadcn dependency)
over a plain `div` (accept `asChild`). Variant mapping:

- `default` → `bg-surface border border-border-subtle`
- `muted` → `bg-surface-muted`, no border or subtle border
- `raised` → `bg-surface-raised border border-border-subtle` + extremely soft shadow (define a `--shadow-soft` token, e.g. `0 1px 2px hsl(35 15% 9% / 0.04), 0 8px 24px hsl(35 15% 9% / 0.05)`)
- `interactive` → default + hover border-strengthen + focus-visible ring, renders on `<a>`/`<button>` via `asChild`
- `ai` → `bg-accent-soft` tint with `border-accent-muted`

Radius prop: `sm | md | lg | panel` mapping to the §9 tokens; default `md`.

**Verify**: `pnpm typecheck` → exit 0.

### Step 2: Typography + label components

`SectionLabel`, `SystemLabel`, `InlineLink`, `StatusDot`, `Metric`. Rules:
mono only for labels ≤ ~2 words (spec §7 "never large paragraphs in mono");
`InlineLink` underline-on-hover with `text-accent`; every interactive element
gets `focus-visible:ring-2 ring-accent` (define one shared utility). Add a
global `@media (prefers-reduced-motion: reduce)` rule that zeroes transition
durations.

**Verify**: `pnpm typecheck && pnpm lint` → exit 0.

### Step 3: Actions, NavItem, PromptChip

- `Action`: wraps shadcn `Button`; variants `primary` (accent bg, white text — check contrast ≥ 4.5:1 against `--accent`), `secondary` (border, canvas bg), `ghost`.
- `NavItem`: `<Link>` with icon slot (lucide, 16px), label, active state driven by `usePathname()`; `aria-current="page"` when active.
- `PromptChip`: `<button>` styled as a quiet pill (border, `bg-surface`, hover `bg-accent-soft`); props `label`, `mode: "insert" | "submit"`, `onSelect`. Must be reachable and activatable by keyboard (native button handles this — do not build a div-button).

**Verify**: `pnpm typecheck && pnpm build` → exit 0.

### Step 4: `/design-system` review page

`app/design-system/page.tsx`: render every component above in all variants,
the full type scale (each named size labeled), the color tokens as swatches
with their names, radius scale, and motion tokens demonstrated on a single
hover card. Add `export const metadata = { robots: { index: false } }` and a
comment `// INTERNAL: remove or protect before launch (spec §35 Phase 1)`.

**Verify**: `pnpm dev`, open `http://localhost:3000/design-system` → all
components render, no console errors or hydration warnings in terminal output.

### Step 5: Visual QA pass

Check against spec §38 "Visual" bar: typography carries the personality;
accent green is restrained (labels, links, active states only — no large
green fills); borders before shadows. Fix what fails. Then commit.

**Verify**: `pnpm build` → exit 0; `git status` → clean.

## Test plan

No unit tests for pure presentation components at this stage; the review page
is the test surface. (Interaction-heavy components get tested via the pages
that use them in later plans.) Gates: typecheck, lint, build, manual review
page inspection.

## Done criteria

- [ ] All 9 components exist at the listed paths and are exported
- [ ] `Surface` supports all 5 variants (spec §34)
- [ ] `PromptChip` works with keyboard and supports insert/submit modes
- [ ] `/design-system` renders everything with `robots: noindex`
- [ ] No raw hex colors, no arbitrary px radii, no `dark:` variants in new code (`grep -rn "#[0-9a-fA-F]\{6\}" components/system components/portfolio components/ai` → no matches)
- [ ] `components/ui/*` files unmodified (`git diff --stat main -- components/ui` empty, or unchanged since 001)
- [ ] `pnpm typecheck && pnpm lint && pnpm build` all exit 0
- [ ] `plans/README.md` status row updated

## STOP conditions

Stop and report back (do not improvise) if:

- Accent-on-white or white-on-accent contrast fails 4.5:1 with the spec §6
  values — flag it; token tuning is allowed by the spec ("exact values can be
  tuned") but the operator should approve the new value.
- A required primitive doesn't exist in the installed shadcn/Base UI set and
  would need a new third-party dependency.
- Plan 001's token names differ from what this plan expects.

## Maintenance notes

- Later plans must import these wrappers, never `components/ui` directly for
  portfolio surfaces. Reviewers: reject raw `<Card>`/`<Badge>` usage in pages.
- `/design-system` must be removed or gated before production launch — this
  is re-checked in Plan 008.
