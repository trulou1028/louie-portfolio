import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

/**
 * The base panel primitive. Every boxed region in the portfolio is a Surface
 * so that elevation stays consistent and legible (spec §9, §34).
 *
 * Elevation hierarchy, in order of preference: border, then a subtle
 * background difference, then shadow — and shadow only for floating or
 * focused UI. There is deliberately no heavy shadow variant.
 *
 * This is a server component: composition uses `cloneElement` rather than
 * Base UI's `useRender` hook, so Surface ships no client JavaScript
 * (spec §27). Pass `render` to change the element, matching the Base UI
 * idiom used elsewhere in the codebase:
 *
 *   <Surface variant="interactive" render={<Link href="/work" />}>…</Surface>
 */
const surfaceVariants = cva("bg-clip-padding", {
  variants: {
    variant: {
      default: "border border-border-subtle bg-surface",
      muted: "bg-surface-muted",
      raised: "border border-border-subtle bg-surface-raised shadow-soft",
      interactive: [
        "border border-border-subtle bg-surface focus-ring",
        "transition-colors duration-(--duration-fast)",
        "hover:border-border-strong hover:bg-surface-raised",
      ],
      /** AI surfaces carry a quiet accent tint — the AI identity (spec §6). */
      ai: "border border-accent-muted bg-accent-soft",
    },
    radius: {
      sm: "rounded-sm",
      md: "rounded-md",
      lg: "rounded-lg",
      panel: "rounded-panel",
    },
  },
  defaultVariants: {
    variant: "default",
    radius: "md",
  },
});

// WithRef, not WithoutRef: React 19 passes `ref` as an ordinary prop, and
// callers need one to observe the element (e.g. lazy-loading the AI panel).
type SurfaceProps = React.ComponentPropsWithRef<"div"> &
  VariantProps<typeof surfaceVariants> & {
    /** Replace the rendered element, e.g. `render={<Link href="…" />}`. */
    render?: React.ReactElement<{ className?: string }>;
  };

function Surface({ className, variant, radius, render, ...props }: SurfaceProps) {
  const classes = cn(surfaceVariants({ variant, radius }), className);

  if (render) {
    return React.cloneElement(render, {
      ...props,
      "data-slot": "surface",
      className: cn(classes, render.props.className),
    } as React.HTMLAttributes<HTMLElement>);
  }

  return <div data-slot="surface" className={classes} {...props} />;
}

export { Surface, surfaceVariants };
export type { SurfaceProps };
