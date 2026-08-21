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
      {isActive ? (
        <span
          aria-hidden="true"
          className="absolute left-0 h-4 w-0.5 rounded-full bg-accent"
        />
      ) : null}
      {icon ? (
        <span aria-hidden="true" className="[&_svg]:size-4">
          {icon}
        </span>
      ) : null}
      {label}
    </Link>
  );
}

export { NavItem };
