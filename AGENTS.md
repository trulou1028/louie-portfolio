# Agent instructions — Louie Sakoda Portfolio V2

`LOUIE_PORTFOLIO_V2_IMPLEMENTATION_SPEC.md` is the authoritative brief. Phased
implementation plans live in `plans/`. Read the spec sections a plan names
before executing it.

## Stack

Next.js 16 (App Router) · React 19 · TypeScript strict · Tailwind v4 ·
shadcn/ui on **Base UI** primitives · lucide-react · motion · zod · pnpm.

No database, CMS, auth, or vector DB in V1 (spec §3, §37). Supabase is
deliberately unused — it appears in the Offboard case study only as a
description of *that product's* architecture.

## Commands

```bash
pnpm dev               # dev server
pnpm build             # production build (runs validate:evidence first)
pnpm typecheck         # next typegen && tsc --noEmit
pnpm lint              # eslint
pnpm test              # unit tests (vitest, lib/**/*.test.ts)
pnpm test:e2e          # Playwright against a production build on port 3100
pnpm validate:evidence # checks every evidence entry's route and anchor
```

`pnpm typecheck` runs `next typegen` first because Next 16 generates the
`LayoutProps` / `PageProps` global types that route files depend on.

## Claude Code on the web

`.claude/hooks/session-start.sh` runs at session start in remote containers
only (it exits immediately anywhere else). It installs dependencies, and then
reconciles Playwright's browser revisions: the image ships its own Chromium,
but at whatever revision it was built with, and Playwright addresses browsers
by exact revision — a mismatch reads as "Executable doesn't exist" and every
e2e test fails at launch. The hook points the expected revision at the
installed one.

Downloading the correct revision is not an option in that sandbox: the egress
policy blocks `cdn.playwright.dev` and
`playwright.download.prss.microsoft.com`. **That is also why the `mobile`
Playwright project cannot run there** — it is `devices["iPhone 13"]`, so
WebKit, which is absent from the image and cannot be fetched. Narrow-viewport
behaviour has to be covered by Chromium tests that resize the viewport
instead; see the architecture-map tests in `e2e/case-studies.spec.ts`. Run the
full `mobile` project locally before trusting it.

## Conventions

**Tokens.** All color, radius, motion, and type tokens live in
`app/globals.css`. Colors are spec §6 HSL triplets on `:root`, consumed as
`hsl(var(--token))` and exposed as Tailwind utilities in `@theme inline`.
Never write a raw hex color, a hard-coded px radius, or an ad-hoc font size —
use `bg-canvas`, `text-foreground-muted`, `border-border-subtle`,
`rounded-panel`, `text-display-xl`, and friends.

shadcn's semantic names (`--background`, `--primary`, `--muted`, …) are
*derived* from those tokens in `:root`. Change the spec tokens, not the
bridge.

**Components.** `components/ui/*` stays close to upstream shadcn. Portfolio
styling and semantics belong in wrappers: `components/system/`,
`components/portfolio/`, `components/app-shell/`, `components/ai/`
(spec §33). Do not scatter raw `Button`/`Card`/`Badge` through pages.

**Fonts.** Three families (fonts trial, Louie, 2026-10-29). `font-display`
is Inter, for the name, page, section, and project titles, at 600 or 700
with the negative tracking set in the type tokens. `font-sans` is Libre
Baskerville, for running text, UI, and meta lines. Both load through
`next/font/google`. Geist Mono (`font-mono`) is for short technical labels
only (tool names, chart labels), never nav, meta lines, or paragraphs
(spec §7). `font-synthesis-weight: none` stops the browser faking a bold.
The previous Libre Caslon Condensed files stay in `app/fonts/` in case
the trial is reverted.

**Layout.** Every page uses the stacked layout (`components/stacked/`),
after David Aerne's meodai.color.pizza: a left column that stays in view
(line portrait, name, Ask Louie, facts and contents on a case study, and
the site links) beside one column of stacked text. There is no site header
or footer. Pages other than the homepage and case studies get the standard
column through `Canvas` (`PageAside`). Ask Louie is a blue pill under the
name, the one filled control on a page. Text sits
at a 34rem measure (`.stacked-row`, `.case-prose`), with a narrow column
beside it for a project name or section label. Rules separate rows; there
are no cards or boxes on these pages.

**Card anatomy.** One padding scale, no in-between values: compact card
`p-4`, standard card `p-5`, panel `p-6` (a panel may step up to `sm:p-8`).
Inside a card: `gap-2.5` between rows, `gap-4` between cards, sections own
their own outer spacing (`mt-12`+). A genuinely dense row may deviate, but
it carries a comment saying so.

**Radius.** Nest corners: an outer radius is the inner radius plus the gap
between the two edges. Controls inset 8px inside a field use
`rounded-control` (8px) in a `rounded-field` (16px); a 20px thumbnail inset
4px in a chip uses `rounded-xs` in `rounded-sm`. Treat this as a guideline and
check the result by eye: pills (`rounded-full`) and very small insets can
need an adjustment.

**Chips and labels.** Use `Tag` for topic and project tags (`tone="mono"`
for the uppercase technical variant on cards). Use `SystemLabel` only for
machine-ish markers like `AI SYSTEM` or `TOOL CALL` — it means something,
it is not just a smaller chip. Never hand-roll chip markup; it drifted into
four different flavours before `Tag` existed.

**Icons.** `size-4` inline by default. `size-3.5` only inside `text-body-sm`
metadata rows. Decorative icons always `aria-hidden`.

**Loading.** Skeletons are shaped like the content they precede (see the
job-fit dialog, which previews its four result sections). No bare spinners
without text, and no skeleton that misrepresents what is coming.

**Theme.** Light only, with no switch (stacked redesign, 2026-10-29):
`<html>` has no `.dark`, and `app/globals.css` holds one palette. Do not
add `dark:` variants in portfolio components — write against the tokens.
Ink (#1C1C21) on a cool off-white paper (#F3F3F5); color belongs to the
work:

- Text steps: `text-foreground` for names and titles,
  `text-foreground-muted` for running text, `text-foreground-quiet` for
  meta lines (role, years, labels; #6B6B75, 4.7:1).
- One blue, #1A10E6. `text-accent` resolves to ink, so `InlineLink` is
  always underlined; the underline is `accent-line` blue, and hover text is
  `text-accent-hover` blue. `bg-accent-fill` (+ `text-accent-on-fill`,
  white) is for primary actions only. Focus rings and text selection use
  the same blue.
- `signal` is the same blue, reserved for `DecisionMark`: a thin box and
  label drawn over a real screenshot. Mark labels restate the caption, alt
  text, or case study.
- `bg-plate-*` / `text-plate-*-ink` / `text-plate-*-muted`: each project's
  own brand field, for that project only.
- Offboard's own lime appears only inside Offboard screenshots and the
  Offboard brand plate (`plate-offboard-mark`), never in charts or site UI.

## Content integrity — the rule that matters most

Never invent portfolio content: no metrics, employers, titles, dates, users,
outcomes, quotes, research findings, or URLs. If a fact is not in the spec or
supplied by Louie, write a labeled `TODO(content)` or `TODO(asset)` marker
instead (spec §29, §39.5). The same rule governs AI Louie at runtime: every
factual claim must be grounded in the curated evidence index.

## Before finishing any milestone

Run `pnpm typecheck && pnpm lint && pnpm test && pnpm build`, check responsive behavior,
and record any deviation from the spec in `README.md` (spec §39.13–14).

<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->
