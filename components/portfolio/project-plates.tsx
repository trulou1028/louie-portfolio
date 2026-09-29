import { WorkPlate } from "@/components/portfolio/work-plate";
import { WorkTile } from "@/components/portfolio/work-tile";
import { ProjectBrand } from "@/components/portfolio/project-brand";
import { InlineLink } from "@/components/system/inline-link";
import type { WorkProject } from "@/content/work/projects";
import type { Experiment } from "@/content/experiments/experiments";

/** A case study on its brand plate. `index` alternates the image side. */
export function ProjectPlate({ project, index = 0, eager = false }: { project: WorkProject; index?: number; eager?: boolean }) {
  return (
    <WorkPlate
      tone={project.plate}
      href={project.href}
      brand={<ProjectBrand project={project} onPlate />}
      title={project.title}
      summary={project.summary}
      facts={project.facts}
      image={project.image ? { src: project.image, alt: project.imageAlt, width: project.imageWidth, height: project.imageHeight } : null}
      gallery={project.gallery}
      flip={index % 2 === 1}
      eager={eager}
    />
  );
}

/** An experiment on the graphite plate, with its live demo linked below. */
export function ExperimentPlate({ experiment, index = 0 }: { experiment: Experiment; index?: number }) {
  return (
    <WorkPlate
      tone="neuron"
      href={`/experiments/${experiment.slug}`}
      brand={
        <p className="flex flex-wrap items-center gap-3 text-body-sm">
          <span className="font-display text-body-lg font-bold">{experiment.slug === "neuron-shift" ? "Neuron Shift" : "Experiment"}</span>
          <span className="rounded-full border border-current px-2.5 py-0.5 font-medium">Independent prototype</span>
        </p>
      }
      title={experiment.title}
      summary={experiment.summary}
      image={experiment.image ?? null}
      cta="Read the write-up"
      flip={index % 2 === 1}
      after={experiment.demoUrl ? <p className="mt-3 text-body-sm"><InlineLink href={experiment.demoUrl}>Try the simulated demo</InlineLink></p> : null}
    />
  );
}

/** A case study as a bento tile on the homepage (Plan 038). */
export function ProjectTile({ project, size, eager = false, className }: { project: WorkProject; size: "large" | "small"; eager?: boolean; className?: string }) {
  return (
    <WorkTile
      tone={project.plate}
      href={project.href}
      brand={<ProjectBrand project={project} onPlate />}
      title={project.title}
      meta={project.role}
      image={project.tileImage ?? (project.image ? { src: project.image, alt: project.imageAlt, width: project.imageWidth, height: project.imageHeight } : null)}
      size={size}
      eager={eager}
      className={className}
    />
  );
}

/** An experiment as a bento tile, with its live demo as a second link. */
export function ExperimentTile({ experiment, size, className }: { experiment: Experiment; size: "large" | "small"; className?: string }) {
  return (
    <WorkTile
      tone="neuron"
      href={`/experiments/${experiment.slug}`}
      brand={
        <p className="flex flex-wrap items-center gap-3 text-body-sm">
          <span className="font-display text-body-lg font-bold">{experiment.slug === "neuron-shift" ? "Neuron Shift" : "Experiment"}</span>
          <span className="rounded-full border border-current px-2.5 py-0.5 font-medium">Independent prototype</span>
        </p>
      }
      title={experiment.title}
      meta="Simulated data"
      image={experiment.image ?? null}
      size={size}
      extra={experiment.demoUrl ? <InlineLink href={experiment.demoUrl} className="text-current decoration-current/40">Try the simulated demo</InlineLink> : null}
      className={className}
    />
  );
}
