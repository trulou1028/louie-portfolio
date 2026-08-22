import Link from "next/link";

import { AiLouieThread } from "@/components/ai/ai-louie-thread";
import { ExperimentTile } from "@/components/portfolio/experiment-tile";
import { RailWorkCard } from "@/components/portfolio/rail-work-card";
import { Action } from "@/components/system/action";
import { RailSection } from "@/components/system/rail-section";
import { SectionLabel } from "@/components/system/section-label";
import { Surface } from "@/components/system/surface";
import { experiments } from "@/content/experiments/experiments";
import { profile } from "@/content/profile";
import { workProjects } from "@/content/work/projects";

/**
 * Homepage (spec §11, with the three-panel layout from the strategy mockup).
 *
 * A recruiter should understand within ten seconds that Louie designs
 * sophisticated AI products and can build them (spec §1). The main column
 * carries the hero and the AI surface; work, experiments, and the profile sit
 * in the contextual rail.
 *
 * The rail is the *same DOM* at every width — a flex row at `xl`, stacked
 * below it — rather than two copies gated by breakpoints. Duplicating
 * portfolio content into a hidden second copy is explicitly out (spec §28).
 */
const BRIEF_POINTS = profile.brief;

export default function Home() {
  const { primary, primaryEmphasis } = profile.positioning;
  // Render the tail in accent italic without letting the heading text drift
  // from the spec wording.
  const lead = primary.slice(0, primary.length - primaryEmphasis.length).trimEnd();

  return (
    <div className="mx-auto w-full max-w-[1240px] px-6 py-10 sm:px-8 lg:py-14">
      <div className="flex flex-col gap-16 xl:flex-row xl:gap-12">
        {/* ---------------------------------------------------- main column */}
        <div className="flex min-w-0 flex-1 flex-col gap-14">
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

          <section id="ask-ai-louie" className="scroll-mt-8">
            <AiLouieThread />
          </section>
        </div>

        {/* ---------------------------------------------------------- rail  */}
        <aside
          aria-label="Featured work and profile"
          className="flex flex-col gap-9 xl:w-[336px] xl:shrink-0"
        >
          <RailSection title="Featured work" viewAllHref="/work">
            <div className="flex flex-col gap-2.5">
              {workProjects.map((project) => (
                <RailWorkCard key={project.slug} project={project} />
              ))}
            </div>
          </RailSection>

          <RailSection title="Experiments" viewAllHref="/experiments">
            <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-4 xl:grid-cols-2">
              {experiments.map((experiment) => (
                <ExperimentTile key={experiment.slug} experiment={experiment} />
              ))}
            </div>
          </RailSection>

          <RailSection title="Louie in brief">
            <Surface variant="muted" className="flex flex-col gap-4 p-4">
              <ul className="flex flex-col gap-2.5">
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
              <Action
                variant="secondary"
                size="sm"
                render={<Link href="/about" />}
                className="self-start"
              >
                View full profile
              </Action>
            </Surface>
          </RailSection>

          <figure className="border-t border-border-subtle pt-6">
            <blockquote className="font-serif text-body-lg text-balance text-foreground-muted">
              {profile.quotes.philosophy}
            </blockquote>
            <figcaption className="mt-3 text-body-sm text-foreground-muted">
              — {profile.name.split(" ")[0]}
            </figcaption>
          </figure>
        </aside>
      </div>
    </div>
  );
}
