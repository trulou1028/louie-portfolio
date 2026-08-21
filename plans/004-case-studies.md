# Plan 004: Implement the Offboard and Flexi case studies

> **Executor instructions**: Follow this plan step by step. Run every
> verification command and confirm the expected result before moving to the
> next step. If anything in the "STOP conditions" section occurs, stop and
> report — do not improvise. When done, update the status row for this plan
> in `plans/README.md`.
>
> **Drift check (run first)**: Confirm the shell exists (`components/app-shell/`),
> `/work/offboard` and `/work/flexi` stubs render inside it, and `pnpm build`
> exits 0. On mismatch, STOP.

## Status

- **Priority**: P1
- **Effort**: L
- **Risk**: MED (content-heavy; the biggest hazard is inventing facts)
- **Depends on**: plans/003-app-shell-and-homepage.md
- **Category**: direction (Phase 3 of the spec's build sequence)
- **Planned at**: post-003 (record starting SHA in first commit), 2026-08-21

## Why this matters

The two case studies ARE the portfolio's substance — spec §38: "the portfolio
work must remain the hero." They must exist, with stable section anchors,
before the evidence index (Plan 005) can point at them and before AI Louie
(Plan 006) can navigate to them. The spec bans the generic UX-process
template; structure is decisions → tensions → systems → evidence (§12).

## Current state

- Shell, tokens, and primitives exist (Plans 001–003). MDX is in the stack
  (spec §3) but may not be wired yet.
- **Read spec §12 (case-study architecture), §13 (Offboard — full section
  list, narratives, and ASCII diagrams), §14 (Flexi — same), §34
  (SystemDiagram/EvidenceCard acceptance criteria) before starting.**
- Required anchors — these exact slugs become the AI deep-link contract:
  - Offboard (`/work/offboard`): `#context #system #decision-risk
    #decision-control #decision-context #architecture #product #outcomes #learnings`
  - Flexi (`/work/flexi`): `#context #tension #research #decision-scaffolding
    #decision-uncertainty #decision-teacher #system #product #outcomes #learnings`
- All narrative beats and diagram contents are specified in spec §13–14
  (e.g. the Offboard risk-gate flow, the opportunity workspace tree, Flexi's
  three-way STUDENT/TEACHER/INSTITUTION tension, the tutoring loop).
- **Content integrity rule (spec §29)**: only facts present in the spec go in;
  everything else — metrics, dates, quotes, screenshots, research findings —
  is a labeled `TODO(content)` / `TODO(asset)` for Louie to fill. Spec §13.8:
  "If a metric is not known, omit it."

## Commands you will need

| Purpose   | Command          | Expected on success |
|-----------|------------------|---------------------|
| Typecheck | `pnpm typecheck` | exit 0              |
| Lint      | `pnpm lint`      | exit 0              |
| Build     | `pnpm build`     | exit 0              |
| E2E       | `pnpm test:e2e`  | all pass            |

## Scope

**In scope**:
- `content/work/offboard.mdx`, `content/work/flexi.mdx` + MDX wiring
  (`@next/mdx` or `next-mdx-remote` — prefer `@next/mdx`, it's the App
  Router default path)
- `app/work/page.tsx` (work index), `app/work/offboard/page.tsx`,
  `app/work/flexi/page.tsx`
- `components/portfolio/`: `case-study-header.tsx`, `case-study-section.tsx`,
  `project-meta.tsx`, `system-diagram.tsx`, `artifact-frame.tsx`,
  `evidence-card.tsx` (static version), table-of-contents component
- `lib/routes.ts` (add anchor definitions)

**Out of scope** (do NOT touch):
- `lib/ai/*`, `/api/chat` — no retrieval yet
- `content/evidence/evidence.ts` — populated in Plan 005
- Homepage sections (except linking WorkCards to the now-real pages)

## Git workflow

- Branch `advisor/004-case-studies`; commit per case study + one for shared
  components. Do not push unless instructed.

## Steps

### Step 1: MDX pipeline + case-study layout components

Wire MDX with custom components mapped: headings render through
`CaseStudySection` (which emits the `id` anchor + consistent spacing),
`SystemDiagram`, `ArtifactFrame`, `Metric`, `Callout`. Build
`CaseStudyHeader` (title in display serif, `ProjectMeta` row: role, timeframe
`TODO(content)`, tags) and a sticky right-rail table of contents fed by the
anchor list (renders in `ContextualRail`; on mobile it collapses into a
details/summary block at top — spec §10/§25).

**Verify**: `pnpm build` exit 0 with a throwaway MDX heading rendering
through the mapped components.

### Step 2: SystemDiagram component

Spec §34 requirements: HTML/text fallback, readable on mobile (reflow, not
shrink — spec §25), animate only when useful, honor reduced motion. Implement
as structured HTML/SVG (flex/grid boxes + connector lines), NOT ASCII dumps
and NOT images. Each diagram takes a `title` + `description` (the textual
equivalent required by spec §26). Diagrams needed (contents specified in spec
§13.2, §13.3, §13.4, §13.5, §14): opportunity-workspace tree, risk gate flow,
HITL action flow, context-compounding flow, tutoring loop, three-way tension.

**Verify**: at 375px width each diagram reflows to vertical stacking and
remains legible; toggling OS reduced-motion disables its entry animation.

### Step 3: Offboard case study

Write `content/work/offboard.mdx` with all 9 sections in spec §13 order, each
under its exact anchor slug. Use the spec's narrative beats as the skeleton;
expand phrasing editorially but add **zero** facts beyond the spec.
Architecture section (§13.6): system diagram of data/action flow using the
listed elements (React, TypeScript, Tailwind, shadcn/ui, Supabase, Postgres/RLS,
Edge Functions, model APIs, document generation, auth, payments) — this
describes the *Offboard product's* stack (which really uses Supabase), not
this portfolio's. No logo wall. Product section (§13.7): `ArtifactFrame`
placeholders with `TODO(asset)` captions. Outcomes (§13.8): only
`TODO(content)` slots — no invented metrics. Learnings (§13.9): reflective
skeleton with TODOs.

**Verify**: `/work/offboard` renders all 9 sections;
`for a in context system decision-risk decision-control decision-context architecture product outcomes learnings; do curl -s localhost:3000/work/offboard | grep -q "id=\"$a\"" && echo "$a ok"; done`
→ 9 × ok.

### Step 4: Flexi case study

Same treatment for `content/work/flexi.mdx` with the 10 spec §14 anchors.
Lead with the central tension quote ("What should AI do when giving the user
exactly what they ask for undermines the user's actual goal?") and the
three-way needs diagram. Research section is structurally prominent (spec:
"a major part of the story") but its findings are all `TODO(content)` —
spec §14: "Do not invent research statistics."

**Verify**: same anchor loop against `/work/flexi` with its 10 slugs → 10 × ok.

### Step 5: Work index + wiring

`app/work/page.tsx`: the two WorkCards (reuse from Plan 003) + intro line.
Update homepage WorkCards to link here / to the case studies. Add each case
study's anchor list to `lib/routes.ts` as typed constants, e.g.
`OFFBOARD_ANCHORS = [...] as const` — Plan 005/006 consume these.

**Verify**: `pnpm typecheck && pnpm build` exit 0; click-through from home →
work → both case studies works.

### Step 6: QA against the spec quality bar

Spec §38 "Product" checks: decisions more prominent than process; every
important claim supported or TODO'd; typography doing the work. Reading
width 65–75ch (spec §8). Heading hierarchy semantic (h1 once per page).

**Verify**: `pnpm test:e2e` (extended, see below) passes; no hydration
warnings; `grep -rn "TODO(content)\|TODO(asset)" content/work | wc -l` > 0
(TODOs preserved, not papered over).

## Test plan

- Extend Playwright: `e2e/case-studies.spec.ts` —
  (1) both routes return 200 and render their `<h1>`;
  (2) every required anchor id exists on its page (loop the two lists);
  (3) TOC links scroll to the matching section (assert URL hash + element in
  viewport);
  (4) mobile viewport: no horizontal page scroll on either case study.
- Pattern: model after `e2e/home.spec.ts` from Plan 003.
- Verification: `pnpm test:e2e` → all pass.

## Done criteria

- [ ] All 19 anchors exist with exact spec slugs (9 Offboard + 10 Flexi)
- [ ] All six system diagrams implemented with text fallbacks
- [ ] Zero invented facts: every metric/date/quote/finding is spec-sourced or a labeled TODO
- [ ] TOC works desktop (right rail) and mobile (inline)
- [ ] `lib/routes.ts` exports typed anchor lists for both studies
- [ ] `pnpm typecheck && pnpm lint && pnpm build && pnpm test:e2e` all pass
- [ ] `plans/README.md` row updated

## STOP conditions

Stop and report back (do not improvise) if:

- You need a fact the spec doesn't provide and a TODO would leave a section
  structurally incoherent (report which sections need Louie's input).
- MDX integration conflicts with the App Router version scaffolded in 001
  after two attempts.
- Anchor slugs in the spec collide with MDX auto-generated heading ids
  (disable auto-ids rather than renaming spec anchors).

## Maintenance notes

- The anchor slugs are a **public contract**: Plan 005 evidence items and
  Plan 006 navigation validate against them. Renaming an anchor after this
  plan requires updating `lib/routes.ts`, the evidence index, and any
  published deep links.
- When Louie supplies real screenshots/metrics, they replace `TODO(asset)` /
  `TODO(content)` markers — reviewers should search for remaining TODOs
  before launch (re-checked in Plan 008).
