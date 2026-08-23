import Link from "next/link";

import { Canvas } from "@/components/app-shell/contextual-rail";
import { AiLouieThread } from "@/components/ai/ai-louie-thread";
import { WorkCard } from "@/components/portfolio/work-card";
import { Action } from "@/components/system/action";
import { SectionLabel } from "@/components/system/section-label";
import { profile } from "@/content/profile";
import { workProjects } from "@/content/work/projects";

/**
 * Homepage (spec §11, restructured by owner decision, 2026-08-23 — Plan 011).
 *
 * A recruiter should understand within ten seconds that Louie designs
 * sophisticated AI products and can build them (spec §1), and should reach
 * the work as fast as possible: Featured work sits directly after the hero,
 * ahead of the AI surface. There is no contextual rail on this page — Plan
 * 012 relocates the AI thread there; until then it stays in the main column
 * so every intermediate state keeps the e2e suite green.
 */
const BRIEF_POINTS = profile.brief;

export default function Home() {
  const { primary, primaryEmphasis } = profile.positioning;
  // Render the tail in accent italic without letting the heading text drift
  // from the source wording.
  const lead = primary.slice(0, primary.length - primaryEmphasis.length).trimEnd();

  return (
    <Canvas>
      <div className="flex flex-col gap-14">

          <section>
            <SectionLabel>{profile.positioning.eyebrow}</SectionLabel>

            <h1 className="mt-6 max-w-[15ch] font-serif text-display-xl text-balance text-foreground">
              {lead}{" "}
              {/* Stylistic, not semantic emphasis — a <span>, so screen
                  readers do not announce stress that isn't meant. */}
              <span className="italic text-accent">{primaryEmphasis}</span>
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

            <div className="mt-9 flex flex-wrap gap-3">
              <Action render={<Link href="/work" />}>View selected work</Action>
              <Action variant="secondary" render={<Link href="#ask-ai-louie" />}>
                Ask AI Louie
              </Action>
            </div>
          </section>

          <section
            data-testid="featured-work"
            aria-labelledby="featured-work-label"
            className="flex flex-col gap-6"
          >
            <SectionLabel id="featured-work-label">Featured work</SectionLabel>

            <div className="flex flex-col gap-5">
              {workProjects.map((project) => (
                <WorkCard key={project.slug} project={project} />
              ))}
            </div>

            <Action
              variant="ghost"
              render={<Link href="/work" />}
              className="self-start"
            >
              All work →
            </Action>
          </section>

          <section id="ask-ai-louie" className="scroll-mt-8">
            {/* Always rendered. An earlier version gated this on
                isAIConfigured(), but this page is statically prerendered, so
                that check froze at build time — adding the key in Vercel
                without redeploying would have left the site permanently
                showing "unavailable". The runtime is lazy-loaded anyway, and
                an unconfigured backend surfaces the spec §31 copy from the
                endpoint's 503 (spec §31). */}
            <AiLouieThread />
          </section>

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
      </div>
    </Canvas>
  );
}
