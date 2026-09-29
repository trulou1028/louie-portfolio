"use client";

import * as React from "react";
import { useChat } from "@ai-sdk/react";
import { DefaultChatTransport, type UIMessage } from "ai";
import { ThinkingOrb } from "thinking-orbs";
import { ArrowRight, ChevronRight, FileText } from "lucide-react";

import { AiLouieComposer } from "@/components/ai/ai-louie-composer";
import { AssistantAvatar } from "@/components/ai/assistant-avatar";
import { AnswerMarkdown } from "@/components/ai/answer-markdown";
import { JobDescriptionTrigger } from "@/components/ai/job-description-dialog";
import { useAskLouie } from "@/components/ai/ask-louie-dialog";
import { STARTER_QUESTIONS, type AskQuestion } from "@/components/ai/ask-questions";
import { SectionLabel } from "@/components/system/section-label";
import { Surface } from "@/components/system/surface";
import { track } from "@/lib/analytics";
import {
  MessageScrollerProvider,
  MessageScroller,
  MessageScrollerViewport,
  MessageScrollerContent,
  MessageScrollerItem,
} from "@/components/ui/message-scroller";
import { MessageContent } from "@/components/ui/message";
import { Bubble, BubbleContent } from "@/components/ui/bubble";

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
 * (`MessageScroller`, `Message`, `Bubble`), replacing the previous chat
 * library. The deferral is unchanged: `ai-louie-thread.tsx` still
 * `dynamic()`-imports this file behind an `IntersectionObserver` — Plan 017
 * measured folding the chunk into the eager bundle and kept the lazy load.
 * That file owns the bundle-size figures; do not duplicate them here.
 */

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
 *
 * Plan 018: within that same text branch, `markdown` switches between the
 * model's answer rendered through `AnswerMarkdown` (assistant turns — the
 * model writes in markdown) and a plain `<p>` (the visitor's own turn —
 * echoing a visitor's input through a markdown parser is a needless surface,
 * not authored content). The guard itself — text only, everything else
 * null — is unchanged either way.
 */
function MessageParts({
  parts,
  markdown = false,
}: {
  parts: UIMessage["parts"];
  markdown?: boolean;
}) {
  return (
    <>
      {parts.map((part, index) =>
        part.type === "text" ? (
          markdown ? (
            <div key={index}>
              <AnswerMarkdown text={part.text} />
            </div>
          ) : (
            <p key={index}>{part.text}</p>
          )
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

/** True once a message carries at least one non-empty text part. */
function hasVisibleText(message: UIMessage): boolean {
  return message.parts.some(
    (part) => part.type === "text" && part.text.length > 0,
  );
}

/**
 * Louie's side of the thread (Plan 042): the avatar on the left, the turn's
 * content beside it. The thinking line and the answer use the same row, so
 * the avatar never moves and the answer appears where "Thinking" was.
 */
function AssistantRow({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex items-start gap-3">
      <AssistantAvatar className="size-7" />
      <div className="min-w-0 flex-1 pt-1">{children}</div>
    </div>
  );
}

function AssistantMessage({ message }: { message: UIMessage }) {
  /**
   * An assistant turn with no text yet renders nothing at all — not even the
   * avatar. `MessageParts` is text-only by design, so such a turn has no
   * content to show, and the `ThinkingIndicator` below is already standing in
   * for it with an avatar of its own. Without this guard both render at once
   * and the visitor sees two avatar circles stacked for a single reply, which
   * is what happens whenever the model streams reasoning or tool-call parts
   * before its first token of text.
   */
  if (!hasVisibleText(message)) return null;

  return (
    <AssistantRow>
      {/* No per-message error here on purpose: a failed turn already raises
          the thread-level notice below, and showing both means a visitor
          reads two apologies for one failure. */}
      <MessageContent className="ask-fade-in min-w-0 gap-3 text-body-sm text-foreground">
        <MessageParts parts={message.parts} markdown />
      </MessageContent>
    </AssistantRow>
  );
}

/**
 * The line shown before the answer's first word (Plan 014, Plan 042).
 *
 * `thinking-orbs`' dotted orb in its `breathing` state (owner decision,
 * 2026-08-31) beside a plain label, on the same row as the avatar. The
 * label says what is happening when the stream tells us: "Searching my case
 * studies" while the `search_portfolio` tool runs, "Thinking" otherwise.
 * It never shows reasoning (spec §21).
 *
 * `aria-hidden` on the orb keeps this to one announcement: the canvas ships
 * `role="img"` with its own "Breathing…" label, which would otherwise be
 * read out alongside the visible label inside the thread's `aria-live`
 * region.
 */
function ThinkingIndicator({ searching }: { searching: boolean }) {
  return (
    <AssistantRow>
      <div className="ask-fade-in -mt-1 flex h-7 items-center gap-2">
        <ThinkingOrb state="breathing" size={20} aria-hidden="true" />
        <span className="text-body-sm text-foreground-muted">{searching ? "Searching my case studies" : "Thinking"}</span>
      </div>
    </AssistantRow>
  );
}

/**
 * Runtime failures. The server's error code is read from `useChat`'s error
 * message (the response body for non-2xx responses) only to choose between
 * three fixed strings — the raw text is never shown (spec §31). The generic
 * copy is the spec §31 line verbatim; the other two mirror the
 * job-description dialog's treatment of the same conditions.
 */
function ThreadError({ error }: { error: Error | undefined }) {
  if (!error) return null;

  const code = error.message.includes("rate_limited")
    ? "rate_limited"
    : error.message.includes("too_long")
      ? "too_long"
      : "generic";

  const copy =
    code === "rate_limited"
      ? "A lot of questions just now — please try again in a few minutes."
      : code === "too_long"
        ? "That message is too long for the chat. For a job description, use “Paste a job description” below."
        : "AI Louie is temporarily unavailable. You can still explore all of Louie’s work below.";

  return (
    <Surface
      role="status"
      className="border-danger/30 bg-surface p-4 text-body-sm text-foreground-muted"
    >
      {copy}
    </Surface>
  );
}

/**
 * The opening message. The panel header already shows Louie's avatar, so the
 * greeting is a plain bubble without a second one (Plan 039).
 */
export function Greeting() {
  return (
    <p className="max-w-[44ch] rounded-lg rounded-tl-xs bg-surface-muted px-4 py-3 text-body text-foreground">
      Hi, ask me about my work. I answer from my case studies and project evidence.
    </p>
  );
}

/**
 * Empty-thread entry points (Plan 039): the recruiter path as one card, then
 * the three starter questions as full-width rows. Rows beat wrapping pills
 * here: every option lines up, reads as a real button, and has a large
 * target.
 */
function Suggestions({
  questions,
  label,
  onSelect,
  disabled,
}: {
  questions: readonly AskQuestion[];
  label: string;
  onSelect: (prompt: string) => void;
  disabled: boolean;
}) {
  return (
    <div className="flex flex-col gap-5">
      {/* Spec §22's recruiter entry point: the one option that opens a
          dialog rather than sending a question. */}
      <JobDescriptionTrigger
        trigger={
          <button
            type="button"
            className="group flex w-full items-center gap-3.5 rounded-lg border border-border-default bg-surface p-3.5 text-left focus-ring transition-colors duration-(--duration-fast) hover:border-border-strong"
          >
            <span aria-hidden="true" className="flex size-10 shrink-0 items-center justify-center rounded-md bg-accent-soft text-accent-foreground">
              <FileText className="size-5" />
            </span>
            <span className="flex min-w-0 flex-1 flex-col">
              <span className="text-body font-semibold text-foreground">Paste a job description</span>
              <span className="text-body-sm text-foreground-muted">Compare it with the evidence here, including where it falls short.</span>
            </span>
            <ChevronRight aria-hidden="true" className="size-4 shrink-0 text-foreground-muted transition-transform duration-(--duration-fast) group-hover:translate-x-0.5" />
          </button>
        }
      />

      <QuestionRows label={label} questions={questions} onSelect={onSelect} disabled={disabled} />
    </div>
  );
}

/** Starter questions as full-width rows (Plan 039), under a short label. */
function QuestionRows({
  label,
  questions,
  onSelect,
  disabled,
}: {
  label: string;
  questions: readonly AskQuestion[];
  onSelect: (prompt: string) => void;
  disabled: boolean;
}) {
  return (
    <div className="flex flex-col gap-2">
      <SectionLabel>{label}</SectionLabel>
      <ul className="flex flex-col divide-y divide-border-subtle border-y border-border-subtle">
        {questions.map((question) => (
          <li key={question.slug}>
            <button
              type="button"
              disabled={disabled}
              onClick={() => {
                track("ai_prompt_chip_clicked", { chip: question.slug });
                onSelect(question.text);
              }}
              className="group flex w-full items-center justify-between gap-3 rounded-xs py-3 text-left text-body text-foreground focus-ring transition-colors duration-(--duration-fast) hover:text-foreground-muted disabled:pointer-events-none disabled:opacity-60"
            >
              {question.text}
              <ArrowRight aria-hidden="true" className="size-4 shrink-0 text-foreground-muted transition-transform duration-(--duration-fast) group-hover:translate-x-0.5" />
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}

/**
 * The live assistant. `useChat` needs no provider, so this renders directly
 * once `ai-louie-thread.tsx` has loaded the chunk (spec §27).
 */
function AiLouieLive() {
  const { messages, sendMessage, status, stop, error } = useChat({
    transport: new DefaultChatTransport({ api: "/api/chat" }),
  });

  const [input, setInput] = React.useState("");
  const isBusy = status === "submitted" || status === "streaming";

  const lastMessage = messages[messages.length - 1];
  // Same test `AssistantMessage` uses to decide whether it renders at all, so
  // exactly one of the two shows an avatar at any moment.
  const lastMessageHasText =
    lastMessage?.role === "assistant" && hasVisibleText(lastMessage);
  const showThinking = isBusy && !lastMessageHasText;
  // A tool part on the pending turn means the portfolio search is running.
  const searching =
    lastMessage?.role === "assistant" &&
    lastMessage.parts.some((part) => part.type.startsWith("tool-"));

  function sendText(text: string) {
    const trimmed = text.trim();
    if (!trimmed || isBusy) return;
    track("ai_question_submitted", { turn: messages.length });
    sendMessage({ text: trimmed });
  }

  // Plan 042: a question asked from outside the panel (the homepage ask
  // bar) waits here until the runtime has loaded and is idle.
  const { pending, clearPending, page } = useAskLouie();
  // Each question is sent once, even when an effect runs twice.
  const sentIds = React.useRef(new Set<number>());
  React.useEffect(() => {
    if (!pending || isBusy || sentIds.current.has(pending.id)) return;
    sentIds.current.add(pending.id);
    clearPending(pending.id);
    track("ai_question_submitted", { turn: messages.length, source: "hero" });
    sendMessage({ text: pending.text });
  }, [pending, isBusy, clearPending, messages.length, sendMessage]);

  // On a project page, the questions not yet asked stay offered after the
  // first answer ("More about Offboard").
  const asked = new Set(
    messages.filter((m) => m.role === "user").flatMap((m) => m.parts.map((part) => (part.type === "text" ? part.text : ""))),
  );
  const moreQuestions = page ? page.questions.filter((q) => !asked.has(q.text)) : [];

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
                  <div className="flex flex-col gap-6">
                    <Greeting />
                    <Suggestions
                      questions={page?.questions ?? STARTER_QUESTIONS}
                      label={page ? `About ${page.name}` : "Or try asking"}
                      onSelect={sendText}
                      disabled={isBusy}
                    />
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
                  <ThinkingIndicator searching={searching} />
                </MessageScrollerItem>
              )}

              {messages.length > 0 && !isBusy && page && moreQuestions.length > 0 ? (
                <MessageScrollerItem messageId="more" scrollAnchor={false}>
                  <QuestionRows label={`More about ${page.name}`} questions={moreQuestions} onSelect={sendText} disabled={isBusy} />
                </MessageScrollerItem>
              ) : null}
            </MessageScrollerContent>
          </MessageScrollerViewport>
        </MessageScroller>

        <ThreadError error={error} />

        {/* Pinned footer: the composer. Suggestions sit directly under the
            greeting instead (Plan 039), so an empty thread has no dead band
            between the opening message and the composer. */}
        <div className="flex shrink-0 flex-col gap-3">
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
