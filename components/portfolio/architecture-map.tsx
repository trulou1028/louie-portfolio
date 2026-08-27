"use client";

import * as React from "react";
import dynamic from "next/dynamic";

import { FlowDiagram } from "@/components/portfolio/flow-diagram";
import type { FlowStage } from "@/components/portfolio/diagram-primitives";
import {
  ARCHITECTURE_LAYERS,
  type ArchitectureLayer,
} from "@/content/work/offboard-architecture";
import { useMinWidth } from "@/lib/use-breakpoint";

/**
 * The architecture section, in whichever form the viewport can carry.
 *
 * Two representations of one graph (`content/work/offboard-architecture.ts`):
 *
 * - **The ordered list.** Server-rendered, always in the markup, and the only
 *   thing that renders without JavaScript or below `lg`. It is the same
 *   `FlowDiagram` every other system diagram uses, so the text equivalent
 *   spec §34 requires is not a special case written for this section — it is
 *   the section, whenever the canvas cannot be shown.
 * - **The interactive map.** Loaded only after mount, and only wide enough to
 *   hold it. A pannable viewport on a phone is precisely why React Flow is
 *   wrong for the other eight diagrams here; this one gets it because
 *   exploring the layers *is* the argument the section is making.
 *
 * The swap is a client decision rather than a CSS one on purpose: CSS would
 * leave both trees in the DOM, and a reader on a narrow screen would be
 * paying to download a canvas they will never see.
 */

const CANVAS_MIN_PX = 1024;

const ArchitectureCanvas = dynamic(
  () => import("@/components/portfolio/architecture-canvas"),
  // The list is already on screen and correct; there is nothing to show in
  // the meantime and a skeleton would only make the swap flicker.
  { ssr: false, loading: () => null },
);

/** The layers that run side by side, as one fanned-out stage in the list. */
const PARALLEL_IDS = ["models", "research", "documents"];

function toStages(layers: readonly ArchitectureLayer[]): FlowStage[] {
  const stages: FlowStage[] = [];
  let fanned = false;

  for (const layer of layers) {
    if (PARALLEL_IDS.includes(layer.id)) {
      if (fanned) continue;
      fanned = true;
      stages.push({
        parallel: PARALLEL_IDS.map((id) => {
          const parallelLayer = layers.find((l) => l.id === id)!;
          return { label: parallelLayer.label, note: parallelLayer.note };
        }),
      });
      continue;
    }

    stages.push({
      node: {
        label: layer.label,
        note: layer.note,
        tone: layer.emphasis ? "accent" : "default",
      },
    });
  }

  return stages;
}

function ArchitectureMap() {
  const isWide = useMinWidth(CANVAS_MIN_PX);

  // `useMinWidth` reports desktop before mount so the shell's server-rendered
  // pane tree hydrates cleanly. Here the safe pre-mount answer is the
  // opposite one — the list — so it gets its own gate.
  const [mounted, setMounted] = React.useState(false);
  React.useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setMounted(true);
  }, []);

  const stages = React.useMemo(() => toStages(ARCHITECTURE_LAYERS), []);

  if (mounted && isWide) return <ArchitectureCanvas />;

  return <FlowDiagram stages={stages} />;
}

export { ArchitectureMap };
