import { MotionReveal } from "@/components/portfolio/motion-reveal";
import Image from "next/image";
import { Tag } from "@/components/system/tag";
import { InlineLink } from "@/components/system/inline-link";
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
    <MotionReveal className={className}>
    <Surface
      variant="interactive"
      className={cn("group flex flex-col gap-2.5 p-5")}
      render={<Link href={href} />}
    >
      {experiment.image ? <Image src={experiment.image.src} alt={experiment.image.alt} width={experiment.image.width} height={experiment.image.height} sizes="(min-width: 1024px) 1040px, 90vw" className="mb-4 h-auto w-full rounded-sm border border-border-subtle" /> : null}
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
            <Tag>{tag}</Tag>
          </li>
        ))}
      </ul>
    </Surface>
    {experiment.demoUrl ? <p className="mt-3 text-body-sm"><InlineLink href={experiment.demoUrl}>Try the simulated demo</InlineLink></p> : null}
    </MotionReveal>
  );
}

export { ExperimentCard };
