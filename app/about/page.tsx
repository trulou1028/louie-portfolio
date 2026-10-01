import type { Metadata } from "next";
import Image from "next/image";
import { AboutActions } from "@/components/portfolio/about-actions";

import { Canvas } from "@/components/app-shell/contextual-rail";
import { InlineLink } from "@/components/system/inline-link";
import { SectionLabel } from "@/components/system/section-label";
import { profile } from "@/content/profile";

export const metadata: Metadata = {
  title: "About",
  description: profile.about.intro[0],
  alternates: { canonical: "/about" },
};

/**
 * About (spec §11 §5, Plan 046).
 *
 * Louie's own wording (supplied 2026-09-30), stored in `profile.about`:
 * who he is, how he works, where he has worked, and what he wants to work
 * on next. The photo is his supplied working-session image.
 */
export default function AboutPage() {
  const { about, heroPhoto } = profile;

  return (
    <Canvas>
      <div className="max-w-[760px]">
        <SectionLabel>About</SectionLabel>

        <h1 className="mt-5 max-w-[18ch] font-display text-display-lg text-balance text-foreground">
          {about.headline}
        </h1>

        <div className="mt-6 flex flex-col gap-4 text-body-lg text-foreground-muted">
          {about.intro.map((paragraph) => <p key={paragraph}>{paragraph}</p>)}
        </div>

        {heroPhoto ? (
          <Image
            src={heroPhoto.src}
            alt={heroPhoto.alt}
            width={heroPhoto.width}
            height={heroPhoto.height}
            sizes="(min-width: 1024px) 760px, 100vw"
            className="mt-10 h-auto w-full rounded-lg border border-border-subtle"
            loading="eager"
          />
        ) : null}

        <p className="mt-12 border-t border-foreground pt-5 font-display text-heading-lg text-balance text-foreground">
          {about.belief}
        </p>

        <section aria-labelledby="about-how" className="mt-12">
          <h2 id="about-how" className="text-body-sm font-semibold text-foreground-muted">How I work</h2>
          <ul className="mt-4 flex flex-col">
            {about.principles.map((principle) => (
              <li key={principle.title} className="grid gap-2 border-b border-border-subtle py-5 sm:grid-cols-[14rem_minmax(0,1fr)] sm:gap-6">
                <h3 className="text-body font-semibold text-foreground">{principle.title}</h3>
                <div className="flex flex-col gap-3 text-body text-foreground-muted">
                  {principle.body.map((paragraph) => <p key={paragraph}>{paragraph}</p>)}
                  <p><InlineLink href={principle.href} className="whitespace-nowrap">{principle.project}<span aria-hidden="true"> →</span></InlineLink></p>
                </div>
              </li>
            ))}
          </ul>
        </section>

        <section aria-labelledby="about-path" className="mt-12">
          <h2 id="about-path" className="text-body-sm font-semibold text-foreground-muted">Where I&rsquo;ve worked</h2>
          <ol className="mt-4 flex flex-col">
            {about.path.map((step) => (
              <li key={step.company} className="grid gap-2 border-b border-border-subtle py-5 sm:grid-cols-[14rem_minmax(0,1fr)] sm:gap-6">
                <div>
                  <p className="text-body font-semibold text-foreground">{step.company}</p>
                  <p className="text-body-sm text-foreground-muted">{step.years}</p>
                </div>
                <div className="flex flex-col gap-3 text-body text-foreground-muted">
                  {step.body.map((paragraph) => <p key={paragraph}>{paragraph}</p>)}
                </div>
              </li>
            ))}
          </ol>
          <div className="mt-5 flex flex-col gap-3 text-body text-foreground-muted">
            {about.before.map((paragraph) => <p key={paragraph}>{paragraph}</p>)}
          </div>
        </section>

        <section aria-labelledby="about-next" className="mt-14 border-t border-foreground pt-6">
          <h2 id="about-next" className="max-w-[24ch] font-display text-heading-lg text-balance text-foreground">{about.next.title}</h2>
          <div className="mt-4 flex flex-col gap-3 text-body-lg text-foreground-muted">
            {about.next.body.map((paragraph) => <p key={paragraph}>{paragraph}</p>)}
          </div>
        </section>

        <AboutActions />
      </div>
    </Canvas>
  );
}
