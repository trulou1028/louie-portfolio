"use client";

import * as React from "react";
import { ArrowUp, Square } from "lucide-react";

import { cn } from "@/lib/utils";
import { MAX_CHARS_PER_MESSAGE } from "@/lib/ai/schemas";

/**
 * The composer (spec §11 §2, §21, §26).
 *
 * Text only. There is no microphone, attachment, or "deep research" control:
 * voice is Plan 009 and the others are not in the spec, and shipping an inert
 * control is what spec §11 rules out.
 *
 * Plan 017: a plain controlled form calling `useChat`'s `sendMessage` (via
 * the parent's `onSubmit`), replacing the previous chat library's
 * `ComposerPrimitive`. `useChat` does not manage input state itself, so the
 * value and its setter are owned by `ai-louie-live.tsx` and passed down as
 * props — not a global store, per Plan 017 Step 3.
 */
function AiLouieComposer({
  value,
  onChange,
  onSubmit,
  status,
  onStop,
}: {
  value: string;
  onChange: (value: string) => void;
  onSubmit: (event: React.FormEvent<HTMLFormElement>) => void;
  status: "submitted" | "streaming" | "ready" | "error";
  onStop: () => void;
}) {
  const isStreaming = status === "submitted" || status === "streaming";
  const textareaRef = React.useRef<HTMLTextAreaElement>(null);

  // Plan 018: the send button bottom-aligned (`items-end`) even on a
  // single-line input, so its center sat ~5.2px below the textarea's center
  // (`--text-body--line-height` at 1.65 plus the textarea's `py-2.5` gives a
  // 46.4px single-line box against the button's 36px `size-9` — the two
  // centers only coincide once the textarea has grown past one line).
  // Owner decision: centered for one line, bottom-aligned once it wraps.
  // `scrollHeight` already measures this every render via the auto-resize
  // effect below, so `multiline` is derived there rather than adding a
  // second measurement pass.
  const [multiline, setMultiline] = React.useState(false);

  // Grows with content up to `max-h-40` (a pasted job description should not
  // be trapped in a one-line box with an inner scrollbar); `max-h-40` in the
  // className below still caps it, so this only ever expands the box, never
  // fights the CSS bound. `maxLength` below matches the server's per-message
  // cap, so a paste is truncated visibly at the edge rather than accepted
  // here and rejected after send.
  React.useLayoutEffect(() => {
    const el = textareaRef.current;
    if (!el) return;
    el.style.height = "auto";
    el.style.height = `${el.scrollHeight}px`;

    // Read line-height and vertical padding from computed style rather than
    // hardcoding them — the tokens can change. The `+ 1` absorbs sub-pixel
    // rounding: one line plus padding computes to 46.4px, so a strict `>`
    // against the un-padded figure would flip spuriously.
    const styles = window.getComputedStyle(el);
    const lineHeight = parseFloat(styles.lineHeight);
    const padding =
      parseFloat(styles.paddingTop) + parseFloat(styles.paddingBottom);
    // No `react-hooks/set-state-in-effect` eslint-disable needed here (unlike
    // the lib/use-breakpoint.ts precedent this pattern otherwise follows):
    // that rule targets effects whose entire body is a bare state mirror: this
    // one first does real DOM work (measuring `scrollHeight` off the resize
    // above), so the setState reporting that measurement isn't flagged.
    setMultiline(el.scrollHeight > lineHeight + padding + 1);
  }, [value]);

  return (
    <form
      onSubmit={onSubmit}
      className={cn(
        "flex gap-2 rounded-panel border border-border-default bg-surface p-1.5 focus-within:border-border-strong",
        multiline ? "items-end" : "items-center",
      )}
    >
      <textarea
        ref={textareaRef}
        rows={1}
        autoFocus={false}
        aria-label="Ask anything about Louie's work"
        placeholder="Ask me about my work..."
        value={value}
        maxLength={MAX_CHARS_PER_MESSAGE}
        onChange={(event) => onChange(event.target.value)}
        onKeyDown={(event) => {
          // Enter sends, Shift+Enter inserts a newline — the composer is a
          // single-line-feeling box that still allows multi-line pastes
          // (e.g. a job description).
          if (event.key === "Enter" && !event.shiftKey) {
            event.preventDefault();
            if (!isStreaming && value.trim()) {
              event.currentTarget.form?.requestSubmit();
            }
          }
        }}
        className="max-h-40 flex-1 resize-none bg-transparent px-2 py-2.5 text-body text-foreground outline-none placeholder:text-foreground-muted"
      />

      {!isStreaming ? (
        <button
          type="submit"
          aria-label="Send message"
          disabled={!value.trim()}
          className="focus-ring inline-flex size-9 shrink-0 items-center justify-center rounded-full bg-accent-fill text-accent-on-fill transition-colors duration-(--duration-fast) hover:bg-accent-fill-hover disabled:opacity-40"
        >
          <ArrowUp aria-hidden="true" className="size-4" />
        </button>
      ) : (
        <button
          type="button"
          aria-label="Stop generating"
          onClick={onStop}
          className="focus-ring inline-flex size-9 shrink-0 items-center justify-center rounded-full border border-border-default text-foreground-muted transition-colors duration-(--duration-fast) hover:text-foreground"
        >
          <Square aria-hidden="true" className="size-3.5 fill-current" />
        </button>
      )}
    </form>
  );
}

export { AiLouieComposer };
