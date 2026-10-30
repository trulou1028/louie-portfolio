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

| Command                  | What it does                                        |
|--------------------------|-----------------------------------------------------|
| `pnpm dev`               | Dev server                                          |
| `pnpm build`             | Production build (runs `validate:evidence` first)   |
| `pnpm typecheck`         | `next typegen` + `tsc --noEmit`                     |
| `pnpm lint`              | ESLint                                              |
| `pnpm test`              | Unit tests (vitest, `lib/**/*.test.ts`)             |
| `pnpm test:e2e`          | Playwright against a production build on port 3100 |
| `pnpm validate:evidence` | Checks every evidence entry's route and anchor      |

CI (`.github/workflows/ci.yml`) runs typecheck, lint, unit tests, build, and
the Playwright suite on every push and pull request. Node is pinned in
`.nvmrc`; pnpm in `package.json`'s `packageManager`.

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

**Plans 029-035: adopted narrative and reading layout (2026-09-19)**

Louie authorized implementation of the seven portfolio plans. The following supersede the earlier homepage and narrative decisions, without rewriting the original spec:

- Senior Product Designer positioning; shorter hero; analytics followed by Offboard as featured stories. Flexi remains secondary product work. Neuron is explicitly an independent simulated prototype.
- Homepage Ask Louie starts closed in a keyboard-accessible dialog. Its draft/transcript stay mounted after first use; the existing hash opens it. The homepage right rail is removed. Case-study contents rails remain.
- AI Systems moves to secondary links from Home and Work. Primary navigation is Home, Work, About, Resume. Left-rail philosophy quotes are removed.
- Image-led work rows replace placeholder thumbnails. Real public portfolio assets are attributed in `plans/portfolio-strategy/asset-manifest.md`.
- `/work/ck12-analytics` and `/experiments/neuron-shift` are added, with reviewed evidence, schema/route registration, and deduplicated sitemap entries. Old Offboard/Flexi section anchors remain.
- Offboard general/Job Packets stories are consolidated. Automatic tracker filing is distinguished from external sending. Flexi's unproven teacher controls/confidence behaviors and inactive legacy metrics are omitted. Published research is attributed separately from personal design ownership.
- The editorial draft is shorter than the proposed word budgets where fuller treatment would require missing evidence. No placeholder frames are promoted in these four articles. Offboard review/risk screens and a concrete CK-12 influence episode remain gaps, not completed deliverables.
- The interview kit is drafted in `plans/portfolio-strategy/interview-story-kit.md`. Timed owner rehearsal, external review, and production publishing are not complete. See the release review for verification and remaining work.


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
   Geist; the Geist Sans half was later replaced by Outfit and the display face
   by Roboto Slab (see the RHEA preset note in `app/globals.css`). Its
   grayscale palette is fully overridden by the spec §6 tokens.
5. **shadcn semantic tokens are derived, not duplicated.** `--background`,
   `--primary`, `--muted` and friends are defined in `:root` in terms of the
   spec §6 tokens, so upstream primitives inherit the portfolio palette.
6. **Both palettes ship; dark is the default.** `:root` carries the light
   palette and `.dark` the dark one, with `<html class="dark">` in
   `app/layout.tsx` making dark the default (the RHEA preset,
   `restyle/rhea-dark`). The `dark` variant is registered for upstream
   components. A theme toggle is a later one-liner. Supersedes the original
   'dark mode is deferred' decision; spec §6's ordering (light first) was
   honoured, then dark was adopted as the primary look.

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

**Phase 5 — owner passes (2026-08-31)**

33. **Louie's portrait is the avatar, in the rail and in AI Louie.**
    `profile.avatar` now points at `public/images/louie.jpg`, cropped square
    around the face from the supplied portrait and stored at 640×640 (2× the
    largest place it renders). It drives both the rail's logo and the
    assistant's chat avatar, which share one `AssistantAvatar` so they cannot
    drift and so the lazy skeleton does not flash a different mark before the
    runtime arrives. The `Sparkles` mark survives only as the fallback when
    no photo is set: an "LS" monogram on an assistant turn would read as
    Louie himself typing.

    Two consequences worth recording. The assistant turn with no text yet now
    renders nothing at all rather than an empty shell, because that shell and
    the thinking row were each drawing an avatar and stacking two circles for
    one reply. And `e2e/ai-louie.spec.ts`'s HTML-injection guard no longer
    asserts zero images inside the panel — the avatar is a legitimate one —
    but zero images *outside* an avatar, which is the invariant it was always
    testing.

34. **The thinking state deals the work (Plan 043).** It replaced the
    `thinking-orbs` dotted orb, which is no longer a dependency. A thin arc
    turns around Louie's avatar. The status line changes only when the
    stream reports something new: "Reading your question", "Searching my
    case studies" while `search_portfolio` runs, then "Writing from what I
    found". Under it, small cards of the real work deal through a stack;
    when the search returns, the sources it returned open into labeled
    chips. The chips come from the tool output's routes, so the wait shows
    true progress and never shows reasoning (spec §21). The visible status is
    `aria-hidden`; an `sr-only` line names the found sources for screen
    readers. The job-description wait uses the same card stack.

35. **No accent border on a rounded edge, anywhere (owner decision).** The
    accent-bar-down-the-left-edge treatment had spread to four unrelated
    places — the diagram accent node, the architecture map's emphasised node,
    the nav's active marker — and reads as a visual cliché. Replacements, in
    order: a full accent ring on the node; one emphasis scale where a muted
    accent ring marks an important node and selection brightens it to full
    accent; and an accent-tinted icon for the active nav row. The nav state
    is still not carried by colour alone (spec §26) — surface, weight and
    `aria-current` all remain.

    Pull quotes keep their left rule: they have no border radius, and a rule
    beside a quotation is a typographic convention rather than this pattern.

36. **Featured work is a two-column grid of stacked cards (owner decision).**
    `WorkCard` gained a `layout` prop; `/work` keeps the full-width `split`
    layout and the homepage uses `stacked`. The homepage grid breaks on
    `@container`, not the viewport, because that column gives up width to the
    Ask rail — a viewport breakpoint would go two-up while the column was
    still too narrow for the text. Padding steps from `p-6`/`md:p-8` down to
    the standard card's `p-5` in the stacked layout.

**Security headers (2026-09-02)**

37. **The CSP ships enforcing, and `script-src` is `'unsafe-inline'` rather
    than hashed.** `next.config.ts` now sends four plain headers —
    `X-Content-Type-Options`, `Referrer-Policy`, `X-Frame-Options`,
    `Permissions-Policy` — plus an enforcing `Content-Security-Policy`. Before
    this, Vercel's default HSTS was the only security header the site sent.

    Hashing the inline scripts was the original plan and it is not reachable on
    this stack. Next inlines a flight-data script whose body — and therefore
    whose hash — differs on every page and every build: measured on one build
    at 22,387 B for `/` and 17,870 B for `/about`. A `headers()` entry emits one
    static header per `source`, so it cannot enumerate a hash that changes with
    the page. The other route to a strict `script-src` is a per-request nonce,
    which needs `middleware.ts` and would disable static prerendering on every
    page — a real cost to buy a directive this site gets little from, since it
    loads no third-party scripts at all. `'unsafe-inline'` still bars *external*
    script origins, and every script in the served HTML is same-origin.

    **It enforces rather than reporting, and that reverses the first draft.**
    The plan was to ship `Content-Security-Policy-Report-Only`, watch the
    console for a week, then promote it. Execution surfaced the flaw: WebKit
    ignores a report-only policy that carries no `report-to` endpoint — its
    console says the policy "will have no effect", meaning it neither blocks
    nor reports. A `report-to` endpoint would be new infrastructure (spec §3).
    So report-only would have protected no Safari or iPhone visitor at all,
    while the observe-then-enforce plan quietly watched Chromium only — on a
    site whose own suite runs WebKit precisely because portfolios get opened on
    Macs and iPhones. Enforcing was measured before it was chosen: the full e2e
    suite passed across both engines under the enforcing header, and the WebKit
    warning disappears. Reverting is a one-word change, but reverting to
    report-only restores protection for nobody on WebKit — fix the directive
    instead.

    So the real protection here is `img-src`, `frame-ancestors`, `object-src`,
    `connect-src`, `base-uri` and `form-action`, not `script-src`. `img-src`
    matters most: deviation 23 stopped the markdown renderer emitting a
    model-authored `<img>`, and this stops the browser fetching one if that path
    ever reopens — the same hole closed at two layers.

    One accepted risk: `connect-src` cannot be exercised locally, because
    `@vercel/analytics` only runs on Vercel. If its reporting host is not
    covered, analytics could silently stop. `vitals.vercel-insights.com` is
    allowed for that reason, and production must be checked right after the
    first deploy — if analytics breaks, widen `connect-src` rather than
    dropping it. `'unsafe-eval'` is appended in development only, for
    Turbopack's HMR runtime; production never carries it.

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
OPENAI_MODEL=gpt-5.6-luna   # locally evaluated; model remains environment-configurable
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
pnpm test        # unit, ~1s
pnpm test:e2e    # Playwright, ~1 min
```

Playwright runs against a production build on port 3100, so a running
`pnpm dev` never collides with it. Two projects: Chromium at 1440×900 and
WebKit on an iPhone 13 profile — WebKit because a portfolio gets opened on
Macs and iPhones, and it is the engine most likely to differ. No API keys are
needed; every suite must pass without them (spec §31).

The test build serves images as-is (`PORTFOLIO_E2E=1` sets
`images.unoptimized` in `next.config.ts`). `next start`'s built-in image
optimizer sometimes never answered a resize request under the test load, so
a page never fired `load` and the test timed out on every retry; that made
the CI Playwright job fail on four of seven `main` pushes from September 20
to October 12, 2026. Production is unaffected: Vercel resizes images with its
own service. Tests that only read text or head metadata navigate with
`waitUntil: "domcontentloaded"`, and the no-JavaScript reading test runs once
per story. On failure, CI uploads the HTML report and `test-results/`, which
hold the traces recorded on retry.

## September 19 portfolio follow-up

User-requested motion uses the existing Motion package (`motion/react-mini`) for once-per-view hero, card, case-study header, and article-section entrances. Server HTML stays visible, scroll positions remain native, and reduced-motion preferences disable entrances, including changes during an animation. Timings and travel distance use global tokens. The reveal timing is 700ms with 1.5rem travel, a soft ease-out curve, and 90ms stagger steps; timing parsing accepts both `ms` and `s` because production CSS minification changes units. This extends spec §24 at the owner’s request.

Deep-link capture is scoped to its route and cleared on departure so a prior section cannot redirect a fresh card visit. Direct section links retain focus and highlighting. The supplied Offboard packet screenshot now appears on both listings and the article, with matching alt text and caption.

The owner-selected accent is now `#a37eff`, represented by HSL tokens. Dark mode uses that exact violet for text and primary fills, with dark text on filled controls. Light-mode links use a deeper violet for contrast. This supersedes the earlier rust/amber palette in spec §6. Offboard now leads Home and Work. The desktop case-study contents tracks the section at the reading line with `aria-current="location"` and a borderless violet tint, using native scroll events without changing the URL or moving focus.

Headings, copy, and artifacts cascade independently within hero and case-study groups; adjacent entrances share a capped stagger. Homepage and Work section headings participate too. Experience copy now uses Louie’s confirmed 14+ years of digital product design (September 19, 2026).

## September 19 editorial motion and navigation revision

Motion now follows the public [editorial stagger reference](https://motion.dev/ui/hero-sections): masked visual lines in headings, followed by restrained fade-and-lift entrances. This is a local implementation using the existing Motion package, not an installation of the authenticated Motion+ registry source. Visual lines retain native responsive wrapping and one accessible heading name. Entrances are prepared before observation to avoid the previous backwards jump; reduced motion, focus, and resize reveal content immediately. Server HTML remains readable without JavaScript.

Ask Louie now lives in the desktop sidebar and mobile navigation header, backed by one persistent dialog in the app shell. Drafts survive route changes, and internal evidence links dismiss the dialog. The homepage hero has no assistant action, raising the first project card. About now ends with one panel grouping Explore and Get in touch links. These owner-requested changes supersede the earlier hero placement and whole-section motion.

Ask Louie intentionally has no Live status badge. Do not reuse dot-and-pill live indicators as decoration elsewhere in the portfolio. Availability text and actual loading/error feedback have distinct meanings.


### Ask Louie voice and model audit, September 19, 2026

Per Louie's explicit request, Ask Louie speaks in his first-person portfolio voice. This supersedes the third-person framing in spec sections 16.1 and 20 while retaining AI disclosure when asked and all eleven grounding rules. The greeting and technical suggested question follow that voice. Local configuration now selects `gpt-5.6-luna` with low reasoning effort; no production environment was changed. Revert `OPENAI_MODEL` to the previous `gpt-4o-mini` if rollback is needed, but note the audit failures recorded below.

Chat and job-fit requests explicitly set `store: false`. This disables Responses API application storage; it is not a claim of zero provider retention. Streaming errors log only their class, including the SDK-level callback. Job-fit grounding includes full evidence details so research attribution and outcome limitations survive the projection. Existing citation validation checks IDs, not semantic truth.

Live audit findings and verification: [Ask Louie audit](plans/portfolio-strategy/ask-louie-audit-2026-09-19.md). Rerun the opt-in synthetic audit with `pnpm exec tsx scripts/audit-ask-louie.ts --live --model=gpt-5.6-luna`; it uses the local key and writes answers to `/tmp/ask-louie-audit.json`. Never add real applicant data or private resumes to its fixtures.
# Portfolio polish, September 20, 2026

The homepage now introduces Louie Sakoda and his role before the adopted positioning headline. Supplied Offboard and CK-12 wordmarks appear on project panels and case-study headers at their original proportions. Project panels prioritize the central design argument, role, and case-study link; summaries remain in the case-study headers and tags remain in the content model. This intentionally simplifies the original spec's card metadata and hero eyebrow, following Louie's requested visual refinement.

The Plan 036 “Beneath the surface” sculpture remains an archived experiment and is not mounted on the homepage. Louie chose to keep the hero typographic and move directly into portfolio evidence. Selected work uses two equal-height columns when its content container is wide enough; each card stacks its artifact, project identity, argument, role, and case-study link vertically. Narrow containers retain a single column.

## Portfolio feedback refinement, September 21, 2026

Applied the supplied Portfolio feedback session: homepage content expands to 1040px with shared, bounded desktop gutters for the content and footer, the repeated hero identity is removed, and All work sits beside Selected work. The existing headline size is preserved with its original 0.95 leading; secondary dark-theme text is brighter and topic labels have a 13px floor. Cards use 12px corner tokens, standard p-6 content padding, 26px maximum project-title tokens, and a 54/46 visual split for horizontal work. The experiment image has more breathing room, and How I work has distinct heading-sized principle rows. Availability now leads with Open to new opportunities while retaining the owner-confirmed full-time and part-time detail. These requested changes supersede the original spec geometry and homepage composition; case-study reading widths stay unchanged.

## Direction A, "The work, framed" (Plan 037), September 27, 2026

Louie chose direction A from three static mocks, plus direction B's amber
decision marks inside the case studies. Details and rationale:
[Plan 037](plans/037-direction-a-work-framed.md). These changes supersede the
entries above where they conflict:

- **Light is the default theme.** `<html>` no longer carries `dark`. The dark
  half stays in `app/globals.css` for a future toggle. Supersedes deviation 6.
- **Neutral shell, color from the work.** Canvas is near-white, ink is
  near-black, and the accent resolves to ink. The owner-selected violet is
  retired (supersedes the September 19 accent note). Each project has its own
  plate color from its brand. One amber `signal` color is reserved for
  decision marks.
- **Archivo replaces Outfit and Roboto Slab.** One family; the width axis
  separates display (`font-display`, `wdth` 112) from body. `font-serif` is
  renamed `font-display`. Supersedes deviation 4 and spec §7's type pairing.
- **The persistent left rail is removed.** A desktop header carries the name,
  primary navigation, availability, and Ask Louie. Mobile keeps its header
  and drawer. Supersedes spec §10's left rail and Plan 003's shell.
- **Homepage.** A two-tone headline, an experience record read from
  `content/resume.ts`, and a "Compare a job description" entry point. Each
  project sits on a full-width brand-color plate with its screenshot and a
  gallery strip. The frame is centered at 1320px. Supersedes the September 21
  1040px frame and two-column card grid.
- **Case studies.** A quick-facts row replaces the violet side-stripe
  callout; the status and result follow the hero image. Screenshots carry
  amber decision marks whose labels restate existing captions, alt text, or
  case-study copy. Each case study ends with a link to the next one.
- **Asset requests.** Gallery slots without an image render as labeled
  `TODO(asset)` frames in development only. Production builds omit them.
- **Dialog and sheet backdrops** use `bg-foreground/30` instead of upstream
  `bg-black/10`, which was too faint on the light canvas. The one local edit
  to `components/ui/`.
- **Template cues removed.** `SectionLabel` is sentence case instead of mono
  uppercase, and the side-stripe blockquotes are replaced by a top rule.
- **Tests.** Homepage, listing-image, and accent browser tests now assert the
  plate layout and plate colors instead of the card grid and violet accent.
  Lighthouse scores in "Measured performance" predate this change and were
  not re-measured.

## Homepage: compact hero and bento grid (Plan 038), September 27, 2026

Louie chose variation 1's compact hero and variation 3's bento grid, with the
amber decision mark in the headline. Supersedes the Plan 037 homepage layout
above; case studies and `/work` keep their Plan 037 plates.

- **Hero.** The headline is sized to fit one line at 1440px
  (`--text-home-hero` max 3.4rem). "Clear decisions." carries the amber mark
  and a "the job" tag, which appear after the headline's entrance finishes.
  The lede and both actions share a row; the four employers sit in a row
  below them.
- **Bento grid.** All four projects appear as brand-color tiles in a 12-column
  grid: large and small, then small and large. The separate "More work"
  section is gone. Neuron Shift's tile keeps the live demo as a second link.
- **Tests.** The homepage test now asserts the tile order and the bento
  geometry, and a new test checks that the marked headline keeps its plain
  accessible name.

### Follow-up (Plan 039), September 27, 2026

- **Calmer bento tiles.** Tiles show brand, a two-line title, the role, and
  the screenshot. Summaries and fact lines moved off the homepage. In each
  row the large tile sets the height and the small tile's screenshot fills
  the rest (cropped at the bottom and right). Screenshots run 12px past the
  tile edge, so the hover lift no longer opens a gap.
- **Ask Louie modal.** The title, a subtitle, and Louie's avatar share the
  header row with an icon Close button. The greeting is a neutral bubble; the
  job-description path is a card; the three starter questions are full-width
  rows directly under the greeting instead of pinned above the composer.
- **Hero (Plan 039).** The headline stacks "Complex workflows." above the
  boxed "Clear decisions.", which stays on one line. The "the job" tag hangs
  below the box's bottom-right corner, so the box sits directly under the
  line above it. The type scales to the text column (`cqi`), not the
  viewport, so the boxed line never overruns its column (verified at 320 to
  1920px). Louie's supplied photo (`public/images/louie-working-session.webp`,
  `profile.heroPhoto`) sits beside the text; employers follow in one row.

## Neuron Shift refresh, September 28, 2026

The Neuron Shift page now follows Louie's revised case study and screenshots
(`github.com/trulou1028/neuron-shift`, commits `babbaa6`, `b42b46f`). Eight
supplied screenshots replace the September 19 capture (`demo.jpg`, removed);
the console screenshot also drives the homepage and Work tiles. Copy is
condensed from the source case study with no new claims. Three sections are
added, with matching evidence entries so AI Louie can cite them: Position on
chat (`#chat`), Color semantics (`#color`), and The unguided visitor
(`#unguided`). Existing anchors are unchanged.

## Photo-banner hero (Plan 040), September 28, 2026

Louie chose hero option E. The homepage opens on his photo as a rounded
banner: on wide screens the photo fills it and a dark ink scrim runs from the
left under the white headline; on phones the photo sits on top and fades into
the dark panel, so the text never covers his face. The marked "Clear
decisions." and both actions are unchanged. The headline still scales to its
text column (`cqi`), with a smaller floor (1.625rem) so the boxed line fits a
320px phone. `RevealHeading` gained `quietClassName` for the lighter quiet
words over the photo.

The data-center company Neuron Shift was once framed around is no longer
named anywhere in this repository or in Neuron Shift (commit `09c23b0`
there); the non-affiliation statement now reads "not affiliated with or
endorsed by any company". The shift-brief screenshot is cropped above its
footer, which still named the company.

## Work-led hero with the Neuron Shift loop (Plan 041), September 28, 2026

Louie moved the hero away from his photo to option W1: the headline beside a
looping screen recording of the live Neuron Shift prototype
(`public/work/neuron-shift/hero-loop.{webm,mp4}`, 18.2s, about 1MB each, and a
poster frame). Every frame is the real app, captured at 2x from
neuron-shift.vercel.app with a scripted browser session; nothing is redrawn.
`scripts/record-neuron-hero.cjs` re-records it and lists the encode steps.

`HeroLoop` never plays under reduced motion (the poster stays), plays only
while on screen, and has a visible pause control (WCAG 2.2.2). The Neuron
Shift tile now uses the tour screenshot, so the console does not appear twice.
The photo from Plan 040 stays in `profile.heroPhoto` but is not rendered.

## Offboard updated UI, and logos on the next-case-study card, September 29, 2026

Offboard shipped a new UI and palette. Louie supplied two screenshots of the
same completed packet. The three-panel image (`offboard/packet-panels.webp`)
is now the hero and the homepage and Work image; the full-window screenshot
(`offboard/packet.webp`) sits in the Product section. The old-UI
`application-packet.jpg` and dashboard `product.jpg` are removed, so the
Offboard Work plate shows no gallery image until a dashboard screenshot in
the new UI arrives (`TODO(asset)` in `projects.ts`).

The Offboard plate follows the app: warm charcoal (`30 12% 10%`) with the
app's lime (`#c0ff01`) as the mark color, replacing the earlier dark green.

`NextCaseStudy` now leads with the next project's logo (`ProjectBrand`,
on-plate variant) and the "Next case study" label.

## Homepage polish, September 29, 2026

- Offboard's title is "Founding Product Designer & AI Systems Lead"
  everywhere, matching the resume (Louie confirmed).
- The Offboard plate is `34 9% 15%`, the same color as the backdrop of
  `packet-panels.webp`, so the app panels float on the tile without a
  second frame.
- Tile crops for Neuron and Flexi were tried and reverted the same day:
  Louie found the full screenshots easier to take in. The Offboard homepage
  tile uses the flat full-window screenshot (`tileImage`, `packet.webp`) so
  it matches the other tiles; the case study hero keeps the three-panel image.
- The "Open to new opportunities" link is removed from the header.
- How I work: each principle's sentence is plain text, followed by a link
  named for its project. The About and AI-decisions links moved under the
  section heading.
- The headline mark tag is 0.875rem (was 0.75rem).

## Ask Louie in the hero and a side panel (Plan 042), September 29, 2026

The hero's two buttons are replaced by an ask bar with three starter
buttons. Ask Louie opens as a non-modal side panel on desktop and a
full-screen sheet on phones. On project pages it starts from that project's
questions. See `plans/042-ask-louie-side-panel.md`. The Offboard case study
now says "designed and engineered" instead of "founded".

Same day: case studies gained an "Ask about <project>" card under their
contents, case-study pages now use the header's centered frame (the
resizable full-bleed panes are gone), and the hero lost its helper line.
Later: the desktop panel docks and pushes the header and page, which reflow
through container queries; the thinking line shares the avatar's row; and
the header shows Louie's photo. Then: the canvas is warm off-white
(#f9f7ef), answer links always open the page their text names, and the
job comparison moved into the panel with a shorter result.

## Motif experiment (Plan 047), October 10, 2026

`/experiments/motif` is a case study for Motif, Louie's motion design system.
Claims come from the Motif repository (private) and the live site; see
`plans/047-motif-experiment.md` and claims M01 to M03 in the ledger.
Experiments now carry their own name, plate, badge, and demo label, so the
experiment page, plates, and tiles no longer special-case Neuron Shift.
Motif is a prototype, so `/work` lists it under Neuron Shift; the homepage is
unchanged.

Same day: Motif is on the homepage (a five-tile grid, the last tile in a new
wide shape), the header has a Contact button with the email address, copy,
LinkedIn, booking, and resume, and the CK-12 "early sketch" placeholder is
removed.

## Motif leads (Plan 048), October 10, 2026

At Louie's request Motif comes before Neuron Shift on `/work`,
`/experiments`, and the homepage, and the homepage hero now plays a screen
recording of the live Motif studio. See `plans/048-motif-first.md`.

## TransferSight case study (Plan 049), October 10, 2026

`/experiments/transfersight` presents Louie's own product in progress: the
phone-first app flow (six prototype screens, demo data), the live landing
page, and the data pipeline. It sits between Motif and Neuron Shift. See
`plans/049-transfersight.md` and claims T01 to T02.

Later the same day (Plan 050): the hero loop shows only the "What are you
building?" choice and the app's settings, one change at a time, so it reads
as one decision and its result.

## Homepage audit, October 12, 2026

A design audit of louiesakoda.com against Mobbin references, approved by
Louie. Changes:

- **The hero renders without an entrance animation.** On a 375 px phone the
  masked headline was still hidden 3 seconds after load on production. The
  hero (headline, ask bar, Offboard figure, experience strip) is now static
  on first paint. Sections below still reveal on scroll.
- **The hero links to the work.** Under the ask bar: "See selected work"
  (to `#work`) and "Book time". The ask bar shows two starter questions, not
  three; the panel's empty state keeps all three.
- **Offboard leads the hero, not Motif.** The figure shows
  `packet-panels.webp` on the Offboard plate, hidden on phones where the
  Offboard tile is one scroll below. This reverses Plan 048's hero choice;
  Motif stays on the homepage as an independent project. `HeroLoop` is now
  unused but kept, with its recording scripts, in case the loop returns.
- **Two groups instead of one bento grid.** "Case studies": Offboard full
  width, then the CK-12 pair at equal width. "Independent projects": Motif,
  TransferSight, and Neuron Shift as three equal, smaller tiles. Size now
  follows evidence.
- **Case-study tiles show the one-line summary** from `content/work/projects.ts`.
- **"Clear decisions." keeps its amber box without the "the job" tag.**
  `RevealHeading` gains `mark` (box only); `markLabel` still adds the tag.
- **"14+ years designing digital products" moved** from How I work to the
  label above the experience strip, which is two columns on phones.
- **The phone header keeps "Louie Sakoda" on one line.**

Not changed: the site footer still repeats Book time, Email, and LinkedIn
under the homepage's closing panel. The footer is shared by every page, and
other pages have no closing panel.

Follow-up the same day, from Louie's review:

- **The hero has one link.** "See selected work" stays; "Book time" and the
  figure caption's case-study link are gone (booking is in the header's
  Contact menu and the closing panel; the Offboard tile is one scroll
  below). The hero now offers the ask bar, two questions, and one link.
- **The experience record left the hero.** It is its own section on a
  `bg-surface-muted` band, in `text-body-sm`, with thin column dividers on
  wide screens, so it reads as reference rather than a call to action.
- **The thumbnail strip under each `/work` plate is gone**, at Louie's
  request: it added little. Each plate keeps its one large screenshot. The
  `gallery` field and its `TODO(asset)` requests (two for Flexi) are removed
  from `content/work/projects.ts`; the images stay, used by the case studies.

## Dark, quieter, more room (Plan 051), October 15, 2026

A design audit of the live site and a round of canvas mockups, approved by
Louie. Details, measurements, and rationale:
[Plan 051](plans/051-design-audit-breathing-room.md). These changes
supersede the entries above where they conflict:

- **Dark only, no theme switch.** `<html>` carries `dark` again, and the
  tokens in `app/globals.css` are one dark palette: canvas #121211, ink
  #F1EFE7. The light half is gone. Supersedes Plan 037's "Light is the
  default theme".
- **One accent, lime #C6FF00 with dark text**, for filled controls only
  (Ask Louie, Book time, send) and the headline underline. `text-accent`
  still resolves to ink. The focus ring is lime. The amber `signal` keeps
  its one job, the decision marks on screenshots.
- **Instrument Serif, Geist, and Geist Mono replace Archivo.** Instrument
  Serif is `font-display` (page, section, and project titles); it has one
  weight, so `font-synthesis-weight: none` stops faked bolds. Geist is the
  sans for UI and body. Geist Mono carries the nav pills, meta lines, and
  short labels. Supersedes Plan 037's Archivo note.
- **New hero copy, supplied by Louie.** "I make complex things feel
  simple." / "I design and build AI-powered products that help people learn,
  navigate complexity, and make better decisions." / "Explore my work ↓".
  Small real screenshots sit inside the headline and cycle; a neon underline
  draws under "feel simple." (`components/portfolio/hero-headline.tsx`). The
  entrance is CSS and finishes in under a second, so the October 12 finding
  (a JS-gated headline hidden on phones) does not return. Reduced motion
  shows the finished state.
- **Ask Louie opened beside the desktop homepage on arrival.** Superseded on
  2026-10-20 (job-search fixes): the open panel hid the work on the first
  screen, so it now starts closed on every page and width, and a visitor
  opens it with the Ask Louie button. The hero's ask bar is gone; the panel
  holds the starter questions and the job-description comparison.
- **One card anatomy** (`components/portfolio/work-card.tsx`): the
  screenshot on a neutral `surface-muted` frame, a mono meta line, the
  title. No plate color, wordmark, arrow button, or summary on homepage
  cards. The Work page uses a row version that keeps the one-sentence
  summary. `WorkTile`, `WorkPlate`, `ProjectPlate`, `ExperimentPlate`,
  `HeroAsk`, and `ProjectMeta` are deleted; the plate classes moved to
  `components/portfolio/plate-tones.ts` for the next-case-study link.
- **Spacing with contrast.** 128px between homepage sections on desktop
  (96px on phones), 32px between cards in a row, 64px between rows.
- **Experience is a plain list** on the canvas, no tinted band.
- **The header shows the name alone** (the hero states the role), with mono
  pill navigation.
- **Case-study openings are one block:** the title, one mono meta line with
  the facts, and the brief as unboxed rows. The logo chip, the separate lede
  (it restated the brief's problem), and the scope line are gone.
- **Dark-theme fixes:** decision marks dim with black, not ink, and sheet
  and dialog backdrops are black.

Not changed yet (Plan 051 R10, remaining): the case-study table of contents
still uses its own labels instead of the section titles' words, and the
"Ask about this project" card is still a card.

Follow-up the same day, from Louie's review:

- **Every page lines up with the header.** Reading-width pages (About,
  Resume, AI Systems, Experiments, Writing, write-ups) keep their 900px
  column but sit inside the header's frame, left-aligned, instead of centered
  on their own. The footer uses the same frame everywhere.
- **"Contact" is now "Let's talk"**, a plain outlined dropdown with a
  chevron, listing email (with copy), LinkedIn, Book time, and Resume. The
  mail icon read as "this opens my email client".
- **The Ask Louie panel resizes.** Drag its left edge, or focus it and use
  the arrow keys (Shift for bigger steps, Home and End for the limits).
  350 to 720px (it opens at 350px), and the page keeps at least 600px. The width is remembered in
  `localStorage["ask-louie-width"]`.
- **Headline previews are sharp.** Hover shows a separate 22rem copy of the
  screens instead of scaling the thumbnail up, which the browser had
  rasterized at its small size.
- **The headline line has no glow and sits behind the letters**, like a
  highlighter stroke. It draws in once; the flicker and hum are gone.
- **The header name is a wordmark:** the first name in Geist, the surname in
  Instrument Serif italic. The avatar tilts and rings lime on hover.
- **Buttons keep their fill while their popover or panel is open.** The
  upstream button base greyed out an open trigger; `Action` now overrides it.

## Two Offboard case studies: LUMO and LUMO Bench, October 15, 2026

Louie asked for Offboard's own work to lead, ahead of the older CK-12
studies. Two new case studies, written from Offboard's repository
(`lumo-plan-builder`, `origin/main` on 2026-10-15): product specs, the
September 2026 conversation audit, decision records in `coach/decisions/`,
and the run reports in `documentation/qa/ai-runs/`. Every number is quoted
from those files.

- **`/work/lumo`**: the assistant. The conversation audit, the "propose,
  then confirm" rule for write tools, the LUMO-only side panel, and the
  limits on what LUMO reads and claims.
- **`/work/lumo-evals`**: the evaluation system. The bench instead of
  training, the model swaps it stopped, the hard set and its tuning rules,
  and the grader agreement check.
- **Order.** `workProjects` is now Offboard, LUMO, LUMO Bench, CK-12
  Foresights, Flexi. The homepage shows Offboard full width, then the LUMO
  pair, then the CK-12 pair.
- **Images.** The LUMO hero is a product screenshot from Offboard's
  repository (`public/employee-experience/lumo-chat.png`, April 2026). The
  repository has no screenshot of the current LUMO panel; a newer one would
  be better. The LUMO Bench image is a chart drawn for this site from the run
  reports, captioned as such and shown without a browser bar
  (`WorkProject.imageFrame: "none"`).
- **Evidence.** Eleven entries cover both pages; they use `project:
  "offboard"`, so a search scoped to Offboard finds them.

Follow-up the same day, from Louie's review:

- **No real user numbers anywhere.** Louie does not publish Offboard usage:
  no member, message, account, signup, or conversation counts, and no usage
  percentages. The LUMO pages, the Offboard outcomes, the Offboard brief, and
  the evidence index now describe those findings in words. Test and system
  results stay (cases passed, grader agreement, model cost and speed, server
  functions, automated tests).
- **Graphics on both LUMO pages** (`components/portfolio/lumo/`), each inside
  a `SystemDiagram` with a plain-language caption:
  - LUMO: one turn before and after the audit fix; a "try it" tool gate (pick
    a message, see which of LUMO's ten real tools are offered, confirm the
    card); a wireframe of the panel and the small-screen sheet; the money
    switch.
  - LUMO Bench: four release-gate runs and two hard-set runs as one dot per
    case, from the run files (`content/work/lumo-bench-data.ts`); the GPT-6
    Luna scorecard and the Claude screen; the 25 grader verdicts with the one
    disagreement.
  - Each plays once when it scrolls into view and shows its end state under
    reduced motion. The illustrations say they are not product screens.
- **Case-study headlines are product names** (Louie, October 16, 2026):
  Offboard Job Search Platform, LUMO Career Agent, LUMO Bench & Evals System,
  CK-12 Teacher Analytics, CK-12 Flexi AI Tutor. They live in
  `WorkProject.title` and also set the browser tab title. The short names
  (`WorkProject.name`) stay in the mono meta line above each headline.

## New LUMO hero and case images, October 16, 2026

Louie made new assets in a separate Offboard session, from production with
the QA account and a synthetic "Northwind" severance agreement (no member
data):

- **LUMO Career Agent hero** is now a looping 8.7-second recording of one
  LUMO turn (`public/work/lumo/stream.mp4`, poster `stream-poster.webp`).
  `ArtifactFrame` takes a `video` prop and renders `LoopVideo`: it plays only
  on screen, has a pause button (WCAG 2.2.2), and stays on the poster under
  reduced motion. MP4 only: the WebM from the same session could not be
  decoded for review here, and every current browser plays H.264.
- **The LUMO card** (`card.webp`, via `tileImage`) is a composition cut from
  the real still and the steps crop: the question, the "How Lumo worked"
  steps, and the reply, with lime lines from "Loading document analysis" to
  the quoted clause and from "Drafting your ask email" to the draft. The
  homepage now prefers `tileImage` for every card, like the Work page.
- **Decision 01 on LUMO** shows the "How Lumo worked" steps crop
  (`steps.webp`), with a mark on the quoted clause.
- **LUMO Bench Decision 01** shows one case, P1 (`case-p1.webp`). Checked
  against the run files: 6 old-code runs each passed 3 of 5 checks; 4
  new-code runs passed all 5.
- The old April 2026 screenshot (`chat.webp`) is removed.
- **LUMO's new face** (`public/work/lumo/face.webp`, from the Offboard app,
  October 16, 2026) sits beside the titles of both LUMO case studies
  (`WorkProject.icon`), beside "LUMO" in the next-case-study brand line, and
  wherever LUMO replies in the LUMO graphics (`LumoFace`). In the "before"
  half of the turn graphic it is greyed: the classifier answered, not LUMO.

Follow-up, October 16, 2026 (Louie's review):

- **Ask Louie opens at 350px**, which is also its narrowest width. The
  case-study rail now needs a 72rem canvas (was 64rem), so with the panel
  open on a 1440px screen the rail folds into the inline contents instead of
  squeezing the article.
- **The hero's lime line skips descenders.** It sits just under the
  baseline, and a canvas-colored halo around each letter breaks it where the
  tail of the "p" crosses it.
- **Independent projects use product-name headlines too:** Motif Motion
  Design System, TransferSight Transfer Fit Report, Neuron Shift Operator
  Console.

## Indigo and lilac palette, October 17, 2026

Louie compared lime with tangerine, ice blue, lilac, periwinkle,
ultraviolet, and indigo, rendered on the real pages with the charts
recolored, and chose the "duo":

- **Indigo #5550F2** fills primary buttons (Book time, Ask your own
  question, the Ask Louie send button), with light text at 5.1:1.
- **Lilac #BBA8FF** (`accent-line`) draws the headline underline, link and
  hover underlines, focus rings, text selection, and every chart mark in the
  LUMO graphics. It matches LUMO's face.
- **Cool greys.** The canvas, surfaces, borders, and ink moved from warm to a
  slightly blue near-black (#101113) and off-white (#EFF0F5), so the purple
  family sits naturally.
- **Charts.** The LUMO graphics use `accent-line` instead of Offboard's lime.
  The bench chart, case P1, and the LUMO card image were re-rendered in lilac
  on cool greys from their sources. Offboard's product screenshots and the
  recording keep the app's own lime.
- The social share image uses the new colors.

## Job-search quick fixes, October 20, 2026

From the portfolio review of 2026-10-20, ahead of this week's applications.

- **One CK-12 title.** The CK-12 Analytics page, its work card, and the
  evidence index said "Lead Product Designer". Home, About, the resume PDF,
  and the Flexi page said "Lead UX Designer", which is the title on the
  resume. Every page now says Lead UX Designer. The claim ledger (A01) and
  the interview story kit match.
- **Ask Louie starts closed** on every page and width. Plan 051 opened it
  beside the desktop homepage, where it took about a quarter of the width
  and hid the work. The header button opens it; drafts, the job-description
  comparison, the deep link `/#ask-ai-louie`, and the resizer are unchanged.
  The `ask-louie-closed` flag and the e2e storage state that set it are gone.
- **The work reaches the first screen.** Deviation from Plan 051: the
  experience record moved from between the hero and the case studies to
  just after the case studies. Spacing alone could not do it: the record
  and the gap above it are about 270px on desktop and 570px on a phone. The
  hero also sits closer to the work (64px on phones, 80px on desktop,
  instead of 96 and 128) and its inner margins are a step tighter. The
  headline and its size are unchanged. At 1440x900 the Offboard card starts
  at 677px; at 390x844 the whole Offboard screenshot shows. `home.spec.ts`
  checks both sizes.
- **CK-12 ownership rewrite.** The CK-12 Analytics page now says what Louie
  decided. "What I owned" became "What I decided": start years (Insights
  2020, Foresights 2021, from Louie), live by May 2023 (CK-12's introduction
  video), what each partner group owned, the three framing questions, and
  the three decision rules. Decision 02 names the options rejected (a single
  score, a raw probability). The "Next iteration" section ("Next, I would
  put a plain-language interpretation first") became "What shipped next":
  the team answered the chart finding with Recommendations, which shipped to
  teachers. Sources: Louie's answers on 2026-10-20 and his earlier CK-12
  deck. The claim ledger (A05 to A08) and Ask Louie's evidence index match.

## Stacked redesign, October 29, 2026

Louie's direction after the "AI slop" review: David Aerne's
meodai.color.pizza as the reference, light colors from his screenshot,
stacked projects with a short paragraph each, a preview on hover, and a
line portrait. He picked "direction A", "typeface 2", and portrait M1 from
the review prototypes on 2026-10-29. Deviations from the spec and from
Plan 051:

- **Light only.** Plan 051 made the site dark only. The palette is now ink
  on a cool off-white paper with one blue (#1A10E6). The prototype's meta
  grey (#84848E, 3.3:1) failed WCAG AA, so meta text is #6B6B75 (4.7:1).
- **Fonts.** Libre Caslon Condensed (titles) and Newsreader (text) replace
  Instrument Serif and Geist. Caslon Condensed is self-hosted from
  `app/fonts/` (Google Fonts latin subset, SIL OFL) because
  `next/font/google` does not list it yet. Geist Mono stays for short
  technical labels.
- **No header or footer on any page.** A sticky left column holds the
  line portrait, the name, Ask Louie, and the site links (Work, About,
  Résumé, LinkedIn, email, Book a call); on a case study it also holds the
  facts and the contents (spec §10 described a header and a right rail).
  Louie's review (2026-10-29): About and Résumé had a different header from
  the rest, so every page now uses the same column. The "Let's talk" menu
  and the mobile drawer are gone; the email address is in the column.
- **Ask Louie is a blue pill button** (ink since 2026-10-30) under the name on every page ("Ask
  about this project" on a case study). Louie found the text link hidden.
- **Homepage.** The hero headline ("I make complex things feel simple."),
  the work cards, "How I work", and the closing call to action are gone;
  "Book a call" moved into the left column's links.
  The page is Louie's About intro, then three ruled lists: "Work I'm proud
  of" (five case studies), "Built on my own" (three projects), and "Where
  I've worked". Each project paragraph is `blurb` in the project data and
  restates its brief; it adds no claim. Hovering a row shows its screenshot
  or recording in the left column; touch screens and narrow windows show it
  under the paragraph.
- **Case studies.** The opening is a label, the title, the summary as a
  lead, the hero screenshot, and the brief as ruled rows. Section titles
  carry their label ("Decision 02") in a narrow column beside them.
  Screenshots sit in a plain ruled frame: the browser bar is now opt-in
  (`frame="browser"`). Decision marks are a thin blue box and label, with
  no dim around them. The next-case-study link is a rule and a title, not a
  plate.
- **Independent project write-ups** (Motif, TransferSight, Neuron Shift)
  use the same case study layout.
- **Portrait.** `public/portrait/louie.webp` is an AI-drawn line portrait
  made from Louie's photo (ElevenLabs, gpt-image), reviewed and picked by
  him. It is drawn on white and blended into the paper with `multiply`.
- **Polish pass (Louie, 2026-10-29).** The left column's links sit 24px
  from the bottom, not 40px. The Ask Louie label is trimmed to its capitals
  (`.trim-caps`, CSS `text-box`) so it centers in the pill. Every page now
  drops the old card styling: `Tag` is plain meta text, `SectionLabel` is
  the meta style, buttons are pills, and the Work, Experiments, AI Systems,
  and About pages use ruled rows and plain white screenshot frames instead
  of rounded cards. Résumé dates and the pending-content note use the meta
  style, not uppercase mono. A 404 page uses the same layout.
- **Deep links wait for fonts and settle.** `DeepLinkHighlight` scrolls
  after `document.fonts.ready`, then realigns once if the smooth scroll
  ended short and the visitor has not scrolled. Under heavy parallel load,
  WebKit phone emulation still misses the target about once in 50 loads.
- **New Offboard screenshots (2026-10-29).** Captured from a QA account
  Louie signed in to, at 2x, with contact details blurred in the page
  before capture: the packet page (`packet-ready.webp`, the case study's
  top image), the same page in the full window (`packet-window.webp`, the
  homepage preview and the Product section), the resume editor with its
  changes shown (`resume-changes.webp`), the Layoff Plan
  (`layoff-plan-steps.webp`), and the new Canvas view (`canvas.webp`, in
  "Give each opportunity a persistent workspace"). New file names, so no
  image cache serves the old pictures. Captions and alt text describe only
  what each screen shows.
- **Decision 01 screenshots replaced (Louie supplied them, 2026-10-29).**
  The old risk-pause and stopped-packet screenshots showed an earlier
  packet page, and the QA account had no packet in either state. Decision
  01 now shows a packet being built, with the ghost check done before the
  resume and cover letter (`packet-building.webp`), and the standalone
  ghost check while it runs (`ghost-checking.webp`) and when it finishes
  (`ghost-result.webp`). Each is cropped to the main area, which also drops
  the account email in the app sidebar. The prose and the diagram still
  describe the pause on a flagged role; no screenshot shows that pause now.
  A decision mark can now set `labelAt` and `labelBelow` when its default
  label position would cover text in the screenshot.
- **Case study contents on the right (Louie, 2026-10-29).** The left
  column was crowded, so from a 1280px canvas the contents float in a
  sticky third column beside the article, with a thin line marking the
  current section. Narrower, they fold into the "On this page" disclosure.
- **Blue buttons keep white text on hover.** The upstream ghost button set
  `hover:text-foreground`, which put dark text on the blue. The Ask Louie
  pill also lifts a pixel, takes a soft blue glow, and turns its sparkle on
  hover (`.ask-pill`).
- **Fonts trial: Inter and Libre Baskerville (Louie, 2026-10-29).** Titles
  are Inter at 600 to 700 with negative tracking; running text is Libre
  Baskerville. Inter is wider than Caslon Condensed, so title sizes step
  down about 15%. Baskerville has a large x-height, so body text is 16px
  with a 1.75 line height. The Caslon files stay in `app/fonts/` so the
  earlier pairing can come back.
- **Portrait on a transparent ground (2026-10-30).** On Louie's iPhone the
  line portrait showed as a white box: it was ink on white, blended into
  the paper with CSS `mix-blend-mode: multiply`, and the phone browser did
  not apply the blend. The file is now ink on transparent
  (`public/portrait/louie-line.webp`), with the old brightness and contrast
  baked in and the alpha set so it matches the old blend on the paper. The
  blend CSS is gone.
- **New portrait (Louie, 2026-10-30).** Louie supplied a pen doodle of
  himself. `public/portrait/louie-doodle.webp` replaces the line portrait,
  made the same way: ink on a transparent ground at 640px.
- **Homepage links (Louie, 2026-10-30).** Louie found the case study links
  hard to find: only the project name was a link, in ink with no underline.
  Each name now has the site's blue link underline and a blue arrow, and the
  whole row opens the case study (the link stretches over the row; a loop's
  pause button stays on top). On hover the name turns blue and the arrow
  moves 4px right. The section titles ("Work I'm proud of") are now the
  grey meta label, so they no longer match the project names in size. The
  dates in "Where I've worked" line up with the company names.
- **Screenshots on a grey mat (Louie, 2026-10-30).** Screenshots "felt
  plopped on to the page". Every screenshot now sits on a light grey mat
  (`.shot-mat`), with 8px corners on the image and a hairline edge and a
  soft shadow under it (`.shot`). The mat's corners are 20px (12px gap) and
  16px on a narrow canvas (8px gap), by the nesting rule. The home page
  screenshots and the hover preview use the same mat.
- **Black accent, red pen marks (Louie, 2026-10-30).** Louie was not sure
  about the blue across the site. The accent is now the ink: the Ask Louie
  pill, link underlines, focus rings, selection, and chart marks. Hover
  text steps to a grey (#5C5C66). This replaces the meodai blue
  (#1A10E6). Decision marks are now a red pen loop around the decision
  with a handwritten note (Caveat), to match the doodle portrait; they
  replace the thin blue box and square label. The pen draws the loop once
  when the mark comes into view (700ms), and not at all under reduced
  motion. A loop near the image edge runs on onto the mat.
