import { track as vercelTrack } from "@vercel/analytics";

/**
 * Privacy-conscious product analytics (spec §30).
 *
 * The event list is closed and the property values are guarded, because the
 * rules that matter here are easy to break by accident:
 *
 * - Conversation text is never logged (spec §30).
 * - Pasted job descriptions are never logged (spec §22, §30).
 *
 * `track` therefore refuses free text. Properties must be short, enum-like
 * values — `{ project: "offboard" }`, not `{ question: "..." }`. Anything
 * longer than `MAX_VALUE_LENGTH` is dropped rather than truncated, since a
 * truncated job description is still a job description.
 */

/**
 * Spec §30's event list, verbatim.
 *
 * Nine of these fire (Plan 028). Four do not, and the list keeps them so it
 * still matches the spec:
 * - `ai_evidence_opened`, `ai_navigation_triggered` — the browser-executed
 *   tools they described were removed by Plan 014.
 * - `voice_started`, `voice_question_completed` — Plan 009, post-launch.
 */
export const ANALYTICS_EVENTS = [
  "portfolio_project_opened",
  "portfolio_case_section_viewed",
  "ai_louie_started",
  "ai_question_submitted",
  "ai_prompt_chip_clicked",
  "ai_evidence_opened",
  "ai_navigation_triggered",
  "job_description_started",
  "job_description_compared",
  "resume_opened",
  "contact_clicked",
  "voice_started",
  "voice_question_completed",
] as const;

export type AnalyticsEvent = (typeof ANALYTICS_EVENTS)[number];

/** Long values are the shape user-authored text takes. Enum-ish values are short. */
const MAX_VALUE_LENGTH = 64;

export type AnalyticsProperties = Record<string, string | number | boolean>;

/**
 * Strips anything that looks like free text. Exported for testing — this
 * guard is the thing standing between a well-meaning `track` call and a
 * privacy incident.
 */
export function sanitizeProperties(
  properties: AnalyticsProperties = {},
): AnalyticsProperties {
  const safe: AnalyticsProperties = {};

  for (const [key, value] of Object.entries(properties)) {
    if (typeof value === "string") {
      if (value.length > MAX_VALUE_LENGTH) continue;
      if (/\s{2,}|\n/.test(value)) continue; // prose, not a label
      safe[key] = value;
      continue;
    }
    if (typeof value === "number" || typeof value === "boolean") {
      safe[key] = value;
    }
  }

  return safe;
}

export function track(
  event: AnalyticsEvent,
  properties?: AnalyticsProperties,
): void {
  vercelTrack(event, sanitizeProperties(properties));
}
