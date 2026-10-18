import Image from "next/image";
import Link from "next/link";

import { AskLouieTrigger } from "@/components/ai/ask-louie-dialog";
import { ContactMenu } from "@/components/app-shell/contact-menu";
import { NavItem } from "@/components/app-shell/nav-item";
import { NAV_ITEMS } from "@/lib/routes";
import { profile } from "@/content/profile";

/**
 * Desktop header (Plan 037). Replaces the persistent left rail: the rail
 * took a quarter of the screen for four links, and the work needs the width.
 *
 * Below `lg` it is hidden and `MobileNav` takes over. Both render a nav named
 * "Primary"; only one is ever displayed, so assistive tech sees one.
 *
 * Plan 051: the name alone (the hero says the role) as a two-voice
 * wordmark, mono pill navigation, then "Let's talk" (contact) and Ask
 * Louie, both outlined.
 *
 * Its inner frame matches `.portfolio-wide`, so the name lines up with the
 * homepage content edge. The availability link was removed on 2026-09-29
 * (Louie's call); `profile.availability` still feeds Ask Louie.
 */
function SiteHeader() {
  const [first, ...rest] = profile.name.split(" ");
  const last = rest.join(" ");
  return (
    <header className="shrink-0 border-b border-border-subtle bg-canvas max-lg:hidden">
      <div className="portfolio-wide flex h-16 items-center gap-6">
        <Link href="/" className="group focus-ring mr-auto flex items-center gap-3 rounded-xs" aria-label={`${profile.name}, home`}>
          {profile.avatar ? (
            <Image src={profile.avatar} alt="" width={36} height={36} loading="eager" className="size-9 rounded-full object-cover ring-1 ring-foreground/10 transition-[rotate,box-shadow] duration-(--duration-deliberate) group-hover:-rotate-8 group-hover:ring-2 group-hover:ring-accent-line motion-reduce:transition-none" />
          ) : null}
          {/* Plan 051 wordmark: Geist for the first name, Instrument Serif
              italic for the surname, the site's two voices in one name. */}
          <span data-header-name className="flex items-baseline gap-1.5 whitespace-nowrap leading-none text-foreground">
            <span className="text-body-lg font-semibold tracking-tight">{first}</span>
            <span className="font-display text-heading-md italic">{last}</span>
          </span>
        </Link>

        <nav aria-label="Primary" className="flex items-center gap-1.5">
          {NAV_ITEMS.map((item) => (
            <NavItem key={item.href} href={item.href} label={item.label} size="bar" />
          ))}
        </nav>

        <div className="flex items-center gap-2">
          <ContactMenu />
          <AskLouieTrigger variant="secondary" className="rounded-full" />
        </div>
      </div>
    </header>
  );
}

export { SiteHeader };
