"use client";

import * as React from "react";
import { motion } from "motion/react";

import { useReducedMotionSafe } from "@/components/portfolio/lumo/use-play";
import { cn } from "@/lib/utils";

/**
 * The money switch (`profiles.allow_financial_context`), to try. One
 * setting controls every money fact LUMO reads. With it off, LUMO keeps
 * only the company and title of each offer, so it can still say an offer
 * exists. The labels follow `documentation/ai/lumo-runtime.md`.
 */
const FACTS = [
  { label: "Financial runway", money: true },
  { label: "Weekly unemployment benefit", money: true },
  { label: "Target salary range", money: true },
  { label: "Offer terms: amount, notes, reply-by date", money: true },
  { label: "Each offer’s company and title", money: false },
] as const;

export function MoneySwitch() {
  const [on, setOn] = React.useState(true);
  const reduce = useReducedMotionSafe();

  return (
    <div className="flex flex-col gap-5">
      <button
        type="button"
        role="switch"
        aria-checked={on}
        onClick={() => setOn((value) => !value)}
        className="focus-ring flex w-fit items-center gap-3 rounded-full border border-border-default py-1.5 pl-1.5 pr-4 text-body-sm text-foreground"
      >
        <span className={cn("flex h-6 w-11 items-center rounded-full p-0.5 transition-colors duration-(--duration-standard)", on ? "justify-end bg-plate-offboard-mark" : "justify-start bg-border-default")}>
          <motion.span layout={!reduce} transition={{ type: "spring", stiffness: 500, damping: 32 }} className="size-5 rounded-full bg-canvas" />
        </span>
        Let LUMO use my money details
      </button>

      <ul aria-live="polite" className="flex flex-col divide-y divide-border-subtle rounded-lg border border-border-subtle bg-surface">
        {FACTS.map((fact) => {
          const read = on || !fact.money;
          return (
            <li key={fact.label} className="flex items-center justify-between gap-4 px-4 py-3">
              <span className={cn("text-body-sm transition-[color,opacity] duration-(--duration-standard)", read ? "text-foreground" : "text-foreground-muted line-through opacity-60")}>{fact.label}</span>
              <span className={cn("shrink-0 font-mono text-system uppercase", read ? "text-plate-offboard-mark" : "text-foreground-muted")}>{read ? "LUMO reads" : "Hidden"}</span>
            </li>
          );
        })}
      </ul>
      <p className="text-body-sm text-foreground-muted">Connected AI agents never read offers, whatever the switch says. A database rule returns them no offer rows.</p>
    </div>
  );
}
