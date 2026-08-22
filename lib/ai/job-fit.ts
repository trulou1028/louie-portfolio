import { z } from "zod";

import { evidence, type EvidenceItem } from "@/content/evidence/evidence";

/**
 * Job-description comparison (spec §18 Tool 4, §22).
 *
 * This is an evidence-navigation feature, not an applicant-tracking score.
 * Two rules shape the whole module:
 *
 * 1. **A requirement is only "matched" if real evidence backs it.** The model
 *    proposes matches; `verifyMatches` checks every cited id against the
 *    curated index and demotes anything unbacked into `weakerAreas`. A
 *    hallucinated citation therefore becomes an admitted gap rather than a
 *    false claim.
 * 2. **No numeric scores.** Spec §18 forbids match percentages, so any that
 *    slip into prose are stripped before rendering.
 */

/** Spec §18 Tool 4 output shape, plus the questions section spec §22 asks for. */
export const jobFitResultSchema = z.object({
  summary: z.string().min(1),
  strongestMatches: z
    .array(
      z.object({
        requirement: z.string().min(1),
        evidenceIds: z.array(z.string()),
        explanation: z.string().min(1),
      }),
    )
    .max(8),
  weakerAreas: z
    .array(
      z.object({
        requirement: z.string().min(1),
        explanation: z.string().min(1),
      }),
    )
    .max(8),
  suggestedProjectsToReview: z.array(z.string()).max(4),
  /**
   * Spec §22 lists "Suggested questions" as an output section but spec §18's
   * schema omits it; added here so the documented UI can be built.
   */
  suggestedQuestions: z.array(z.string()).max(5),
});

export type JobFitResult = z.infer<typeof jobFitResultSchema>;

export const jobDescriptionInputSchema = z.object({
  jobDescription: z
    .string()
    .trim()
    .min(200, "Paste the full job description so the comparison is meaningful.")
    .max(15_000, "That job description is too long to compare."),
});

/**
 * Removes numeric match claims from prose (spec §18: "do not assign numerical
 * match percentages"). Targeted at score-like phrases so ordinary numbers in
 * a requirement — "5+ years" — survive.
 */
export function stripMatchScores(text: string): string {
  return text
    .replace(/\b\d{1,3}(\.\d+)?\s?%\s*(match|fit|aligned|alignment|overlap)\b/gi, "a match")
    .replace(/\b(match|fit|alignment|overlap)\s*(of|:)?\s*\d{1,3}(\.\d+)?\s?%/gi, "$1")
    .replace(/\b\d{1,2}\s*(\/|out of)\s*10\b/gi, "")
    .replace(/\s{2,}/g, " ")
    .trim();
}

export type VerifiedJobFit = JobFitResult & {
  /** Matches whose citations all failed verification, for transparency. */
  demotedCount: number;
};

/**
 * Enforces rule 1: keep only citations that resolve, and demote any match
 * left without evidence.
 */
export function verifyMatches(
  result: JobFitResult,
  isKnownId: (id: string) => boolean = (id) => evidence.some((e) => e.id === id),
): VerifiedJobFit {
  const strongestMatches: JobFitResult["strongestMatches"] = [];
  const weakerAreas: JobFitResult["weakerAreas"] = [...result.weakerAreas];
  let demotedCount = 0;

  for (const match of result.strongestMatches) {
    const evidenceIds = match.evidenceIds.filter(isKnownId);

    if (evidenceIds.length === 0) {
      demotedCount += 1;
      weakerAreas.push({
        requirement: match.requirement,
        explanation:
          "The portfolio does not currently contain evidence for this requirement.",
      });
      continue;
    }

    strongestMatches.push({
      requirement: match.requirement,
      evidenceIds,
      explanation: stripMatchScores(match.explanation),
    });
  }

  return {
    summary: stripMatchScores(result.summary),
    strongestMatches,
    weakerAreas: weakerAreas.map((area) => ({
      requirement: area.requirement,
      explanation: stripMatchScores(area.explanation),
    })),
    suggestedProjectsToReview: result.suggestedProjectsToReview,
    suggestedQuestions: result.suggestedQuestions,
    demotedCount,
  };
}

/** Compact projection of the index, small enough to pass in full. */
export function evidenceForComparison() {
  return evidence.map((item) => ({
    id: item.id,
    project: item.project,
    title: item.title,
    summary: item.summary,
    tags: item.tags,
    skills: item.skills,
    technologies: item.technologies ?? [],
  }));
}

export function resolveEvidence(ids: readonly string[]): EvidenceItem[] {
  return ids
    .map((id) => evidence.find((e) => e.id === id))
    .filter((item): item is EvidenceItem => Boolean(item));
}

/** The instruction set for the comparison call (spec §22 rules). */
export const JOB_FIT_INSTRUCTIONS = `You are comparing a job description against a fixed set of portfolio evidence about Louie Sakoda.

Rules:
- Only claim a requirement is met if a specific evidence item supports it. Cite its id in evidenceIds.
- Never invent an evidence id. If nothing supports a requirement, put it in weakerAreas instead.
- Do not assign numerical match percentages or scores of any kind.
- Do not say Louie is the best or perfect candidate.
- Surface real gaps honestly. A recruiter is better served by an accurate gap than a flattering guess.
- Keep explanations to one or two sentences, specific to this role.
- suggestedProjectsToReview: use only "offboard", "flexi", or an evidence id.
- suggestedQuestions: things this recruiter could usefully ask Louie directly, especially about the gaps.`;
