import { RevealHeading } from "@/components/portfolio/reveal-heading";
import { MotionReveal } from "@/components/portfolio/motion-reveal";
import type { Metadata } from "next";
import Link from "next/link";
import { Canvas } from "@/components/app-shell/contextual-rail";
import { HeroAsk } from "@/components/ai/hero-ask";
import { ProjectTile, ExperimentTile } from "@/components/portfolio/project-plates";
import { HeroLoop } from "@/components/portfolio/hero-loop";
import { Action } from "@/components/system/action";
import { InlineLink } from "@/components/system/inline-link";
import { profile } from "@/content/profile";
import { resume } from "@/content/resume";
import { workProjects } from "@/content/work/projects";
import { experiments } from "@/content/experiments/experiments";
import { condensePeriod } from "@/lib/period";

export const metadata: Metadata = { alternates: { canonical: "/" } };

/**
 * Homepage, direction A "The work, framed" (Plans 037, 038).
 *
 * The first view answers a recruiter's questions: the positioning line, the
 * companies and years, and two ways in (the work, or a job-description
 * check). The hero pairs the headline with a looping recording of the live
 * Neuron Shift prototype (Plan 041); "Clear decisions." carries the case
 * studies' amber redline (Plan 039), and all four projects follow in a bento
 * grid (Plan 038).
 */

/* Bento rhythm: large, small / small, large. Static strings for Tailwind. */
const TILE_LAYOUT = [
  { size: "large", span: "@4xl/canvas:col-span-7" },
  { size: "small", span: "@4xl/canvas:col-span-5" },
  { size: "small", span: "@4xl/canvas:col-span-5" },
  { size: "large", span: "@4xl/canvas:col-span-7" },
] as const;

/** How I work: each principle, the sentence that shows it, and where. */
const PRINCIPLES = [
  { title: "Make the decision clear.", line: "From a class pattern to a teacher’s next step.", project: "CK-12 Foresights", href: "/work/ck12-analytics#decision-investigation" },
  { title: "Design the boundary of automation.", line: "Useful drafts, with the person in control.", project: "Offboard", href: "/work/offboard#decision-control" },
  { title: "Build something that can be questioned.", line: "A working hypothesis with explicit limits.", project: "Neuron Shift", href: "/experiments/neuron-shift#limits" },
] as const;

export default function Home() {
  const [firstSentence] = profile.positioning.primary.split(/(?<=\.)\s/);
  const neuron = experiments.find((e) => e.slug === "neuron-shift" && e.status === "prototype");
  const layout = (index: number) => TILE_LAYOUT[index % TILE_LAYOUT.length];

  return <Canvas width="wide" className="flex flex-col gap-14 sm:gap-16">
    <section aria-label="Introduction">
      {/* Plan 041: work-led hero. The headline sits beside a looping screen
          recording of the live Neuron Shift prototype. */}
      <div className="grid items-center gap-10 @5xl/canvas:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)] @5xl/canvas:gap-14">
        <MotionReveal stagger className="@container"><div>
          <RevealHeading as="h1" quietWords={firstSentence.split(" ").length} markLabel="the job" className="font-display text-home-hero text-balance text-foreground">{profile.positioning.primary}</RevealHeading>
          <p className="mt-10 max-w-[40ch] text-body-lg text-foreground-muted sm:text-lead">{profile.positioning.supporting}</p>
          {/* Plan 042: the ask bar replaces the two buttons. It opens the
              Ask Louie side panel; "See the work" is a link under it. */}
          <HeroAsk className="mt-8 max-w-[560px]" />
        </div></MotionReveal>

        <MotionReveal><figure>
          <HeroLoop
            mp4="/work/neuron-shift/hero-loop.mp4"
            webm="/work/neuron-shift/hero-loop.webm"
            poster="/work/neuron-shift/hero-loop-poster.jpg"
            width={1600}
            height={1000}
            label="Screen recording of the Neuron Shift prototype: an operator takes the shift, traces the affected power path, previews two failures, and approves a recommendation after four checks. All data is simulated."
          />
          <figcaption className="mt-3 text-body-sm text-foreground-muted">
            <span className="font-semibold text-foreground">Neuron Shift</span> prototype, simulated data.{" "}
            <InlineLink href="/experiments/neuron-shift">Read the write-up</InlineLink>
          </figcaption>
        </figure></MotionReveal>
      </div>

      <MotionReveal><ul aria-label="Experience" className="mt-12 grid grid-cols-1 gap-x-6 border-t border-foreground sm:grid-cols-2 @4xl/canvas:grid-cols-4">
        {resume.roles.map((role) => (
          <li key={role.company} className="flex flex-col border-b border-border-subtle py-3.5 @4xl/canvas:border-b-0">
            <span className="font-semibold text-foreground">{role.company.replace(", Inc.", "")}</span>
            <span className="text-body-sm text-foreground-muted">{role.title}</span>
            <span className="text-body-sm tabular-nums text-foreground-muted">{condensePeriod(role.period)}{role.scale ? ` · ${role.scale}` : ""}</span>
          </li>
        ))}
      </ul></MotionReveal>
    </section>

    <section id="work" data-testid="featured-work" aria-labelledby="featured-work-label" className="flex scroll-mt-6 flex-col gap-5">
      <MotionReveal><div className="flex items-baseline justify-between gap-4">
        <RevealHeading id="featured-work-label" className="font-display text-heading-lg text-foreground">Selected work</RevealHeading>
        <Action variant="ghost" render={<Link href="/work" />}>All work →</Action>
      </div></MotionReveal>
      <div className="grid gap-4 @4xl/canvas:grid-cols-12">
        {workProjects.map((project, index) => (
          <ProjectTile key={project.slug} project={project} size={layout(index).size} className={layout(index).span} eager={index === 0} />
        ))}
        {neuron ? <ExperimentTile experiment={neuron} size={layout(workProjects.length).size} className={layout(workProjects.length).span} /> : null}
      </div>
    </section>

    <section aria-labelledby="how-i-work-label" className="grid gap-8 border-t border-border-subtle pt-12 @4xl/canvas:grid-cols-[minmax(0,1fr)_minmax(0,2fr)] @4xl/canvas:gap-16">
      <MotionReveal><div>
        <RevealHeading id="how-i-work-label" className="font-display text-heading-lg text-foreground">How I work</RevealHeading>
        <p className="mt-3 text-body text-foreground-muted">{profile.brief[0]}</p>
        <p className="mt-6 flex flex-wrap gap-x-6 gap-y-2"><InlineLink href="/about">About Louie</InlineLink><InlineLink href="/ai-systems">Explore the AI design decisions</InlineLink></p>
      </div></MotionReveal>
      <MotionReveal stagger><ul className="border-t border-foreground">
        {PRINCIPLES.map((principle) => (
          <li key={principle.title} className="grid gap-1.5 border-b border-border-subtle py-5 sm:grid-cols-2 sm:items-baseline sm:gap-6">
            <h3 className="text-heading-md text-foreground">{principle.title}</h3>
            <p className="text-body text-foreground-muted">
              {principle.line}{" "}
              <InlineLink href={principle.href} className="whitespace-nowrap">{principle.project}<span aria-hidden="true"> →</span></InlineLink>
            </p>
          </li>
        ))}
      </ul></MotionReveal>
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
