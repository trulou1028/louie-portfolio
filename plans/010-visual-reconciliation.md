# Plan 010: Reconcile the built homepage with the strategy-session mockup

> **Executor instructions**: Follow this plan step by step. Run every
> verification command and confirm the expected result before moving to the
> next step. If anything in the "STOP conditions" section occurs, stop and
> report — do not improvise. When done, update the status row for this plan
> in `plans/README.md`.
>
> **Drift check (run first)**: `git log --oneline` should show Plans 001–005
> complete. Confirm `pnpm test && pnpm build && pnpm test:e2e` all pass before
> changing anything.

## Status

- **Priority**: P2
- **Effort**: M
- **Risk**: LOW (visual only; no data or AI behavior changes)
- **Depends on**: plans/003-app-shell-and-homepage.md (built), and see
  "Sequencing" — parts of this land naturally with Plans 006 and 007
- **Category**: direction
- **Planned at**: post-005, 2026-08-21

## ⚠️ Read this first: the mockup misstates what Offboard is

The mockup describes Offboard as an **"AI-powered offboarding system for IT
help desks"**, with a system diagram built from HRIS, user and device data, a
task engine, IT systems, and audit logging.

**That is not what Offboard is.** Three independent sources say otherwise:

1. `LOUIE_PORTFOLIO_V2_IMPLEMENTATION_SPEC.md` §11 §3 gives the title
   verbatim: *"Building an AI-native operating system for the job search."*
2. Spec §13.1 describes the problem as job searching fragmented across "jobs,
   company research, contacts, resumes, application materials, interview
   preparation, tasks, and AI conversations."
3. The real Offboard marketing site, observed running locally on
   2026-08-21, bills it as "The Modern Unemployment Office" — helping people
   after a layoff protect their financial runway, find benefits, and plan
   what comes next.

The mockup appears to have inferred the product from its name. **Do not adopt
any Offboard copy, tags ("AI AGENTS"), or the system diagram from the
mockup.** The built case study and evidence index are correct; the mockup is
not. Confirm with Louie before using any product description from it.

Treat every other factual detail in the mockup with the same suspicion — see
"Facts to confirm" below.

## Why this matters

The mockup is a materially better homepage than what is built. It uses the
contextual right rail that spec §10 describes and that Plan 003 built but left
unused, it gives the AI panel the weight of a real product surface rather than
a placeholder, and it makes the left rail feel authored instead of utilitarian.
Adopting its layout closes most of the gap between "correct" and "compelling".

## Current state

Built and working (Plans 001–005):

- `components/app-shell/app-shell.tsx` — responsive shell; the right rail slot
  exists via `Canvas`/`ContextualRail` in
  `components/app-shell/contextual-rail.tsx` and **renders nothing when
  childless**, which is why the homepage currently has no rail.
- `app/page.tsx` — hero, AI panel, selected work, experiments, brief, all
  stacked in a single column.
- `components/app-shell/left-rail.tsx` — name, role, nav, and nothing else,
  because `content/profile.ts` has null contact links and availability.
- `components/app-shell/nav-item.tsx` — supports an `icon` prop already; no
  page passes one.
- `components/ai/ai-louie-thread.tsx` — static preview: opening message, five
  navigating suggestion chips, disabled composer.
- `components/portfolio/evidence-card.tsx` — exists, unused so far.

## Deltas, grouped by when they should land

### A — Do now (visual only, no new capability)

| # | Change | Where |
|---|--------|-------|
| A1 | Homepage uses the right rail: Featured work, Experiments, Louie in brief, closing quote — each with a "View all →" affordance | `app/page.tsx`, `contextual-rail.tsx` |
| A2 | Nav items get lucide icons (Home, Work, AI Systems, Experiments, Writing, About) | `left-rail.tsx`, `mobile-nav.tsx` — `NavItem` already takes `icon` |
| A3 | Hero headline sets "and build them." in **accent italic serif** on its own line | `app/page.tsx` |
| A4 | Left rail gains a pull quote, email + LinkedIn icon links, and a copyright line | `left-rail.tsx` |
| A5 | Availability shows two lines ("Available for new projects" / "Open to full-time roles") | `left-rail.tsx`, `content/profile.ts` |
| A6 | AI panel gets a circular accent avatar and an "AI Louie" status pill | `ai-louie-thread.tsx` |
| A7 | Work cards in the rail show a thumbnail, short description, and category tags | new rail card, or reuse `WorkCard` compact variant |
| A8 | Experiments render as a 4-up icon tile grid | `experiment-card.tsx` (compact variant) |

**A3 note**: the mockup's supporting copy differs from spec §11 §1. Keep the
spec copy unless Louie explicitly approves the mockup's wording — spec §39.15
forbids silently substituting product decisions.

### B — Lands with Plan 006 (needs the real AI layer)

- The generative-UI card inside the assistant message (featured case study +
  system diagram thumbnail + "Explore case study →"). This is exactly spec
  §19's allowlisted component vocabulary; build it as a Tool UI component,
  not as static markup.
- The carousel of suggested starting points beneath that card.
- The right rail becoming context-driven via `set_context_panel` (spec §18
  Tool 5) — the mockup's rail is precisely the `featured-work`, `experiments`,
  and `profile` views.

### C — Lands with Plan 007

- The "Paste a job description" chip, shown outlined in the mockup. Plan 003
  deliberately omitted it because it had no destination; it becomes real when
  the evaluator exists.

### D — Lands with Plan 009, or not at all

- The microphone button, "Press and hold to talk", and the composer's
  attachment and "Deep research" controls.
- **Do not build these as non-functional UI.** Spec §11 is explicit: do not
  ship fake controls. Voice is Plan 009. "Deep research" and attachments are
  not in the spec at all and would need Louie's sign-off as new scope.

## Facts to confirm with Louie before implementing

The mockup contains content that is not in the spec and not otherwise
verified. None of it may ship on his say-so alone being assumed:

- "Based in San Francisco"
- Both pull quotes ("I partner with teams to turn complex workflows into
  intelligent systems people love to use." and "I believe the best AI products
  are invisible…")
- The revised hero supporting paragraph
- Category tags for each project ("AI AGENTS", "EDTECH", "AI TUTOR")
- Whether **Resume** should leave the primary nav — the mockup omits it, but
  spec §10 lists it and spec §28 requires an HTML resume route
- The portrait illustration (`TODO(asset)`)

## Commands you will need

| Purpose    | Command          | Expected on success |
|------------|------------------|---------------------|
| Typecheck  | `pnpm typecheck` | exit 0              |
| Lint       | `pnpm lint`      | exit 0              |
| Unit tests | `pnpm test`      | all pass            |
| Build      | `pnpm build`     | exit 0              |
| E2E        | `pnpm test:e2e`  | all pass            |

## Scope

**In scope**: `app/page.tsx`, `components/app-shell/*`,
`components/portfolio/{work-card,experiment-card}.tsx`,
`components/ai/ai-louie-thread.tsx`, `content/profile.ts`, and the e2e
assertions that depend on homepage structure.

**Out of scope**: `content/work/*.mdx` and `content/evidence/evidence.ts`
(they are correct — the mockup is not), anything in group B/C/D above, and
`components/ui/*`.

## Steps

1. **A2 + A4 + A5 — left rail.** Add icons, pull quote, contact icons,
   copyright, two-line availability. Contact links stay conditional on real
   values existing in `content/profile.ts`.
   **Verify**: `pnpm test:e2e e2e/home.spec.ts` passes; rail renders at ≥1024px.
2. **A3 + A6 — hero and AI panel treatment.** Accent italic serif on the
   second line; avatar and status pill on the panel.
   **Verify**: the existing "renders the positioning copy verbatim" test still
   passes — the copy must not change, only its typography.
3. **A1 + A7 + A8 — the right rail.** Compose the homepage `Canvas` with a
   `ContextualRail` holding featured work, experiments, brief, and the quote.
   **Verify**: rail is absent below `xl` and present above it; no horizontal
   overflow at 375, 768, 1280, 1440.
4. **Regression sweep.**
   **Verify**: `pnpm test && pnpm typecheck && pnpm lint && pnpm build && pnpm test:e2e`.

## Done criteria

- [ ] Homepage shows a contextual right rail at `xl` and above, and none below
- [ ] Nav items carry icons; left rail has quote, contacts, copyright
- [ ] Hero second line is accent italic serif, with spec §11 copy unchanged
- [ ] No microphone, attachment, or "Deep research" control ships
- [ ] No Offboard description from the mockup appears anywhere
- [ ] Unverified mockup copy is either confirmed by Louie or absent
- [ ] All suites pass; `plans/README.md` row updated

## STOP conditions

Stop and report back if:

- Any step would require changing spec §11 copy without Louie's approval.
- The right rail cannot hold the mockup's content without pushing the main
  canvas below the spec §10 readable width of 760–900px.
- You find yourself building a control that does not yet do anything.

## Maintenance notes

- Once Plan 006 lands, the right rail should become context-driven rather than
  statically composed; keep its content in components that
  `set_context_panel` can swap.
- The mockup is a design reference, not a source of truth about the work
  itself. Facts come from the spec, from Louie, and from the shipped products.
