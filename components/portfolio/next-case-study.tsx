import Link from "next/link";
import { ArrowRight } from "lucide-react";

import { ProjectBrand } from "@/components/portfolio/project-brand";
import { TONES } from "@/components/portfolio/work-plate";
import { workProjects, type WorkProject } from "@/content/work/projects";
import { cn } from "@/lib/utils";

/**
 * The end of a case study points to the next one, on that project's plate
 * color, so a reader never hits a dead end at the footer (Plan 037). The
 * project's own logo leads the card, as it does on the homepage tiles.
 */
function NextCaseStudy({ current, className }: { current: WorkProject["slug"]; className?: string }) {
  const index = workProjects.findIndex((project) => project.slug === current);
  const next = workProjects[(index + 1) % workProjects.length];
  const t = TONES[next.plate];

  return (
    <nav aria-label="Next case study" className={cn("mt-16", className)}>
      <Link
        href={next.href}
        className={cn("group focus-ring flex flex-col gap-6 rounded-panel p-6 sm:p-8", t.field, t.ink)}
      >
        <div className="flex flex-wrap items-center justify-between gap-x-6 gap-y-3">
          <ProjectBrand project={next} onPlate />
          <span className={cn("text-body-sm font-medium", t.muted)}>Next case study</span>
        </div>
        <span className="flex items-end justify-between gap-6">
          <span className="max-w-[26ch] font-display text-heading-lg text-balance">{next.title}</span>
          <ArrowRight aria-hidden="true" className="mb-1 size-6 shrink-0 transition-transform duration-(--duration-fast) group-hover:translate-x-1" />
        </span>
      </Link>
    </nav>
  );
}

export { NextCaseStudy };
