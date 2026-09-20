"use client";

import * as React from "react";
import { Sparkles } from "lucide-react";

import { AiLouieThread } from "@/components/ai/ai-louie-thread";
import { cn } from "@/lib/utils";

/** On-demand chat body. The dialog supplies its bounded height and focus management. */
function AskPanel() {
  return (
    <div
      id="ask-ai-louie"
      className={cn("flex min-h-0 flex-1 flex-col gap-4 bg-accent-soft/40 p-5 scroll-mt-8")}
    >
      <div className="flex flex-wrap items-center justify-between gap-x-3 gap-y-2">
        <div className="flex min-w-0 items-center gap-2">
          <Sparkles aria-hidden="true" className="size-4 shrink-0 text-accent" />
          {/* Keep the assistant title intact at narrow widths. */}
          <h2 className="whitespace-nowrap text-heading-md text-foreground">
            Ask Louie
          </h2>
        </div>


      </div>

      <AiLouieThread />
    </div>
  );
}

export { AskPanel };
export default AskPanel;
