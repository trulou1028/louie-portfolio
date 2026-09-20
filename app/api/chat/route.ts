import {
  convertToModelMessages,
  stepCountIs,
  streamText,
  tool,
  type UIMessage,
} from "ai";
import { z } from "zod";

import { AIUnavailableError, getModel, getProviderOptions } from "@/lib/ai/provider";
import { buildSystemPrompt } from "@/lib/ai/system-prompt";
import { searchEvidence } from "@/lib/ai/portfolio-search";
import {
  MAX_CHARS_PER_MESSAGE,
  searchPortfolioInputSchema,
  uiMessageSchema,
  type ValidatedUIMessage,
} from "@/lib/ai/schemas";
import { chatRateLimiter, clientKey } from "@/lib/ai/rate-limit";
import { jobDescriptionInputSchema, resolveEvidence } from "@/lib/ai/job-fit";
import { runJobFitComparison } from "@/lib/ai/job-fit-service";

/**
 * AI Louie's chat endpoint (spec §17, §31, §32; Plan 014).
 *
 * The retrieval flow is spec §17: the model may only answer from what
 * `search_portfolio` returns, and that tool runs here on the server against
 * the curated index. Plan 014 removed the browser-executed tools (navigate,
 * show evidence, set the context panel) that a client used to declare and
 * this endpoint used to forward into the model call — the chat is a basic
 * Q&A surface now, so retrieval and the job-description comparison are the
 * only tools.
 *
 * Failure behaviour is deliberate (spec §31) and splits in two, because the
 * two kinds of failure reach the client differently:
 *
 * - Validation and configuration failures happen before anything streams, so
 *   they return JSON with a status the client already knows how to render.
 * - Provider failures happen *inside* the stream, after a 200 and its headers
 *   are already on the wire. Those are reported in-stream as `ai_error` and
 *   logged server-side by error class only.
 *
 * Either way the provider's own message is never forwarded: a visitor should
 * not see a raw API failure, and an upstream message could leak configuration.
 */

/**
 * Vercel's function ceiling for this route. A streamed answer with a tool
 * call takes seconds, not minutes; this bounds a stuck provider call.
 */
export const maxDuration = 60;

/** Prompt-size limits (spec §32). */
const MAX_MESSAGES = 32;
// The per-message cap is `MAX_CHARS_PER_MESSAGE` in `lib/ai/schemas.ts`, where
// the message schema enforces it per text part. Generous enough for a job
// description pasted straight into the composer.
// The per-message cap alone would still permit 32 × 16k. A total bound is what
// actually limits prompt size (spec §32).
const MAX_TOTAL_CHARS = 48_000;

const requestSchema = z.object({
  messages: z.array(uiMessageSchema).min(1).max(MAX_MESSAGES),
  // Legacy field: older transports (pre-Plan-014) uploaded JSON Schemas for
  // browser-executed tools here. The chat no longer has any client-side
  // tools, so this is accepted for backward compatibility with a cached
  // client and otherwise ignored.
  tools: z.record(z.string(), z.unknown()).optional(),
  system: z.string().optional(),
});

// The schema guarantees `parts` exists, and that a user message holds text
// parts only, so summing text lengths is the whole size of what reaches the
// model. Assistant parts other than text are dropped before the model call.
function messageLength(message: ValidatedUIMessage): number {
  return message.parts.reduce((total, part) => {
    return total + (part.type === "text" ? String(part.text ?? "").length : 0);
  }, 0);
}

export async function POST(request: Request) {
  // --- rate limit -----------------------------------------------------------
  const limit = chatRateLimiter.check(clientKey(request));
  if (!limit.allowed) {
    return Response.json(
      { error: "rate_limited" },
      {
        status: 429,
        headers: { "retry-after": String(Math.ceil((limit.resetAt - Date.now()) / 1000)) },
      },
    );
  }

  // --- validate -------------------------------------------------------------
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return Response.json({ error: "invalid_request" }, { status: 400 });
  }

  const parsed = requestSchema.safeParse(body);
  if (!parsed.success) {
    return Response.json({ error: "invalid_request" }, { status: 400 });
  }

  // `tools`, if a client still sends it, is accepted and ignored — see the
  // comment on `requestSchema` above.
  const { messages } = parsed.data;

  if (messages.some((m) => messageLength(m) > MAX_CHARS_PER_MESSAGE)) {
    return Response.json({ error: "message_too_long" }, { status: 413 });
  }

  const totalChars = messages.reduce((sum, m) => sum + messageLength(m), 0);
  if (totalChars > MAX_TOTAL_CHARS) {
    return Response.json({ error: "conversation_too_long" }, { status: 413 });
  }

  // --- model ----------------------------------------------------------------
  let model;
  try {
    model = getModel();
  } catch (error) {
    if (error instanceof AIUnavailableError) {
      return Response.json({ error: "ai_unavailable" }, { status: 503 });
    }
    throw error;
  }

  // --- run ------------------------------------------------------------------
  // Strip every non-text part off the replayed assistant messages. `useChat`
  // sends the previous turn back with its tool-call and step parts attached;
  // the model only needs the prose, and dropping the rest means a crafted
  // request cannot inject a fake tool result into the conversation.
  const modelInput = messages.map((m) =>
    m.role === "assistant"
      ? { ...m, parts: m.parts.filter((p) => p.type === "text") }
      : m,
  ) as unknown as UIMessage[];

  // Awaited outside any try: on input this schema has already validated, the
  // conversion cannot fail. If it ever does, that is a bug worth surfacing.
  const modelMessages = await convertToModelMessages(modelInput);

  const result = streamText({
    model,
    // Override the SDK default, which logs the complete provider error.
    onError: ({ error }) => {
      console.error("[api/chat] provider error", error instanceof Error ? error.name : "unknown");
    },
    system: buildSystemPrompt(),
    providerOptions: getProviderOptions(),
    messages: modelMessages,
    tools: {
      /**
       * Server-side retrieval over the curated evidence index (spec §18
       * Tool 1). This is the only source of factual grounding.
       */
      search_portfolio: tool({
        description:
          "Search Louie's curated portfolio evidence. Call this before making any factual claim about his experience, and answer only from what it returns.",
        inputSchema: searchPortfolioInputSchema,
        execute: async (input) => searchEvidence(input),
      }),
      /**
       * Job-description comparison (spec §18 Tool 4, §22).
       *
       * Runs its own structured-output call rather than trying to shape the
       * conversational stream, then verifies every citation before the
       * result leaves the server: a match the index cannot back becomes an
       * admitted gap. The job description is used here and nowhere else —
       * it is never logged or sent to analytics (spec §30).
       */
      compare_job_description: tool({
        description:
          "Compare a pasted job description against Louie's portfolio evidence. Returns strong matches, honest gaps, work to review, and questions to ask him.",
        inputSchema: jobDescriptionInputSchema,
        execute: async ({ jobDescription }) => {
          const comparison = await runJobFitComparison(jobDescription);
          const ids = comparison.strongestMatches.flatMap(match => match.evidenceIds);
          return {
            ...comparison,
            evidenceLinks: resolveEvidence([...new Set(ids)]).map(item => ({
              id: item.id,
              title: item.title,
              route: item.route,
              anchor: item.anchor,
            })),
          };
        },
      }),
    },
    // Let the model search, then answer with what it found.
    stopWhen: stepCountIs(4),
    // A grounded answer here is a few short paragraphs. This leaves headroom
    // for a long one plus tool-call overhead, and bounds per-request cost.
    maxOutputTokens: 1_200,
  });

  return result.toUIMessageStreamResponse({
    // Provider failures happen inside the stream, after headers are sent —
    // a catch here can never see them. The client renders a fixed string
    // (spec §31); the real error is recorded server-side without content.
    onError: (error) => {
      console.error(
        "[api/chat] stream error",
        error instanceof Error ? error.name : "unknown",
      );
      return "ai_error";
    },
  });
}
