import type { Metadata } from "next";
import { AboutActions } from "@/components/portfolio/about-actions";

import { Canvas } from "@/components/app-shell/contextual-rail";
import { InlineLink } from "@/components/system/inline-link";
import { SectionLabel } from "@/components/system/section-label";
import { profile } from "@/content/profile";

export const metadata: Metadata = {
  title: "About",
  description: profile.positioning.supporting,
  alternates: { canonical: "/about" },
};

/**
 * About (spec §11 §5, §29).
 *
 * Built entirely from `content/profile.ts`. Nothing here asserts a fact Louie
 * has not supplied — the biography proper is his to write.
 */
export default function AboutPage() {
  const { quotes } = profile;

  return (
    <Canvas>
      <div className="max-w-[760px]">
        <SectionLabel>About</SectionLabel>

        <h1 className="mt-5 max-w-[18ch] font-serif text-display-lg text-balance text-foreground">
          {profile.positioning.primary}
        </h1>

        <p className="mt-6 max-w-[62ch] text-body-lg text-foreground-muted">
          {profile.positioning.supporting}
        </p>

        <blockquote className="mt-10 max-w-[56ch] border-l-2 border-accent pl-5 font-serif text-heading-md text-balance text-foreground">
          {quotes.philosophy}
        </blockquote>

        <section className="mt-12">
          <SectionLabel>In brief</SectionLabel>
          <ul className="mt-5 flex flex-col gap-3">
            {profile.brief.map((point) => (
              <li
                key={point}
                className="flex gap-3 text-body text-foreground-muted"
              >
                <span
                  aria-hidden="true"
                  className="mt-2.5 size-1 shrink-0 rounded-full bg-accent"
                />
                {point}
              </li>
            ))}
          </ul>
          {profile.location ? (
            <p className="mt-4 text-body-sm text-foreground-muted">
              Based in {profile.location}
            </p>
          ) : null}
          {/* TODO(asset): portrait or illustration (spec §11 §5). */}
          {/* TODO(content): a fuller biography, in Louie's own words. */}
        </section>

        <section className="mt-12">
          <SectionLabel>The work</SectionLabel>
          <p className="mt-5 max-w-[62ch] text-body text-foreground-muted">
            The clearest picture of how I work is the work itself:{" "}
            <InlineLink href="/work/offboard">Offboard</InlineLink>, an
            AI-native workspace for the job search, and{" "}
            <InlineLink href="/work/flexi">CK-12 Flexi</InlineLink>, an AI tutor
            built to keep the learning intact.
          </p>
        </section>

        <AboutActions />
      </div>
    </Canvas>
  );
}
