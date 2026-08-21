# Plan 008: Experiments, remaining pages, launch polish, and Vercel deploy

> **Executor instructions**: Follow this plan step by step. Run every
> verification command and confirm the expected result before moving to the
> next step. If anything in the "STOP conditions" section occurs, stop and
> report — do not improvise. When done, update the status row for this plan
> in `plans/README.md`.
>
> **Drift check (run first)**: Confirm Plans 001–007 landed (chat + job-fit
> working, all suites green). On mismatch, STOP.

## Status

- **Priority**: P2
- **Effort**: L
- **Risk**: MED (wide surface; includes production deploy)
- **Depends on**: plans/007-job-description-evaluator.md
- **Category**: direction (Phase 7 of the spec's build sequence + first-launch scope §36)
- **Planned at**: post-007 (record starting SHA in first commit), 2026-08-21

## Why this matters

This plan closes the gap between "features work" and the spec's first-launch
scope (§36): the remaining pages (About, Resume, Experiments index, Writing,
AI Systems), analytics, SEO/structured data, accessibility and performance
audits, content verification, and the production deployment to Vercel. The
quality bar is spec §38; launch is defined by §36, with §37's exclusion list
enforced.

## Current state

- Working: shell, homepage, two case studies, evidence system, AI Louie text
  mode, JD evaluator. Stub-only: `/about`, `/resume`, `/experiments`,
  `/writing`, `/ai-systems`. `/design-system` is live and must not ship
  indexed.
- **Read spec §15 (experiments), §23 n/a here, §26 (a11y), §27 (performance),
  §28 (SEO), §29 (content integrity), §30 (analytics), §36–38 before
  starting.**
- The operator has a **Vercel account**; deployment happens there. Supabase
  stays unused (spec §3/§37 — no database in V1).
- Resume content: only from `content/resume.ts`, which Louie must populate —
  a `TODO(content)`-heavy resume page is a STOP-worthy launch blocker, not
  something to improvise.

## Commands you will need

| Purpose    | Command                    | Expected on success |
|------------|----------------------------|---------------------|
| All gates  | `pnpm test && pnpm typecheck && pnpm lint && pnpm build && pnpm test:e2e` | all pass |
| Bundle     | `ANALYZE=true pnpm build` (if analyzer added) | report generated |
| Deploy     | `npx vercel` / `npx vercel --prod` | deployment URL |
| Lighthouse | `npx lighthouse <url> --preset=desktop` | report; perf ≥90 target |

## Scope

**In scope**:
- `app/experiments/*`, `app/about/*`, `app/resume/*`, `app/writing/*`,
  `app/ai-systems/*`; `content/experiments/*`, `content/writing/*`,
  `content/resume.ts` structure
- `lib/analytics.ts` + event wiring (spec §30 list)
- SEO: metadata, OpenGraph, `sitemap.ts`, `robots.ts`, JSON-LD structured data
- A11y + perf remediation across all pages
- Vercel project setup + production deploy
- `/design-system` removal or gating

**Out of scope** (do NOT touch):
- Anything in spec §37 (accounts, CMS, dark mode, 3D, etc.)
- Voice (Plan 009)
- Inventing resume/writing/experiment content

## Git workflow

- Branch `advisor/008-launch`; commit per workstream. Production deploys only
  from `main` after the operator merges — preview deploys are fine from the
  branch. Confirm with the operator before the FIRST production deploy
  (custom domain `louiesakoda.com` DNS changes are theirs to approve).

## Steps

### Step 1: Experiments architecture + index

Implement spec §15: the `Experiment` type verbatim, `/experiments` index of
`ExperimentCard`s, detail routes `/experiments/[slug]`. Seed the four initial
experiments (Voice + tool calling, Human-in-the-loop confirmations, Agent
interface patterns, Design engineering workflow) as `status: "exploration"`
entries whose bodies are honest placeholders describing intent — clearly
labeled as in progress, no fake demos (spec §38: "no fake data represented as
real"). Structure ready for "20 to 60 second demonstrations" later. Add
evidence entries for any experiment with real substance only.

**Verify**: index + 4 detail routes build and render; cards show status.

### Step 2: About, Resume, Writing, AI Systems pages

- `/about`: editorial layout from `content/profile.ts`; portrait slot
  `TODO(asset)`.
- `/resume`: HTML resume rendered from `content/resume.ts` (spec §28 requires
  HTML in addition to PDF) + download `Action` for `public/resume/<file>.pdf`
  (`TODO(asset)` until supplied).
- `/writing`: MDX list layout, empty-state honest ("Writing coming soon" is
  fine; no lorem ipsum — spec §28).
- `/ai-systems`: overview page linking the AI-relevant sections of both case
  studies + experiments; content assembled ONLY from existing case-study
  copy and evidence titles.

**Verify**: all four render in the shell, mobile included; no lorem ipsum
(`grep -rin "lorem" app content` → no matches).

### Step 3: Analytics

`lib/analytics.ts`: thin wrapper over Vercel Analytics (`pnpm add
@vercel/analytics`) exposing `track(event, props?)`. Wire exactly the spec
§30 event names (portfolio_project_opened, ai_question_submitted, etc. —
copy the list; voice_* events are no-ops until Plan 009). Hard rules coded
into the wrapper: never pass free-text (answers, questions bodies, JDs) —
only enum-ish props like `{ project: "offboard" }`. `ai_question_submitted`
fires with NO question text attached.

**Verify**: unit test: wrapper rejects/strips props longer than ~100 chars;
grep confirms no `track(` call passes message/JD variables.

### Step 4: SEO + structured data

Per-route `generateMetadata` (title, description, OpenGraph incl. image
placeholder), `app/sitemap.ts` + `app/robots.ts` (block nothing except
`/design-system` if kept), JSON-LD: `Person` (site-wide), `WebSite`, and
`CreativeWork` on each case study (spec §28). Canonical URLs from
`NEXT_PUBLIC_SITE_URL`. Stable headings that reflect content; no hidden
duplicate content.

**Verify**: `curl -s localhost:3000/sitemap.xml` lists all public routes;
JSON-LD on `/` and both case studies parses (paste into a JSON parser);
`pnpm build` exit 0.

### Step 5: Accessibility audit

Run `@axe-core/playwright` across all routes (add to e2e suite): zero
critical/serious violations. Manual pass per spec §26 checklist: landmarks,
heading hierarchy, focus visibility everywhere, 44px touch targets, dialog/
sheet semantics, live-region behavior for AI updates, alt text on meaningful
images, decorative images `aria-hidden`, diagram text equivalents,
reduced-motion sweep.

**Verify**: axe assertions pass in `pnpm test:e2e`; keyboard-only full-site
walkthrough completes (documented in the PR/commit message).

### Step 6: Performance audit

Targets (spec §27): Lighthouse ≥90 desktop+mobile, LCP <2.5s, CLS <0.1.
Levers, in order: server components by default (audit `"use client"`
directives — each must be justified); defer the assistant-ui/AI bundle until
the AI surface is near-viewport or activated (dynamic import — spec §27);
`next/image` everywhere with sizes; font loading already via next/font;
lazy-load below-fold media.

**Verify**: `npx lighthouse` against the production **preview deploy** (not
dev server) → perf ≥90 desktop; record mobile score; CLS/LCP within targets
(note real numbers in the commit/README).

### Step 7: Content verification + spec-deviation ledger

Sweep every `TODO(content)` / `TODO(asset)`: produce a checklist file
`plans/CONTENT-TODOS.md` grouping them by page with file:line, for Louie to
resolve. Cross-check every number/date/title against `content/profile.ts` /
`resume.ts` single sources (spec §29). Update README "Deviations from spec"
with anything accumulated. Remove `/design-system` route or gate it behind
`NODE_ENV !== "production"`.

**Verify**: `grep -rn "TODO(" app components content lib | wc -l` matches the
checklist count; `/design-system` 404s in a production build (`pnpm build &&
pnpm start`).

### Step 8: Vercel deploy

`npx vercel link` (operator's account — they authenticate), set env vars in
Vercel dashboard or `vercel env add`: `OPENAI_API_KEY`, `OPENAI_MODEL`,
`NEXT_PUBLIC_SITE_URL` (the operator supplies values — never paste key values
into files or logs). Preview deploy → run the manual smoke script (Plan 006)
against it → operator approval → `vercel --prod`. Custom-domain attachment
(`louiesakoda.com`) is an operator dashboard action; document the steps in
README rather than changing DNS yourself.

**Verify**: production URL serves `/`, both case studies, working AI chat
(operator smoke test); `curl -s <prod-url>/api/chat -X POST -d '{}'` → 4xx
JSON (validation), not a crash.

## Test plan

- Extend e2e: axe checks all routes; sitemap/robots/JSON-LD presence; new
  pages render.
- Unit: analytics wrapper guards.
- Full gate: `pnpm test && pnpm typecheck && pnpm lint && pnpm build && pnpm test:e2e` green, keyless.

## Done criteria

- [ ] Every spec §36 first-launch item present (walk the list explicitly)
- [ ] Nothing from spec §37 shipped
- [ ] All spec §30 events wired; no free-text ever tracked
- [ ] Sitemap, robots, OG, JSON-LD (`Person`, `WebSite`, `CreativeWork` ×2)
- [ ] Axe: zero critical/serious across all routes
- [ ] Lighthouse ≥90 desktop on preview deploy; LCP/CLS in target (numbers recorded)
- [ ] `plans/CONTENT-TODOS.md` delivered; `/design-system` not in production
- [ ] Production deployment live on Vercel with env vars set by operator
- [ ] `plans/README.md` row updated

## STOP conditions

Stop and report back (do not improvise) if:

- `content/resume.ts` is still empty at Step 2 — the resume page cannot ship
  as TODOs; get content from Louie first (this is the likeliest blocker).
- Lighthouse performance <85 after the Step 6 levers — report the trace
  breakdown instead of stripping features.
- Any deploy step requires credentials in your hands — env values are
  operator-entered only.
- The domain isn't attachable / DNS questions arise — operator decision.

## Maintenance notes

- `plans/CONTENT-TODOS.md` is the launch-content punch list — Louie resolves
  it, then a follow-up pass removes the markers.
- The AI-bundle deferral (Step 6) is fragile under refactors: reviewers of
  future changes should watch for the assistant-ui chunk landing back in the
  initial bundle.
- Post-launch: re-run Lighthouse after real images/screenshots land — they
  are the biggest unshipped perf variable.
