"use client";

import * as React from "react";
import dynamic from "next/dynamic";

import { AssistantAvatar } from "@/components/ai/assistant-avatar";
import { Surface } from "@/components/system/surface";
import { track } from "@/lib/analytics";

/**
 * The rail-mounted lazy wrapper (spec §11 §2, §27; Plan 012).
 *
 * `AskPanel` owns the panel's chrome; this component owns only the loading
 * concern — deferring the ~504KB chat runtime (`useChat` from
 * `@ai-sdk/react`, plus the shadcn chat components; Plan 017 replaced the
 * previous chat library, which was ~840KB) until the visitor approaches the
 * panel, which is exactly what spec §27 asks for: "avoid loading the full
 * AI runtime until the user approaches or activates the AI surface".
 *
 * Plan 017 measured folding this chunk into the eager bundle and kept the
 * lazy load deliberately: 504KB is still real weight for a portfolio site,
 * and the reliability problems once blamed on this deferral (a stuck dev
 * server, `IntersectionObserver` not firing under some browser automation)
 * turn out not to affect a real visitor — production loads the runtime in
 * about a second, and the automation issue is a testing artifact, not a
 * user-facing one. See `pnpm test:e2e`'s use of a real production build for
 * how this plan verified the panel is not actually stuck.
 *
 * A generous `rootMargin` means the fetch starts before the panel is on
 * screen, so the swap is not something a visitor notices. Without
 * IntersectionObserver the runtime simply loads immediately. On `xl+` the
 * rail is on screen at paint, so the runtime effectively loads immediately
 * there too — the deferral is what matters below `xl`, where the panel
 * stacks after the rest of the homepage (spec §27, §10).
 */
const AiLouieLive = dynamic(() => import("@/components/ai/ai-louie-live"), {
  loading: () => <ThreadSkeleton />,
});

/**
 * Shown for the moment before the runtime arrives. The opening message is
 * real content, not filler; the composer is a non-interactive placeholder
 * marked `aria-busy`, so nothing here is a control that does not work.
 */
function ThreadSkeleton() {
  return (
    <div aria-busy="true" className="flex min-h-0 flex-1 flex-col gap-5">
      <div className="flex flex-col gap-2">
        <AssistantAvatar />
        <Surface
          radius="lg"
          className="min-w-0 border-accent-muted/70 bg-surface-raised p-4"
        >
          <p className="text-body-sm text-foreground">
            Hi, ask me about my work. I answer from my case studies and project evidence.
          </p>
        </Surface>
      </div>
      {/* Mirrors the real composer's box exactly — same radius, border,
          surface, padding, and a spacer carrying the textarea's own
          `px-2 py-2.5 text-body` metrics — so the footer does not resize or
          change shape when the runtime swaps in. It previously used a
          shorter `h-11 rounded-md bg-surface-muted` block, which visibly
          jumped. */}
      <div
        aria-hidden="true"
        className="flex items-center gap-2 rounded-panel border border-border-default bg-surface p-1.5"
      >
        <div className="min-w-0 flex-1 px-2 py-2.5 text-body">&nbsp;</div>
        <div className="size-9 shrink-0 rounded-full bg-surface-muted" />
      </div>
      <span className="sr-only">Loading AI Louie…</span>
    </div>
  );
}

function AiLouieThread() {
  const [approached, setApproached] = React.useState(false);
  const panelRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    const node = panelRef.current;
    if (!node) return;

    if (typeof IntersectionObserver === "undefined") {
      // Very old browsers only. Scheduled rather than set synchronously so
      // this stays one render pass, and so it cannot desync from SSR (where
      // IntersectionObserver is always absent).
      const id = window.setTimeout(() => {
        setApproached(true);
        track("ai_louie_started", { trigger: "fallback" });
      }, 0);
      return () => window.clearTimeout(id);
    }

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries.some((entry) => entry.isIntersecting)) {
          setApproached(true);
          track("ai_louie_started", { trigger: "approach" });
          observer.disconnect();
        }
      },
      { rootMargin: "600px" },
    );

    observer.observe(node);
    return () => observer.disconnect();
  }, []);

  return (
    // Announces new answers and tool activity without narrating every token
    // (spec §26).
    <div
      ref={panelRef}
      aria-live="polite"
      aria-atomic="false"
      className="flex min-h-0 flex-1 flex-col"
    >
      {approached ? <AiLouieLive /> : <ThreadSkeleton />}
    </div>
  );
}

export { AiLouieThread };
