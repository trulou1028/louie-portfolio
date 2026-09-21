import { AskLouieTrigger } from "@/components/ai/ask-louie-dialog";
import Link from "next/link";
import { Mail } from "lucide-react";

import { LinkedInIcon } from "@/components/system/brand-icons";
import { Avatar } from "@/components/system/avatar";
import { InlineLink } from "@/components/system/inline-link";

import { NavItem } from "@/components/app-shell/nav-item";
import { NAV_ICONS } from "@/components/app-shell/nav-icons";
import { StatusDot } from "@/components/system/status-dot";
import { NAV_ITEMS } from "@/lib/routes";
import { profile } from "@/content/profile";

/**
 * Persistent desktop navigation (spec §10).
 *
 * Quiet by design — it is supporting structure, not a competitor to the work.
 * The pull quote and contact row come from the strategy mockup.
 *
 * Availability and contact links render only once Louie supplies them in
 * `content/profile.ts`; an invented URL or a fake "available" badge would be
 * worse than an absent one (spec §29).
 */
function LeftRail() {
  const { availability, links } = profile;
  const hasContact = Boolean(links.linkedin || links.email);

  return (
    <div className="flex min-h-full flex-col gap-7 px-5 py-7">
      <Link
        href="/"
        className="focus-ring rounded-sm"
        aria-label={`${profile.name} — home`}
      >
        <span className="flex items-center gap-2.5">
          <Avatar size="sm" />
          <span className="min-w-0 font-serif text-heading-md leading-tight text-foreground">
            {profile.name}
          </span>
        </span>
        <span className="mt-1.5 block font-mono text-system uppercase leading-relaxed text-foreground-muted">
          {profile.role}
        </span>
      </Link>

      <nav aria-label="Primary" className="flex flex-col gap-0.5">
        {NAV_ITEMS.map((item) => {
          const Icon = NAV_ICONS[item.href];
          return (
            <NavItem
              key={item.href}
              href={item.href}
              label={item.label}
              icon={Icon ? <Icon /> : undefined}
            />
          );
        })}
        <AskLouieTrigger className="mt-3 w-full justify-start" />
      </nav>

      {availability.status && availability.label ? (
        <div className="flex flex-col gap-1.5 border-t border-border-subtle pt-6">
          <StatusDot
            status={availability.status === "open" ? "available" : "selective"}
            label={availability.label}
            className="font-medium text-foreground"
          />
          {availability.detail ? (
            <span className="pl-3.5 text-body-sm text-foreground-muted">
              {availability.detail}
            </span>
          ) : null}
          {links.calendly ? (
            <InlineLink href={links.calendly} className="mt-1 pl-3.5 text-body-sm">
              Book time
            </InlineLink>
          ) : null}
        </div>
      ) : null}

      <div className="mt-auto flex flex-col gap-4">
        {hasContact ? (
          <div className="flex items-center gap-2">
            {links.email ? (
              <a
                href={`mailto:${links.email}`}
                aria-label="Email Louie"
                className="focus-ring inline-flex size-9 items-center justify-center rounded-sm border border-border-subtle text-foreground-muted transition-colors duration-(--duration-fast) hover:border-border-default hover:text-foreground"
              >
                <Mail aria-hidden="true" className="size-4" />
              </a>
            ) : null}
            {links.linkedin ? (
              <a
                href={links.linkedin}
                target="_blank"
                rel="noreferrer noopener"
                aria-label="Louie on LinkedIn (opens in a new tab)"
                className="focus-ring inline-flex size-9 items-center justify-center rounded-sm border border-border-subtle text-foreground-muted transition-colors duration-(--duration-fast) hover:border-border-default hover:text-foreground"
              >
                <LinkedInIcon className="size-4" />
              </a>
            ) : null}
          </div>
        ) : null}

        <p className="text-body-sm text-foreground-muted">
          © {new Date().getFullYear()} {profile.name}
        </p>
      </div>
    </div>
  );
}

export { LeftRail };
