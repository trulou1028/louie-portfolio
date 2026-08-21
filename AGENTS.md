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
pnpm dev         # dev server
pnpm build       # production build
pnpm typecheck   # next typegen && tsc --noEmit
pnpm lint        # eslint
```

`pnpm typecheck` runs `next typegen` first because Next 16 generates the
`LayoutProps` / `PageProps` global types that route files depend on.

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

**Fonts.** Instrument Serif (`font-serif`) for display statements and project
titles only. Geist Sans (`font-sans`) for UI and body. Geist Mono
(`font-mono`) for short system labels only — never paragraphs (spec §7).

**Dark mode.** Deferred (spec §6, §37). Do not add `dark:` variants.

## Content integrity — the rule that matters most

Never invent portfolio content: no metrics, employers, titles, dates, users,
outcomes, quotes, research findings, or URLs. If a fact is not in the spec or
supplied by Louie, write a labeled `TODO(content)` or `TODO(asset)` marker
instead (spec §29, §39.5). The same rule governs AI Louie at runtime: every
factual claim must be grounded in the curated evidence index.

## Before finishing any milestone

Run `pnpm typecheck && pnpm lint && pnpm build`, check responsive behavior,
and record any deviation from the spec in `README.md` (spec §39.13–14).

<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->
