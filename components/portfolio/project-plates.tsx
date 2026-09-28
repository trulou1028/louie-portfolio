import { WorkPlate } from "@/components/portfolio/work-plate";
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
