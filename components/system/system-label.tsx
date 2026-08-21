import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

/**
 * A small technical marker: `AI SYSTEM`, `TOOL CALL`, `PROTOTYPE`
 * (spec §7, §33 — this is the portfolio's replacement for a shadcn Badge).
 *
 * Deliberately quiet. It labels machinery; it should never read as a
 * decorative tag cloud.
 */
const systemLabelVariants = cva(
  "inline-flex items-center gap-1.5 rounded-xs border px-1.5 py-0.5 font-mono text-system uppercase",
  {
    variants: {
      tone: {
        default: "border-border-default bg-surface-muted text-foreground-muted",
        /** Reserved for AI identity and tool activity (spec §6). */
        accent: "border-accent-muted bg-accent-soft text-accent-foreground",
        quiet: "border-transparent bg-transparent text-foreground-muted",
      },
    },
    defaultVariants: {
      tone: "default",
    },
  },
);

type SystemLabelProps = React.ComponentPropsWithoutRef<"span"> &
  VariantProps<typeof systemLabelVariants>;

function SystemLabel({ className, tone, ...props }: SystemLabelProps) {
  return (
    <span
      data-slot="system-label"
      className={cn(systemLabelVariants({ tone }), className)}
      {...props}
    />
  );
}

export { SystemLabel, systemLabelVariants };
