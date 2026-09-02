import { evidence, type EvidenceItem } from "@/content/evidence/evidence";
import type { SearchPortfolioInput } from "@/lib/ai/schemas";

/**
 * Deterministic retrieval over the curated evidence index (spec §17).
 *
 * No embeddings and no vector database in V1 — deliberately. A transparent
 * weighted match is auditable: you can say exactly why an item was returned,
 * which matters when the whole point of the index is that a visitor never has
 * to trust the model blindly. Spec §17 defers embeddings until retrieval
 * quality actually proves insufficient, and this signature is the seam for
 * adding them without changing the UI contract.
 *
 * The function is pure — no I/O, no clock, no randomness — so it is trivially
 * testable and always returns the same results for the same query.
 */

/**
 * Field weights, highest first. Exact tag and skill matches rank above prose
 * matches because they are curated: someone decided this item is *about* that
 * topic, whereas a `detail` hit may be incidental.
 */
const WEIGHTS = {
  tag: 10,
  skill: 8,
  title: 6,
  summary: 4,
  detail: 2,
  project: 3,
  technology: 3,
} as const;

/** Below this, a match is incidental — better to return nothing (spec §31). */
const MIN_SCORE = 4;

const DEFAULT_LIMIT = 5;
const MAX_LIMIT = 10;

/**
 * Very common words carry no signal and would otherwise let any question
 * match any entry through `detail`.
 */
const STOP_WORDS = new Set([
  "a", "an", "and", "are", "as", "at", "be", "but", "by", "did", "do", "does",
  "for", "from", "has", "have", "he", "his", "how", "in", "is", "it", "its",
  "louie", "me", "of", "on", "or", "show", "that", "the", "their", "them",
  "there", "this", "to", "was", "what", "when", "which", "who", "with", "you",
  "your",
]);

export function tokenize(query: string): string[] {
  return query
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, " ")
    .split(/\s+/)
    .filter((token) => token.length > 1 && !STOP_WORDS.has(token));
}

/** Substring match, so "agent" hits "agents" and "agentic". */
function fieldScore(token: string, values: readonly string[], weight: number) {
  return values.some((value) => value.toLowerCase().includes(token))
    ? weight
    : 0;
}

function scoreItem(item: EvidenceItem, tokens: readonly string[]): number {
  let score = 0;

  for (const token of tokens) {
    score += fieldScore(token, item.tags, WEIGHTS.tag);
    score += fieldScore(token, item.skills, WEIGHTS.skill);
    score += fieldScore(token, [item.title], WEIGHTS.title);
    score += fieldScore(token, [item.summary], WEIGHTS.summary);
    score += fieldScore(token, [item.detail], WEIGHTS.detail);
    score += fieldScore(token, [item.project], WEIGHTS.project);
    score += fieldScore(token, item.technologies ?? [], WEIGHTS.technology);
  }

  return score;
}

export type SearchResult = { results: EvidenceItem[] };

export function searchEvidence(input: SearchPortfolioInput): SearchResult {
  const { query, project, evidenceType } = input;
  const limit = Math.min(input.limit ?? DEFAULT_LIMIT, MAX_LIMIT);

  const tokens = tokenize(query);
  if (tokens.length === 0) return { results: [] };

  // Filters apply before scoring: a project filter is a hard constraint, not
  // a ranking hint.
  const candidates = evidence.filter((item) => {
    if (project && item.project !== project) return false;
    if (evidenceType && item.evidenceType !== evidenceType) return false;
    return true;
  });

  const scored = candidates
    .map((item) => ({ item, score: scoreItem(item, tokens) }))
    .filter(({ score }) => score >= MIN_SCORE);

  // Stable: ties break on id, so identical input always yields identical order.
  scored.sort((a, b) =>
    b.score !== a.score ? b.score - a.score : a.item.id.localeCompare(b.item.id),
  );

  return { results: scored.slice(0, limit).map(({ item }) => item) };
}
