"use client";

import * as React from "react";
import { Sparkles } from "lucide-react";
import { useChat } from "@ai-sdk/react";
import { DefaultChatTransport, type UIMessage } from "ai";

import { AiLouieComposer } from "@/components/ai/ai-louie-composer";
import { JobDescriptionDialog } from "@/components/ai/job-description-dialog";
import { Surface } from "@/components/system/surface";
import { cn } from "@/lib/utils";
import {
  MessageScrollerProvider,
  MessageScroller,
  MessageScrollerViewport,
  MessageScrollerContent,
  MessageScrollerItem,
} from "@/components/ui/message-scroller";
import { MessageAvatar, MessageContent } from "@/components/ui/message";
import { Bubble, BubbleContent } from "@/components/ui/bubble";
import { Marker, MarkerContent } from "@/components/ui/marker";

/**
 * The AI Louie surface — a basic question-and-answer chat (Plan 014).
 *
 * This is the panel's whole hook: a compact transcript, never a wall of
 * bubbles. The visitor asks, the answer streams in as plain editorial text
 * grounded in the portfolio's evidence index. There is no generative UI, no
 * navigation, and no side panel this assistant drives — Plan 014 is an
 * owner decision to revert the earlier "Ask the panel; the site answers"
 * concept (Plan 012) back to exactly this.
 *
 * Interaction still borrows familiarity from chat without cloning it
 * (spec §21): user turns are a quiet inline treatment, assistant turns are
 * open editorial text, and the only "tool activity" reported in-thread is a
 * plain-language thinking state — never chain-of-thought.
 *
 * When the backend is unconfigured or failing, the panel shows the spec §31
 * copy and the rest of the portfolio is untouched.
 *
 * Plan 017: rebuilt on the AI SDK's `useChat` plus shadcn's chat components
 * (`MessageScroller`, `Message`, `Bubble`, `Marker`), replacing the previous
 * chat library — an 836KB client chunk that no longer earned its weight once
 * Plan 014 cut the generative UI and browser-executed tools it existed to
 * run. `useChat` needs no provider, so the panel renders directly; the
 * lazy-load apparatus that used to hide the runtime's size
 * (`ai-louie-thread.tsx`, `IntersectionObserver`) is gone with it.
 */

/**
 * Three suggestions only (Plan 014, owner decision) — cut from five so every
 * one reliably returns grounded evidence; see the retrieval assertions in
 * `lib/ai/portfolio-search.test.ts`. "Paste a job description" is not in
 * this list because it is not a question — it opens the evaluator dialog
 * beside the list instead.
 */
const SUGGESTIONS = [
  "Show me Offboard",
  "How technical is Louie?",
  "Tell me about Flexi",
] as const;

function AssistantAvatar({ className }: { className?: string }) {
  return (
    <MessageAvatar
      className={cn("size-8 self-start bg-accent text-surface", className)}
    >
      <Sparkles aria-hidden="true" className="size-4" />
    </MessageAvatar>
  );
}

/**
 * Renders only "text" parts as visible content. Every other part type —
 * reasoning included — renders nothing.
 *
 * This is a deliberate guarantee, not an accident of what the model happens
 * to send: reasoning-capable models stream reasoning parts, and spec §21
 * forbids showing chain-of-thought. Tool-call parts (`search_portfolio`,
 * `compare_job_description`) are server-side retrieval, not generative UI
 * (Plan 014 owner decision), so they stay invisible too. Stating the
 * allow-list here — text only — means the guarantee is ours rather than an
 * inherited default a future part type could quietly undo.
 */
function MessageParts({ parts }: { parts: UIMessage["parts"] }) {
  return (
    <>
      {parts.map((part, index) =>
        part.type === "text" ? (
          <p key={index}>{part.text}</p>
        ) : null,
      )}
    </>
  );
}

function UserMessage({ message }: { message: UIMessage }) {
  return (
    <div className="flex justify-end">
      <Bubble
        align="end"
        variant="secondary"
        className="max-w-[85%] rounded-md rounded-br-xs"
      >
        <BubbleContent className="rounded-md rounded-br-xs border border-border-default bg-surface px-3.5 py-2 text-body-sm text-foreground">
          <MessageParts parts={message.parts} />
        </BubbleContent>
      </Bubble>
    </div>
  );
}

function AssistantMessage({ message }: { message: UIMessage }) {
  return (
    <div className="flex flex-col gap-2">
      <AssistantAvatar />
      {/* Open editorial text that streams in place (spec §21), flowing under
          the avatar at the panel's full width rather than beside it (Plan
          014) — there is no evidence card or tool UI competing for the row
          anymore. shadcn's `Message` lays the avatar and content out as a
          row by default (`flex ... gap-2`), which fights that decision, so
          this stacks `MessageAvatar` and `MessageContent` in a plain
          flex-col wrapper instead of using `Message` itself. */}
      {/* No per-message error here on purpose: a failed turn already raises
          the thread-level notice below, and showing both means a visitor
          reads two apologies for one failure. */}
      <MessageContent className="min-w-0 gap-3 text-body-sm text-foreground [&_p]:mb-2 last:[&_p]:mb-0">
        <MessageParts parts={message.parts} />
      </MessageContent>
    </div>
  );
}

/**
 * A quiet, alive "thinking" line for the gap before and between tool calls,
 * when there is no streaming text yet to show (Plan 014). It appears the
 * moment the request is in flight — before `useChat` even has an assistant
 * message to attach it to — and disappears the instant real text starts
 * streaming, which is the only "alive" signal needed after that.
 *
 * Uses shadcn's `Marker` + the `shimmer` text utility (ships with
 * `shadcn/tailwind.css`, already imported by `app/globals.css`) rather than
 * the old bespoke three-dot pulse markup and keyframes — it is the
 * component this plan's shadcn chat set ships specifically for animated
 * status rows, so it replaces the bespoke CSS instead of sitting beside it.
 */
function ThinkingIndicator() {
  return (
    <div className="flex flex-col gap-2">
      <AssistantAvatar />
      <Marker>
        <MarkerContent className="shimmer text-body-sm">Thinking</MarkerContent>
      </Marker>
    </div>
  );
}

/**
 * Runtime failures — the endpoint down, rate limited, or the provider
 * erroring. The raw error is never shown (spec §31); the portfolio stays
 * usable and the visitor is pointed at the work.
 */
function ThreadError({ error }: { error: Error | undefined }) {
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

function Suggestions({
  onSelect,
  disabled,
}: {
  onSelect: (prompt: string) => void;
  disabled: boolean;
}) {
  return (
    <div className="flex flex-col gap-2">
      <p className="text-body-sm text-foreground-muted">Try asking about:</p>
      {/* Wrapping pills, not one question per line — the Ask-LUMO pattern
          from the Offboard app uses the rail's width. */}
      <ul className="flex flex-wrap gap-1.5">
        {SUGGESTIONS.map((prompt) => (
          <li key={prompt}>
            <button
              type="button"
              disabled={disabled}
              onClick={() => onSelect(prompt)}
              className={cn(
                "inline-flex items-center rounded-full border border-transparent bg-surface-muted",
                "px-3 py-1.5 text-left text-body-sm text-foreground-muted focus-ring",
                "transition-colors duration-(--duration-fast)",
                "hover:border-accent-muted hover:bg-accent-soft hover:text-accent-foreground",
                "disabled:pointer-events-none disabled:opacity-60",
              )}
            >
              {prompt}
            </button>
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
  );
}

/**
 * The live assistant. Rendered directly — `useChat` needs no provider, and
 * without the previous chat library's ~840KB the chat is small enough to
 * skip the lazy load that used to hide it (spec §27 is satisfied by the
 * swap itself now, not by deferring the runtime).
 */
function AiLouieLive() {
  const { messages, sendMessage, status, stop, error } = useChat({
    transport: new DefaultChatTransport({ api: "/api/chat" }),
  });

  const [input, setInput] = React.useState("");
  const isBusy = status === "submitted" || status === "streaming";

  const lastMessage = messages[messages.length - 1];
  const lastMessageHasText =
    lastMessage?.role === "assistant" &&
    lastMessage.parts.some(
      (part) => part.type === "text" && part.text.length > 0,
    );
  const showThinking = isBusy && !lastMessageHasText;

  function sendText(text: string) {
    const trimmed = text.trim();
    if (!trimmed || isBusy) return;
    sendMessage({ text: trimmed });
  }

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    sendText(input);
    setInput("");
  }

  return (
    <MessageScrollerProvider autoScroll>
      <div className="flex min-h-0 flex-1 flex-col gap-4">
        <MessageScroller className="min-h-0 flex-1">
          <MessageScrollerViewport>
            <MessageScrollerContent className="gap-5">
              {messages.length === 0 ? (
                // Opening message, shown until the visitor says something.
                <MessageScrollerItem messageId="greeting" scrollAnchor={false}>
                  <div className="flex flex-col gap-2">
                    <AssistantAvatar />
                    <Surface
                      radius="lg"
                      className="min-w-0 border-accent-muted/70 bg-surface-raised p-4"
                    >
                      <p className="text-body-sm text-foreground">
                        Hi — ask me anything about Louie&rsquo;s work. I
                        answer from his case studies and project evidence.
                      </p>
                    </Surface>
                  </div>
                </MessageScrollerItem>
              ) : (
                messages.map((message) => (
                  <MessageScrollerItem
                    key={message.id}
                    messageId={message.id}
                    scrollAnchor={message.role === "user"}
                  >
                    {message.role === "user" ? (
                      <UserMessage message={message} />
                    ) : (
                      <AssistantMessage message={message} />
                    )}
                  </MessageScrollerItem>
                ))
              )}

              {showThinking && (
                <MessageScrollerItem messageId="thinking" scrollAnchor={false}>
                  <ThinkingIndicator />
                </MessageScrollerItem>
              )}
            </MessageScrollerContent>
          </MessageScrollerViewport>
        </MessageScroller>

        <ThreadError error={error} />

        {/* Pinned footer: suggestions (until the conversation starts) and
            the composer sit at the bottom of the panel, the way the
            Ask-LUMO block anchors the Offboard rail. */}
        <div className="flex shrink-0 flex-col gap-3">
          {/* Suggestions collapse once the conversation is underway. */}
          {messages.length === 0 && (
            <Suggestions onSelect={sendText} disabled={isBusy} />
          )}

          <AiLouieComposer
            value={input}
            onChange={setInput}
            onSubmit={handleSubmit}
            status={status}
            onStop={stop}
          />
        </div>
      </div>
    </MessageScrollerProvider>
  );
}

export default AiLouieLive;
