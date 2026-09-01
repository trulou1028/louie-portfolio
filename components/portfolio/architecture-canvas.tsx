"use client";

import * as React from "react";
import {
  Background,
  BackgroundVariant,
  Handle,
  Position,
  ReactFlow,
  type Edge,
  type Node,
  type NodeProps,
} from "@xyflow/react";
import { useReducedMotion } from "motion/react";

import "@xyflow/react/dist/style.css";

import { Badge } from "@/components/ui/badge";
import {
  ARCHITECTURE_LAYERS,
  ARCHITECTURE_LINKS,
  type ArchitectureLayer,
} from "@/content/work/offboard-architecture";
import { cn } from "@/lib/utils";

/**
 * The architecture section as an explorable map (React Flow).
 *
 * This is the one diagram in the portfolio that earns a canvas. It is the
 * case study's "I designed this and I built it" claim, so letting a reader
 * pick a layer and see what feeds it is the argument demonstrated rather than
 * asserted. Everywhere else, a canvas would cost the reflow and the text
 * equivalent for nothing.
 *
 * **What the interaction reveals is structure, not new facts.** Selecting a
 * layer highlights its edges and names what flows in and out — all of which
 * is derived from the graph in `content/work/offboard-architecture.ts`. There
 * is no per-layer copy here that the case study does not already state
 * (spec §29).
 *
 * Deliberately *not* a general-purpose canvas:
 *
 * - **No pan, no zoom, no scroll capture.** Spec §24 rules out scroll
 *   hijacking, and a diagram that swallows the page scroll on the way past is
 *   exactly that. `fitView` sizes it once; the reader never has to navigate
 *   it.
 * - **Rendered only where it fits.** Below `lg` the ordered list is what
 *   renders — see `architecture-map.tsx`. A pannable viewport on a phone is
 *   the failure mode that rules React Flow out for every other diagram here.
 * - **Keyboard-operable.** Nodes are real buttons in the graph's own order,
 *   so Tab walks the architecture top-down and Enter opens a layer.
 */

const NODE_WIDTH = 232;

type LayerNodeData = ArchitectureLayer & {
  selectedId: string | null;
  connectedIds: ReadonlySet<string>;
  onSelect: (id: string) => void;
  [key: string]: unknown;
};

type LayerNode = Node<LayerNodeData, "layer">;

function LayerNode({ data }: NodeProps<LayerNode>) {
  const { selectedId, connectedIds, onSelect } = data;
  const isSelected = selectedId === data.id;
  // Once something is selected, everything unrelated recedes rather than
  // disappearing — the shape of the whole system stays readable.
  const isDimmed =
    selectedId !== null && !isSelected && !connectedIds.has(data.id);

  return (
    <>
      {[Position.Top, Position.Bottom, Position.Left, Position.Right].map(
        (position) => (
          <React.Fragment key={position}>
            <Handle
              type="target"
              id={position}
              position={position}
              className="!size-0 !min-h-0 !min-w-0 !border-0 !bg-transparent"
            />
            <Handle
              type="source"
              id={position}
              position={position}
              className="!size-0 !min-h-0 !min-w-0 !border-0 !bg-transparent"
            />
          </React.Fragment>
        ),
      )}

      <button
        type="button"
        onClick={() => onSelect(data.id)}
        aria-pressed={isSelected}
        style={{ width: NODE_WIDTH }}
        className={cn(
          // React Flow drops `pointer-events` on nodes once they are neither
          // draggable, selectable, nor connectable — which is exactly how
          // this canvas is configured, since it owns its own selection. The
          // button has to opt back in or every click lands on the pane
          // behind it.
          "pointer-events-auto block rounded-md border px-4 py-3 text-left transition-[opacity,border-color,background-color] duration-standard focus-ring",
          // Emphasis and selection are now one scale rather than two
          // different devices: a muted accent ring marks an important node,
          // and selecting it brightens that same ring to full accent. The
          // emphasised node used to carry an accent bar down its left edge
          // instead (owner decision, 2026-08-31 — that treatment had become
          // a visual cliché). `isSelected` still wins by ordering.
          data.emphasis
            ? "border-accent-muted bg-accent-soft"
            : "border-border-default bg-surface",
          isSelected && "border-accent bg-accent-soft",
          isDimmed && "opacity-40",
        )}
      >
        <span className="block text-body-sm font-medium text-foreground">
          {data.label}
        </span>
        {data.note ? (
          <span className="mt-1 block text-body-sm text-foreground-muted">
            {data.note}
          </span>
        ) : null}
      </button>
    </>
  );
}

const nodeTypes = { layer: LayerNode };

function ArchitectureCanvas() {
  const [selectedId, setSelectedId] = React.useState<string | null>(null);
  const reduceMotion = useReducedMotion();

  const selected = ARCHITECTURE_LAYERS.find((l) => l.id === selectedId) ?? null;

  const inputs = ARCHITECTURE_LINKS.filter((l) => l.to === selectedId);
  const outputs = ARCHITECTURE_LINKS.filter((l) => l.from === selectedId);

  const connectedIds = React.useMemo(() => {
    if (!selectedId) return new Set<string>();
    const ids = new Set<string>();
    for (const link of ARCHITECTURE_LINKS) {
      if (link.from === selectedId) ids.add(link.to);
      if (link.to === selectedId) ids.add(link.from);
    }
    return ids;
  }, [selectedId]);

  const onSelect = React.useCallback((id: string) => {
    setSelectedId((current) => (current === id ? null : id));
  }, []);

  const nodes: LayerNode[] = React.useMemo(
    () =>
      ARCHITECTURE_LAYERS.map((layer) => ({
        id: layer.id,
        type: "layer" as const,
        position: layer.position,
        draggable: false,
        connectable: false,
        selectable: false,
        data: { ...layer, selectedId, connectedIds, onSelect },
      })),
    [selectedId, connectedIds, onSelect],
  );

  const edges: Edge[] = React.useMemo(
    () =>
      ARCHITECTURE_LINKS.map((link) => {
        const touched =
          selectedId !== null &&
          (link.from === selectedId || link.to === selectedId);
        const dimmed = selectedId !== null && !touched;

        return {
          id: `${link.from}-${link.to}`,
          source: link.from,
          target: link.to,
          // The two loop edges leave and arrive on the sides so they route
          // around the spine instead of straight through it.
          sourceHandle: link.side
            ? link.side === "right"
              ? Position.Right
              : Position.Left
            : Position.Bottom,
          targetHandle: link.side
            ? link.side === "right"
              ? Position.Right
              : Position.Left
            : Position.Top,
          type: "smoothstep",
          // Only the selected layer's edges animate, and never under
          // reduced motion (spec §34).
          animated: touched && !reduceMotion,
          style: {
            stroke: touched
              ? "hsl(var(--accent))"
              : "hsl(var(--border-strong))",
            strokeWidth: touched ? 1.5 : 1,
            opacity: dimmed ? 0.3 : 1,
          },
        };
      }),
    [selectedId, reduceMotion],
  );

  return (
    <div>
      <div
        className="h-[660px] w-full"
        // Escape clears the selection, the way any transient overlay should.
        onKeyDown={(event) => {
          if (event.key === "Escape") setSelectedId(null);
        }}
      >
        <ReactFlow
          nodes={nodes}
          edges={edges}
          nodeTypes={nodeTypes}
          fitView
          fitViewOptions={{ padding: 0.08 }}
          // Not a canvas to navigate: no pan, no zoom, and — the one that
          // matters most — no capturing the page's scroll on the way past
          // (spec §24 rules out scroll hijacking).
          panOnDrag={false}
          panOnScroll={false}
          zoomOnScroll={false}
          zoomOnPinch={false}
          zoomOnDoubleClick={false}
          preventScrolling={false}
          nodesDraggable={false}
          nodesConnectable={false}
          elementsSelectable={false}
          // The buttons inside the nodes are the tab stops; React Flow's own
          // focusable node wrappers would double every one of them.
          nodesFocusable={false}
          edgesFocusable={false}
          // Selection, focus and Escape are all handled here, so React Flow's
          // own keyboard layer would only announce into a second live region
          // and add key bindings this diagram does not have.
          disableKeyboardA11y
          proOptions={{ hideAttribution: false }}
          onPaneClick={() => setSelectedId(null)}
          className="[&_.react-flow\_\_pane]:cursor-default"
        >
          <Background
            variant={BackgroundVariant.Dots}
            gap={20}
            size={1}
            className="[&_circle]:fill-border-subtle"
          />
        </ReactFlow>
      </div>

      {/* The detail panel. `aria-live` so a keyboard user hears the layer
          they just opened without having to go looking for this region. */}
      <div
        data-slot="layer-detail"
        aria-live="polite"
        className="mt-4 rounded-md border border-border-subtle bg-surface-muted/60 px-4 py-3"
      >
        {selected ? (
          <div className="flex flex-col gap-2">
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-body-sm font-medium text-foreground">
                {selected.label}
              </span>
              {selected.note ? (
                <Badge
                  variant="outline"
                  className="border-border-default bg-surface font-mono text-system"
                >
                  {selected.note}
                </Badge>
              ) : null}
            </div>

            <p className="text-body-sm text-foreground-muted">
              {selected.role}
            </p>

            <dl className="flex flex-col gap-1 text-body-sm text-foreground-muted sm:flex-row sm:gap-8">
              <div className="flex gap-2">
                <dt className="font-mono text-system uppercase">In</dt>
                <dd>{labelsFor(inputs.map((l) => l.from))}</dd>
              </div>
              <div className="flex gap-2">
                <dt className="font-mono text-system uppercase">Out</dt>
                <dd>{labelsFor(outputs.map((l) => l.to))}</dd>
              </div>
            </dl>
          </div>
        ) : (
          <p className="text-body-sm text-foreground-muted">
            Select a layer to see what feeds it and what it feeds.
          </p>
        )}
      </div>
    </div>
  );
}

function labelsFor(ids: readonly string[]) {
  if (!ids.length) return "Nothing in this diagram";
  return ids
    .map((id) => ARCHITECTURE_LAYERS.find((l) => l.id === id)?.label ?? id)
    .join(", ");
}

export { ArchitectureCanvas };
export default ArchitectureCanvas;
