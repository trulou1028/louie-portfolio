"use client";

import { Check, Loader2, TriangleAlert } from "lucide-react";

import { cn } from "@/lib/utils";

/**
 * What the assistant is doing, in plain language (spec §21).
 *
 * Meaningful states only — "Searching portfolio", "Found 4 relevant
 * examples", "Opening Offboard". Never chain-of-thought: spec §21 is explicit
 * that reasoning is not shown.
 */
type ToolStatusProps = {
  label: string;
  state: "running" | "done" | "error";
  className?: string;
};

function ToolStatus({ label, state, className }: ToolStatusProps) {
  const Icon = state === "running" ? Loader2 : state === "done" ? Check : TriangleAlert;

  return (
    <p
      className={cn(
        "flex items-center gap-2 font-mono text-system uppercase",
        state === "error" ? "text-danger" : "text-foreground-muted",
        className,
      )}
    >
      <Icon
        aria-hidden="true"
        className={cn("size-3.5", state === "running" && "animate-spin")}
      />
      {label}
    </p>
  );
}

export { ToolStatus };
