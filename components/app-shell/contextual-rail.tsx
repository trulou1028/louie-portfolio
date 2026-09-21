"use client";

import * as React from "react";
import { usePathname } from "next/navigation";

import { PersistentPanelGroup } from "@/components/app-shell/persistent-panel-group";
import { SiteFooter } from "@/components/app-shell/site-footer";
import { ResizableHandle, ResizablePanel } from "@/components/ui/resizable";
import { useMinWidth } from "@/lib/use-breakpoint";
import { cn } from "@/lib/utils";

/**
 * The width at which the contextual rail becomes its own pane.
 *
 * This value MUST equal Tailwind's `lg` breakpoint (1024px), and every site
 * below MUST agree with it. If any of them drift apart, the rail can render
 * inside a CSS-hidden container with no stacked fallback and silently vanish
 * at one viewport band (this happened once — see Plan 015).
 *
 * - This constant (the JS half), imported by `app-shell.tsx` in place of a
 *   hardcoded `useMinWidth` literal.
 * - `app-shell.tsx:67` — `max-lg:hidden` on the left-rail pane.
 * - `app-shell.tsx:72` — `max-lg:hidden` on the rail's resize handle.
 * - `contextual-rail.tsx:56` — `lg:overflow-y-auto` on the padded rail
 *   scroller.
 * - `contextual-rail.tsx:216` — `max-lg:hidden` on the canvas resize handle.
 * - `contextual-rail.tsx:230` — `max-lg:hidden` on the canvas rail pane.
 * - `ask-panel.tsx:45` — `max-lg:max-h-[80svh]` + `max-lg:rounded-panel` +
 *   `max-lg:border`, the stacked-card treatment.
 * - `mobile-nav.tsx:35` — `lg:hidden` on the mobile header.
 * - `table-of-contents.tsx:52` — `lg:hidden` on the collapsed inline TOC.
 * - `app/globals.css:297` — `@media (max-width: 1023.98px)` hiding the
 *   `left-rail` pane + `resizable-handle` pre-hydration.
 * - `app/globals.css:307` — a second, separate `@media (max-width:
 *   1023.98px)` block hiding the `canvas-rail` pane pre-hydration.
 *
 * That is twelve sites, not three. `e2e/home.spec.ts`'s 1023/1025 boundary
 * test is what catches a miss.
 */
export const RAIL_BREAKPOINT_PX = 1024;

/**
 * The optional right rail (spec §10).
 *
 * "It should disappear when it does not add value" — so this renders nothing
 * at all when it has no children. Width, visibility, and scrolling are owned
 * by `Canvas`, which places it in its own resizable pane on xl viewports.
 */
function ContextualRail({
  className,
  children,
  bare = false,
  "aria-label": ariaLabel = "Related",
  ...props
}: React.ComponentPropsWithoutRef<"aside"> & {
  /**
   * Skip the rail's own padding and scrolling because the content paints the
   * full pane itself and manages its own scroll (the Ask panel does this — it
   * fills the rail edge to edge and pins its composer to the bottom).
   */
  bare?: boolean;
}) {
  const isEmpty = React.Children.toArray(children).length === 0;
  if (isEmpty) return null;

  return (
    <aside
      aria-label={ariaLabel}
      className={cn(
        // `lg:h-full` + `min-h-0` is what lets a child fill the pane and
        // scroll inside it. Below lg the rail sits in the page flow, where
        // its natural height is correct.
        "flex min-h-0 flex-col lg:h-full",
        // Padded scroller by default (case-study tables of contents); bare
        // content owns its own chrome.
        bare ? undefined : "gap-6 px-5 py-10 lg:py-14 lg:overflow-y-auto",
        className,
      )}
      {...props}
    >
      {children}
    </aside>
  );
}

/**
 * A page's content column, and the owner of its scrolling.
 *
 * The shell locks the viewport (`main` never scrolls), so every page scrolls
 * inside Canvas — which is what makes the columns independent: the left rail,
 * this column, and the contextual rail each keep their own scroll position,
 * and the divider between content and rail is draggable, like a desktop tool.
 *
 * Layout by viewport (RAIL_BREAKPOINT_PX, currently `lg` = 1024px):
 *   ≥ lg   nested resizable panes: [content ‖ rail], each its own scroller
 *   < lg   one scroller; `stackRail` pages append the rail after the content
 *          (the homepage), others simply omit it (case-study TOCs)
 *
 * The desktop pane tree is the server-rendered canonical DOM — `useMinWidth`
 * reports desktop on the server and first client render, so crawlers index
 *one copy and hydration never mismatches. Below lg the layout corrects at
 * mount; the rail pane's `max-lg:hidden` guard keeps that first frame
 * clean. The footer lives at the end of the content scroller: in an app
 * frame, a footer belongs to the content column, not the window.
 */
function Canvas({
  className,
  children,
  rail,
  stackRail = false,
  stackedRailAfter = "content",
  railDefaultSize = 350,
  width = "reading",
}: {
  className?: string;
  width?: "reading" | "wide";
  children: React.ReactNode;
  rail?: React.ReactNode;
  /** Below the rail breakpoint, render the rail after the content instead of dropping it. */
  stackRail?: boolean;
  /**
   * Below the rail breakpoint the rail stacks into the content column. By
   * default ("content") it appends after all children; "featured-work"
   * inserts it right after the top-level child tagged
   * `data-testid="featured-work"`, so a page can put the rail higher up
   * without losing the "Featured work before the AI surface" owner decision
   * (Plan 011). Falls back to "content" placement if no such child is found.
   */
  stackedRailAfter?: "content" | "featured-work";
  /** Initial rail width in pixels (v4 panels size in px). */
  railDefaultSize?: number;
}) {
  const pathname = usePathname();
  const scrollRef = React.useRef<HTMLDivElement>(null);
  const hasRailPane = useMinWidth(RAIL_BREAKPOINT_PX);

  // An inner scroller keeps its position across route changes; a document
  // scroll would have been reset by the browser. Restore that expectation —
  // unless the URL carries a hash, which the deep-link behaviour handles.
  React.useEffect(() => {
    if (!window.location.hash) scrollRef.current?.scrollTo({ top: 0, behavior: "instant" });
  }, [pathname]);

  const showPanes = Boolean(rail) && hasRailPane;

  // Below the rail breakpoint, `stackRail` pages fold the rail back into the
  // content column instead of dropping it. By default it lands after every
  // child; "featured-work" places it right after the top-level child tagged
  // `data-testid="featured-work"` instead, so the homepage can keep Plan
  // 011's "Featured work ahead of the AI surface" decision while shortening
  // how far a visitor has to scroll to reach the Ask panel.
  //
  // The "content" (default) path renders the stacked rail as the last thing
  // in the column, and that column is not guaranteed to be a `gap-*` flex
  // column — a page could pass any `className` — so `mt-16` carries the
  // spacing itself there. The "featured-work" path instead splices the rail
  // in as a sibling of the page's own `flex flex-col gap-14` sections (see
  // `app/page.tsx`), where the column's `gap` already provides that spacing;
  // keeping `mt-16` there would stack on top of the gap and double it.
  const stackedRail =
    rail && stackRail && !hasRailPane ? (
      <div className={stackedRailAfter === "featured-work" ? undefined : "mt-16"}>
        {rail}
      </div>
    ) : null;

  let bodyContent: React.ReactNode = (
    <>
      {children}
      {stackedRail}
    </>
  );

  if (stackedRail && stackedRailAfter === "featured-work") {
    const childArray = React.Children.toArray(children);
    const featuredIndex = childArray.findIndex(
      (child) =>
        React.isValidElement(child) &&
        (child.props as { "data-testid"?: string })["data-testid"] ===
          "featured-work",
    );
    // Falls back to appending after all children if the marker isn't found,
    // so a missing/renamed testid degrades to the default placement rather
    // than silently dropping the rail.
    bodyContent =
      featuredIndex === -1 ? (
        <>
          {childArray}
          {stackedRail}
        </>
      ) : (
        <>
          {childArray.slice(0, featuredIndex + 1)}
          {stackedRail}
          {childArray.slice(featuredIndex + 1)}
        </>
      );
  }

  const content = (
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
      className="relative h-full min-w-0 flex-1 overflow-y-auto"
    >
      <div
        className={cn(
          "mx-auto w-full max-w-[900px] px-6 py-10 sm:px-8 lg:py-14",
          width === "wide" && "portfolio-wide",
          className,
        )}
      >
        {bodyContent}
      </div>
      <SiteFooter wide={width === "wide"} />
    </div>
  );

  if (!showPanes) return content;

  return (
    <PersistentPanelGroup
      storageKey="canvas-v2"
      orientation="horizontal"
      className="h-full"
    >
      <ResizablePanel id="canvas-content" minSize={480}>
        {content}
      </ResizablePanel>

      <ResizableHandle
        className="after:w-2 cursor-col-resize bg-border-subtle transition-colors duration-(--duration-fast) hover:bg-accent data-[resizing]:bg-accent max-lg:hidden"
        aria-label="Resize context panel"
      />

      <ResizablePanel
        id="canvas-rail"
        defaultSize={railDefaultSize}
        minSize={260}
        maxSize={520}
      >
        {/* No padding, no scroller here: the rail's content owns the full
            pane so a panel can fill it edge to edge and pin its own footer,
            rather than sitting as a box inside a box. Content that wants to
            scroll manages that itself (see AskPanel). */}
        <div className="relative h-full max-lg:hidden">{rail}</div>
      </ResizablePanel>
    </PersistentPanelGroup>
  );
}

export { ContextualRail, Canvas };
