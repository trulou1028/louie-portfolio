import * as React from "react";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Node } from "@/components/portfolio/diagram-primitives";
import { FlowDiagram } from "@/components/portfolio/flow-diagram";
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
 *   numbers, and the drawn connectors are decorative and `aria-hidden`. Each
 *   diagram also carries a `description` rendered as a visible caption.
 * - **Readable on mobile** (spec §25): flows stack vertically at every width,
 *   so nothing shrinks illegibly or needs horizontal scrolling.
 *
 * The presentation layer is shadcn's `Card` and `Badge` (2026-08-27): step
 * markers are badges, every node is a card, and the tone variants ride the
 * portfolio's accent tokens rather than shadcn's neutral defaults. The
 * component API is unchanged from the hand-rolled version, so no case study
 * copy moved to get here.
 *
 * `FlowDiagram` lives in its own client module because it measures the laid
 * out DOM to draw its connectors — see `flow-diagram.tsx`. `TreeDiagram`,
 * `ColumnsDiagram` and this frame stay server components.
 */

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
export type {
  FlowNode,
  FlowStage,
  NodeTone,
} from "@/components/portfolio/diagram-primitives";
