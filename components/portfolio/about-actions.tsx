import Link from "next/link";
import { ArrowUpRight, CalendarDays, FileText, Layers, Mail } from "lucide-react";
import { LinkedInIcon } from "@/components/system/brand-icons";
import { Surface } from "@/components/system/surface";
import { profile } from "@/content/profile";

const row = "focus-ring flex min-h-12 items-center gap-3 rounded-sm px-3 py-3 text-body text-foreground transition-colors duration-(--duration-fast) hover:bg-accent-soft hover:text-accent";

export function AboutActions() {
  const { links } = profile;
  const groups = [
    { title: "Explore", items: [
      { label: "View selected work", href: "/work", icon: Layers },
      { label: "Resume", href: "/resume", icon: FileText },
    ] },
    { title: "Get in touch", items: [
      ...(links.email ? [{ label: "Email", href: `mailto:${links.email}`, icon: Mail }] : []),
      ...(links.linkedin ? [{ label: "LinkedIn", href: links.linkedin, icon: LinkedInIcon }] : []),
      ...(links.calendly ? [{ label: "Book time", href: links.calendly, icon: CalendarDays }] : []),
    ] },
  ];
  return <Surface radius="panel" className="mt-12 p-6 sm:p-8" render={<section aria-labelledby="about-next-heading" />}>
    <h2 id="about-next-heading" className="font-serif text-heading-lg text-foreground">Let’s start a conversation.</h2>
    <p className="mt-3 text-body text-foreground-muted">Take a closer look at the work, or get in touch.</p>
    <div className="mt-6 grid gap-6 sm:grid-cols-2 sm:gap-8">
      {groups.filter(group => group.items.length).map(group => <div key={group.title}>
        <h3 className="border-b border-border-subtle pb-3 text-body-sm text-foreground-muted">{group.title}</h3>
        <ul className="mt-2">
          {group.items.map(({ label, href, icon: Icon }) => <li key={label}>
            <Link href={href} className={row} {...(href.startsWith("https:") ? { target: "_blank", rel: "noreferrer noopener" } : {})}>
              <Icon aria-hidden="true" className="size-4 shrink-0 text-accent" />
              <span>{label}</span><ArrowUpRight aria-hidden="true" className="ml-auto size-4 text-foreground-muted" />
            </Link>
          </li>)}
        </ul>
      </div>)}
    </div>
  </Surface>;
}
