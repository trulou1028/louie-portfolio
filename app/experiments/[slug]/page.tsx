import { CreativeWorkSchema } from "@/components/system/structured-data";
import NeuronContent from "@/content/experiments/neuron-shift.mdx";
import MotifContent from "@/content/experiments/motif.mdx";
import TransferSightContent from "@/content/experiments/transfersight.mdx";
import { DeepLinkHighlight } from "@/components/portfolio/deep-link-highlight";
import { MOTIF_ANCHORS, NEURON_ANCHORS, TRANSFERSIGHT_ANCHORS, isRoute, type Anchor } from "@/lib/routes";
import { TrackView } from "@/components/system/track-view";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Image from "next/image";
import Link from "next/link";

import { Canvas } from "@/components/app-shell/contextual-rail";
import { CaseStudyLayout } from "@/components/stacked/case-study-layout";
import { InlineLink } from "@/components/system/inline-link";
import { PendingContent } from "@/components/portfolio/pending-content";
import { CaseStudyBrief } from "@/components/portfolio/case-study-brief";
import { Action } from "@/components/system/action";
import { SectionLabel } from "@/components/system/section-label";
import { StatusDot } from "@/components/system/status-dot";
import { Tag } from "@/components/system/tag";
import { experiments } from "@/content/experiments/experiments";

/** Experiments with a full write-up: its content and section anchors. */
const WRITE_UPS: Record<string, { Content: React.ComponentType; anchors: readonly Anchor[] }> = {
  "neuron-shift": { Content: NeuronContent, anchors: NEURON_ANCHORS },
  motif: { Content: MotifContent, anchors: MOTIF_ANCHORS },
  transfersight: { Content: TransferSightContent, anchors: TRANSFERSIGHT_ANCHORS },
};

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
  const writeUp = WRITE_UPS[slug];
  const href = `/experiments/${slug}`;

  // A write-up uses the stacked case study layout (2026-10-29). An
  // exploration without one keeps the plain page and its pending note.
  if (writeUp) {
    return (
      <CaseStudyLayout
        label={[experiment.name, experiment.badge].filter(Boolean).join(" · ")}
        title={experiment.title}
        lead={experiment.summary}
        facts={[
          ...(experiment.meta ? [{ label: "Status", value: experiment.meta }] : []),
          { label: "Topics", value: experiment.tags.join(", ") },
          ...(experiment.demoUrl ? [{ label: "Live", value: <InlineLink href={experiment.demoUrl}>{experiment.demoLabel ?? "Visit"}</InlineLink> }] : []),
        ]}
        anchors={writeUp.anchors}
        header={experiment.brief ? <CaseStudyBrief brief={experiment.brief} className="mt-14" /> : null}
      >
        <CreativeWorkSchema project={{ title: experiment.title, name: experiment.name, href: isRoute(href) ? href : "/experiments", summary: experiment.summary ?? "", tags: experiment.tags }} />
        <TrackView event="portfolio_project_opened" properties={{ project: slug }} />
        <div className="case-prose"><writeUp.Content /></div>
      </CaseStudyLayout>
    );
  }

  return (
    <Canvas>
      <DeepLinkHighlight />
      <article className="max-w-[760px]">
        {experiment.logo ? (
          <div className="flex min-h-8 flex-wrap items-center gap-4">
            <Image src={experiment.logo.light} alt={experiment.name} width={experiment.logo.width} height={experiment.logo.height} loading="eager" className="h-auto w-28 object-contain" />
            <span className="border-l border-border-subtle pl-4 text-body-sm text-foreground-muted">Experiment</span>
          </div>
        ) : (
          <SectionLabel>Experiment</SectionLabel>
        )}

        <h1 className="mt-5 max-w-[20ch] font-display text-display-lg text-balance text-foreground">
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
          <>
            <p className="mt-6 max-w-[62ch] text-body-lg text-foreground-muted">
              {experiment.summary}
            </p>
            {experiment.brief ? <CaseStudyBrief brief={experiment.brief} className="mt-8" /> : null}
          </>
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
