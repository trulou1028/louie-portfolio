"use client";

import * as React from "react";
import { useChat } from "@ai-sdk/react";
import { DefaultChatTransport, type UIMessage } from "ai";
import { ThinkingOrb } from "thinking-orbs";

import { AiLouieComposer } from "@/components/ai/ai-louie-composer";
import { AssistantAvatar } from "@/components/ai/assistant-avatar";
import { AnswerMarkdown } from "@/components/ai/answer-markdown";
import { JobDescriptionDialog } from "@/components/ai/job-description-dialog";
import { SectionLabel } from "@/components/system/section-label";
import { Surface } from "@/components/system/surface";
import { track } from "@/lib/analytics";
import { cn } from "@/lib/utils";
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

/**
 * A short kebab slug per suggestion, sent to analytics instead of the prompt
 * text — keeps the property stable if the copy is reworded, and keeps every
 * message-shaped string out of `track` on principle.
 */
const SUGGESTION_SLUGS: Record<string, string> = {
  "Show me Offboard": "show-offboard",
  "How technical is Louie?": "how-technical",
  "Tell me about Flexi": "show-flexi",
};

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
      <MessageContent className="min-w-0 gap-3 text-body-sm text-foreground">
        <MessageParts parts={message.parts} markdown />
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
 * The motion is `thinking-orbs`' dotted orb (owner decision, 2026-08-31 —
 * orbs.jakubantalik.com), in its `breathing` state at the 20px inline-text
 * preset: that is the pairing the source site labels "Agent thinking". It
 * replaces the previous `Marker` + `shimmer` text row.
 *
 * Two deliberate choices here:
 * - The avatar stays Louie's face and the orb sits inline beside the label,
 *   rather than the orb replacing the avatar. The face says who is speaking;
 *   the orb says what is happening. Swapping the avatar out mid-turn would
 *   also make the row jump when the answer arrives and the face returns.
 * - The label is plain, not `shimmer`. The orb now carries the motion, and
 *   two animations racing on one short row reads as busy rather than alive.
 *
 * `aria-hidden` on the orb is what keeps this to a single announcement: the
 * canvas ships `role="img"` with its own "Breathing…" label, which would
 * otherwise be read out alongside the visible "Thinking" inside the thread's
 * `aria-live` region.
 */
function ThinkingIndicator() {
  return (
    <div className="flex flex-col gap-2">
      <AssistantAvatar />
      <div className="flex items-center gap-2">
        <ThinkingOrb state="breathing" size={20} aria-hidden="true" />
        <span className="text-body-sm text-foreground-muted">Thinking</span>
      </div>
    </div>
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
 * One shared geometry for every chip in the suggestion row.
 *
 * Previously "Paste a job description" was a `rounded-sm`, 44px-tall
 * rectangle sitting among three `rounded-full`, ~30px pills — two radii and
 * two heights inside a single four-item group, which is what made the row
 * look unfinished. Shape is now shared and colour alone carries the
 * difference in kind.
 *
 * `min-h-9` (36px) is above the row's old pill height rather than below the
 * old button's: it clears WCAG 2.2 AA's 24px target (2.5.8) with room to
 * spare and makes the three question pills easier to hit than they were,
 * so unifying the row costs the recruiter path nothing.
 */
const SUGGESTION_CHIP = cn(
  "inline-flex min-h-9 items-center rounded-full border px-3.5 py-1.5",
  "text-left text-body-sm focus-ring transition-colors duration-(--duration-fast)",
  "disabled:pointer-events-none disabled:opacity-60",
);

function Suggestions({
  onSelect,
  disabled,
}: {
  onSelect: (prompt: string) => void;
  disabled: boolean;
}) {
  return (
    <div className="flex flex-col gap-2.5">
      {/* The site labels its sections with a mono eyebrow ("FEATURED WORK",
          the hero's positioning line). This row is the panel's one such
          label, so it uses the same component rather than a bespoke
          sentence-case line — the panel reads as part of the site. */}
      <SectionLabel>Try asking</SectionLabel>
      {/* Wrapping pills, not one question per line — the Ask-LUMO pattern
          from the Offboard app uses the rail's width. */}
      <ul className="flex flex-wrap gap-1.5">
        {SUGGESTIONS.map((prompt) => (
          <li key={prompt}>
            <button
              type="button"
              disabled={disabled}
              onClick={() => {
                track("ai_prompt_chip_clicked", { chip: SUGGESTION_SLUGS[prompt] });
                onSelect(prompt);
              }}
              className={cn(
                SUGGESTION_CHIP,
                "border-transparent bg-surface-muted text-foreground-muted",
                "hover:border-accent-muted hover:bg-accent-soft hover:text-accent-foreground",
              )}
            >
              {prompt}
            </button>
          </li>
        ))}
        <li>
          {/* Spec §22's recruiter entry point — the one chip that opens a
              dialog rather than sending a question, so it carries the accent
              tint the rest of the site reserves for AI and tool affordances
              (the `SystemLabel` accent tone uses this same pairing). */}
          <JobDescriptionDialog
            trigger={
              <button
                type="button"
                className={cn(
                  SUGGESTION_CHIP,
                  "border-accent-muted bg-accent-soft font-medium text-accent-foreground",
                  "hover:border-accent",
                )}
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

  function sendText(text: string) {
    const trimmed = text.trim();
    if (!trimmed || isBusy) return;
    track("ai_question_submitted", { turn: messages.length });
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
