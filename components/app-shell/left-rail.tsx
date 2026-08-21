import Link from "next/link";

import { NavItem } from "@/components/app-shell/nav-item";
import { InlineLink } from "@/components/system/inline-link";
import { StatusDot } from "@/components/system/status-dot";
import { NAV_ITEMS } from "@/lib/routes";
import { profile } from "@/content/profile";

/**
 * Persistent desktop navigation (spec §10).
 *
 * Deliberately quiet — it is supporting structure, not a competitor to the
 * work. No icons, no accent fills, no card chrome.
 *
 * Availability and contact links render only once Louie supplies them
 * (`content/profile.ts`); an invented URL or a fake "available" badge would
 * be worse than an absent one (spec §29).
 */
function LeftRail() {
  const { availability, links } = profile;

  return (
    <div className="flex h-full flex-col gap-8 px-5 py-8">
      <Link
        href="/"
        className="focus-ring group rounded-sm"
        aria-label={`${profile.name} — home`}
      >
        <span className="block font-serif text-heading-md leading-tight text-foreground">
          {profile.name}
        </span>
        <span className="mt-1 block text-body-sm text-foreground-muted">
          {profile.role}
        </span>
      </Link>

      <nav aria-label="Primary" className="flex flex-col gap-0.5">
        {NAV_ITEMS.map((item) => (
          <NavItem key={item.href} href={item.href} label={item.label} />
        ))}
      </nav>

      <div className="mt-auto flex flex-col gap-3 text-body-sm">
        {availability.status && availability.label ? (
          <StatusDot status={availability.status === "open" ? "available" : "selective"} label={availability.label} />
        ) : null}

        {links.linkedin ? (
          <InlineLink href={links.linkedin}>LinkedIn</InlineLink>
        ) : null}
        {links.email ? (
          <InlineLink href={`mailto:${links.email}`}>Email</InlineLink>
        ) : null}
      </div>
    </div>
  );
}

export { LeftRail };
