import type { Metadata } from "next";
import Link from "next/link";

import { Canvas } from "@/components/app-shell/contextual-rail";
import { Action } from "@/components/system/action";
import { InlineLink } from "@/components/system/inline-link";
import { SectionLabel } from "@/components/system/section-label";
import { Surface } from "@/components/system/surface";
import { profile } from "@/content/profile";

export const metadata: Metadata = {
  title: "About",
  description: profile.positioning.supporting,
};

/**
 * About (spec §11 §5, §29).
 *
 * Built entirely from `content/profile.ts`. Nothing here asserts a fact Louie
 * has not supplied — the biography proper is his to write.
 */
export default function AboutPage() {
  const { links, quotes } = profile;

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
          {/* TODO(asset): portrait or illustration (spec §11 §5). */}
          {/* TODO(content): a fuller biography, and location if Louie wants it
              published — the strategy mockup's "Based in San Francisco" is
              unverified. */}
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

        {links.email || links.linkedin ? (
          <Surface variant="muted" className="mt-12 flex flex-col gap-4 p-6">
            <p className="text-body text-foreground">Get in touch</p>
            <div className="flex flex-wrap gap-3">
              {links.email ? (
                <Action
                  variant="secondary"
                  size="sm"
                  render={<a href={`mailto:${links.email}`} />}
                >
                  Email
                </Action>
              ) : null}
              {links.linkedin ? (
                <Action
                  variant="secondary"
                  size="sm"
                  render={
                    <a
                      href={links.linkedin}
                      target="_blank"
                      rel="noreferrer noopener"
                    />
                  }
                >
                  LinkedIn
                </Action>
              ) : null}
            </div>
          </Surface>
        ) : null}

        <div className="mt-12 flex flex-wrap gap-3">
          <Action render={<Link href="/work" />}>View selected work</Action>
          <Action variant="secondary" render={<Link href="/resume" />}>
            Resume
          </Action>
        </div>
      </div>
    </Canvas>
  );
}
