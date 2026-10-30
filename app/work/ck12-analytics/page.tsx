import type { Metadata } from "next";

import Content from "@/content/work/ck12-analytics.mdx";
import { WorkCaseStudy } from "@/components/stacked/work-case-study";
import { workProjects } from "@/content/work/projects";
import { ANALYTICS_ANCHORS } from "@/lib/routes";

const project = workProjects.find((p) => p.slug === "ck12-analytics")!;

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

export default function AnalyticsCaseStudy() {
  return (
    <WorkCaseStudy project={project} anchors={ANALYTICS_ANCHORS}>
      <Content />
    </WorkCaseStudy>
  );
}
