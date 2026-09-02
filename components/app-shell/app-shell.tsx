"use client";

import * as React from "react";

import { LeftRail } from "@/components/app-shell/left-rail";
import { MobileNav } from "@/components/app-shell/mobile-nav";
import { PersistentPanelGroup } from "@/components/app-shell/persistent-panel-group";
import { RAIL_BREAKPOINT_PX } from "@/components/app-shell/contextual-rail";
import { ResizableHandle, ResizablePanel } from "@/components/ui/resizable";
import { useMinWidth } from "@/lib/use-breakpoint";

/**
 * The application shell (spec §10, §25) — an app frame, not a document.
 *
 * The viewport is locked to `h-dvh` and every column owns its scroll, the way
 * a desktop tool does: the left rail scrolls independently of the canvas, and
 * pages with a contextual rail (see `Canvas`) add a third independent
 * scroller. The divider is draggable — pixel-based min/max keep the rail
 * inside spec §10's range — sizes persist per visitor, and the handle is a
 * real separator, keyboard-resizable with arrow keys (spec §26).
 *
 *   < lg   compact header + drawer; the rail pane is not rendered
 *   ≥ lg   persistent, resizable left rail beside the canvas
 *   ≥ xl   pages may additionally show a resizable contextual right rail
 *
 * `useMinWidth` reports desktop on the server, so the canonical document
 * always contains the rail exactly once; below lg it unmounts at hydration.
 * The rail's inner `max-lg:hidden` guard keeps the pre-hydration frame on
 * phones from flashing desktop chrome. Because `main` never scrolls, pages
 * own their scrolling through `Canvas` — which is also where the footer
 * lives now: in an app frame a footer belongs to the content column, not
 * the window.
 */
function AppShell({ children }: { children: React.ReactNode }) {
  const isLg = useMinWidth(RAIL_BREAKPOINT_PX);

  return (
    <div className="flex h-dvh flex-col overflow-hidden">
      {/* Skip link — first tab stop on every page (spec §26). */}
      <a
        href="#main"
        className="focus-ring sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-50 focus:rounded-sm focus:border focus:border-border-default focus:bg-surface-raised focus:px-4 focus:py-2 focus:text-body-sm"
      >
        Skip to content
      </a>

      <MobileNav />

      <PersistentPanelGroup
        storageKey="shell-v2"
        orientation="horizontal"
        className="min-h-0 flex-1"
      >
        {isLg ? (
          <>
            <ResizablePanel
              id="left-rail"
              defaultSize={300}
              minSize={190}
              maxSize={340}
            >
              {/* No `border-r` here: the `ResizableHandle` below is itself a
                  1px `bg-border-subtle` line, so a border on the pane sat
                  directly beside it and the pair read as a 2px rule — visibly
                  heavier than every other border on the site. The handle is
                  the separator (it highlights on hover and drag); the pane
                  does not draw one of its own. */}
              <div className="relative h-full overflow-y-auto max-lg:hidden">
                <LeftRail />
              </div>
            </ResizablePanel>
            <ResizableHandle
              className="after:w-2 cursor-col-resize bg-border-subtle transition-colors duration-(--duration-fast) hover:bg-accent data-[resizing]:bg-accent max-lg:hidden"
              aria-label="Resize navigation"
            />
          </>
        ) : null}

        <ResizablePanel id="content">
          <main id="main" tabIndex={-1} className="h-full overflow-hidden">
            {children}
          </main>
        </ResizablePanel>
      </PersistentPanelGroup>
    </div>
  );
}

export { AppShell };
