"use client";

import * as React from "react";
import Link from "next/link";
import { Sparkles } from "lucide-react";

import { AiLouieThread } from "@/components/ai/ai-louie-thread";
import { Action } from "@/components/system/action";
import { SystemLabel } from "@/components/system/system-label";
import { cn } from "@/lib/utils";

/**
 * The Ask panel — the homepage's right rail (spec §10, §11 §2; Plan 012).
 *
 * "Ask the panel; the site answers." The panel is a control surface, not the
 * display: it carries the header, the suggested questions, a compact
 * transcript, and the composer. Substantive answers compose the Answer
 * Canvas in the main column instead of piling up as bubbles here — see
 * `answer-canvas.tsx`.
 *
 * The panel is a tool, so its header stays compact rather than hero-sized.
 * `id="ask-ai-louie"` keeps the hero's "Ask AI Louie" action landing
 * somewhere real; `AiLouieThread` defers the runtime until the visitor
 * approaches (spec §27).
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
        "scroll-mt-8 xl:border-l xl:border-border-subtle",
        // Below xl there is no pane: it sits in the page flow, so it reads as
        // a card again and takes its natural height.
        "max-xl:h-auto max-xl:rounded-panel max-xl:border max-xl:border-accent-muted/70",
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
            Ask AI Louie
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

      {/* The Offboard panel closes with a line telling you what the assistant
          can actually see. Same job here: set the expectation that answers are
          grounded in published evidence, before anyone asks. */}
      <p className="text-body-sm text-foreground-muted">
        It answers from Louie&rsquo;s case studies and cites the evidence.
      </p>
    </div>
  );
}

/**
 * The hero's "Ask AI Louie" entry point (spec §11 §1; Plan 012).
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
