"use client";

import * as React from "react";
import { Sparkles } from "lucide-react";

import { AiLouieThread } from "@/components/ai/ai-louie-thread";
import { SystemLabel } from "@/components/system/system-label";
import { cn } from "@/lib/utils";

/**
 * The Ask panel — the homepage's right rail (Plan 014, "Ask Louie").
 *
 * A basic question-and-answer chat: the visitor asks, the answer streams as
 * plain text in the transcript below, grounded in the portfolio's evidence
 * index. There is no generative UI, no navigation, and no side panel this
 * assistant drives — Plan 014 is an owner decision to revert the earlier
 * "Ask the panel; the site answers" concept (Plan 012) to exactly this.
 *
 * The panel is a tool, so its header stays compact rather than hero-sized.
 * `id="ask-ai-louie"` stays a stable in-page anchor — the hero's "Ask Louie"
 * action was removed (owner decision, 2026-08-27) but suggestion chips and
 * deep links still target it. `AiLouieThread` defers the runtime until the
 * visitor approaches (spec §27).
 */
function AskPanel() {
  return (
    <div
      id="ask-ai-louie"
      className={cn(
        // The rail itself is the container — no box inside a box. It fills
        // the pane, and its footer (suggestions + composer) is pinned to the
        // bottom by ThreadBody.
        "flex h-full min-h-0 flex-col gap-4 bg-accent-soft/40 p-5",
        // No `lg:border-l`: at lg+ the pane's `ResizableHandle` already draws
        // a 1px `border-subtle` line on this edge, and a border here sat
        // beside it as a second one — the pair read as a 2px rule, heavier
        // than every other border on the site.
        "scroll-mt-8",
        // Below lg there is no pane: it sits in the page flow, so it reads as
        // a card again. It still needs a bounded height, though — without one
        // the panel grows to fit the whole conversation and pushes the
        // composer off screen. `max-h` (not `h`) keeps an empty panel
        // compact; `svh` (not `vh`) avoids overshooting under a mobile
        // browser's collapsing address bar.
        "max-lg:max-h-[80svh] max-lg:rounded-panel max-lg:border max-lg:border-accent-muted/70",
      )}
    >
      {/* Header: the panel names itself once, with a live pill — the
          Ask-LUMO header pattern from the Offboard app. */}
      <div className="flex flex-wrap items-center justify-between gap-x-3 gap-y-2">
        <div className="flex min-w-0 items-center gap-2">
          <Sparkles aria-hidden="true" className="size-4 shrink-0 text-accent" />
          {/* Never break the title across lines — the rail is draggable down
              to 260px and "Ask AI / Louie" reads as a mistake. The pill wraps
              beneath instead. */}
          <h2 className="whitespace-nowrap text-heading-md text-foreground">
            Ask Louie
          </h2>
        </div>

        <SystemLabel
          tone="accent"
          className="shrink-0 gap-1.5 rounded-full px-2 py-1 normal-case"
        >
          <span aria-hidden="true" className="size-1.5 rounded-full bg-accent" />
          Live
        </SystemLabel>
      </div>

      <AiLouieThread />
    </div>
  );
}

export { AskPanel };
export default AskPanel;
