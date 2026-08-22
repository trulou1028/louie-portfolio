"use client";

import { useRouter } from "next/navigation";
import { useAssistantTool } from "@assistant-ui/react";

import { useContextPanel } from "@/components/ai/context-panel-store";
import {
  navigatePortfolioInputSchema,
  setContextPanelInputSchema,
  showEvidenceInputSchema,
  validateContextPanelView,
  validateEvidenceId,
  validateNavigation,
} from "@/lib/ai/tools";

/**
 * The browser-executed half of AI Louie's toolset (spec §18 Tools 2, 3, 5).
 *
 * Every tool re-validates its input here, at execution time. The schemas were
 * already sent to the model, but model output is never trusted as routing
 * data (spec §32) — so an unknown route, a non-existent anchor, or an
 * invented evidence id is refused by the client, not just discouraged by a
 * prompt. Refusals are returned to the model as ordinary tool results so it
 * can recover and say something sensible.
 */
function ClientTools() {
  const router = useRouter();
  const panel = useContextPanel();

  // --- navigate_portfolio ---------------------------------------------------
  useAssistantTool({
    toolName: "navigate_portfolio",
    description:
      "Take the visitor to a page or section of this portfolio. Only routes that exist on this site are permitted.",
    parameters: navigatePortfolioInputSchema,
    execute: async (input) => {
      const result = validateNavigation(input);
      if (!result.ok) {
        return { navigated: false, error: result.error };
      }

      const { route, anchor } = result.value;
      const href = anchor ? `${route}#${anchor}` : route;

      // Defer past the current render so navigation never interrupts the
      // message still being streamed (spec §18 Tool 2).
      setTimeout(() => router.push(href), 0);

      return { navigated: true, href };
    },
  });

  // --- show_evidence --------------------------------------------------------
  useAssistantTool({
    toolName: "show_evidence",
    description:
      "Surface a specific piece of portfolio evidence to the visitor by its id.",
    parameters: showEvidenceInputSchema,
    execute: async (input) => {
      const result = validateEvidenceId(input);
      if (!result.ok) {
        return { shown: false, error: result.error };
      }

      panel?.addEvidence(result.value);
      panel?.setView("related-evidence");

      return {
        shown: true,
        evidence: {
          id: result.value.id,
          title: result.value.title,
          route: result.value.route,
          anchor: result.value.anchor,
        },
      };
    },
  });

  // --- set_context_panel ----------------------------------------------------
  useAssistantTool({
    toolName: "set_context_panel",
    description:
      "Change what the side panel shows. The frontend decides how each view is rendered.",
    parameters: setContextPanelInputSchema,
    execute: async (input) => {
      const result = validateContextPanelView(input);
      if (!result.ok) {
        return { updated: false, error: result.error };
      }

      panel?.setView(result.value);
      return { updated: true, view: result.value };
    },
  });

  return null;
}

export { ClientTools };
