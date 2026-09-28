import Image from "next/image";
import Link from "next/link";
import { ArrowRight } from "lucide-react";

import { MotionReveal } from "@/components/portfolio/motion-reveal";
import { cn } from "@/lib/utils";
import type { GalleryItem } from "@/content/work/projects";

/**
 * A project on its own color field (Plan 037, direction A "The work,
 * framed"). The shell stays neutral; each plate carries the project's brand
 * color, a large real screenshot, and a strip of supporting images.
 *
 * One link per plate: the title. Its `::after` covers the plate, so the
 * whole field is the touch target while assistive tech hears one link.
 *
 * Gallery `need` entries are open asset requests. They render as labeled
 * slots in development only; production builds skip them, so the public
 * site never shows an unfinished frame.
 */

type PlateTone = "offboard" | "foresights" | "flexi" | "neuron";

/* Static class strings so Tailwind can see every token. */
const TONES: Record<PlateTone, { field: string; ink: string; muted: string; rule: string }> = {
  offboard: { field: "bg-plate-offboard", ink: "text-plate-offboard-ink", muted: "text-plate-offboard-muted", rule: "border-plate-offboard-muted/40" },
  foresights: { field: "bg-plate-foresights", ink: "text-plate-foresights-ink", muted: "text-plate-foresights-muted", rule: "border-plate-foresights-ink/30" },
  flexi: { field: "bg-plate-flexi", ink: "text-plate-flexi-ink", muted: "text-plate-flexi-muted", rule: "border-plate-flexi-ink/25" },
  neuron: { field: "bg-plate-neuron", ink: "text-plate-neuron-ink", muted: "text-plate-neuron-muted", rule: "border-plate-neuron-muted/30" },
};

const SHOW_PENDING = process.env.NODE_ENV === "development";

type WorkPlateProps = {
  tone: PlateTone;
  href: string;
  brand: React.ReactNode;
  title: string;
  summary: string | null;
  facts?: readonly { label: string; value: string }[];
  image: { src: string; alt: string; width: number; height: number } | null;
  gallery?: readonly GalleryItem[];
  cta?: string;
  /** Put the image first on wide screens, alternating down the page. */
  flip?: boolean;
  eager?: boolean;
  /** Rendered after the plate, outside its link (e.g. an external demo link). */
  after?: React.ReactNode;
};

function WorkPlate({ tone, href, brand, title, summary, facts, image, gallery = [], cta = "Read the case study", flip = false, eager = false, after }: WorkPlateProps) {
  const t = TONES[tone];
  const shown = gallery.filter((item) => "src" in item || SHOW_PENDING);

  return (
    <MotionReveal>
      <article className={cn("group @container relative overflow-hidden rounded-panel p-6 sm:p-10 xl:p-12", t.field, t.ink)}>
        <div className={cn("grid items-center gap-8 @4xl:gap-12", image && (flip ? "@4xl:grid-cols-[1.7fr_1fr]" : "@4xl:grid-cols-[1fr_1.7fr]"))}>
          <div className={cn("flex min-w-0 flex-col", flip && "@4xl:order-2")}>
            {brand}
            <h3 className="mt-5 font-display text-heading-xl text-balance">
              <Link href={href} className="focus-ring rounded-xs after:absolute after:inset-0 after:content-['']">{title}</Link>
            </h3>
            {summary ? <p className={cn("mt-4 max-w-[46ch] text-body-lg text-pretty", t.muted)}>{summary}</p> : null}
            {facts?.length ? (
              <dl className={cn("mt-6 flex flex-wrap gap-x-8 gap-y-3 border-t pt-4 text-body-sm", t.rule)}>
                {facts.map((fact) => (
                  <div key={fact.label} className="flex flex-col">
                    <dt className={t.muted}>{fact.label}</dt>
                    <dd className="font-semibold">{fact.value}</dd>
                  </div>
                ))}
              </dl>
            ) : null}
            <span aria-hidden="true" className="mt-7 inline-flex items-center gap-2 text-body font-semibold underline decoration-1 underline-offset-4 group-hover:decoration-2">
              {cta}
              <ArrowRight className="size-4 transition-transform duration-(--duration-fast) group-hover:translate-x-0.5" />
            </span>
          </div>

          {image ? (
            <div className="min-w-0">
              <Image
                src={image.src}
                alt={image.alt}
                width={image.width}
                height={image.height}
                loading={eager ? "eager" : "lazy"}
                sizes="(min-width: 1280px) 760px, (min-width: 1024px) 60vw, 90vw"
                className="h-auto w-full rounded-md shadow-shot ring-1 ring-foreground/10 transition-transform duration-(--duration-deliberate) group-hover:-translate-y-1 motion-reduce:transition-none"
              />
              {shown.length ? (
                <ul className="mt-3 grid grid-cols-3 gap-2 sm:gap-3" aria-label="More from this project">
                  {shown.map((item) =>
                    "src" in item ? (
                      <li key={item.src} className="flex aspect-[4/3] items-center overflow-hidden rounded-sm bg-surface p-1 ring-1 ring-foreground/10">
                        <Image src={item.src} alt={item.alt} width={item.width} height={item.height} sizes="240px" className="h-auto max-h-full w-full object-contain" />
                      </li>
                    ) : (
                      <li
                        key={item.need}
                        data-pending-asset
                        className={cn("flex aspect-[4/3] items-center justify-center rounded-sm border border-dashed p-2 text-center text-system", t.rule, t.muted)}
                      >
                        <span><span className="block font-mono uppercase">TODO(asset)</span><span className="max-sm:hidden">{item.need}</span></span>
                      </li>
                    ),
                  )}
                </ul>
              ) : null}
            </div>
          ) : null}
        </div>
      </article>
      {after}
    </MotionReveal>
  );
}

export { WorkPlate };
export type { PlateTone };
