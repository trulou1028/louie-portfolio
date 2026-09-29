"use client";

import * as React from "react";
import { AskLouieProvider } from "@/components/ai/ask-louie-dialog";
import { usePathname } from "next/navigation";

import { MobileNav } from "@/components/app-shell/mobile-nav";
import { SiteHeader } from "@/components/app-shell/site-header";

/**
 * The application shell (spec §10, §25), revised by Plan 037.
 *
 * The viewport is locked to `h-dvh`: a header on top, and one content region
 * below it that never scrolls itself. Pages scroll inside `Canvas`, which is
 * also where the footer and the optional contextual right rail live.
 *
 *   < lg   compact `MobileNav` header + drawer
 *   ≥ lg   `SiteHeader` with inline navigation
 *   ≥ lg   pages may additionally show a resizable contextual right rail
 *
 * The persistent left rail is gone (Plan 037): it spent a quarter of the
 * screen on four links, and the work needs the width.
 */
function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  React.useEffect(() => {
    // This shell survives responsive remounts and page transitions. Clear
    // only on departure, so hydration can still restore a swallowed hash.
    if (window.__deepLinkPathname !== pathname) {
      window.__deepLinkHash = undefined;
      window.__deepLinkPathname = undefined;
    }
  }, [pathname]);

  return (
    <AskLouieProvider><div data-app-frame className="flex h-dvh flex-col overflow-hidden">
      {/* Skip link — first tab stop on every page (spec §26). */}
      <a
        href="#main"
        className="focus-ring sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-50 focus:rounded-sm focus:border focus:border-border-default focus:bg-surface-raised focus:px-4 focus:py-2 focus:text-body-sm"
      >
        Skip to content
      </a>

      <SiteHeader />
      <MobileNav />

      <main id="main" tabIndex={-1} className="min-h-0 flex-1 overflow-hidden">
        {children}
      </main>
    </div></AskLouieProvider>
  );
}

export { AppShell };
