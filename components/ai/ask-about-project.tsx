"use client";

import { ArrowRight, Sparkles } from "lucide-react";

import { useAskLouie } from "@/components/ai/ask-louie-dialog";
import { track } from "@/lib/analytics";
import { cn } from "@/lib/utils";

/**
 * "Ask about <project>" on a case study (Plan 042). It names the project,
 * so the visitor can see the panel will start from this page.
 *
 * - `rail`: a card under "On this page", with two of the page's questions
 *   and a button for their own question.
 * - `inline`: one button for narrow screens, where the rail is hidden.
 *
 * Renders nothing on pages without project questions.
 */
function AskAboutProject({ variant = "rail", className }: { variant?: "rail" | "inline"; className?: string }) {
  const { page, openAsk } = useAskLouie();
  if (!page) return null;

  if (variant === "inline") {
    return (
      <button
        type="button"
        onClick={() => openAsk()}
        className={cn(
          "focus-ring flex w-full items-center gap-3 rounded-md border border-border-default bg-surface px-4 py-3 text-left text-body-sm font-semibold text-foreground transition-colors duration-(--duration-fast) hover:border-border-strong @5xl/canvas:hidden",
          className,
        )}
      >
        <Sparkles aria-hidden="true" className="size-4 shrink-0" />
        Ask about {page.name}
        <ArrowRight aria-hidden="true" className="ml-auto size-4 shrink-0 text-foreground-muted" />
      </button>
    );
  }

  return (
    <section aria-labelledby="ask-about-project" className={cn("rounded-lg border border-border-default bg-surface p-4", className)}>
      <h2 id="ask-about-project" className="flex items-center gap-2 text-body font-semibold text-foreground">
        <span aria-hidden="true" className="flex size-7 items-center justify-center rounded-full bg-accent-soft text-accent-foreground">
          <Sparkles className="size-3.5" />
        </span>
        Ask about {page.name}
      </h2>
      <ul className="mt-3 flex flex-col divide-y divide-border-subtle border-y border-border-subtle">
        {page.questions.slice(0, 2).map((question) => (
          <li key={question.slug}>
            <button
              type="button"
              onClick={() => {
                track("ai_prompt_chip_clicked", { chip: question.slug, source: "rail" });
                openAsk(question.text);
              }}
              className="focus-ring group flex w-full items-start justify-between gap-3 rounded-xs py-2.5 text-left text-body-sm text-foreground transition-colors duration-(--duration-fast) hover:text-foreground-muted"
            >
              {question.text}
              <ArrowRight aria-hidden="true" className="mt-0.5 size-3.5 shrink-0 text-foreground-muted transition-transform duration-(--duration-fast) group-hover:translate-x-0.5" />
            </button>
          </li>
        ))}
      </ul>
      <button
        type="button"
        onClick={() => openAsk()}
        className="focus-ring mt-3 inline-flex h-10 w-full items-center justify-center gap-2 rounded-full bg-accent-fill text-body-sm font-semibold text-accent-on-fill transition-colors duration-(--duration-fast) hover:bg-accent-fill-hover"
      >
        Ask your own question
      </button>
    </section>
  );
}

export { AskAboutProject };
