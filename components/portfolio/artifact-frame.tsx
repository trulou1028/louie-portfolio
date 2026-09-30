import Image from "next/image";
import { ArrowLeft, ArrowRight, Lock, RotateCw } from "lucide-react";

import { DecisionMark } from "@/components/portfolio/decision-mark";
import type { DecisionMarkSpec } from "@/lib/decision-mark";
import { cn } from "@/lib/utils";

/**
 * A product screenshot with a caption connecting the UI to the argument the
 * section is making (spec §13.7).
 *
 * `marks` draws amber redlines over the decision the image shows (Plan 037).
 * The marks are visual; the caption carries each label for screen readers,
 * either because it already says it or because the label is prepended.
 *
 * With no `src`, it renders an explicitly labelled empty frame. That is
 * deliberate: a stand-in image would read as real product work, which spec
 * §38 rules out ("no fake data represented as real").
 *
 * `alt` is required when there is an image — these screenshots carry meaning,
 * so they are never decorative (spec §26).
 */
type ArtifactFrameProps = {
  src?: string | null;
  alt?: string;
  caption: string;
  /** Intrinsic size of the asset; required by next/image. */
  width?: number;
  height?: number;
  marks?: readonly DecisionMarkSpec[];
  /** Load eagerly when the frame is above the fold (Next 16: `loading`, not `priority`). */
  eager?: boolean;
  /**
   * `browser` (default) puts a browser window bar above a full-window
   * screenshot. `none` is for crops and panels, which were never a window.
   */
  frame?: "browser" | "none";
  /** The address shown in the bar. Only a real, published address; left empty otherwise. */
  url?: string;
  className?: string;
};

/**
 * A Chrome-style window bar (Plan 044): window dots, back, forward, and
 * reload, and the address field. Decorative, so hidden from screen readers;
 * the caption and alt text carry the meaning. Neutral tokens only, so the
 * bar never competes with the screenshot's own color.
 */
function BrowserBar({ url }: { url?: string }) {
  return (
    <div aria-hidden="true" className="flex h-9 items-center gap-3 border-b border-border-subtle bg-surface-muted px-3 sm:h-10 sm:px-4">
      <span className="flex gap-1.5">
        <span className="size-2.5 rounded-full bg-border-strong" />
        <span className="size-2.5 rounded-full bg-border-strong" />
        <span className="size-2.5 rounded-full bg-border-strong" />
      </span>
      <span className="flex items-center gap-2 text-foreground-subtle max-sm:hidden">
        <ArrowLeft className="size-3.5" />
        <ArrowRight className="size-3.5" />
        <RotateCw className="size-3.5" />
      </span>
      <span className="flex h-6 min-w-0 flex-1 items-center gap-1.5 rounded-full bg-surface px-3 text-body-sm text-foreground-muted sm:mx-auto sm:max-w-md">
        {url ? (
          <>
            <Lock className="size-3 shrink-0" />
            <span className="truncate">{url}</span>
          </>
        ) : null}
      </span>
      {/* Balances the dots, so the address field sits in the middle. */}
      <span className="w-[42px] shrink-0 max-sm:hidden sm:w-[98px]" />
    </div>
  );
}

function ArtifactFrame({
  src,
  alt,
  caption,
  width = 1600,
  height = 1000,
  marks,
  eager = false,
  frame = "browser",
  url,
  className,
}: ArtifactFrameProps) {
  // Screen readers get each mark's label from the caption. Skip any label
  // the caption already states, so nobody reads it twice.
  const unstated = (marks ?? []).filter(
    (mark) => !caption.toLowerCase().includes(mark.label.toLowerCase()),
  );

  return (
    <figure className={cn("mt-8", className)}>
      {src ? (
        <div className="overflow-hidden rounded-lg border border-border-subtle bg-surface">
          {frame === "browser" ? <BrowserBar url={url} /> : null}
          {/* Marks are placed in percent of the image, so they stay inside
              this box and never count the browser bar. */}
          <div className="relative">
          <Image
            src={src}
            alt={alt ?? ""}
            width={width}
            height={height}
            loading={eager ? "eager" : "lazy"}
            className="block h-auto w-full"
            sizes="(min-width: 1024px) 760px, 100vw"
          />
          {marks?.map((mark) => <DecisionMark key={mark.label} mark={mark} />)}
          </div>
        </div>
      ) : (
        /* Awaiting a real screenshot. `data-pending-asset` makes these
           enumerable for Plan 008's pre-launch content sweep — captions stay
           readable prose, so no developer marker is ever visible to a reader. */
        <div
          data-pending-asset
          aria-hidden="true"
          className="flex min-h-[220px] items-center justify-center rounded-lg border border-dashed border-border-default bg-surface-muted"
        >
          <span className="font-mono text-system uppercase text-foreground-muted">
            Screenshot to come
          </span>
        </div>
      )}
      <figcaption className="mt-3 text-body text-foreground-muted">
        {unstated.length ? (
          <span className="mr-1.5 font-medium text-foreground">
            {unstated.map((mark) => mark.label).join(". ")}.
          </span>
        ) : null}
        {caption}
      </figcaption>
    </figure>
  );
}

export { ArtifactFrame };
