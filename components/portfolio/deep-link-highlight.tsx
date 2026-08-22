"use client";

import * as React from "react";
import { usePathname } from "next/navigation";

const HIGHLIGHT_MS = 1500;

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
 */
function DeepLinkHighlight() {
  const pathname = usePathname();

  React.useEffect(() => {
    let timeout: ReturnType<typeof setTimeout> | undefined;

    const reveal = () => {
      const id = window.location.hash.slice(1);
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
