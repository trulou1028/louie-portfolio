"use client";

import * as React from "react";
import { AnimatePresence, motion, useInView } from "motion/react";
import { Bot, X } from "lucide-react";

import { useReducedMotionSafe } from "@/components/portfolio/lumo/use-play";
import { cn } from "@/lib/utils";

/**
 * The LUMO panel rule (plan 370), as a wireframe to try. "Ask LUMO" opens
 * LUMO beside the page, and the page stays where it was. Wide screens get a
 * panel; small screens get a sheet over the page. The "Looking at" line is
 * the spec's own example.
 *
 * A wireframe, not a screenshot: blocks stand for page content. It opens
 * once by itself when it scrolls into view, so the motion is seen.
 */
const LOOKING_AT = "Looking at: Lyft · Product Design Manager";

function PageBlocks({ compact }: { compact: boolean }) {
  return (
    <div aria-hidden="true" className="flex min-w-0 flex-1 flex-col gap-3 p-4">
      <span className="text-body-sm font-semibold text-foreground">Lyft · Product Design Manager</span>
      <span className="h-2 w-2/3 rounded-full bg-foreground/15" />
      <div className={cn("mt-2 grid gap-2", compact ? "grid-cols-1" : "grid-cols-2")}>
        {[0, 1, 2, 3].slice(0, compact ? 2 : 4).map((i) => (
          <span key={i} className="flex h-16 flex-col gap-2 rounded-sm border border-border-subtle p-3">
            <span className="h-2 w-1/2 rounded-full bg-foreground/20" />
            <span className="h-2 w-3/4 rounded-full bg-foreground/10" />
          </span>
        ))}
      </div>
    </div>
  );
}

function LumoBody({ onClose }: { onClose: () => void }) {
  return (
    <div className="flex h-full flex-col gap-3 p-4">
      <div className="flex items-center justify-between">
        <span className="font-mono text-system uppercase text-foreground">LUMO</span>
        <button type="button" onClick={onClose} aria-label="Close LUMO" className="focus-ring rounded-xs text-foreground-muted hover:text-foreground">
          <X aria-hidden="true" className="size-4" />
        </button>
      </div>
      <p className="rounded-xs bg-plate-offboard-mark/15 px-2 py-1 text-system font-medium text-plate-offboard-mark">{LOOKING_AT}</p>
      <span aria-hidden="true" className="flex flex-col gap-2">
        <span className="h-7 rounded-full border border-border-subtle" />
        <span className="h-7 w-10/12 rounded-full border border-border-subtle" />
      </span>
      <span aria-hidden="true" className="mt-auto h-9 rounded-field border border-border-default" />
    </div>
  );
}

export function PanelDemo() {
  const ref = React.useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: "-20% 0px" });
  const reduce = useReducedMotionSafe();
  const [open, setOpen] = React.useState(false);
  const [wide, setWide] = React.useState(true);

  // Open once, by itself, the first time the frame is in view.
  React.useEffect(() => {
    if (!inView) return;
    const timer = window.setTimeout(() => setOpen(true), reduce ? 0 : 700);
    return () => window.clearTimeout(timer);
  }, [inView, reduce]);

  const spring = reduce ? { duration: 0 } : { type: "spring" as const, stiffness: 260, damping: 30 };

  return (
    <div ref={ref} className="flex flex-col gap-4">
      <div role="group" aria-label="Screen size" className="flex gap-2">
        {[["Wide screen", true], ["Small screen", false]].map(([label, value]) => (
          <button
            key={String(label)}
            type="button"
            aria-pressed={wide === value}
            onClick={() => setWide(value as boolean)}
            className="focus-ring rounded-full border border-border-default px-3.5 py-1.5 font-mono text-system uppercase text-foreground-muted aria-pressed:border-foreground aria-pressed:bg-foreground aria-pressed:text-canvas"
          >
            {label as string}
          </button>
        ))}
      </div>

      <motion.div
        layout={!reduce}
        transition={spring}
        className={cn("relative mx-auto flex h-72 w-full flex-col overflow-hidden rounded-lg border border-border-default bg-canvas", wide ? "max-w-none" : "max-w-[18rem]")}
      >
        <div className="flex h-11 shrink-0 items-center justify-between border-b border-border-subtle px-3">
          <span aria-hidden="true" className="h-2 w-16 rounded-full bg-foreground/20" />
          <button
            type="button"
            aria-pressed={open}
            onClick={() => setOpen((value) => !value)}
            className="focus-ring flex items-center gap-1.5 rounded-full border border-border-default px-3 py-1 text-system font-medium text-foreground hover:bg-surface-raised"
          >
            <Bot aria-hidden="true" className="size-3.5" />
            Ask LUMO
          </button>
        </div>
        <div className="relative flex min-h-0 flex-1">
          {wide ? <span aria-hidden="true" className="w-24 shrink-0 border-r border-border-subtle" /> : null}
          <PageBlocks compact={!wide || open} />
          <AnimatePresence initial={false}>
            {open && wide ? (
              <motion.aside
                key="panel"
                aria-label="LUMO panel"
                initial={{ width: 0, opacity: 0 }}
                animate={{ width: 224, opacity: 1 }}
                exit={{ width: 0, opacity: 0 }}
                transition={spring}
                className="shrink-0 overflow-hidden border-l border-border-subtle bg-surface"
              >
                <div className="w-56"><LumoBody onClose={() => setOpen(false)} /></div>
              </motion.aside>
            ) : null}
            {open && !wide ? (
              <motion.aside
                key="sheet"
                aria-label="LUMO sheet"
                initial={{ x: "100%" }}
                animate={{ x: 0 }}
                exit={{ x: "100%" }}
                transition={spring}
                className="absolute inset-y-0 right-0 w-[85%] border-l border-border-default bg-surface shadow-xl"
              >
                <LumoBody onClose={() => setOpen(false)} />
              </motion.aside>
            ) : null}
          </AnimatePresence>
        </div>
      </motion.div>
      <p className="text-body-sm text-foreground-muted" aria-live="polite">
        {open ? (wide ? "LUMO opens as a panel beside the page. The page stays in place." : "Below 1280px, LUMO opens as a sheet over the page, with the same conversation.") : "Press Ask LUMO to open it beside the page."}
      </p>
    </div>
  );
}
