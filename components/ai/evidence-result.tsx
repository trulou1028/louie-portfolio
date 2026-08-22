"use client";

import { makeAssistantToolUI } from "@assistant-ui/react";

import { EvidenceCard } from "@/components/portfolio/evidence-card";
import { ToolStatus } from "@/components/ai/tool-status";
import type { EvidenceItem } from "@/content/evidence/evidence";

/**
 * Generative UI for the assistant's tool calls (spec §19, §21).
 *
 * The model never emits markup. It calls a tool; the frontend decides what
 * that looks like, choosing from an allowlisted vocabulary — here,
 * `EvidenceCard` and `ToolStatus`. Nothing the model returns is rendered as
 * HTML (spec §32).
 */

type SearchArgs = { query: string };
type SearchResult = { results: EvidenceItem[] };

/** `search_portfolio` — shows progress, then the evidence it grounded on. */
export const SearchPortfolioUI = makeAssistantToolUI<SearchArgs, SearchResult>({
  toolName: "search_portfolio",
  render: ({ args, result, status }) => {
    if (status.type === "running") {
      return <ToolStatus state="running" label="Searching portfolio" />;
    }

    const results = result?.results ?? [];

    if (results.length === 0) {
      return (
        <ToolStatus
          state="done"
          label={`No evidence found for “${args?.query ?? ""}”`}
        />
      );
    }

    return (
      <div className="flex flex-col gap-2.5">
        <ToolStatus
          state="done"
          label={`Found ${results.length} relevant example${results.length === 1 ? "" : "s"}`}
        />
        <ul className="flex flex-col gap-2">
          {results.slice(0, 3).map((item) => (
            <li key={item.id}>
              <EvidenceCard
                evidenceId={item.id}
                project={item.project}
                title={item.title}
                relevance={item.summary}
                route={item.route}
                anchor={item.anchor}
                highlighted
              />
            </li>
          ))}
        </ul>
      </div>
    );
  },
});

type NavigateArgs = { route: string; anchor?: string };
type NavigateResult = { navigated: boolean; href?: string; error?: string };

/** `navigate_portfolio` — and a manual fallback when it fails (spec §31). */
export const NavigatePortfolioUI = makeAssistantToolUI<
  NavigateArgs,
  NavigateResult
>({
  toolName: "navigate_portfolio",
  render: ({ args, result, status }) => {
    if (status.type === "running") {
      return <ToolStatus state="running" label="Opening section" />;
    }

    if (result && !result.navigated) {
      return (
        <div className="flex flex-col gap-1.5">
          <ToolStatus state="error" label="Couldn’t open that automatically" />
          <a
            href={args?.route ?? "/work"}
            className="focus-ring rounded-xs text-body-sm font-medium text-accent hover:underline"
          >
            Open {args?.route ?? "the work"} manually
          </a>
        </div>
      );
    }

    return <ToolStatus state="done" label={`Opened ${result?.href ?? "section"}`} />;
  },
});

type ShowEvidenceResult = {
  shown: boolean;
  evidence?: { id: string; title: string; route: string; anchor?: string };
  error?: string;
};

/** `show_evidence` — surfaced in the panel; a quiet confirmation in-thread. */
export const ShowEvidenceUI = makeAssistantToolUI<
  { evidenceId: string },
  ShowEvidenceResult
>({
  toolName: "show_evidence",
  render: ({ result, status }) => {
    if (status.type === "running") {
      return <ToolStatus state="running" label="Opening evidence" />;
    }
    if (result && !result.shown) {
      return <ToolStatus state="error" label="That evidence isn’t available" />;
    }
    return <ToolStatus state="done" label="Evidence added to the panel" />;
  },
});

/** `set_context_panel` — intentionally silent; the panel change is the feedback. */
export const SetContextPanelUI = makeAssistantToolUI<
  { view: string },
  { updated: boolean }
>({
  toolName: "set_context_panel",
  render: () => null,
});
