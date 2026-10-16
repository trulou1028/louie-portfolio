import { RevealHeading } from "@/components/portfolio/reveal-heading";
import { MotionReveal } from "@/components/portfolio/motion-reveal";
import type { Metadata } from "next";
import { Canvas } from "@/components/app-shell/contextual-rail";
import { WorkCard, WorkRow } from "@/components/portfolio/work-card";
import { InlineLink } from "@/components/system/inline-link";
import { workProjects } from "@/content/work/projects";
import { experiments } from "@/content/experiments/experiments";
export const metadata: Metadata = { title: "Work", description: "Product decisions across learning analytics, career transitions, and conversational AI.", alternates: { canonical: "/work" } };

/**
 * The Work page (Plan 051, R9). One row per case study: the screenshot on a
 * quiet frame, then meta, title, the one-sentence summary, and a read link.
 * The facts rows moved to each case study. The independent projects use the
 * homepage card.
 */
export default function WorkIndex() {
  return <Canvas width="wide">
    <MotionReveal>
    <RevealHeading as="h1" className="max-w-[18ch] font-display text-display-lg text-balance text-foreground">Different systems. Decisions people can make.</RevealHeading>
    <p className="mt-6 max-w-[52ch] text-body-lg text-foreground-muted">Teacher judgment, a job seeker’s next step, and a student’s understanding. Three product stories, then three projects built on my own.</p></MotionReveal>
    <section className="mt-16 flex flex-col gap-24 sm:mt-24 sm:gap-28" aria-label="Product case studies">
      {workProjects.map((project, index) => (
        <WorkRow
          key={project.slug}
          href={project.href}
          image={project.tileImage ?? (project.image ? { src: project.image, alt: project.imageAlt, width: project.imageWidth, height: project.imageHeight } : null)}
          meta={`${project.name} · ${project.role}`}
          title={project.title}
          summary={project.summary}
          eager={index === 0}
        />
      ))}
    </section>
    <section className="mt-28 sm:mt-36" aria-labelledby="explorations-heading">
      <MotionReveal><RevealHeading id="explorations-heading" className="font-display text-heading-xl text-foreground">Built on my own</RevealHeading>
      <p className="mt-3 text-body text-foreground-muted">Each one says how far it got.</p></MotionReveal>
      <div className="mt-8 grid gap-x-8 gap-y-12 @4xl/canvas:grid-cols-3">
        {experiments.filter((e) => e.status === "prototype").map((experiment) => (
          <WorkCard
            key={experiment.slug}
            href={`/experiments/${experiment.slug}`}
            image={experiment.image ?? null}
            meta={experiment.meta ? `${experiment.name} · ${experiment.meta}` : experiment.name}
            title={experiment.title}
            size="small"
          />
        ))}
      </div>
    </section>
    <div className="mt-16 flex flex-wrap gap-6"><InlineLink href="/experiments">All experiments</InlineLink><InlineLink href="/ai-systems">AI design decisions</InlineLink></div>
  </Canvas>;
}
