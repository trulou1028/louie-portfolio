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
 * Stacked redesign (2026-10-29): plain meta text, no fill and no border,
 * like the years beside a project. `tone="mono"` is kept as an alias so
 * older call sites still compile; it renders the same. For short
 * machine-ish labels like `AI SYSTEM` or `TOOL CALL`, use `SystemLabel`.
 */
const tagVariants = cva(
  "inline-flex items-center text-meta text-foreground-quiet",
  {
    variants: {
      tone: {
        default: "",
        mono: "",
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
