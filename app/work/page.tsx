import { RevealHeading } from "@/components/portfolio/reveal-heading";
import { MotionReveal } from "@/components/portfolio/motion-reveal";
import type { Metadata } from "next";
import { Canvas } from "@/components/app-shell/contextual-rail";
import { WorkCard } from "@/components/portfolio/work-card";
import { ExperimentCard } from "@/components/portfolio/experiment-card";
import { InlineLink } from "@/components/system/inline-link";
import { SectionLabel } from "@/components/system/section-label";
import { workProjects } from "@/content/work/projects";
import { experiments } from "@/content/experiments/experiments";
export const metadata: Metadata = { title: "Work", description: "Product decisions across learning analytics, career transitions, and conversational AI.", alternates: { canonical: "/work" } };
export default function WorkIndex() {
  return <Canvas>
    <MotionReveal stagger><SectionLabel>Selected work</SectionLabel>
    <RevealHeading as="h1" className="mt-5 max-w-[22ch] font-serif text-display-lg text-balance text-foreground">Different systems. Decisions people can make.</RevealHeading>
    <p className="mt-6 max-w-[62ch] text-body-lg text-foreground-muted">Teacher judgment, a job seeker’s next step, and a student’s understanding. Three product stories, followed by an independent exploration.</p></MotionReveal>
    <section className="mt-12 flex flex-col gap-4" aria-label="Product case studies">{workProjects.map((project) => <WorkCard key={project.slug} project={project} />)}</section>
    <section className="mt-12" aria-labelledby="explorations-heading"><MotionReveal><RevealHeading id="explorations-heading" className="mb-6 text-heading-md">Exploration</RevealHeading></MotionReveal>
      {experiments.filter((e) => e.status === "prototype").map((experiment) => <ExperimentCard key={experiment.slug} experiment={experiment} href={`/experiments/${experiment.slug}`} />)}
    </section>
    <div className="mt-8 flex flex-wrap gap-6"><InlineLink href="/experiments">All experiments</InlineLink><InlineLink href="/ai-systems">AI design decisions</InlineLink></div>
  </Canvas>;
}
