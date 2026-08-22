"use client";

import * as React from "react";

import type { ContextPanelView } from "@/lib/ai/tools";
import type { EvidenceItem } from "@/content/evidence/evidence";

/**
 * What the contextual rail is currently showing (spec §18 Tool 5).
 *
 * The model may *recommend* a view; the frontend owns what that view actually
 * looks like. Keeping the state here rather than letting the tool render
 * anything is what makes that boundary real.
 */
type ContextPanelState = {
  view: ContextPanelView;
  /** Evidence surfaced by the assistant, for the `related-evidence` view. */
  evidence: EvidenceItem[];
};

type ContextPanelContextValue = ContextPanelState & {
  setView: (view: ContextPanelView) => void;
  addEvidence: (item: EvidenceItem) => void;
};

const ContextPanelContext = React.createContext<ContextPanelContextValue | null>(
  null,
);

export function ContextPanelProvider({
  children,
  initialView = "featured-work",
}: {
  children: React.ReactNode;
  initialView?: ContextPanelView;
}) {
  const [view, setView] = React.useState<ContextPanelView>(initialView);
  const [evidence, setEvidence] = React.useState<EvidenceItem[]>([]);

  const addEvidence = React.useCallback((item: EvidenceItem) => {
    setEvidence((current) =>
      current.some((e) => e.id === item.id) ? current : [item, ...current].slice(0, 6),
    );
  }, []);

  const value = React.useMemo(
    () => ({ view, evidence, setView, addEvidence }),
    [view, evidence, addEvidence],
  );

  return (
    <ContextPanelContext.Provider value={value}>
      {children}
    </ContextPanelContext.Provider>
  );
}

/**
 * Returns null outside a provider rather than throwing: the AI surface is
 * optional on a page, and a missing panel should never break rendering.
 */
export function useContextPanel(): ContextPanelContextValue | null {
  return React.useContext(ContextPanelContext);
}
