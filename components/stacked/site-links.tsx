"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import { profile } from "@/content/profile";
import { cn } from "@/lib/utils";

// `py-0.5` lifts each link to a 24px tap target (WCAG 2.2, 2.5.8).
const link = "focus-ring inline-block rounded-xs py-0.5 transition-colors duration-(--duration-fast) hover:text-accent-hover";
const current = "text-foreground underline decoration-accent-line underline-offset-[0.25em]";

/** LinkedIn, email, and Book a call, each as a list item. */
function contactItems(itemClassName?: string) {
  return <>
    {profile.links.linkedin ? (
      <li className={itemClassName}><a href={profile.links.linkedin} target="_blank" rel="noreferrer noopener" className={link}>LinkedIn<span className="sr-only"> (opens in a new tab)</span></a></li>
    ) : null}
    {profile.links.email ? (
      <li className={itemClassName}><a href={`mailto:${profile.links.email}`} className={link}>{profile.links.email}</a></li>
    ) : null}
    {profile.links.calendly ? (
      <li className={itemClassName}><a href={profile.links.calendly} target="_blank" rel="noreferrer noopener" className={link}>Book a call<span className="sr-only"> (opens in a new tab)</span></a></li>
    ) : null}
  </>;
}

/**
 * The site's navigation and contact, in a bar that stays at the top right
 * of every page (`.site-bar` in StackedShell; Louie, 2026-10-30: at the
 * foot of the left column they felt out of place). The page you are on is
 * ink with an underline. On a narrow canvas the bar keeps only the pages;
 * the contact links move to the top of the page (`ContactLinks`).
 */
function SiteLinks() {
  const pathname = usePathname();
  const page = (href: string, label: string) => (
    <li>
      <Link href={href} aria-current={pathname === href ? "page" : undefined} className={cn(link, pathname === href && current)}>{label}</Link>
    </li>
  );
  return (
    <nav aria-label="Primary" className="text-meta text-foreground-quiet">
      <ul className="flex gap-x-5">
        {page("/", "Work")}
        {page("/about", "About")}
        {page("/resume", "Résumé")}
        {contactItems("site-bar-contact")}
      </ul>
    </nav>
  );
}

/** The contact links on a narrow canvas, where the bar has no room for them. */
function ContactLinks({ className }: { className?: string }) {
  return (
    <nav aria-label="Contact" className={cn("stacked-narrow-only text-meta text-foreground-quiet", className)}>
      <ul className="flex flex-wrap gap-x-5 gap-y-0.5">{contactItems()}</ul>
    </nav>
  );
}

export { ContactLinks, SiteLinks };
