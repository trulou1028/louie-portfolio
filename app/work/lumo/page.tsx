import type { Metadata } from "next";

import Content from "@/content/work/lumo.mdx";
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
import { LUMO_ANCHORS } from "@/lib/routes";

const project = workProjects.find((p) => p.slug === "lumo")!;

export const metadata: Metadata = {
  title: project.title,
  description: project.summary ?? project.title,
  openGraph: {
    type: "article",
    title: project.title,
    description: project.summary ?? project.title,
    url: project.href,
  },
  alternates: { canonical: project.href },
};

export default function LumoCaseStudy() {
  return (
    <Canvas
      rail={
        <ContextualRail aria-label="Case study contents">
          <TableOfContents anchors={LUMO_ANCHORS} />
          <AskAboutProject />
        </ContextualRail>
      }
    >
      <DeepLinkHighlight />
      <TrackView event="portfolio_project_opened" properties={{ project: "lumo" }} />
      <CreativeWorkSchema project={project} />
      <article className="max-w-[760px]">
        <CaseStudyHeader project={project} />

        <div className="mb-10 flex flex-col gap-3 @6xl/canvas:hidden">
          <TableOfContentsInline anchors={LUMO_ANCHORS} />
          <AskAboutProject variant="inline" />
        </div>

        <div className="flex flex-col gap-14">
          <Content />
        </div>
        <NextCaseStudy current="lumo" />
      </article>
    </Canvas>
  );
}
