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
    /** Spec §1, §11 — primary positioning statement. */
    primary: "I design AI products and build them.",
    /**
     * The tail of `primary`, set in accent italic serif (per the strategy
     * mockup). Must remain a suffix of `primary` so the rendered heading text
     * stays spec-verbatim — asserted in `content/profile.test.ts`.
     */
    primaryEmphasis: "and build them.",
    /** Spec §1, §11 — supporting positioning. */
    supporting:
      "Product designer working across AI systems, complex workflows, design engineering, and product strategy.",
    /** Spec §11 — hero eyebrow. */
    eyebrow: "AI PRODUCT DESIGN · SYSTEMS · DESIGN ENGINEERING",
  },

  // TODO(content): Louie to approve a second hero line summarizing CK-12 and
  // Offboard (spec §11 §1 leaves this pending final wording).
  heroSecondaryLine: null as string | null,

  /**
   * "Louie in brief" panel (spec §11 §5). The spec lists these as *potential*
   * points — Louie must confirm wording and the "10+ years" figure before launch.
   */
  brief: [
    "10+ years designing digital products", // TODO(content): verify exact figure
    "Long-term AI and education product experience at CK-12",
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
    // TODO(content): Louie to supply real URLs — do not guess or invent handles.
    linkedin: null as string | null,
    email: null as string | null,
  },

  availability: {
    // TODO(content): Louie to confirm both lines before this ships (spec §10).
    // The mockup shows two: a status and a qualifier beneath it.
    status: null as "open" | "selective" | "unavailable" | null,
    label: null as string | null,
    detail: null as string | null,
  },

  // Deliberately absent: the mockup states "Based in San Francisco". That is a
  // verifiable biographical fact, and the same mockup misdescribes Offboard —
  // so it is not adopted on the mockup's authority alone.
  // TODO(content): Louie to confirm location before adding it.
  location: null as string | null,
} as const;

export type Profile = typeof profile;
