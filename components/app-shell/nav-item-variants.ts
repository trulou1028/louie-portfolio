import { cva } from "class-variance-authority";

/**
 * Nav item styling, deliberately kept out of the client component so server
 * components can use it too (a `"use client"` module's exports cannot be
 * called from the server).
 *
 * The rail is meant to be quiet and not compete with the content, so the
 * active state is carried by weight, a slightly stronger surface, and an
 * accent-tinted icon (see `nav-item.tsx`) — never by color alone (spec §10,
 * §26), since weight and surface both carry it too.
 */
export const navItemVariants = cva(
  [
    "group relative flex items-center gap-2.5 rounded-sm px-2.5 focus-ring",
    "transition-colors duration-(--duration-fast)",
  ],
  {
    variants: {
      size: {
        /** Former desktop left rail; kept for any vertical nav list. */
        rail: "h-9 text-body-sm",
        /** Desktop header (Plan 051): mono pills; the active page is a solid ink pill. */
        bar: "h-8 rounded-full px-3.5 font-mono text-system uppercase",
        /** Mobile sheet — larger touch target (spec §26). */
        sheet: "h-11 text-body",
      },
      active: {
        true: "bg-surface-muted font-medium text-foreground",
        false:
          "text-foreground-muted hover:bg-surface-muted hover:text-foreground",
      },
    },
    compoundVariants: [
      { size: "bar", active: true, class: "bg-foreground font-medium text-canvas" },
      { size: "bar", active: false, class: "bg-surface-raised text-foreground hover:bg-border-default" },
    ],
    defaultVariants: {
      size: "rail",
      active: false,
    },
  },
);
