import * as React from "react";
import { ArrowRight, ChevronDown } from "lucide-react";

import { SectionLabel } from "@/components/system/section-label";
import { cn } from "@/lib/utils";
import { Tag } from "@/components/system/tag";

/**
 * System diagrams (spec §13, §14, §34).
 *
 * Built from real HTML lists rather than images or ASCII, which is what makes
 * the acceptance criteria achievable:
 *
 * - **Textual equivalent** (spec §26): the structure IS text — an ordered or
 *   nested list that reads correctly in a screen reader. Connectors and
 *   chevrons are decorative and `aria-hidden`. Each diagram also carries a
 *   `description` rendered as a visible caption.
 * - **Readable on mobile** (spec §25): flows stack vertically at every width,
 *   so nothing shrinks illegibly or needs horizontal scrolling.
 * - **Motion**: none. Spec §24 permits animating connections on entry, but
 *   that needs client JS for no comprehension gain; revisit in Plan 008 polish
 *   if it earns its place.
 */

const nodeToneClasses = {
  default: "border-border-default bg-surface text-foreground",
  accent: "border-accent-muted bg-accent-soft text-accent-foreground",
  muted: "border-border-subtle bg-surface-muted text-foreground-muted",
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

function Node({ label, note, tone = "default" }: FlowNode) {
  return (
    <div
      className={cn(
        "rounded-sm border px-4 py-3 text-body-sm",
        nodeToneClasses[tone],
      )}
    >
      <span className="block font-medium">{label}</span>
      {note ? (
        <span className="mt-1 block text-body-sm text-foreground-muted">
          {note}
        </span>
      ) : null}
    </div>
  );
}

function Connector() {
  return (
    <div
      aria-hidden="true"
      className="flex flex-col items-center py-1 text-foreground-subtle"
    >
      <span className="h-3 w-px bg-border-default" />
      <ChevronDown className="size-3.5" />
    </div>
  );
}

/**
 * A top-to-bottom flow. Stages are ordered steps; a stage may fan out into
 * parallel nodes, and a step may carry a branch.
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
    <ol className="flex flex-col">
      {stages.map((stage, i) => (
        <li key={i} className="flex flex-col">
          {i > 0 ? <Connector /> : null}

          {stage.parallel ? (
            <ul className="grid gap-3 sm:grid-cols-3">
              {stage.parallel.map((node) => (
                <li key={node.label}>
                  <Node {...node} />
                </li>
              ))}
            </ul>
          ) : (
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:gap-4">
              <div className="sm:min-w-[280px]">
                <Node {...stage.node} />
              </div>
              {stage.branch ? (
                <p className="flex items-center gap-2 text-body-sm text-foreground-muted">
                  <span className="sr-only">If </span>
                  {/* A branch condition sits on the diagram's own surface,
                      so it keeps a stronger border than a page chip. */}
                  <Tag
                    tone="mono"
                    className="shrink-0 border-border-default bg-surface"
                  >
                    {stage.branch.condition}
                  </Tag>
                  <ArrowRight
                    aria-hidden="true"
                    className="size-3.5 shrink-0 text-foreground-subtle"
                  />
                  <span>{stage.branch.outcome}</span>
                </p>
              ) : null}
            </div>
          )}
        </li>
      ))}

      {loopBackLabel ? (
        <li className="mt-3 border-t border-dashed border-border-default pt-3 text-body-sm text-foreground-muted">
          {loopBackLabel}
        </li>
      ) : null}
    </ol>
  );
}

export type TreeNode = { label: string; children?: readonly TreeNode[] };

/** A containment hierarchy, e.g. what lives inside one Opportunity. */
function TreeDiagram({ root }: { root: TreeNode }) {
  return (
    <div className="flex flex-col gap-3">
      <Node label={root.label} tone="accent" />
      {root.children?.length ? (
        // Two columns from `sm` up: a flat list of ten children reads as one
        // record's contents, not a ten-step sequence, and halves the height.
        <ul className="ml-3 grid gap-2 border-l border-border-default pl-5 sm:grid-cols-2">
          {root.children.map((child) => (
            <li key={child.label} className="relative">
              <span
                aria-hidden="true"
                className="absolute -left-5 top-1/2 h-px w-4 bg-border-default sm:hidden"
              />
              <Node {...child} tone="default" />
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
      ) : null}
    </div>
  );
}

export type DiagramColumn = { title: string; body: string };

/** Competing forces side by side, e.g. student / teacher / institution. */
function ColumnsDiagram({ columns }: { columns: readonly DiagramColumn[] }) {
  return (
    <ul className="grid gap-4 sm:grid-cols-3">
      {columns.map((column) => (
        <li
          key={column.title}
          className="flex flex-col gap-2 rounded-sm border border-border-default bg-surface p-4"
        >
          <span className="font-mono text-system uppercase text-accent-foreground">
            {column.title}
          </span>
          <span className="text-body-sm text-foreground-muted">
            {column.body}
          </span>
        </li>
      ))}
    </ul>
  );
}

/**
 * The frame every diagram sits in. `description` is the plain-language
 * equivalent required by spec §26 and is shown to everyone, not hidden.
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
    <figure
      className={cn(
        "mt-8 rounded-lg border border-border-subtle bg-surface-muted/60 p-5 sm:p-6",
        className,
      )}
    >
      <SectionLabel className="mb-5">{title}</SectionLabel>
      {children}
      <figcaption className="mt-5 max-w-[68ch] border-t border-border-subtle pt-4 text-body-sm text-foreground-muted">
        {description}
      </figcaption>
    </figure>
  );
}

export { SystemDiagram, FlowDiagram, TreeDiagram, ColumnsDiagram };
