"use client";

import { ArrowUp, Square } from "lucide-react";
import { ComposerPrimitive, ThreadPrimitive } from "@assistant-ui/react";

/**
 * The composer (spec §11 §2, §21, §26).
 *
 * Text only. There is no microphone, attachment, or "deep research" control:
 * voice is Plan 009 and the others are not in the spec, and shipping an inert
 * control is what spec §11 rules out.
 */
function AiLouieComposer() {
  return (
    <ComposerPrimitive.Root className="flex items-end gap-2 rounded-md border border-border-default bg-surface p-2 focus-within:border-border-strong">
      <ComposerPrimitive.Input
        rows={1}
        autoFocus={false}
        aria-label="Ask anything about Louie's work"
        placeholder="Ask anything about Louie's work..."
        className="max-h-40 flex-1 resize-none bg-transparent px-2 py-2.5 text-body text-foreground outline-none placeholder:text-foreground-muted"
      />

      <ThreadPrimitive.If running={false}>
        <ComposerPrimitive.Send
          aria-label="Send message"
          className="focus-ring inline-flex size-10 shrink-0 items-center justify-center rounded-sm bg-accent text-surface transition-colors duration-(--duration-fast) hover:bg-accent-hover disabled:opacity-40"
        >
          <ArrowUp aria-hidden="true" className="size-4" />
        </ComposerPrimitive.Send>
      </ThreadPrimitive.If>

      <ThreadPrimitive.If running>
        <ComposerPrimitive.Cancel
          aria-label="Stop generating"
          className="focus-ring inline-flex size-10 shrink-0 items-center justify-center rounded-sm border border-border-default text-foreground-muted transition-colors duration-(--duration-fast) hover:text-foreground"
        >
          <Square aria-hidden="true" className="size-3.5 fill-current" />
        </ComposerPrimitive.Cancel>
      </ThreadPrimitive.If>
    </ComposerPrimitive.Root>
  );
}

export { AiLouieComposer };
