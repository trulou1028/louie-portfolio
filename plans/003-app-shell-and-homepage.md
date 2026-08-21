# Plan 003: Build the responsive app shell and static homepage

> **Executor instructions**: Follow this plan step by step. Run every
> verification command and confirm the expected result before moving to the
> next step. If anything in the "STOP conditions" section occurs, stop and
> report — do not improvise. When done, update the status row for this plan
> in `plans/README.md`.
>
> **Drift check (run first)**: Confirm Plans 001–002 landed: `components/system/surface.tsx`
> exists, `/design-system` renders, `pnpm build` exits 0. On mismatch, STOP.

## Status

- **Priority**: P1
- **Effort**: L
- **Risk**: MED (layout is the hardest thing to retrofit)
- **Depends on**: plans/002-design-system-primitives.md
- **Category**: direction (Phase 2 of the spec's build sequence)
- **Planned at**: post-002 (record starting SHA in first commit), 2026-08-21

## Why this matters

The shell is the product's skeleton: left rail, main canvas, contextual right
rail, and the mobile layout that is explicitly NOT a shrunken dashboard (spec
§10, §25). The homepage is the first-impression surface with the 10-second
recruiter test (spec §1). Both must exist before case studies and AI mode
have anywhere to live. The AI entry point ships here as a **static visual
surface** — real chat arrives in Plan 006.

## Current state

- Plans 001–002 delivered tokens, fonts, wrapped primitives (`Surface`,
  `NavItem`, `Action`, `PromptChip`, `SectionLabel`, etc.), route stubs, and
  `content/profile.ts`.
- **Read spec §10 (application shell), §11 (homepage, incl. required copy),
  §25 (responsive behavior), §24 (motion) in full before starting.**
- All hero/section copy is specified verbatim in spec §11 — use it exactly;
  where §11 says wording is pending approval, insert a `TODO(content)`.
- Navigation items and rail contents: spec §10 "Left rail" list.
- Component homes (spec §4): `components/app-shell/desktop-shell.tsx`,
  `mobile-shell.tsx`, `left-rail.tsx`, `contextual-rail.tsx`, `mobile-nav.tsx`;
  homepage sections in `components/portfolio/` (e.g. `work-card.tsx`).

Layout constants (spec §10):
- Left rail 220–240px, persistent ≥1024px
- Main canvas readable max-width 760–900px
- Right rail 300–340px, optional per page, hidden when empty
- ≥1440px: add breathing room, don't stretch the center column
- 768–1023px (tablet): no right rail; compact nav
- <768px (mobile): compact top header + drawer/sheet nav, single column

## Commands you will need

| Purpose   | Command          | Expected on success |
|-----------|------------------|---------------------|
| Typecheck | `pnpm typecheck` | exit 0              |
| Lint      | `pnpm lint`      | exit 0              |
| Build     | `pnpm build`     | exit 0              |
| Dev       | `pnpm dev`       | localhost:3000      |

## Scope

**In scope**:
- `components/app-shell/*` (all five files from spec §4)
- `app/layout.tsx` (mount the shell), `app/page.tsx` (homepage)
- `components/portfolio/work-card.tsx`, `experiment-card.tsx` (card shells)
- `components/ai/ai-louie-thread.tsx` as a STATIC placeholder surface only
- `content/profile.ts` (fill from spec §11 copy where specified)

**Out of scope** (do NOT touch):
- `/api/chat`, `lib/ai/*` — no AI logic in this plan
- Case-study pages beyond their existing stubs
- `components/ui/*` internals
- Voice affordances — spec §11: "do not ship fake controls"

## Git workflow

- Branch `advisor/003-shell-homepage`; commit per section (shell, hero, work,
  experiments, profile, mobile). Do not push unless instructed.

## Steps

### Step 1: Desktop shell

`desktop-shell.tsx`: CSS grid `[left-rail] [canvas] [right-rail?]`. Left rail
(`left-rail.tsx`): name, role line, `NavItem` list (Home, Work, AI Systems,
Experiments, Writing, About, Resume — spec §10), availability `StatusDot`,
LinkedIn + email links (`TODO(content)` for the actual URLs — do not invent).
Right rail (`contextual-rail.tsx`): accepts children; renders nothing (and
collapses its grid column) when childless. Landmarks: `<nav aria-label="Primary">`,
`<main>`, `<aside aria-label="Context">` (spec §26).

**Verify**: `pnpm dev` → rail + canvas render on `/`; `pnpm typecheck` exit 0.

### Step 2: Mobile + tablet shell

`mobile-shell.tsx` + `mobile-nav.tsx`: compact top header (name + menu
button) opening a shadcn `Sheet` with the nav list; single-column content.
Choose ONE responsive strategy: render both shells and gate with Tailwind
breakpoints (`lg:`), or one shell component with responsive classes — prefer
the latter to avoid duplicated nav state. Tablet: hide right rail below
1024px; keep left rail visible 1024–1439px per spec §25. Touch targets ≥44px
in the sheet (spec §26).

**Verify**: `pnpm dev`, resize to 375px, 768px, 1280px, 1440px → matches the
spec §25 matrix at each width; sheet opens/closes with keyboard (Esc closes).

### Step 3: Homepage hero (spec §11 §1)

Eyebrow `AI PRODUCT DESIGN · SYSTEMS · DESIGN ENGINEERING` (`SectionLabel`),
headline "I design AI products and build them." in Instrument Serif at
`display-xl` (clamped), supporting line in `body-lg`, two `Action`s:
"View selected work" → `/work`, "Ask AI Louie" → scrolls/focuses the AI
surface (anchor link for now). Typography must dominate — no hero
illustration (spec §11).

**Verify**: visual check at 1440px and 375px; headline wraps cleanly; `pnpm build` exit 0.

### Step 4: AI Louie entry surface (static)

`ai-louie-thread.tsx` placeholder: `Surface variant="ai"` panel with header
"Ask AI Louie", supporting line and initial assistant message verbatim from
spec §11 §2, the six `PromptChip`s (labels verbatim), and a composer-styled
input with placeholder "Ask anything about Louie's work...". The input and
chips are **disabled** (`aria-disabled`, tooltip "AI Louie arrives soon") OR
chips navigate to relevant static routes — pick the second so nothing is a
dead control (e.g. "Show me Offboard" → `/work/offboard`). No fetch calls.

**Verify**: chips keyboard-navigate to their routes; no network requests fire
(check browser dev tools network tab).

### Step 5: Selected work, experiments, profile, footer

- Selected work (spec §11 §3): two `WorkCard`s with the verbatim Offboard and
  Flexi titles + tag lists; image slots use a neutral placeholder frame with
  `TODO(asset)` comment (never fake screenshots).
- Experiments (spec §11 §4): four `ExperimentCard`s for the four listed
  categories, marked `status: "exploration"`, linking to `/experiments`.
- Louie in brief (spec §11 §5): profile panel fed from `content/profile.ts`;
  bullet points only where the spec states them; unverified claims get
  `TODO(content)`.
- Footer (spec §11 §6): Resume, LinkedIn, Email, copyright.

**Verify**: `pnpm build` exit 0; every link resolves to an existing route
(click through all of them in dev).

### Step 6: Motion + QA

Entry transitions only where they explain state (spec §24): e.g. content fade
+ 4px rise on route change at `--duration-standard`, staggered card reveal on
first paint. Respect `prefers-reduced-motion` (the global rule from Plan 002).
Run the spec §38 visual bar; fix failures.

**Verify**: `pnpm typecheck && pnpm lint && pnpm build` all exit 0; no
hydration warnings in dev server output when loading `/`.

## Test plan

- Add Playwright now (it pays off in every later plan): `pnpm add -D @playwright/test`,
  `pnpm exec playwright install chromium`.
- `e2e/home.spec.ts`: (1) `/` renders headline text exactly; (2) primary nav
  links navigate to all 7 routes with 200s; (3) at 375×812 viewport the sheet
  nav opens and navigates; (4) prompt chips are focusable via Tab.
- Script: `"test:e2e": "playwright test"`.

**Verification**: `pnpm test:e2e` → all pass.

## Done criteria

- [ ] Shell matches spec §25 at 375 / 768 / 1280 / 1440+ widths
- [ ] All homepage copy from spec §11 appears verbatim; pending copy is `TODO(content)`, nothing invented
- [ ] No dead/fake controls (every visible control does something real)
- [ ] Landmarks (`nav`/`main`/`aside`), `aria-current` nav state, Esc-closable sheet
- [ ] `pnpm typecheck && pnpm lint && pnpm build && pnpm test:e2e` all pass
- [ ] `git status` clean; `plans/README.md` row updated

## STOP conditions

Stop and report back (do not improvise) if:

- Plan 002 components are missing a variant this plan needs.
- You are tempted to add real chat networking — that is Plan 006's scope.
- Profile facts beyond what spec §11 states are needed to make a section look
  complete — leave TODOs instead (spec §29: "If content is uncertain, add a
  TODO rather than guessing").
- Playwright cannot run headless in this environment after two attempts
  (fall back: note it, keep the spec file for CI, verify manually).

## Maintenance notes

- The right rail's "render nothing when empty" contract is what Plan 006's
  `set_context_panel` tool relies on — do not give it a permanent default.
- The static AI surface in Step 4 is intentionally throwaway: Plan 006
  replaces its internals but keeps its visual frame. Reviewers should check
  the frame styling lives in the component, not the page.
