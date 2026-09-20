import { MotionReveal } from "@/components/portfolio/motion-reveal";
import Image from "next/image";
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { Surface } from "@/components/system/surface";
import { Tag } from "@/components/system/tag";
import { cn } from "@/lib/utils";
import type { WorkProject } from "@/content/work/projects";

/** One real artifact and one argument. A single link remains the touch target. */
function WorkCard({ project, className, layout = "split" }: {
  project: WorkProject; className?: string; layout?: "split" | "stacked";
}) {
  return (
    <MotionReveal><Surface variant="interactive" radius="lg" className={cn("group @container block overflow-hidden", className)} render={<Link href={project.href} />}>
      <div className={cn("grid", layout === "split" && "@2xl:grid-cols-2")}>
        {project.image && <div className="flex items-center bg-surface-muted p-4">
          <Image src={project.image} alt={project.imageAlt} width={project.imageWidth} height={project.imageHeight}
            sizes="(min-width: 1024px) 420px, 90vw" className="h-auto w-full rounded-sm border border-border-subtle" />
        </div>}
        <div className="flex min-w-0 flex-col gap-2.5 p-5">
          <span className="text-body-sm text-accent">{project.name}</span>
          <h3 className="font-serif text-heading-md text-balance text-foreground">{project.title}</h3>
          <p className="text-body-sm text-foreground-muted">{project.summary}</p>
          <p className="text-body-sm text-foreground-muted">{project.role}</p>
          <ul className="flex flex-wrap gap-2">
            {project.tags.map((tag) => <li key={tag}><Tag tone="mono">{tag}</Tag></li>)}
          </ul>
          <span className="mt-3 inline-flex items-center gap-2 text-body-sm font-medium text-accent">Read case study <ArrowUpRight aria-hidden="true" className="size-4" /></span>
        </div>
      </div>
    </Surface></MotionReveal>
  );
}
export { WorkCard };
