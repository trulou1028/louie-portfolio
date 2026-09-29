"use client";

import * as React from "react";

import dynamic from "next/dynamic";

import { AiLouieThread } from "@/components/ai/ai-louie-thread";
import { AssistantAvatar } from "@/components/ai/assistant-avatar";
import { useAskLouie } from "@/components/ai/ask-louie-dialog";

/**
 * On-demand chat body. The dialog supplies its bounded height and focus
 * management, and passes its Close control as `headerEnd` so the title and
 * Close share one header row (Plan 039).
 */
/** The comparison view loads with the rest of the AI surface (spec §27). */
const JobCompare = dynamic(() => import("@/components/ai/job-compare"));

function AskPanel({ headerEnd }: { headerEnd?: React.ReactNode }) {
  const { page, view } = useAskLouie();
  return (
    <div id="ask-ai-louie" className="flex min-h-0 flex-1 flex-col bg-canvas scroll-mt-8">
      <div className="flex h-16 shrink-0 items-center justify-between gap-3 border-b border-border-subtle pl-5 pr-3">
        <div className="flex min-w-0 items-center gap-3">
          <AssistantAvatar className="size-9 self-center" />
          <div className="min-w-0">
            {/* Keep the assistant title intact at narrow widths. */}
            <h2 className="whitespace-nowrap font-display text-body-lg font-bold leading-tight text-foreground">
              Ask Louie
            </h2>
            <p className="truncate text-body-sm text-foreground-muted">Answers from my case studies</p>
          </div>
        </div>
        {headerEnd}
      </div>

      {/* Both views stay mounted, so switching to the comparison and back
          keeps the chat transcript and draft (Plan 042). */}
      <div hidden={view !== "chat"} className="flex min-h-0 flex-1 flex-col gap-4 p-5">
        {/* Plan 042: on a project page, say which project the starter
            questions are about. */}
        {page ? (
          <p className="rounded-md bg-surface-muted px-3 py-2 text-body-sm text-foreground-muted">
            Reading: <span className="font-semibold text-foreground">{page.name}</span>. The questions below are about this project.
          </p>
        ) : null}
        <AiLouieThread />
      </div>
      {view === "compare" ? (
        <div className="flex min-h-0 flex-1 flex-col p-5">
          <JobCompare />
        </div>
      ) : null}
    </div>
  );
}

export { AskPanel };
export default AskPanel;
