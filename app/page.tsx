import { RevealHeading } from "@/components/portfolio/reveal-heading";
import { MotionReveal } from "@/components/portfolio/motion-reveal";
import type { Metadata } from "next";
import Link from "next/link";
import { ArrowDown } from "lucide-react";
import { Canvas } from "@/components/app-shell/contextual-rail";
import { HeroHeadline } from "@/components/portfolio/hero-headline";
import { WorkCard } from "@/components/portfolio/work-card";
import { Action } from "@/components/system/action";
import { InlineLink } from "@/components/system/inline-link";
import { profile } from "@/content/profile";
import { resume } from "@/content/resume";
import { workProjects } from "@/content/work/projects";
import { experiments } from "@/content/experiments/experiments";
import { condensePeriod } from "@/lib/period";

export const metadata: Metadata = { alternates: { canonical: "/" } };

/**
 * Homepage, Plan 051 (October 2026 design audit).
 *
 * One idea per section and wide space between them (128px on desktop, 96px
 * on phones). The hero is Louie's own line with screenshots set inside it,
 * one sentence, and one link. On desktop the Ask Louie panel opens beside
 * the page on arrival (see `AskLouieProvider`), so the hero carries no ask
 * bar of its own.
 *
 * Every work card has the same anatomy: screenshot on a quiet frame, a mono
 * meta line, the title (`WorkCard`). Offboard leads at full width; the CK-12
 * pair shares the next row; the independent projects run three across.
 */

/** How I work: each principle, the sentence that shows it, and where. */
const PRINCIPLES = [
  { title: "Make the decision clear.", line: "From a class pattern to a teacher’s next step.", project: "CK-12 Foresights", href: "/work/ck12-analytics#decision-investigation" },
  { title: "Design the boundary of automation.", line: "Useful drafts, with the person in control.", project: "Offboard", href: "/work/offboard#decision-control" },
  { title: "Build something that can be questioned.", line: "A working hypothesis with explicit limits.", project: "Neuron Shift", href: "/experiments/neuron-shift#limits" },
] as const;

const sectionTitle = "font-display text-heading-xl text-foreground";

export default function Home() {
  const [lead, ...caseStudies] = workProjects;
  const independent = experiments.filter((e) => e.status === "prototype");

  return <Canvas width="wide" className="flex flex-col gap-24 sm:gap-32">
    <section aria-label="Introduction" className="pt-4 sm:pt-10">
      <p className="font-mono text-system uppercase text-foreground-muted">{profile.name} · {profile.role}</p>
      <HeroHeadline className="mt-6 max-w-[15em]" />
      <p className="mt-8 max-w-[46ch] text-body-lg text-pretty text-foreground-muted sm:text-lead">{profile.positioning.supporting}</p>
      <Link href="#work" className="focus-ring mt-6 inline-flex min-h-11 items-center gap-1.5 rounded-xs text-body font-medium text-foreground underline decoration-accent-fill decoration-2 underline-offset-[6px]">
        Explore my work<ArrowDown aria-hidden="true" className="size-4" />
      </Link>
    </section>

    {/* The record reads as reference: a plain list on the canvas, no band. */}
    <section aria-labelledby="experience-label">
      <MotionReveal>
        <h2 id="experience-label" className="font-mono text-system uppercase text-foreground-muted"><span className="text-foreground">Experience</span> · <span>{profile.brief[0]}</span></h2>
        <ul aria-label="Experience" className="mt-5 grid grid-cols-1 gap-x-8 min-[480px]:grid-cols-2 @4xl/canvas:grid-cols-4">
          {resume.roles.map((role) => (
            <li key={role.company} className="flex flex-col gap-1 border-t border-border-default py-4">
              <span className="font-mono text-system uppercase tabular-nums text-foreground-muted">{condensePeriod(role.period)}</span>
              <span className="mt-1 text-body font-semibold text-foreground">{role.company.replace(", Inc.", "")}</span>
              <span className="text-body-sm text-foreground-muted">{role.title}</span>
            </li>
          ))}
        </ul>
      </MotionReveal>
    </section>

    <section id="work" data-testid="featured-work" aria-labelledby="featured-work-label" className="flex scroll-mt-6 flex-col gap-8">
      <MotionReveal><div className="flex items-baseline justify-between gap-4">
        <RevealHeading id="featured-work-label" className={sectionTitle}>Case studies</RevealHeading>
        <Link href="/work" className="focus-ring inline-flex min-h-11 items-center rounded-xs font-mono text-system uppercase text-foreground hover:text-foreground-muted">All work →</Link>
      </div></MotionReveal>
      <div className="grid gap-x-8 gap-y-16 @4xl/canvas:grid-cols-2">
        <WorkCard
          href={lead.href}
          image={lead.tileImage ?? (lead.image ? { src: lead.image, alt: lead.imageAlt, width: lead.imageWidth, height: lead.imageHeight } : null)}
          meta={`${lead.name} · ${lead.role}`}
          title={lead.title}
          size="lead"
          eager
          className="@4xl/canvas:col-span-2"
        />
        {caseStudies.map((project) => (
          <WorkCard
            key={project.slug}
            href={project.href}
            image={project.image ? { src: project.image, alt: project.imageAlt, width: project.imageWidth, height: project.imageHeight } : null}
            meta={`${project.name} · ${project.role}`}
            title={project.title}
          />
        ))}
      </div>
    </section>

    <section data-testid="independent-work" aria-labelledby="independent-work-label" className="flex flex-col gap-8">
      <MotionReveal><div>
        <RevealHeading id="independent-work-label" className={sectionTitle}>Independent projects</RevealHeading>
        <p className="mt-3 text-body text-foreground-muted">Built on my own. Each one says how far it got.</p>
      </div></MotionReveal>
      <div className="grid gap-x-8 gap-y-12 @4xl/canvas:grid-cols-3">
        {independent.map((experiment) => (
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

    <section aria-labelledby="how-i-work-label">
      <MotionReveal><div className="flex flex-wrap items-baseline justify-between gap-x-8 gap-y-3">
        <RevealHeading id="how-i-work-label" className={sectionTitle}>How I work</RevealHeading>
        <p className="flex flex-wrap gap-x-6 gap-y-2"><InlineLink href="/about">About Louie</InlineLink><InlineLink href="/ai-systems">Explore the AI design decisions</InlineLink></p>
      </div></MotionReveal>
      <MotionReveal stagger><ul className="mt-8 border-t border-border-default">
        {PRINCIPLES.map((principle) => (
          <li key={principle.title} className="grid gap-2 border-b border-border-default py-6 sm:grid-cols-2 sm:items-baseline sm:gap-8">
            <h3 className="font-display text-heading-lg text-foreground">{principle.title}</h3>
            <p className="text-body text-foreground-muted">
              {principle.line}{" "}
              <InlineLink href={principle.href} className="whitespace-nowrap">{principle.project}<span aria-hidden="true"> →</span></InlineLink>
            </p>
          </li>
        ))}
      </ul></MotionReveal>
    </section>

    <section aria-labelledby="closing-label" className="pb-8">
      <MotionReveal><h2 id="closing-label" className="max-w-[16ch] font-display text-display-lg text-balance text-foreground">Hiring for an <em>AI product?</em></h2></MotionReveal>
      <div className="mt-8 flex flex-wrap gap-3">
        {profile.links.calendly ? <Action size="lg" className="rounded-full" render={<a href={profile.links.calendly} target="_blank" rel="noreferrer noopener" />}>Book time<span className="sr-only"> (opens in a new tab)</span></Action> : null}
        {profile.links.email ? <Action size="lg" variant="secondary" className="rounded-full" render={<a href={`mailto:${profile.links.email}`} />}>Email</Action> : null}
        {profile.links.linkedin ? <Action size="lg" variant="secondary" className="rounded-full" render={<a href={profile.links.linkedin} target="_blank" rel="noreferrer noopener" />}>LinkedIn<span className="sr-only"> (opens in a new tab)</span></Action> : null}
      </div>
    </section>
  </Canvas>;
}
