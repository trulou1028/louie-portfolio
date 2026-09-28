import { RevealHeading } from "@/components/portfolio/reveal-heading";
import { MotionReveal } from "@/components/portfolio/motion-reveal";
import { ProjectMeta } from "@/components/portfolio/project-meta";
import { ArtifactFrame } from "@/components/portfolio/artifact-frame";
import { ProjectBrand } from "@/components/portfolio/project-brand";
import type { WorkProject } from "@/content/work/projects";

/**
 * Case-study opening (Plan 037): brand, title, lede, then the quick facts a
 * hiring manager scans for, then the marked hero screenshot. The project's
 * status and current result follow the image as plain text; they no longer
 * lead the page in an accent callout.
 */
function CaseStudyHeader({ project, lede }: { project: WorkProject; lede?: string }) {
  return <MotionReveal stagger><header className="pb-12">
    <ProjectBrand project={project} />
    <RevealHeading as="h1" className="mt-5 max-w-[24ch] font-display text-display-lg text-balance text-foreground">{project.title}</RevealHeading>
    <p className="mt-6 max-w-[62ch] text-body-lg text-foreground-muted">{lede ?? project.summary}</p>
    <ProjectMeta items={project.facts} className="mt-8" />
    <p className="mt-3 text-body-sm text-foreground-muted">{project.scope}</p>
    {project.image && <ArtifactFrame src={project.image} alt={project.imageAlt} width={project.imageWidth} height={project.imageHeight} caption={project.imageCaption} marks={project.imageMarks} eager className="mt-10" />}
    <p className="mt-6 max-w-[68ch] text-body text-foreground-muted"><span className="font-semibold text-foreground">{project.status}.</span> {project.result}</p>
  </header></MotionReveal>;
}
export { CaseStudyHeader };
