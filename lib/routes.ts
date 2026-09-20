/**
 * Every internal route, in one place (spec §28, §29).
 *
 * This list is the allowlist the `navigate_portfolio` tool validates against
 * in Plan 006 — the model may never navigate to anything absent from it, and
 * never to an external URL (spec §18, §32).
 *
 * Plan 004 adds per-case-study anchor lists here; Plan 005's validator checks
 * evidence entries against both.
 */

export const ROUTES = [
  "/",
  "/work",
  "/work/ck12-analytics",
  "/work/offboard",
  "/work/flexi",
  "/ai-systems",
  "/experiments",
  "/experiments/neuron-shift",
  "/writing",
  "/about",
  "/resume",
] as const;

export type Route = (typeof ROUTES)[number];

export function isRoute(value: string): value is Route {
  return (ROUTES as readonly string[]).includes(value);
}

/**
 * Case-study section anchors — a public contract, not an implementation
 * detail. The slugs are fixed by spec §13 and §14; the evidence index
 * (Plan 005) and `navigate_portfolio` (Plan 006) both validate against them,
 * and published deep links depend on them.
 *
 * Renaming an anchor means updating the MDX `<Section id>`, every evidence
 * entry pointing at it, and any link already shared.
 */
export type Anchor = { id: string; label: string };

export const OFFBOARD_ANCHORS = [
  { id: "context", label: "Context" },
  { id: "system", label: "Product model" },
  { id: "decision-risk", label: "Protecting user effort" },
  { id: "decision-control", label: "AI acts with visible control" },
  { id: "decision-context", label: "Context compounds" },
  { id: "decision-entry-point", label: "Changing the entry point" },
  { id: "architecture", label: "Architecture" },
  { id: "product", label: "Product" },
  { id: "outcomes", label: "Outcomes" },
  { id: "learnings", label: "Learnings" },
] as const satisfies readonly Anchor[];

export const FLEXI_ANCHORS = [
  { id: "context", label: "Context" },
  { id: "tension", label: "The tension" },
  { id: "research", label: "Research" },
  { id: "decision-scaffolding", label: "The answer is not the end" },
  { id: "decision-uncertainty", label: "Sources and recovery" },
  { id: "decision-teacher", label: "Teacher trust and limits" },
  { id: "system", label: "System" },
  { id: "product", label: "Product" },
  { id: "outcomes", label: "Outcomes" },
  { id: "learnings", label: "Learnings" },
] as const satisfies readonly Anchor[];

export const ANALYTICS_ANCHORS = [
  { id: "context", label: "The teacher’s decision" },
  { id: "role", label: "What I owned" },
  { id: "decision-prediction", label: "Prediction and diagnosis" },
  { id: "decision-uncertainty", label: "Interpreting uncertainty" },
  { id: "decision-investigation", label: "Investigating the signals" },
  { id: "system", label: "Beyond the screen" },
  { id: "evaluation", label: "Value and comprehension" },
  { id: "learnings", label: "What I would change" },
] as const satisfies readonly Anchor[];

export const NEURON_ANCHORS = [
  { id: "premise", label: "The handoff" },
  { id: "decisions", label: "Three choices" },
  { id: "technical", label: "Making it work" },
  { id: "limits", label: "Limits and next test" },
] as const satisfies readonly Anchor[];

export const CASE_STUDY_ANCHORS: Record<string, readonly Anchor[]> = {
  "/work/ck12-analytics": ANALYTICS_ANCHORS,
  "/experiments/neuron-shift": NEURON_ANCHORS,
  "/work/offboard": OFFBOARD_ANCHORS,
  "/work/flexi": FLEXI_ANCHORS,
};

/** True when `anchor` is a real section on `route`. Used to validate evidence. */
export function isAnchorOnRoute(route: string, anchor: string): boolean {
  return (CASE_STUDY_ANCHORS[route] ?? []).some((a) => a.id === anchor);
}

/**
 * Primary navigation, in display order (spec §10 left rail).
 * `/work/*` detail pages are intentionally absent — they are reached from /work.
 *
 * Writing and Experiments left the primary nav by owner decision, 2026-08-23
 * (Plan 011, README "Deviations" ledger). They remain live, stable URLs in
 * `ROUTES` above and in the sitemap (spec §28) — `/experiments` is reached
 * from `/work`, and `/writing` remains directly linkable.
 */
export const NAV_ITEMS: ReadonlyArray<{ href: Route; label: string }> = [
  { href: "/", label: "Home" },
  { href: "/work", label: "Work" },
  { href: "/about", label: "About" },
  { href: "/resume", label: "Resume" },
] as const;
