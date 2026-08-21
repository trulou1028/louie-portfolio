import Image from "next/image";

import { cn } from "@/lib/utils";

/**
 * A product screenshot with a caption connecting the UI to the argument the
 * section is making (spec §13.7).
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
  className?: string;
};

function ArtifactFrame({
  src,
  alt,
  caption,
  width = 1600,
  height = 1000,
  className,
}: ArtifactFrameProps) {
  return (
    <figure className={cn("mt-8", className)}>
      {src ? (
        <Image
          src={src}
          alt={alt ?? ""}
          width={width}
          height={height}
          className="w-full rounded-lg border border-border-subtle bg-surface"
          sizes="(min-width: 1024px) 760px, 100vw"
        />
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
      <figcaption className="mt-3 max-w-[68ch] text-body-sm text-foreground-muted">
        {caption}
      </figcaption>
    </figure>
  );
}

export { ArtifactFrame };
