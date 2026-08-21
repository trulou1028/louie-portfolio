import { Sparkles } from "lucide-react";

import { PromptChip } from "@/components/ai/prompt-chip";
import { Surface } from "@/components/system/surface";
import { SystemLabel } from "@/components/system/system-label";

/**
 * The AI Louie entry point (spec §11 §2) — a core product surface, not a chat
 * bubble.
 *
 * STATIC PREVIEW. Plan 006 replaces these internals with the real
 * assistant-ui thread; the visual frame stays. Everything here is honest
 * about that:
 *
 * - The suggested questions are real links that open the relevant work, so no
 *   control is dead (spec §11: "do not ship fake controls").
 * - The composer is visibly and semantically disabled, with the reason stated
 *   in text rather than implied.
 * - "Paste a job description" is deliberately absent from the suggestions
 *   until the evaluator exists (Plan 007) — it is the one suggestion with no
 *   honest destination today. Recorded in README deviations.
 */
const SUGGESTIONS = [
  { label: "Show me Offboard", href: "/work/offboard" },
  { label: "How technical is Louie?", href: "/work/offboard" },
  { label: "Tell me about Flexi", href: "/work/flexi" },
  { label: "Show me agent workflows", href: "/work/offboard" },
  { label: "Show me user research", href: "/work/flexi" },
] as const;

function AiLouieThread() {
  return (
    <Surface variant="ai" radius="panel" className="p-6 sm:p-8">
      <div className="flex items-center gap-2.5">
        <Sparkles aria-hidden="true" className="size-4 text-accent" />
        <h2 className="text-heading-md text-foreground">Ask AI Louie</h2>
      </div>

      <p className="mt-2 max-w-[60ch] text-body text-foreground-muted">
        Ask about my work, process, experience, or the systems I build.
      </p>

      {/* The designed opening message (spec §11 §2, verbatim). */}
      <Surface
        radius="lg"
        className="mt-6 border-accent-muted/70 bg-surface-raised p-5"
      >
        <SystemLabel tone="accent">AI Louie</SystemLabel>
        <p className="mt-3 max-w-[62ch] text-body text-foreground">
          Hi, I&rsquo;m AI Louie. I can answer questions about Louie&rsquo;s
          work and take you directly to the evidence behind my answer.
        </p>
      </Surface>

      <ul className="mt-5 flex flex-wrap gap-2.5">
        {SUGGESTIONS.map((s) => (
          <li key={s.label}>
            <PromptChip label={s.label} href={s.href} />
          </li>
        ))}
      </ul>

      <div className="mt-6 flex flex-col gap-2">
        <label htmlFor="ai-composer" className="sr-only">
          Ask anything about Louie&rsquo;s work
        </label>
        <input
          id="ai-composer"
          type="text"
          disabled
          placeholder="Ask anything about Louie's work..."
          aria-describedby="ai-composer-status"
          className="h-12 w-full cursor-not-allowed rounded-md border border-border-default bg-surface-muted px-4 text-body text-foreground placeholder:text-foreground-muted disabled:opacity-70"
        />
        <p
          id="ai-composer-status"
          className="text-body-sm text-foreground-muted"
        >
          Conversation isn&rsquo;t switched on yet. The questions above open the
          work they refer to.
        </p>
      </div>
    </Surface>
  );
}

export { AiLouieThread };
