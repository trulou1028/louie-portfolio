import { RevealHeading } from "@/components/portfolio/reveal-heading";
import { MotionReveal } from "@/components/portfolio/motion-reveal";
import * as React from "react";

import { SectionLabel } from "@/components/system/section-label";
import { cn } from "@/lib/utils";

/**
 * One numbered section of a case study.
 *
 * The `id` is set explicitly rather than derived from the heading text: these
 * anchors are the deep-link contract used by evidence entries and AI
 * navigation (spec §13, §14), so they must survive a reworded heading.
 *
 * `scroll-mt` keeps the heading clear of the sticky mobile header when a deep
 * link lands here, and `tabIndex={-1}` lets Plan 005 move focus to the
 * section after AI-triggered navigation (spec §26).
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
      className={cn(
        "scroll-mt-20 border-t border-border-subtle pt-10 focus:outline-none lg:scroll-mt-10 lg:pt-12",
        className,
      )}
    >
      <MotionReveal stagger>
      {eyebrow ? <SectionLabel className="mb-3">{eyebrow}</SectionLabel> : null}
      <RevealHeading
        id={`${id}-heading`}
        className="font-serif text-heading-xl text-balance text-foreground"
      >
        {title}
      </RevealHeading>
      {children}
      </MotionReveal>
    </section>
  );
}

export { CaseStudySection };
