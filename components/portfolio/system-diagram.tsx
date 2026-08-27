import * as React from "react";
import { ArrowRight, RotateCcw } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { SectionLabel } from "@/components/system/section-label";
import { cn } from "@/lib/utils";

/**
 * System diagrams (spec §13, §14, §34).
 *
 * Built from real HTML lists rather than images or ASCII, which is what makes
 * the acceptance criteria achievable:
 *
 * - **Textual equivalent** (spec §26): the structure IS text — an ordered or
 *   nested list that reads correctly in a screen reader. The rail, the step
 *   numbers, and the chevrons are decorative and `aria-hidden`. Each diagram
 *   also carries a `description` rendered as a visible caption.
 * - **Readable on mobile** (spec §25): flows stack vertically at every width,
 *   so nothing shrinks illegibly or needs horizontal scrolling.
 * - **Motion**: none. Spec §24 permits animating connections on entry, but
 *   that needs client JS for no comprehension gain; revisit in Plan 008 polish
 *   if it earns its place.
 *
 * The presentation layer is shadcn's `Card` and `Badge` (2026-08-27), which
 * is what turned a stack of bordered `div`s into a numbered rail: the step
 * markers are badges, every node is a card, and the tone variants ride the
 * portfolio's accent tokens rather than shadcn's neutral defaults. The
 * component API is unchanged, so no case study copy moved to get here.
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

type NodeTone = keyof typeof nodeToneClasses;

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

function Node({ label, note, tone = "default", className }: FlowNode & {
  className?: string;
}) {
  return (
    <Card
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
function StepMarker({ index, tone = "default" }: { index: number; tone?: NodeTone }) {
  return (
    <span
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

/**
 * A top-to-bottom flow. Stages are ordered steps threaded onto a single rail;
 * a stage may fan out into parallel nodes, and a step may carry a branch.
 */
function FlowDiagram({
  stages,
  loopBackLabel,
}: {
  stages: readonly FlowStage[];
  /** Renders a "returns to the start" note, for cyclical flows. */
  loopBackLabel?: string;
}) {
  return (
    <div className="flex flex-col">
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
                <StepMarker index={i + 1} tone={tone} />
                {railContinues ? (
                  <span
                    aria-hidden="true"
                    className="w-px flex-1 bg-border-default"
                  />
                ) : null}
              </div>

              <div className={cn("min-w-0", railContinues && "pb-4")}>
                {stage.parallel ? (
                  <ul className="grid gap-3 sm:grid-cols-3">
                    {stage.parallel.map((node) => (
                      <li key={node.label} className="flex">
                        {/* `h-full` only inside a grid: it makes the row of
                            cards align, and would otherwise fight the
                            auto height of a lone node. */}
                        <Node {...node} className="h-full w-full" />
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
          <RotateCcw
            aria-hidden="true"
            className="size-4 translate-x-1.5 text-accent"
          />
          <span>{loopBackLabel}</span>
        </p>
      ) : null}
    </div>
  );
}

export type TreeNode = { label: string; children?: readonly TreeNode[] };

/** A containment hierarchy, e.g. what lives inside one Opportunity. */
function TreeDiagram({ root }: { root: TreeNode }) {
  return (
    /* The dividing rule sits on the content, not the header: shadcn's
       `CardHeader` grows its bottom padding to 24px whenever it carries a
       `border-b`, which reads as dead space under a one-line label. */
    <Card className="gap-0 overflow-hidden rounded-lg border-border-default bg-surface py-0 shadow-none">
      <CardHeader className="flex bg-accent-soft px-5 py-4">
        <span className="font-mono text-label uppercase text-accent">
          {root.label}
        </span>
      </CardHeader>

      {root.children?.length ? (
        <CardContent className="border-t border-border-subtle px-5 py-5">
          {/* Two columns from `sm` up: a flat list of ten children reads as
              one record's contents, not a ten-step sequence, and halves the
              height. */}
          <ul className="grid gap-2 sm:grid-cols-2">
            {root.children.map((child) => (
              <li key={child.label}>
                <span className="flex items-center gap-2.5 rounded-sm border border-border-subtle bg-surface-muted/60 px-3 py-2 text-body-sm text-foreground">
                  <span
                    aria-hidden="true"
                    className="size-1.5 shrink-0 rounded-full bg-accent"
                  />
                  {child.label}
                </span>
                {child.children?.length ? (
                  <ul className="ml-3 mt-2 flex flex-col gap-2 border-l border-border-subtle pl-5">
                    {child.children.map((leaf) => (
                      <li key={leaf.label}>
                        <Node {...leaf} tone="muted" />
                      </li>
                    ))}
                  </ul>
                ) : null}
              </li>
            ))}
          </ul>
        </CardContent>
      ) : null}
    </Card>
  );
}

export type DiagramColumn = { title: string; body: string };

/** Competing forces side by side, e.g. student / teacher / institution. */
function ColumnsDiagram({ columns }: { columns: readonly DiagramColumn[] }) {
  return (
    <ul className="grid gap-4 sm:grid-cols-3">
      {columns.map((column) => (
        <li key={column.title}>
          <Card className="h-full gap-3 rounded-lg border-border-default bg-surface py-5 shadow-none">
            <CardHeader className="flex px-5">
              <Badge
                variant="outline"
                className="border-accent-muted bg-accent-soft font-mono text-system uppercase text-accent"
              >
                {column.title}
              </Badge>
            </CardHeader>
            <CardContent className="px-5 text-body-sm text-foreground-muted">
              {column.body}
            </CardContent>
          </Card>
        </li>
      ))}
    </ul>
  );
}

/**
 * The frame every diagram sits in. `description` is the plain-language
 * equivalent required by spec §26 and is shown to everyone, not hidden — it
 * sits below the frame as a `figcaption`, matching `ArtifactFrame`, because
 * a `figcaption` has to be a direct child of its `figure`.
 */
function SystemDiagram({
  title,
  description,
  children,
  className,
}: {
  title: string;
  description: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <figure className={cn("mt-8", className)}>
      <Card className="gap-0 rounded-lg border-border-subtle bg-surface-muted/60 py-0 shadow-none">
        <CardHeader className="flex px-5 py-4 sm:px-6">
          <SectionLabel>{title}</SectionLabel>
        </CardHeader>
        <CardContent className="border-t border-border-subtle px-5 py-5 sm:px-6 sm:py-6">
          {children}
        </CardContent>
      </Card>
      <figcaption className="mt-3 max-w-[68ch] text-body-sm text-foreground-muted">
        {description}
      </figcaption>
    </figure>
  );
}

export { SystemDiagram, FlowDiagram, TreeDiagram, ColumnsDiagram };
