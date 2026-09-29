"use client";

import * as React from "react";
import Link from "next/link";
import { ArrowRight, CircleCheck, CircleDashed } from "lucide-react";

import { SectionLabel } from "@/components/system/section-label";
import { resolveEvidence, type VerifiedJobFit } from "@/lib/ai/job-fit";
import type { EvidenceItem } from "@/content/evidence/evidence";
import { workProjects } from "@/content/work/projects";
import { CASE_STUDY_ANCHORS } from "@/lib/routes";

/**
 * The fit view (spec §22), sized for the side panel (Plan 042).
 *
 * One sentence, then matches and gaps as one-line rows with a short
 * explanation and a small link to the evidence. Gaps get the same weight as
 * matches. Groups show three rows; "Show N more" reveals the rest, so the
 * view stays short without hiding anything the comparison found.
 *
 * No number anywhere: it is an evidence navigator, not a score. Everything
 * renders as plain text nodes; nothing the model returns is markup
 * (spec §32).
 */

const VISIBLE = 3;

const PAGE_NAMES: Record<string, string> = {
  "/work/offboard": "Offboard",
  "/work/ck12-analytics": "CK-12 Foresights",
  "/work/flexi": "Flexi",
  "/experiments/neuron-shift": "Neuron Shift",
  "/resume": "Resume",
  "/about": "About",
};

/** "Neuron Shift · Color semantics": the page, then the section when known. */
function evidenceLink(item: EvidenceItem) {
  const page = PAGE_NAMES[item.route] ?? item.title;
  const section = item.anchor ? CASE_STUDY_ANCHORS[item.route]?.find((a) => a.id === item.anchor)?.label : undefined;
  return {
    href: item.anchor ? `${item.route}#${item.anchor}` : item.route,
    label: section ? `${page} · ${section}` : page,
  };
}

function EvidenceLinks({ ids }: { ids: readonly string[] }) {
  // Several evidence entries can share one page (the resume holds most
  // career entries), so keep each destination once.
  const links = resolveEvidence(ids)
    .map(evidenceLink)
    .filter((link, index, all) => all.findIndex((other) => other.href === link.href) === index)
    .slice(0, 2);
  if (links.length === 0) return null;
  return (
    <p className="mt-1 flex flex-wrap gap-x-3 gap-y-1">
      {links.map((link) => (
        <Link
          key={link.href}
          href={link.href}
          className="focus-ring group inline-flex items-center gap-1 rounded-xs text-body-sm font-medium text-foreground underline decoration-border-strong underline-offset-4 hover:decoration-current"
        >
          {link.label}
          <ArrowRight aria-hidden="true" className="size-3.5 transition-transform duration-(--duration-fast) group-hover:translate-x-0.5" />
        </Link>
      ))}
    </p>
  );
}

type Row = { requirement: string; explanation: string; evidenceIds?: readonly string[] };

function FitGroup({ title, rows, icon }: { title: string; rows: readonly Row[]; icon: React.ReactNode }) {
  const [expanded, setExpanded] = React.useState(false);
  if (rows.length === 0) return null;
  const shown = expanded ? rows : rows.slice(0, VISIBLE);
  const hidden = rows.length - shown.length;

  return (
    <section className="flex flex-col gap-2">
      <SectionLabel>{title}</SectionLabel>
      <ul className="flex flex-col divide-y divide-border-subtle border-y border-border-subtle">
        {shown.map((row, index) => (
          <li key={`${index}-${row.requirement}`} className="flex gap-3 py-3">
            <span aria-hidden="true" className="mt-0.5 shrink-0 text-foreground-muted">{icon}</span>
            <div className="min-w-0">
              <p className="text-body-sm font-semibold text-foreground">{row.requirement}</p>
              <p className="text-body-sm text-foreground-muted">{row.explanation}</p>
              {row.evidenceIds ? <EvidenceLinks ids={row.evidenceIds} /> : null}
            </div>
          </li>
        ))}
      </ul>
      {hidden > 0 ? (
        <button
          type="button"
          onClick={() => setExpanded(true)}
          className="focus-ring self-start rounded-xs text-body-sm font-medium text-foreground-muted underline decoration-border-strong underline-offset-4 hover:text-foreground"
        >
          Show {hidden} more
        </button>
      ) : null}
    </section>
  );
}

function JobFitResult({ result }: { result: VerifiedJobFit }) {
  const startWith = result.suggestedProjectsToReview
    .map((ref) => workProjects.find((project) => project.slug === ref))
    .filter((project) => project !== undefined)
    .slice(0, 2);

  return (
    <div className="ask-fade-in flex flex-col gap-6">
      <p className="text-body text-foreground">{result.summary}</p>

      <FitGroup
        title="Where I match"
        rows={result.strongestMatches}
        icon={<CircleCheck className="size-4 text-foreground" />}
      />
      <FitGroup
        title="Gaps to ask me about"
        rows={result.weakerAreas}
        icon={<CircleDashed className="size-4" />}
      />

      {result.suggestedQuestions.length > 0 ? (
        <section className="flex flex-col gap-2">
          <SectionLabel>Questions to ask me</SectionLabel>
          <ul className="flex flex-col gap-1.5">
            {result.suggestedQuestions.slice(0, 2).map((question, index) => (
              <li key={`${index}-${question}`} className="text-body-sm text-foreground">{question}</li>
            ))}
          </ul>
        </section>
      ) : null}

      {startWith.length > 0 ? (
        <p className="text-body-sm text-foreground-muted">
          Start with{" "}
          {startWith.map((project, index) => (
            <React.Fragment key={project.slug}>
              {index > 0 ? " and " : null}
              <Link href={project.href} className="focus-ring rounded-xs font-medium text-foreground underline decoration-border-strong underline-offset-4 hover:decoration-current">
                {project.name}
              </Link>
            </React.Fragment>
          ))}
          .
        </p>
      ) : null}

      <p className="text-body-sm text-foreground-muted">
        Not a score. This only sees what is published here.
      </p>
    </div>
  );
}

export { JobFitResult };
