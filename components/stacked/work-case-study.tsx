import { CaseStudyLayout } from "@/components/stacked/case-study-layout";
import { ArtifactFrame } from "@/components/portfolio/artifact-frame";
import { CaseStudyBrief } from "@/components/portfolio/case-study-brief";
import { NextCaseStudy } from "@/components/portfolio/next-case-study";
import { CreativeWorkSchema } from "@/components/system/structured-data";
import { TrackView } from "@/components/system/track-view";
import { projectYears, type WorkProject } from "@/content/work/projects";
import type { Anchor } from "@/lib/routes";

/**
 * One of the five work case studies: the stacked layout, the marked hero
 * screenshot, the brief, the MDX body, and the link to the next study.
 */
function WorkCaseStudy({ project, anchors, children }: {
  project: WorkProject;
  anchors: readonly Anchor[];
  children: React.ReactNode;
}) {
  const years = projectYears(project);
  return (
    <CaseStudyLayout
      label={[project.name, years].filter(Boolean).join(" · ")}
      title={project.title}
      lead={project.summary}
      facts={[...project.facts, { label: "Status", value: project.status }]}
      anchors={anchors}
      header={<>
        {project.image ? (
          <ArtifactFrame src={project.image} alt={project.imageAlt} width={project.imageWidth} height={project.imageHeight} caption={project.imageCaption} marks={project.imageMarks} frame={project.imageFrame} video={project.video} eager className="mt-14" />
        ) : null}
        <CaseStudyBrief brief={project.brief} className="mt-16" />
      </>}
    >
      <TrackView event="portfolio_project_opened" properties={{ project: project.slug }} />
      <CreativeWorkSchema project={project} />
      {children}
      <NextCaseStudy current={project.slug} />
    </CaseStudyLayout>
  );
}

export { WorkCaseStudy };
