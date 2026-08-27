import * as React from "react";

import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";

/**
 * The pieces every diagram is built from.
 *
 * These live apart from `system-diagram.tsx` so `FlowDiagram` — which is a
 * client component, because its connector layer measures the laid-out DOM —
 * can share them with the server-rendered `TreeDiagram` and `ColumnsDiagram`
 * without dragging those into the client bundle too.
 */

const nodeToneClasses = {
  default: "border-border-default bg-surface text-foreground",
  // The accent node is where a reader's eye should land first: an accent
  // left edge does that without the fill fighting the text on it.
  accent:
    "border-accent-muted border-l-2 border-l-accent bg-accent-soft text-foreground",
  muted: "border-border-subtle bg-surface-muted text-foreground-muted",
} as const;

const markerToneClasses = {
  default: "border-border-default bg-surface text-foreground-muted",
  accent: "border-accent-muted bg-accent-soft text-accent",
  muted: "border-border-subtle bg-surface-muted text-foreground-subtle",
} as const;

export type NodeTone = keyof typeof nodeToneClasses;

export type FlowNode = {
  label: string;
  /** Optional qualifier shown beneath the label. */
  note?: string;
  tone?: NodeTone;
};

export type FlowStage =
  | {
      node: FlowNode;
      /** A branch off this step, e.g. "No → warn or pause". */
      branch?: { condition: string; outcome: string };
      parallel?: never;
    }
  | { parallel: FlowNode[]; node?: never; branch?: never };

function Node({
  label,
  note,
  tone = "default",
  className,
  ref,
}: FlowNode & {
  className?: string;
  ref?: React.Ref<HTMLDivElement>;
}) {
  return (
    <Card
      ref={ref}
      className={cn(
        // A node is a dense card by design (AGENTS.md "Card anatomy"): it
        // holds one label and at most one qualifier, so the standard `p-5`
        // would read as an empty box with a word in it.
        "gap-0 rounded-md border py-3 shadow-none",
        nodeToneClasses[tone],
        className,
      )}
    >
      <CardContent className="px-4">
        <span className="block text-body-sm font-medium">{label}</span>
        {note ? (
          <span className="mt-1 block text-body-sm text-foreground-muted">
            {note}
          </span>
        ) : null}
      </CardContent>
    </Card>
  );
}

/** The numbered dot on the rail. Decorative — the `<ol>` carries the order. */
function StepMarker({
  index,
  tone = "default",
  ref,
}: {
  index: number;
  tone?: NodeTone;
  ref?: React.Ref<HTMLSpanElement>;
}) {
  return (
    <span
      ref={ref}
      aria-hidden="true"
      className={cn(
        "flex size-7 shrink-0 items-center justify-center rounded-full border font-mono text-system",
        markerToneClasses[tone],
      )}
    >
      {index}
    </span>
  );
}

export { Node, StepMarker, nodeToneClasses, markerToneClasses };
