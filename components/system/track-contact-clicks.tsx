"use client";

import * as React from "react";

import { track } from "@/lib/analytics";

/**
 * One document-level listener for contact clicks, so the left rail and the
 * footer can stay server components.
 *
 * The alternative was a client wrapper around every contact link in two
 * files; this is one file and no change to how those links render. It reads
 * only the href's shape — never its value — so nothing identifying is sent.
 */
function TrackContactClicks() {
  React.useEffect(() => {
    function onClick(event: MouseEvent) {
      const target = event.target as HTMLElement | null;
      const anchor = target?.closest?.("a[href]") as HTMLAnchorElement | null;
      if (!anchor) return;

      const href = anchor.getAttribute("href") ?? "";
      const method = href.startsWith("mailto:")
        ? "email"
        : href.includes("linkedin.com")
          ? "linkedin"
          : href.includes("calendly.com")
            ? "calendly"
            : null;

      if (method) track("contact_clicked", { method });
    }

    document.addEventListener("click", onClick);
    return () => document.removeEventListener("click", onClick);
  }, []);

  return null;
}

export { TrackContactClicks };
