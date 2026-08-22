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

Recorded per spec §39.14, in build order.

**Phase 0 — scaffold (Plan 001)**

1. **Next.js 16 / React 19 / Tailwind v4.** The spec names the stack but not
   versions; these are current as of scaffolding. Tailwind v4 means tokens are
   declared with `@theme` in CSS rather than in a `tailwind.config.ts`.
2. **`pnpm-workspace.yaml` removed.** `create-next-app` emitted one containing
   only `ignoredBuiltDependencies`, which pnpm 10.4 rejects. That setting now
   lives under `pnpm` in `package.json`.
3. **`typecheck` runs `next typegen` first.** Next 16 generates the
   `LayoutProps`/`PageProps` global types during build; without typegen a
   standalone `tsc --noEmit` fails on route files.
4. **shadcn "nova" preset.** The CLI required a preset; nova pairs Lucide with
   Geist, matching spec §3 and §7. Its grayscale palette is fully overridden by
   the spec §6 tokens.
5. **shadcn semantic tokens are derived, not duplicated.** `--background`,
   `--primary`, `--muted` and friends are defined in `:root` in terms of the
   spec §6 tokens, so upstream primitives inherit the portfolio palette.
6. **No `.dark` palette.** The `dark` variant stays registered so upstream
   components carrying `dark:` classes compile, but no dark theme is defined —
   dark mode is deferred per spec §6 and §37.

**Phase 1–2 — design system and shell (Plans 002, 003)**

7. **One responsive shell, not separate desktop/mobile shells.** Spec §4
   sketches `desktop-shell.tsx` and `mobile-shell.tsx`; a single
   `app-shell.tsx` with breakpoint classes is used instead so navigation state
   cannot diverge between two trees. Spec §4 invites a structure "close to"
   its sketch.
8. **`Action` does not route links through Base UI's Button.** Doing so applied
   `role="button"` to `<a href>` elements, announcing navigation links as
   buttons. Link-rendered Actions take the styling directly and keep link
   semantics (spec §26).
9. **Contact links and availability are omitted, not faked.** The rails and
   footer render LinkedIn, email, and availability only once real values exist
   in `content/profile.ts` (spec §29).

**Phase 3–4 — case studies and evidence (Plans 004, 005)**

10. **No `rehype-slug`.** Case-study anchors are set explicitly via
    `<Section id>` because those slugs are a public contract that the evidence
    index and AI navigation validate against; generated ids would drift when a
    heading is reworded.
11. **Diagrams are semantic HTML, not images or ASCII.** That is what makes the
    spec §34 criteria achievable — they read correctly in a screen reader,
    carry visible text equivalents, and reflow instead of shrinking.

**Phase 5 — AI Louie (Plan 006)**

12. **Reaches the OpenAI Responses API through the Vercel AI SDK.** Spec §3
    names the Responses API and assistant-ui; assistant-ui's supported runtime
    is its AI SDK adapter, and `@ai-sdk/openai` targets the Responses API by
    default. The spec's backend is used via the path both libraries support,
    rather than a hand-rolled bridge. The provider stays behind
    `lib/ai/provider.ts` as spec §3 requires.
13. **assistant-ui brings Radix with it.** The project's own components are
    Base UI (spec §3); `@assistant-ui/react` depends on Radix internally. The
    two coexist — this affects bundle size, not our component API.
14. **Playwright runs with placeholder AI env vars.** Never used to reach a
    provider: every AI test intercepts the endpoint. They exist so the AI
    surface mounts and can be exercised without a real key.

**Phase 6 — evaluator (Plan 007)**

15. **The evaluator has its own endpoint as well as a chat tool.**
    `/api/job-fit` is the primary path the paste dialog uses; routing a
    multi-thousand-character description through the model into tool arguments
    would be slow and truncation-prone. `compare_job_description` remains for a
    description pasted into the composer, and both call the same
    `runJobFitComparison`.
16. **The output schema adds `suggestedQuestions`.** Spec §22 lists "Suggested
    questions" as an output section but spec §18's schema omits it; the field
    was added so the documented UI could be built.
17. **Per-message prompt limit raised to 16k, with a new 48k total.** A pasted
    job description legitimately exceeds the old 8k message cap. The total cap
    is what actually bounds prompt size — the per-message limit alone would
    have permitted 32 large messages.

**Visual (Plan 010)**

18. **Homepage layout follows the strategy mockup**, but its Offboard
    description is not adopted: the mockup calls Offboard an IT help-desk
    offboarding tool when it is a job-search product (spec §11, §13, and the
    live product site). A unit test asserts we never describe it that way. Its
    microphone, attachment, and "deep research" controls are also not built —
    voice is Plan 009 and the others are not in the spec.

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

### Job-description evaluator

"Paste a job description" compares a role against the evidence index and
returns strong matches, work to review, honest gaps, and questions to ask.

It is an evidence navigator, not a score. Two mechanics enforce that:

- **Every match must cite evidence that resolves.** `verifyMatches` checks each
  cited id against the index and moves any unbacked match into the gaps
  section, so a hallucinated citation becomes an admitted gap rather than a
  false claim.
- **No numbers.** Match percentages and ratings are stripped from model prose
  before rendering (spec §18).

The description is used for one model call and nothing else — never logged,
persisted, or sent to analytics (spec §30). There is deliberately no `console`
call anywhere on that path, including error handlers.

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
