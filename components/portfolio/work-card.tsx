import Link from "next/link";
import { ArrowUpRight } from "lucide-react";

import { Surface } from "@/components/system/surface";
import { Tag } from "@/components/system/tag";
import { cn } from "@/lib/utils";
import type { WorkProject } from "@/content/work/projects";

/**
 * The featured-work card for a main content column — the homepage's Featured
 * work section (spec §11 §3, §34) and `/work`.
 *
 * The whole card is one link, so there is a single tab stop and the entire
 * surface is a target on touch.
 *
 * Two layouts, because the two pages place these differently:
 *
 * - `split` (default, `/work`) — one card per row across the full column,
 *   image beside the text. Stacks to a single column below `sm`.
 * - `stacked` (the homepage) — image above the text, so the card works in a
 *   narrow grid cell. The homepage runs two of these per row (owner
 *   decision, 2026-08-31), where a side-by-side image would leave the text
 *   too little width to read.
 *
 * When a project has no image yet, a neutral dashed frame renders in its
 * place — never a stand-in screenshot that could read as real product work
 * (spec §38: "no fake data represented as real").
 */
type WorkCardProps = {
  project: WorkProject;
  className?: string;
  /** @default "split" */
  layout?: "split" | "stacked";
};

function WorkCard({ project, className, layout = "split" }: WorkCardProps) {
  const isStacked = layout === "stacked";

  return (
    <Surface
      variant="interactive"
      radius="lg"
      className={cn(
        "group flex flex-col overflow-hidden",
        !isStacked && "sm:flex-row",
        className,
      )}
      render={<Link href={project.href} />}
    >
      <div className={cn(!isStacked && "sm:w-[38%] sm:shrink-0")}>
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
            className={cn(
              "aspect-[16/10] w-full border-b border-dashed border-border-default bg-surface-muted",
              // Stacked keeps the divider under the image; split moves it to
              // the image's right edge once the two sit side by side.
              !isStacked && "sm:border-b-0 sm:border-r",
            )}
          />
        )}
      </div>

      <div
        className={cn(
          "flex min-w-0 flex-1 flex-col gap-3",
          // A narrow grid cell cannot afford the full-width card's padding.
          isStacked ? "p-5" : "p-6 md:p-8",
        )}
      >
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
              <Tag tone="mono">{tag}</Tag>
            </li>
          ))}
        </ul>
      </div>
    </Surface>
  );
}

export { WorkCard };
