/**
 * Canonical resume data (spec §29). The /resume route renders HTML from this
 * structure in addition to offering the PDF (spec §28).
 *
 * Source of truth: Louie_Sakoda_Product_Designer_Resume.pdf, supplied by
 * Louie on 2026-08-22 and mirrored at public/resume/louie-sakoda-resume.pdf.
 * Every line below restates that document — nothing is added to it.
 *
 * Deliberately omitted from the HTML version: Louie's phone number. It is in
 * the downloadable PDF (his standard resume), but printing it on a public,
 * crawlable page invites spam calls. His decision to reverse.
 */

export type ResumeRole = {
  company: string;
  title: string;
  /** Display string as it appears on the resume, e.g. "May 2016 — May 2025". */
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
  headline: "Product Designer, AI Systems & Internal Tools",

  summary:
    "AI product designer with 10+ years designing and shipping AI-powered learning, workflow, and decision-support products at scale. Former Lead UX Designer at CK-12, where I led design for Flexi, an LLM-powered student tutor, and built complex student, teacher, and administrator experiences for a K-12 platform serving 20M+ users worldwide. Currently building Offboard, an AI career-transition platform that combines talent and career-decision workflows, human-in-the-loop AI patterns, structured research, document generation, and full-stack product execution across React, TypeScript, Supabase, Postgres, and Deno edge functions.",

  roles: [
    {
      company: "Offboard",
      title: "Founding Product Designer & AI Systems Lead",
      period: "May 2025 — Present",
      highlights: [
        "Designed and built Offboard's AI-powered career-transition platform, creating talent and career-decision workflows that help job seekers evaluate roles, understand companies, tailor resumes, prepare for interviews, and make higher-confidence career decisions.",
        "Built full-stack product experiences across Vite, React, TypeScript, Tailwind, shadcn/ui, Supabase, Postgres/RLS, and Deno edge functions, moving quickly from ambiguous product concepts to live beta workflows.",
        "Designed human-in-the-loop AI patterns including visible agent progress, editable outputs, approval checkpoints, confirmation-first actions, and trust-building safeguards for emotionally high-stakes user decisions.",
        "Created multi-step AI workflows that transform job descriptions, resumes, user goals, and external research into structured analysis, recommendations, and generated application materials.",
        "Designed operational product surfaces across authentication, user data, AI credits, document generation, assistant experiences, employer workspaces, and paid plans.",
        "Used Claude Code, Codex, Lovable, and other AI development tools as part of a solo builder workflow, developing strong intuition for how AI-first software should feel, where automation should defer to humans, and how to turn model output into usable product experiences.",
      ],
    },
    {
      company: "CK-12 Foundation",
      title: "Lead UX Designer",
      period: "May 2016 — May 2025",
      highlights: [
        "Led UX for Flexi, CK-12's LLM-powered student tutor, designing conversational and guided learning flows that helped students reason through math and science problems rather than simply receive answers.",
        "Designed complex student, teacher, and administrator workflows across learning, practice, assignments, insights, content discovery, and support for a K-12 platform serving 20M+ users worldwide.",
        "Partnered closely with product, engineering, data science, curriculum, and research teams to shape AI-driven learning experiences from early concept through shipped product.",
        "Conducted user research and usability testing with students and teachers, translating behavioral insights into product improvements that reduced cognitive load and made complex workflows easier to navigate.",
        "Developed CK-12's 2.0 design system across web and responsive surfaces, aligning interaction patterns with WCAG accessibility guidelines and partnering with engineering on a parallel React component library.",
        "Shaped information architecture and navigation across multi-sided product surfaces so students, teachers, and administrators could move between content, practice, assignments, insights, and support without friction.",
      ],
    },
    {
      company: "OdysseyDAO",
      title: "Product Lead",
      period: "Nov 2021 — Nov 2022",
      highlights: [
        "Designed and developed an education platform that onboarded 80,000+ learners into crypto and web3 concepts through simple, approachable learning experiences.",
        "Created an automated email course completed by 12,000+ learners, combining curriculum design, UX writing, product strategy, and engagement analytics.",
        "Managed a distributed team of 38 contributors to translate 400,000+ words into 10 languages, building lightweight systems to maintain quality at scale.",
      ],
    },
    {
      company: "Lowe's Companies, Inc.",
      title: "UX Production Designer",
      period: "Jun 2014 — May 2016",
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
      period: "Aug 2005 — May 2011",
      note: "3.8 GPA, Academic All-American",
    },
    {
      institution: "St. Leo University",
      credential: "MBA, Sports Business",
      period: "Jun 2011 — Jun 2012",
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
        "Decision-support UX",
        "Model-output review flows",
        "Prompt/workflow design",
      ],
    },
    {
      label: "Product & Interaction",
      skills: [
        "Internal tools",
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
      label: "Design Systems",
      skills: [
        "Design systems",
        "Component patterns",
        "Accessibility",
        "WCAG",
        "Responsive web",
        "Figma",
        "Design critique",
        "Product quality review",
      ],
    },
    {
      label: "Technical Fluency",
      skills: [
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
