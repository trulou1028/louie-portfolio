# Plan 023: Close the image hole in answers, and tell visitors the truth about 413s and 429s

> **Executor instructions**: Follow this plan step by step. Run every
> verification command and confirm the expected result before moving to the
> next step. If anything in the "STOP conditions" section occurs, stop and
> report — do not improvise. When done, update the status row for this plan
> in `plans/README.md` — unless a reviewer dispatched you and told you they
> maintain the index.
>
> **Drift check (run first)**: `git diff --stat 50e98a4..HEAD -- components/ai/answer-markdown.tsx components/ai/ai-louie-composer.tsx components/ai/ai-louie-live.tsx e2e/ai-louie.spec.ts`
> If any in-scope file changed since this plan was written, compare the
> "Current state" excerpts against the live code before proceeding; on a
> mismatch, treat it as a STOP condition.

## Status

- **Priority**: P1
- **Effort**: S
- **Risk**: LOW
- **Depends on**: 022 — **SATISFIED.** 022 merged 2026-09-02 and
  `lib/ai/schemas.ts:70` now exports `MAX_CHARS_PER_MESSAGE = 16_000`.
  Step 3 imports it directly; the local-constant fallback in the STOP
  conditions is no longer needed.
- **Category**: security + bug
- **Planned at**: commit `50e98a4`, 2026-08-31. **Refreshed 2026-09-02** at
  `46c93b9` after 020 and 022 merged: the three component files in scope are
  byte-identical to when this was written, and the `e2e/ai-louie.spec.ts`
  anchors below were re-verified against the current file.
- **Recommended executor model**: **Sonnet 5.** Three small, fully specified edits with e2e coverage patterns already in the file.

## Why this matters

`components/ai/answer-markdown.tsx` carefully allowlists link hrefs through `resolveAnswerLink` — but defines no `img` renderer, so `react-markdown`'s default emits a live `<img src>` for any `![](https://…)` the model writes. An image fetches without a click. Combined with no CSP (Plan 024), a prompt-injected answer can make the visitor's browser request an attacker-chosen URL — the standard markdown exfiltration channel — and can place arbitrary imagery inside a hiring portfolio. The existing e2e injection test only covers raw HTML (`<img … onerror>` as text), not markdown image syntax.

Separately, the composer's target user — a recruiter pasting a long job description straight into the chat box instead of the dialog — gets a silent 413 and is told "AI Louie is temporarily unavailable"; a rate-limited visitor gets the same copy. The job-description dialog already distinguishes `rate_limited` from a generic failure and caps its textarea at 15,000 characters; the composer does neither. This is a consistency fix, not new design.

## Current state

- `components/ai/answer-markdown.tsx:25-95` — the `components` map defines `p, strong, em, ul, ol, li, h1–h4, blockquote, code, pre, a`. No `img`. The `a` handler:
  ```tsx
  a: ({ href, children }) => {
    const link = resolveAnswerLink(href);
    if (link.kind === "invalid") return <>{children}</>;
    return <InlineLink href={link.href}>{children}</InlineLink>;
  },
  ```
- `components/ai/ai-louie-composer.tsx:82-102` — `<textarea ref={textareaRef} rows={1} … value={value} onChange={…} onKeyDown={…} className="max-h-40 …" />` with **no `maxLength`**. Its docblock (`:48-51`) says a pasted job description "should not be trapped in a one-line box".
- `components/ai/ai-louie-live.tsx:200-217`:
  ```tsx
  function ThreadError({ error }: { error: Error | undefined }) {
    if (!error) return null;
    return (
      <Surface role="status" className="border-danger/30 bg-surface p-4 text-body-sm text-foreground-muted">
        AI Louie is temporarily unavailable. You can still explore all of
        Louie&rsquo;s work below.
      </Surface>
    );
  }
  ```
  The `error` argument is ignored. `useChat` sets `error.message` to the response body text for non-2xx responses (the route returns `{"error":"rate_limited"}` / `{"error":"message_too_long"}` / `{"error":"conversation_too_long"}` with 429 / 413 / 413 — see `app/api/chat/route.ts:56-90`).
- The dialog's pattern to mirror, `components/ai/job-description-dialog.tsx:56-66`:
  ```ts
  if (!response.ok) {
    const body = (await response.json().catch(() => null)) as { error?: string } | null;
    setPhase({ status: "error", message: body?.error === "rate_limited"
      ? "Too many comparisons just now. Please try again in a few minutes."
      : "That comparison couldn’t be completed. You can still explore the work directly." });
  ```
  and its textarea at `:143` has `maxLength={15_000}`.
- `e2e/ai-louie.spec.ts:304` — `async function mockAnswer(page, answer)` intercepts `/api/chat` and streams `answer` as the assistant text (line number re-verified 2026-09-02). `:359-396` is the raw-HTML injection test `"never renders model-supplied HTML as live DOM (spec §32)"`. Model the new test on it. **The avatar-exclusion selector to reuse verbatim** (Step 2 needs it) is:
  ```ts
  page.locator('#ask-ai-louie img:not([data-slot="message-avatar"] img)')
  ```
  and the test drives the panel with `await scrollToAskPanel(page)` then `await page.getByText("Tell me about Flexi", { exact: true }).click()`.
- Spec §31 fixed copy for the unavailable state stays verbatim for the generic case.
- **Rate-limit hazard discovered while executing 022 — read before adding tests.** `/api/chat` and `/api/job-fit` share one in-memory limiter (20 requests / 5 minutes) and, with no proxy in front of a local server, every test that makes a *real* request lands in the same `"anonymous"` bucket. The suite already sits at **18 of 20** in that bucket. 022 added a helper for this at the top of the `"the chat endpoint"` describe block:
  ```ts
  function ownRateLimitBucket(name: string) {
    return { "x-forwarded-for": `e2e-${name}` };
  }
  ```
  Every test this plan adds intercepts `/api/chat` client-side (via `mockAnswer` or `page.route`) and therefore makes **no** real request, so none of them should consume that budget. If you find yourself writing a test that does `request.post("/api/chat", …)`, it must pass `headers: ownRateLimitBucket("<name>")` or it will tip the suite into 429s.

## Commands you will need

| Purpose   | Command                  | Expected on success |
|-----------|--------------------------|---------------------|
| Typecheck | `pnpm typecheck`         | exit 0              |
| Lint      | `pnpm lint`              | exit 0              |
| Unit      | `pnpm test`              | all pass            |
| E2E (this suite) | `npx playwright test e2e/ai-louie.spec.ts` | `0 failed` |
| E2E (all) | `pnpm test:e2e`          | `0 failed`          |

## Scope

**In scope**:
- `components/ai/answer-markdown.tsx`
- `components/ai/ai-louie-composer.tsx`
- `components/ai/ai-louie-live.tsx` (only `ThreadError` and the composer call site if a prop is needed)
- `e2e/ai-louie.spec.ts`

**Out of scope**:
- `lib/ai/answer-link.ts` — correct; do not extend it to images (images are never legitimate here).
- `components/ai/job-description-dialog.tsx` — already correct; it is the pattern, not the patient.
- `app/api/**` — server changes are Plan 022.
- Any `rehype` plugin — the file's own comment forbids it.

## Git workflow

- Branch: `plan-023`
- One commit per step, imperative sentence, no prefix.
- Do NOT push or open a PR unless the operator instructed it.

## Steps

### Step 1: Never render a model-authored image

In `components/ai/answer-markdown.tsx` add to the `components` map, directly after the `a` handler:

```tsx
/**
 * An image is never legitimate in an answer — the evidence index carries no
 * imagery and the prompt never asks for any. Rendering one would fetch an
 * attacker-chosen URL without a click (spec §32). The alt text survives as
 * plain text so the sentence still reads.
 */
img: ({ alt }) => (alt ? <>{alt}</> : null),
```

**Verify**: `grep -n "img:" components/ai/answer-markdown.tsx` → one match. `pnpm typecheck` → exit 0.

### Step 2: Extend the injection e2e test to markdown images

In `e2e/ai-louie.spec.ts`, next to the raw-HTML injection test (~`:363`), add a test that calls `mockAnswer(page, "Look: ![tracker](https://example.invalid/x.png) done")`, sends a message, waits for "done" to be visible, and asserts:
- `panel.locator("img:not([data-slot='assistant-avatar'] img)")` count is 0 — reuse the exact avatar-exclusion selector the existing test uses (open it and copy the selector; do not invent one).
- `panel.getByText("tracker")` is visible (the alt text survived).
- No request to `example.invalid` was made: register `page.on("request", …)` before sending and assert none matched `/example\.invalid/`.

**Verify**: `npx playwright test e2e/ai-louie.spec.ts` → `0 failed`, new test present. Temporarily comment out the `img:` line from Step 1 and re-run: the test must **fail** (proves it is not vacuous). Restore the line.

### Step 3: Cap the composer at the server's limit

In `components/ai/ai-louie-composer.tsx` import `MAX_CHARS_PER_MESSAGE` from `@/lib/ai/schemas` (after Plan 022; otherwise see STOP conditions) and add `maxLength={MAX_CHARS_PER_MESSAGE}` to the `<textarea>`. Add one sentence to the docblock at `:48-51`: the cap matches the server's per-message limit so a paste is truncated visibly at the edge rather than rejected after send.

**Verify**: `grep -n "maxLength={MAX_CHARS_PER_MESSAGE}" components/ai/ai-louie-composer.tsx` → one match. `pnpm typecheck` → exit 0.

### Step 4: Branch the thread error on what the server said

In `components/ai/ai-louie-live.tsx` replace `ThreadError` with:

```tsx
/**
 * Runtime failures. The server's error code is read from `useChat`'s error
 * message (the response body for non-2xx responses) only to choose between
 * three fixed strings — the raw text is never shown (spec §31). The generic
 * copy is the spec §31 line verbatim; the other two mirror the
 * job-description dialog's treatment of the same conditions.
 */
function ThreadError({ error }: { error: Error | undefined }) {
  if (!error) return null;

  const code = error.message.includes("rate_limited")
    ? "rate_limited"
    : error.message.includes("too_long")
      ? "too_long"
      : "generic";

  const copy =
    code === "rate_limited"
      ? "A lot of questions just now — please try again in a few minutes."
      : code === "too_long"
        ? "That message is too long for the chat. For a job description, use “Paste a job description” below."
        : "AI Louie is temporarily unavailable. You can still explore all of Louie’s work below.";

  return (
    <Surface role="status" className="border-danger/30 bg-surface p-4 text-body-sm text-foreground-muted">
      {copy}
    </Surface>
  );
}
```

**Verify**: `pnpm typecheck && pnpm lint` → exit 0.

### Step 5: e2e for the two new branches

In `e2e/ai-louie.spec.ts`, add two tests using `page.route("**/api/chat", …)` to fulfil with `{ status: 429, body: JSON.stringify({ error: "rate_limited" }) }` and `{ status: 413, body: JSON.stringify({ error: "conversation_too_long" }) }`; send a message; assert the `role="status"` surface contains "try again in a few minutes" and "too long for the chat" respectively. Also keep (or add) a case where the route fulfils `500` with an empty body and assert the verbatim spec §31 copy still shows.

**Verify**: `npx playwright test e2e/ai-louie.spec.ts` → `0 failed`, 3 new tests.

### Step 6: Full gate

**Verify**: `pnpm typecheck && pnpm lint && pnpm test && pnpm build` → exit 0; `pnpm test:e2e` → `0 failed`.

## Test plan

- Step 2: markdown-image injection test (proved non-vacuous by the comment-out check).
- Step 5: 429 copy, 413 copy, generic copy.
- Pattern: the existing injection test at `e2e/ai-louie.spec.ts:363-385` and the `mockAnswer` helper at `:304`.

## Done criteria

- [ ] `grep -n "img:" components/ai/answer-markdown.tsx` → 1
- [ ] `grep -n "maxLength=" components/ai/ai-louie-composer.tsx` → 1
- [ ] `grep -c "rate_limited\|too_long" components/ai/ai-louie-live.tsx` → ≥ 2
- [ ] `pnpm typecheck && pnpm lint && pnpm test && pnpm build` exit 0
- [ ] `pnpm test:e2e` → `0 failed`; `e2e/ai-louie.spec.ts` has 4 more tests than at `50e98a4`
- [ ] No files outside the in-scope list modified
- [ ] `plans/README.md` status row updated

## STOP conditions

- `lib/ai/schemas.ts` does not export `MAX_CHARS_PER_MESSAGE` — it does as of 022 (verified at `lib/ai/schemas.ts:70`), so if the import fails something else is wrong: report rather than defining a local copy.
- Adding the `img` override breaks the existing injection test at `e2e/ai-louie.spec.ts:359` (it asserts the raw-HTML markup renders as visible *text*, which the `img:` handler must not change — that test feeds HTML, not markdown image syntax, so it should be unaffected). If it does break, report; do not edit that test to make it pass.
- `useChat`'s `error.message` does not contain the response body (check by logging it once in the 429 e2e) — report the actual shape rather than parsing something else.
- The avatar-exclusion selector in the existing injection test is not reusable for the new test — report, do not weaken to "any img count".

## Maintenance notes

- If answers ever legitimately need images (e.g. evidence thumbnails), route them through an allowlist keyed on `public/` paths, mirroring `resolveAnswerLink` — never re-enable the default renderer.
- The three error strings are UI copy; keep the generic one verbatim to spec §31.
- Reviewer: check the 413 copy still fits the rail at its 260px minimum width without an awkward wrap.
