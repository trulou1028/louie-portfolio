"use client";

import * as React from "react";
import { ArrowUp, FileText, Sparkles } from "lucide-react";

import { useAskLouie } from "@/components/ai/ask-louie-dialog";
import { STARTER_QUESTIONS } from "@/components/ai/ask-questions";
import { JobDescriptionTrigger } from "@/components/ai/job-description-dialog";
import { track } from "@/lib/analytics";

/**
 * The homepage ask bar (Plan 042, Plan 043). A real text box in the hero,
 * so every visitor sees that they can ask on the first screen. Sending
 * opens the side panel, which asks the question there; the panel owns the
 * answer.
 *
 * - The bar is a field with two controls inset 8px: "Job description" (the
 *   recruiter path, amber) and Send. Field 16px, controls 8px: the outer
 *   radius is the inner radius plus the gap (AGENTS.md, Radius).
 * - Under it, "Try asking" and the starter questions. Each question ends in
 *   the Send arrow, so it reads as "this sends", not as a tag.
 */
function HeroAsk({ className }: { className?: string }) {
  const { openAsk } = useAskLouie();
  const [value, setValue] = React.useState("");

  function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    openAsk(value);
    setValue("");
  }

  return (
    <div className={className}>
      <form
        onSubmit={submit}
        className="flex h-15 items-center gap-2 rounded-field border-[1.5px] border-foreground bg-surface pl-4 pr-2 shadow-[0_12px_32px_-18px_hsl(230_30%_5%/0.35)] transition-shadow duration-(--duration-fast) focus-within:shadow-[0_0_0_4px_hsl(var(--accent-muted)),0_12px_32px_-18px_hsl(230_30%_5%/0.35)]"
      >
        <Sparkles aria-hidden="true" className="size-5 shrink-0 text-foreground" />
        <input
          type="text"
          value={value}
          onChange={(event) => setValue(event.target.value)}
          aria-label="Ask about my work"
          placeholder="Ask about my work"
          maxLength={500}
          className="min-w-0 flex-1 bg-transparent pl-1 text-body-lg text-foreground outline-none placeholder:text-foreground-muted"
        />
        <JobDescriptionTrigger
          trigger={
            <button
              type="button"
              aria-label="Paste a job description"
              title="Paste a job description"
              className="focus-ring inline-flex h-11 shrink-0 items-center gap-1.5 rounded-control border border-accent-muted bg-accent-soft px-3 text-body-sm font-medium text-accent-foreground transition-colors duration-(--duration-fast) hover:border-accent-foreground/40 max-sm:w-11 max-sm:justify-center max-sm:px-0"
            >
              <FileText aria-hidden="true" className="size-4" />
              <span className="max-sm:sr-only">Job description</span>
            </button>
          }
        />
        <button
          type="submit"
          aria-label="Send question"
          className="focus-ring inline-flex size-11 shrink-0 items-center justify-center rounded-control bg-accent-fill text-accent-on-fill transition-colors duration-(--duration-fast) hover:bg-accent-fill-hover"
        >
          <ArrowUp aria-hidden="true" className="size-5" />
        </button>
      </form>

      <div className="mt-4">
        <p id="hero-try-asking" className="text-body-sm text-foreground-muted">Try asking</p>
        <ul aria-labelledby="hero-try-asking" className="mt-2 flex flex-wrap gap-2">
          {STARTER_QUESTIONS.map((question) => (
            <li key={question.slug}>
              <button
                type="button"
                onClick={() => {
                  track("ai_prompt_chip_clicked", { chip: question.slug, source: "hero" });
                  openAsk(question.text);
                }}
                className="focus-ring group inline-flex h-9 items-center gap-2 rounded-full border border-border-default bg-surface pl-3.5 pr-1.5 text-body-sm font-medium text-foreground shadow-[0_1px_2px_hsl(var(--foreground)/0.06)] transition-[border-color,transform] duration-(--duration-fast) hover:-translate-y-px hover:border-foreground"
              >
                {question.text}
                <span
                  aria-hidden="true"
                  className="flex size-6 items-center justify-center rounded-full bg-surface-muted text-foreground transition-colors duration-(--duration-fast) group-hover:bg-accent-fill group-hover:text-accent-on-fill"
                >
                  <ArrowUp className="size-3.5" />
                </span>
              </button>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

export { HeroAsk };
