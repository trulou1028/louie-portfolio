"use client";

import * as React from "react";
import dynamic from "next/dynamic";
import { Sparkles } from "lucide-react";

import { Surface } from "@/components/system/surface";
import { SystemLabel } from "@/components/system/system-label";

/**
 * The AI Louie panel (spec §11 §2, §27).
 *
 * The assistant runtime is roughly 840KB. Loading it in every page's shared
 * bundle meant even `/about` paid for it, because Next prefetches route
 * chunks. So the runtime is its own chunk, fetched when the visitor
 * approaches the panel — which is exactly what spec §27 asks for: "avoid
 * loading the full AI runtime until the user approaches or activates the AI
 * surface".
 *
 * A generous `rootMargin` means the fetch starts before the panel is on
 * screen, so the swap is not something a visitor notices. Without
 * IntersectionObserver the runtime simply loads immediately.
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
    <div aria-busy="true" className="flex flex-col gap-5">
      <div className="flex gap-3">
        <span
          aria-hidden="true"
          className="flex size-8 shrink-0 items-center justify-center rounded-full bg-accent text-surface"
        >
          <Sparkles className="size-4" />
        </span>
        <Surface
          radius="lg"
          className="min-w-0 flex-1 border-accent-muted/70 bg-surface-raised p-5"
        >
          <p className="max-w-[62ch] text-body text-foreground">
            Hi, I&rsquo;m AI Louie. I can answer questions about Louie&rsquo;s
            work and take you directly to the evidence behind my answer.
          </p>
        </Surface>
      </div>
      <div
        aria-hidden="true"
        className="h-14 rounded-md border border-border-default bg-surface-muted"
      />
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
      const id = window.setTimeout(() => setApproached(true), 0);
      return () => window.clearTimeout(id);
    }

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries.some((entry) => entry.isIntersecting)) {
          setApproached(true);
          observer.disconnect();
        }
      },
      { rootMargin: "600px" },
    );

    observer.observe(node);
    return () => observer.disconnect();
  }, []);

  return (
    <Surface variant="ai" radius="panel" className="p-6 sm:p-8" ref={panelRef}>
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
        {approached ? <AiLouieLive /> : <ThreadSkeleton />}
      </div>
    </Surface>
  );
}

export { AiLouieThread };
