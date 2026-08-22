"use client";

import { Sparkles } from "lucide-react";
import { MessagePrimitive, ThreadPrimitive } from "@assistant-ui/react";
import { useAISDKError } from "@assistant-ui/react-ai-sdk";

import { AiLouieComposer } from "@/components/ai/ai-louie-composer";
import { AiLouieRuntime } from "@/components/ai/ai-louie-runtime";
import { Surface } from "@/components/system/surface";
import { SystemLabel } from "@/components/system/system-label";
import { cn } from "@/lib/utils";

/**
 * The AI Louie surface (spec §11 §2, §21, §31).
 *
 * Interaction borrows familiarity from chat without cloning it (spec §21):
 * user turns are a quiet inline treatment, assistant turns are open editorial
 * text with evidence beneath, and tool activity is reported in plain language
 * — never chain-of-thought.
 *
 * When the backend is unconfigured or failing, the thread shows the spec §31
 * copy and the rest of the portfolio is untouched.
 */

/** Spec §11 §2 verbatim, minus the job-description chip (Plan 007). */
const SUGGESTIONS = [
  "Show me Offboard",
  "How technical is Louie?",
  "Tell me about Flexi",
  "Show me agent workflows",
  "Show me user research",
] as const;

function AssistantAvatar() {
  return (
    <span
      aria-hidden="true"
      className="flex size-8 shrink-0 items-center justify-center rounded-full bg-accent text-surface"
    >
      <Sparkles className="size-4" />
    </span>
  );
}

function UserMessage() {
  return (
    <MessagePrimitive.Root className="flex justify-end">
      <div className="max-w-[85%] rounded-md rounded-br-xs border border-border-default bg-surface px-4 py-2.5 text-body text-foreground">
        <MessagePrimitive.Parts />
      </div>
    </MessagePrimitive.Root>
  );
}

function AssistantMessage() {
  return (
    <MessagePrimitive.Root className="flex gap-3">
      <AssistantAvatar />
      {/* Open editorial text, not a giant bubble (spec §21). */}
      {/* No per-message error here on purpose: a failed turn already raises
          the thread-level notice below, and showing both means a visitor
          reads two apologies for one failure. */}
      <div className="flex min-w-0 flex-1 flex-col gap-3 pt-1 text-body text-foreground [&_p]:mb-3 last:[&_p]:mb-0">
        <MessagePrimitive.Parts />
      </div>
    </MessagePrimitive.Root>
  );
}

/**
 * Runtime failures — the endpoint down, rate limited, or the provider
 * erroring. The raw error is never shown (spec §31); the portfolio stays
 * usable and the visitor is pointed at the work.
 */
function ThreadError() {
  const error = useAISDKError();
  if (!error) return null;

  return (
    <Surface
      role="status"
      className="border-danger/30 bg-surface p-4 text-body-sm text-foreground-muted"
    >
      AI Louie is temporarily unavailable. You can still explore all of
      Louie&rsquo;s work below.
    </Surface>
  );
}

function ThreadBody() {
  return (
    <ThreadPrimitive.Root className="flex flex-col gap-5">
      <ThreadPrimitive.Viewport
        autoScroll
        className="flex max-h-[min(60vh,540px)] flex-col gap-6 overflow-y-auto"
      >
        {/* Opening message, shown until the visitor says something. */}
        <ThreadPrimitive.Empty>
          <div className="flex gap-3">
            <AssistantAvatar />
            <Surface
              radius="lg"
              className="min-w-0 flex-1 border-accent-muted/70 bg-surface-raised p-5"
            >
              <p className="max-w-[62ch] text-body text-foreground">
                Hi, I&rsquo;m AI Louie. I can answer questions about
                Louie&rsquo;s work and take you directly to the evidence behind
                my answer.
              </p>
            </Surface>
          </div>
        </ThreadPrimitive.Empty>

        <ThreadPrimitive.Messages
          components={{
            UserMessage,
            AssistantMessage,
          }}
        />
      </ThreadPrimitive.Viewport>

      <ThreadError />

      {/* Suggestions collapse once the conversation is underway. */}
      <ThreadPrimitive.Empty>
        <div className="flex flex-col gap-2.5">
          <p className="text-body-sm text-foreground-muted">Try asking about:</p>
          <ul className="flex flex-wrap gap-2.5">
            {SUGGESTIONS.map((prompt) => (
              <li key={prompt}>
                <ThreadPrimitive.Suggestion
                  prompt={prompt}
                  method="replace"
                  autoSend
                  className={cn(
                    "inline-flex min-h-11 items-center rounded-sm border border-border-default bg-surface",
                    "px-3.5 py-2 text-left text-body-sm text-foreground-muted focus-ring",
                    "transition-colors duration-(--duration-fast)",
                    "hover:border-accent-muted hover:bg-accent-soft hover:text-accent-foreground",
                  )}
                >
                  {prompt}
                </ThreadPrimitive.Suggestion>
              </li>
            ))}
          </ul>
        </div>
      </ThreadPrimitive.Empty>

      <AiLouieComposer />
    </ThreadPrimitive.Root>
  );
}

function AiLouieThread() {
  return (
    <Surface variant="ai" radius="panel" className="p-6 sm:p-8">
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2.5">
            <Sparkles aria-hidden="true" className="size-4 text-accent" />
            <h2 className="text-heading-md text-foreground">Ask AI Louie</h2>
          </div>
          <p className="mt-2 max-w-[56ch] text-body text-foreground-muted">
            Ask about my work, process, experience, or the systems I build.
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

      {/* Announces new answers and tool activity without narrating every
          token (spec §26). */}
      <div className="mt-6" aria-live="polite" aria-atomic="false">
        <AiLouieRuntime>
          <ThreadBody />
        </AiLouieRuntime>
      </div>
    </Surface>
  );
}

export { AiLouieThread };
