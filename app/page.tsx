import Link from "next/link";

import { Canvas } from "@/components/app-shell/contextual-rail";
import { AiLouieThread } from "@/components/ai/ai-louie-thread";
import { ExperimentCard } from "@/components/portfolio/experiment-card";
import { WorkCard } from "@/components/portfolio/work-card";
import { Action } from "@/components/system/action";
import { SectionLabel } from "@/components/system/section-label";
import { Surface } from "@/components/system/surface";
import { experiments } from "@/content/experiments/experiments";
import { profile } from "@/content/profile";
import { workProjects } from "@/content/work/projects";

/**
 * Homepage (spec §11).
 *
 * A recruiter should understand within ten seconds that Louie designs
 * sophisticated AI products and can build them (spec §1), so typography
 * carries the hero and the work sits directly beneath it. No hero
 * illustration — the type is the visual (spec §11 §1).
 */
export default function Home() {
  return (
    <Canvas>
      <div className="flex flex-col gap-20 lg:gap-28">
        {/* ---- Hero (spec §11 §1) ---- */}
        <section className="pt-2">
          <SectionLabel>{profile.positioning.eyebrow}</SectionLabel>

          <h1 className="mt-6 max-w-[16ch] font-serif text-display-xl text-balance text-foreground">
            {profile.positioning.primary}
          </h1>

          <p className="mt-6 max-w-[58ch] text-body-lg text-foreground-muted">
            {profile.positioning.supporting}
          </p>

          {/* TODO(content): second line summarizing CK-12 and Offboard,
              pending Louie's approved wording (spec §11 §1). */}
          {profile.heroSecondaryLine ? (
            <p className="mt-3 max-w-[58ch] text-body-lg text-foreground-muted">
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

        {/* ---- AI Louie (spec §11 §2) ---- */}
        <section id="ask-ai-louie" className="scroll-mt-8">
          <AiLouieThread />
        </section>

        {/* ---- Selected work (spec §11 §3) ---- */}
        <section>
          <SectionLabel>Selected work</SectionLabel>
          <div className="mt-6 flex flex-col gap-5">
            {workProjects.map((project, i) => (
              <WorkCard
                key={project.slug}
                project={project}
                eyebrow={i === 0 ? "Featured case study" : undefined}
              />
            ))}
          </div>
        </section>

        {/* ---- Experiments (spec §11 §4) ---- */}
        <section>
          <SectionLabel>Experiments</SectionLabel>
          <p className="mt-4 max-w-[62ch] text-body text-foreground-muted">
            Small, opinionated prototypes in progress — short demonstrations of
            AI interaction patterns rather than full case studies.
          </p>
          <div className="mt-6 grid gap-4 sm:grid-cols-2">
            {experiments.map((experiment) => (
              <ExperimentCard key={experiment.slug} experiment={experiment} />
            ))}
          </div>
        </section>

        {/* ---- Louie in brief (spec §11 §5) ---- */}
        <section>
          <SectionLabel>Louie in brief</SectionLabel>
          <Surface variant="muted" radius="lg" className="mt-6 p-6 sm:p-8">
            <ul className="flex flex-col gap-3">
              {profile.brief.map((point) => (
                <li
                  key={point}
                  className="flex gap-3 text-body text-foreground-muted"
                >
                  <span
                    aria-hidden="true"
                    className="mt-2.5 size-1 shrink-0 rounded-full bg-accent"
                  />
                  {point}
                </li>
              ))}
            </ul>
            {/* TODO(asset): portrait or illustration (spec §11 §5). */}
            <div className="mt-7">
              <Action variant="secondary" size="sm" render={<Link href="/about" />}>
                More about Louie
              </Action>
            </div>
          </Surface>
        </section>
      </div>
    </Canvas>
  );
}
