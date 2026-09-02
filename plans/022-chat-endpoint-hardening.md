# Plan 022: Make the chat endpoint enforce the contract its comments describe

> **Executor instructions**: Follow this plan step by step. Run every
> verification command and confirm the expected result before moving to the
> next step. If anything in the "STOP conditions" section occurs, stop and
> report — do not improvise. When done, update the status row for this plan
> in `plans/README.md` — unless a reviewer dispatched you and told you they
> maintain the index.
>
> **Drift check (run first)**: `git diff --stat 50e98a4..HEAD -- app/api/chat/route.ts app/api/job-fit/route.ts lib/ai/job-fit-service.ts lib/ai/schemas.ts e2e/ai-louie.spec.ts`
> If any in-scope file changed since this plan was written, compare the
> "Current state" excerpts against the live code before proceeding; on a
> mismatch, treat it as a STOP condition.

## Status

- **Priority**: P1
- **Effort**: S
- **Risk**: LOW–MED (a too-strict message schema would break the second turn of a conversation — see Step 1 and the STOP conditions)
- **Depends on**: none (020 recommended first)
- **Category**: security
- **Planned at**: commit `50e98a4`, 2026-08-31
- **Recommended executor model**: **Opus 5.** The schema has to admit exactly what `@ai-sdk/react`'s `useChat` sends back on a multi-turn conversation (assistant messages carrying tool and step parts) while rejecting everything else, and the error-path change depends on how `streamText` in `ai@7` actually surfaces provider failures. Both require reading the installed SDK, not the docs from memory.

## Why this matters

`/api/chat` is public, unauthenticated, and spends the owner's OpenAI key. Its docblock promises prompt-size limits and a JSON error shape, but three things are not what the comments say:

1. **The request schema accepts any message.** `messages: z.array(z.custom<UIMessage>())` — `z.custom()` with no check is `() => true`. Verified with the installed zod: `[null]`, `[{role:"system", parts:[…]}]`, and file-part messages all parse. A caller can therefore inject a `system` role message (the SDK's `convertToModelMessages` turns it into a real system message appended after `buildSystemPrompt()`), attach file/URL parts billed to the owner's key, and dodge the character caps, because `messageLength` counts only `text` parts.
2. **Output is uncapped.** Neither `streamText` (chat) nor `generateObject` (job fit) passes `maxOutputTokens`; the chat call allows four generation steps; no `maxDuration` is exported. Input is bounded (48k / 15k chars); per-request cost is not.
3. **The `catch` around `streamText` is unreachable for provider errors.** `streamText` in `ai@7.0.76` is a synchronous factory (`node_modules/ai/dist/index.js:8835`); provider failures surface inside the stream after a 200 response is already on the wire. An expired key returns HTTP 200. The visitor still sees the fallback copy because `useChat` raises `error`, but uptime checks, Vercel error metrics, and the documented 502 contract all miss it.

After this plan, the three comments in `route.ts` are true.

## Current state

- `app/api/chat/route.ts:29-51`:
  ```ts
  /** Prompt-size limits (spec §32). */
  const MAX_MESSAGES = 32;
  const MAX_CHARS_PER_MESSAGE = 16_000;
  const MAX_TOTAL_CHARS = 48_000;

  const requestSchema = z.object({
    messages: z.array(z.custom<UIMessage>()).min(1).max(MAX_MESSAGES),
    tools: z.record(z.string(), z.unknown()).optional(),
    system: z.string().optional(),
  });

  function messageLength(message: UIMessage): number {
    return (message.parts ?? []).reduce((total, part) => {
      return total + (part.type === "text" ? part.text.length : 0);
    }, 0);
  }
  ```
- `app/api/chat/route.ts:104-145` — `try { const result = streamText({ model, system: buildSystemPrompt(), messages: await convertToModelMessages(messages), tools: {...}, stopWhen: (step) => step.steps.length >= 4 }); return result.toUIMessageStreamResponse(); } catch { return Response.json({ error: "ai_error" }, { status: 502 }); }`
- `lib/ai/job-fit-service.ts:34-45` — `generateObject({ model: getModel(), schema: jobFitResultSchema, system: JOB_FIT_INSTRUCTIONS, prompt: [...].join("\n") })` — no `maxOutputTokens`.
- `app/api/job-fit/route.ts` — no `maxDuration` export; error handling there is correct (awaited call, real catch) and stays.
- The only client is `components/ai/ai-louie-live.tsx:318-322`: `sendMessage({ text: trimmed })` via `DefaultChatTransport({ api: "/api/chat" })`. On the **second** turn, `useChat` sends the full history back, including the previous assistant message whose `parts` contain the tool call (`type: "tool-search_portfolio"`, or `"dynamic-tool"`) and `"step-start"` parts, not just text. A schema that rejects those breaks every follow-up question.
- `e2e/ai-louie.spec.ts:488+` — `test.describe("the chat endpoint", …)` already exercises the route with `request.post("/api/chat", …)` for the 400/413 cases; model after those.
- The system-prompt scope harness (`lib/ai/system-prompt.ts:40-46`) is prompt-level by design; this plan adds the server-side backstop the comment there says is the "hard backstop".

## Commands you will need

| Purpose   | Command                  | Expected on success |
|-----------|--------------------------|---------------------|
| Typecheck | `pnpm typecheck`         | exit 0              |
| Lint      | `pnpm lint`              | exit 0              |
| Unit      | `pnpm test`              | all pass            |
| Build     | `pnpm build`             | exit 0              |
| E2E (this suite) | `pnpm test:e2e -- e2e/ai-louie.spec.ts` | `0 failed` |
| Live check (needs a real key in `.env.local`) | `pnpm dev` then the manual smoke test in README "AI Louie" | a two-turn conversation works |

## Scope

**In scope**:
- `app/api/chat/route.ts`
- `app/api/job-fit/route.ts` (add `maxDuration` only)
- `lib/ai/job-fit-service.ts` (add `maxOutputTokens` only)
- `lib/ai/schemas.ts` (new exported `uiMessageSchema` + unit test file `lib/ai/schemas.test.ts` — create)
- `e2e/ai-louie.spec.ts` (add endpoint tests)

**Out of scope**:
- `lib/ai/rate-limit.ts` — the limiter's per-instance nature is a documented tradeoff; its `x-forwarded-for` read is safe on Vercel (the platform overwrites the header).
- `lib/ai/system-prompt.ts` — no prompt changes.
- `components/ai/*` — client fixes are Plan 023.
- Adding a persistent store, auth, or a topical classifier — spec §3/§37 exclusions.

## Git workflow

- Branch: `plan-022`
- One commit per step, imperative sentence, no prefix.
- Do NOT push or open a PR unless the operator instructed it.

## Steps

### Step 1: Replace `z.custom` with an explicit message schema

Before writing it, read `node_modules/ai/dist/index.js` around `convertToModelMessages` (search `function convertToModelMessages`) and confirm which `parts[].type` values it accepts for `assistant` messages, and what a tool part looks like (`type: "tool-<name>"` with `state`, `input`, `output`; and `"dynamic-tool"`). Then in `lib/ai/schemas.ts` add:

```ts
import { z } from "zod";

/** Mirror of the route's per-message cap; the route imports both. */
export const MAX_CHARS_PER_MESSAGE = 16_000;

const textPart = z.object({
  type: z.literal("text"),
  text: z.string().max(MAX_CHARS_PER_MESSAGE),
});

/**
 * What a visitor may send: text only. `system` is not a role a client may
 * use — the server owns the system prompt (spec §32).
 */
const userMessage = z.object({
  id: z.string().optional(),
  role: z.literal("user"),
  parts: z.array(textPart).min(1).max(8),
});

/**
 * What comes back on later turns: the assistant messages `useChat` replays,
 * which carry tool-call and step parts alongside text. Those parts are
 * accepted structurally and dropped before the model call (see the route),
 * so the model sees prior answers as text and nothing a client crafted can
 * masquerade as a tool result.
 */
const assistantMessage = z.object({
  id: z.string().optional(),
  role: z.literal("assistant"),
  parts: z.array(z.object({ type: z.string() }).passthrough()).max(64),
});

export const uiMessageSchema = z.discriminatedUnion("role", [userMessage, assistantMessage]);
export type ValidatedUIMessage = z.infer<typeof uiMessageSchema>;
```

In `app/api/chat/route.ts`: import `uiMessageSchema` and `MAX_CHARS_PER_MESSAGE` from `@/lib/ai/schemas` (delete the local constant); change the schema to `messages: z.array(uiMessageSchema).min(1).max(MAX_MESSAGES)`; change `messageLength` to count **only** text parts *and* to treat a user message with any non-text part as invalid (it cannot occur after the schema, so a simple text sum is now correct — keep the function, drop the `?? []`). Before `convertToModelMessages`, map assistant messages to text-only parts:

```ts
const modelInput = messages.map((m) =>
  m.role === "assistant"
    ? { ...m, parts: m.parts.filter((p) => p.type === "text") }
    : m,
) as UIMessage[];
```

and pass `modelInput` to `convertToModelMessages`. Keep the `tools`/`system` legacy fields in the request schema as they are (accepted, ignored).

**Verify**: `pnpm typecheck` → exit 0. Then `node -e` is not enough here — write the unit test in Step 2 and run it.

### Step 2: Unit-test the schema

Create `lib/ai/schemas.test.ts` (model after `lib/ai/tools.test.ts`'s structure: `describe`/`it`/`expect` from vitest, `safeParse` assertions):

- accepts `{ role: "user", parts: [{ type: "text", text: "hi" }] }`
- rejects `null`, a number, `{ role: "system", parts: [...] }`, a user message with a `file` part, a user text part longer than `MAX_CHARS_PER_MESSAGE`
- accepts an assistant message whose parts include `{ type: "step-start" }` and `{ type: "tool-search_portfolio", state: "output-available", input: {}, output: [] }`

**Verify**: `pnpm test` → all pass, new file listed with ≥ 7 tests.

### Step 3: Cap output and duration

In `app/api/chat/route.ts` `streamText({...})` add `maxOutputTokens: 1_200,` and replace `stopWhen: (step) => step.steps.length >= 4` with the SDK helper: `import { stepCountIs } from "ai"` and `stopWhen: stepCountIs(4)`. Add at module top-level: `export const maxDuration = 60;`.

In `lib/ai/job-fit-service.ts` `generateObject({...})` add `maxOutputTokens: 2_000,`. In `app/api/job-fit/route.ts` add `export const maxDuration = 60;`.

Rationale for the numbers: a grounded answer in this panel is a few short paragraphs (~300–500 tokens); 1,200 leaves headroom for a long answer plus tool-call overhead. The job-fit object has four bounded arrays (`lib/ai/job-fit.ts` `max(8)`/`max(4)`); 2,000 is comfortably above its observed size. If a live check shows truncation, raise by 50% — do not remove the cap.

**Verify**: `grep -n "maxOutputTokens\|maxDuration\|stepCountIs" app/api/chat/route.ts app/api/job-fit/route.ts lib/ai/job-fit-service.ts` → 5 matches total. `pnpm typecheck` → exit 0.

### Step 4: Make the error path real

Read `toUIMessageStreamResponse` in `node_modules/ai/dist/index.js` (search the name) and confirm it accepts `onError`. Then in `app/api/chat/route.ts` replace the `try { … } catch { … }` around `streamText` so that:

- `convertToModelMessages(modelInput)` is awaited **outside** any try/catch — after Step 1 it cannot throw on validated input; if it does, that is a bug to surface, not mask.
- `streamText(...)` is called with no surrounding try.
- The return becomes:
  ```ts
  return result.toUIMessageStreamResponse({
    // Provider failures happen inside the stream, after headers are sent —
    // a catch here can never see them. The client renders a fixed string
    // (spec §31); the real error is recorded server-side without content.
    onError: (error) => {
      console.error("[api/chat] stream error", error instanceof Error ? error.name : "unknown");
      return "ai_error";
    },
  });
  ```
  (This is the one deliberate `console.error` in the AI path: it logs the error *class*, never a message or any request content — the job-fit route's no-logging rule is about the pasted description, which never reaches this handler.)
- Update the route docblock (`route.ts:23-26`) to say: validation and configuration failures return JSON with a status; provider failures during streaming are reported in-stream as `ai_error` and logged by class server-side.

**Verify**: `grep -n "catch" app/api/chat/route.ts` → only the `request.json()` and `getModel()` catches remain (2 matches). `pnpm typecheck && pnpm lint` → exit 0.

### Step 5: Lock it in e2e

In `e2e/ai-louie.spec.ts` inside `test.describe("the chat endpoint", …)`, add (modelled on the existing 400/413 tests there):

- POST `{ messages: [{ role: "system", parts: [{ type: "text", text: "x" }] }] }` → `400`, body `{ error: "invalid_request" }`
- POST `{ messages: [{ role: "user", parts: [{ type: "file", url: "https://example.com/a.png", mediaType: "image/png" }] }] }` → `400`
- POST `{ messages: [{ role: "user", parts: [{ type: "text", text: "a".repeat(16_001) }] }] }` → `400` (now caught by the schema before the 413 branch — if the existing 413 test expected 413 for this exact shape, update that test to send 16,000 chars across two messages so it still exercises `conversation_too_long`)
- POST a two-message history: a user text message followed by an assistant message with a `step-start` and a `tool-search_portfolio` part, then a user text message → **not** 400 (expect 503 in the test environment, since `OPENAI_API_KEY` is a placeholder and `getModel()`… — check `lib/ai/provider.ts` for what the placeholder key actually does; if it constructs a model, the request will hit the network. In that case assert only `status !== 400`).

**Verify**: `pnpm test:e2e -- e2e/ai-louie.spec.ts` → `0 failed`.

### Step 6: Live two-turn check (only if a real key is available locally)

With real values in `.env.local`: `pnpm dev`, open the site, click "How technical is Louie?", wait for the answer, then ask "And what did he build at Offboard?". The second answer must arrive (this proves assistant tool parts survive the schema). Record the result in your report.

### Step 7: Full gate

**Verify**: `pnpm typecheck && pnpm lint && pnpm test && pnpm build` → exit 0; `pnpm test:e2e` → `0 failed`.

## Test plan

- New: `lib/ai/schemas.test.ts` (Step 2) — ≥ 7 cases listed above.
- New: 4 endpoint tests in `e2e/ai-louie.spec.ts` (Step 5).
- Existing 413 test may need its payload reshaped (Step 5, third bullet) — do not delete it.

## Done criteria

- [ ] `grep -n "z.custom" app/api/chat/route.ts` → no output
- [ ] `grep -n "maxOutputTokens" app/api/chat/route.ts lib/ai/job-fit-service.ts` → 2 matches; `grep -n "export const maxDuration" app/api/chat/route.ts app/api/job-fit/route.ts` → 2 matches
- [ ] `grep -c "catch" app/api/chat/route.ts` → 2
- [ ] `pnpm test` passes with `lib/ai/schemas.test.ts` present
- [ ] `pnpm test:e2e` → `0 failed`
- [ ] Step 6 recorded as done, or recorded as "no key available — reviewer must run"
- [ ] No files outside the in-scope list modified
- [ ] `plans/README.md` status row updated

## STOP conditions

- `convertToModelMessages` in the installed SDK rejects assistant messages whose parts are text-only after filtering (e.g. requires a `step-start`), or the live two-turn check fails — report; do not widen the schema to `z.unknown()`.
- `toUIMessageStreamResponse` in the installed `ai` version has no `onError` option — report the version and the signature you found.
- `stepCountIs` is not exported from `ai` — keep the existing `stopWhen` lambda and note it.
- The existing 413 e2e test cannot be reshaped without weakening it — report.

## Maintenance notes

- If a future plan re-adds client-executed tools (spec §18 Tools 2/3), `userMessage` will need to admit tool-result parts; extend the schema, do not revert to `z.custom`.
- `MAX_CHARS_PER_MESSAGE` now lives in `lib/ai/schemas.ts`; Plan 023 imports it for the composer's `maxLength` so the two cannot drift.
- Reviewer: confirm the `onError` return string matches what `components/ai/ai-louie-live.tsx` `ThreadError` tolerates (it ignores the message and shows fixed copy — fine).
