import Link from "next/link";
import { ArrowUpRight } from "lucide-react";

import { Surface } from "@/components/system/surface";
import { SystemLabel } from "@/components/system/system-label";
import { cn } from "@/lib/utils";

/**
 * A pointer to a specific piece of evidence (spec §16.2, §34).
 *
 * Used statically inside case studies today; Plan 006 renders the same
 * component from AI Louie's tool results, which is why `highlighted` exists —
 * a card produced by the assistant is visually distinguished from one the
 * page author placed (spec §34).
 *
 * Must always identify: the project, the evidence title, one line of
 * relevance, and the action that opens the source (spec §21).
 */
type EvidenceCardProps = {
  /** Evidence index id, once one exists (Plan 005). */
  evidenceId?: string;
  project: string;
  title: string;
  relevance: string;
  route: string;
  anchor?: string;
  highlighted?: boolean;
  className?: string;
};

function EvidenceCard({
  evidenceId,
  project,
  title,
  relevance,
  route,
  anchor,
  highlighted = false,
  className,
}: EvidenceCardProps) {
  const href = anchor ? `${route}#${anchor}` : route;

  return (
    <Surface
      variant={highlighted ? "ai" : "interactive"}
      className={cn("group flex flex-col gap-2 p-4", className)}
      data-evidence-id={evidenceId}
      render={<Link href={href} />}
    >
      <SystemLabel tone={highlighted ? "accent" : "default"}>
        {project}
      </SystemLabel>

      <h3 className="text-body-lg font-medium text-foreground">{title}</h3>

      <p className="text-body-sm text-foreground-muted">{relevance}</p>

      <span className="mt-1 inline-flex items-center gap-1 text-body-sm font-medium text-accent">
        Open evidence
        <ArrowUpRight
          aria-hidden="true"
          className="size-3.5 transition-transform duration-(--duration-fast) group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
        />
      </span>
    </Surface>
  );
}

export { EvidenceCard };
