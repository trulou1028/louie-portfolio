# Plan 018: Render markdown in chat answers, and center the send button on one line

> **Executor instructions**: Follow this plan step by step. Run every
> verification command and confirm the expected result before moving to the
> next step. If anything in the "STOP conditions" section occurs, stop and
> report — do not improvise. When done, update the status row for this plan
> in `plans/README.md` — unless a reviewer dispatched you and told you they
> maintain the index.
>
> **Base**: branch from `main` at commit `24bbc68` (plans 014–017 all merged).
>
> **Drift check (run first)**:
> `git diff --stat 24bbc68..HEAD -- components/ai app/globals.css package.json`
> Expect no output. Anything else is a STOP condition.

## Status

- **Priority**: P2
- **Effort**: M
- **Risk**: MED for step 1 (renders model output), LOW for step 2
- **Depends on**: plan 017 (merged)
- **Category**: bug / dx
- **Planned at**: commit `24bbc68`, 2026-08-25

## Why this matters

Two owner-reported issues, unrelated to each other except that both live in
the chat composer/thread.

**1. Answers show raw markdown.** The model writes in markdown and the panel
renders text parts as plain strings, so a real answer currently reads:

> One of the key projects related to Flexi is titled **\"The answer is not the
> end of the interaction.\"** … Key aspects include: - **Conversational UX:**
> Designing interactions that adapt…

Literal asterisks and hyphens instead of bold text and a bullet list. This has
always been true — it is not a plan 017 regression — but it is the most
visible quality gap left in the panel. Verified live against the real model on
2026-08-25.

**2. The send button sits low when the input is one line.** The composer form
is `items-end`, so the button bottom-aligns with the textarea. The arithmetic:
`--text-body` is `1rem` with `--text-body--line-height: 1.65` → a 26.4px line,
plus `py-2.5` (10px top + 10px bottom) → a **46.4px** single-line textarea.
The button is `size-9` → **36px**. Bottom-aligned, its center sits **~5.2px**
below the textarea's center, which is what the owner sees.

Owner's decision on the desired behavior: **centered when the input is a
single line; bottom-aligned once it wraps to multiple lines.**

## Current state

`components/ai/ai-louie-composer.tsx` (97 lines, rewritten by plan 017):

```tsx
  const isStreaming = status === "submitted" || status === "streaming";
  const textareaRef = React.useRef<HTMLTextAreaElement>(null);

  React.useLayoutEffect(() => {
    const el = textareaRef.current;
    if (!el) return;
    el.style.height = "auto";
    el.style.height = `${el.scrollHeight}px`;
  }, [value]);

  return (
    <form
      onSubmit={onSubmit}
      className="flex items-end gap-2 rounded-panel border border-border-default bg-surface p-1.5 focus-within:border-border-strong"
    >
      <textarea
        ref={textareaRef}
        rows={1}
        ...
        className="max-h-40 flex-1 resize-none bg-transparent px-2 py-2.5 text-body text-foreground outline-none placeholder:text-foreground-muted"
      />
```

The auto-resize effect already measures `scrollHeight`, so the single-vs-multi
line signal is available there — no new measurement pass is needed.

`components/ai/ai-louie-live.tsx` — how text parts render today (around line
85):

```tsx
function MessageParts({ parts }: { parts: UIMessage["parts"] }) {
  return (
    <>
      {parts.map((part, index) =>
        part.type === "text" ? (
          <p key={index}>{part.text}</p>
        ) : null,
      )}
    </>
  );
}
```

**The `part.type === "text"` guard and the `null` for everything else is a
contract** — spec §21 forbids showing chain-of-thought, and reasoning-capable
models stream `reasoning` parts. Markdown rendering must happen *inside* the
text branch and must not loosen that guard.

`UserMessage` renders the visitor's own text in a `Bubble`. **Do not render
user text as markdown** — echoing a visitor's input through a markdown parser
is a needless surface, and their message is not authored content.

### The repo's markdown convention

`mdx-components.tsx` maps markdown elements to explicit styled components for
case studies. Follow the same approach — an explicit element map, repo tokens
only — but scaled for the narrow panel (`text-body-sm`, tighter spacing), not
the 68ch article column. Its existing mapping, for reference:

```tsx
p: ({ children }) => (
  <p className="mt-4 max-w-[68ch] text-body text-foreground-muted">{children}</p>
),
ul: ({ children }) => (
  <ul className="mt-4 flex max-w-[68ch] flex-col gap-2">{children}</ul>
),
ol: ({ children }) => (
  <ol className="mt-4 flex max-w-[68ch] list-decimal flex-col gap-2 pl-5">{children}</ol>
),
li: ({ children }) => (
  <li className="text-body text-foreground-muted">{children}</li>
),
strong: ({ children }) => (
  <strong className="font-medium text-foreground">{children}</strong>
),
```

`app/globals.css` imports `shadcn/tailwind.css` but **`shadcn/typeset` is not
installed** (checked: no `node_modules/shadcn/typeset.css`). Do not try to use
it; write an explicit element map instead.

### Security constraint — non-negotiable

Spec §32: nothing the model returns is rendered as HTML. `react-markdown` does
not render raw HTML by default; it only does so if `rehype-raw` is added.

**Do not install or use `rehype-raw`.** Do not pass `skipHtml={false}`-style
escapes or any plugin that re-enables HTML. Step 1 requires a test proving a
model response containing markup renders as visible text, not as live DOM.

## Commands you will need

| Purpose   | Command            | Expected on success |
|-----------|--------------------|---------------------|
| Install   | `pnpm install`     | exit 0 |
| Add deps  | `pnpm add react-markdown remark-gfm` | exit 0 |
| Typecheck | `pnpm typecheck`   | exit 0 |
| Lint      | `pnpm lint`        | exit 0 |
| Unit      | `pnpm test`        | 66 pass |
| E2E       | `pnpm test:e2e`    | 166 passed / 8 skipped / 0 failed at baseline |
| Build     | `pnpm build`       | exit 0 |

**Browser note**: use a production build (`pnpm build && pnpm start --port
3105` or higher; 3101–3104 may be in use). The AI panel is lazy-loaded behind
an `IntersectionObserver`, and **those callbacks do not fire under browser
automation** — the panel will sit on its loading skeleton and look broken when
it is fine. This has produced several false bug reports. Run the control
`new IntersectionObserver(() => console.log('fired')).observe(document.body)`
before concluding anything, and treat `pnpm test:e2e` (Playwright, production
build) as the source of truth.

## Scope

**In scope**:
- `components/ai/ai-louie-live.tsx` (markdown rendering in the text branch)
- `components/ai/ai-louie-composer.tsx` (alignment)
- `package.json` / `pnpm-lock.yaml` (`react-markdown`, `remark-gfm`)
- `e2e/ai-louie.spec.ts` (new tests)
- A new `components/ai/answer-markdown.tsx` if the element map is cleaner in
  its own file (preferred if it exceeds ~30 lines)

**Out of scope**:
- `mdx-components.tsx` — the case-study mapping stays as it is. Do not try to
  share one map between an article column and a narrow chat panel.
- `lib/ai/system-prompt.ts` — do **not** instruct the model to change its
  formatting. Rendering markdown is the fix; prompt changes are not.
- Everything under `lib/ai/` and `app/api/chat/route.ts`.
- `components/ai/ai-louie-thread.tsx` and the lazy-load structure — plan 017
  settled that deliberately.
- `components/ui/*` — the shadcn components are copied-in vendor code.

## Git workflow

- Branch `plan-018`, created from `24bbc68`.
- Commit per step (two commits).
- Do NOT push or open a PR.

## Steps

### Step 1: Render assistant answers as markdown

Add the dependencies: `pnpm add react-markdown remark-gfm`.

Render the **text branch only** through `react-markdown` with `remark-gfm`
(GitHub-flavored markdown, so tables and strikethrough behave). Supply an
explicit `components` map styled for the panel, following the
`mdx-components.tsx` convention above but using `text-body-sm` and tight
spacing — the panel is ~318px wide on desktop, not an article column.

Cover at minimum: `p`, `strong`, `em`, `ul`, `ol`, `li`, `code`, `pre`, `a`,
`h1`–`h4` (map headings down to something modest — a chat answer should not
render a display-sized heading inside a 318px rail), and `blockquote`.

For `a`, reuse the repo's existing link treatment and make external links open
safely (`target="_blank" rel="noreferrer noopener"`), matching
`components/system/inline-link.tsx`.

Constraints:
- The `part.type === "text"` guard and the `null` fallthrough for every other
  part type must be unchanged. Reasoning parts still render nothing.
- No `rehype-raw`, no HTML passthrough.
- `UserMessage` keeps rendering plain text.
- Streaming re-renders the markdown on every chunk. That is expected; if it
  visibly flickers, note it rather than adding memoization complexity.

**Verify**:
- `pnpm typecheck`, `pnpm lint` → exit 0
- `grep -rn "rehype-raw" package.json components` → no matches
- `pnpm test:e2e` → the existing 166 still pass

### Step 2: Prove markdown is rendered and HTML is not

Add two tests to `e2e/ai-louie.spec.ts`, mocking `/api/chat` with the AI SDK
UI message stream shape that the existing "keeps the composer in view after a
long answer" test already uses as a working example.

1. **Markdown renders as elements.** Mock an answer containing `**bold**`, a
   `- bullet` list, and `` `code` ``. Assert the panel contains a real
   `<strong>`, a real `<li>`, and a real `<code>` — and assert the literal
   string `**bold**` does **not** appear as visible text.
2. **HTML is not rendered (spec §32).** Mock an answer containing
   `<img src=x onerror="window.__pwned=1">` and `<script>window.__pwned=1</script>`.
   Assert that `page.evaluate(() => window.__pwned)` is `undefined`, that the
   panel contains **no** `img` or `script` element inside `#ask-ai-louie`, and
   that the markup appears as visible text instead.

Test 2 is the one that matters. Write it so it would genuinely fail if
`rehype-raw` were ever added.

**Verify**: `pnpm test:e2e` → all pass, now 166 + the new tests.

### Step 3: Center the send button on a single line

In `components/ai/ai-louie-composer.tsx`, switch the form between
`items-center` (single line) and `items-end` (wrapped).

The existing `useLayoutEffect` already computes `el.scrollHeight`; derive the
signal there rather than adding a second measurement. Compare the measured
height against one line plus the textarea's vertical padding, read from
computed style rather than hardcoded (the tokens can change):

```tsx
const lineHeight = parseFloat(styles.lineHeight);
const padding = parseFloat(styles.paddingTop) + parseFloat(styles.paddingBottom);
const multiline = el.scrollHeight > lineHeight + padding + 1;
```

The `+ 1` absorbs sub-pixel rounding — `26.4 + 20 = 46.4px` for one line, so a
strict `>` on an un-padded comparison would flip spuriously.

**Lint note**: calling a state setter inside a layout effect may trip
`react-hooks/set-state-in-effect`. The repo has one documented precedent for
this pattern with a targeted `eslint-disable-next-line` and a comment
explaining why — see `lib/use-breakpoint.ts`. If the rule fires, follow that
precedent exactly: disable the single line and explain. Do **not** disable the
rule globally, and do **not** restructure the auto-resize to avoid it in a way
that breaks the growing textarea.

If you find a pure-CSS solution that needs no state at all, prefer it, and say
what you did.

**Verify**: `pnpm typecheck`, `pnpm lint` → exit 0.

### Step 4: Prove the alignment, both states

Add one test to `e2e/ai-louie.spec.ts` measuring the button's center against
the textarea's center:

- **Single line**: type `hello there`. The vertical centers must be within
  **2px** of each other. (Before this fix they differ by ~5.2px, so a 2px
  tolerance genuinely discriminates.)
- **Multi-line**: fill with text long enough to wrap to 3+ lines. Assert the
  button's **bottom** edge is within 2px of the textarea's bottom edge, i.e.
  it stays bottom-aligned.

Measure with `boundingBox()` on the textarea and the send button.

**Verify**: `pnpm test:e2e` → all pass. `pnpm build` → exit 0.

## Test plan

- Two markdown tests (renders elements; does not render HTML).
- Two alignment assertions (single line centered; multi-line bottom-aligned).
- All 166 existing e2e tests still pass, unweakened.
- 66 unit tests unaffected.

## Done criteria

ALL must hold:

- [ ] `pnpm typecheck`, `pnpm lint`, `pnpm test`, `pnpm test:e2e`, `pnpm build` all exit 0
- [ ] `pnpm test` still reports 66 passing
- [ ] e2e count is at least 166 + the new tests, with no existing assertion weakened
- [ ] `grep -rn "rehype-raw" package.json components` → no matches
- [ ] A mocked answer containing `<script>` sets no global and injects no
      `script`/`img` element inside `#ask-ai-louie`
- [ ] Single-line send button center is within 2px of the textarea center
- [ ] Multi-line send button stays bottom-aligned within 2px
- [ ] `part.type === "text"` guard unchanged; reasoning parts still render nothing
- [ ] User messages still render as plain text, not markdown
- [ ] Report the new total client JS against the **1,280 KB** baseline
- [ ] No files outside the in-scope list modified (`git status`)

## STOP conditions

Stop and report back (do not improvise) if:

- Any test in Step 2 shows model-supplied HTML reaching the DOM. That is a
  spec §32 violation — stop immediately, do not attempt a sanitizer of your
  own.
- `react-markdown` pulls the client bundle up by more than ~100 KB over the
  1,280 KB baseline. Report the number; a lighter renderer would then be worth
  a decision rather than a guess.
- The alignment fix requires changing the textarea's padding or font tokens —
  those are design-system values, not composer details.
- Streaming markdown visibly breaks mid-stream (e.g. a half-written `**`
  causing layout thrash) in a way you judge worse than the current plain text.
  Report what you saw rather than adding memoization or debouncing.
- More than two existing e2e tests fail.

## Maintenance notes

- `react-markdown`'s safety property is that it does not pass HTML through.
  That is a default, not a lock — any future addition of `rehype-raw` silently
  reopens it. The Step 2 test is the guard; keep it.
- The element map is chat-specific on purpose. If case studies and chat ever
  need to share typography, that is a design-system decision, not a refactor
  to do in passing.
- The alignment threshold reads line height and padding from computed style,
  so it survives a change to `--text-body--line-height`. If the composer ever
  gains a second row of controls, revisit — the single-vs-multi line signal
  assumes the textarea is the only thing setting the form's height.
