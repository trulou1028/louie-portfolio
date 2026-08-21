import Link from "next/link";
import { Menu } from "lucide-react";

import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { NavItem } from "@/components/app-shell/nav-item";
import { InlineLink } from "@/components/system/inline-link";
import { NAV_ITEMS } from "@/lib/routes";
import { profile } from "@/content/profile";

/**
 * Compact header and drawer navigation below `lg` (spec §10, §25).
 *
 * Mobile deliberately does not reproduce the desktop dashboard layout: a
 * small header, a drawer, and full-width editorial content. Nav items use the
 * larger `sheet` size so touch targets clear 44px (spec §26).
 */
function MobileNav() {
  return (
    <header className="sticky top-0 z-40 flex h-14 items-center justify-between border-b border-border-subtle bg-canvas/90 px-4 backdrop-blur-sm lg:hidden">
      <Link href="/" className="focus-ring rounded-sm">
        <span className="font-serif text-heading-md leading-none text-foreground">
          {profile.name}
        </span>
      </Link>

      {/* Uncontrolled: each SheetClose below dismisses the drawer on
          navigation, so no open-state effect is needed. */}
      <Sheet>
        <SheetTrigger
          className="focus-ring inline-flex size-11 items-center justify-center rounded-sm text-foreground-muted transition-colors duration-(--duration-fast) hover:bg-surface-muted hover:text-foreground"
          aria-label="Open navigation menu"
        >
          <Menu aria-hidden="true" className="size-5" />
        </SheetTrigger>

        <SheetContent side="right" className="w-[280px] bg-canvas">
          <SheetHeader>
            <SheetTitle className="font-serif text-heading-md">
              {profile.name}
            </SheetTitle>
            <p className="text-body-sm text-foreground-muted">{profile.role}</p>
          </SheetHeader>

          <nav aria-label="Primary" className="flex flex-col gap-0.5 px-3">
            {NAV_ITEMS.map((item) => (
              <SheetClose
                key={item.href}
                render={
                  <NavItem href={item.href} label={item.label} size="sheet" />
                }
              />
            ))}
          </nav>

          {profile.links.linkedin || profile.links.email ? (
            <div className="mt-auto flex flex-col gap-3 px-6 pb-8 text-body-sm">
              {profile.links.linkedin ? (
                <InlineLink href={profile.links.linkedin}>LinkedIn</InlineLink>
              ) : null}
              {profile.links.email ? (
                <InlineLink href={`mailto:${profile.links.email}`}>
                  Email
                </InlineLink>
              ) : null}
            </div>
          ) : null}
        </SheetContent>
      </Sheet>
    </header>
  );
}

export { MobileNav };
