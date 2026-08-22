import "server-only";

import { generateObject } from "ai";

import { getModel } from "@/lib/ai/provider";
import {
  JOB_FIT_INSTRUCTIONS,
  evidenceForComparison,
  jobFitResultSchema,
  verifyMatches,
  type VerifiedJobFit,
} from "@/lib/ai/job-fit";

/**
 * The one implementation of the comparison, shared by two entry points
 * (spec §18 Tool 4, §22):
 *
 * - `/api/job-fit`, which the paste dialog calls directly. This is the
 *   primary path: it avoids making the model copy a multi-thousand-character
 *   job description into tool arguments, which is slow and truncation-prone.
 * - the `compare_job_description` chat tool, for a visitor who pastes a
 *   description straight into the composer.
 *
 * Kept out of `lib/ai/job-fit.ts` so that module stays pure and importable
 * from client components; `server-only` makes an accidental client import a
 * build error.
 *
 * The job description is used for this call and nothing else. It is never
 * logged, persisted, or sent to analytics (spec §30).
 */
export async function runJobFitComparison(
  jobDescription: string,
): Promise<VerifiedJobFit> {
  const { object } = await generateObject({
    model: getModel(),
    schema: jobFitResultSchema,
    system: JOB_FIT_INSTRUCTIONS,
    prompt: [
      "Portfolio evidence (the only permitted source):",
      JSON.stringify(evidenceForComparison()),
      "",
      "Job description to compare against:",
      jobDescription,
    ].join("\n"),
  });

  return verifyMatches(object);
}
