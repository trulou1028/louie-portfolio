import { AIUnavailableError, isAIConfigured } from "@/lib/ai/provider";
import { jobDescriptionInputSchema } from "@/lib/ai/job-fit";
import { runJobFitComparison } from "@/lib/ai/job-fit-service";
import { chatRateLimiter, clientKey } from "@/lib/ai/rate-limit";

/**
 * Job-description comparison endpoint (spec §18 Tool 4, §22, §30).
 *
 * No account, no persistence, no analytics. The description exists in this
 * request, in the model call it triggers, and in the response — nowhere else.
 * Nothing here writes it to a log: note the deliberate absence of any
 * `console` call, including on the error paths, since an error handler is the
 * easiest place for request bodies to leak into logs.
 *
 * Shares the chat rate limiter, so a visitor cannot bypass one budget by
 * using the other endpoint.
 */
export async function POST(request: Request) {
  const limit = chatRateLimiter.check(clientKey(request));
  if (!limit.allowed) {
    return Response.json(
      { error: "rate_limited" },
      {
        status: 429,
        headers: {
          "retry-after": String(Math.ceil((limit.resetAt - Date.now()) / 1000)),
        },
      },
    );
  }

  if (!isAIConfigured()) {
    return Response.json({ error: "ai_unavailable" }, { status: 503 });
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return Response.json({ error: "invalid_request" }, { status: 400 });
  }

  const parsed = jobDescriptionInputSchema.safeParse(body);
  if (!parsed.success) {
    // The validation message is about length only and contains no user text.
    return Response.json(
      {
        error: "invalid_request",
        message: parsed.error.issues[0]?.message ?? "Invalid job description.",
      },
      { status: 400 },
    );
  }

  try {
    const result = await runJobFitComparison(parsed.data.jobDescription);
    return Response.json({ result });
  } catch (error) {
    if (error instanceof AIUnavailableError) {
      return Response.json({ error: "ai_unavailable" }, { status: 503 });
    }
    // Never echo the provider's message, and never the request body.
    return Response.json({ error: "comparison_failed" }, { status: 502 });
  }
}
