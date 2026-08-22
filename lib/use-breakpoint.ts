"use client";

import * as React from "react";

/**
 * Viewport breakpoint as React state, for layout that genuinely cannot be
 * expressed in CSS — the resizable panel tree (spec: the three-pane shell).
 *
 * SSR and the first client render both report `true` (desktop): the
 * server-rendered document is the canonical desktop DOM, which is what
 * crawlers index, and hydration therefore never mismatches. On smaller
 * viewports the layout corrects in the effect immediately after mount; the
 * desktop-only regions carry CSS guards (`hidden xl:block`) so that first
 * frame shows them hidden rather than squeezed.
 */
export function useMinWidth(px: number): boolean {
  const query = `(min-width: ${px}px)`;

  const subscribe = React.useCallback(
    (onChange: () => void) => {
      const mql = window.matchMedia(query);
      mql.addEventListener("change", onChange);
      return () => mql.removeEventListener("change", onChange);
    },
    [query],
  );

  const [mounted, setMounted] = React.useState(false);
  React.useEffect(() => {
    // Deliberate two-pass render: the first client render must match the
    // server (desktop) to keep hydration sound, then one state flip switches
    // to the real viewport. This is the documented exception to the rule —
    // the cascade is the point, and it happens exactly once per mount.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setMounted(true);
  }, []);

  const matches = React.useSyncExternalStore(
    subscribe,
    () => window.matchMedia(query).matches,
    () => true,
  );

  return mounted ? matches : true;
}
