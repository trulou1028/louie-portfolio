"use client";

import * as React from "react";
import { ArrowUp, Square } from "lucide-react";

/**
 * The composer (spec §11 §2, §21, §26).
 *
 * Text only. There is no microphone, attachment, or "deep research" control:
 * voice is Plan 009 and the others are not in the spec, and shipping an inert
 * control is what spec §11 rules out.
 *
 * Plan 017: a plain controlled form calling `useChat`'s `sendMessage` (via
 * the parent's `onSubmit`), replacing `assistant-ui`'s `ComposerPrimitive`.
 * `useChat` does not manage input state itself, so the value and its setter
 * are owned by `ai-louie-live.tsx` and passed down as props — not a global
 * store, per Plan 017 Step 3.
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

  return (
    <form
      onSubmit={onSubmit}
      className="flex items-end gap-2 rounded-panel border border-border-default bg-surface p-1.5 focus-within:border-border-strong"
    >
      <textarea
        rows={1}
        autoFocus={false}
        aria-label="Ask anything about Louie's work"
        placeholder="Ask anything about Louie's work..."
        value={value}
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
