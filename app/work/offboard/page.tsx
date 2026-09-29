import type { Metadata } from "next";

import Content from "@/content/work/offboard.mdx";
import { Canvas, ContextualRail } from "@/components/app-shell/contextual-rail";
import { AskAboutProject } from "@/components/ai/ask-about-project";
import { CaseStudyHeader } from "@/components/portfolio/case-study-header";
import { NextCaseStudy } from "@/components/portfolio/next-case-study";
import { CreativeWorkSchema } from "@/components/system/structured-data";
import { DeepLinkHighlight } from "@/components/portfolio/deep-link-highlight";
import {
  TableOfContents,
  TableOfContentsInline,
} from "@/components/portfolio/table-of-contents";
import { TrackView } from "@/components/system/track-view";
import { workProjects } from "@/content/work/projects";
import { OFFBOARD_ANCHORS } from "@/lib/routes";

const project = workProjects.find((p) => p.slug === "offboard")!;

export const metadata: Metadata = {
  title: project.name,
  description: project.summary ?? project.title,
  openGraph: {
    type: "article",
    title: project.title,
    description: project.summary ?? project.title,
    url: project.href,
  },
  alternates: { canonical: project.href },
};

export default function OffboardCaseStudy() {
  return (
    <Canvas
      rail={
        <ContextualRail aria-label="Case study contents">
          <TableOfContents anchors={OFFBOARD_ANCHORS} />
          <AskAboutProject />
        </ContextualRail>
      }
    >
      <DeepLinkHighlight />
      <TrackView event="portfolio_project_opened" properties={{ project: "offboard" }} />
      <CreativeWorkSchema project={project} />
      <article className="max-w-[760px]">
        <CaseStudyHeader
          project={project}
          lede="Job seekers lose most of their time to work that has nothing to do with the job: rebuilding the same context across a dozen tools that do not talk to each other."
        />

        <div className="mb-10 flex flex-col gap-3 @5xl/canvas:hidden">
          <TableOfContentsInline anchors={OFFBOARD_ANCHORS} />
          <AskAboutProject variant="inline" />
        </div>

        <div className="flex flex-col gap-14">
          <Content />
        </div>
        <NextCaseStudy current="offboard" />
      </article>
    </Canvas>
  );
}
