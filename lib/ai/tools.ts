import { z } from "zod";

import { ROUTES, isRoute, isAnchorOnRoute } from "@/lib/routes";
import { getEvidenceById } from "@/lib/ai/portfolio-search";

/**
 * AI Louie's toolset (spec §18).
 *
 * Small and deliberate. There is no generic browser tool and no unrestricted
 * navigation: routes are allowlisted, anchors are checked against the real
 * sections of the page, and context-panel views are a closed set.
 *
 * Model output is never trusted as routing data (spec §32), so every client
 * tool re-validates its input at execution time rather than relying on the
 * model to have honoured the schema.
 */

/** The right-rail views the model may request (spec §18 Tool 5). */
export const CONTEXT_PANEL_VIEWS = [
  "featured-work",
  "related-evidence",
  "project-toc",
  "job-fit",
  "profile",
  "experiments",
  "hidden",
] as const;

export type ContextPanelView = (typeof CONTEXT_PANEL_VIEWS)[number];

export const navigatePortfolioInputSchema = z.object({
  route: z.enum(ROUTES),
  anchor: z.string().min(1).optional(),
  reason: z.string().max(200).optional(),
});

export const showEvidenceInputSchema = z.object({
  evidenceId: z.string().min(1),
});

export const setContextPanelInputSchema = z.object({
  view: z.enum(CONTEXT_PANEL_VIEWS),
});

export type NavigateTarget = { route: string; anchor?: string };

export type ValidationResult<T> =
  | { ok: true; value: T }
  | { ok: false; error: string };

/**
 * Validates a navigation target from the model.
 *
 * Rejects anything not in `ROUTES` — which excludes external URLs by
 * construction — and any anchor that is not a real section of that page. A
 * plausible-looking but wrong anchor would scroll nowhere and quietly break
 * the "open the evidence" promise.
 */
export function validateNavigation(input: unknown): ValidationResult<NavigateTarget> {
  const parsed = navigatePortfolioInputSchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false, error: "That is not a route on this site." };
  }

  const { route, anchor } = parsed.data;

  if (!isRoute(route)) {
    return { ok: false, error: `"${route}" is not a route on this site.` };
  }

  if (anchor && !isAnchorOnRoute(route, anchor)) {
    return {
      ok: false,
      error: `"${route}" has no section "#${anchor}".`,
    };
  }

  return { ok: true, value: { route, anchor } };
}

/** Resolves an evidence id, refusing unknown ids (spec §32 allowlisting). */
export function validateEvidenceId(input: unknown) {
  const parsed = showEvidenceInputSchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false as const, error: "Missing evidence id." };
  }

  const item = getEvidenceById(parsed.data.evidenceId);
  if (!item) {
    return {
      ok: false as const,
      error: `No evidence with id "${parsed.data.evidenceId}".`,
    };
  }

  return { ok: true as const, value: item };
}

export function validateContextPanelView(
  input: unknown,
): ValidationResult<ContextPanelView> {
  const parsed = setContextPanelInputSchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false, error: "Unknown context panel view." };
  }
  return { ok: true, value: parsed.data.view };
}

/**
 * Reserved for Plan 007. Declared here so the name is not reused, but
 * deliberately not implemented — spec §18 Tool 4 has requirements
 * (evidence-backed matching, no numeric scores) that belong with the
 * evaluator UI.
 */
export const RESERVED_TOOL_NAMES = ["compare_job_description"] as const;
