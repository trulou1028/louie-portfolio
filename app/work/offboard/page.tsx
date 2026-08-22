import type { Metadata } from "next";

import Content from "@/content/work/offboard.mdx";
import { Canvas, ContextualRail } from "@/components/app-shell/contextual-rail";
import { CaseStudyHeader } from "@/components/portfolio/case-study-header";
import { CreativeWorkSchema } from "@/components/system/structured-data";
import { DeepLinkHighlight } from "@/components/portfolio/deep-link-highlight";
import {
  TableOfContents,
  TableOfContentsInline,
} from "@/components/portfolio/table-of-contents";
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
        </ContextualRail>
      }
    >
      <DeepLinkHighlight />
      <CreativeWorkSchema project={project} />
      <article className="max-w-[760px]">
        <CaseStudyHeader
          project={project}
          lede="Job seekers lose most of their time to work that has nothing to do with the job: rebuilding the same context across a dozen tools that do not talk to each other."
          // TODO(content): Louie to supply role, timeframe, and team.
        />

        <TableOfContentsInline anchors={OFFBOARD_ANCHORS} className="mb-10" />

        <div className="flex flex-col gap-14">
          <Content />
        </div>
      </article>
    </Canvas>
  );
}
