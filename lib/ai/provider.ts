import { createOpenAI } from "@ai-sdk/openai";
import type { LanguageModel } from "ai";

/**
 * AI provider adapter (spec §3).
 *
 * The chat route knows nothing about OpenAI: it asks for a model and gets
 * one. That boundary is what lets the provider be replaced later without
 * touching the route, the tools, or the UI.
 *
 * The model id comes from the environment and is never hard-coded — spec §3
 * is explicit that model choice stays configurable.
 *
 * The AI SDK's OpenAI provider targets the **Responses API** by default,
 * which is the backend spec §3 asks for.
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
 * Reads server-only AI configuration. Never call this from a client
 * component: the API key must stay server-side (spec §32).
 */
export function getAIConfig(): AIConfig {
  const apiKey = process.env.OPENAI_API_KEY;
  const model = process.env.OPENAI_MODEL;

  if (!apiKey || !model) {
    throw new AIUnavailableError(
      !apiKey ? "OPENAI_API_KEY is not set" : "OPENAI_MODEL is not set",
    );
  }

  return { apiKey, model };
}

/** True when the AI surface can be offered at all (spec §31 fallback copy). */
export function isAIConfigured(): boolean {
  return Boolean(process.env.OPENAI_API_KEY && process.env.OPENAI_MODEL);
}

/**
 * The language model the chat route should use.
 * Throws `AIUnavailableError` when unconfigured, so the route can degrade
 * rather than surface a provider error (spec §31).
 */
export function getModel(): LanguageModel {
  const { apiKey, model } = getAIConfig();
  const openai = createOpenAI({ apiKey });
  return openai(model);
}

/** Disable response storage and keep reasoning bounded for interactive answers. */
export function getProviderOptions() {
  const model = process.env.OPENAI_MODEL ?? "";
  return {
    openai: {
      store: false,
      ...(model.startsWith("gpt-5") ? { reasoningEffort: "low" as const } : {}),
    },
  };
}
