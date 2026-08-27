"use client";

import * as React from "react";
import { ArrowRight, RotateCcw } from "lucide-react";
import { motion, useInView, useReducedMotion } from "motion/react";

import { Badge } from "@/components/ui/badge";
import {
  Node,
  StepMarker,
  type FlowStage,
} from "@/components/portfolio/diagram-primitives";
import { cn } from "@/lib/utils";

/**
 * A top-to-bottom flow, with a drawn connector layer.
 *
 * **The HTML is the diagram; the SVG is decoration.** The `<ol>`/`<li>`
 * structure carries the order and reads correctly with no CSS and no JS
 * (spec §34, "HTML or text fallback") — the SVG is `aria-hidden`, absolutely
 * positioned, and `pointer-events-none`.
 *
 * Why measure instead of drawing in CSS: borders can draw a sequence, but not
 * a branch. Five of the flows in these case studies fan one step out into
 * three, and until now that fan was drawn with nothing at all — the parallel
 * row simply sat in a grid with no line reaching it. A fan needs to know
 * where each card actually landed, which is only knowable after layout, so
 * the connectors are computed from `getBoundingClientRect` and recomputed by
 * a `ResizeObserver`. That keeps spec §25's reflow: the connectors follow the
 * cards to wherever the layout puts them, at any width.
 *
 * Degradation is the reason the CSS rail is still here. It renders on the
 * server and holds the flow together with no JavaScript; once the connectors
 * have measured, it fades out and the SVG takes over. Nothing is lost if the
 * script never runs.
 *
 * Motion is the one animation spec §24 explicitly asks for ("system diagram
 * connections animating on entry"): the connectors draw themselves once, on
 * entry, and not at all under `prefers-reduced-motion` (spec §34).
 */

/** Corner radius where the distributor turns down into a card. */
const ELBOW = 6;
/**
 * Room above a parallel row for the distributor to run in.
 *
 * `sm:` only: below that breakpoint the cards stack into one column, no fan
 * is drawn, and the gutter would just be a gap with a bare rail through it.
 */
const FAN_GUTTER = "sm:pt-8";

type Segment = { id: string; d: string; kind: "spine" | "fan" };

function roundedElbow(fromX: number, y: number, toX: number, toY: number) {
  // Clamp so a tight column or a short gutter never produces a corner
  // larger than the run it has to turn inside of.
  const r = Math.max(0, Math.min(ELBOW, Math.abs(toX - fromX) / 2, (toY - y) / 2));
  if (r === 0) return `M ${fromX} ${y} L ${toX} ${y} L ${toX} ${toY}`;
  return `M ${fromX} ${y} L ${toX - r} ${y} A ${r} ${r} 0 0 1 ${toX} ${y + r} L ${toX} ${toY}`;
}

function FlowDiagram({
  stages,
  loopBackLabel,
}: {
  stages: readonly FlowStage[];
  /** Renders a "returns to the start" note, for cyclical flows. */
  loopBackLabel?: string;
}) {
  const containerRef = React.useRef<HTMLDivElement>(null);
  const markerRefs = React.useRef<(HTMLSpanElement | null)[]>([]);
  const loopRef = React.useRef<HTMLSpanElement>(null);
  const cardRefs = React.useRef<Map<string, HTMLDivElement>>(new Map());

  const [segments, setSegments] = React.useState<Segment[]>([]);
  const [size, setSize] = React.useState<{ w: number; h: number } | null>(null);

  const reduceMotion = useReducedMotion();
  const inView = useInView(containerRef, { once: true, margin: "-8% 0px" });

  React.useLayoutEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    function measure() {
      const root = containerRef.current;
      if (!root) return;

      const base = root.getBoundingClientRect();
      const box = (el: Element) => {
        const r = el.getBoundingClientRect();
        return {
          left: r.left - base.left,
          right: r.right - base.left,
          top: r.top - base.top,
          bottom: r.bottom - base.top,
          cx: r.left - base.left + r.width / 2,
          cy: r.top - base.top + r.height / 2,
        };
      };

      const next: Segment[] = [];
      const markers = markerRefs.current;

      // The spine: marker to marker down the rail, then on to the loop-back
      // note when the flow cycles.
      const rail = [...markers, loopRef.current].filter(
        (el): el is HTMLElement => Boolean(el),
      );
      for (let i = 0; i < rail.length - 1; i++) {
        const from = box(rail[i]);
        const to = box(rail[i + 1]);
        next.push({
          id: `spine-${i}`,
          kind: "spine",
          d: `M ${from.cx} ${from.bottom + 2} L ${to.cx} ${to.top - 2}`,
        });
      }

      // The fan: from each parallel stage's marker, a distributor that turns
      // down into the top of every card in that row.
      stages.forEach((stage, stageIndex) => {
        if (!stage.parallel) return;
        const marker = markers[stageIndex];
        if (!marker) return;

        const m = box(marker);
        const cards = stage.parallel
          .map((_, cardIndex) =>
            cardRefs.current.get(`${stageIndex}:${cardIndex}`),
          )
          .filter((el): el is HTMLDivElement => Boolean(el))
          .map(box);

        if (!cards.length) return;

        // Below `sm` the cards stack into one column directly beneath the
        // marker; there is no fan to draw, and the spine already covers it.
        const stacked = cards.every((c) => Math.abs(c.cx - cards[0].cx) < 1);
        if (stacked) return;

        let cursorX = m.right + 2;
        cards.forEach((card, cardIndex) => {
          next.push({
            id: `fan-${stageIndex}-${cardIndex}`,
            kind: "fan",
            d: roundedElbow(cursorX, m.cy, card.cx, card.top - 2),
          });
          cursorX = card.cx - ELBOW;
        });
      });

      setSegments(next);
      setSize({ w: base.width, h: base.height });
    }

    measure();

    const observer = new ResizeObserver(measure);
    observer.observe(container);
    // Cards reflow independently of the container when text rewraps.
    cardRefs.current.forEach((el) => observer.observe(el));

    return () => observer.disconnect();
  }, [stages, loopBackLabel]);

  const drawn = segments.length > 0;

  return (
    <div ref={containerRef} className="relative flex flex-col">
      {size && drawn ? (
        <svg
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 overflow-visible"
          width={size.w}
          height={size.h}
          fill="none"
        >
          {segments.map((segment, i) => {
            const shared = {
              d: segment.d,
              strokeWidth: 1,
              strokeLinecap: "round" as const,
              className:
                segment.kind === "fan"
                  ? "stroke-border-strong"
                  : "stroke-border-default",
            };

            if (reduceMotion) return <path key={segment.id} {...shared} />;

            return (
              <motion.path
                key={segment.id}
                {...shared}
                initial={{ pathLength: 0, opacity: 0 }}
                animate={
                  inView
                    ? { pathLength: 1, opacity: 1 }
                    : { pathLength: 0, opacity: 0 }
                }
                transition={{
                  duration: 0.38,
                  delay: i * 0.06,
                  ease: "easeOut",
                }}
              />
            );
          })}
        </svg>
      ) : null}

      <ol className="flex flex-col">
        {stages.map((stage, i) => {
          const isLast = i === stages.length - 1;
          // The rail runs past every step but the last one — unless the flow
          // loops, in which case it runs into the loop-back note.
          const railContinues = !isLast || Boolean(loopBackLabel);
          const tone = stage.parallel ? "default" : stage.node.tone;

          return (
            <li key={i} className="grid grid-cols-[auto_1fr] gap-x-4">
              <div className="flex flex-col items-center">
                <StepMarker
                  ref={(el) => {
                    markerRefs.current[i] = el;
                  }}
                  index={i + 1}
                  tone={tone}
                />
                {railContinues ? (
                  <span
                    aria-hidden="true"
                    className={cn(
                      "w-px flex-1 bg-border-default",
                      // The server-rendered fallback, retired once the
                      // measured connectors can take over. Opacity, not
                      // display, so the row's geometry never shifts.
                      drawn && "opacity-0",
                    )}
                  />
                ) : null}
              </div>

              <div
                className={cn(
                  "min-w-0",
                  railContinues && "pb-4",
                  // Room above the cards for the distributor to run.
                  stage.parallel && FAN_GUTTER,
                )}
              >
                {stage.parallel ? (
                  <ul className="grid gap-3 sm:grid-cols-3">
                    {stage.parallel.map((node, cardIndex) => (
                      <li key={node.label} className="flex">
                        {/* `h-full` only inside a grid: it makes the row of
                            cards align, and would otherwise fight the
                            auto height of a lone node. */}
                        <Node
                          {...node}
                          ref={(el) => {
                            const key = `${i}:${cardIndex}`;
                            if (el) cardRefs.current.set(key, el);
                            else cardRefs.current.delete(key);
                          }}
                          className="h-full w-full"
                        />
                      </li>
                    ))}
                  </ul>
                ) : (
                  <>
                    <Node {...stage.node} />
                    {stage.branch ? (
                      <p className="mt-2 flex flex-wrap items-center gap-2 rounded-md border border-dashed border-border-default bg-surface-muted/50 px-3 py-2 text-body-sm text-foreground-muted">
                        <span className="sr-only">If </span>
                        <Badge
                          variant="outline"
                          className="shrink-0 border-border-default bg-surface font-mono text-system uppercase"
                        >
                          {stage.branch.condition}
                        </Badge>
                        <ArrowRight
                          aria-hidden="true"
                          className="size-3.5 shrink-0 text-foreground-subtle"
                        />
                        <span>{stage.branch.outcome}</span>
                      </p>
                    ) : null}
                  </>
                )}
              </div>
            </li>
          );
        })}
      </ol>

      {loopBackLabel ? (
        <p className="grid grid-cols-[auto_1fr] items-start gap-x-4 text-body-sm text-foreground-muted">
          <span ref={loopRef} className="flex w-7 justify-center">
            <RotateCcw aria-hidden="true" className="size-4 text-accent" />
          </span>
          <span>{loopBackLabel}</span>
        </p>
      ) : null}
    </div>
  );
}

export { FlowDiagram };
