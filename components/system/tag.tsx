import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

/**
 * The one chip.
 *
 * Before this existed the same markup was hand-rolled in four places — the
 * experiment detail page, the resume's skill lists, the rail work card, and
 * the case-study header — in two slightly different flavours. Any new chip
 * goes through here so they cannot drift apart again.
 *
 * `tone="mono"` is the technical variant (uppercase mono, tighter) used for
 * project tags on cards; `default` is the prose variant used for skills and
 * topic tags. For short machine-ish labels like `AI SYSTEM` or `TOOL CALL`,
 * use `SystemLabel` instead — it carries semantics, not just styling.
 */
const tagVariants = cva(
  "inline-flex items-center rounded-xs border border-border-subtle bg-surface-muted text-foreground-muted",
  {
    variants: {
      tone: {
        default: "px-2 py-0.5 text-body-sm",
        mono: "px-1.5 py-0.5 font-mono text-system uppercase",
      },
    },
    defaultVariants: {
      tone: "default",
    },
  },
);

type TagProps = React.ComponentPropsWithoutRef<"span"> &
  VariantProps<typeof tagVariants>;

function Tag({ className, tone, ...props }: TagProps) {
  return (
    <span
      data-slot="tag"
      className={cn(tagVariants({ tone }), className)}
      {...props}
    />
  );
}

export { Tag, tagVariants };
