import type { Metadata } from "next";
import Link from "next/link";
import { Download } from "lucide-react";

import { Canvas } from "@/components/app-shell/contextual-rail";
import { PendingContent } from "@/components/portfolio/pending-content";
import { Action } from "@/components/system/action";
import { SectionLabel } from "@/components/system/section-label";
import { profile } from "@/content/profile";
import { resume } from "@/content/resume";

export const metadata: Metadata = {
  title: "Resume",
  description: `${profile.name} — ${profile.role}. Experience across AI product design, complex workflows, and design engineering.`,
};

/**
 * Resume, rendered as HTML in addition to the PDF (spec §28).
 *
 * The full structure is here and will render the moment `content/resume.ts`
 * is populated. Until then the page states the gap rather than showing
 * invented roles — a fabricated employment history is the single worst thing
 * this site could publish.
 *
 * Plan 008 treats this as a launch blocker.
 */
export default function ResumePage() {
  const hasContent = resume.roles.length > 0;

  return (
    <Canvas>
      <div className="max-w-[760px]">
        <SectionLabel>Resume</SectionLabel>

        <h1 className="mt-5 font-serif text-display-lg text-balance text-foreground">
          {profile.name}
        </h1>
        <p className="mt-3 font-mono text-label uppercase text-foreground-muted">
          {profile.role}
        </p>

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
                    <p className="mt-3 max-w-[68ch] text-body text-foreground-muted">
                      {role.summary}
                    </p>
                    {role.highlights.length > 0 ? (
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
                    ) : null}
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
                      </p>
                    </li>
                  ))}
                </ul>
              </section>
            ) : null}

            {resume.skills.length > 0 ? (
              <section className="mt-12">
                <SectionLabel>Skills</SectionLabel>
                <ul className="mt-5 flex flex-wrap gap-x-2 gap-y-1.5">
                  {resume.skills.map((skill) => (
                    <li
                      key={skill}
                      className="rounded-xs border border-border-subtle bg-surface-muted px-2 py-0.5 text-body-sm text-foreground-muted"
                    >
                      {skill}
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
