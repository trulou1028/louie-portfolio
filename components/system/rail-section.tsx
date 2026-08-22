import * as React from "react";
import Link from "next/link";
import { ArrowRight } from "lucide-react";

import { SectionLabel } from "@/components/system/section-label";
import { cn } from "@/lib/utils";

/**
 * A titled block inside the contextual rail, optionally with a "View all"
 * link (spec §10).
 */
function RailSection({
  title,
  viewAllHref,
  viewAllLabel = "View all",
  children,
  className,
}: {
  title: string;
  viewAllHref?: string;
  viewAllLabel?: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <section className={cn("flex flex-col gap-3", className)}>
      <div className="flex items-baseline justify-between gap-3">
        <SectionLabel>{title}</SectionLabel>
        {viewAllHref ? (
          <Link
            href={viewAllHref}
            className="focus-ring group inline-flex shrink-0 items-center gap-1 rounded-xs text-body-sm text-foreground-muted transition-colors duration-(--duration-fast) hover:text-accent"
          >
            {viewAllLabel}
            <ArrowRight
              aria-hidden="true"
              className="size-3.5 transition-transform duration-(--duration-fast) group-hover:translate-x-0.5"
            />
          </Link>
        ) : null}
      </div>
      {children}
    </section>
  );
}

export { RailSection };
