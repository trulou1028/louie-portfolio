import type { Metadata } from "next";

import Content from "@/content/work/flexi.mdx";
import { WorkCaseStudy } from "@/components/stacked/work-case-study";
import { workProjects } from "@/content/work/projects";
import { FLEXI_ANCHORS } from "@/lib/routes";

const project = workProjects.find((p) => p.slug === "flexi")!;

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

export default function FlexiCaseStudy() {
  return (
    <WorkCaseStudy project={project} anchors={FLEXI_ANCHORS}>
      <Content />
    </WorkCaseStudy>
  );
}
