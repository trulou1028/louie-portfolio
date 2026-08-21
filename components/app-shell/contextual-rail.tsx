import * as React from "react";

import { cn } from "@/lib/utils";

/**
 * The optional right rail (spec §10).
 *
 * "It should disappear when it does not add value" — so this renders nothing
 * at all when it has no children, rather than leaving an empty column that
 * makes the canvas feel trapped in a dashboard grid.
 *
 * Hidden below `xl` on purpose: tablets collapse the right rail first
 * (spec §25), and its content is expected to appear inline on smaller
 * screens instead.
 */
function ContextualRail({
  className,
  children,
  "aria-label": ariaLabel = "Related",
  ...props
}: React.ComponentPropsWithoutRef<"aside">) {
  const isEmpty = React.Children.toArray(children).length === 0;
  if (isEmpty) return null;

  return (
    <aside
      aria-label={ariaLabel}
      className={cn(
        "hidden w-[300px] shrink-0 xl:block 2xl:w-[340px]",
        className,
      )}
      {...props}
    >
      <div className="sticky top-8 flex flex-col gap-6">{children}</div>
    </aside>
  );
}

/**
 * Arranges a page's main column beside an optional contextual rail.
 * Pages compose this themselves so the rail's content stays colocated with
 * the page that owns it.
 */
function Canvas({
  className,
  children,
  rail,
}: {
  className?: string;
  children: React.ReactNode;
  rail?: React.ReactNode;
}) {
  return (
    <div className="mx-auto flex w-full max-w-[1240px] gap-12 px-6 py-10 sm:px-8 lg:py-14">
      <div className={cn("min-w-0 flex-1", className)}>{children}</div>
      {rail}
    </div>
  );
}

export { ContextualRail, Canvas };
