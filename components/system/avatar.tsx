import Image from "next/image";

import { cn } from "@/lib/utils";
import { profile } from "@/content/profile";

/**
 * Louie's avatar.
 *
 * Renders the real photo once `profile.avatar` points at one (drop a square
 * image in `public/images/` and set the path). Until then it falls back to
 * initials rather than a stock silhouette — a generic placeholder face on a
 * personal portfolio reads worse than an honest monogram.
 *
 * Decorative by default: the surrounding text already names Louie, so the
 * image is `alt=""` unless a caller passes a label.
 */
const SIZES = {
  sm: { box: "size-8", text: "text-body-sm", px: 32 },
  md: { box: "size-10", text: "text-body", px: 40 },
  lg: { box: "size-14", text: "text-heading-md", px: 56 },
} as const;

function initials(name: string): string {
  return name
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? "")
    .join("");
}

function Avatar({
  size = "md",
  label,
  className,
}: {
  size?: keyof typeof SIZES;
  /** Accessible name. Omit for decorative use beside Louie's name. */
  label?: string;
  className?: string;
}) {
  const { box, text, px } = SIZES[size];

  return (
    <span
      className={cn(
        "inline-flex shrink-0 items-center justify-center overflow-hidden rounded-full",
        "border border-border-default bg-surface-muted",
        box,
        className,
      )}
    >
      {profile.avatar ? (
        <Image
          src={profile.avatar}
          alt={label ?? ""}
          width={px}
          height={px}
          className="size-full object-cover"
        />
      ) : (
        <span
          aria-hidden={label ? undefined : true}
          className={cn("font-serif text-foreground-muted", text)}
        >
          {initials(profile.name)}
        </span>
      )}
    </span>
  );
}

export { Avatar };
