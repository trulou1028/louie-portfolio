"use client";

import { useEffect, useState } from "react";
import { SectionLabel } from "@/components/system/section-label";
import type { Anchor } from "@/lib/routes";
import { cn } from "@/lib/utils";

/** Native anchors with a scroll-driven current-section indicator. */
function TableOfContents({
  anchors,
  className,
}: {
  anchors: readonly Anchor[];
  className?: string;
}) {
  const [active, setActive] = useState<string | null>(null);
  useEffect(() => {
    const canvas = document.querySelector<HTMLElement>("[data-canvas-scroll]");
    if (!canvas) return;
    let frame = 0;
    const update = () => {
      frame = 0;
      const readingLine = canvas.getBoundingClientRect().top + canvas.clientHeight * 0.3;
      let current: string | null = null;
      for (const anchor of anchors) {
        const section = document.getElementById(anchor.id);
        if (section && section.getBoundingClientRect().top <= readingLine) current = anchor.id;
      }
      setActive(current);
    };
    const schedule = () => { if (!frame) frame = requestAnimationFrame(update); };
    canvas.addEventListener("scroll", schedule, { passive: true });
    const resize = new ResizeObserver(schedule);
    resize.observe(canvas);
    const article = canvas.querySelector("article");
    if (article) resize.observe(article);
    schedule();
    return () => {
      cancelAnimationFrame(frame);
      canvas.removeEventListener("scroll", schedule);
      resize.disconnect();
    };
  }, [anchors]);
  return (
    <nav aria-label="On this page" className={className}>
      <SectionLabel className="mb-3">On this page</SectionLabel>
      <ol className="flex flex-col gap-0.5">
        {anchors.map((anchor) => (
          <li key={anchor.id}>
            <a
              href={`#${anchor.id}`}
              aria-current={active === anchor.id ? "location" : undefined}
              className={cn("focus-ring block rounded-sm px-2 py-1.5 text-body-sm transition-colors duration-(--duration-fast)", active === anchor.id ? "bg-accent-soft text-accent" : "text-foreground-muted hover:bg-surface-muted hover:text-foreground")}
            >
              {anchor.label}
            </a>
          </li>
        ))}
      </ol>
    </nav>
  );
}

/**
 * The same contents, collapsed into a disclosure for narrow screens where the
 * rail is not available (spec §25).
 */
function TableOfContentsInline({
  anchors,
  className,
}: {
  anchors: readonly Anchor[];
  className?: string;
}) {
  return (
    <details
      className={cn(
        "rounded-md border border-border-subtle bg-surface-muted px-4 py-3 lg:hidden",
        className,
      )}
    >
      <summary className="focus-ring cursor-pointer rounded-sm font-mono text-label uppercase text-foreground-muted">
        On this page
      </summary>
      <ol className="mt-3 flex flex-col gap-0.5">
        {anchors.map((anchor) => (
          <li key={anchor.id}>
            <a
              href={`#${anchor.id}`}
              className="focus-ring block rounded-sm py-1.5 text-body-sm text-foreground-muted hover:text-foreground"
            >
              {anchor.label}
            </a>
          </li>
        ))}
      </ol>
    </details>
  );
}

export { TableOfContents, TableOfContentsInline };
