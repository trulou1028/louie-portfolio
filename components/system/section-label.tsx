import * as React from "react";

import { cn } from "@/lib/utils";

/**
 * The small uppercase eyebrow that opens a section — "FEATURED CASE STUDY",
 * "AI PRODUCT DESIGN · SYSTEMS · DESIGN ENGINEERING" (spec §7, §11).
 *
 * Mono is reserved for short labels like this; never for prose (spec §7).
 */
function SectionLabel({
  className,
  ...props
}: React.ComponentPropsWithoutRef<"p">) {
  return (
    <p
      data-slot="section-label"
      className={cn(
        "font-mono text-label uppercase text-foreground-muted",
        className,
      )}
      {...props}
    />
  );
}

export { SectionLabel };
