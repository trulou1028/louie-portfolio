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
