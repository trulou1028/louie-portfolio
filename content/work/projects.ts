import type { Route } from "@/lib/routes";

/**
 * Case-study metadata — the single source of truth for work cards on the
 * homepage, the /work index, and case-study headers (spec §29).
 *
 * Titles and tags are spec §11 §3 verbatim. Summaries and imagery are not in
 * the spec, so they are TODOs rather than guesses (spec §39.5).
 */
export type WorkProject = {
  slug: "offboard" | "flexi";
  /** Short name for nav and labels. */
  name: string;
  /** The full editorial title (spec §11 §3). */
  title: string;
  tags: readonly string[];
  href: Route;
  /** One or two lines of context beneath the title. */
  summary: string | null;
  /** Path under /public once real product imagery exists. */
  image: string | null;
};

export const workProjects: readonly WorkProject[] = [
  {
    slug: "offboard",
    name: "Offboard",
    title: "Building an AI-native operating system for the job search",
    tags: [
      "Product strategy",
      "AI UX",
      "Agentic systems",
      "Design engineering",
      "Full-stack development",
    ],
    href: "/work/offboard",
    // Derived from the case study, which is itself grounded in spec §13 —
    // NOT from the strategy mockup, which misdescribes Offboard as an IT
    // offboarding tool. TODO(content): Louie may refine the wording.
    summary:
      "A workspace where every opportunity keeps its own context, so a job search stops being rebuilt by hand at every step.",
    // TODO(asset): add real product imagery to public/work/offboard/.
    image: null,
  },
  {
    slug: "flexi",
    name: "CK-12 Flexi",
    title:
      "Designing an AI tutor that helps students learn instead of simply giving them answers",
    tags: [
      "AI interaction design",
      "Research",
      "Conversational UX",
      "Education",
      "Design systems",
    ],
    href: "/work/flexi",
    // Derived from the case study (spec §14).
    // TODO(content): Louie may refine the wording.
    summary:
      "An AI tutor built to keep the learning intact — holding a student, a teacher, and an institution's needs at once.",
    // TODO(asset): add real product imagery to public/work/flexi/.
    image: null,
  },
] as const;
