import type { Metadata } from "next";
import Link from "next/link";

import { Canvas } from "@/components/app-shell/contextual-rail";
import { EvidenceCard } from "@/components/portfolio/evidence-card";
import { Action } from "@/components/system/action";
import { SectionLabel } from "@/components/system/section-label";
import { evidence } from "@/content/evidence/evidence";

export const metadata: Metadata = {
  title: "AI Systems",
  description:
    "The AI design decisions behind Offboard and CK-12 Flexi — human-in-the-loop control, grounding, scaffolding, uncertainty, and multi-sided systems.",
};

/**
 * AI Systems (spec §28).
 *
 * Assembled entirely from the curated evidence index, so this page cannot
 * drift from the case studies or claim anything they do not. Grouping by the
 * question each decision answers is more useful than listing technologies.
 */
const THEMES = [
  {
    title: "Keeping people in control",
    question:
      "When an AI can act, not just answer, what stops it acting on your behalf without your say-so?",
    ids: ["offboard-hitl-actions", "offboard-risk-gate"],
  },
  {
    title: "Knowing when not to comply",
    question:
      "What should a system do when giving someone exactly what they asked for works against them?",
    ids: ["flexi-central-tension", "flexi-scaffolding-loop"],
  },
  {
    title: "Being honest about limits",
    question:
      "How does a system show the edge of what it knows, to someone with no way to check?",
    ids: ["flexi-expose-uncertainty"],
  },
  {
    title: "Context that compounds",
    question:
      "How does work accumulate instead of restarting from an empty box every time?",
    ids: ["offboard-opportunity-workspace", "offboard-context-compounds", "offboard-lumo-context-layer"],
  },
  {
    title: "Systems with more than one user",
    question:
      "How do you hold competing needs together without quietly picking a winner?",
    ids: ["flexi-teacher-first-class", "flexi-multi-sided-system"],
  },
  {
    title: "Built, not just specified",
    question: "What does the architecture actually look like underneath?",
    ids: ["offboard-architecture"],
  },
] as const;

export default function AiSystemsPage() {
  return (
    <Canvas>
      <div className="max-w-[820px]">
        <SectionLabel>AI Systems</SectionLabel>
        <h1 className="mt-5 max-w-[20ch] font-serif text-display-lg text-balance text-foreground">
          The decisions behind the AI, not the models behind it
        </h1>
        <p className="mt-6 max-w-[62ch] text-body-lg text-foreground-muted">
          Both products here are ones where the hard part was deciding what the
          system should refuse to do. This page collects those decisions and
          links straight to where each one is argued in full.
        </p>

        <div className="mt-14 flex flex-col gap-12">
          {THEMES.map((theme) => {
            const items = theme.ids
              .map((id) => evidence.find((e) => e.id === id))
              .filter((item) => item !== undefined);

            if (items.length === 0) return null;

            return (
              <section key={theme.title}>
                <h2 className="font-serif text-heading-lg text-balance text-foreground">
                  {theme.title}
                </h2>
                <p className="mt-3 max-w-[62ch] text-body text-foreground-muted">
                  {theme.question}
                </p>
                <ul className="mt-5 flex flex-col gap-2.5">
                  {items.map((item) => (
                    <li key={item.id}>
                      <EvidenceCard
                        evidenceId={item.id}
                        project={item.project}
                        title={item.title}
                        relevance={item.summary}
                        route={item.route}
                        anchor={item.anchor}
                      />
                    </li>
                  ))}
                </ul>
              </section>
            );
          })}
        </div>

        <div className="mt-14 flex flex-wrap gap-3">
          <Action render={<Link href="/work/offboard" />}>
            Read the Offboard case study
          </Action>
          <Action variant="secondary" render={<Link href="/work/flexi" />}>
            Read the Flexi case study
          </Action>
        </div>
      </div>
    </Canvas>
  );
}
