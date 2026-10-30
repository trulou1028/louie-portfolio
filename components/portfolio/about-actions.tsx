import Link from "next/link";
import { profile } from "@/content/profile";

const row = "focus-ring flex min-h-11 items-center justify-between gap-3 rounded-xs border-b border-border-default py-2.5 text-body text-foreground transition-colors duration-(--duration-fast) hover:text-accent-hover";

/**
 * The About page's closing links (Plan 046). Stacked redesign: two ruled
 * lists on the page, no panel and no icons.
 */
export function AboutActions() {
  const { links } = profile;
  const groups = [
    { title: "Explore", items: [
      { label: "View selected work", href: "/" },
      { label: "Resume", href: "/resume" },
    ] },
    { title: "Get in touch", items: [
      ...(links.email ? [{ label: "Email", href: `mailto:${links.email}` }] : []),
      ...(links.linkedin ? [{ label: "LinkedIn", href: links.linkedin }] : []),
      ...(links.calendly ? [{ label: "Book time", href: links.calendly }] : []),
    ] },
  ];
  return <section aria-labelledby="about-next-heading" className="mt-16 border-t border-foreground pt-6">
    <h2 id="about-next-heading" className="font-display text-heading-lg text-foreground">Let’s start a conversation.</h2>
    <p className="mt-3 max-w-[34rem] text-body text-foreground-muted">Take a look through some of my work, or reach out if you’re building something interesting.</p>
    <div className="mt-8 grid gap-8 sm:grid-cols-2">
      {groups.filter(group => group.items.length).map(group => <div key={group.title}>
        <h3 className="border-b border-border-default pb-2 text-meta text-foreground-quiet">{group.title}</h3>
        <ul>
          {group.items.map(({ label, href }) => <li key={label}>
            <Link href={href} className={row} {...(href.startsWith("https:") ? { target: "_blank", rel: "noreferrer noopener" } : {})}>
              <span>{label}</span><span aria-hidden="true" className="text-foreground-quiet">{href.startsWith("/") ? "→" : "↗"}</span>
            </Link>
          </li>)}
        </ul>
      </div>)}
    </div>
  </section>;
}
