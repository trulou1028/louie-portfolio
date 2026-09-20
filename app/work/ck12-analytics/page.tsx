import type { Metadata } from "next";

import Content from "@/content/work/ck12-analytics.mdx";
import { Canvas, ContextualRail } from "@/components/app-shell/contextual-rail";
import { CaseStudyHeader } from "@/components/portfolio/case-study-header";
import { CreativeWorkSchema } from "@/components/system/structured-data";
import { DeepLinkHighlight } from "@/components/portfolio/deep-link-highlight";
import {
  TableOfContents,
  TableOfContentsInline,
} from "@/components/portfolio/table-of-contents";
import { TrackView } from "@/components/system/track-view";
import { workProjects } from "@/content/work/projects";
import { ANALYTICS_ANCHORS } from "@/lib/routes";

const project = workProjects.find((p) => p.slug === "ck12-analytics")!;

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

export default function AnalyticsCaseStudy() {
  return (
    <Canvas
      rail={
        <ContextualRail aria-label="Case study contents">
          <TableOfContents anchors={ANALYTICS_ANCHORS} />
        </ContextualRail>
      }
    >
      <DeepLinkHighlight />
      <TrackView event="portfolio_project_opened" properties={{ project: "ck12-analytics" }} />
      <CreativeWorkSchema project={project} />
      <article className="max-w-[760px]">
        <CaseStudyHeader
          project={project}
          lede="Helping teachers decide when and how to support a student, without confusing a prediction with an explanation."
        />

        <TableOfContentsInline anchors={ANALYTICS_ANCHORS} className="mb-10" />

        <div className="flex flex-col gap-14">
          <Content />
        </div>
      </article>
    </Canvas>
  );
}
