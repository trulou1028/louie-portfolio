import * as React from "react";

import { LeftRail } from "@/components/app-shell/left-rail";
import { MobileNav } from "@/components/app-shell/mobile-nav";
import { SiteFooter } from "@/components/app-shell/site-footer";

/**
 * The application shell (spec §10, §25).
 *
 * One responsive shell rather than separate desktop and mobile trees, so
 * navigation state is never duplicated (and never diverges):
 *
 *   < lg   compact header + drawer, single column
 *   ≥ lg   persistent 240px left rail beside the canvas
 *   ≥ xl   pages may additionally show a contextual right rail
 *
 * Landmarks live here: `nav` inside the rails, `main` around page content,
 * `aside` inside ContextualRail (spec §26).
 */
function AppShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-full flex-col lg:flex-row">
      {/* Skip link — first tab stop on every page (spec §26). */}
      <a
        href="#main"
        className="focus-ring sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-50 focus:rounded-sm focus:border focus:border-border-default focus:bg-surface-raised focus:px-4 focus:py-2 focus:text-body-sm"
      >
        Skip to content
      </a>

      <div className="hidden shrink-0 border-r border-border-subtle lg:block lg:w-[228px] xl:w-[240px]">
        <div className="sticky top-0 h-dvh">
          <LeftRail />
        </div>
      </div>

      <div className="flex min-w-0 flex-1 flex-col">
        <MobileNav />
        <main id="main" tabIndex={-1} className="flex-1">
          {children}
        </main>
        <SiteFooter />
      </div>
    </div>
  );
}

export { AppShell };
