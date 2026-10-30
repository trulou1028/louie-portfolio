import { RevealHeading } from "@/components/portfolio/reveal-heading";
import { MotionReveal } from "@/components/portfolio/motion-reveal";
import * as React from "react";

import { cn } from "@/lib/utils";

/**
 * One numbered section of a case study.
 *
 * The `id` is set explicitly rather than derived from the heading text: these
 * anchors are the deep-link contract used by evidence entries and AI
 * navigation (spec §13, §14), so they must survive a reworded heading.
 *
 * `tabIndex={-1}` lets Plan 005 move focus to the section after
 * AI-triggered navigation (spec §26).
 *
 * Stacked redesign: the title with its label ("Decision 02") in the narrow
 * column beside it, then the prose at a reading measure (`.case-prose`).
 */
type CaseStudySectionProps = {
  id: string;
  title: string;
  /** Short overline, e.g. "Decision 02". */
  eyebrow?: string;
  children: React.ReactNode;
  className?: string;
};

function CaseStudySection({
  id,
  title,
  eyebrow,
  children,
  className,
}: CaseStudySectionProps) {
  return (
    <section
      id={id}
      tabIndex={-1}
      aria-labelledby={`${id}-heading`}
      className={cn("scroll-mt-8 focus:outline-none", className)}
    >
      <MotionReveal stagger>
      <div className="stacked-row">
        <RevealHeading
          id={`${id}-heading`}
          className="font-display text-heading-xl text-balance text-foreground"
        >
          {title}
        </RevealHeading>
        {eyebrow ? <p className="stacked-label pt-1.5 text-meta text-foreground-quiet">{eyebrow}</p> : null}
      </div>
      <div className="case-prose">{children}</div>
      </MotionReveal>
    </section>
  );
}

export { CaseStudySection };
