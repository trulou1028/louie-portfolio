"use client";

import * as React from "react";
import { useInView } from "motion/react";

import { useReducedMotionSafe } from "@/components/portfolio/lumo/use-play";
import type { DecisionMarkSpec } from "@/lib/decision-mark";
import { cn } from "@/lib/utils";

/**
 * One decision mark over a screenshot (Plan 037): since 2026-10-30 a red
 * pen loop around the decision and a handwritten note on a slip of paper,
 * to match the pen doodle portrait (Louie). Sits in a `relative` box the
 * size of the image; the loop may run past the image onto its mat.
 *
 * Decorative to assistive tech. The owning frame repeats the label in its
 * caption, so the meaning never depends on seeing the mark.
 *
 * The note sits above the loop when there is room, and inside the top of
 * it when the box touches the top of the image. It anchors to whichever
 * side keeps it inside the frame, unless the spec names a side. A spec can
 * also put the note under the loop.
 *
 * The pen draws the loop once, when the mark scrolls into view, and the
 * note lands after it. The server HTML and reduced motion show the end
 * state; only a mounted mark that is not yet in view waits, hidden.
 */
const noop = () => () => {};

/**
 * The loop's length on screen, in px. The SVG stretches to the box and the
 * stroke does not scale, so its dashes are measured on screen; `pathLength`
 * would count the unstretched path, and a wide box's loop drew only part
 * of the way (Louie, 2026-10-30).
 */
function screenLength(path: SVGPathElement) {
  const svg = path.ownerSVGElement;
  if (!svg) return 0;
  const sx = svg.clientWidth / 100;
  const sy = svg.clientHeight / 100;
  const total = path.getTotalLength();
  let length = 0;
  let last = path.getPointAtLength(0);
  for (let i = 1; i <= 96; i++) {
    const point = path.getPointAtLength((total * i) / 96);
    length += Math.hypot((point.x - last.x) * sx, (point.y - last.y) * sy);
    last = point;
  }
  return Math.ceil(length) + 2;
}

function DecisionMark({ mark }: { mark: DecisionMarkSpec }) {
  const labelAbove = mark.y >= 12;
  const anchorEnd = mark.labelAt ? mark.labelAt === "end" : mark.x + mark.w / 2 > 55;

  const ref = React.useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true, margin: "-15% 0px" });
  const reduce = useReducedMotionSafe();
  // False in the server HTML and the first client render, true after.
  const mounted = React.useSyncExternalStore(noop, () => true, () => false);
  const pen = reduce || !mounted ? undefined : inView ? "drawn" : "waiting";

  const pathRef = React.useRef<SVGPathElement>(null);
  React.useLayoutEffect(() => {
    const path = pathRef.current;
    if (!path) return;
    const measure = () => path.style.setProperty("--pen-length", `${screenLength(path)}px`);
    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(path.ownerSVGElement ?? path);
    return () => observer.disconnect();
  }, []);

  return (
    <span
      ref={ref}
      aria-hidden="true"
      data-decision-mark
      data-pen={pen}
      className="decision-mark pointer-events-none absolute"
      style={{ left: `${mark.x}%`, top: `${mark.y}%`, width: `${mark.w}%`, height: `${mark.h}%` }}
    >
      {/* The loop overshoots the box a little, like a pen circling it, and
          its end runs past its start. Part of the overshoot is fixed, so a
          large box does not get a huge loop. The stroke keeps its width
          however the box stretches. */}
      <svg
        viewBox="0 0 100 100"
        preserveAspectRatio="none"
        className="absolute top-[calc(-6%-10px)] left-[calc(-4%-8px)] h-[calc(112%+20px)] w-[calc(108%+16px)] overflow-visible"
      >
        <path
          ref={pathRef}
          d="M54,4 C82,3 98,22 97,52 C96,82 74,97 47,96 C19,95 3,77 4,47 C5,20 25,4 60,7"
          fill="none"
          className="stroke-signal"
          strokeWidth={2.5}
          strokeLinecap="round"
          vectorEffect="non-scaling-stroke"
        />
      </svg>
      <span
        className={cn(
          "decision-mark-note absolute w-max max-w-[min(70vw,22rem)] rounded-xs bg-signal-ink px-2.5 pt-0.5 pb-1 font-hand text-hand text-signal shadow-soft",
          mark.labelBelow ? "top-full mt-5 rotate-2" : labelAbove ? "bottom-full mb-5 -rotate-2" : "top-1 -rotate-2",
          anchorEnd ? "right-0" : "left-0",
        )}
      >
        {mark.label}
      </span>
    </span>
  );
}

export { DecisionMark };
