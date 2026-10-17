import Image from "next/image";
import Link from "next/link";

import { MotionReveal } from "@/components/portfolio/motion-reveal";
import { cn } from "@/lib/utils";

/**
 * Work cards (Plan 051). One anatomy everywhere: the screenshot on a quiet
 * frame, a mono meta line, and the title. No plate color, no logo, no
 * summary: the title carries the argument, and the case study carries the
 * rest. Color belongs to the case study pages, where there is room for it.
 *
 * The whole card is one link (the title's `::after` covers it). Hover lifts
 * the screenshot and underlines the title in lilac.
 */
type CardImage = { src: string; alt: string; width: number; height: number };

const titleLink =
  "focus-ring rounded-xs underline decoration-transparent decoration-2 underline-offset-[6px] transition-[text-decoration-color] duration-(--duration-fast) group-hover:decoration-accent-line after:absolute after:inset-0 after:content-['']";

const shot =
  "h-auto w-full rounded-xs shadow-shot ring-1 ring-foreground/10 transition-transform duration-(--duration-deliberate) group-hover:-translate-y-1.5 motion-reduce:transition-none";

/** The neutral frame a screenshot sits on. `fit` gives every small card the same 4:3 shape. */
function Frame({ image, fit, sizes, eager = false }: { image: CardImage; fit: boolean; sizes: string; eager?: boolean }) {
  return (
    <div className={cn("overflow-hidden rounded-panel bg-surface-muted", fit ? "flex aspect-[4/3] items-center justify-center p-5 sm:p-8" : "p-5 sm:p-10")}>
      <Image src={image.src} alt={image.alt} width={image.width} height={image.height} sizes={sizes} loading={eager ? "eager" : "lazy"} className={shot} />
    </div>
  );
}

export function WorkCard({ href, image, meta, title, size = "default", eager = false, className }: {
  href: string;
  image: CardImage | null;
  meta: string;
  title: string;
  /** `lead`: the full-width first case study. `small`: the independent projects. */
  size?: "lead" | "default" | "small";
  eager?: boolean;
  className?: string;
}) {
  const lead = size === "lead";
  return (
    <MotionReveal className={className}>
      <article className="group relative flex flex-col">
        {image ? <Frame image={image} fit={!lead} eager={eager} sizes={lead ? "(min-width: 1024px) 1100px, 90vw" : "(min-width: 1024px) 560px, 90vw"} /> : null}
        <p className="mt-5 font-mono text-system uppercase text-foreground-muted">{meta}</p>
        <h3 className={cn("mt-2 font-medium text-balance text-foreground", lead ? "max-w-[34ch] text-heading-md" : size === "small" ? "text-body-lg" : "text-project-title")}>
          <Link href={href} className={titleLink}>{title}</Link>
        </h3>
      </article>
    </MotionReveal>
  );
}

/** A case study on the Work page: the screenshot, then meta, title, summary, and a read link. */
export function WorkRow({ href, image, meta, title, summary, eager = false }: {
  href: string;
  image: CardImage | null;
  meta: string;
  title: string;
  summary: string;
  eager?: boolean;
}) {
  return (
    <MotionReveal>
      <article className="group relative grid items-center gap-8 @4xl/canvas:grid-cols-[minmax(0,1.5fr)_minmax(0,1fr)] @4xl/canvas:gap-14">
        {image ? <Frame image={image} fit={false} eager={eager} sizes="(min-width: 1024px) 720px, 90vw" /> : null}
        <div>
          <p className="font-mono text-system uppercase text-foreground-muted">{meta}</p>
          <h2 className="mt-3 text-heading-md font-medium text-balance text-foreground">
            <Link href={href} className={titleLink}>{title}</Link>
          </h2>
          <p className="mt-4 max-w-[44ch] text-body text-pretty text-foreground-muted">{summary}</p>
          <p aria-hidden="true" className="mt-5 text-body-sm font-medium text-foreground">Read the case study →</p>
        </div>
      </article>
    </MotionReveal>
  );
}
