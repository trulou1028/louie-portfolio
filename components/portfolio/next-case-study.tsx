import Link from "next/link";

import { workProjects, type WorkProject } from "@/content/work/projects";
import { cn } from "@/lib/utils";

/**
 * The end of a case study points to the next one, so a reader never hits a
 * dead end (Plan 037). Stacked redesign: a rule, a label, and the next
 * title, which turns blue on hover.
 */
function NextCaseStudy({ current, className }: { current: WorkProject["slug"]; className?: string }) {
  const index = workProjects.findIndex((project) => project.slug === current);
  const next = workProjects[(index + 1) % workProjects.length];

  return (
    <nav aria-label="Next case study" className={cn("mt-24 border-t border-border-default pt-6", className)}>
      <p className="text-meta text-foreground-quiet">Next</p>
      <Link href={next.href} className="focus-ring mt-1 inline-block rounded-xs font-display text-heading-xl text-balance text-foreground transition-colors duration-(--duration-fast) hover:text-accent-hover">
        {next.title}
      </Link>
    </nav>
  );
}

export { NextCaseStudy };
