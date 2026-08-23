"use client";

import * as React from "react";

import { validateEvidenceId } from "@/lib/ai/tools";

/**
 * What the main canvas renders in response to a question asked in the Ask
 * panel (Plan 012 — "Ask the panel; the site answers").
 *
 * The panel is a control surface; the portfolio itself is the display. A
 * question asked in the rail composes an Answer Sheet in the main column —
 * this store is the seam between the two. It is deliberately transport
 * agnostic (spec: voice mode later composes the same canvas), so it knows
 * nothing about assistant-ui, streaming, or tool calls — only the question,
 * the answer, and which evidence grounded it.
 */
type AnswerState =
  | { status: "idle" }
  | { status: "asked"; question: string }
  | { status: "answering"; question: string }
  | {
      status: "answered";
      question: string;
      answerText: string;
      evidenceIds: string[];
    };

type AnswerStoreContextValue = {
  state: AnswerState;
  /** A question was submitted; the canvas should start materializing. */
  asked: (question: string) => void;
  /**
   * The run is actively streaming a response. Takes `question` rather than
   * reading it off existing state: a suggestion's `autoSend` can append the
   * user turn and start the run in the same update, so `asked` is not
   * guaranteed to have observably run first — each action is self-contained.
   */
  answering: (question: string) => void;
  /** The run finished. Unknown evidence ids are dropped, not stored. */
  answered: (question: string, answerText: string, evidenceIds: string[]) => void;
  /** Return the canvas to the ordinary homepage. */
  clear: () => void;
};

const AnswerStoreContext = React.createContext<AnswerStoreContextValue | null>(
  null,
);

export function AnswerStoreProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [state, setState] = React.useState<AnswerState>({ status: "idle" });

  const asked = React.useCallback((question: string) => {
    setState({ status: "asked", question });
  }, []);

  const answering = React.useCallback((question: string) => {
    setState({ status: "answering", question });
  }, []);

  const answered = React.useCallback(
    (question: string, answerText: string, rawEvidenceIds: string[]) => {
      // Model-surfaced ids are never trusted as-is (spec §32): only ids that
      // resolve to a real evidence entry survive into state. The canvas
      // re-resolves the full EvidenceItem from lib/ai/portfolio-search at
      // render time, so only ids are kept here.
      const evidenceIds = rawEvidenceIds.filter(
        (id) => validateEvidenceId({ evidenceId: id }).ok,
      );

      setState({ status: "answered", question, answerText, evidenceIds });
    },
    [],
  );

  const clear = React.useCallback(() => setState({ status: "idle" }), []);

  const value = React.useMemo(
    () => ({ state, asked, answering, answered, clear }),
    [state, asked, answering, answered, clear],
  );

  return (
    <AnswerStoreContext.Provider value={value}>
      {children}
    </AnswerStoreContext.Provider>
  );
}

/**
 * Returns null outside a provider, matching `useContextPanel`'s idiom: the
 * answer canvas is optional on a page and must never throw for its absence.
 */
export function useAnswerStore(): AnswerStoreContextValue | null {
  return React.useContext(AnswerStoreContext);
}

export type { AnswerState, AnswerStoreContextValue };
