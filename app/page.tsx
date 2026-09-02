import type { Metadata } from "next";
import Link from "next/link";

import { Canvas, ContextualRail } from "@/components/app-shell/contextual-rail";
import { AskPanel } from "@/components/ai/ask-panel";
import { WorkCard } from "@/components/portfolio/work-card";
import { Action } from "@/components/system/action";
import { SectionLabel } from "@/components/system/section-label";
import { profile } from "@/content/profile";
import { workProjects } from "@/content/work/projects";

export const metadata: Metadata = {
  alternates: { canonical: "/" },
};

/**
 * Homepage (spec §11, restructured by owner decision, 2026-08-23 — Plans 011
 * and 012).
 *
 * A recruiter should understand within ten seconds that Louie designs
 * sophisticated AI products and can build them (spec §1), and should reach
 * the work as fast as possible: Featured work sits directly after the hero,
 * ahead of the AI surface.
 *
 * The AI thread lives in the rail as the Ask panel and answers stream inside
 * it, conventionally. An earlier iteration routed answers to an "Answer
 * Canvas" in the main column; Louie reviewed it and preferred the
 * conversation staying in one place, so that surface was removed (owner
 * decision, 2026-08-23).
 */
const BRIEF_POINTS = profile.brief;

export default function Home() {
  return (
    <Canvas
      rail={
        <ContextualRail bare aria-label="Ask Louie">
          <AskPanel />
        </ContextualRail>
      }
      stackRail
      stackedRailAfter="featured-work"
      railDefaultSize={350}
      className="flex flex-col gap-14"
    >
      <section>
        <SectionLabel>{profile.positioning.eyebrow}</SectionLabel>

        {/* Owner decision (2026-08-27): one weight, one colour, one size.
            The accent italic tail was Louie's call — see README
            "Deviations". Owner decision (2026-08-31): back up to
            `display-xl`; at `display-lg` the headline read too small. */}
        <h1 className="mt-6 max-w-[17ch] font-serif text-display-xl text-balance text-foreground">
          {profile.positioning.primary}
        </h1>

        <p className="mt-6 max-w-[56ch] text-body-lg text-foreground-muted">
          {profile.positioning.supporting}
        </p>

        {/* TODO(content): second line summarizing CK-12 and Offboard,
            pending Louie's approved wording (spec §11 §1). */}
        {profile.heroSecondaryLine ? (
          <p className="mt-3 max-w-[56ch] text-body-lg text-foreground-muted">
            {profile.heroSecondaryLine}
          </p>
        ) : null}

        {/* No hero CTAs (owner decision, 2026-08-27). Featured work sits
            directly below and the Ask panel is already on screen in the
            rail, so both buttons pointed at things a visitor can already
            see. */}
      </section>

      <section
        data-testid="featured-work"
        aria-labelledby="featured-work-label"
        className="flex flex-col gap-6"
      >
        <SectionLabel id="featured-work-label">Featured work</SectionLabel>

        {/* Two per row with the image stacked above the text (owner
            decision, 2026-08-31). One column below `sm`, and again while the
            content column is narrow — the homepage gives up width to the Ask
            rail, so `@container` sizing off the column itself is what decides
            this, not the viewport. */}
        <div className="@container">
          <div className="grid gap-5 @lg:grid-cols-2">
            {workProjects.map((project) => (
              <WorkCard key={project.slug} project={project} layout="stacked" />
            ))}
          </div>
        </div>

        <Action
          variant="ghost"
          render={<Link href="/work" />}
          className="self-start"
        >
          All work →
        </Action>
      </section>

      {/* Plan 012: substantive answers compose here instead of piling
          up as bubbles in the rail. Renders nothing while idle. */}

      <section className="flex flex-col gap-6 border-t border-border-subtle pt-10">
        <SectionLabel>In brief</SectionLabel>

        <ul className="grid gap-x-8 gap-y-2.5 sm:grid-cols-2">
          {BRIEF_POINTS.map((point) => (
            <li
              key={point}
              className="flex gap-2.5 text-body-sm text-foreground-muted"
            >
              <span
                aria-hidden="true"
                className="mt-2 size-1 shrink-0 rounded-full bg-accent"
              />
              {point}
            </li>
          ))}
        </ul>

        {/* TODO(asset): portrait or illustration (spec §11 §5). */}
        <blockquote className="font-serif text-body-lg text-balance text-foreground-muted">
          {profile.quotes.philosophy}
        </blockquote>

        <Action
          variant="secondary"
          size="sm"
          render={<Link href="/about" />}
          className="self-start"
        >
          About Louie
        </Action>
      </section>
    </Canvas>
  );
}
