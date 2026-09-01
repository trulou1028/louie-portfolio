"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import type { VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";
import type { Route } from "@/lib/routes";
import { navItemVariants } from "./nav-item-variants";

/**
 * A single primary-navigation entry (spec §10).
 *
 * Active state is derived from the pathname and announced with
 * `aria-current="page"`, so it is never signalled by color alone (spec §26).
 * Styling lives in `./nav-item-variants` so server components can reuse it.
 */
type NavItemProps = Omit<
  React.ComponentPropsWithoutRef<typeof Link>,
  "href" | "children"
> &
  Pick<VariantProps<typeof navItemVariants>, "size"> & {
    href: Route;
    label: string;
    /** Optional 16px lucide icon. */
    icon?: React.ReactNode;
  };

function NavItem({ className, href, label, icon, size, ...props }: NavItemProps) {
  const pathname = usePathname();
  const isActive = href === "/" ? pathname === "/" : pathname.startsWith(href);

  return (
    <Link
      data-slot="nav-item"
      href={href}
      aria-current={isActive ? "page" : undefined}
      className={cn(navItemVariants({ size, active: isActive }), className)}
      {...props}
    >
      {/* The active item used to add an accent bar pinned to its left edge.
          That treatment is gone (owner decision, 2026-08-31 — it had become
          a visual cliché, and the site was using a version of it in four
          unrelated places). The accent now tints the item's own icon
          instead, which marks the row without adding a shape to it.

          This does not reduce the state to colour alone (spec §26): the
          active row still carries a stronger surface, medium weight, full
          `text-foreground`, and `aria-current="page"`. */}
      {icon ? (
        <span
          aria-hidden="true"
          className={cn("[&_svg]:size-4", isActive && "text-accent")}
        >
          {icon}
        </span>
      ) : null}
      {label}
    </Link>
  );
}

export { NavItem };
