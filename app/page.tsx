import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { ArrowRight } from "lucide-react";

import { LoopVideo } from "@/components/portfolio/loop-video";
import { HomePreview, type PreviewItem } from "@/components/stacked/home-preview";
import { AskLouieButton } from "@/components/stacked/ask-louie-button";
import { Portrait } from "@/components/stacked/portrait";
import { SiteLinks } from "@/components/stacked/site-links";
import { StackedShell } from "@/components/stacked/stacked-shell";
import { InlineLink } from "@/components/system/inline-link";
import { profile } from "@/content/profile";
import { projectYears, workProjects } from "@/content/work/projects";
import { experiments } from "@/content/experiments/experiments";

export const metadata: Metadata = { alternates: { canonical: "/" } };

/**
 * Homepage, stacked redesign (Louie, 2026-10-29, after David Aerne's
 * meodai.color.pizza, "direction A").
 *
 * The left column stays in view: the line portrait, the name, the role, a
 * preview slot, and the links. The right column stacks short paragraphs,
 * each with its project's name in a narrow column beside it. Hovering a row
 * shows its screenshot in the preview slot; touch screens and narrow
 * windows show the screenshot under the paragraph instead.
 *
 * The paragraphs are `blurb` in the project data. They restate each case
 * study's brief and add no claim of their own.
 */

type Row = {
  id: string;
  name: string;
  href: string;
  when: string;
  blurb: string;
  image: { src: string; alt: string; width: number; height: number };
  loop?: { src: string; poster: string };
};

const work: Row[] = workProjects.map((project) => {
  const loop = project.video && project.image ? { src: project.video, poster: project.image } : undefined;
  const image = loop || !project.tileImage
    ? { src: project.image ?? "", alt: project.imageAlt, width: project.imageWidth, height: project.imageHeight }
    : project.tileImage;
  return {
    id: project.slug,
    name: project.shortName ?? project.name,
    href: project.href,
    when: projectYears(project) ?? "",
    blurb: project.blurb,
    image,
    loop,
  };
});

const own: Row[] = experiments.flatMap((experiment) => {
  if (experiment.status !== "prototype" || !experiment.blurb || !experiment.image) return [];
  const image = experiment.loop
    ? { src: experiment.loop.poster, alt: experiment.image.alt, width: 1600, height: 1000 }
    : experiment.image;
  return [{
    id: experiment.slug,
    name: experiment.name,
    href: `/experiments/${experiment.slug}`,
    when: experiment.meta ?? "",
    blurb: experiment.blurb,
    image,
    loop: experiment.loop,
  }];
});

const previews: PreviewItem[] = [...work, ...own].map(({ id, image, loop }) => ({ id, image, loop }));

/** Louie's own intro (About page), with Offboard linked to its case study. */
const offboardAt = profile.about.intro[2].indexOf("Offboard");
const beforeOffboard = profile.about.intro[2].slice(0, offboardAt);
const afterOffboard = profile.about.intro[2].slice(offboardAt + "Offboard".length);

function ProjectRow({ row }: { row: Row }) {
  // The whole row opens the case study: the name's link stretches over it
  // (`before:inset-0`). The name carries the site's link underline and an
  // arrow, so the row reads as a link on touch screens too, where there is
  // no hover (Louie, 2026-10-30: the case study links were hard to find).
  return (
    <article data-preview-id={row.id} className="group stacked-row relative border-b border-border-default py-8">
      <div>
        <p className="text-body-lg text-foreground-muted">{row.blurb}</p>
        {/* The loop's pause button sits above the stretched link. */}
        <div className="stacked-inline-media shot-mat mt-5 [&_button]:z-10">
          <div className="shot overflow-hidden">
            {row.loop ? (
              <LoopVideo src={row.loop.src} poster={row.loop.poster} label={row.image.alt} width={row.image.width} height={row.image.height} />
            ) : (
              <Image src={row.image.src} alt={row.image.alt} width={row.image.width} height={row.image.height} sizes="(min-width: 821px) 1px, 100vw" className="h-auto w-full" />
            )}
          </div>
        </div>
      </div>
      <div className="stacked-label">
        <h3 className="font-display text-list-title text-balance text-foreground">
          <Link
            href={row.href}
            className="focus-ring rounded-xs underline decoration-accent-line decoration-1 underline-offset-[0.2em] transition-colors duration-(--duration-fast) group-hover:text-accent-hover before:absolute before:inset-0"
          >
            {row.name}
            <ArrowRight aria-hidden="true" className="ml-1 inline-block size-[0.9em] align-[-0.1em] text-accent-line transition-transform duration-(--duration-fast) ease-out group-hover:translate-x-1" />
          </Link>
        </h3>
        <p className="mt-1 text-meta text-foreground-quiet tabular-nums">{row.when}</p>
      </div>
    </article>
  );
}

// Section titles are the meta label (`SectionLabel`), smaller than the
// project names, so a title does not read as one more project.
const sectionTitle = "border-b border-border-default pb-3 text-meta text-foreground-quiet";

export default function Home() {
  return (
    <StackedShell
      aside={<>
        <Portrait size="lg" />
        <h1 className="mt-4 font-display text-name text-foreground">{profile.name}</h1>
        <p className="mt-5 text-meta text-foreground-quiet">
          {profile.role}
          <br />
          <InlineLink href="/work/offboard">Offboard</InlineLink>
        </p>
        <AskLouieButton className="mt-6" />
        <HomePreview items={previews} />
        <SiteLinks className="max-[820px]:mt-6" />
      </>}
    >
      <div className="stacked-row stacked-intro">
        <div className="flex flex-col gap-[1.1em] text-body-lg text-foreground-muted">
          <p>{profile.about.intro[0]}</p>
          <p>{beforeOffboard}<InlineLink href="/work/offboard">Offboard</InlineLink>{afterOffboard}</p>
          <p>Before any of that, I played football at the University of Utah, and then professionally in the CFL. <InlineLink href="/about">More about me</InlineLink></p>
        </div>
      </div>

      <section id="work" data-testid="featured-work" aria-labelledby="work-label" className="mt-24 scroll-mt-8">
        <h2 id="work-label" className={sectionTitle}>Work I’m proud of</h2>
        {work.map((row) => <ProjectRow key={row.id} row={row} />)}
      </section>

      <section data-testid="independent-work" aria-labelledby="own-label" className="mt-24">
        <h2 id="own-label" className={sectionTitle}>Built on my own</h2>
        {own.map((row) => <ProjectRow key={row.id} row={row} />)}
      </section>

      <section aria-labelledby="path-label" className="mt-24">
        <h2 id="path-label" className={sectionTitle}>Where I’ve worked</h2>
        <ul aria-label="Experience">
          {profile.about.path.map((place) => (
            <li key={place.company} className="stacked-row items-baseline border-b border-border-default py-3 text-body-lg">
              <span className="text-foreground">{place.company}</span>
              <span className="text-meta text-foreground-quiet tabular-nums max-[820px]:order-none">{place.years}</span>
            </li>
          ))}
        </ul>
      </section>
    </StackedShell>
  );
}
