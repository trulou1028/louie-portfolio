import Link from "next/link";
import { ArrowUpRight } from "lucide-react";

import { Surface } from "@/components/system/surface";
import { cn } from "@/lib/utils";
import type { WorkProject } from "@/content/work/projects";

/**
 * The compact work card used in the contextual rail (spec §10: "featured
 * work"). Horizontal layout so it reads at rail width and again at full width
 * when the rail stacks below `xl`.
 *
 * Tags come from the project's own verified tag list — the strategy mockup's
 * category labels are not used, since that mockup misdescribes Offboard.
 */
function RailWorkCard({
  project,
  className,
}: {
  project: WorkProject;
  className?: string;
}) {
  return (
    <Surface
      variant="interactive"
      className={cn("group flex gap-3.5 p-3.5", className)}
      render={<Link href={project.href} />}
    >
      <div className="w-[76px] shrink-0 sm:w-[88px]">
        {project.image ? (
          // eslint-disable-next-line @next/next/no-img-element -- swapped for next/image when real assets land
          <img
            src={project.image}
            alt=""
            className="aspect-[4/3] w-full rounded-xs object-cover"
          />
        ) : (
          /* Awaiting real product imagery — never a stand-in screenshot. */
          <div
            data-pending-asset
            aria-hidden="true"
            className="aspect-[4/3] w-full rounded-xs border border-dashed border-border-default bg-surface-muted"
          />
        )}
      </div>

      <div className="flex min-w-0 flex-col gap-1">
        <span className="flex items-center gap-1.5 text-body font-medium text-foreground">
          {project.name}
          <ArrowUpRight
            aria-hidden="true"
            className="size-3.5 shrink-0 text-foreground-muted transition-transform duration-(--duration-fast) group-hover:-translate-y-0.5 group-hover:translate-x-0.5"
          />
        </span>

        {project.summary ? (
          <span className="text-body-sm text-foreground-muted">
            {project.summary}
          </span>
        ) : null}

        <span className="mt-1 flex flex-wrap gap-1">
          {project.tags.slice(0, 2).map((tag) => (
            <span
              key={tag}
              className="rounded-xs border border-border-subtle bg-surface-muted px-1.5 py-0.5 font-mono text-system uppercase text-foreground-muted"
            >
              {tag}
            </span>
          ))}
        </span>
      </div>
    </Surface>
  );
}

export { RailWorkCard };
