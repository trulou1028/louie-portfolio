import Image from "next/image";
import { RevealHeading } from "@/components/portfolio/reveal-heading";
import { MotionReveal } from "@/components/portfolio/motion-reveal";
import { ArtifactFrame } from "@/components/portfolio/artifact-frame";
import { CaseStudyBrief } from "@/components/portfolio/case-study-brief";
import type { WorkProject } from "@/content/work/projects";

/**
 * Case-study opening (Plans 037, 045, 051). One opening, not three: the
 * title, one meta line with the facts a hiring manager scans for, the brief
 * (problem, what I did, result), then the marked hero screenshot.
 *
 * Plan 051 removed the logo chip (the meta line names the product), the
 * separate lede (it restated the brief's problem), and the scope line.
 */
function CaseStudyHeader({ project }: { project: WorkProject }) {
  const meta = [project.name, ...project.facts.map((fact) => fact.value)].join(" · ");
  return <MotionReveal stagger><header className="pb-12">
    {project.icon ? (
      <div className="flex items-center gap-4 sm:gap-5">
        <Image src={project.icon.src} width={project.icon.width} height={project.icon.height} alt="" aria-hidden="true" sizes="80px" preload className="size-14 shrink-0 object-contain sm:size-20" />
        <RevealHeading as="h1" className="max-w-[22ch] font-display text-display-lg text-balance text-foreground">{project.title}</RevealHeading>
      </div>
    ) : (
      <RevealHeading as="h1" className="max-w-[22ch] font-display text-display-lg text-balance text-foreground">{project.title}</RevealHeading>
    )}
    <p className="mt-5 font-mono text-system uppercase text-foreground-muted">{meta}</p>
    <CaseStudyBrief brief={project.brief} className="mt-10" />
    {project.image && <ArtifactFrame src={project.image} alt={project.imageAlt} width={project.imageWidth} height={project.imageHeight} caption={project.imageCaption} marks={project.imageMarks} frame={project.imageFrame} video={project.video} eager className="mt-12" />}
  </header></MotionReveal>;
}
export { CaseStudyHeader };
