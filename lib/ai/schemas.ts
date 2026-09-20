import { z } from "zod";

import { ROUTES } from "@/lib/routes";

/**
 * Schemas for everything AI Louie reads or returns (spec §16.3, §32).
 *
 * Tool inputs and evidence entries are both validated: model output is never
 * trusted as routing data, and a malformed evidence entry should fail the
 * build rather than surface as a broken citation at runtime.
 */

export const projectSchema = z.enum([
  "ck12-analytics",
  "offboard",
  "flexi",
  "career",
  "experiment",
]);

export const evidenceTypeSchema = z.enum([
  "product",
  "research",
  "technical",
  "strategy",
  "outcome",
  "career",
]);

/** Mirrors the EvidenceItem shape in spec §16.3, field for field. */
export const evidenceItemSchema = z.object({
  id: z
    .string()
    .min(1)
    .regex(
      /^[a-z0-9-]+$/,
      "ids are lowercase kebab-case so they are safe in URLs and stable to cite",
    ),
  project: projectSchema,
  title: z.string().min(1),
  summary: z.string().min(1),
  detail: z.string().min(1),
  route: z.enum(ROUTES),
  anchor: z.string().min(1).optional(),
  tags: z.array(z.string().min(1)).min(1),
  skills: z.array(z.string().min(1)).min(1),
  technologies: z.array(z.string().min(1)).optional(),
  evidenceType: evidenceTypeSchema,
});

export type EvidenceItemInput = z.infer<typeof evidenceItemSchema>;

/**
 * `search_portfolio` input (spec §18 Tool 1).
 * `limit` is capped so a model cannot ask for the entire index at once.
 */
export const searchPortfolioInputSchema = z.object({
  query: z.string().min(1).max(500),
  project: projectSchema.optional(),
  evidenceType: evidenceTypeSchema.optional(),
  limit: z.number().int().min(1).max(10).optional(),
});

export type SearchPortfolioInput = z.infer<typeof searchPortfolioInputSchema>;

/**
 * Per-message character cap (spec §32). It lives here rather than in the
 * chat route so the schema and every caller that needs the same number read
 * one definition and cannot drift apart.
 */
export const MAX_CHARS_PER_MESSAGE = 16_000;

const textPart = z.object({
  type: z.literal("text"),
  text: z.string().max(MAX_CHARS_PER_MESSAGE),
});

/**
 * What a visitor may send: text only. `system` is not a role a client may
 * use — the server owns the system prompt (spec §32). File parts are refused
 * for the same reason: the SDK would fetch the URL and bill the owner's key.
 */
const userMessage = z.object({
  id: z.string().optional(),
  role: z.literal("user"),
  parts: z.array(textPart).min(1).max(8),
});

/**
 * What comes back on later turns: the assistant messages `useChat` replays,
 * which carry tool-call and step parts alongside text. Those parts are
 * accepted structurally and then dropped before the model call (see the chat
 * route), so the model sees prior answers as text and nothing a client
 * crafted can masquerade as a tool result.
 */
const assistantMessage = z.object({
  id: z.string().optional(),
  role: z.literal("assistant"),
  parts: z.array(z.looseObject({ type: z.string() })).max(64),
});

export const uiMessageSchema = z.discriminatedUnion("role", [
  userMessage,
  assistantMessage,
]);

export type ValidatedUIMessage = z.infer<typeof uiMessageSchema>;
