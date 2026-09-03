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

**Fonts.** Roboto Slab (`font-serif`, also `--font-heading`) for display
statements and project titles only. Outfit (`font-sans`) for UI and body.
Geist Mono (`font-mono`) for short system labels only — never paragraphs
(spec §7). All three load through `next/font/google` in `app/layout.tsx`.

**Card anatomy.** One padding scale, no in-between values: compact card
`p-4`, standard card `p-5`, panel `p-6` (a panel may step up to `sm:p-8`).
Inside a card: `gap-2.5` between rows, `gap-4` between cards, sections own
their own outer spacing (`mt-12`+). A genuinely dense row may deviate, but
it carries a comment saying so.

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

**Dark mode.** Dark is the default (`<html class="dark">`); both palettes
live in `app/globals.css`. Do not add `dark:` variants in portfolio
components — write against the tokens, which already resolve per theme.
Respect the split accent: `text-accent` for text and markers, `bg-accent-fill`
(+ `text-accent-on-fill`) for filled controls; see the note above `:root` in
`globals.css`.

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
