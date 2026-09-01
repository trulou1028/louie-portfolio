import { isAnchorOnRoute, isRoute } from "@/lib/routes";
import { profile } from "@/content/profile";

/**
 * Validates a link href written by the model into a chat answer (spec §32).
 *
 * Model output is never trusted as routing data — the same rule
 * `validateNavigation` enforces for the navigation tool. Prose links were the
 * hole in that: `AnswerMarkdown` passed whatever href the model produced
 * straight to `InlineLink`, which treats anything not starting with `/` or
 * `#` as external and renders it as a `target="_blank"` anchor. So a model
 * that invented a base URL — the observed failure was
 * `<your-link-here>/work/offboard` — shipped a live link to nowhere, and a
 * prompt-injected `https://…` or `javascript:` href would have rendered as a
 * real clickable one.
 *
 * The allowlist is deliberately tight, because the evidence index only ever
 * carries internal routes (`EvidenceItem.route` / `.anchor`):
 *
 * - a real route from `ROUTES`, optionally with a real anchor on that route
 * - one of Louie's own published profile links, which are the only external
 *   destinations this site ever points a visitor at
 * - everything else is invalid, and renders as plain text rather than a link
 *
 * Rejecting rather than repairing is the point: a plausible-looking but wrong
 * link is worse than no link, because it breaks the "open the evidence"
 * promise while looking like it kept it.
 */

export type AnswerLink =
  | { kind: "internal"; href: string }
  | { kind: "external"; href: string }
  | { kind: "invalid" };

/** Louie's own links — the only external destinations an answer may link to. */
function allowedExternalHrefs(): string[] {
  const { linkedin, calendly, email } = profile.links;
  return [
    linkedin,
    calendly,
    email ? `mailto:${email}` : null,
  ].filter((value): value is string => Boolean(value));
}

export function resolveAnswerLink(href: string | undefined): AnswerLink {
  if (!href) return { kind: "invalid" };

  const trimmed = href.trim();
  if (!trimmed) return { kind: "invalid" };

  if (trimmed.startsWith("/")) {
    // Split once: a route may carry an anchor, never a query string — nothing
    // on this site reads one, so `?` is not a shape the model should produce.
    if (trimmed.includes("?")) return { kind: "invalid" };

    const hashIndex = trimmed.indexOf("#");
    const route = hashIndex === -1 ? trimmed : trimmed.slice(0, hashIndex);
    const anchor = hashIndex === -1 ? "" : trimmed.slice(hashIndex + 1);

    if (!isRoute(route)) return { kind: "invalid" };
    if (anchor && !isAnchorOnRoute(route, anchor)) return { kind: "invalid" };

    return { kind: "internal", href: trimmed };
  }

  // Exact match only. Prefix matching would accept
  // `https://linkedin.com.evil.example/...`.
  if (allowedExternalHrefs().includes(trimmed)) {
    return { kind: "external", href: trimmed };
  }

  return { kind: "invalid" };
}
