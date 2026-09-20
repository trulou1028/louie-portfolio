import { MotionReveal } from "@/components/portfolio/motion-reveal";
import Image from "next/image";
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { Surface } from "@/components/system/surface";
import { ProjectBrand } from "@/components/portfolio/project-brand";
import { cn } from "@/lib/utils";
import type { WorkProject } from "@/content/work/projects";

/** One real artifact and one argument. A single link remains the touch target. */
function WorkCard({ project, className, layout = "split", eager = false }: {
  project: WorkProject; className?: string; layout?: "split" | "stacked"; eager?: boolean;
}) {
  return (
    <MotionReveal className="h-full"><Surface variant="interactive" radius="lg" className={cn("group @container block h-full overflow-hidden", className)} render={<Link href={project.href} />}>
      <div className={cn("grid h-full", layout === "split" ? "@2xl:grid-cols-2" : "grid-rows-[auto_1fr]")}>
        {project.image && <div className="flex items-center bg-surface-muted p-4">
          <Image src={project.image} alt={project.imageAlt} width={project.imageWidth} height={project.imageHeight}
            sizes="(min-width: 1024px) 420px, 90vw" loading={eager ? "eager" : "lazy"} className="h-auto w-full rounded-sm border border-border-subtle" />
        </div>}
        <div className={cn("flex min-w-0 flex-col", layout === "stacked" ? "p-5" : "p-6 sm:p-8")}>
          <ProjectBrand project={project} />
          <h3 className="mt-6 font-serif text-heading-md text-balance text-foreground">{project.title}</h3>
          <div className="mt-auto pt-8">
            <p className="text-body-sm text-foreground-muted">{project.role}</p>
            <span className="mt-2.5 inline-flex items-center gap-2 text-body-sm font-medium text-accent">Read case study <ArrowUpRight aria-hidden="true" className="size-4" /></span>
          </div>
        </div>
      </div>
    </Surface></MotionReveal>
  );
}
export { WorkCard };
