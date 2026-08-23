"use client";

import * as React from "react";
import Link from "next/link";
import { Sparkles } from "lucide-react";

import { AiLouieThread } from "@/components/ai/ai-louie-thread";
import { Action } from "@/components/system/action";
import { SectionLabel } from "@/components/system/section-label";
import { Surface } from "@/components/system/surface";
import { SystemLabel } from "@/components/system/system-label";

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
    <Surface
      variant="ai"
      radius="panel"
      id="ask-ai-louie"
      className="scroll-mt-8 flex flex-col gap-5 p-5 sm:p-6"
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <SectionLabel>Ask</SectionLabel>
          <div className="mt-1.5 flex items-center gap-2">
            <Sparkles aria-hidden="true" className="size-4 text-accent" />
            <h2 className="text-heading-md text-foreground">AI Louie</h2>
          </div>
          <p className="mt-1.5 text-body-sm text-foreground-muted">
            Ask about my work, process, or the systems I build.
          </p>
        </div>

        <SystemLabel
          tone="accent"
          className="shrink-0 gap-2 rounded-full px-2.5 py-1 normal-case"
        >
          <span aria-hidden="true" className="size-1.5 rounded-full bg-accent" />
          AI Louie
        </SystemLabel>
      </div>

      <AiLouieThread />
    </Surface>
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
