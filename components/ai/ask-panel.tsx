"use client";

import * as React from "react";
import Link from "next/link";
import { Sparkles } from "lucide-react";

import { AiLouieThread } from "@/components/ai/ai-louie-thread";
import { Action } from "@/components/system/action";
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
 * `id="ask-ai-louie"` keeps the hero's "Ask Louie" action landing somewhere
 * real; `AiLouieThread` defers the runtime until the visitor approaches
 * (spec §27).
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
        "scroll-mt-8 lg:border-l lg:border-border-subtle",
        // Below lg there is no pane: it sits in the page flow, so it reads as
        // a card again and takes its natural height.
        "max-lg:h-auto max-lg:rounded-panel max-lg:border max-lg:border-accent-muted/70",
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

/**
 * The hero's "Ask Louie" entry point (spec §11 §1; Plan 012, renamed by
 * Plan 014).
 *
 * The href is the fallback that always works — `#ask-ai-louie` resolves to
 * the panel itself, wherever the responsive layout has placed it. On click
 * it also tries to focus the composer directly, so keyboard and
 * screen-reader users land in the input rather than merely at the top of
 * the panel. That only succeeds once the runtime has loaded (spec §27
 * defers it below `xl`), so the attempt is best-effort — the href already
 * did the part that must never fail.
 */
function AskAILouieLink({
  className,
  children,
}: {
  className?: string;
  children: React.ReactNode;
}) {
  function focusComposer() {
    const input = document.querySelector<HTMLTextAreaElement>(
      '#ask-ai-louie textarea[aria-label="Ask anything about Louie\'s work"]',
    );
    input?.focus();
  }

  return (
    <Action
      variant="secondary"
      render={<Link href="#ask-ai-louie" />}
      className={className}
      onClick={focusComposer}
    >
      {children}
    </Action>
  );
}

export { AskPanel, AskAILouieLink };
export default AskPanel;
