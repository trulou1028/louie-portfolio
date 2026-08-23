"use client";

import * as React from "react";
import { Sparkles } from "lucide-react";
import {
  MessagePrimitive,
  ThreadPrimitive,
  useAuiState,
} from "@assistant-ui/react";
import { useAISDKError } from "@assistant-ui/react-ai-sdk";

import { AiLouieComposer } from "@/components/ai/ai-louie-composer";
import { AiLouieRuntime } from "@/components/ai/ai-louie-runtime";
import { JobDescriptionDialog } from "@/components/ai/job-description-dialog";
import { ToolStatus } from "@/components/ai/tool-status";
import { Surface } from "@/components/system/surface";
import { cn } from "@/lib/utils";

/**
 * The AI Louie surface (spec §11 §2, §21, §31; Plan 012 "Ask the panel; the
 * site answers").
 *
 * This is the panel's half of the hook: a compact transcript with a visible
 * reasoning trail, never a wall of bubbles. Substantive answers are composed
 * on the Answer Canvas in the main column instead (`answer-canvas.tsx`) —
 * `AnswerSync` below is the wiring between the two.
 *
 * Interaction still borrows familiarity from chat without cloning it
 * (spec §21): user turns are a quiet inline treatment, assistant turns are
 * clamped editorial text with a link out to the full answer, and tool
 * activity is reported in plain language — never chain-of-thought.
 *
 * When the backend is unconfigured or failing, the panel shows the spec §31
 * copy and the rest of the portfolio is untouched.
 */

/**
 * Spec §11 §2. "Paste a job description" is not in this list because it is
 * not a question — it opens the evaluator dialog beside the list instead.
 */
const SUGGESTIONS = [
  "Show me Offboard",
  "How technical is Louie?",
  "Tell me about Flexi",
  "Show me agent workflows",
  "Show me user research",
] as const;

/** Reads the plain-text content of a message's text parts, in order. */

/**
 * Writes the thread's lifecycle into the answer store (spec: Plan 012 step
 * 3) — no UI of its own. Watches the last message in the thread: a new user
 * turn means a question was asked, a running assistant turn means the canvas
 * should show its skeleton, and a completed assistant turn hands the canvas
 * its answer text and evidence ids.
 *
 * When the model navigates instead of answering (no text at all), the
 * canvas is cleared rather than left showing a permanent skeleton —
 * `navigate_portfolio` takes precedence over the Answer Sheet, matching the
 * existing spec §18 Tool 2 behavior.
 */

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
      <div className="max-w-[85%] rounded-md rounded-br-xs border border-border-default bg-surface px-3.5 py-2 text-body-sm text-foreground">
        {/* Reasoning is explicitly dropped. Reasoning-capable models stream
            reasoning parts, and spec §21 forbids showing chain-of-thought.
            assistant-ui's default already renders null for these, but stating
            it here means the guarantee is ours rather than an inherited
            default that a future components override could quietly undo. */}
        <MessagePrimitive.Parts components={{ Reasoning: () => null }} />
      </div>
    </MessagePrimitive.Root>
  );
}

function ComposingIndicator() {
  const status = useAuiState((s) => s.message.status?.type);
  const partSignature = useAuiState((s) =>
    s.message.parts.map((part) => part.type).join(","),
  );

  if (status !== "running") return null;
  const types = partSignature.split(",").filter(Boolean);
  const hasToolCall = types.includes("tool-call");
  const lastIsText = types[types.length - 1] === "text";
  if (!hasToolCall || !lastIsText) return null;

  return <ToolStatus state="running" label="Composing answer" />;
}

function AssistantMessage() {
  return (
    <MessagePrimitive.Root className="flex gap-3">
      <AssistantAvatar />
      {/* Open editorial text that streams in place (spec §21). Answers live
          in the conversation; evidence cards render inline beneath the text
          through the tool UI, so the panel is self-contained. */}
      {/* No per-message error here on purpose: a failed turn already raises
          the thread-level notice below, and showing both means a visitor
          reads two apologies for one failure. */}
      <div className="flex min-w-0 flex-1 flex-col gap-3 pt-1 text-body-sm text-foreground [&_p]:mb-2 last:[&_p]:mb-0">
        <MessagePrimitive.Parts components={{ Reasoning: () => null }} />
        <ComposingIndicator />
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
    <ThreadPrimitive.Root className="flex min-h-0 flex-1 flex-col gap-4">
      {/* The conversation takes the slack; the composer below is pinned.
          `min-h-0` is what lets a flex child actually scroll instead of
          growing its parent. */}
      <ThreadPrimitive.Viewport
        autoScroll
        className="flex min-h-0 flex-1 flex-col gap-5 overflow-y-auto"
      >
        {/* Opening message, shown until the visitor says something. */}
        <ThreadPrimitive.Empty>
          <div className="flex gap-3">
            <AssistantAvatar />
            <Surface
              radius="lg"
              className="min-w-0 flex-1 border-accent-muted/70 bg-surface-raised p-4"
            >
              <p className="text-body-sm text-foreground">
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

      {/* Pinned footer: suggestions (until the conversation starts) and the
          composer sit at the bottom of the panel, the way the Ask-LUMO block
          anchors the Offboard rail. */}
      <div className="flex shrink-0 flex-col gap-3">
      {/* Suggestions collapse once the conversation is underway. */}
      <ThreadPrimitive.Empty>
        <div className="flex flex-col gap-2">
          <p className="text-body-sm text-foreground-muted">Try asking about:</p>
          {/* Wrapping pills, not one question per line — the Ask-LUMO
              pattern from the Offboard app uses the rail's width. */}
          <ul className="flex flex-wrap gap-1.5">
            {SUGGESTIONS.map((prompt) => (
              <li key={prompt}>
                <ThreadPrimitive.Suggestion
                  prompt={prompt}
                  method="replace"
                  autoSend
                  className={cn(
                    // Wrapping pills, matching the Ask-LUMO pattern in the
                    // Offboard app: quieter than bordered rows, and they use
                    // the rail's width instead of one question per line.
                    "inline-flex items-center rounded-full border border-transparent bg-surface-muted",
                    "px-3 py-1.5 text-left text-body-sm text-foreground-muted focus-ring",
                    "transition-colors duration-(--duration-fast)",
                    "hover:border-accent-muted hover:bg-accent-soft hover:text-accent-foreground",
                  )}
                >
                  {prompt}
                </ThreadPrimitive.Suggestion>
              </li>
            ))}
            <li>
              {/* Spec §22's recruiter entry point. */}
              <JobDescriptionDialog
                trigger={
                  <button
                    type="button"
                    className="flex min-h-11 w-full items-center rounded-sm border border-accent bg-surface px-3.5 py-2 text-left text-body-sm font-medium text-accent focus-ring transition-colors duration-(--duration-fast) hover:bg-accent-soft"
                  >
                    Paste a job description
                  </button>
                }
              />
            </li>
          </ul>
        </div>
      </ThreadPrimitive.Empty>

      <AiLouieComposer />
      </div>
    </ThreadPrimitive.Root>
  );
}

/**
 * The live assistant. Loaded as its own chunk by `ai-louie-thread.tsx` when
 * the visitor approaches the panel, so the ~840KB assistant runtime stays off
 * every page's critical path (spec §27).
 */
function AiLouieLive() {
  return (
    <AiLouieRuntime>
      <ThreadBody />
    </AiLouieRuntime>
  );
}

export default AiLouieLive;
