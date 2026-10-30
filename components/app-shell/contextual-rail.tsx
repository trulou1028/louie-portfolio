import * as React from "react";

import { PageAside } from "@/components/stacked/page-aside";
import { StackedShell } from "@/components/stacked/stacked-shell";
import { cn } from "@/lib/utils";

/**
 * A page's content, in the stacked layout (Louie, 2026-10-29): the standard
 * left column (`PageAside`: portrait, name, Ask Louie, links) beside the
 * page. Every page that is not the homepage or a case study uses it, so no
 * page needs a site header. `StackedShell` owns the scrolling.
 *
 * `width="reading"` keeps the page to a 900px column; `wide` lets it take
 * the whole right column.
 */
function Canvas({
  className,
  children,
  width = "reading",
}: {
  className?: string;
  width?: "reading" | "wide";
  children: React.ReactNode;
}) {
  return (
    <StackedShell aside={<PageAside />}>
      <div className={cn(width === "reading" && "max-w-[900px]", className)}>{children}</div>
    </StackedShell>
  );
}

export { Canvas };
