"use client";

import * as React from "react";
import { Sparkles } from "lucide-react";
import {
  MessagePrimitive,
  ThreadPrimitive,
  useAuiState,
  type MessageState,
} from "@assistant-ui/react";
import { useAISDKError } from "@assistant-ui/react-ai-sdk";

import { AiLouieComposer } from "@/components/ai/ai-louie-composer";
import { AiLouieRuntime } from "@/components/ai/ai-louie-runtime";
import { useAnswerStore } from "@/components/ai/answer-store";
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
function textOf(content: MessageState["content"]): string {
  return content
    .filter((part) => part.type === "text")
    .map((part) => (part as { text: string }).text)
    .join("\n\n")
    .trim();
}

/**
 * Collects every evidence id surfaced by `search_portfolio` and
 * `show_evidence` tool calls in a completed assistant message. Mirrors the
 * extraction `evidence-result.tsx` already does to render these results —
 * this just reads the same tool-call parts instead of rendering them.
 * Ids are not validated here: the answer store does that at its boundary
 * (spec §32), so an id an unknown tool ever surfaced can never reach state.
 */
function evidenceIdsOf(content: MessageState["content"]): string[] {
  const ids = new Set<string>();

  for (const part of content) {
    if (part.type !== "tool-call" || !part.result) continue;

    if (part.toolName === "search_portfolio") {
      const result = part.result as { results?: { id?: string }[] };
      for (const item of result.results ?? []) {
        if (item?.id) ids.add(item.id);
      }
    } else if (part.toolName === "show_evidence") {
      const result = part.result as { evidence?: { id?: string } };
      if (result.evidence?.id) ids.add(result.evidence.id);
    }
  }

  return Array.from(ids);
}

function hasSuccessfulNavigation(content: MessageState["content"]): boolean {
  return content.some(
    (part) =>
      part.type === "tool-call" &&
      part.toolName === "navigate_portfolio" &&
      (part.result as { navigated?: boolean } | undefined)?.navigated === true,
  );
}

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
function AnswerSync() {
  const answerStore = useAnswerStore();
  const messages = useAuiState((s) => s.thread.messages);

  const syncedAskedId = React.useRef<string | null>(null);
  const syncedAnsweredId = React.useRef<string | null>(null);

  React.useEffect(() => {
    if (!answerStore || messages.length === 0) return;

    const last = messages[messages.length - 1];

    if (last.role === "user") {
      if (syncedAskedId.current === last.id) return;
      syncedAskedId.current = last.id;
      const question = textOf(last.content);
      if (question) answerStore.asked(question);
      return;
    }

    if (last.role !== "assistant") return;

    if (last.status.type === "running" || last.status.type === "requires-action") {
      answerStore.answering();
      return;
    }

    if (last.status.type !== "complete") return;
    if (syncedAnsweredId.current === last.id) return;
    syncedAnsweredId.current = last.id;

    const answerText = textOf(last.content);

    if (!answerText) {
      if (hasSuccessfulNavigation(last.content)) answerStore.clear();
      return;
    }

    answerStore.answered(answerText, evidenceIdsOf(last.content));
  }, [messages, answerStore]);

  return null;
}

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

/** Scrolls the Answer Canvas into view and focuses its headline. */
function viewOnCanvas() {
  if (typeof document === "undefined") return;
  const target = document.getElementById("answer");
  if (!target) return;

  const prefersReducedMotion = window.matchMedia(
    "(prefers-reduced-motion: reduce)",
  ).matches;

  target.scrollIntoView({
    behavior: prefersReducedMotion ? "auto" : "smooth",
    block: "start",
  });
  target.focus({ preventScroll: true });
}

/** Clamped assistant text — the full answer lives on the Answer Canvas. */
function CompactText({ text }: { text: string }) {
  if (!text) return null;
  return <p className="line-clamp-3 text-body-sm text-foreground">{text}</p>;
}

/**
 * Shown while the model has already returned at least one tool result and is
 * now streaming its final prose — the third beat of the activity sequence
 * ("Searching portfolio…" → "Found N sources" → "Composing answer…").
 */
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
      {/* Compact editorial text, not a giant bubble (spec §21) — the full
          answer composes on the Answer Canvas instead. */}
      {/* No per-message error here on purpose: a failed turn already raises
          the thread-level notice below, and showing both means a visitor
          reads two apologies for one failure. */}
      <div className="flex min-w-0 flex-1 flex-col gap-2 pt-1">
        <MessagePrimitive.Parts
          components={{ Text: CompactText, Reasoning: () => null }}
        />
        <ComposingIndicator />
        <button
          type="button"
          onClick={viewOnCanvas}
          className="focus-ring self-start rounded-xs text-body-sm font-medium text-accent hover:underline"
        >
          View on canvas →
        </button>
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
    <ThreadPrimitive.Root className="flex flex-col gap-4">
      <ThreadPrimitive.Viewport
        autoScroll
        className="flex max-h-[min(50vh,460px)] flex-col gap-5 overflow-y-auto"
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

      {/* Suggestions collapse once the conversation is underway. A vertical
          list of quiet, full-width rows fits a 300–420px rail better than
          wrapped chips (Plan 012). */}
      <ThreadPrimitive.Empty>
        <div className="flex flex-col gap-2">
          <p className="text-body-sm text-foreground-muted">Try asking about:</p>
          <ul className="flex flex-col gap-1.5">
            {SUGGESTIONS.map((prompt) => (
              <li key={prompt}>
                <ThreadPrimitive.Suggestion
                  prompt={prompt}
                  method="replace"
                  autoSend
                  className={cn(
                    "flex min-h-11 w-full items-center rounded-sm border border-border-default bg-surface",
                    "px-3.5 py-2 text-left text-body-sm text-foreground-muted focus-ring",
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
      <AnswerSync />
      <ThreadBody />
    </AiLouieRuntime>
  );
}

export default AiLouieLive;
