# Plan 001: Scaffold the Next.js project with tokens, routes, and content stubs

> **Executor instructions**: Follow this plan step by step. Run every
> verification command and confirm the expected result before moving to the
> next step. If anything in the "STOP conditions" section occurs, stop and
> report — do not improvise. When done, update the status row for this plan
> in `plans/README.md`.
>
> **Drift check (run first)**: This is a greenfield plan — there is no git
> history yet. Verify instead that the repo root contains ONLY
> `LOUIE_PORTFOLIO_V2_IMPLEMENTATION_SPEC.md`, `plans/`, and `.claude/`.
> If application code already exists, STOP: a later plan (or a partial run)
> already touched this.

## Status

- **Priority**: P1
- **Effort**: M
- **Risk**: LOW
- **Depends on**: none
- **Category**: direction (Phase 0 of the spec's build sequence)
- **Planned at**: no git history yet (repo is initialized in this plan), 2026-08-21

## Why this matters

Everything downstream — design system, case studies, the AI layer — assumes a
Next.js App Router project with strict TypeScript, Tailwind, shadcn/ui, the
color/type token layer, and the route skeleton in place. The spec explicitly
orders this first ("Do not build AI first", spec §35 Phase 0). Getting the
token layer and folder structure right now prevents every later plan from
inventing its own conventions.

## Current state

- The repo root is `/Users/louissakoda/Documents/Claude/Projects/Louie Product Design Portfolio`.
- It contains only:
  - `LOUIE_PORTFOLIO_V2_IMPLEMENTATION_SPEC.md` — the authoritative build brief. **Read §3 (stack), §4 (repository structure), §6 (color system), §7–9 (typography, type scale, geometry tokens) in full before starting.**
  - `plans/` — these plans.
  - `.claude/` — agent tooling. Do not touch.
- There is no `package.json`, no git repo, no application code.
- Machine has Node v22, pnpm 10, git. Use **pnpm** for everything.

Key spec constraints to honor in this plan:

- Next.js App Router + React + TypeScript strict + Tailwind CSS (spec §3).
- shadcn/ui **using Base UI primitives** — when running `shadcn init`, pick the Base UI option if prompted (this is a recent shadcn capability; if your shadcn CLI version has no Base UI option, STOP and report).
- Fonts: Instrument Serif (display), Geist Sans (body/UI), Geist Mono (system labels) via `next/font` (spec §7, §27).
- No database, no CMS, no auth, no vector DB in V1 (spec §3). Do NOT add Supabase.
- Color tokens are HSL triplets on `:root` exactly as listed in spec §6.
- Repository layout must match spec §4 (`app/`, `components/{app-shell,ai,portfolio,system,ui}`, `content/`, `lib/`, `public/`, `styles/`).

## Commands you will need

| Purpose   | Command                          | Expected on success |
|-----------|----------------------------------|---------------------|
| Scaffold  | `pnpm create next-app@latest`    | project files created |
| Install   | `pnpm install`                   | exit 0              |
| Typecheck | `pnpm typecheck` (add script: `tsc --noEmit`) | exit 0 |
| Lint      | `pnpm lint`                      | exit 0              |
| Build     | `pnpm build`                     | exit 0, all routes compile |
| Dev       | `pnpm dev`                       | serves on localhost:3000 |

## Scope

**In scope** (create):
- Entire Next.js application skeleton at repo root
- `styles/globals.css` (or `app/globals.css` — put tokens wherever the scaffold places globals, but keep ONE globals file)
- `content/profile.ts`, `content/resume.ts`, `content/evidence/evidence.ts` (stubs)
- Route stubs for every route in spec §28
- `.env.example`, `.gitignore`, `README.md`, `AGENTS.md`
- `git init` + initial commit

**Out of scope** (do NOT touch):
- `LOUIE_PORTFOLIO_V2_IMPLEMENTATION_SPEC.md` — never edit the spec
- `plans/` content other than the README status row
- `.claude/`
- Any AI/chat code, any real page content (later plans)

## Git workflow

- `git init` on `main` in this plan; commit style: short imperative subject
  lines (e.g. `Scaffold Next.js project`, `Add color and type tokens`).
- Commit at least once per step. Do NOT push anywhere.
- Add `.env*.local`, `.env` to `.gitignore`; commit `.env.example` only.

## Steps

### Step 1: Initialize git and scaffold Next.js

`create-next-app` refuses non-empty directories, so scaffold into a temp dir
and move the results up:

```bash
cd "/Users/louissakoda/Documents/Claude/Projects/Louie Product Design Portfolio"
git init
pnpm create next-app@latest _scaffold --ts --eslint --tailwind --app --src-dir=false --import-alias "@/*" --use-pnpm
rsync -a _scaffold/ ./ --exclude .git
rm -rf _scaffold
pnpm install
```

Add a `typecheck` script to `package.json`: `"typecheck": "tsc --noEmit"`.
Ensure `tsconfig.json` has `"strict": true`.

**Verify**: `pnpm typecheck && pnpm lint && pnpm build` → all exit 0.

### Step 2: Initialize shadcn/ui with Base UI primitives

```bash
pnpm dlx shadcn@latest init
```

Choose the Base UI primitive library if prompted. Install a starter set only:
`button`, `input`, `dialog`, `sheet`, `separator`, `tooltip`, `scroll-area`.
Components land in `components/ui/` — leave them close to upstream (spec §33);
portfolio-specific styling comes in Plan 002 wrappers.

Also: `pnpm add lucide-react motion zod` and `pnpm add -D @tailwindcss/typography` (if not present).

**Verify**: `pnpm typecheck && pnpm build` → exit 0; `ls components/ui` shows the added components.

### Step 3: Fonts

Configure in `app/layout.tsx` via `next/font`:

- Geist Sans and Geist Mono from the `geist` package (`pnpm add geist`) or `next/font/google`
- Instrument Serif from `next/font/google` (weight 400, normal + italic)

Expose each as a CSS variable: `--font-sans`, `--font-mono`, `--font-serif`,
and wire them into the Tailwind theme (`fontFamily.sans/mono/serif`).

**Verify**: `pnpm build` → exit 0; rendered `<html>` element carries all three font variable classes (check with `pnpm dev` + view source).

### Step 4: Token layer

In the globals CSS file, define under `:root` exactly the HSL triplet custom
properties from spec §6 (copy them verbatim — `--canvas: 42 28% 97%;` etc.),
plus:

- radius tokens from spec §9 (`--radius-xs: 6px` … `--radius-panel: 28px`)
- motion duration tokens from spec §24 (`--duration-instant: 90ms`, `--duration-fast: 160ms`, `--duration-standard: 240ms`, `--duration-deliberate: 380ms`)

Map them into the Tailwind theme so utilities like `bg-canvas`,
`text-foreground-muted`, `border-border-subtle`, `rounded-md` (14px) work.
With Tailwind v4 use `@theme` in CSS; with v3 extend `tailwind.config.ts`.
Colors reference the variables as `hsl(var(--canvas))`.

Type scale (spec §8): define utility classes or theme entries named
`display-xl`, `display-lg`, `heading-xl`, `heading-lg`, `heading-md`,
`body-lg`, `body`, `body-sm`, `label`, `system` with the listed
size/line-height/letter-spacing, using `clamp()` for fluid scaling on the
display/heading sizes.

**Verify**: `pnpm build` → exit 0. Create a throwaway element using `bg-canvas text-foreground` in `app/page.tsx`, confirm it renders warm off-white with near-black text in the browser, then remove it.

### Step 5: Route skeleton and folder structure

Create the folders and stub pages per spec §4 and §28:

```
app/page.tsx                     app/work/page.tsx
app/work/offboard/page.tsx       app/work/flexi/page.tsx
app/ai-systems/page.tsx          app/experiments/page.tsx
app/writing/page.tsx             app/about/page.tsx
app/resume/page.tsx              app/api/chat/route.ts   (returns 503 JSON stub)
components/app-shell/  components/ai/  components/portfolio/  components/system/
content/work/  content/experiments/  content/writing/  content/evidence/
lib/ai/  public/images/  public/work/offboard/  public/work/flexi/  public/resume/
```

Each stub page: a server component rendering the page name in an `<h1>` and a
`// TODO(content)` comment. Create `lib/routes.ts` exporting a typed
`ROUTES` constant listing every internal route string (this becomes the AI
navigation allowlist in Plan 006).

Create content stubs with `TODO(content)` markers, no invented facts:
- `content/profile.ts` — `export const profile = { name: "Louie Sakoda", role: "AI Product Designer & Builder", ... }` (only facts stated in the spec; everything else a TODO)
- `content/resume.ts` — empty typed structure + TODO
- `content/evidence/evidence.ts` — `export const evidence: EvidenceItem[] = []` with the `EvidenceItem` type copied from spec §16.3

**Verify**: `pnpm build` → exit 0 and the build output lists all 9 page routes plus `/api/chat`.

### Step 6: Env handling, metadata, and housekeeping

- `.env.example` with `OPENAI_API_KEY=`, `OPENAI_MODEL=`, `NEXT_PUBLIC_SITE_URL=https://louiesakoda.com` (spec §3)
- `lib/ai/provider.ts` stub: reads `process.env.OPENAI_MODEL` — no hard-coded model names anywhere (spec §3)
- Root `layout.tsx` metadata: title template `%s · Louie Sakoda`, description from the positioning statement (spec §1)
- `README.md`: how to run, and a "Deviations from spec" section (empty for now, required by spec §39.14)
- `AGENTS.md`: one page — stack, commands, token/component conventions, "never invent portfolio content" rule
- Commit everything.

**Verify**: `pnpm typecheck && pnpm lint && pnpm build` → all exit 0; `git status` → clean tree; `git log --oneline` → ≥4 commits.

## Test plan

No unit tests in this plan (nothing to test yet). The verification gates are
typecheck, lint, and production build. Add a `test` script placeholder only if
the scaffold included one.

## Done criteria

- [ ] `pnpm typecheck`, `pnpm lint`, `pnpm build` all exit 0
- [ ] `tsconfig.json` has `"strict": true`
- [ ] All 9 routes from spec §28 + `/api/chat` appear in build output
- [ ] Globals CSS contains every custom property named in spec §6 verbatim
- [ ] Three font variables present on `<html>`
- [ ] `.env.example` exists; no `.env*` committed; no secret values anywhere
- [ ] No `supabase`, `prisma`, or database packages in `package.json`
- [ ] Git repo initialized with the full scaffold committed
- [ ] `plans/README.md` status row updated

## STOP conditions

Stop and report back (do not improvise) if:

- The repo root already contains application code before Step 1.
- The shadcn CLI offers no Base UI option (report the CLI version — Radix
  fallback is a product decision the operator must approve, per spec §39.15).
- Tailwind major version forces token syntax that can't express the spec §6
  HSL-triplet pattern.
- `create-next-app` or `shadcn init` fails twice.

## Maintenance notes

- Every later plan assumes: pnpm, strict TS, tokens as CSS variables mapped
  into Tailwind, `lib/routes.ts` as the route allowlist, `components/ui`
  = unmodified shadcn. A reviewer should check no raw hex colors or
  hard-coded px radii snuck into stubs.
- Dark mode intentionally absent (spec §6) — do not add `dark:` variants yet.
