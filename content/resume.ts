/**
 * Canonical resume data (spec §29). The /resume route renders HTML from this
 * structure in addition to offering a PDF (spec §28).
 *
 * INTENTIONALLY EMPTY: the spec contains no resume facts, and inventing
 * employers, titles, dates, or outcomes is forbidden (spec §16.1, §39.5).
 *
 * TODO(content): Louie to populate. Plan 008 treats an empty resume as a hard
 * launch blocker — the /resume page cannot ship as placeholders.
 */

export type ResumeRole = {
  company: string;
  title: string;
  /** ISO-ish display string, e.g. "2021 — Present". */
  period: string;
  summary: string;
  highlights: string[];
};

export type ResumeEducation = {
  institution: string;
  credential: string;
  period: string;
};

export type Resume = {
  roles: ResumeRole[];
  education: ResumeEducation[];
  skills: string[];
  /** Path under /public once supplied, e.g. "/resume/louie-sakoda.pdf". */
  pdfPath: string | null;
};

export const resume: Resume = {
  roles: [],
  education: [],
  skills: [],
  pdfPath: null, // TODO(asset): add PDF to public/resume/ and reference it here
};
