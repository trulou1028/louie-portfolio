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
        /** Desktop left rail. */
        rail: "h-9 text-body-sm",
        /** Mobile sheet — larger touch target (spec §26). */
        sheet: "h-11 text-body",
      },
      active: {
        true: "bg-surface-muted font-medium text-foreground",
        false:
          "text-foreground-muted hover:bg-surface-muted hover:text-foreground",
      },
    },
    defaultVariants: {
      size: "rail",
      active: false,
    },
  },
);
