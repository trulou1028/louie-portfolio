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
