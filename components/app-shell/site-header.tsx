import Link from "next/link";

import { AskLouieTrigger } from "@/components/ai/ask-louie-dialog";
import { NavItem } from "@/components/app-shell/nav-item";
import { StatusDot } from "@/components/system/status-dot";
import { NAV_ITEMS } from "@/lib/routes";
import { profile } from "@/content/profile";

/**
 * Desktop header (Plan 037). Replaces the persistent left rail: the rail
 * took a quarter of the screen for four links, and the work needs the width.
 *
 * Below `lg` it is hidden and `MobileNav` takes over. Both render a nav named
 * "Primary"; only one is ever displayed, so assistive tech sees one.
 *
 * Its inner frame matches `.portfolio-wide`, so the name lines up with the
 * homepage content edge.
 */
function SiteHeader() {
  const { availability, links } = profile;

  return (
    <header className="shrink-0 border-b border-border-subtle bg-canvas max-lg:hidden">
      <div className="portfolio-wide flex h-16 items-center gap-6">
        <Link href="/" className="focus-ring mr-auto rounded-xs" aria-label={`${profile.name}, home`}>
          <span className="font-display text-body-lg font-bold tracking-tight text-foreground">{profile.name}</span>
          <span className="ml-3 text-body-sm text-foreground-muted">{profile.role}</span>
        </Link>

        <nav aria-label="Primary" className="flex items-center gap-0.5">
          {NAV_ITEMS.map((item) => (
            <NavItem key={item.href} href={item.href} label={item.label} size="bar" />
          ))}
        </nav>

        {availability.status && availability.label && links.calendly ? (
          <a
            href={links.calendly}
            target="_blank"
            rel="noreferrer noopener"
            className="focus-ring rounded-xs max-xl:hidden"
          >
            <StatusDot
              status={availability.status === "open" ? "available" : "selective"}
              label={availability.label}
              className="hover:text-foreground"
            />
            <span className="sr-only">: book time (opens in a new tab)</span>
          </a>
        ) : null}

        <AskLouieTrigger variant="primary" className="rounded-full" />
      </div>
    </header>
  );
}

export { SiteHeader };
