"use client";

import * as React from "react";
import Link from "next/link";

import { cn } from "@/lib/utils";

/**
 * A suggested question for AI Louie — "Show me Offboard", "How technical is
 * Louie?" (spec §11 §2, §34).
 *
 * Acceptance criteria it has to keep meeting (spec §34):
 * - operable by keyboard — so it is a real `<button>` or `<a>`, never a div
 * - wraps cleanly — height is intrinsic, text wraps, nothing is truncated
 * - reads as a suggestion, not a tag — generous padding, quiet border
 * - inserts or submits depending on configuration — see `mode`
 *
 * Two shapes: pass `href` for a chip that navigates (used before the AI
 * surface is live), or `onSelect` for one that drives the composer.
 */
type PromptChipBaseProps = {
  label: string;
  className?: string;
};

/** Navigates to a route — used before the AI surface is live. */
type PromptChipLinkProps = PromptChipBaseProps & { href: string };

/** Drives the composer. */
type PromptChipButtonProps = PromptChipBaseProps & {
  /** `insert` puts the text in the composer; `submit` sends it. */
  mode?: "insert" | "submit";
  onSelect: (payload: { label: string; mode: "insert" | "submit" }) => void;
};

// Each key is declared by exactly one member, so `in` narrows reliably.
// (Optional `never` members do not discriminate.)
type PromptChipProps = PromptChipLinkProps | PromptChipButtonProps;

const chipClasses = cn(
  "inline-flex min-h-11 items-center rounded-sm border border-border-default bg-surface",
  "px-3.5 py-2 text-left text-body-sm text-foreground-muted focus-ring",
  "transition-colors duration-(--duration-fast)",
  "hover:border-accent-muted hover:bg-accent-soft hover:text-accent-foreground",
);

// Note: `props` is kept intact rather than destructured in the signature —
// destructuring a discriminated union collapses it and TS loses the narrowing.
function PromptChip(props: PromptChipProps) {
  const { label, className } = props;

  if ("onSelect" in props) {
    const { mode = "submit", onSelect } = props;
    return (
      <button
        data-slot="prompt-chip"
        type="button"
        onClick={() => onSelect({ label, mode })}
        className={cn(chipClasses, className)}
      >
        {label}
      </button>
    );
  }

  return (
    <Link
      data-slot="prompt-chip"
      href={props.href}
      className={cn(chipClasses, className)}
    >
      {label}
    </Link>
  );
}

export { PromptChip };
export type { PromptChipProps };
