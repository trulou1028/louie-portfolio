import type { Metadata } from "next";

import { Canvas } from "@/components/app-shell/contextual-rail";
import { WorkCard } from "@/components/portfolio/work-card";
import { SectionLabel } from "@/components/system/section-label";
import { workProjects } from "@/content/work/projects";

export const metadata: Metadata = {
  title: "Work",
  description:
    "Selected product design work across AI systems, complex workflows, and design engineering.",
};

export default function WorkIndex() {
  return (
    <Canvas>
      <div className="max-w-[820px]">
        <SectionLabel>Work</SectionLabel>
        <h1 className="mt-5 max-w-[18ch] font-serif text-display-lg text-balance text-foreground">
          Two products, built around the same question
        </h1>
        <p className="mt-6 max-w-[62ch] text-body-lg text-foreground-muted">
          Both of these are AI products where the hard part was deciding what
          the system should refuse to do, not what it could do.
        </p>

        <div className="mt-12 flex flex-col gap-5">
          {workProjects.map((project) => (
            <WorkCard key={project.slug} project={project} />
          ))}
        </div>
      </div>
    </Canvas>
  );
}
