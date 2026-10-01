/**
 * Canonical source of truth for identity and positioning facts (spec §29).
 * Never re-type these values into components — import from here.
 *
 * Facts come from the spec and supplied resume; adopted narrative lives in plans/.
 * Anything unverified is a TODO for Louie, never a guess (spec §39.5).
 */

export const profile = {
  name: "Louie Sakoda",
  role: "Founding Product Designer & AI Systems Lead",

  positioning: {
    /** Plans 029-035 adopted by Louie, 2026-09-19. */
    primary: "Complex workflows. Clear decisions.",
    /** Adopted supporting positioning, Plans 029-031. */
    supporting:
      "I shape AI products around the decisions people need to make, from learning tools at CK-12 to building Offboard end to end.",
    /** Louie's current title at Offboard, used site-wide (owner decision, 2026-09-30). */
    eyebrow: "FOUNDING PRODUCT DESIGNER & AI SYSTEMS LEAD",
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
   * The About page (Plan 046). Louie's own wording, supplied 2026-09-30,
   * adapted to the page. Facts not in the resume (the layoff origin of
   * Offboard, the product areas he built, CK-12's diagnostic and content
   * tools) are Louie-supplied in that text. Football honors confirmed by
   * Louie from his University of Utah player page, 2026-09-30: 2008
   * unanimous Consensus All-American (the only one in Utah football
   * history) and 2008 first-team Academic All-America.
   */
  about: {
    headline: "I design AI products, and I build them.",
    intro: [
      "I’ve spent more than a decade designing products that help people make complicated decisions. A teacher trying to understand what a student needs next. A student stuck on a problem. A job seeker trying to figure out which opportunity is worth pursuing.",
      "The common thread is turning a lot of information, uncertainty, and complexity into something that feels clear.",
      "Today I lead product and technology at Offboard, where I design, prototype, and build AI systems for people navigating career transitions. I’m still a designer first. I just work much closer to the code now.",
    ],
    belief: "AI should do more of the work without taking the decisions away from people.",
    principles: [
      {
        title: "Start with the decision.",
        body: ["Before screens, flows, or AI, I try to understand the decision someone is actually trying to make. At CK-12, that meant helping teachers understand what their students knew and what to do next."],
        project: "CK-12 Foresights",
        href: "/work/ck12-analytics",
      },
      {
        title: "Decide what the AI should do.",
        body: [
          "The goal isn’t to automate everything. The system should gather context, do the repetitive work, surface what matters, and help someone reach a better decision faster.",
          "The person should still know what is happening and stay in control of what happens next. That principle shapes much of what we’re building at Offboard.",
        ],
        project: "Offboard",
        href: "/work/offboard",
      },
      {
        title: "Build the real thing.",
        body: [
          "My design process increasingly happens in code. I use Figma when it helps me think, and I prototype and build with React, TypeScript, AI coding tools, APIs, and real product data.",
          "That lets me take an idea further than a static prototype and learn whether it actually works, not just whether it looks like it should.",
        ],
        project: "Neuron Shift",
        href: "/experiments/neuron-shift",
      },
    ],
    path: [
      {
        company: "Offboard",
        years: "2025 to now",
        body: [
          "I lead product and technology for Offboard, an AI career-transition platform we started building after going through the layoff process ourselves.",
          "I’ve designed and built much of the product end to end, including Lumo, our AI career agent, Career Context, job analysis, application tools, interview preparation, and the systems that connect them.",
        ],
      },
      {
        company: "Odyssey",
        years: "2021 to 2022",
        body: ["Product Lead for an education platform that onboarded more than 80,000 learners. I worked across product strategy, UX, and the systems that turned a complicated learning experience into something people could navigate."],
      },
      {
        company: "CK-12 Foundation",
        years: "2016 to 2025",
        body: [
          "Nine years designing educational products used by millions of students and teachers, including Flexi, CK-12’s AI tutor, predictive learning analytics, diagnostic experiences, content creation tools, and the CK-12 2.0 design system.",
          "It’s where I became obsessed with the problem I’m still working on: how do you make an incredibly complicated system feel simple to the person using it?",
        ],
      },
      {
        company: "Lowe’s",
        years: "2014 to 2016",
        body: ["I started my product design career at Lowe’s, on a large-scale redesign of its digital experience, leading a small design team through the production work behind it."],
      },
    ],
    before: [
      "Before any of that, I played football at the University of Utah, where I became the only unanimous Consensus All-American in the program’s history and an Academic All-American. Then I played professionally in the CFL.",
      "Football and product design have more in common than I expected. You prepare obsessively, make decisions with incomplete information, adjust constantly, and eventually have to ship.",
    ],
    next: {
      title: "I’m interested in what happens when designers can build.",
      body: [
        "AI has shortened the distance between an idea and a working product. A designer can understand the user, shape the interaction, define how an intelligent system should behave, and increasingly build the thing themselves.",
        "That’s the part of product design I’m most interested in right now. Not AI added to software, but products that are fundamentally different because AI exists.",
      ],
    },
  },

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
    label: "Open to new opportunities" as string | null,
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

  /**
   * Photo supplied by Louie on 2026-09-27 (1536×1024). Not rendered since
   * Plan 041 moved the homepage hero to the Neuron Shift loop; kept for the
   * About page or a future use. Alt text describes only what the image shows.
   */
  heroPhoto: {
    src: "/images/louie-working-session.webp",
    alt: "Louie Sakoda talking through Offboard workflow notes on a whiteboard, with the San Francisco skyline behind him.",
    width: 1536,
    height: 1024,
  } as { src: string; alt: string; width: number; height: number } | null,
} as const;

export type Profile = typeof profile;
