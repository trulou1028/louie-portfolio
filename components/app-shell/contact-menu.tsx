"use client";

import * as React from "react";
import Link from "next/link";
import { CalendarDays, Check, ChevronDown, Copy, FileText, Mail } from "lucide-react";

import { Popover, PopoverContent, PopoverTitle, PopoverTrigger } from "@/components/ui/popover";
import { Action } from "@/components/system/action";
import { LinkedInIcon } from "@/components/system/brand-icons";
import { profile } from "@/content/profile";
import { cn } from "@/lib/utils";

/**
 * Contact, one click from every page (Louie's request, 2026-10-10).
 *
 * Recruiters look for an email address first, so the address is shown as
 * text with a Copy button, not hidden behind a mailto link. The same list
 * renders in the desktop header popover and the mobile menu.
 *
 * Plan 051 (Louie's review, 2026-10-15): "Contact" with a mail icon read as
 * "this opens my email client". It is now "Let's talk", a plain dropdown
 * of the same contact links.
 */

const row = "focus-ring flex min-h-11 items-center gap-3 rounded-control px-2 text-body-sm text-foreground hover:bg-surface-muted";

/**
 * `resume`: off in the mobile menu, whose nav already lists Resume.
 * `book`: off in the header card, which shows booking as its main button.
 */
function ContactLinks({ className, onNavigate, resume = true, book = true }: { className?: string; onNavigate?: () => void; resume?: boolean; book?: boolean }) {
  const { email, linkedin, calendly } = profile.links;
  const [copied, setCopied] = React.useState(false);

  async function copyEmail() {
    if (!email) return;
    try {
      await navigator.clipboard.writeText(email);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2000);
    } catch {
      // Clipboard blocked: the address is still visible and selectable.
    }
  }

  return (
    <ul className={cn("flex flex-col gap-0.5", className)}>
      {email ? (
        <li className="flex items-center gap-1">
          <a href={`mailto:${email}`} className={cn(row, "min-w-0 flex-1")}>
            <Mail aria-hidden="true" className="size-4 shrink-0 text-foreground-muted" />
            <span className="truncate">{email}</span>
          </a>
          <button type="button" onClick={copyEmail} className="focus-ring inline-flex size-11 shrink-0 items-center justify-center rounded-control text-foreground-muted hover:bg-surface-muted hover:text-foreground">
            {copied ? <Check aria-hidden="true" className="size-4" /> : <Copy aria-hidden="true" className="size-4" />}
            <span className="sr-only">{copied ? "Email address copied" : "Copy email address"}</span>
          </button>
          <span aria-live="polite" className="sr-only">{copied ? "Copied" : ""}</span>
        </li>
      ) : null}
      {linkedin ? (
        <li>
          <a href={linkedin} target="_blank" rel="noreferrer noopener" className={row}>
            <LinkedInIcon className="size-4 shrink-0 text-foreground-muted" />
            LinkedIn<span className="sr-only"> (opens in a new tab)</span>
          </a>
        </li>
      ) : null}
      {calendly && book ? (
        <li>
          <a href={calendly} target="_blank" rel="noreferrer noopener" className={row}>
            <CalendarDays aria-hidden="true" className="size-4 shrink-0 text-foreground-muted" />
            Book time<span className="sr-only"> (opens in a new tab)</span>
          </a>
        </li>
      ) : null}
      {resume ? <li>
        <Link href="/resume" onClick={onNavigate} className={row}>
          <FileText aria-hidden="true" className="size-4 shrink-0 text-foreground-muted" />
          Resume
        </Link>
      </li> : null}
    </ul>
  );
}

function ContactMenu() {
  const [open, setOpen] = React.useState(false);
  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger render={<Action variant="secondary" className="group rounded-full" />}>
        Let’s talk
        <ChevronDown aria-hidden="true" className="size-4 transition-transform duration-(--duration-fast) group-aria-expanded:rotate-180" />
      </PopoverTrigger>
      <PopoverContent align="end" sideOffset={8} className="w-72 p-1.5">
        <PopoverTitle className="sr-only">Let’s talk</PopoverTitle>
        <ContactLinks onNavigate={() => setOpen(false)} />
      </PopoverContent>
    </Popover>
  );
}

export { ContactMenu, ContactLinks };
