import Image from "next/image";
import Link from "next/link";

import { AskLouieTrigger } from "@/components/ai/ask-louie-dialog";
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
 * Its inner frame matches `.portfolio-wide`, so the name lines up with the
 * homepage content edge. The availability link was removed on 2026-09-29
 * (Louie's call); `profile.availability` still feeds Ask Louie.
 */
function SiteHeader() {
  return (
    <header className="shrink-0 border-b border-border-subtle bg-canvas max-lg:hidden">
      <div className="portfolio-wide flex h-16 items-center gap-6">
        <Link href="/" className="focus-ring mr-auto flex items-center gap-3 rounded-xs" aria-label={`${profile.name}, home`}>
          {profile.avatar ? (
            <Image src={profile.avatar} alt="" width={36} height={36} loading="eager" className="size-9 rounded-full object-cover ring-1 ring-foreground/10" />
          ) : null}
          <span className="font-display text-body-lg font-bold tracking-tight text-foreground">{profile.name}</span>
          <span className="text-body-sm text-foreground-muted">{profile.role}</span>
        </Link>

        <nav aria-label="Primary" className="flex items-center gap-0.5">
          {NAV_ITEMS.map((item) => (
            <NavItem key={item.href} href={item.href} label={item.label} size="bar" />
          ))}
        </nav>

        <AskLouieTrigger variant="primary" className="rounded-full" />
      </div>
    </header>
  );
}

export { SiteHeader };
