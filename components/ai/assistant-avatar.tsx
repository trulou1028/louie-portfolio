import Image from "next/image";
import { Sparkles } from "lucide-react";

import { profile } from "@/content/profile";
import { cn } from "@/lib/utils";

/**
 * AI Louie's face (owner decision, 2026-08-31).
 *
 * This is Louie's persona answering, so it wears Louie's portrait — the same
 * `profile.avatar` the left rail's logo uses, so the two can never drift.
 *
 * It lives in its own file, depending on nothing from the chat components,
 * because both the lazy `ThreadSkeleton` and the loaded thread render it. A
 * shared component is what stops the skeleton's avatar from flashing into a
 * different one when the runtime arrives — and keeping it free of
 * `components/ui/message` imports is what stops the skeleton from dragging
 * the deferred chat bundle into the eager one (spec §27).
 *
 * The `Sparkles` mark stays as the fallback rather than `Avatar`'s initials:
 * an "LS" monogram here would read as Louie himself typing, while the sparkle
 * keeps the turn legible as machine-written when no photo is set.
 */
function AssistantAvatar({ className }: { className?: string }) {
  return (
    <span
      data-slot="message-avatar"
      aria-hidden="true"
      className={cn(
        "flex size-8 shrink-0 items-center justify-center self-start overflow-hidden rounded-full",
        profile.avatar ? "bg-surface-muted" : "bg-accent text-surface",
        className,
      )}
    >
      {profile.avatar ? (
        <Image
          src={profile.avatar}
          alt=""
          width={32}
          height={32}
          className="size-full object-cover"
        />
      ) : (
        <Sparkles className="size-4" />
      )}
    </span>
  );
}

export { AssistantAvatar };
