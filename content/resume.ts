/**
 * Canonical resume data (spec §29). The /resume route renders HTML from this
 * structure in addition to offering the PDF (spec §28).
 *
 * Sources: Louie's August 22 general resume, the September 19 Clever-specific
 * resume, and his explicit correction to 14+ years. Adapted for a general
 * portfolio audience; no Clever-specific job requirements are claimed.
 * The downloadable general PDF is generated from this same structure.
 *
 * The phone number in the source document is deliberately omitted from
 * both the HTML and the general public PDF.
 */

export type ResumeRole = {
  company: string;
  title: string;
  /** Display string as it appears on the resume, e.g. "May 2016 - May 2025". */
  period: string;
  highlights: string[];
};

export type ResumeEducation = {
  institution: string;
  credential: string;
  period: string;
  note?: string;
};

export type SkillGroup = {
  label: string;
  skills: string[];
};

export type Resume = {
  /** The resume's own headline, distinct from the site-wide role line. */
  headline: string;
  summary: string;
  roles: ResumeRole[];
  education: ResumeEducation[];
  skillGroups: SkillGroup[];
  additional: string[];
  /** Path under /public. */
  pdfPath: string | null;
};

export const resume: Resume = {
  headline: "Senior Product Designer | Complex Systems & AI",

  summary:
    "Senior Product Designer with 14+ years designing digital products across education, AI, and complex workflows. Former Lead UX Designer at CK-12, where I designed student, teacher, and administrator experiences for a learning platform serving 20M+ users, led design-system work, and shaped information architecture across learning workflows. My practice combines user research, accessibility, interaction design, and technical prototyping. At Offboard, I lead product design and AI systems, working from early concepts through production.",

  roles: [
    {
      company: "Offboard",
      title: "Founding Product Designer & AI Systems Lead",
      period: "May 2025 - Present",
      highlights: [
        "Led product design from concept through production for an AI-powered career-transition platform spanning job search, research, decision support, document generation, and employer-sponsored experiences.",
        "Designed information architectures that turn fragmented user data and complex tasks into guided workflows with visible system status, checkpoints, and user control.",
        "Built prototypes and production experiences using React, TypeScript, Tailwind, Supabase, Claude Code, and Codex, working across design and implementation.",
        "Designed human-in-the-loop AI patterns including visible progress, editable outputs, confirmations, error recovery, and safeguards for high-stakes decisions.",
        "Designed and shipped Lumo's real-time AI voice experience with tool calling, preserving context across multi-step workflows.",
        "Worked across product, engineering, QA, data, content, marketing, and business stakeholders in a six-person startup to prioritize roadmap decisions and ship product iterations.",
      ],
    },
    {
      company: "CK-12 Foundation",
      title: "Lead UX Designer",
      period: "May 2016 - May 2025",
      highlights: [
        "Designed workflows for a K-12 learning platform serving 20M+ users worldwide, supporting student, teacher, and administrator needs across content, practice, assignments, reporting, and platform management.",
        "Led the development and evolution of CK-12's 2.0 design system, establishing reusable interaction patterns across responsive web experiences and partnering with engineering on a parallel React component library.",
        "Shaped information architecture and navigation across student, teacher, and administrator experiences, simplifying workflows and improving consistency across the platform.",
        "Led research and usability testing with students and educators, translating behavioral insights into product and architectural changes.",
        "Led UX for Flexi, CK-12's LLM-powered student tutor, designing conversational and guided experiences for multi-step math and science problems.",
        "Partnered with product, engineering, data science, curriculum, and research teams to frame problems, explore solutions, define success criteria, and ship learning experiences.",
        "Designed responsive experiences aligned with WCAG accessibility standards and worked with engineering to resolve accessibility issues across shared components and interaction patterns.",
      ],
    },
    {
      company: "Odyssey",
      title: "Product Lead",
      period: "Nov 2021 - Nov 2022",
      highlights: [
        "Designed and developed an education platform that onboarded 80,000+ learners into crypto and web3 concepts through simple, approachable learning experiences.",
        "Created an automated email course completed by 12,000+ learners, combining curriculum design, UX writing, product strategy, and engagement analytics.",
        "Managed a distributed team of 38 contributors to translate 400,000+ words into 10 languages, building lightweight systems to maintain quality at scale.",
      ],
    },
    {
      company: "Lowe's Companies, Inc.",
      title: "UX Production Designer",
      period: "Jun 2014 - May 2016",
      highlights: [
        "Produced and iterated on creative assets for home, landing, and brand pages in a fast-paced, experiment-driven ecommerce environment.",
        "Managed a team of 4 designers on a Global Redesign effort to modernize the ecommerce experience and align it with updated brand and UX guidelines.",
      ],
    },
  ],

  education: [
    {
      institution: "University of Utah",
      credential: "BS, Entrepreneurship",
      period: "Aug 2005 - May 2011",
      note: "3.8 GPA, Academic All-American",
    },
    {
      institution: "St. Leo University",
      credential: "MBA, Sports Business",
      period: "Jun 2011 - Jun 2012",
    },
  ],

  skillGroups: [
    {
      label: "AI Product Design",
      skills: [
        "AI-first product design",
        "LLM UX",
        "Human-in-the-loop workflows",
        "Agentic workflows",
        "AI automations",
        "Voice and tool calling",
        "Decision-support UX",
        "Model-output review flows",
        "Prompt/workflow design",
      ],
    },
    {
      label: "Product & Systems Design",
      skills: [
        "Internal tools",
        "Journey mapping",
        "Complex workflow design",
        "Talent workflows",
        "Knowledge systems",
        "Information architecture",
        "High-fidelity prototyping",
        "Interaction design",
        "UX writing",
        "Usability testing",
        "User research",
      ],
    },
    {
      label: "Design Systems & Accessibility",
      skills: [
        "Design systems",
        "Component patterns",
        "Accessibility",
        "WCAG",
        "Responsive web",
        "Figma",
        "Design critique",
        "Product quality review",
        "Design tokens",
      ],
    },
    {
      label: "Technical Fluency",
      skills: [
        "Claude Code",
        "Codex",
        "Cursor",
        "React",
        "TypeScript",
        "JavaScript",
        "Vite",
        "Tailwind CSS",
        "shadcn/ui",
        "Supabase",
        "Postgres/RLS",
        "Deno edge functions",
        "API integrations",
        "Stripe",
        "Resend",
      ],
    },
  ],

  additional: [
    "Former professional football player in the CFL and Academic All-American at the University of Utah.",
  ],

  pdfPath: "/resume/louie-sakoda-resume.pdf",
};
