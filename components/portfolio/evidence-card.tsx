import Link from "next/link";
import { ArrowUpRight } from "lucide-react";

import { cn } from "@/lib/utils";
import { workProjects } from "@/content/work/projects";

/** Evidence entries store a project slug; readers see the project's name. */
function projectLabel(project: string) {
  if (project === "experiment") return "Experiment";
  return workProjects.find((p) => p.slug === project)?.name ?? project;
}

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
    // Stacked redesign: a ruled row, not a card. The project, the claim
    // (blue on hover), why it matters, and the link. A highlighted row
    // keeps a pale blue ground.
    <Link
      href={href}
      className={cn("group focus-ring flex flex-col gap-1.5 border-t border-border-default py-5", highlighted && "bg-accent-soft px-4", className)}
      data-evidence-id={evidenceId}
    >
      <span className="text-meta text-foreground-quiet">{projectLabel(project)}</span>

      <h3 className="text-body-lg text-foreground transition-colors duration-(--duration-fast) group-hover:text-accent-hover">{title}</h3>

      <p className="max-w-[34rem] text-body-sm text-foreground-muted">{relevance}</p>

      <span className="mt-1 inline-flex items-center gap-1 text-body-sm text-accent underline decoration-accent-line underline-offset-[0.2em]">
        Open evidence
        <ArrowUpRight
          aria-hidden="true"
          className="size-3.5 transition-transform duration-(--duration-fast) group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
        />
      </span>
    </Link>
  );
}

export { EvidenceCard };
