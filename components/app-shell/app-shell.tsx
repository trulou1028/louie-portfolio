"use client";

import * as React from "react";
import { AskLouieProvider } from "@/components/ai/ask-louie-dialog";
import { usePathname } from "next/navigation";


/**
 * The application shell (spec §10, §25), revised by Plan 037.
 *
 * The viewport is locked to `h-dvh`, and the content region never scrolls
 * itself: pages scroll inside `StackedShell`.
 *
 * There is no site header (stacked redesign, Louie, 2026-10-29). Every page
 * has a left column with the portrait, the name, Ask Louie, and the links;
 * below 820px that column sits at the top of the page.
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


      <main id="main" tabIndex={-1} className="min-h-0 flex-1 overflow-hidden">
        {children}
      </main>
    </div></AskLouieProvider>
  );
}

export { AppShell };
