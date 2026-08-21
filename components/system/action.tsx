import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

/**
 * The portfolio's button (spec §33: `Button -> Action`).
 *
 * Wraps the upstream Base UI button so focus, disabled, and `render`
 * behavior stay stock, and replaces only the visual language. Sizes are
 * deliberately taller than shadcn's defaults: `md` is 44px so primary
 * actions clear the touch-target minimum (spec §26).
 *
 * Composes like any Base UI component:
 *   <Action render={<Link href="/work" />}>View selected work</Action>
 */
const actionVariants = cva(
  "rounded-sm font-medium transition-colors duration-(--duration-fast)",
  {
    variants: {
      variant: {
        primary:
          "border-transparent bg-accent text-surface hover:bg-accent-hover",
        secondary:
          "border border-border-default bg-surface text-foreground hover:border-border-strong hover:bg-surface-muted",
        ghost:
          "border-transparent bg-transparent text-foreground-muted hover:bg-surface-muted hover:text-foreground",
      },
      size: {
        sm: "h-9 gap-2 px-3.5 text-body-sm",
        md: "h-11 gap-2 px-5 text-body-sm",
        lg: "h-13 gap-2.5 px-6 text-body",
      },
    },
    defaultVariants: {
      variant: "primary",
      size: "md",
    },
  },
);

// Omit the upstream variant/size unions — otherwise they intersect with ours
// and only the values common to both survive.
type ActionProps = Omit<
  React.ComponentProps<typeof Button>,
  "variant" | "size"
> &
  VariantProps<typeof actionVariants>;

function Action({ className, variant, size, ...props }: ActionProps) {
  return (
    <Button
      data-slot="action"
      // Neutralize the upstream palette; actionVariants wins via tailwind-merge.
      variant="ghost"
      className={cn(actionVariants({ variant, size }), className)}
      {...props}
    />
  );
}

/**
 * A text-weight action for use inside prose and cards — "Open evidence →".
 * Reads as a link, behaves as a button.
 */
function InlineAction({
  className,
  ...props
}: React.ComponentProps<typeof Button>) {
  return (
    <Button
      data-slot="inline-action"
      variant="ghost"
      className={cn(
        "h-auto gap-1 rounded-xs border-transparent bg-transparent p-0 text-body-sm font-medium text-accent",
        "transition-colors duration-(--duration-instant) hover:bg-transparent hover:text-accent-hover hover:underline underline-offset-4",
        className,
      )}
      {...props}
    />
  );
}

export { Action, InlineAction, actionVariants };
