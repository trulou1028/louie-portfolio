import { RevealHeading } from "@/components/portfolio/reveal-heading";
import { MotionReveal } from "@/components/portfolio/motion-reveal";
import type { Metadata } from "next";
import Link from "next/link";
import { Canvas } from "@/components/app-shell/contextual-rail";
import { WorkCard } from "@/components/portfolio/work-card";
import { ExperimentCard } from "@/components/portfolio/experiment-card";
import { Action } from "@/components/system/action";
import { SectionLabel } from "@/components/system/section-label";
import { InlineLink } from "@/components/system/inline-link";
import { profile } from "@/content/profile";
import { workProjects, featuredWork } from "@/content/work/projects";
import { experiments } from "@/content/experiments/experiments";

export const metadata: Metadata = { alternates: { canonical: "/" } };

export default function Home() {
  return <Canvas className="flex flex-col gap-14">
    <MotionReveal stagger><section>
      <SectionLabel>{profile.positioning.eyebrow}</SectionLabel>
      <RevealHeading as="h1" className="mt-6 max-w-[18ch] font-serif text-display-xl text-balance text-foreground">{profile.positioning.primary}</RevealHeading>
      <p className="mt-6 max-w-[56ch] text-body-lg text-foreground-muted">{profile.positioning.supporting}</p>
    </section></MotionReveal>
    <section data-testid="featured-work" aria-labelledby="featured-work-label" className="flex flex-col gap-6">
      <MotionReveal><RevealHeading id="featured-work-label" className="text-heading-md text-foreground">Selected work</RevealHeading></MotionReveal>
      <div className="flex flex-col gap-4">{featuredWork.map((project) => <WorkCard key={project.slug} project={project} />)}</div>
      <Action variant="ghost" render={<Link href="/work" />} className="self-start">All work →</Action>
    </section>
    <section className="flex flex-col gap-6" aria-labelledby="more-work-label">
      <MotionReveal><RevealHeading id="more-work-label" className="text-heading-md text-foreground">More product work</RevealHeading></MotionReveal>
      {workProjects.filter((p) => !p.featured).map((project) => <WorkCard key={project.slug} project={project} />)}
    </section>
    <section className="flex flex-col gap-6" aria-labelledby="exploration-label">
      <MotionReveal><RevealHeading id="exploration-label" className="text-heading-md text-foreground">An idea, made testable</RevealHeading></MotionReveal>
      {experiments.filter((e) => e.status === "prototype").map((experiment) => <ExperimentCard key={experiment.slug} experiment={experiment} href={`/experiments/${experiment.slug}`} />)}
    </section>
    <section className="border-t border-border-subtle pt-10">
      <MotionReveal><RevealHeading className="text-heading-md text-foreground">How I work</RevealHeading></MotionReveal>
      <MotionReveal><p className="mt-4 text-body text-foreground-muted">{profile.brief[0]}</p></MotionReveal>
      <MotionReveal stagger><ul className="mt-6 flex flex-col gap-4 text-body text-foreground-muted">
        <li>Make the decision clear. <InlineLink href="/work/ck12-analytics#decision-investigation">From a class pattern to a teacher’s next step.</InlineLink></li>
        <li>Design the boundary of automation. <InlineLink href="/work/offboard#decision-control">Useful drafts, with the person in control.</InlineLink></li>
        <li>Build something that can be questioned. <InlineLink href="/experiments/neuron-shift#limits">A working hypothesis with explicit limits.</InlineLink></li>
      </ul></MotionReveal>
      <div className="mt-8 flex flex-wrap gap-6"><InlineLink href="/about">About Louie</InlineLink><InlineLink href="/ai-systems">Explore the AI design decisions</InlineLink></div>
    </section>
  </Canvas>;
}
