import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

/**
 * A status indicator — availability in the left rail, experiment status on a
 * card (spec §10, §15).
 *
 * The visible `label` is required, not optional: status must never be carried
 * by color alone (spec §26). The dot is decorative reinforcement and is hidden
 * from assistive technology.
 */
const dotVariants = cva("size-1.5 shrink-0 rounded-full", {
  variants: {
    status: {
      available: "bg-success",
      selective: "bg-accent",
      unavailable: "bg-foreground-subtle",
      neutral: "bg-border-strong",
    },
  },
  defaultVariants: {
    status: "neutral",
  },
});

type StatusDotProps = Omit<React.ComponentPropsWithoutRef<"span">, "children"> &
  VariantProps<typeof dotVariants> & {
    /** Required — the status in words. */
    label: string;
  };

function StatusDot({ className, status, label, ...props }: StatusDotProps) {
  return (
    <span
      data-slot="status-dot"
      className={cn(
        "inline-flex items-center gap-2 text-body-sm text-foreground-muted",
        className,
      )}
      {...props}
    >
      <span aria-hidden="true" className={cn(dotVariants({ status }))} />
      {label}
    </span>
  );
}

export { StatusDot, dotVariants };
