import { RevealHeading } from "@/components/portfolio/reveal-heading";
import { MotionReveal } from "@/components/portfolio/motion-reveal";
import { ProjectMeta } from "@/components/portfolio/project-meta";
import { ArtifactFrame } from "@/components/portfolio/artifact-frame";
import { ProjectBrand } from "@/components/portfolio/project-brand";
import { CaseStudyBrief } from "@/components/portfolio/case-study-brief";
import type { WorkProject } from "@/content/work/projects";

/**
 * Case-study opening (Plan 037, Plan 045): brand, title, lede, the quick
 * facts a hiring manager scans for, then the brief (problem, what I did,
 * result), then the marked hero screenshot.
 */
function CaseStudyHeader({ project, lede }: { project: WorkProject; lede?: string }) {
  return <MotionReveal stagger><header className="pb-12">
    <ProjectBrand project={project} />
    <RevealHeading as="h1" className="mt-5 max-w-[24ch] font-display text-display-lg text-balance text-foreground">{project.title}</RevealHeading>
    <p className="mt-6 max-w-[62ch] text-body-lg text-foreground-muted">{lede ?? project.summary}</p>
    <ProjectMeta items={project.facts} className="mt-8" />
    <p className="mt-3 text-body-sm text-foreground-muted">{project.scope}</p>
    <CaseStudyBrief brief={project.brief} className="mt-8" />
    {project.image && <ArtifactFrame src={project.image} alt={project.imageAlt} width={project.imageWidth} height={project.imageHeight} caption={project.imageCaption} marks={project.imageMarks} eager className="mt-10" />}
  </header></MotionReveal>;
}
export { CaseStudyHeader };
