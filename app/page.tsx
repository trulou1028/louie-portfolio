import { RevealHeading } from "@/components/portfolio/reveal-heading";
import { MotionReveal } from "@/components/portfolio/motion-reveal";
import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { ArrowDown } from "lucide-react";
import { Canvas } from "@/components/app-shell/contextual-rail";
import { HeroAsk } from "@/components/ai/hero-ask";
import { ProjectTile, ExperimentTile } from "@/components/portfolio/project-plates";
import { Action } from "@/components/system/action";
import { InlineLink } from "@/components/system/inline-link";
import { profile } from "@/content/profile";
import { resume } from "@/content/resume";
import { workProjects } from "@/content/work/projects";
import { experiments } from "@/content/experiments/experiments";
import { condensePeriod } from "@/lib/period";

export const metadata: Metadata = { alternates: { canonical: "/" } };

/**
 * Homepage, direction A "The work, framed" (Plans 037, 038), revised by the
 * October 2026 homepage audit.
 *
 * The first view answers a recruiter's questions: the positioning line, two
 * ways in (ask, or go straight to the work), the flagship product, and the
 * companies and years. "Clear decisions." carries the case studies' amber
 * redline (Plan 039), without its tag: the tag needs the case studies to
 * explain it.
 *
 * The hero renders without an entrance animation. It is the first paint, and
 * on phones the masked headline stayed hidden for seconds (audit, finding 1).
 *
 * Work comes in two groups so size follows evidence: the case studies, with
 * Offboard full width, then the independent projects as three equal, smaller
 * tiles.
 */

/** How I work: each principle, the sentence that shows it, and where. */
const PRINCIPLES = [
  { title: "Make the decision clear.", line: "From a class pattern to a teacher’s next step.", project: "CK-12 Foresights", href: "/work/ck12-analytics#decision-investigation" },
  { title: "Design the boundary of automation.", line: "Useful drafts, with the person in control.", project: "Offboard", href: "/work/offboard#decision-control" },
  { title: "Build something that can be questioned.", line: "A working hypothesis with explicit limits.", project: "Neuron Shift", href: "/experiments/neuron-shift#limits" },
] as const;

export default function Home() {
  const [firstSentence] = profile.positioning.primary.split(/(?<=\.)\s/);
  const [lead, ...caseStudies] = workProjects;
  const independent = experiments.filter((e) => e.status === "prototype");

  return <Canvas width="wide" className="flex flex-col gap-14 sm:gap-16">
    <section aria-label="Introduction">
      <div className="grid items-center gap-10 @5xl/canvas:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)] @5xl/canvas:gap-14">
        <div className="@container">
          <RevealHeading as="h1" quietWords={firstSentence.split(" ").length} mark className="font-display text-home-hero text-balance text-foreground">{profile.positioning.primary}</RevealHeading>
          <p className="mt-8 max-w-[40ch] text-body-lg text-foreground-muted sm:text-lead">{profile.positioning.supporting}</p>
          {/* Plan 042: the ask bar opens the Ask Louie side panel. One link
              under it is for visitors who would rather look than ask.
              Booking lives in the header's Contact menu and the closing
              panel, so the hero keeps its choices few. */}
          <HeroAsk className="mt-8 max-w-[560px]" />
          <Link href="#work" className="focus-ring mt-5 inline-flex min-h-11 items-center gap-1.5 rounded-xs text-body font-semibold text-foreground underline decoration-border-strong decoration-1 underline-offset-4 hover:decoration-current">
            See selected work<ArrowDown aria-hidden="true" className="size-4" />
          </Link>
        </div>

        {/* The flagship, not a side project, in the most-viewed slot. The
            plate matches the backdrop of packet-panels.webp, so the panels
            float on it without a second frame. Hidden on phones, where the
            Offboard tile is one scroll below. */}
        {lead.image ? (
          <figure className="max-sm:hidden">
            <div className="overflow-hidden rounded-panel bg-plate-offboard p-4 sm:p-6">
              <Image src={lead.image} alt={lead.imageAlt} width={lead.imageWidth} height={lead.imageHeight} preload loading="eager" sizes="(min-width: 1280px) 680px, 90vw" className="h-auto w-full" />
            </div>
            <figcaption className="mt-3 text-body-sm text-foreground-muted">
              <span className="font-semibold text-foreground">{lead.name}</span>, designed and engineered end to end as founding designer.
            </figcaption>
          </figure>
        ) : null}
      </div>
    </section>

    {/* The record sits apart from the hero, on its own quiet band, so it
        reads as reference rather than one more thing to act on. Its
        entrance is a plain fade (no masked words), so nothing it holds is
        hidden for long. */}
    <section aria-labelledby="experience-label" className="rounded-panel bg-surface-muted p-6 sm:p-8">
      <MotionReveal>
        <h2 id="experience-label" className="text-body-sm text-foreground-muted">
          <span className="font-semibold text-foreground">Experience</span> · <span>{profile.brief[0]}</span>
        </h2>
        <ul aria-label="Experience" className="mt-5 grid grid-cols-2 gap-x-6 gap-y-5 @4xl/canvas:grid-cols-4">
          {resume.roles.map((role) => (
            <li key={role.company} className="flex flex-col gap-0.5 text-body-sm @4xl/canvas:border-l @4xl/canvas:border-border-default @4xl/canvas:pl-5 @4xl/canvas:first:border-l-0 @4xl/canvas:first:pl-0">
              <span className="font-semibold text-foreground">{role.company.replace(", Inc.", "")}</span>
              <span className="text-foreground-muted">{role.title}</span>
              <span className="tabular-nums text-foreground-muted">{condensePeriod(role.period)}{role.scale ? ` · ${role.scale}` : ""}</span>
            </li>
          ))}
        </ul>
      </MotionReveal>
    </section>

    <section id="work" data-testid="featured-work" aria-labelledby="featured-work-label" className="flex scroll-mt-6 flex-col gap-5">
      <MotionReveal><div className="flex items-baseline justify-between gap-4">
        <RevealHeading id="featured-work-label" className="font-display text-heading-lg text-foreground">Case studies</RevealHeading>
        <Action variant="ghost" render={<Link href="/work" />}>All work →</Action>
      </div></MotionReveal>
      <div className="grid gap-4 @4xl/canvas:grid-cols-12">
        <ProjectTile project={lead} size="wide" className="@4xl/canvas:col-span-12" />
        {caseStudies.map((project) => (
          <ProjectTile key={project.slug} project={project} size="small" className="@4xl/canvas:col-span-6" />
        ))}
      </div>
    </section>

    <section data-testid="independent-work" aria-labelledby="independent-work-label" className="flex flex-col gap-5">
      <MotionReveal><div>
        <RevealHeading id="independent-work-label" className="font-display text-heading-lg text-foreground">Independent projects</RevealHeading>
        <p className="mt-2 text-body text-foreground-muted">Built on my own. Each one says how far it got.</p>
      </div></MotionReveal>
      <div className="grid gap-4 @4xl/canvas:grid-cols-3">
        {independent.map((experiment) => (
          <ExperimentTile key={experiment.slug} experiment={experiment} size="small" />
        ))}
      </div>
    </section>

    <section aria-labelledby="how-i-work-label" className="grid gap-8 border-t border-border-subtle pt-12 @4xl/canvas:grid-cols-[minmax(0,1fr)_minmax(0,2fr)] @4xl/canvas:gap-16">
      <MotionReveal><div>
        <RevealHeading id="how-i-work-label" className="font-display text-heading-lg text-foreground">How I work</RevealHeading>
        <p className="mt-4 flex flex-wrap gap-x-6 gap-y-2"><InlineLink href="/about">About Louie</InlineLink><InlineLink href="/ai-systems">Explore the AI design decisions</InlineLink></p>
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
