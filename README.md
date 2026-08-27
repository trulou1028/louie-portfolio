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

**Phase 7 — launch (Plan 008)**

19. **The AI panel is no longer gated server-side on `isAIConfigured()`.** The
    homepage is statically prerendered, so that check was evaluated at build
    time: adding a key in Vercel without redeploying would have left the site
    permanently showing "unavailable". The panel now always renders and the
    endpoint's 503 drives the fallback.
20. **The assistant runtime is a lazily-loaded chunk.** Spec §27 asks that the
    AI runtime not load until the visitor approaches the AI surface. Because
    Next prefetches route chunks, keeping it in the shared bundle made every
    route — including `/about` — download ~840KB it never used.
21. **Axe audits exclude `[data-base-ui-focus-guard]`.** Base UI's focus-trap
    sentinels carry `role="button"` with no accessible name. They are library
    internals and inert by design; revisit on the next upgrade.

**Conversation surface (2026-08-23)**

22. **The "Answer Canvas" was built and then removed.** An iteration routed
    substantive answers out of the chat panel and composed them in the main
    column ("ask the panel; the site answers"). Louie reviewed it and
    preferred the conversation staying in one place, so answers now stream
    conventionally inside the Ask panel with evidence cards inline. The
    `answer-store`/`answer-canvas` modules and their spec were deleted rather
    than left dormant.

**Visual (Plan 010)**

18. **Homepage layout follows the strategy mockup**, but its Offboard
    description is not adopted: the mockup calls Offboard an IT help-desk
    offboarding tool when it is a job-search product (spec §11, §13, and the
    live product site). A unit test asserts we never describe it that way. Its
    microphone, attachment, and "deep research" controls are also not built —
    voice is Plan 009 and the others are not in the spec.

**Homepage restructure (Plan 011)**

Owner decisions from Louie's 2026-08-23 review of the live homepage,
superseding spec §11's original wording (spec §39.14).

22. **Headline changed to "I design & ship AI products."**, replacing spec
    §1/§11's "I design AI products and build them." verbatim.
23. **Writing and Experiments left the primary nav.** Both remain live,
    stable URLs in `ROUTES` and the sitemap (spec §28); `/experiments` is now
    reached from `/work` instead.
24. **The contextual rail is gone from the homepage.** Featured work and
    "Louie in brief" moved into the main column — Featured work directly
    after the hero, so the work is reached fast, with "Louie in brief"
    after the AI thread. The AI thread itself stays in the main column for
    now; Plan 012 relocates it into the vacated rail.

**Hero and diagrams (2026-08-27)**

Owner decisions from Louie's review of the live site.

25. **The headline is one plain string at `display-lg`.** The accent italic
    tail from the strategy mockup is gone — the whole sentence is
    `text-foreground` at one size, a step down from `display-xl`.
    `profile.positioning.primaryEmphasis` was deleted with it, since its only
    job was to carry that tail.
26. **The hero carries no CTAs.** "View selected work" and "Ask Louie" were
    removed: Featured work sits directly beneath the hero and the Ask panel
    is already on screen in the rail, so both pointed at surfaces a visitor
    can already see. `AskAILouieLink` went with them; `#ask-ai-louie` remains
    a stable anchor for the suggestion chips and deep links that still use it.
27. **System diagrams are composed from shadcn `Card` and `Badge`.** Deviation
    11 still holds — the diagrams are semantic HTML, not images — but the
    presentation moved onto shadcn primitives: flows are a numbered rail of
    node cards, the containment tree is a card with a labelled header, and
    branch conditions are badges. `card.tsx` and `badge.tsx` were written by
    hand rather than pulled with `pnpm shadcn add`, because this environment
    cannot reach `ui.shadcn.com`; both stay close to upstream, with the same
    `accent`-to-`muted` hover substitution `button.tsx` already makes.
28. **The diagram caption sits below the frame, not inside it.** A
    `figcaption` has to be a direct child of its `figure`, so it can't live
    inside the `Card`. It now matches `ArtifactFrame`'s treatment.
29. **Recharts is installed, and used only on `/design-system`.**
    `OutcomeChart` (`components/portfolio/outcome-chart.tsx`) plots a verified
    outcome as a single-series horizontal bar chart. **No case study uses it**,
    because neither Outcomes section has a verified figure yet — both are
    still `PendingContent` (spec §13.8). Its `source` prop is required rather
    than optional so a chart cannot be shipped without someone naming where
    the numbers came from; a chart lends invented data more authority than
    prose does. The only rendered instance is the gallery demo on the
    internal, `noindex`, production-404 `/design-system` route, whose `source`
    says in words that the numbers are invented for the gallery. Recharts is
    therefore absent from every public route's bundle. `components/ui/chart.tsx`
    is a reduced hand-written stand-in for shadcn's `chart` primitive — same
    public shape (`config` keyed by `dataKey`, `--color-<key>` variables,
    `ChartContainer`, themed tooltip), minus the parts unused here — because
    the registry is unreachable from this environment.
30. **Flow connectors are measured and drawn in SVG, so `FlowDiagram` is a
    client component.** Borders can draw a sequence but not a branch, and
    five of these flows fan one step out into three — a fan that was
    previously drawn with nothing at all. A fan has to know where each card
    landed, which is only knowable after layout, so
    `components/portfolio/flow-diagram.tsx` measures with
    `getBoundingClientRect` and re-measures under a `ResizeObserver` (spec
    §25 reflow). The `<ol>` is unchanged and still the accessible truth: the
    SVG is `aria-hidden` and `pointer-events-none`, and the server-rendered
    CSS rail stays in place as the no-JS fallback, fading out only once the
    connectors have measured. `TreeDiagram`, `ColumnsDiagram` and the frame
    stay server components; the shared `Node`/`StepMarker` moved to
    `diagram-primitives.tsx` so they can serve both.
31. **The Offboard architecture section is an interactive map (React Flow).**
    Deviation 27 argued shadcn `Card` beats a node-graph library for these
    diagrams, and that still holds for the other eight — a canvas pans and
    zooms instead of reflowing, and its reading order is node order, not flow
    order. `#architecture` is the exception: exploring the layers *is* the
    argument the section makes, so it renders as React Flow above `lg` and as
    the same `FlowDiagram` list everywhere else, including with no
    JavaScript. Both are built from one graph in
    `content/work/offboard-architecture.ts`, so the two cannot drift. The swap
    is a client decision, not a CSS one: CSS would leave both trees in the
    document and hand a screen reader the diagram twice.

    The canvas is deliberately not a general-purpose one — pan, zoom and
    scroll capture are all off, since a diagram that swallows the page scroll
    is the scroll hijacking spec §24 rules out. Selection, focus and Escape
    are handled directly (React Flow's keyboard layer is disabled), so the
    layers are plain buttons in graph order. What the interaction reveals is
    structure — a layer's edges, and what flows in and out — all derived from
    the graph. No per-layer copy was written that the case study does not
    already state; where it says nothing, this says nothing (spec §29).
32. **The connectors animate on entry, via `motion`.** Spec §24 lists "system
    diagram connections animating on entry" as a preferred use, and §34 asks
    for reduced-motion support: the paths draw themselves once via
    `pathLength`, and render statically under `prefers-reduced-motion`. This
    is the first use of `motion` in the codebase — it was a dependency with
    no imports.

## Deep links

A hash can arrive before the page hydrates — `navigate_portfolio` sets one
client-side, and a pasted link raced by a slow network does the same. Two
things used to swallow it: the `hashchange` fires before any React effect is
listening, and the App Router then `replaceState`s its canonical URL over the
top, erasing the fragment.

An inline script in `app/layout.tsx` records the requested fragment on
`window.__deepLinkHash`; `DeepLinkHighlight` falls back to it when the live
hash has been wiped, and clears it once used. Two details are load-bearing and
neither is obvious:

- It has to be an inline `<head>` script, not a module-scope capture in the
  component. Chunk evaluation order moves whenever the client graph changes —
  adding the diagram connectors was enough to start losing the race.
- The listener reads the fragment off the event's `newURL`, not off
  `location.hash`. The `replaceState` can land between the hash being assigned
  and `hashchange` being dispatched, so by the time a listener runs
  `location.hash` is already empty.

`e2e/deep-link.spec.ts` pins it with the CPU throttled through CDP. At full
speed this is a race the suite only loses under parallel load, which is a
flaky way to hold a bug that reproduces perfectly once the gap is widened.

## AI Louie

The assistant is grounded in `content/evidence/evidence.ts`: the server-side
`search_portfolio` tool is its only source of facts, and every claim is meant
to come with a link to the section it came from.

To run it locally, put real values in `.env.local`:

```bash
OPENAI_API_KEY=sk-...
OPENAI_MODEL=gpt-4o-mini   # any model id; never hard-coded in the app
```

Without them the panel loads and the endpoint returns 503, so the thread shows
the "temporarily unavailable" copy. The rest of the site is unaffected
(spec §31). An earlier version decided this on the server, but that check froze
at build time on a statically prerendered page — see deviation 19.

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

## Deployment

The project is linked to Vercel as `louie-portfolio` under `louie-5320`, and
Vercel's GitHub integration is connected to
[`trulou1028/louie-portfolio`](https://github.com/trulou1028/louie-portfolio)
(private).

**Pushing to `main` is the deploy.** Every push builds and promotes a
production deployment automatically — there is no separate deploy step. Treat a
push as an outward-facing publish, because it is one.

**Current state (verified 2026-08-25):**

| | |
|---|---|
| Production URL | **https://louie-portfolio-six.vercel.app — publicly reachable, no login** |
| Branch previews | `louie-portfolio-git-<branch>-…` — still behind Vercel Authentication (302 to SSO) |
| Environment | `OPENAI_API_KEY` set; the deployed chat answers real questions |
| Custom domain | **not attached.** `louiesakoda.com` still serves the separate Webflow portfolio |

> This section previously said the project was "protected by Vercel
> Authentication, so only the account owner can view it." That is **not** true
> of the production domain — an unauthenticated request on 2026-08-25 returned
> the real page. Deployment Protection still covers branch previews only.
> Confirm this by request rather than by reading it here, and re-check after
> any change to the protection setting.

Remaining before this replaces the Webflow site:

1. Attach `louiesakoda.com` under **Settings → Domains** and update DNS. It
   currently points at Webflow, so this is a cutover, not an addition.
2. Clear the content punch list — see
   [`plans/CONTENT-TODOS.md`](plans/CONTENT-TODOS.md). Case-study imagery is
   still outstanding.
3. Run Lighthouse against the deployed URL. Spec §27 targets 90+; local
   measurements are below, but a production run over real network conditions
   is the number that counts.
4. Decide whether production should stay open. If it should not, enable
   Deployment Protection under **Settings → Deployment Protection** — the
   branch-preview protection already in place does not cover the production
   domain.

Environment variables are bound at build time, so adding or changing one in the
dashboard requires a redeploy before it takes effect.

Manual deploys still work, but the git push is the normal path:

```bash
npx vercel deploy          # preview
npx vercel deploy --prod   # production
```

### Measured performance

JavaScript delivered per route, from a production build:

| Route            | Before splitting | After |
|------------------|------------------|-------|
| `/about`         | 1076 KB          | 275 KB |
| `/work/offboard` | 1061 KB          | 232 KB |
| `/`              | 911 KB           | 1079 KB* |

\* Figures above are from the original route-splitting work and predate Plan
017. The win they describe still holds: every route other than `/` avoids the
chat runtime entirely, because Next prefetches route chunks and before the
split even `/about` was downloading it.

**Updated after Plans 017–018** (measured 2026-08-25, whole-build totals rather
than per-route):

| | Before Plan 017 | Now |
|---|---|---|
| Total client JS | 1,612 KB | **1,390 KB** |
| Chat chunk (lazy) | 836 KB | 644 KB |
| Eager — paid by every visitor | 776 KB | **746 KB** |

Plan 017 replaced `assistant-ui` with `@ai-sdk/react`'s `useChat` plus shadcn's
chat components. Plan 018 then added markdown rendering, whose ~140 KB lands
entirely inside the lazy chat chunk — the eager figure is what a visitor pays
when they never open the panel, and it did not move.

The chat chunk stays behind an `IntersectionObserver` deliberately. Folding it
into the eager bundle was measured and rejected in Plan 017: 644 KB is real
weight for a portfolio, and the "panel looks stuck loading" symptom that argued
for removing the gate turned out to occur only on the dev server and under
browser automation, never for a real visitor.

To re-measure, exclude the chunks listed in
`.next/server/app/page/react-loadable-manifest.json` and use exact byte sizes —
`du -k` rounds per file and inflates the total by roughly 30 KB.

## Testing

```bash
pnpm test:e2e
```

Playwright runs against a production build on port 3100, so a running
`pnpm dev` never collides with it. Two projects: Chromium at 1440×900 and
WebKit on an iPhone 13 profile — WebKit because a portfolio gets opened on
Macs and iPhones, and it is the engine most likely to differ. No API keys are
needed; every suite must pass without them (spec §31).
