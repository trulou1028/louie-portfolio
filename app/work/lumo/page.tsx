import type { Metadata } from "next";

import Content from "@/content/work/lumo.mdx";
import { WorkCaseStudy } from "@/components/stacked/work-case-study";
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
    <WorkCaseStudy project={project} anchors={LUMO_ANCHORS}>
      <Content />
    </WorkCaseStudy>
  );
}
