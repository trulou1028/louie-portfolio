import { convertToModelMessages, streamText, tool, type UIMessage } from "ai";
import { frontendTools, type FrontendTools } from "@assistant-ui/react-ai-sdk";
import { z } from "zod";

import { AIUnavailableError, getModel } from "@/lib/ai/provider";
import { buildSystemPrompt } from "@/lib/ai/system-prompt";
import { searchEvidence } from "@/lib/ai/portfolio-search";
import { searchPortfolioInputSchema } from "@/lib/ai/schemas";
import { chatRateLimiter, clientKey } from "@/lib/ai/rate-limit";

/**
 * AI Louie's chat endpoint (spec §17, §18, §31, §32).
 *
 * The retrieval flow is spec §17: the model may only answer from what
 * `search_portfolio` returns, and that tool runs here on the server against
 * the curated index. The client-side tools (navigate, show evidence, set the
 * context panel) are declared by the browser and forwarded through
 * `frontendTools` so their results come back from the UI.
 *
 * Failure behaviour is deliberate (spec §31): every error path returns a
 * small JSON shape the client already knows how to render. Provider errors
 * are never forwarded — a visitor should not see a raw API failure, and an
 * upstream message could leak configuration.
 */

/** Prompt-size limits (spec §32). */
const MAX_MESSAGES = 32;
const MAX_CHARS_PER_MESSAGE = 8_000;

const requestSchema = z.object({
  messages: z.array(z.custom<UIMessage>()).min(1).max(MAX_MESSAGES),
  // JSON Schemas for the browser-executed tools, uploaded by assistant-ui's
  // transport. Their shape is owned by the client we ship, so it is validated
  // as "objects" here and handed to frontendTools to interpret.
  tools: z.record(z.string(), z.custom<FrontendTools[string]>()).optional(),
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

  const { messages, tools: clientTools } = parsed.data;

  if (messages.some((m) => messageLength(m) > MAX_CHARS_PER_MESSAGE)) {
    return Response.json({ error: "message_too_long" }, { status: 413 });
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
        // Client-declared tools (navigate_portfolio, show_evidence,
        // set_context_panel) are executed in the browser.
        ...frontendTools(clientTools ?? {}),
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
