# louiesakoda.com — Portfolio V2

An AI-native editorial portfolio: browse the work normally, or ask AI Louie to
retrieve, explain, and navigate to the evidence behind any answer.

Built to `LOUIE_PORTFOLIO_V2_IMPLEMENTATION_SPEC.md`. Implementation is phased
in `plans/` — see [`plans/README.md`](plans/README.md) for order and status.

## Getting started

```bash
pnpm install
cp .env.example .env.local   # then fill in values
pnpm dev
```

Open http://localhost:3000.

`OPENAI_API_KEY` / `OPENAI_MODEL` are only needed once AI Louie lands
(Plan 006). The site is designed to remain fully browsable without them
(spec §31).

## Scripts

| Command          | What it does                              |
|------------------|-------------------------------------------|
| `pnpm dev`       | Dev server                                |
| `pnpm build`     | Production build                          |
| `pnpm typecheck` | `next typegen` + `tsc --noEmit`           |
| `pnpm lint`      | ESLint                                    |

## Project structure

```
app/          routes (App Router) + /api/chat
components/   ui (upstream shadcn) · system · portfolio · app-shell · ai
content/      profile, resume, case studies (MDX), evidence index
lib/          ai adapter, routes allowlist, utils
plans/        phased implementation plans
```

Conventions for anyone (human or agent) working in here: see
[`AGENTS.md`](AGENTS.md).

## Deviations from the specification

Recorded per spec §39.14.

**Phase 0 (Plan 001)**

1. **Next.js 16 / React 19 / Tailwind v4.** The spec names the stack but not
   versions; these are current as of scaffolding. Tailwind v4 means tokens are
   declared with `@theme` in CSS rather than in a `tailwind.config.ts`.
2. **`pnpm-workspace.yaml` removed.** `create-next-app` emitted one containing
   only `ignoredBuiltDependencies`, which pnpm 10.4 rejects ("packages field
   missing or empty"). That setting now lives under `pnpm` in `package.json`.
3. **`typecheck` runs `next typegen` first.** Next 16 generates the
   `LayoutProps`/`PageProps` global types during build; without typegen a
   standalone `tsc --noEmit` fails on route files.
4. **shadcn "nova" preset.** The CLI required a preset; nova was chosen because
   it pairs Lucide icons with Geist, matching spec §3 and §7. Its default
   grayscale palette is fully overridden by the spec §6 tokens.
5. **shadcn semantic tokens are derived, not duplicated.** Upstream components
   reference `--background`, `--primary`, `--muted`, etc. Those are defined in
   `:root` in terms of the spec §6 tokens so primitives inherit the portfolio
   palette. Notably `--primary` maps to the moss accent, and `--ring` to the
   accent for focus states.
6. **No `.dark` palette.** The `dark` variant is still registered so upstream
   components carrying `dark:` classes compile, but no dark theme is defined —
   dark mode is deferred per spec §6 and §37.
