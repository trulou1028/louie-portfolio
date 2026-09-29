import Image from "next/image";
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";

import { MotionReveal } from "@/components/portfolio/motion-reveal";
import { TONES, type PlateTone } from "@/components/portfolio/work-plate";
import { cn } from "@/lib/utils";

/**
 * A project tile for the homepage bento grid (Plan 038). Same plate colors
 * as `WorkPlate`, reduced to what a scan needs: brand, a two-line title, the
 * role, and the screenshot. Summaries and facts live on the case study.
 *
 * Height: in each grid row the large tile sets the height; the small tile's
 * screenshot fills whatever space remains (anchored top-left, cropped at the
 * bottom and right edge), so neither tile shows an empty band.
 *
 * The screenshot runs 12px past the tile's bottom edge, where the tile clips
 * it. The hover lift (6px) therefore never opens a gap under the image.
 *
 * One link: the title, whose `::after` covers the tile. `extra` renders above
 * that overlay (`relative z-10`), so a second link such as a live demo stays
 * clickable.
 */
type WorkTileProps = {
  tone: PlateTone;
  href: string;
  brand: React.ReactNode;
  title: string;
  meta: string | null;
  image: { src: string; alt: string; width: number; height: number } | null;
  size: "large" | "small";
  eager?: boolean;
  extra?: React.ReactNode;
  className?: string;
};

function WorkTile({ tone, href, brand, title, meta, image, size, eager = false, extra, className }: WorkTileProps) {
  const t = TONES[tone];
  const large = size === "large";

  return (
    <MotionReveal className={cn("h-full", className)}>
      <article className={cn("group relative flex h-full flex-col overflow-hidden rounded-panel px-6 pt-6 sm:px-8 sm:pt-8", !image && "pb-8", t.field, t.ink)}>
        <div className="flex items-start justify-between gap-4">
          {brand}
          <span aria-hidden="true" className="inline-flex size-10 shrink-0 items-center justify-center rounded-full border border-current/25 transition-colors duration-(--duration-fast) group-hover:border-current">
            <ArrowUpRight className="size-4 transition-transform duration-(--duration-fast) group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
          </span>
        </div>
        <h3 className={cn("mt-5 max-w-[30ch] font-display text-balance", large ? "text-heading-lg" : "text-heading-md")}>
          <Link href={href} className="focus-ring rounded-xs after:absolute after:inset-0 after:content-['']">{title}</Link>
        </h3>
        {meta || extra ? (
          <p className={cn("mt-2 flex flex-wrap items-center gap-x-5 gap-y-1 text-body-sm", t.muted)}>
            {meta ? <span>{meta}</span> : null}
            {extra ? <span className="relative z-10">{extra}</span> : null}
          </p>
        ) : null}
        {image ? (
          <div
            className={cn(
              "relative mt-7 -mb-3",
              // Large tiles size the row from the image's own aspect ratio.
              // Small tiles fill what is left, with a floor on narrow screens.
              large ? "" : "aspect-[16/10] @4xl/canvas:aspect-auto @4xl/canvas:min-h-56 @4xl/canvas:flex-1",
            )}
          >
            <Image
              src={image.src}
              alt={image.alt}
              width={image.width}
              height={image.height}
              loading={eager ? "eager" : "lazy"}
              sizes={large ? "(min-width: 1024px) 720px, 90vw" : "(min-width: 1024px) 520px, 90vw"}
              className={cn(
                "w-full rounded-t-md shadow-shot ring-1 ring-foreground/10 transition-transform duration-(--duration-deliberate) group-hover:-translate-y-1.5 motion-reduce:transition-none",
                large ? "block h-auto" : "absolute inset-0 h-full object-cover object-left-top",
              )}
            />
          </div>
        ) : null}
      </article>
    </MotionReveal>
  );
}

export { WorkTile };
