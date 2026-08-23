import Link from "next/link";
import { ArrowUpRight } from "lucide-react";

import { Surface } from "@/components/system/surface";
import { SystemLabel } from "@/components/system/system-label";
import { cn } from "@/lib/utils";
import type { WorkProject } from "@/content/work/projects";

/**
 * The full-width featured-work card for a main content column — the
 * homepage's Featured work section (spec §11 §3, §34) and `/work`.
 *
 * The whole card is one link, so there is a single tab stop and the entire
 * surface is a target on touch. Stacks to a single column below `sm`.
 *
 * When a project has no image yet, a neutral dashed frame renders in its
 * place — never a stand-in screenshot that could read as real product work
 * (spec §38: "no fake data represented as real"). Same `data-pending-asset`
 * pattern as `rail-work-card.tsx`.
 */
type WorkCardProps = {
  project: WorkProject;
  className?: string;
};

function WorkCard({ project, className }: WorkCardProps) {
  return (
    <Surface
      variant="interactive"
      radius="lg"
      className={cn("group flex flex-col overflow-hidden sm:flex-row", className)}
      render={<Link href={project.href} />}
    >
      <div className="sm:w-[38%] sm:shrink-0">
        {project.image ? (
          // eslint-disable-next-line @next/next/no-img-element -- swapped for next/image when real assets land
          <img
            src={project.image}
            alt=""
            className="aspect-[16/10] w-full object-cover"
          />
        ) : (
          /* Awaiting real product imagery — never a stand-in screenshot. */
          <div
            data-pending-asset
            aria-hidden="true"
            className="aspect-[16/10] w-full border-b border-dashed border-border-default bg-surface-muted sm:border-b-0 sm:border-r"
          />
        )}
      </div>

      <div className="flex min-w-0 flex-1 flex-col gap-3 p-6 md:p-7">
        <span className="flex items-center gap-1.5 font-serif text-heading-md text-foreground">
          {project.name}
          <ArrowUpRight
            aria-hidden="true"
            className="size-4 shrink-0 text-foreground-muted transition-transform duration-(--duration-fast) group-hover:-translate-y-0.5 group-hover:translate-x-0.5"
          />
        </span>

        <p className="text-body text-foreground-muted">{project.title}</p>

        {project.summary ? (
          <p className="text-body-sm text-foreground-muted">{project.summary}</p>
        ) : null}

        <ul className="mt-2 flex flex-wrap gap-1.5">
          {project.tags.map((tag) => (
            <li key={tag}>
              <SystemLabel>{tag}</SystemLabel>
            </li>
          ))}
        </ul>
      </div>
    </Surface>
  );
}

export { WorkCard };
