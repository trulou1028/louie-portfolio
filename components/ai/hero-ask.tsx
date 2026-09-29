"use client";

import * as React from "react";
import { ArrowUp, FileText, Sparkles } from "lucide-react";

import { useAskLouie } from "@/components/ai/ask-louie-dialog";
import { STARTER_QUESTIONS } from "@/components/ai/ask-questions";
import { JobDescriptionTrigger } from "@/components/ai/job-description-dialog";
import { track } from "@/lib/analytics";

/** Two general questions beside the job-description entry point. */
const HERO_QUESTIONS = STARTER_QUESTIONS.slice(0, 2);

/**
 * The homepage ask bar (Plan 042). A real text box in the hero, so every
 * visitor sees that they can ask on the first screen. Sending opens the
 * side panel, which asks the question there; the panel owns the answer.
 *
 * "Paste a job description" is first and amber: it is the recruiter path,
 * and it opens the same comparison dialog as before. No helper text under
 * the buttons: the hero stays quiet, and the panel header says where
 * answers come from.
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
        className="flex h-15 items-center gap-3 rounded-xl border-[1.5px] border-foreground bg-surface pl-5 pr-2 shadow-[0_12px_32px_-18px_hsl(230_30%_5%/0.35)] transition-shadow duration-(--duration-fast) focus-within:shadow-[0_0_0_4px_hsl(var(--accent-muted)),0_12px_32px_-18px_hsl(230_30%_5%/0.35)]"
      >
        <Sparkles aria-hidden="true" className="size-5 shrink-0 text-foreground" />
        <input
          type="text"
          value={value}
          onChange={(event) => setValue(event.target.value)}
          aria-label="Ask about my work"
          placeholder="Ask about my work"
          maxLength={500}
          className="min-w-0 flex-1 bg-transparent text-body-lg text-foreground outline-none placeholder:text-foreground-muted"
        />
        <button
          type="submit"
          aria-label="Send question"
          className="focus-ring inline-flex size-11 shrink-0 items-center justify-center rounded-md bg-accent-fill text-accent-on-fill transition-colors duration-(--duration-fast) hover:bg-accent-fill-hover"
        >
          <ArrowUp aria-hidden="true" className="size-5" />
        </button>
      </form>

      <div className="mt-3 flex flex-wrap gap-1.5">
        <JobDescriptionTrigger
          trigger={
            <button
              type="button"
              className="focus-ring inline-flex h-9 items-center gap-1.5 rounded-full border border-accent-muted bg-accent-soft px-3 text-body-sm font-medium text-accent-foreground transition-colors duration-(--duration-fast) hover:border-accent-foreground/40"
            >
              <FileText aria-hidden="true" className="size-3.5" />
              Paste a job description
            </button>
          }
        />
        {HERO_QUESTIONS.map((question) => (
          <button
            key={question.slug}
            type="button"
            onClick={() => {
              track("ai_prompt_chip_clicked", { chip: question.slug, source: "hero" });
              openAsk(question.text);
            }}
            className="focus-ring inline-flex h-9 items-center rounded-full border border-border-default bg-surface px-3 text-body-sm font-medium text-foreground transition-colors duration-(--duration-fast) hover:border-border-strong"
          >
            {question.text}
          </button>
        ))}
      </div>
    </div>
  );
}

export { HeroAsk };
