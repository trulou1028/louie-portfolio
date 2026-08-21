import type { Metadata } from "next";

import Content from "@/content/work/flexi.mdx";
import { Canvas, ContextualRail } from "@/components/app-shell/contextual-rail";
import { CaseStudyHeader } from "@/components/portfolio/case-study-header";
import {
  TableOfContents,
  TableOfContentsInline,
} from "@/components/portfolio/table-of-contents";
import { workProjects } from "@/content/work/projects";
import { FLEXI_ANCHORS } from "@/lib/routes";

const project = workProjects.find((p) => p.slug === "flexi")!;

export const metadata: Metadata = {
  title: project.name,
  description: project.title,
};

export default function FlexiCaseStudy() {
  return (
    <Canvas
      rail={
        <ContextualRail aria-label="Case study contents">
          <TableOfContents anchors={FLEXI_ANCHORS} />
        </ContextualRail>
      }
    >
      <article className="max-w-[760px]">
        <CaseStudyHeader
          project={project}
          lede="An AI tutor has to satisfy a student who wants the answer, a teacher who needs the learning to survive, and an institution that needs to trust both."
          // TODO(content): Louie to supply role, timeframe, and team.
        />

        <TableOfContentsInline anchors={FLEXI_ANCHORS} className="mb-10" />

        <div className="flex flex-col gap-14">
          <Content />
        </div>
      </article>
    </Canvas>
  );
}
