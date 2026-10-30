"use client";

import * as React from "react";
import { usePathname } from "next/navigation";

const HIGHLIGHT_MS = 1500;

declare global {
  interface Window {
    /** Set by the inline capture script in `app/layout.tsx`. */
    __deepLinkHash?: string;
    __deepLinkPathname?: string;
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
    let settle: ReturnType<typeof setTimeout> | undefined;
    let userScrolled = false;
    const markUserScroll = () => { userScrolled = true; };
    let highlighted: HTMLElement | null = null;

    // Clears whatever is currently highlighted (timer and attribute both),
    // so a new reveal or a route change never leaves a stale glow behind.
    const clear = () => {
      if (timeout) clearTimeout(timeout);
      timeout = undefined;
      highlighted?.removeAttribute("data-highlight");
      highlighted = null;
    };

    const reveal = () => {
      // Scope the hydration fallback to this route. AppShell clears it on
      // departure, while responsive remounts on the same route retain it.
      const captured = window.__deepLinkPathname === pathname ? window.__deepLinkHash : "";
      const id = (window.location.hash || captured || "").slice(1);
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

      // Settle pass. On a phone the smooth scroll can end short of the
      // section (seen in WebKit about one load in five). Once it should be
      // done, align again without animation, unless the visitor has scrolled
      // on their own since.
      if (settle) clearTimeout(settle);
      userScrolled = false;
      settle = setTimeout(() => {
        const top = target.getBoundingClientRect().top;
        if (!userScrolled && (top < -8 || top > 64)) target.scrollIntoView({ behavior: "auto", block: "start" });
      }, 900);

      // Clear the previous target's highlight immediately rather than
      // letting two sections glow at once. Two reveals in quick succession
      // is a real sequence, not a hypothetical: setting `location.hash`
      // updates the hash synchronously and dispatches `hashchange` after, so
      // the mount pass below can already have revealed a different hash a
      // beat earlier. Route changes clear it too, via the effect cleanup.
      clear();
      target.setAttribute("data-highlight", "true");
      highlighted = target;
      timeout = setTimeout(clear, HIGHLIGHT_MS);
    };

    // Defer one frame so the section exists before we look for it, and wait
    // for the web fonts: a font swap after the scroll changes the height of
    // the text above the target and pushes it out of view (seen on phones,
    // where the left column sits above the article; stacked redesign).
    let cancelled = false;
    const frame = requestAnimationFrame(() => {
      void document.fonts.ready.then(() => { if (!cancelled) reveal(); });
    });
    window.addEventListener("hashchange", reveal);
    for (const type of ["wheel", "touchstart", "keydown"]) window.addEventListener(type, markUserScroll, { passive: true });

    return () => {
      cancelled = true;
      if (settle) clearTimeout(settle);
      for (const type of ["wheel", "touchstart", "keydown"]) window.removeEventListener(type, markUserScroll);
      cancelAnimationFrame(frame);
      window.removeEventListener("hashchange", reveal);
      clear();
    };
  }, [pathname]);

  return null;
}

export { DeepLinkHighlight };
