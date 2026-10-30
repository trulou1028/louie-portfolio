import Link from "next/link";

import { DeepLinkHighlight } from "@/components/portfolio/deep-link-highlight";
import { MotionReveal } from "@/components/portfolio/motion-reveal";
import { TableOfContents, TableOfContentsInline } from "@/components/portfolio/table-of-contents";
import { AskLouieButton } from "@/components/stacked/ask-louie-button";
import { ContactLinks } from "@/components/stacked/site-links";
import { Portrait } from "@/components/stacked/portrait";
import { StackedShell } from "@/components/stacked/stacked-shell";
import { profile } from "@/content/profile";
import type { Anchor } from "@/lib/routes";

const quietLink = "focus-ring rounded-xs transition-colors duration-(--duration-fast) hover:text-accent-hover";

/**
 * A case study in the stacked layout (Louie, 2026-10-29). The left column
 * stays in view: the small portrait and the name (both link home), Ask
 * Louie, the project's facts, and the site links, so contact stays one
 * click away. The contents, with the current section in blue, float in a
 * third column on the right of the article (`rail`). The page itself opens with a label, the title, and a lead.
 *
 * The header slot holds what follows the lead: the hero screenshot and the
 * brief, or an experiment's status line.
 */
function CaseStudyLayout({ label, title, lead, facts, anchors, header, children }: {
  /** The line over the title, e.g. "Offboard · 2025 to now". */
  label: string;
  title: string;
  lead?: string | null;
  facts: readonly { label: string; value: React.ReactNode }[];
  anchors: readonly Anchor[];
  header?: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <StackedShell
      rail={<TableOfContents anchors={anchors} />}
      aside={<>
        <Link href="/" aria-label={`${profile.name}, home`} className="focus-ring w-fit rounded-xs">
          <Portrait size="sm" />
        </Link>
        <p className="mt-2 font-display text-heading-md text-foreground">
          <Link href="/" className={quietLink}>{profile.name}</Link>
        </p>
        <AskLouieButton label="Ask about this project" className="mt-5" />
        <dl className="mt-8 grid gap-2.5">
          {facts.map((fact) => (
            <div key={fact.label}>
              <dt className="text-meta text-foreground-quiet">{fact.label}</dt>
              <dd className="text-body leading-snug text-foreground">{fact.value}</dd>
            </div>
          ))}
        </dl>
        <ContactLinks className="mt-8" />
      </>}
    >
      <DeepLinkHighlight />
      <article>
        <MotionReveal stagger><header>
          <p className="text-meta text-foreground-quiet">{label}</p>
          <h1 className="mt-3 max-w-[14em] font-display text-display-lg text-balance text-foreground">{title}</h1>
          {lead ? <p className="mt-6 max-w-[34rem] text-lead text-pretty text-foreground">{lead}</p> : null}
          {header}
        </header></MotionReveal>
        <TableOfContentsInline anchors={anchors} className="rail-fallback mt-10" />
        <div className="mt-20 flex flex-col gap-24">{children}</div>
      </article>
    </StackedShell>
  );
}

export { CaseStudyLayout };
