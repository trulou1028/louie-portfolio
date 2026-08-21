/**
 * AI provider adapter (spec §3).
 *
 * The model is configured through the environment and must never be
 * hard-coded across the application. Keeping the provider behind this small
 * adapter is what allows it to be swapped later without touching the chat
 * route, the tools, or the UI.
 *
 * Implemented in Plan 006. This file currently only exposes configuration
 * reads and the error type the route uses to degrade gracefully (spec §31).
 */

/** Thrown when the AI backend is not configured. Callers map this to a 503. */
export class AIUnavailableError extends Error {
  constructor(message = "AI backend is not configured") {
    super(message);
    this.name = "AIUnavailableError";
  }
}

export type AIConfig = {
  apiKey: string;
  model: string;
};

/**
 * Reads server-only AI configuration. Never call this from a client component:
 * the API key must stay server-side (spec §32).
 */
export function getAIConfig(): AIConfig {
  const apiKey = process.env.OPENAI_API_KEY;
  const model = process.env.OPENAI_MODEL;

  if (!apiKey || !model) {
    throw new AIUnavailableError();
  }

  return { apiKey, model };
}

/** True when the AI surface can be offered at all (spec §31 fallback copy). */
export function isAIConfigured(): boolean {
  return Boolean(process.env.OPENAI_API_KEY && process.env.OPENAI_MODEL);
}
