/**
 * Canonical source of truth for identity and positioning facts (spec §29).
 * Never re-type these values into components — import from here.
 *
 * Facts come from the spec and supplied resume; adopted narrative lives in plans/.
 * Anything unverified is a TODO for Louie, never a guess (spec §39.5).
 */

export const profile = {
  name: "Louie Sakoda",
  role: "Senior Product Designer",

  positioning: {
    /** Plans 029-035 adopted by Louie, 2026-09-19. */
    primary: "Complex workflows. Clear decisions.",
    /** Adopted supporting positioning, Plans 029-031. */
    supporting:
      "I shape AI products around the decisions people need to make, from learning tools at CK-12 to building Offboard end to end.",
    /** Positioning label, not a new employer title. */
    eyebrow: "SENIOR PRODUCT DESIGNER · AI & COMPLEX WORKFLOWS",
  },

  /**
   * Second hero line (spec §11 §1). Every fact is resume-stated: Lead UX at
   * CK-12, Flexi, the 20M+ platform figure, and Offboard's framing.
   * TODO(content): Louie may refine the wording.
   */
  heroSecondaryLine:
    "Formerly Lead UX at CK-12. Now building Offboard, an AI career-transition product." as string | null,

  /**
   * "Louie in brief" panel (spec §11 §5). The spec lists these as *potential*
   * points. Louie confirmed 14+ years of digital product design on September 19, 2026.
   */
  brief: [
    "14+ years designing digital products", // confirmed by Louie, September 19, 2026
    "Nine years of AI and education product experience at CK-12",
    "AI-first product design and full-stack execution",
    "Complex workflow and system design",
    "Product strategy through production",
  ],

  /**
   * Pull quotes from the strategy-session mockup.
   *
   * These are positioning statements in Louie's own voice, not factual claims
   * about outcomes, so they carry a different risk than an invented metric —
   * but the wording is still unconfirmed.
   * TODO(content): Louie to confirm or rewrite before launch.
   */
  quotes: {
    approach:
      "I partner with teams to turn complex workflows into intelligent systems people love to use.",
    philosophy:
      "I believe the best AI products are invisible. They just make complex work feel simple, empowering people to do more.",
  },

  links: {
    // Supplied by Louie, 2026-08-22.
    linkedin: "https://www.linkedin.com/in/louiesakoda" as string | null,
    email: "louie.sakoda@gmail.com" as string | null,
    /** Scheduling link — the availability indicator points here. */
    calendly: "https://calendly.com/louiesakoda/louie-portfolio" as string | null,
  },

  availability: {
    // Confirmed by Louie supplying his scheduling link (2026-08-22); wording
    // is the strategy mockup's two lines.
    status: "open" as "open" | "selective" | "unavailable" | null,
    label: "Available for new projects" as string | null,
    detail: "Open to full-time and part-time roles" as string | null,
  },

  // Verified: the resume header states San Francisco, CA.
  location: "San Francisco, CA" as string | null,

  /**
   * Square portrait under /public, supplied by Louie 2026-08-31 and cropped
   * square around the face from `louie-natural-headshot.jpeg` (640×640 — 2x
   * the largest place it renders, the 56px `lg` avatar). Drives both the left
   * rail's logo and AI Louie's chat avatar.
   */
  avatar: "/images/louie.jpg" as string | null,
} as const;

export type Profile = typeof profile;
