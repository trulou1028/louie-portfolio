import { convertToModelMessages, streamText, tool, type UIMessage } from "ai";
import { z } from "zod";

import { AIUnavailableError, getModel } from "@/lib/ai/provider";
import { buildSystemPrompt } from "@/lib/ai/system-prompt";
import { searchEvidence } from "@/lib/ai/portfolio-search";
import { searchPortfolioInputSchema } from "@/lib/ai/schemas";
import { chatRateLimiter, clientKey } from "@/lib/ai/rate-limit";
import { jobDescriptionInputSchema } from "@/lib/ai/job-fit";
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
 * Failure behaviour is deliberate (spec §31): every error path returns a
 * small JSON shape the client already knows how to render. Provider errors
 * are never forwarded — a visitor should not see a raw API failure, and an
 * upstream message could leak configuration.
 */

/** Prompt-size limits (spec §32). */
const MAX_MESSAGES = 32;
// Generous enough for a job description pasted straight into the composer.
const MAX_CHARS_PER_MESSAGE = 16_000;
// ...but the per-message cap alone would still permit 32 × 16k. A total bound
// is what actually limits prompt size (spec §32).
const MAX_TOTAL_CHARS = 48_000;

const requestSchema = z.object({
  messages: z.array(z.custom<UIMessage>()).min(1).max(MAX_MESSAGES),
  // Legacy field: older transports (pre-Plan-014) uploaded JSON Schemas for
  // browser-executed tools here. The chat no longer has any client-side
  // tools, so this is accepted for backward compatibility with a cached
  // client and otherwise ignored.
  tools: z.record(z.string(), z.unknown()).optional(),
  system: z.string().optional(),
});

function messageLength(message: UIMessage): number {
  return (message.parts ?? []).reduce((total, part) => {
    return total + (part.type === "text" ? part.text.length : 0);
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
  try {
    const result = streamText({
      model,
      system: buildSystemPrompt(),
      messages: await convertToModelMessages(messages),
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
          execute: async ({ jobDescription }) =>
            runJobFitComparison(jobDescription),
        }),
      },
      // Let the model search, then answer with what it found.
      stopWhen: (step) => step.steps.length >= 4,
    });

    return result.toUIMessageStreamResponse();
  } catch {
    // Never forward the provider's error text (spec §31).
    return Response.json({ error: "ai_error" }, { status: 502 });
  }
}
