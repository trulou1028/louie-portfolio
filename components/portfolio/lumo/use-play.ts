"use client";

import * as React from "react";
import { useInView } from "motion/react";

const QUERY = "(prefers-reduced-motion: reduce)";
const subscribe = (onChange: () => void) => {
  const media = window.matchMedia(QUERY);
  media.addEventListener("change", onChange);
  return () => media.removeEventListener("change", onChange);
};

/**
 * The visitor's reduced-motion setting, read so that hydration matches: the
 * server and the first client render both say `false`, then React re-renders
 * with the real value. Motion's own `useReducedMotion` reads it during the
 * first render, which made the server and client HTML differ.
 */
export function useReducedMotionSafe() {
  return React.useSyncExternalStore(subscribe, () => window.matchMedia(QUERY).matches, () => false);
}

/**
 * Shared timing for the LUMO case-study graphics. A graphic plays once, when
 * it scrolls into view. Under reduced motion it shows its end state at once.
 *
 * `enter(i)` gives the props for the i-th element of a sequence, `step`
 * seconds apart. Put `key={motionKey}` on the graphic's root: the reduced
 * motion setting is known only after hydration, and Motion reads `initial`
 * once, at mount. Remounting with `initial={false}` starts at the end state.
 */
export function usePlay<T extends Element>(step = 0.35) {
  const ref = React.useRef<T>(null);
  const inView = useInView(ref, { once: true, margin: "-10% 0px" });
  const reduce = useReducedMotionSafe();
  const played = inView || reduce;

  const enter = (i: number, from: { opacity?: number; x?: number; y?: number; scale?: number } = { opacity: 0, y: 8 }) => ({
    initial: reduce ? false : from,
    animate: played ? { opacity: 1, x: 0, y: 0, scale: 1 } : undefined,
    transition: reduce ? { duration: 0 } : { delay: i * step, duration: 0.45, ease: [0.22, 1, 0.36, 1] as const },
  });

  return { ref, played, reduce, enter, motionKey: reduce ? "still" : "moving" };
}
