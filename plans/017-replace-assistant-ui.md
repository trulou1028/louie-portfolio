# Plan 017: Replace assistant-ui with AI SDK `useChat` + shadcn chat components

> **Executor instructions**: Follow this plan step by step. Run every
> verification command and confirm the expected result before moving to the
> next step. If anything in the "STOP conditions" section occurs, stop and
> report — do not improvise. When done, update the status row for this plan
> in `plans/README.md` — unless a reviewer dispatched you and told you they
> maintain the index.
>
> **Base commit**: plans 014–016 were merged to `main` on 2026-08-25.
> Branch from `main` at commit `98479f3`, which contains all of them.
>
> Two things changed since this plan was drafted:
> - `ask-panel.tsx` now carries `max-lg:max-h-[80svh]` (plan 016, line 42),
>   not `max-lg:h-auto`.
> - `components/ai/ai-unavailable.tsx` does **not** exist. It was deleted on
>   `main` in `a9304c2` before this work began; a review error briefly
>   restored it, and `36b386f` re-deleted it. Do not recreate it.
>
> **Drift check (run first)**:
> `git diff --stat 98479f3..HEAD -- components/ai lib/ai app/api/chat`
> Expect no output. Anything else is a STOP condition.

## Status

- **Priority**: P2
- **Effort**: L
- **Risk**: HIGH (replaces the entire chat UI layer and its test surface)
- **Depends on**: plans/016-mobile-polish-bundle.md
- **Category**: tech-debt
- **Planned at**: commit `2688643`, 2026-08-25

## Why this matters

`assistant-ui` compiles to an **836KB client chunk**. Total client JavaScript
for the whole site is **1,612KB**, so this one library is **52% of everything
the site ships** — to render a basic question-and-answer box that no longer
uses any of its advanced features.

Plan 014 deliberately removed the things `assistant-ui` is good at:
generative UI, browser-executed tools, and a driven context panel. What
remains is a text transcript and a composer. The AI SDK's `useChat` hook plus
shadcn's chat components cover that, at a fraction of the weight.

The weight is not just a performance cost — it is the **root of the
reliability problems**:

- The chunk is so large it must be lazy-loaded, which is why
  `ai-louie-thread.tsx` exists at all: an `IntersectionObserver` gate, a
  loading skeleton, and a greeting duplicated in two files that must stay
  byte-identical.
- The dev server was observed getting permanently stuck on that loading
  skeleton (production builds load it in ~1s).
- `IntersectionObserver` does not fire under some browser automation, so the
  panel appears permanently stuck during manual testing when it is fine —
  this produced two false bug reports during plans 015 and 016.

Remove the heavy runtime and the lazy-load apparatus becomes unnecessary. The
skeleton, the observer, the duplicated greeting, and the whole class of
false-alarm testing problems go away with it.

**You are already on this stack.** Comparing `package.json` against
[shadcn-ui/chatbot-template](https://github.com/shadcn-ui/chatbot-template):
both use Next 16, React 19, AI SDK 7 (`ai@^7`), `@ai-sdk/react@^4`,
`@ai-sdk/openai@^4`, `@base-ui/react@^1.7`, `shadcn@^4`, `zod@^4`,
`tailwind-merge`, `tw-animate-css`, `lucide-react`, and
`class-variance-authority`. The only meaningful difference in the chat layer
is `@assistant-ui/react` + `@assistant-ui/react-ai-sdk` versus `@shadcn/react`
plus shadcn's chat components. This is a swap of one layer, not a rewrite of
the stack.

## Current state

Five files make up the chat UI. Line counts and roles:

- `components/ai/ai-louie-live.tsx` (253 lines) — the thread. Key symbols:
  - `SUGGESTIONS` (line 44) — exactly three prompts, plus a
    `JobDescriptionDialog` trigger rendered as a fourth list item.
  - `AssistantAvatar` (50), `UserMessage` (61), `ThinkingIndicator` (85),
    `AssistantMessage` (111), `ThreadError` (135), `ThreadBody` (150),
    `AiLouieLive` (245, default export).
  - Uses `MessagePrimitive.Root`, `MessagePrimitive.Parts`,
    `ThreadPrimitive.Root/Viewport/Empty/Messages/Suggestion`, and
    `useAuiState` — all from `@assistant-ui/react`.
  - `MessagePrimitive.Parts components={{ Reasoning: () => null }}` appears
    **twice** (lines 70, 123). This is a deliberate guarantee: spec §21
    forbids showing chain-of-thought. **The replacement must preserve it** —
    when switching on part types, render nothing for `reasoning` parts.
  - `ThinkingIndicator` (85–108) reads `useAuiState((s) => s.message.status?.type)`
    and the part-type signature, showing an animated line whenever the status
    is `running` and the last part is not text. Its dots use the
    `.ai-thinking-dot` class and `@keyframes ai-thinking-dot` added to
    `app/globals.css` by plan 014.
- `components/ai/ai-louie-runtime.tsx` — three lines of real work:
  ```tsx
  const runtime = useChatRuntime({
    transport: new AssistantChatTransport({ api: "/api/chat" }),
  });
  return <AssistantRuntimeProvider runtime={runtime}>{children}</AssistantRuntimeProvider>;
  ```
- `components/ai/ai-louie-composer.tsx` — `ComposerPrimitive.Root/Input/Send/Cancel`
  wrapped in `ThreadPrimitive.If running` / `running={false}`. The textarea's
  `aria-label` is **"Ask anything about Louie's work"**, which is a contract:
  `ask-panel.tsx`'s `AskAILouieLink` focuses the composer with the selector
  `'#ask-ai-louie textarea[aria-label="Ask anything about Louie\'s work"]'`,
  and e2e tests query that role+name.
- `components/ai/ai-louie-thread.tsx` (107 lines) — the lazy-load wrapper:
  `dynamic(() => import("@/components/ai/ai-louie-live"))`, an
  `IntersectionObserver` with `rootMargin: "600px"`, and `ThreadSkeleton`,
  which duplicates the greeting verbatim.
- `components/ai/ask-panel.tsx` (107 lines) — panel chrome. **Plan 016
  changes its height classes; re-read it before starting.**

**Server side is out of scope and must not change.** `app/api/chat/route.ts`
already speaks the AI SDK's UI message stream protocol via
`result.toUIMessageStreamResponse()`, which is exactly what `useChat`
consumes. `search_portfolio` and `compare_job_description` run server-side and
are unaffected.

### What the replacement provides

From the June 2026 shadcn chat components
([changelog](https://ui.shadcn.com/docs/changelog/2026-06-chat-components)),
installed with `pnpm dlx shadcn@latest add message-scroller message bubble marker`:

- **`MessageScroller`** — replaces the hand-rolled `ThreadPrimitive.Viewport`.
  Parts: `MessageScrollerProvider` (headless root; props `autoScroll`,
  `defaultScrollPosition` of `"start" | "end" | "last-anchor"`,
  `scrollPreviousItemPeek`), `MessageScroller`, `MessageScrollerViewport`,
  `MessageScrollerContent` (carries `role="log"` and
  `aria-relevant="additions"`), `MessageScrollerItem` (props `messageId`,
  `scrollAnchor`), `MessageScrollerButton`.
- **`Message`** — replaces the hand-rolled row layout. Parts: `Message`
  (prop `align: "start" | "end"`), `MessageGroup`, `MessageAvatar`,
  `MessageContent`, `MessageHeader`, `MessageFooter`.
- **`Bubble` / `BubbleContent`** — the message surface.
- **`Marker`** — status rows for streaming state; a `shimmer` CSS utility
  ships with `shadcn/tailwind.css` for animated status text.

The template's own `components/chat.tsx` uses
`useChat<ChatUIMessage>()` and destructures `messages`, `sendMessage`,
`status`, `stop`, `error`, and `addToolOutput`; it shows a "Thinking…"
indicator while `status === "submitted"`. Its `chat-message.tsx` switches on
`part.type` and renders a `TextPart` for `"text"`, passing an `isStreaming`
prop. That is the shape to follow.

### What NOT to adopt from the template

- **Vercel AI Gateway** (`@ai-sdk/gateway`). This site calls OpenAI directly
  through `lib/ai/provider.ts` with the operator's own key. Do not add the
  gateway, and do not add `@ai-sdk/anthropic`.
- **Tool-calling and generative UI parts** (`tool-github_repo`,
  `tool-ask_user`, `tool-web_search`, `QuestionCard`). Plan 014 removed the
  browser-executed tools by owner decision. Do not reintroduce them.
- **`next-themes`.** Theming is already handled.
- **Markdown rendering** (`react-markdown` + `remark-gfm`). Tempting, and
  probably a future improvement, but it is a new output surface and spec §32
  requires that nothing the model returns is rendered as HTML. **Out of scope
  for this plan** — keep rendering text parts as plain text, exactly as today.
  Raise it separately.

## Commands you will need

| Purpose   | Command            | Expected on success |
|-----------|--------------------|---------------------|
| Install   | `pnpm install`     | exit 0 |
| Add components | `pnpm dlx shadcn@latest add message-scroller message bubble marker` | components written to `components/ui/` |
| Typecheck | `pnpm typecheck`   | exit 0 |
| Lint      | `pnpm lint`        | exit 0 |
| Unit      | `pnpm test`        | all pass |
| E2E       | `pnpm test:e2e`    | all pass |
| Build     | `pnpm build`       | exit 0 |

**Browser verification**: use a production build (`pnpm build && pnpm start
--port 3103` or higher — 3101/3102 may be in use). Do **not** use `pnpm dev`
for judging the chat panel. After this plan the panel is no longer lazy-loaded,
so the `IntersectionObserver` false-alarm problem should disappear — if you
still see the panel not rendering under automation, run
`new IntersectionObserver(() => console.log('fired')).observe(document.body)`
as a control before concluding anything.

## Scope

**In scope**:
- `components/ai/ai-louie-live.tsx` (rewrite)
- `components/ai/ai-louie-runtime.tsx` (likely delete — `useChat` needs no provider)
- `components/ai/ai-louie-composer.tsx` (rewrite)
- `components/ai/ai-louie-thread.tsx` (simplify or delete)
- `components/ai/ask-panel.tsx` (only if the wrapper changes shape)
- `components/ui/*` (new files written by the `shadcn add` command)
- `package.json` / `pnpm-lock.yaml` (remove assistant-ui, add `@shadcn/react`)
- `app/globals.css` (only to remove the now-unused `ai-thinking-dot` keyframe
  if `Marker`/`shimmer` replaces it)
- `e2e/ai-louie.spec.ts`, `e2e/home.spec.ts` (selector updates)

**Narrowly in scope — `app/api/chat/route.ts`, two lines only.** An earlier
revision of this plan put this file out of scope entirely, which made the plan
impossible to satisfy: the file imports a **type** from the very package Step 4
removes.

`app/api/chat/route.ts:2`:
```ts
import type { FrontendTools } from "@assistant-ui/react-ai-sdk";
```
used once, at `route.ts:44`:
```ts
tools: z.record(z.string(), z.custom<FrontendTools[string]>()).optional(),
```

That `tools` field is the legacy "accepted and ignored" field plan 014 kept for
cached clients. `z.custom<T>()` with no validator performs **no runtime
checking**, so the type parameter is decorative — replacing it with
`z.unknown()` is runtime-identical.

Make exactly this change and nothing else in this file:
- delete the `import type { FrontendTools }` line
- change that one field to `tools: z.record(z.string(), z.unknown()).optional()`
- keep the surrounding comment, updating only the wording that names
  assistant-ui

**Every other line of `route.ts` must be untouched**, and everything in
`lib/ai/` remains fully out of scope. If you find yourself needing any further
server change, STOP.

**Out of scope**:
- Everything in `lib/ai/` — the retrieval, prompt, rate limit, and job-fit
  logic must not change. If you believe it must, STOP.
- Any behavioral change to `route.ts`: the streaming, the tools passed to
  `streamText`, `stopWhen`, the size limits, and every error path stay exactly
  as they are.
- `components/ai/job-description-dialog.tsx`, `job-fit-result.tsx`, and the
  job-fit flow — it does not use `assistant-ui` primitives. Its trigger must
  keep rendering as the fourth item beside the three suggestion pills.
- `lib/ai/system-prompt.ts` — the scope harness and spec rules stay as they are.
- The rail breakpoint and any `lg`/`xl` guard — plan 015 settled that across
  five files.

## Git workflow

- Branch `plan-017`, created from **plan 016's tip** (not `2688643`).
- Commit per step; message style matches `git log` (short imperative).
- Do NOT push or open a PR.

## Steps

### Step 1: Install the shadcn chat components and inspect what landed

Run `pnpm dlx shadcn@latest add message-scroller message bubble marker`.

These are copied into the repo (shadcn's model), not added as a dependency, so
**read every file it writes** before using it. Confirm:
- Which files were created under `components/ui/`.
- Whether it added `@shadcn/react` to `package.json`.
- Whether it modified `app/globals.css` or a Tailwind config, and what it added
  (the `shimmer` and `scroll-fade` utilities ship with `shadcn/tailwind.css`).

If the command wants to overwrite an existing component you already rely on
(check `components/ui/` first), STOP and report which file and what differs.

**Verify**: `pnpm typecheck` → exit 0. `git status` shows only new
`components/ui/` files plus dependency/CSS changes. Report the file list.

### Step 2: Rewrite the thread on `useChat`

Rewrite `components/ai/ai-louie-live.tsx` to use `useChat` from
`@ai-sdk/react` pointed at `/api/chat`, rendering with the shadcn components.

Requirements that are contracts, not preferences:

1. **No chain-of-thought.** When switching on `part.type`, render `"text"`
   parts and render **nothing** for `"reasoning"` parts. This replaces the two
   `components={{ Reasoning: () => null }}` overrides. Keep a comment saying
   why (spec §21).
2. **Exactly three suggestions**, the same strings as today, plus the
   `JobDescriptionDialog` trigger as the fourth list item. Suggestions appear
   only while the conversation is empty and send on click.
3. **Assistant messages flow under the avatar** at full panel width (a Plan
   014 owner decision). With shadcn's `Message`, that means the avatar and the
   content stack vertically rather than sitting in a row — verify visually, and
   if `Message`'s row layout fights this, keep the layout and use the shadcn
   parts only where they help. Do not silently revert to avatar-beside-text.
4. **User messages** stay right-aligned and quiet (`Message align="end"` with a
   `Bubble`).
5. **The thinking state stays animated** and appears from the moment the
   request is in flight — including before any part arrives, which the old
   `ComposingIndicator` missed. Use `Marker` with the `shimmer` utility if it
   gives an equivalent or better result; otherwise keep the existing
   `.ai-thinking-dot` markup. Say which you chose.
6. **The error state** keeps the spec §31 copy verbatim: "AI Louie is
   temporarily unavailable. You can still explore all of Louie's work below."
   Drive it from `useChat`'s `error`. An e2e test asserts this string.
7. **The greeting** keeps its current wording exactly: "Hi — ask me anything
   about Louie's work. I answer from his case studies and project evidence."

Use `MessageScrollerProvider autoScroll` with `MessageScrollerItem
messageId={message.id} scrollAnchor={message.role === "user"}`.

**Verify**: `pnpm typecheck` → exit 0, `pnpm lint` → exit 0.

### Step 3: Rewrite the composer

Rewrite `components/ai/ai-louie-composer.tsx` as a plain form calling
`sendMessage`, with a stop control while streaming.

**The textarea's `aria-label` must stay exactly `Ask anything about Louie's
work`** and the placeholder `Ask anything about Louie's work...`. Both the
hero's focus selector in `ask-panel.tsx` and several e2e tests depend on it.

Keep the send/stop swap: send button when idle, stop button while streaming
(`status` is `"submitted"` or `"streaming"`), driven by `useChat`'s `stop`.
There must be **no** microphone, attachment, or "deep research" control — an
e2e test asserts their absence.

Pass `useChat`'s values down however is cleanest (props or a small context);
do not reach for a global store.

**Verify**: `pnpm typecheck`, `pnpm lint` → exit 0.

### Step 4: Remove the lazy-load apparatus

With `assistant-ui` gone, the chat should be small enough to render directly.

- Delete `components/ai/ai-louie-runtime.tsx` (`useChat` needs no provider).
- Simplify `components/ai/ai-louie-thread.tsx`: drop the `dynamic()` import,
  the `IntersectionObserver`, and `ThreadSkeleton`, keeping only the
  `aria-live="polite"` wrapper that announces new answers (spec §26). If it
  becomes a trivial wrapper, fold it into `ask-panel.tsx` and delete the file.
- Remove `@assistant-ui/react` and `@assistant-ui/react-ai-sdk` from
  `package.json`, then `pnpm install`.

**Before deleting the lazy load, measure.** Build and check the total client
JS. If dropping the dynamic import pushes the largest shared chunk above
roughly 400KB, STOP and report the number — keeping a `dynamic()` import
without the observer gate would be the fallback, and that is worth a decision
rather than a guess.

**Verify**:
- `grep -rn "assistant-ui" components lib app package.json` → no matches
- `find .next/static/chunks -name "*.js" -exec du -k {} + | awk '{s+=$1} END {print s}'`
  → report the number. Baseline before this plan: **1,612 KB total, largest
  chunk 836 KB.**
- `pnpm build` → exit 0

### Step 5: Reconcile the tests

Update `e2e/ai-louie.spec.ts` and `e2e/home.spec.ts` for the new DOM.

**Do not weaken any assertion.** These must still pass, adjusted only for
selectors:
- the greeting text, the three suggestion labels, and the absence of the two
  removed ones
- the composer's accessible name
- no microphone/attachment/research controls
- the spec §31 failure copy
- the "declares no client tools" assertion (per-tool `not.toContain`)
- the endpoint limit tests (these hit the API directly and should need no change)
- `home.spec.ts`'s rail landmark and heading assertions

Several tests currently scroll to the panel to trigger the lazy runtime
(`scrollToAskPanel`). With the runtime no longer lazy, those scrolls become
unnecessary — you may simplify the helper, but **only after** the suite passes
with it unchanged, so a failure is never ambiguous.

Add one new test: the panel renders its composer **without any scrolling** at
a desktop viewport, proving the lazy gate is gone.

**Verify**: `pnpm test:e2e` → all pass. Baseline on merged `main`: **165
passed, 7 skipped, 0 failed** (plan 016 added two mobile-only tests, which is
why the skip count rose from 5). Report your numbers against that baseline.

### Step 6: Confirm behavior end to end

On a production build at 1440×900 and at 375×812, with a real API key present:

1. Ask "Tell me about Flexi" and confirm a grounded answer streams in.
2. Ask something off-topic ("write me a poem") and confirm the scope harness
   still declines and redirects. This is server-side and should be unaffected —
   if it is not, something in the message format regressed, so STOP.
3. Confirm the job-description dialog still opens and completes.
4. Confirm the thinking state animates from the moment you hit send.

**Verify**: report what you observed for each, with the measured panel and
composer positions at 375×812 (plan 016's criteria must still hold).

## Test plan

- The existing 163 e2e tests must pass, selectors updated but assertions
  intact.
- One new test: composer present without scrolling at desktop.
- Unit tests (`lib/ai/*`) should be untouched and still pass — 66 at baseline.
- Manual production-build pass per Step 6.

## Done criteria

ALL must hold:

- [ ] `pnpm typecheck`, `pnpm lint`, `pnpm test`, `pnpm test:e2e`, `pnpm build` all exit 0
- [ ] `grep -rn "assistant-ui" components lib app package.json` → no matches
- [ ] Total client JS is **meaningfully below 1,612 KB**; report the number and
      the largest single chunk (baseline 836 KB)
- [ ] `pnpm test` still reports 66 passing unit tests (server logic untouched)
- [ ] e2e count is at least the 165 baseline, with no assertion weakened
- [ ] `git diff 98479f3..HEAD -- app/api/chat/route.ts` shows **only** the
      `FrontendTools` import removal and the one `tools:` field line
- [ ] The composer's accessible name is still "Ask anything about Louie's work"
- [ ] Exactly three suggestion pills plus the job-description trigger
- [ ] Assistant messages still flow under the avatar at full width
- [ ] Reasoning parts render nothing
- [ ] No files outside the in-scope list modified (`git status`)

## STOP conditions

Stop and report back (do not improvise) if:

- `shadcn add` wants to overwrite a `components/ui/` file already in use.
- The shadcn chat components require a React or Base UI version the repo does
  not have. Do **not** upgrade React or Next to satisfy them.
- Removing the dynamic import pushes the largest chunk above ~400KB.
- Making assistant messages flow under the avatar fights `Message`'s layout
  such that you would have to abandon either the shadcn component or the Plan
  014 layout decision — report the tradeoff rather than picking one.
- Any server file under `lib/ai/` or `app/api/chat/` appears to need changes.
- More than five existing e2e tests fail after selector updates — that suggests
  a behavioral regression, not a selector mismatch.
- The off-topic guardrail stops working (Step 6.2).

## Maintenance notes

- shadcn components are **copied into the repo**, not versioned dependencies.
  They will not update with `pnpm update`; re-running `shadcn add` later
  overwrites local edits. Keep customizations thin and documented.
- Markdown rendering (`react-markdown` + `remark-gfm`) is the obvious next
  improvement and was deliberately excluded here. It needs its own review
  against spec §32 (never render model output as HTML) before adoption.
- If the panel ever regains tool calling or generative UI, re-evaluate this
  decision — `assistant-ui` earns its weight in that world, and plan 014's
  removal of those features is what makes this swap correct today.
- After this lands, the "AI panel appears stuck under browser automation"
  hazard documented in plans 015 and 016 should be gone, because the panel no
  longer depends on `IntersectionObserver`. Confirm and remove those warnings
  from the plan docs when reconciling.
