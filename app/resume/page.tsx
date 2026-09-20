import type { Metadata } from "next";
import Link from "next/link";
import { Download } from "lucide-react";

import { Canvas } from "@/components/app-shell/contextual-rail";
import { PendingContent } from "@/components/portfolio/pending-content";
import { Action } from "@/components/system/action";
import { InlineLink } from "@/components/system/inline-link";
import { SectionLabel } from "@/components/system/section-label";
import { Tag } from "@/components/system/tag";
import { TrackView } from "@/components/system/track-view";
import { profile } from "@/content/profile";
import { resume } from "@/content/resume";

export const metadata: Metadata = {
  title: "Resume",
  description: `${profile.name} — ${resume.headline}. 14+ years designing digital products, including learning, workflow, and decision-support experiences.`,
  alternates: { canonical: "/resume" },
};

/**
 * Resume, rendered as HTML in addition to the PDF (spec §28).
 *
 * Content comes from `content/resume.ts`, adapted from Louie’s supplied resumes
 * for a general portfolio audience. The downloadable PDF uses the same data. The phone number on the PDF is deliberately not rendered
 * here — a public, crawlable page is not the place for it.
 */
export default function ResumePage() {
  const hasContent = resume.roles.length > 0;

  return (
    <Canvas>
      <TrackView event="resume_opened" properties={{ source: "page" }} />
      <div className="max-w-[760px]">
        <SectionLabel>Resume</SectionLabel>

        <h1 className="mt-5 font-serif text-display-lg text-balance text-foreground">
          {profile.name}
        </h1>
        <p className="mt-3 font-mono text-label uppercase text-foreground-muted">
          {resume.headline}
        </p>

        <div className="mt-4 flex flex-wrap items-center gap-x-4 gap-y-1 text-body-sm text-foreground-muted">
          {profile.location ? <span>{profile.location}</span> : null}
          {profile.links.email ? (
            <InlineLink href={`mailto:${profile.links.email}`}>
              {profile.links.email}
            </InlineLink>
          ) : null}
          {profile.links.linkedin ? (
            <InlineLink href={profile.links.linkedin}>LinkedIn</InlineLink>
          ) : null}
        </div>

        {resume.pdfPath ? (
          <div className="mt-7">
            <Action
              variant="secondary"
              size="sm"
              render={<a href={resume.pdfPath} download />}
            >
              <Download aria-hidden="true" className="size-4" />
              Download PDF
            </Action>
          </div>
        ) : null}

        {hasContent ? (
          <>
            <section className="mt-12">
              <SectionLabel>Summary</SectionLabel>
              <p className="mt-5 max-w-[68ch] text-body text-foreground-muted">
                {resume.summary}
              </p>
            </section>

            <section className="mt-12">
              <SectionLabel>Experience</SectionLabel>
              <ol className="mt-6 flex flex-col gap-10">
                {resume.roles.map((role) => (
                  <li key={`${role.company}-${role.title}`}>
                    <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
                      <h2 className="text-heading-md text-foreground">
                        {role.title}
                      </h2>
                      <span className="font-mono text-system uppercase text-foreground-muted">
                        {role.period}
                      </span>
                    </div>
                    <p className="mt-1 text-body text-accent">{role.company}</p>
                    <ul className="mt-4 flex flex-col gap-2">
                      {role.highlights.map((highlight) => (
                        <li
                          key={highlight}
                          className="flex gap-3 text-body-sm text-foreground-muted"
                        >
                          <span
                            aria-hidden="true"
                            className="mt-2 size-1 shrink-0 rounded-full bg-accent"
                          />
                          {highlight}
                        </li>
                      ))}
                    </ul>
                  </li>
                ))}
              </ol>
            </section>

            {resume.education.length > 0 ? (
              <section className="mt-12">
                <SectionLabel>Education</SectionLabel>
                <ul className="mt-6 flex flex-col gap-4">
                  {resume.education.map((entry) => (
                    <li key={entry.institution}>
                      <p className="text-body font-medium text-foreground">
                        {entry.credential}
                      </p>
                      <p className="text-body-sm text-foreground-muted">
                        {entry.institution} · {entry.period}
                        {entry.note ? ` · ${entry.note}` : ""}
                      </p>
                    </li>
                  ))}
                </ul>
              </section>
            ) : null}

            {resume.skillGroups.length > 0 ? (
              <section className="mt-12">
                <SectionLabel>Skills</SectionLabel>
                <div className="mt-6 flex flex-col gap-5">
                  {resume.skillGroups.map((group) => (
                    <div key={group.label}>
                      <h3 className="text-body-sm font-medium text-foreground">
                        {group.label}
                      </h3>
                      <ul className="mt-2 flex flex-wrap gap-x-2 gap-y-1.5">
                        {group.skills.map((skill) => (
                          <li key={skill}>
                            <Tag>{skill}</Tag>
                          </li>
                        ))}
                      </ul>
                    </div>
                  ))}
                </div>
              </section>
            ) : null}

            {resume.additional.length > 0 ? (
              <section className="mt-12">
                <SectionLabel>Additional</SectionLabel>
                <ul className="mt-5 flex flex-col gap-2">
                  {resume.additional.map((item) => (
                    <li
                      key={item}
                      className="max-w-[68ch] text-body text-foreground-muted"
                    >
                      {item}
                    </li>
                  ))}
                </ul>
              </section>
            ) : null}
          </>
        ) : (
          <>
            <p className="mt-8 max-w-[62ch] text-body-lg text-foreground-muted">
              The full resume isn&rsquo;t published here yet. The case studies
              are the more useful read in the meantime — they show the work
              rather than list it.
            </p>

            <PendingContent
              summary="Resume content. Nothing is shown rather than approximated: an invented employment history is the one error this site must never make."
              items={[
                "Roles: company, title, dates, and what Louie was responsible for",
                "Education",
                "Skills, as Louie would list them",
                "A PDF at public/resume/ for the download action",
              ]}
            />

            <div className="mt-10 flex flex-wrap gap-3">
              <Action render={<Link href="/work" />}>View selected work</Action>
              <Action variant="secondary" render={<Link href="/about" />}>
                About Louie
              </Action>
            </div>
          </>
        )}
      </div>
    </Canvas>
  );
}
