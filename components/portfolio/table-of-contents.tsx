"use client";

import { useEffect, useState } from "react";
import type { Anchor } from "@/lib/routes";
import { cn } from "@/lib/utils";

/**
 * Native anchors with a scroll-driven current-section indicator. Since the
 * stacked redesign it sits in the case study's left column: plain text
 * links, the current section in ink with a rule beside it.
 */
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
      <p aria-hidden="true" className="mb-4 text-label font-bold uppercase text-foreground-muted">On this page</p>
      <ol className="flex flex-col gap-2 border-l border-border-default">
        {anchors.map((anchor) => (
          <li key={anchor.id}>
            <a
              href={`#${anchor.id}`}
              aria-current={active === anchor.id ? "location" : undefined}
              // Square corners: a border on a rounded box bends into a
              // bracket at the ends (Louie, 2026-10-29). A straight line only.
              className={cn("focus-ring -ml-px block rounded-none border-l py-0.5 pl-4 text-body-sm leading-snug transition-colors duration-(--duration-fast)", active === anchor.id ? "border-accent-line text-foreground" : "border-transparent text-foreground-quiet hover:text-foreground")}
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
 * The same contents, collapsed into a disclosure for narrow canvases, where
 * the left column sits above the page (spec §25).
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
        "border-y border-border-default py-3",
        className,
      )}
    >
      <summary className="focus-ring cursor-pointer rounded-xs text-meta text-foreground-quiet">
        On this page
      </summary>
      <ol className="mt-3 flex flex-col gap-0.5">
        {anchors.map((anchor) => (
          <li key={anchor.id}>
            <a
              href={`#${anchor.id}`}
              className="focus-ring block rounded-xs py-1.5 text-body-sm text-foreground-muted hover:text-accent-hover"
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
