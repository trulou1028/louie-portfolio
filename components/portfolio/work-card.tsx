import Link from "next/link";
import { ArrowRight } from "lucide-react";

import { Surface } from "@/components/system/surface";
import { SectionLabel } from "@/components/system/section-label";
import { cn } from "@/lib/utils";
import type { WorkProject } from "@/content/work/projects";

/**
 * A featured case study (spec §11 §3, §34).
 *
 * The whole card is one link, so there is a single tab stop and the entire
 * surface is a target on touch. Stacks to a single column below `md`.
 *
 * When a project has no image yet, a neutral frame renders in its place —
 * never a stand-in screenshot that could read as real product work
 * (spec §38: "no fake data represented as real").
 */
type WorkCardProps = {
  project: WorkProject;
  eyebrow?: string;
  className?: string;
};

function WorkCard({ project, eyebrow, className }: WorkCardProps) {
  return (
    <Surface
      variant="interactive"
      radius="lg"
      className={cn("group block overflow-hidden", className)}
      render={<Link href={project.href} />}
    >
      <div className="flex flex-col gap-6 p-6 md:flex-row md:items-stretch md:gap-8 md:p-7">
        <div className="flex min-w-0 flex-1 flex-col">
          {eyebrow ? <SectionLabel className="mb-3">{eyebrow}</SectionLabel> : null}

          <h3 className="font-serif text-heading-lg text-balance text-foreground">
            {project.title}
          </h3>

          {project.summary ? (
            <p className="mt-3 max-w-[60ch] text-body text-foreground-muted">
              {project.summary}
            </p>
          ) : null}

          <ul className="mt-5 flex flex-wrap gap-x-2 gap-y-1.5">
            {project.tags.map((tag) => (
              <li
                key={tag}
                className="rounded-xs border border-border-subtle bg-surface-muted px-2 py-0.5 text-body-sm text-foreground-muted"
              >
                {tag}
              </li>
            ))}
          </ul>

          <span className="mt-6 inline-flex items-center gap-1.5 text-body-sm font-medium text-accent">
            Read the case study
            <ArrowRight
              aria-hidden="true"
              className="size-4 transition-transform duration-(--duration-fast) group-hover:translate-x-0.5"
            />
          </span>
        </div>

        <div className="md:w-[38%] md:shrink-0">
          {project.image ? (
            // eslint-disable-next-line @next/next/no-img-element -- replaced with next/image in Plan 004 when real assets land
            <img
              src={project.image}
              alt=""
              className="h-full w-full rounded-md object-cover"
            />
          ) : (
            /* TODO(asset): real product imagery for this project. */
            <div
              aria-hidden="true"
              className="flex h-full min-h-[160px] items-center justify-center rounded-md border border-dashed border-border-default bg-surface-muted"
            >
              <span className="font-mono text-system uppercase text-foreground-muted">
                Imagery to come
              </span>
            </div>
          )}
        </div>
      </div>
    </Surface>
  );
}

export { WorkCard };
