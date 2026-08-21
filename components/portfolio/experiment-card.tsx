import Link from "next/link";

import { Surface } from "@/components/system/surface";
import { StatusDot } from "@/components/system/status-dot";
import { cn } from "@/lib/utils";
import type { Experiment } from "@/content/experiments/experiments";

const STATUS_LABEL: Record<Experiment["status"], string> = {
  exploration: "Exploration",
  prototype: "Prototype",
  shipped: "Shipped",
};

/**
 * A small experiment card (spec §11 §4, §15).
 *
 * Status is stated in words on every card, so an in-progress exploration is
 * never mistaken for finished work.
 */
type ExperimentCardProps = {
  experiment: Experiment;
  href?: string;
  className?: string;
};

function ExperimentCard({ experiment, href = "/experiments", className }: ExperimentCardProps) {
  return (
    <Surface
      variant="interactive"
      className={cn("group flex flex-col gap-3 p-5", className)}
      render={<Link href={href} />}
    >
      <StatusDot
        status={experiment.status === "shipped" ? "available" : "neutral"}
        label={STATUS_LABEL[experiment.status]}
        className="font-mono text-system uppercase"
      />

      <h3 className="text-heading-md text-foreground">{experiment.title}</h3>

      {experiment.summary ? (
        <p className="text-body-sm text-foreground-muted">{experiment.summary}</p>
      ) : null}

      <ul className="mt-auto flex flex-wrap gap-x-2 gap-y-1 pt-2">
        {experiment.tags.map((tag) => (
          <li key={tag} className="text-body-sm text-foreground-muted">
            {tag}
          </li>
        ))}
      </ul>
    </Surface>
  );
}

export { ExperimentCard };
