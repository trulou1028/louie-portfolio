import * as React from "react";
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";

import { cn } from "@/lib/utils";

/**
 * A link inside prose (spec §33: `Button -> InlineAction`, links stay links).
 *
 * Accent color plus an underline on hover — the underline matters because
 * color alone must not be the only signal (spec §26). Internal hrefs route
 * through `next/link`; external ones open in a new tab, get
 * `rel="noreferrer noopener"`, and carry a visible affordance.
 */
type InlineLinkProps = React.ComponentPropsWithoutRef<"a"> & {
  href: string;
};

function isInternal(href: string) {
  return href.startsWith("/") || href.startsWith("#");
}

function InlineLink({ className, href, children, ...props }: InlineLinkProps) {
  const classes = cn(
    // Always underlined: the accent text is ink, so color alone would not
    // tell a link from body text (WCAG 1.4.1). Stacked redesign: a thin blue
    // underline, and blue text on hover.
    "text-accent underline decoration-accent-line decoration-1 underline-offset-[0.2em] focus-ring rounded-xs",
    "transition-colors duration-(--duration-fast) hover:text-accent-hover",
    className,
  );

  if (isInternal(href)) {
    return (
      <Link data-slot="inline-link" href={href} className={classes} {...props}>
        {children}
      </Link>
    );
  }

  return (
    <a
      data-slot="inline-link"
      href={href}
      target="_blank"
      rel="noreferrer noopener"
      className={cn(classes, "inline-flex items-center gap-0.5")}
      {...props}
    >
      {children}
      <ArrowUpRight aria-hidden="true" className="size-3.5" />
      <span className="sr-only">(opens in a new tab)</span>
    </a>
  );
}

export { InlineLink };
