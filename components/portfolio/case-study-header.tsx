import { RevealHeading } from "@/components/portfolio/reveal-heading";
import { MotionReveal } from "@/components/portfolio/motion-reveal";
import { ProjectMeta } from "@/components/portfolio/project-meta";
import { ArtifactFrame } from "@/components/portfolio/artifact-frame";
import { SectionLabel } from "@/components/system/section-label";
import type { WorkProject } from "@/content/work/projects";

function CaseStudyHeader({ project, lede, role, timeframe, team }: {
  project: WorkProject; lede?: string; role?: string | null; timeframe?: string | null; team?: string | null;
}) {
  return <MotionReveal stagger><header className="pb-12">
    <SectionLabel>{project.name}</SectionLabel>
    <RevealHeading as="h1" className="mt-5 max-w-[24ch] font-serif text-display-lg text-balance text-foreground">{project.title}</RevealHeading>
    <p className="mt-6 max-w-[62ch] text-body-lg text-foreground-muted">{lede ?? project.summary}</p>
    <ProjectMeta role={role ?? project.role} timeframe={timeframe} team={team} className="mt-8" />
    <p className="mt-3 text-body-sm text-foreground-muted">{project.scope}</p>
    <div className="mt-8 border-l-2 border-accent pl-5">
      <p className="text-body-sm font-medium text-accent">{project.status}</p>
      <p className="mt-2 text-body text-foreground">{project.result}</p>
    </div>
    {project.image && <ArtifactFrame src={project.image} alt={project.imageAlt} width={project.imageWidth} height={project.imageHeight} caption={project.imageCaption} />}
  </header></MotionReveal>;
}
export { CaseStudyHeader };
