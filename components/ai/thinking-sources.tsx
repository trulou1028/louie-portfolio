"use client";

/**
 * The card stack in Ask Louie's thinking state and the job-description
 * wait (Plan 043). Phase and source logic: `lib/ai/thinking-state.ts`.
 */
import * as React from "react";
import Image from "next/image";
import { AnimatePresence, LayoutGroup, motion, useReducedMotion } from "motion/react";

import { SOURCES, type SourceKey } from "@/lib/ai/thinking-state";
import { cn } from "@/lib/utils";

type Source = (typeof SOURCES)[number];

/** One source's card: a crop of the work on its plate color. */
function Thumb({ source, small }: { source: Source; small: boolean }) {
  return (
    <motion.span
      layout
      className={cn(
        "relative block shrink-0 overflow-hidden rounded-xs border border-foreground/15",
        small ? "h-5 w-7" : "h-7 w-10 shadow-[0_3px_8px_-3px_hsl(var(--foreground)/0.35)]",
        source.tone,
      )}
    >
      {source.image ? (
        <Image src={source.image} alt="" fill sizes="80px" className="object-cover object-left-top" />
      ) : (
        // The resume has no screenshot: a small page of text lines.
        <span className="flex h-full flex-col justify-center gap-[3px] px-1.5">
          <span className="h-px w-3/4 bg-foreground-subtle" />
          <span className="h-px w-full bg-border-strong" />
          <span className="h-px w-5/6 bg-border-strong" />
        </span>
      )}
    </motion.span>
  );
}

/** Each card's lean in the stack, back to front. */
const TILT = [-8, -4, 0, 4, 7];
const DEAL_MS = 560;

/**
 * The cards. `dealing`: a stack, the back card moving to the front every
 * {@link DEAL_MS}. Otherwise, the `found` sources as labeled chips.
 * Decorative: the status line beside it carries the words. Under reduced
 * motion the stack stays still and the change is a plain swap.
 */
export function SourceStack({
  found = [],
  dealing,
  className,
}: {
  found?: readonly SourceKey[];
  dealing: boolean;
  className?: string;
}) {
  const reduced = useReducedMotion();
  const [order, setOrder] = React.useState<SourceKey[]>(() => SOURCES.map((source) => source.key));
  const open = !dealing && found.length > 0;

  React.useEffect(() => {
    if (!dealing || reduced) return;
    const timer = window.setInterval(() => setOrder((current) => [...current.slice(1), current[0]]), DEAL_MS);
    return () => window.clearInterval(timer);
  }, [dealing, reduced]);

  const spring = reduced ? { duration: 0 } : { type: "spring" as const, stiffness: 380, damping: 30 };

  return (
    <LayoutGroup>
      <ul
        aria-hidden="true"
        className={cn(open ? "flex flex-wrap items-center gap-1.5" : "relative h-11 w-20", className)}
      >
        <AnimatePresence initial={false}>
          {SOURCES.filter((source) => !open || found.includes(source.key)).map((source) => {
            const depth = order.indexOf(source.key);
            return open ? (
              <motion.li
                key={source.key}
                layout
                initial={false}
                animate={{ x: 0, y: 0, rotate: 0 }}
                transition={spring}
                style={{ zIndex: 0 }}
                className="flex h-7 items-center gap-1.5 rounded-sm border border-border-default bg-surface pl-[3px] pr-2.5"
              >
                <Thumb source={source} small />
                <motion.span
                  initial={reduced ? false : { opacity: 0, x: -4 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.22, delay: 0.12 }}
                  className="whitespace-nowrap text-label font-medium tracking-normal text-foreground"
                >
                  {source.label}
                </motion.span>
              </motion.li>
            ) : (
              <motion.li
                key={source.key}
                layout
                initial={false}
                animate={{ x: depth * 9, rotate: TILT[depth], y: depth === SOURCES.length - 1 ? -2 : 0 }}
                exit={{ opacity: 0, scale: 0.8, transition: { duration: 0.16 } }}
                transition={spring}
                style={{ zIndex: depth }}
                className="absolute left-0 top-2"
              >
                <Thumb source={source} small={false} />
              </motion.li>
            );
          })}
        </AnimatePresence>
      </ul>
    </LayoutGroup>
  );
}
