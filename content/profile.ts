/**
 * Canonical source of truth for identity and positioning facts (spec §29).
 * Never re-type these values into components — import from here.
 *
 * Only facts stated in LOUIE_PORTFOLIO_V2_IMPLEMENTATION_SPEC.md appear below.
 * Anything unverified is a TODO for Louie, never a guess (spec §39.5).
 */

export const profile = {
  name: "Louie Sakoda",
  role: "AI Product Designer & Builder",

  positioning: {
    /**
     * Owner decision (2026-08-23) superseding spec §1, §11's original
     * wording — see README "Deviations" ledger, Plan 011.
     * Owner decision (2026-08-31): "plan" added to name the strategy work
     * that "design & ship" left implicit.
     */
    primary: "I plan, design & ship AI products.",
    /** Spec §1, §11 — supporting positioning. */
    supporting:
      "Product designer working across AI systems, complex workflows, design engineering, and product strategy.",
    /** Spec §11 — hero eyebrow. */
    eyebrow: "AI PRODUCT DESIGN · SYSTEMS · DESIGN ENGINEERING",
  },

  /**
   * Second hero line (spec §11 §1). Every fact is resume-stated: Lead UX at
   * CK-12, Flexi, the 20M+ platform figure, and Offboard's framing.
   * TODO(content): Louie may refine the wording.
   */
  heroSecondaryLine:
    "Formerly Lead UX at CK-12, designing Flexi — an AI tutor on a platform serving 20M+ learners. Now building Offboard, an AI career-transition platform, end to end." as string | null,

  /**
   * "Louie in brief" panel (spec §11 §5). The spec lists these as *potential*
   * points — Louie must confirm wording and the "10+ years" figure before launch.
   */
  brief: [
    "10+ years designing digital products", // verified: resume summary
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
    detail: "Open to full-time roles" as string | null,
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
