"use client";

import * as React from "react";
import { usePathname } from "next/navigation";

import { PersistentPanelGroup } from "@/components/app-shell/persistent-panel-group";
import { SiteFooter } from "@/components/app-shell/site-footer";
import { ResizableHandle, ResizablePanel } from "@/components/ui/resizable";
import { useMinWidth } from "@/lib/use-breakpoint";
import { cn } from "@/lib/utils";

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
  "aria-label": ariaLabel = "Related",
  ...props
}: React.ComponentPropsWithoutRef<"aside">) {
  const isEmpty = React.Children.toArray(children).length === 0;
  if (isEmpty) return null;

  return (
    <aside
      aria-label={ariaLabel}
      className={cn("flex flex-col gap-6", className)}
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
 * Layout by viewport:
 *   ≥ xl   nested resizable panes: [content ‖ rail], each its own scroller
 *   < xl   one scroller; `stackRail` pages append the rail after the content
 *          (the homepage), others simply omit it (case-study TOCs)
 *
 * The desktop pane tree is the server-rendered canonical DOM — `useMinWidth`
 * reports desktop on the server and first client render, so crawlers index
 *one copy and hydration never mismatches. Below xl the layout corrects at
 * mount; the rail pane's `hidden xl:block` guard keeps that first frame
 * clean. The footer lives at the end of the content scroller: in an app
 * frame, a footer belongs to the content column, not the window.
 */
function Canvas({
  className,
  children,
  rail,
  stackRail = false,
  railDefaultSize = 340,
}: {
  className?: string;
  children: React.ReactNode;
  rail?: React.ReactNode;
  /** Below xl, render the rail after the content instead of dropping it. */
  stackRail?: boolean;
  /** Initial rail width in pixels (v4 panels size in px). */
  railDefaultSize?: number;
}) {
  const pathname = usePathname();
  const scrollRef = React.useRef<HTMLDivElement>(null);
  const isXl = useMinWidth(1280);

  // An inner scroller keeps its position across route changes; a document
  // scroll would have been reset by the browser. Restore that expectation —
  // unless the URL carries a hash, which the deep-link behaviour handles.
  React.useEffect(() => {
    if (!window.location.hash) scrollRef.current?.scrollTo(0, 0);
  }, [pathname]);

  const showPanes = Boolean(rail) && isXl;

  const content = (
    <div
      ref={scrollRef}
      data-canvas-scroll
      className="h-full min-w-0 flex-1 overflow-y-auto"
    >
      <div
        className={cn(
          "mx-auto w-full max-w-[900px] px-6 py-10 sm:px-8 lg:py-14",
          className,
        )}
      >
        {children}
        {rail && stackRail && !isXl ? (
          <div className="mt-16">{rail}</div>
        ) : null}
      </div>
      <SiteFooter />
    </div>
  );

  if (!showPanes) return content;

  return (
    <PersistentPanelGroup
      storageKey="canvas"
      orientation="horizontal"
      className="h-full"
    >
      <ResizablePanel id="canvas-content" minSize={480}>
        {content}
      </ResizablePanel>

      <ResizableHandle
        className="after:w-2 cursor-col-resize bg-border-subtle transition-colors duration-(--duration-fast) hover:bg-accent data-[resizing]:bg-accent max-xl:hidden"
        aria-label="Resize context panel"
      />

      <ResizablePanel
        id="canvas-rail"
        defaultSize={railDefaultSize}
        minSize={260}
        maxSize={520}
      >
        <div className="h-full overflow-y-auto px-5 py-10 max-xl:hidden lg:py-14">
          {rail}
        </div>
      </ResizablePanel>
    </PersistentPanelGroup>
  );
}

export { ContextualRail, Canvas };
