"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, X } from "lucide-react";

import { useReducedMotionSafe } from "@/components/portfolio/lumo/use-play";
import { profile } from "@/content/profile";
import { cn } from "@/lib/utils";

// `py-0.5` lifts each link to a 24px tap target (WCAG 2.2, 2.5.8).
const link = "focus-ring inline-block rounded-xs py-0.5 transition-colors duration-(--duration-fast) hover:text-accent-hover";
const current = "text-foreground underline decoration-accent-line underline-offset-[0.25em]";

/** The scroll, in px, over which the menu rolls up, and where it starts. */
const ROLL_START = 24;
const ROLL_DISTANCE = 220;

/** LinkedIn and Book a Call, each as a list item. The email address is on
 *  the résumé (Louie, 2026-10-30: it felt out of place in the menu). */
function contactItems(itemClassName?: string) {
  return <>
    {profile.links.linkedin ? (
      <li className={itemClassName}><a href={profile.links.linkedin} target="_blank" rel="noreferrer noopener" className={link}>LinkedIn<span className="sr-only"> (opens in a new tab)</span></a></li>
    ) : null}
    {profile.links.calendly ? (
      <li className={itemClassName}><a href={profile.links.calendly} target="_blank" rel="noreferrer noopener" className={link}>Book a Call<span className="sr-only"> (opens in a new tab)</span></a></li>
    ) : null}
  </>;
}

/**
 * The site menu: a pill at the top right of every page (`.site-bar` in
 * StackedShell; Louie, 2026-10-30). As the page scrolls it rolls up from
 * the left into a round menu button, so it stops sitting over the text.
 * The button opens the menu again, and it closes on Escape, on a click
 * outside, on a link, or when the page scrolls on.
 *
 * The roll follows the scroll directly: a `--roll` from 0 to 1 on the nav,
 * set each frame, drives the styles in globals.css. Under reduced motion it
 * snaps between the two ends. On a narrow canvas the menu keeps only the
 * pages; the contact links sit under Ask Louie (`ContactLinks`).
 */
function SiteLinks() {
  const pathname = usePathname();
  const reduce = useReducedMotionSafe();
  const navRef = React.useRef<HTMLElement>(null);
  const [rolled, setRolled] = React.useState(false);
  // The page the menu was opened on: it reads as closed on any other page,
  // and whenever the menu has not rolled up.
  const [openOn, setOpenOn] = React.useState<string | null>(null);
  const open = openOn === pathname && rolled;
  // Transitions run only while the menu opens or closes; while scrolling,
  // the roll tracks the scroll with no lag.
  const [toggling, setToggling] = React.useState(false);
  const openedAt = React.useRef(0);

  const toggle = React.useCallback((next: boolean) => {
    setToggling(true);
    setOpenOn(next ? pathname : null);
    window.setTimeout(() => setToggling(false), 400);
  }, [pathname]);

  React.useEffect(() => {
    const nav = navRef.current;
    const scroller = nav?.closest<HTMLElement>("[data-canvas-scroll]");
    if (!nav || !scroller) return;
    let frame = 0;
    const update = () => {
      frame = 0;
      const top = scroller.scrollTop;
      const roll = reduce
        ? Number(top > ROLL_START + ROLL_DISTANCE / 2)
        : Math.min(1, Math.max(0, (top - ROLL_START) / ROLL_DISTANCE));
      nav.style.setProperty("--roll", roll.toFixed(3));
      setRolled(roll > 0.5);
    };
    const schedule = () => { if (!frame) frame = requestAnimationFrame(update); };
    update();
    scroller.addEventListener("scroll", schedule, { passive: true });
    return () => {
      cancelAnimationFrame(frame);
      scroller.removeEventListener("scroll", schedule);
    };
  }, [reduce]);

  // Close when the page scrolls on, on Escape, or on a click outside.
  React.useEffect(() => {
    if (!open) return;
    const nav = navRef.current;
    const scroller = nav?.closest<HTMLElement>("[data-canvas-scroll]");
    if (!nav || !scroller) return;
    openedAt.current = scroller.scrollTop;
    const onScroll = () => { if (Math.abs(scroller.scrollTop - openedAt.current) > 160) toggle(false); };
    const onKey = (event: KeyboardEvent) => {
      if (event.key !== "Escape") return;
      toggle(false);
      nav.querySelector<HTMLButtonElement>(".site-nav-toggle")?.focus();
    };
    const onPointer = (event: PointerEvent) => { if (!nav.contains(event.target as Node)) toggle(false); };
    scroller.addEventListener("scroll", onScroll, { passive: true });
    document.addEventListener("keydown", onKey);
    document.addEventListener("pointerdown", onPointer);
    return () => {
      scroller.removeEventListener("scroll", onScroll);
      document.removeEventListener("keydown", onKey);
      document.removeEventListener("pointerdown", onPointer);
    };
  }, [open, toggle]);

  const page = (href: string, label: string) => (
    <li>
      <Link href={href} aria-current={pathname === href ? "page" : undefined} className={cn(link, pathname === href && current)}>{label}</Link>
    </li>
  );
  const hidden = rolled && !open;
  return (
    <nav
      ref={navRef}
      aria-label="Primary"
      data-rolled={rolled ? "" : undefined}
      data-open={open ? "" : undefined}
      data-toggling={toggling ? "" : undefined}
      className="site-nav text-meta text-foreground-quiet"
    >
      <ul id="site-menu" inert={hidden} className="flex gap-x-5">
        {page("/", "Work")}
        {page("/about", "About")}
        {page("/resume", "Resume")}
        {contactItems("site-bar-contact")}
      </ul>
      <button
        type="button"
        inert={!rolled}
        aria-expanded={open}
        aria-controls="site-menu"
        aria-label={open ? "Close menu" : "Menu"}
        onClick={() => toggle(!open)}
        className="site-nav-toggle focus-ring text-foreground"
      >
        <Menu aria-hidden="true" className="site-nav-icon size-4" data-icon="menu" />
        <X aria-hidden="true" className="site-nav-icon size-4" data-icon="close" />
      </button>
    </nav>
  );
}

/** The contact links on a narrow canvas, where the menu has no room for them. */
function ContactLinks({ className }: { className?: string }) {
  return (
    <nav aria-label="Contact" className={cn("stacked-narrow-only text-meta text-foreground-quiet", className)}>
      <ul className="flex flex-wrap gap-x-5 gap-y-0.5">{contactItems()}</ul>
    </nav>
  );
}

export { ContactLinks, SiteLinks };
