"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import { profile } from "@/content/profile";
import { cn } from "@/lib/utils";

// `py-0.5` lifts each link to a 24px tap target (WCAG 2.2, 2.5.8).
const link = "focus-ring inline-block rounded-xs py-0.5 transition-colors duration-(--duration-fast) hover:text-accent-hover";
const current = "text-foreground underline decoration-accent-line underline-offset-[0.25em]";

/**
 * The links at the foot of the left column. No page has a site header since
 * the stacked redesign, so this row is the site's navigation and contact.
 * The page you are on is ink with a blue underline.
 */
function SiteLinks({ className }: { className?: string }) {
  const pathname = usePathname();
  const page = (href: string, label: string) => (
    <li>
      <Link href={href} aria-current={pathname === href ? "page" : undefined} className={cn(link, pathname === href && current)}>{label}</Link>
    </li>
  );
  return (
    <nav aria-label="Primary" className={cn("text-meta text-foreground-quiet", className)}>
      <ul className="flex flex-wrap gap-x-6 gap-y-0.5">
        {page("/", "Work")}
        {page("/about", "About")}
        {page("/resume", "Résumé")}
        {profile.links.linkedin ? (
          <li><a href={profile.links.linkedin} target="_blank" rel="noreferrer noopener" className={link}>LinkedIn<span className="sr-only"> (opens in a new tab)</span></a></li>
        ) : null}
        {profile.links.email ? (
          <li><a href={`mailto:${profile.links.email}`} className={link}>{profile.links.email}</a></li>
        ) : null}
        {profile.links.calendly ? (
          <li><a href={profile.links.calendly} target="_blank" rel="noreferrer noopener" className={link}>Book a call<span className="sr-only"> (opens in a new tab)</span></a></li>
        ) : null}
      </ul>
    </nav>
  );
}

export { SiteLinks };
