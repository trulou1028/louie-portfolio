import Link from "next/link";
import { ArrowRight } from "lucide-react";

import { workProjects, type WorkProject } from "@/content/work/projects";
import { cn } from "@/lib/utils";

/* Static class strings so Tailwind can see every token. */
const FIELD: Record<WorkProject["plate"], string> = {
  offboard: "bg-plate-offboard text-plate-offboard-ink",
  foresights: "bg-plate-foresights text-plate-foresights-ink",
  flexi: "bg-plate-flexi text-plate-flexi-ink",
};

/**
 * The end of a case study points to the next one, on that project's plate
 * color, so a reader never hits a dead end at the footer (Plan 037).
 */
function NextCaseStudy({ current, className }: { current: WorkProject["slug"]; className?: string }) {
  const index = workProjects.findIndex((project) => project.slug === current);
  const next = workProjects[(index + 1) % workProjects.length];

  return (
    <nav aria-label="Next case study" className={cn("mt-16", className)}>
      <Link
        href={next.href}
        className={cn("group focus-ring flex flex-col gap-3 rounded-panel p-6 sm:p-8", FIELD[next.plate])}
      >
        <span className="text-body-sm font-medium">Next case study · {next.name}</span>
        <span className="flex items-end justify-between gap-6">
          <span className="max-w-[26ch] font-display text-heading-lg text-balance">{next.title}</span>
          <ArrowRight aria-hidden="true" className="mb-1 size-6 shrink-0 transition-transform duration-(--duration-fast) group-hover:translate-x-1" />
        </span>
      </Link>
    </nav>
  );
}

export { NextCaseStudy };
