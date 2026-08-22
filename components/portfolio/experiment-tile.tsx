import Link from "next/link";
import { AudioLines, Boxes, Code2, UserCheck } from "lucide-react";

import { Surface } from "@/components/system/surface";
import { cn } from "@/lib/utils";
import type { Experiment } from "@/content/experiments/experiments";

const TILE_ICONS: Record<string, React.ComponentType<{ className?: string }>> = {
  "voice-tool-calling": AudioLines,
  "human-in-the-loop": UserCheck,
  "agent-interface-patterns": Boxes,
  "design-engineering": Code2,
};

/**
 * The small icon tile used in the contextual rail (spec §10, §11 §4).
 *
 * Title only — these are explorations, and the cards on `/experiments` carry
 * the status wording. Nothing here should imply finished work.
 */
function ExperimentTile({
  experiment,
  className,
}: {
  experiment: Experiment;
  className?: string;
}) {
  const Icon = TILE_ICONS[experiment.slug] ?? Boxes;

  return (
    <Surface
      variant="interactive"
      className={cn(
        "group flex flex-col items-center gap-2 px-2 py-3.5 text-center",
        className,
      )}
      render={<Link href="/experiments" />}
    >
      <Icon aria-hidden="true" className="size-4 text-foreground-muted" />
      <span className="text-body-sm leading-snug text-foreground">
        {experiment.title}
      </span>
    </Surface>
  );
}

export { ExperimentTile };
