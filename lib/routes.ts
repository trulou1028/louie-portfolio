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
  "/work/offboard",
  "/work/flexi",
  "/ai-systems",
  "/experiments",
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
  { id: "decision-uncertainty", label: "Exposing uncertainty" },
  { id: "decision-teacher", label: "Teacher as first-class user" },
  { id: "system", label: "System" },
  { id: "product", label: "Product" },
  { id: "outcomes", label: "Outcomes" },
  { id: "learnings", label: "Learnings" },
] as const satisfies readonly Anchor[];

export const CASE_STUDY_ANCHORS: Record<string, readonly Anchor[]> = {
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
 */
export const NAV_ITEMS: ReadonlyArray<{ href: Route; label: string }> = [
  { href: "/", label: "Home" },
  { href: "/work", label: "Work" },
  { href: "/ai-systems", label: "AI Systems" },
  { href: "/experiments", label: "Experiments" },
  { href: "/writing", label: "Writing" },
  { href: "/about", label: "About" },
  { href: "/resume", label: "Resume" },
] as const;
