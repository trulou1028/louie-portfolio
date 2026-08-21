/**
 * AI Louie chat endpoint.
 *
 * Stub only — the real implementation (retrieval, tools, streaming, rate
 * limiting) lands in Plan 006. Until then this returns the same shape the
 * client will use to render the "AI Louie is temporarily unavailable" state,
 * so the fallback path is real rather than theoretical (spec §31).
 */

export async function POST() {
  return Response.json({ error: "ai_unavailable" }, { status: 503 });
}
