import type { Metadata } from "next";

import Content from "@/content/work/offboard.mdx";
import { WorkCaseStudy } from "@/components/stacked/work-case-study";
import { workProjects } from "@/content/work/projects";
import { OFFBOARD_ANCHORS } from "@/lib/routes";

const project = workProjects.find((p) => p.slug === "offboard")!;

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

export default function OffboardCaseStudy() {
  return (
    <WorkCaseStudy project={project} anchors={OFFBOARD_ANCHORS}>
      <Content />
    </WorkCaseStudy>
  );
}
