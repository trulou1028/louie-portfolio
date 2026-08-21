/**
 * Curated evidence index — the grounding authority for every factual claim
 * AI Louie makes (spec §16.2, §16.3).
 *
 * Rules:
 * - Written and reviewed by a human. Never scraped from the live site at
 *   runtime (spec §16.3).
 * - Every `route`/`anchor` pair must resolve to a real page section; Plan 005
 *   adds a build-time validator that enforces this.
 *
 * Populated in Plan 005, once the case studies (Plan 004) provide stable
 * anchors. Intentionally empty until then.
 */

export type EvidenceItem = {
  id: string;
  project: "offboard" | "flexi" | "career" | "experiment";
  title: string;
  summary: string;
  detail: string;
  route: string;
  anchor?: string;
  tags: string[];
  skills: string[];
  technologies?: string[];
  evidenceType:
    | "product"
    | "research"
    | "technical"
    | "strategy"
    | "outcome"
    | "career";
};

export const evidence: EvidenceItem[] = [];
