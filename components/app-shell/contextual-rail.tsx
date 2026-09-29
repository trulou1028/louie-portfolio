"use client";

import * as React from "react";
import { usePathname } from "next/navigation";

import { SiteFooter } from "@/components/app-shell/site-footer";
import { cn } from "@/lib/utils";

/**
 * The optional right column on case-study pages (spec §10): the page's
 * contents and the "Ask about this project" card.
 *
 * "It should disappear when it does not add value" — so this renders nothing
 * at all when it has no children. `Canvas` places it and keeps it in view.
 */
function ContextualRail({
  className,
  children,
  "aria-label": ariaLabel = "Related",
  ...props
}: React.ComponentPropsWithoutRef<"aside">) {
  const isEmpty = React.Children.toArray(children).length === 0;
  if (isEmpty) return null;

  return (
    <aside aria-label={ariaLabel} className={cn("flex flex-col gap-8", className)} {...props}>
      {children}
    </aside>
  );
}

/**
 * A page's content column, and the owner of its scrolling.
 *
 * The shell locks the viewport (`main` never scrolls), so every page scrolls
 * inside Canvas, and the footer lives at the end of that scroller.
 *
 * Width (Plan 042): pages with a rail, and `width="wide"` pages, sit in the
 * same centered `.portfolio-wide` frame as the header, so the content's left
 * edge lines up with the name and the rail's right edge with the Ask Louie
 * button.
 *
 * The scroller is a size container named `canvas`. Page layouts inside it
 * respond to its width (`@4xl/canvas:`, `@5xl/canvas:`), not the viewport's,
 * because the docked Ask Louie panel narrows it: the page reflows instead
 * of squeezing. The rail is a sticky right column when the canvas is at
 * least 64rem wide; below that it folds away and case studies show their
 * inline contents instead.
 * `width="reading"` pages without a rail keep the centered 900px column.
 *
 * Plan 042 replaced the earlier resizable, full-bleed content and rail panes.
 * They let the page run edge to edge, out of line with the header.
 */
function Canvas({
  className,
  children,
  rail,
  width = "reading",
}: {
  className?: string;
  width?: "reading" | "wide";
  children: React.ReactNode;
  rail?: React.ReactNode;
}) {
  const pathname = usePathname();
  const scrollRef = React.useRef<HTMLDivElement>(null);

  // An inner scroller keeps its position across route changes; a document
  // scroll would have been reset by the browser. Restore that expectation —
  // unless the URL carries a hash, which the deep-link behaviour handles.
  React.useEffect(() => {
    if (!window.location.hash) scrollRef.current?.scrollTo({ top: 0, behavior: "instant" });
  }, [pathname]);

  const framed = Boolean(rail) || width === "wide";

  return (
    <div
      ref={scrollRef}
      data-canvas-scroll
      /* `relative` is load-bearing, not cosmetic: Tailwind's `sr-only` is
         position:absolute, so a screen-reader-only span deep inside this
         scroller (e.g. InlineLink's "(opens in a new tab)") resolves against
         the initial containing block when no ancestor is positioned — landing
         at its page coordinate and extending the DOCUMENT's scroll height.
         That made the whole app frame scroll away, leaving a blank void
         below. Measured: 2008px document height before, 900px after. */
      className="@container/canvas relative h-full min-w-0 overflow-y-auto"
    >
      {rail ? (
        <div className="portfolio-wide py-10 lg:py-14 @5xl/canvas:grid @5xl/canvas:grid-cols-[minmax(0,1fr)_17rem] @5xl/canvas:gap-16">
          <div className={cn("min-w-0", className)}>{children}</div>
          <div className="hidden @5xl/canvas:block">
            <div className="sticky top-10 max-h-[calc(100dvh-9rem)] overflow-y-auto pb-2">{rail}</div>
          </div>
        </div>
      ) : (
        <div className={cn("w-full py-10 lg:py-14", framed ? "portfolio-wide" : "mx-auto max-w-[900px] px-6 sm:px-8", className)}>
          {children}
        </div>
      )}
      <SiteFooter wide={framed} />
    </div>
  );
}

export { ContextualRail, Canvas };
