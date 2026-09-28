import { RevealHeading } from "@/components/portfolio/reveal-heading";
import { MotionReveal } from "@/components/portfolio/motion-reveal";
import type { Metadata } from "next";
import Link from "next/link";
import { Canvas } from "@/components/app-shell/contextual-rail";
import { JobDescriptionDialog } from "@/components/ai/job-description-dialog";
import { ProjectPlate, ExperimentPlate } from "@/components/portfolio/project-plates";
import { Action } from "@/components/system/action";
import { InlineLink } from "@/components/system/inline-link";
import { profile } from "@/content/profile";
import { resume } from "@/content/resume";
import { workProjects, featuredWork } from "@/content/work/projects";
import { experiments } from "@/content/experiments/experiments";
import { condensePeriod } from "@/lib/period";

export const metadata: Metadata = { alternates: { canonical: "/" } };

/**
 * Homepage, direction A "The work, framed" (Plan 037).
 *
 * The first view answers a recruiter's questions: the positioning line, the
 * companies and years, and two ways in (the work, or a job-description
 * check). Below it, each project sits on its own brand-color plate.
 */

export default function Home() {
  const [firstSentence] = profile.positioning.primary.split(/(?<=\.)\s/);
  const neuron = experiments.find((e) => e.slug === "neuron-shift" && e.status === "prototype");
  const moreWork = workProjects.filter((p) => !p.featured);

  return <Canvas width="wide" className="flex flex-col gap-16 sm:gap-20">
    <section aria-label="Introduction" className="grid gap-10 pt-4 lg:grid-cols-[minmax(0,1.9fr)_minmax(0,1fr)] lg:items-end lg:gap-16 lg:pt-10">
      <MotionReveal stagger><div>
        <RevealHeading as="h1" quietWords={firstSentence.split(" ").length} className="font-display text-home-hero text-balance text-foreground">{profile.positioning.primary}</RevealHeading>
        <p className="mt-7 max-w-[40ch] text-body-lg text-foreground-muted sm:text-heading-md sm:font-normal">{profile.positioning.supporting}</p>
        <div className="mt-8 flex flex-wrap gap-3">
          <Action size="lg" className="rounded-full" render={<Link href="#work" />}>See the work</Action>
          <JobDescriptionDialog trigger={<Action variant="secondary" size="lg" className="rounded-full">Compare a job description</Action>} />
        </div>
      </div></MotionReveal>

      <MotionReveal><div>
        <ul aria-label="Experience" className="border-t border-foreground">
          {resume.roles.map((role) => (
            <li key={role.company} className="grid grid-cols-[1fr_auto] gap-x-4 gap-y-0.5 border-b border-border-subtle py-3.5">
              <span className="font-semibold text-foreground">{role.company.replace(", Inc.", "")}</span>
              <span className="text-body-sm tabular-nums text-foreground-muted">{condensePeriod(role.period)}</span>
              <span className="col-span-2 text-body-sm text-foreground-muted">{role.title}{role.scale ? ` · ${role.scale}` : ""}</span>
            </li>
          ))}
        </ul>
        <p className="mt-3.5 text-body-sm text-foreground-muted">{profile.brief[0]}{profile.location ? ` · ${profile.location}` : ""}</p>
      </div></MotionReveal>
    </section>

    <section id="work" data-testid="featured-work" aria-labelledby="featured-work-label" className="flex scroll-mt-6 flex-col gap-5">
      <MotionReveal><div className="flex items-baseline justify-between gap-4">
        <RevealHeading id="featured-work-label" className="font-display text-heading-lg text-foreground">Selected work</RevealHeading>
        <Action variant="ghost" render={<Link href="/work" />}>All work →</Action>
      </div></MotionReveal>
      {featuredWork.map((project, index) => <ProjectPlate key={project.slug} project={project} index={index} eager={index === 0} />)}
    </section>

    <section aria-labelledby="more-work-label" className="flex flex-col gap-5">
      <MotionReveal><RevealHeading id="more-work-label" className="font-display text-heading-lg text-foreground">More work</RevealHeading></MotionReveal>
      {moreWork.map((project, index) => <ProjectPlate key={project.slug} project={project} index={index} />)}
      {neuron ? <ExperimentPlate experiment={neuron} index={moreWork.length} /> : null}
    </section>

    <section aria-labelledby="how-i-work-label" className="grid gap-8 border-t border-border-subtle pt-12 lg:grid-cols-[minmax(0,1fr)_minmax(0,2fr)] lg:gap-16">
      <MotionReveal><div>
        <RevealHeading id="how-i-work-label" className="font-display text-heading-lg text-foreground">How I work</RevealHeading>
        <p className="mt-3 text-body text-foreground-muted">{profile.brief[0]}</p>
      </div></MotionReveal>
      <MotionReveal stagger><ul className="border-t border-foreground">
        <li className="grid gap-1.5 border-b border-border-subtle py-5 sm:grid-cols-2 sm:items-baseline sm:gap-6"><h3 className="text-heading-md text-foreground">Make the decision clear.</h3><InlineLink href="/work/ck12-analytics#decision-investigation">From a class pattern to a teacher’s next step.</InlineLink></li>
        <li className="grid gap-1.5 border-b border-border-subtle py-5 sm:grid-cols-2 sm:items-baseline sm:gap-6"><h3 className="text-heading-md text-foreground">Design the boundary of automation.</h3><InlineLink href="/work/offboard#decision-control">Useful drafts, with the person in control.</InlineLink></li>
        <li className="grid gap-1.5 border-b border-border-subtle py-5 sm:grid-cols-2 sm:items-baseline sm:gap-6"><h3 className="text-heading-md text-foreground">Build something that can be questioned.</h3><InlineLink href="/experiments/neuron-shift#limits">A working hypothesis with explicit limits.</InlineLink></li>
      </ul></MotionReveal>
      <div className="flex flex-wrap gap-6 lg:col-start-2"><InlineLink href="/about">About Louie</InlineLink><InlineLink href="/ai-systems">Explore the AI design decisions</InlineLink></div>
    </section>

    <section aria-labelledby="closing-label" className="flex flex-wrap items-end justify-between gap-8 rounded-panel bg-accent-fill p-8 text-accent-on-fill sm:p-12">
      <MotionReveal><h2 id="closing-label" className="max-w-[16ch] font-display text-display-lg text-balance">Hiring for an AI product?</h2></MotionReveal>
      <div className="flex flex-wrap gap-3">
        {profile.links.calendly ? <Action size="lg" className="rounded-full bg-canvas text-foreground hover:bg-surface-muted" render={<a href={profile.links.calendly} target="_blank" rel="noreferrer noopener" />}>Book time<span className="sr-only"> (opens in a new tab)</span></Action> : null}
        {profile.links.email ? <Action size="lg" className="rounded-full border border-accent-on-fill/40 bg-transparent text-accent-on-fill hover:bg-accent-fill-hover" render={<a href={`mailto:${profile.links.email}`} />}>Email</Action> : null}
        {profile.links.linkedin ? <Action size="lg" className="rounded-full border border-accent-on-fill/40 bg-transparent text-accent-on-fill hover:bg-accent-fill-hover" render={<a href={profile.links.linkedin} target="_blank" rel="noreferrer noopener" />}>LinkedIn<span className="sr-only"> (opens in a new tab)</span></Action> : null}
      </div>
    </section>
  </Canvas>;
}
