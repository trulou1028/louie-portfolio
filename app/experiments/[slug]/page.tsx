import { CreativeWorkSchema } from "@/components/system/structured-data";
import NeuronContent from "@/content/experiments/neuron-shift.mdx";
import { DeepLinkHighlight } from "@/components/portfolio/deep-link-highlight";
import { TableOfContentsInline } from "@/components/portfolio/table-of-contents";
import { NEURON_ANCHORS } from "@/lib/routes";
import { TrackView } from "@/components/system/track-view";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";

import { Canvas } from "@/components/app-shell/contextual-rail";
import { PendingContent } from "@/components/portfolio/pending-content";
import { Action } from "@/components/system/action";
import { SectionLabel } from "@/components/system/section-label";
import { StatusDot } from "@/components/system/status-dot";
import { Tag } from "@/components/system/tag";
import { experiments } from "@/content/experiments/experiments";

/** Static params so each experiment gets its own stable URL (spec §28). */
export function generateStaticParams() {
  return experiments.map((experiment) => ({ slug: experiment.slug }));
}

export async function generateMetadata({
  params,
}: PageProps<"/experiments/[slug]">): Promise<Metadata> {
  const { slug } = await params;
  const experiment = experiments.find((e) => e.slug === slug);
  if (!experiment) return {};

  return {
    title: experiment.title,
    description:
      experiment.summary ??
      `An in-progress exploration of ${experiment.title.toLowerCase()}.`,
    alternates: { canonical: `/experiments/${experiment.slug}` },
    openGraph: { type: "article", title: experiment.title, description: experiment.summary ?? undefined, url: `/experiments/${experiment.slug}` },
  };
}

export default async function ExperimentPage({
  params,
}: PageProps<"/experiments/[slug]">) {
  const { slug } = await params;
  const experiment = experiments.find((e) => e.slug === slug);
  if (!experiment) notFound();

  return (
    <Canvas>
      <DeepLinkHighlight />
      <article className="max-w-[760px]">
        <SectionLabel>{slug === "neuron-shift" ? "Neuron Shift / Experiment" : "Experiment"}</SectionLabel>

        <h1 className="mt-5 max-w-[20ch] font-serif text-display-lg text-balance text-foreground">
          {experiment.title}
        </h1>

        <div className="mt-6 flex flex-wrap items-center gap-x-5 gap-y-2">
          <StatusDot
            status={experiment.status === "shipped" ? "available" : "neutral"}
            label={
              experiment.status === "exploration"
                ? "Exploration, not yet built"
                : experiment.status === "prototype"
                  ? "Prototype"
                  : "Shipped"
            }
          />
          <ul className="flex flex-wrap gap-x-2 gap-y-1.5">
            {experiment.tags.map((tag) => (
              <li key={tag}>
                <Tag>{tag}</Tag>
              </li>
            ))}
          </ul>
        </div>

        {experiment.summary ? (
          <p className="mt-6 max-w-[62ch] text-body-lg text-foreground-muted">
            {experiment.summary}
          </p>
        ) : (
          <PendingContent
            summary={`This exploration has not been built yet. Describing what it demonstrates before it exists would be inventing work.`}
            items={[
              "What question the experiment is trying to answer",
              "A 20–60 second interactive demonstration (spec §15)",
              "What it showed, including anything that did not work",
            ]}
          />
        )}

        {slug === "neuron-shift" ? <>
          <CreativeWorkSchema project={{ title: experiment.title, name: "Neuron Shift", href: "/experiments/neuron-shift", summary: experiment.summary ?? "", tags: experiment.tags }} />
          <TrackView event="portfolio_project_opened" properties={{ project: "neuron-shift" }} />
          <TableOfContentsInline anchors={NEURON_ANCHORS} className="mt-8 lg:block" />
          <NeuronContent />
        </> : null}

        <div className="mt-10 flex flex-wrap gap-3">
          <Action variant="secondary" render={<Link href="/experiments" />}>
            All experiments
          </Action>
          <Action variant="ghost" render={<Link href="/work" />}>
            See finished work instead
          </Action>
        </div>
      </article>
    </Canvas>
  );
}
