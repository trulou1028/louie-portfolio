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

**Phase 2 (Plan 003)**

7. **One responsive shell, not separate desktop/mobile shells.** Spec §4
   sketches `desktop-shell.tsx` and `mobile-shell.tsx`; a single
   `app-shell.tsx` with breakpoint classes is used instead so navigation state
   cannot diverge between two trees. Spec §4 invites a structure "close to"
   its sketch.
8. **The "Paste a job description" suggestion is deferred.** Spec §11 §2 lists
   it among the prompt chips, but the evaluator does not exist until Plan 007
   and it is the one suggestion with no honest destination today. Shipping it
   now would be a dead control, which spec §11 forbids. The other five
   suggestions are real links.
9. **The AI composer ships visibly disabled.** Until Plan 006 there is no
   conversation to have. Rather than a text field that silently does nothing,
   it is `disabled`, described by adjacent text explaining why, and paired
   with suggestions that do work.
10. **Contact links and availability are omitted, not faked.** The left rail,
    drawer, and footer render LinkedIn, email, and the availability indicator
    only once real values exist in `content/profile.ts` (spec §29).
**Phase 5 (Plan 006)**

12. **AI Louie reaches the OpenAI Responses API through the Vercel AI SDK.**
    Spec §3 names the Responses API and assistant-ui; assistant-ui's supported
    runtime is its AI SDK adapter, and `@ai-sdk/openai` targets the Responses
    API by default. So the spec's backend is used, via the integration path
    both libraries actually support, rather than a hand-rolled bridge. The
    provider stays behind `lib/ai/provider.ts` as spec §3 requires.
13. **assistant-ui brings Radix with it.** The project's own components are
    Base UI (spec §3); `@assistant-ui/react` depends on Radix internally.
    The two coexist — this only affects bundle size, not our component API.
14. **Playwright runs with placeholder AI env vars.** They are never used to
    reach a provider: every AI test intercepts `/api/chat`. They exist so the
    AI surface mounts and can be exercised without a real key.

**Phase 2 (Plan 003), continued**

11. **`Action` does not route links through Base UI's Button.** Doing so
    applied `role="button"` to `<a href>` elements, announcing navigation
    links as buttons. Link-rendered Actions now take the styling directly and
    keep link semantics (spec §26).

## AI Louie

The assistant is grounded in `content/evidence/evidence.ts`: the server-side
`search_portfolio` tool is its only source of facts, and every claim is meant
to come with a link to the section it came from.

To run it locally, put real values in `.env.local`:

```bash
OPENAI_API_KEY=sk-...
OPENAI_MODEL=gpt-4o-mini   # any model id; never hard-coded in the app
```

Without them the homepage renders the "temporarily unavailable" surface on the
server and the AI runtime is never sent to the browser. The rest of the site is
unaffected (spec §31).

**Manual smoke test** (needs a real key — the automated suites do not):

1. "What is Louie's strongest AI work?" → an answer citing evidence cards.
2. "Show me Offboard" → navigates to `/work/offboard` and highlights on arrival.
3. "What has he shipped in Rust?" → says it lacks evidence rather than inventing.
4. "How technical is Louie?" → cites the architecture evidence.
5. "Show me user research" → cites the Flexi research entry.

Watch for: no invented metrics, at least one evidence link per substantive
answer, tool activity shown in plain language, and no chain-of-thought.

### Rate limiting

The public endpoint allows 20 requests per 5 minutes per IP, in memory. On
serverless that is **per instance** and therefore best-effort — acceptable for a
portfolio, and deliberately not backed by new infrastructure (spec §3). If
abuse appears, Vercel KV or Upstash is the upgrade path.

## Testing

```bash
pnpm test:e2e
```

Playwright runs against a production build on port 3100, so a running
`pnpm dev` never collides with it. Two projects: Chromium at 1440×900 and
WebKit on an iPhone 13 profile — WebKit because a portfolio gets opened on
Macs and iPhones, and it is the engine most likely to differ. No API keys are
needed; every suite must pass without them (spec §31).
