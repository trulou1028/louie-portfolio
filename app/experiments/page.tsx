import type { Metadata } from "next";

import { Canvas } from "@/components/app-shell/contextual-rail";
import { ExperimentCard } from "@/components/portfolio/experiment-card";
import { SectionLabel } from "@/components/system/section-label";
import { experiments } from "@/content/experiments/experiments";

export const metadata: Metadata = {
  title: "Experiments",
  description:
    "Small, opinionated prototypes exploring AI interaction patterns — voice and tool calling, human-in-the-loop confirmation, agent interfaces, and design engineering.",
  alternates: { canonical: "/experiments" },
};

/**
 * Experiments index (spec §15).
 *
 * Every card states its status in words. These are explorations, not shipped
 * demonstrations, and the page says so plainly rather than implying a body of
 * finished work.
 */
export default function ExperimentsIndex() {
  return (
    <Canvas>
      <div className="max-w-[820px]">
        <SectionLabel>Experiments</SectionLabel>
        <h1 className="mt-5 max-w-[18ch] font-serif text-display-lg text-balance text-foreground">
          Small things, built to find out
        </h1>
        <p className="mt-6 max-w-[62ch] text-body-lg text-foreground-muted">
          Short prototypes for questions that are easier to answer by building
          than by arguing. Each is an exploration rather than a finished
          demonstration — the status on every card says where it actually
          stands.
        </p>

        <div className="mt-12 grid gap-4 sm:grid-cols-2">
          {experiments.map((experiment) => (
            <ExperimentCard
              key={experiment.slug}
              experiment={experiment}
              href={`/experiments/${experiment.slug}`}
            />
          ))}
        </div>
      </div>
    </Canvas>
  );
}
