import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

/**
 * The portfolio's button (spec §33: `Button -> Action`).
 *
 * Two paths, on purpose:
 *
 * - No `render` → a real Base UI `<button>`, keeping its focus and disabled
 *   behavior.
 * - With `render` (e.g. `render={<Link href="/work" />}`) → the styling is
 *   applied straight to the link. It deliberately does NOT go through Base
 *   UI's Button, which would add `role="button"` to an `<a>` and announce a
 *   navigation link as a button (spec §26).
 *
 * Sizes are taller than shadcn's defaults: `md` is 44px so primary actions
 * clear the touch-target minimum.
 */
const actionVariants = cva(
  [
    "inline-flex shrink-0 items-center justify-center whitespace-nowrap rounded-sm",
    "font-medium transition-colors duration-(--duration-fast) focus-ring",
    "disabled:pointer-events-none disabled:opacity-50",
    "[&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
  ],
  {
    variants: {
      variant: {
        primary:
          "border border-transparent bg-accent text-surface hover:bg-accent-hover",
        secondary:
          "border border-border-default bg-surface text-foreground hover:border-border-strong hover:bg-surface-muted",
        ghost:
          "border border-transparent bg-transparent text-foreground-muted hover:bg-surface-muted hover:text-foreground",
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
  "variant" | "size" | "render"
> &
  VariantProps<typeof actionVariants> & {
    /** Render as another element, e.g. `render={<Link href="…" />}`. */
    render?: React.ReactElement<{ className?: string }>;
  };

function Action({ className, variant, size, render, ...props }: ActionProps) {
  const classes = cn(actionVariants({ variant, size }), className);

  if (render) {
    return React.cloneElement(render, {
      ...props,
      "data-slot": "action",
      className: cn(classes, render.props.className),
    } as React.HTMLAttributes<HTMLElement>);
  }

  return <Button data-slot="action" variant="ghost" className={classes} {...props} />;
}

/**
 * A text-weight action for use inside prose and cards — "Open evidence →".
 * Same two paths as Action.
 */
const inlineActionClasses = cn(
  "inline-flex items-center gap-1 rounded-xs text-body-sm font-medium text-accent focus-ring",
  "underline-offset-4 transition-colors duration-(--duration-instant)",
  "hover:text-accent-hover hover:underline",
);

type InlineActionProps = Omit<
  React.ComponentProps<typeof Button>,
  "variant" | "size" | "render"
> & {
  render?: React.ReactElement<{ className?: string }>;
};

function InlineAction({ className, render, ...props }: InlineActionProps) {
  const classes = cn(inlineActionClasses, className);

  if (render) {
    return React.cloneElement(render, {
      ...props,
      "data-slot": "inline-action",
      className: cn(classes, render.props.className),
    } as React.HTMLAttributes<HTMLElement>);
  }

  return (
    <Button
      data-slot="inline-action"
      variant="ghost"
      className={cn(
        "h-auto border-transparent bg-transparent p-0 hover:bg-transparent",
        classes,
      )}
      {...props}
    />
  );
}

export { Action, InlineAction, actionVariants };
