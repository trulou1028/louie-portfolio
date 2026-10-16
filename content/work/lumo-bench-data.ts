/**
 * LUMO Bench results, copied from the run files in Offboard's repository
 * (`lumo-plan-builder`, `origin/main` on 2026-10-15). Nothing here is
 * estimated. Each array lists the cases a run missed; every other case in
 * the set passed.
 *
 * - Regression set: `documentation/qa/ai-runs/lumo-bench/2026-09-26-off627r-{baseline,candidate}-{1,2}.json`.
 *   The decision record calls these four runs "unchanged code"
 *   (`coach/decisions/2026-09-29-lumo-evals-hard-cases-and-owner-labels-first.md`).
 * - Hard set: `documentation/qa/ai-runs/lumo-bench-hard/2026-10-01-off682-hard-baseline-{1,2}-regraded.json`,
 *   with each case's split from `scripts/qa-lumo-bench.hard.cases.json`.
 * - Grader check: `documentation/qa/ai-runs/2026-09-30-lumo-judge-agreement.md`.
 * - Model results: `coach/decisions/2026-09-23-keep-current-lumo-after-gpt6-recheck.md`
 *   and `coach/decisions/2026-10-11-stay-on-openai-models.md`.
 *
 * No member data: case ids, families, and scores only.
 */

export type BenchCase = { id: string; family: string };

/** The 32-case regression set, the release gate, in run order. */
export const REGRESSION_CASES: readonly BenchCase[] = [
  ["L1", "first week"], ["L2", "ghost check"], ["L3", "tracker write"], ["L4", "context"],
  ["L5", "clarify"], ["L6", "safety"], ["L7-L8", "no card"], ["L9", "no card"],
  ["L10", "no card"], ["L11", "ghost check"], ["L12", "no card"], ["L13", "record on screen"],
  ["L14", "record on screen"], ["L15", "record on screen"], ["L16", "record on screen"], ["L17", "on file"],
  ["L18", "on file"], ["L19", "on file"], ["L20", "on file"], ["L21", "job board"],
  ["L22", "job board"], ["L21a", "job board"], ["L23", "money facts"], ["L24a", "money facts"],
  ["L24b", "money facts"], ["L25", "usage"], ["L26", "context write"], ["L27", "context write"],
  ["W1", "selected branch"], ["W2", "selected branch"], ["W3", "selected branch"], ["W4", "selected branch"],
].map(([id, family]) => ({ id, family }));

/** Four runs on unchanged code, 2026-09-26. The three controls failed in every run, as built. */
export const REGRESSION_RUNS: readonly { label: string; misses: readonly string[] }[] = [
  { label: "Run 1", misses: ["W2"] },
  { label: "Run 2", misses: ["W2"] },
  { label: "Run 3", misses: ["L16", "W2"] },
  { label: "Run 4", misses: [] },
];

export const CONTROL_CASES = ["C1", "C2", "C3"] as const;

/** The 31-case hard set. `heldout` cases are never read during tuning. */
export const HARD_CASES: readonly (BenchCase & { split: "dev" | "heldout" })[] = [
  ["H01", "dev"], ["H02", "heldout"], ["H03", "heldout"], ["H04", "dev"], ["H05", "dev"],
  ["H06", "dev"], ["H07", "dev"], ["H08", "heldout"], ["H09", "heldout"], ["H10", "heldout"],
  ["H11", "dev"], ["H12", "dev"], ["H13", "heldout"], ["H14", "dev"], ["H15", "heldout"],
  ["H16", "dev"], ["H17", "heldout"], ["H18", "dev"], ["H19", "dev"], ["H20", "heldout"],
  ["H21", "dev"], ["H22", "heldout"], ["H23", "dev"], ["H24", "heldout"], ["H25", "dev"],
  ["H26", "dev"], ["H27", "dev"], ["H28", "heldout"], ["H29", "heldout"], ["H30", "heldout"],
  ["H31", "dev"],
].map(([id, split]) => ({ id, family: "", split: split as "dev" | "heldout" }));

/** Two hard-set runs, 2026-10-01: 28 and 26 of 31. */
export const HARD_RUNS: readonly { label: string; misses: readonly string[] }[] = [
  { label: "Run 1", misses: ["H03", "H13", "H16"] },
  { label: "Run 2", misses: ["H13", "H16", "H23", "H24", "H25"] },
];

/** Tuning starts only when the mean of the two baselines is at or below this. */
export const HARD_TUNING_LINE = 0.85;

/** The grader check: 25 items, 16 from the hard set and 9 from the regression set. */
export const GRADER_CHECK = { items: 25, fromHard: 16, fromRegression: 9, agree: 24, kappa: 0.92 } as const;

/** GPT-6 Luna against the current model, on the same 26 cases (partial run, estimates). */
export const GPT6_RECHECK = {
  costChange: -46.5,
  medianFirstTurnChange: -12.6,
  p90FirstTurnChange: 21.4,
} as const;

/** The October 2026 text-only screen. Ranges are the low and high run. */
export const CLAUDE_SCREEN: readonly { model: string; low: [number, number]; high: [number, number] }[] = [
  { model: "GPT-5.6 Luna", low: [18, 19], high: [18, 19] },
  { model: "Claude Sonnet 5.5", low: [12, 16], high: [12, 14] },
  { model: "Claude Haiku 5.5", low: [12, 16], high: [14, 18] },
];
