"use client";

import Link from "next/link";
import { CircleHelp, MessageCircleQuestion, TriangleAlert } from "lucide-react";

import { EvidenceCard } from "@/components/portfolio/evidence-card";
import { SectionLabel } from "@/components/system/section-label";
import { Surface } from "@/components/system/surface";
import { resolveEvidence, type VerifiedJobFit } from "@/lib/ai/job-fit";
import { workProjects } from "@/content/work/projects";

/**
 * The fit view (spec §22).
 *
 * Four sections, in the spec's order: strong evidence, relevant work to
 * review, gaps, and questions to ask. It is an evidence navigator, not a
 * score — there is no number anywhere in this component, and the gaps section
 * is given the same visual weight as the matches rather than being tucked
 * away.
 *
 * Everything renders as plain text nodes. Nothing the model returns is
 * treated as markup (spec §32).
 */

function Section({
  title,
  icon,
  children,
}: {
  title: string;
  icon?: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <section className="flex flex-col gap-3">
      <div className="flex items-center gap-2">
        {icon}
        <SectionLabel>{title}</SectionLabel>
      </div>
      {children}
    </section>
  );
}

function JobFitResult({ result }: { result: VerifiedJobFit }) {
  const projectsToReview = result.suggestedProjectsToReview
    .map((ref) => {
      const bySlug = workProjects.find((p) => p.slug === ref);
      if (bySlug) return { href: bySlug.href, label: bySlug.name };
      const [item] = resolveEvidence([ref]);
      if (item) {
        return {
          href: item.anchor ? `${item.route}#${item.anchor}` : item.route,
          label: item.title,
        };
      }
      return null;
    })
    .filter((entry): entry is { href: string; label: string } => entry !== null);

  return (
    <div className="flex flex-col gap-7">
      <p className="max-w-[62ch] text-body text-foreground">{result.summary}</p>

      {result.strongestMatches.length > 0 ? (
        <Section title="Strong evidence">
          <ul className="flex flex-col gap-4">
            {result.strongestMatches.map((match) => (
              <li key={match.requirement} className="flex flex-col gap-2">
                <p className="text-body font-medium text-foreground">
                  {match.requirement}
                </p>
                <p className="max-w-[62ch] text-body-sm text-foreground-muted">
                  {match.explanation}
                </p>
                <ul className="flex flex-col gap-2">
                  {resolveEvidence(match.evidenceIds).map((item) => (
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
              </li>
            ))}
          </ul>
        </Section>
      ) : null}

      {projectsToReview.length > 0 ? (
        <Section title="Relevant work to review">
          <ul className="flex flex-wrap gap-2">
            {projectsToReview.map((entry) => (
              <li key={entry.href}>
                <Link
                  href={entry.href}
                  className="focus-ring inline-flex rounded-sm border border-border-default bg-surface px-3 py-1.5 text-body-sm text-foreground transition-colors duration-(--duration-fast) hover:border-accent-muted hover:bg-accent-soft"
                >
                  {entry.label}
                </Link>
              </li>
            ))}
          </ul>
        </Section>
      ) : null}

      {result.weakerAreas.length > 0 ? (
        <Section
          title="Gaps or unclear areas"
          icon={
            <TriangleAlert
              aria-hidden="true"
              className="size-3.5 text-foreground-muted"
            />
          }
        >
          <ul className="flex flex-col gap-3">
            {result.weakerAreas.map((area) => (
              <li key={area.requirement} className="flex flex-col gap-1">
                <p className="text-body-sm font-medium text-foreground">
                  {area.requirement}
                </p>
                <p className="max-w-[62ch] text-body-sm text-foreground-muted">
                  {area.explanation}
                </p>
              </li>
            ))}
          </ul>
        </Section>
      ) : null}

      {result.suggestedQuestions.length > 0 ? (
        <Section
          title="Suggested questions"
          icon={
            <MessageCircleQuestion
              aria-hidden="true"
              className="size-3.5 text-foreground-muted"
            />
          }
        >
          <ul className="flex flex-col gap-2">
            {result.suggestedQuestions.map((question) => (
              <li
                key={question}
                className="max-w-[62ch] text-body-sm text-foreground-muted before:mr-2 before:content-['—']"
              >
                {question}
              </li>
            ))}
          </ul>
        </Section>
      ) : null}

      <Surface
        variant="muted"
        className="flex items-start gap-2.5 p-3.5 text-body-sm text-foreground-muted"
      >
        <CircleHelp aria-hidden="true" className="mt-0.5 size-3.5 shrink-0" />
        <span>
          This compares a role against published portfolio evidence. It is not
          a score, and it can only see what has been written up here.
        </span>
      </Surface>
    </div>
  );
}

export { JobFitResult };
