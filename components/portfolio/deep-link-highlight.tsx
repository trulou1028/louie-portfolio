"use client";

import * as React from "react";
import { usePathname } from "next/navigation";

const HIGHLIGHT_MS = 1500;

declare global {
  interface Window {
    /** Set by the inline capture script in `app/layout.tsx`. */
    __deepLinkHash?: string;
  }
}

/**
 * Makes a deep link land somewhere obvious (spec §18 Tool 2, §26).
 *
 * When a URL carries a hash, the target section is scrolled into view, briefly
 * washed with the accent tint, and given focus. Plan 006's
 * `navigate_portfolio` tool reuses this exact behavior, which is why it lives
 * here rather than inside the AI layer — arriving from a pasted link and
 * arriving because AI Louie sent you should feel identical.
 *
 * Focus moves to the section rather than staying on the page body so keyboard
 * and screen-reader users continue from the destination, not from the top
 * (spec §26: "focus should move predictably after AI-triggered navigation").
 *
 * Motion is skipped under `prefers-reduced-motion`: the jump is instant, and
 * the highlight still appears — it just does not animate.
 *
 * The mount pass matters as much as the `hashchange` listener: a hash can
 * change between the HTML painting and this component hydrating, and that
 * event is gone by the time the listener exists. Reading
 * `window.location.hash` once on mount covers that window.
 */
function DeepLinkHighlight() {
  const pathname = usePathname();

  React.useEffect(() => {
    let timeout: ReturnType<typeof setTimeout> | undefined;

    const reveal = () => {
      // Fall back to the pre-hydration capture only when the live hash is
      // gone, so a later navigation always wins over a stale one.
      const id = (window.location.hash || window.__deepLinkHash || "").slice(1);
      if (!id) return;

      const target = document.getElementById(id);
      if (!target) return;

      const prefersReducedMotion = window.matchMedia(
        "(prefers-reduced-motion: reduce)",
      ).matches;

      target.scrollIntoView({
        behavior: prefersReducedMotion ? "auto" : "smooth",
        block: "start",
      });

      // preventScroll: the scrollIntoView above already positioned the page.
      target.focus({ preventScroll: true });

      target.setAttribute("data-highlight", "true");
      // Restart the clock. Without this a second reveal inherits the first
      // one's pending expiry, so the highlight can clear early. Two reveals
      // in quick succession is a real sequence, not a hypothetical: setting
      // `location.hash` updates the hash synchronously and dispatches
      // `hashchange` after, so the mount pass below can already have
      // revealed that same hash a beat earlier.
      if (timeout) clearTimeout(timeout);
      timeout = setTimeout(() => {
        target.removeAttribute("data-highlight");
      }, HIGHLIGHT_MS);
    };

    // Defer one frame so the section exists before we look for it.
    const frame = requestAnimationFrame(reveal);
    window.addEventListener("hashchange", reveal);

    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener("hashchange", reveal);
      if (timeout) clearTimeout(timeout);
    };
  }, [pathname]);

  return null;
}

export { DeepLinkHighlight };
