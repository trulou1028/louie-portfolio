import Link from "next/link";

import { AskLouieButton } from "@/components/stacked/ask-louie-button";
import { Portrait } from "@/components/stacked/portrait";
import { ContactLinks } from "@/components/stacked/site-links";
import { profile } from "@/content/profile";

/**
 * The left column on every page that is not the homepage or a case study:
 * About, Résumé, Work, and the rest. The small portrait and the name link
 * home; Ask Louie follows. The site links are in the bar at the top right. It replaces the site header,
 * so every page starts the same way (Louie, 2026-10-29).
 */
function PageAside() {
  return <>
    <Link href="/" aria-label={`${profile.name}, home`} className="focus-ring w-fit rounded-xs">
      <Portrait size="sm" />
    </Link>
    <p className="mt-2 font-display text-heading-md text-foreground">
      <Link href="/" className="focus-ring rounded-xs transition-colors duration-(--duration-fast) hover:text-accent-hover">{profile.name}</Link>
    </p>
    <p className="mt-1 text-meta text-foreground-quiet">{profile.role}</p>
    <AskLouieButton className="mt-6" />
    <ContactLinks className="mt-6" />
  </>;
}

export { PageAside };
