/**
 * Curated evidence index — the grounding authority for every factual claim
 * AI Louie makes (spec §16.2, §16.3).
 *
 * Rules this file lives by:
 *
 * - **Human-written and human-reviewed.** Never scraped from the live site at
 *   runtime (spec §16.3).
 * - **Nothing here may outrun the case studies.** Each `summary` and `detail`
 *   restates something the linked section actually argues. Where a section is
 *   still awaiting Louie's content, the entry says so in `detail` rather than
 *   inventing substance — AI Louie citing an outcome the page does not
 *   contain would be exactly the failure spec §16.2 exists to prevent.
 * - **Every route/anchor pair must resolve.** `scripts/validate-evidence.ts`
 *   runs on `prebuild` and fails the build otherwise.
 *
 * Deliberately absent: outcome-type entries (no verified metrics exist yet),
 * career entries (/about and /resume have no content until Plan 008), and
 * experiment entries (the experiments are explorations, not shipped work).
 */

export type EvidenceItem = {
  id: string;
  project: "offboard" | "flexi" | "career" | "experiment";
  title: string;
  summary: string;
  detail: string;
  route: string;
  anchor?: string;
  tags: string[];
  skills: string[];
  technologies?: string[];
  evidenceType:
    | "product"
    | "research"
    | "technical"
    | "strategy"
    | "outcome"
    | "career";
};

export const evidence: EvidenceItem[] = [
  // ---------------------------------------------------------------- Offboard
  {
    id: "offboard-fragmentation-problem",
    project: "offboard",
    title: "Why job seekers become the integration layer",
    summary:
      "A job search spans a dozen disconnected tools, so the applicant rebuilds the same context by hand at every step.",
    detail:
      "Jobs, company research, contacts, resumes, application materials, interview preparation, tasks, and AI conversations each live in a separate tool, and none of them know about the others. The cost is not any single weak tool but the manual re-establishment of context on every move between them — invisible, repetitive work paid for in the applicant's time.",
    route: "/work/offboard",
    anchor: "context",
    tags: ["problem framing", "workflow", "job search", "fragmentation"],
    skills: ["Product Strategy", "Systems Design"],
    evidenceType: "strategy",
  },
  {
    id: "offboard-opportunity-workspace",
    project: "offboard",
    title: "Every opportunity is a persistent workspace",
    summary:
      "The central product decision: an opportunity is the unit the whole system is organised around, and context accumulates inside it.",
    detail:
      "Rather than treating a job as a row in a list, each opportunity holds the role, company, people, research, resume, application materials, interview preparation, tasks, conversation, and history. Because the workspace already carries that context, later steps draw on it instead of asking the user to supply it again.",
    route: "/work/offboard",
    anchor: "system",
    tags: ["product model", "data model", "context", "workspace"],
    skills: ["Product Design", "Systems Design", "Product Strategy"],
    evidenceType: "product",
  },
  {
    id: "offboard-lumo-context-layer",
    project: "offboard",
    title: "LUMO as a context-aware layer, not a separate chatbot",
    summary:
      "The AI operates across the opportunity workspace rather than sitting beside it as an isolated chat surface.",
    detail:
      "Because the workspace already holds the role, company, and history, LUMO can act with knowledge of the specific opportunity instead of requiring the user to paste context into a conversation. The AI is a layer over the product's data model rather than an adjacent tool.",
    route: "/work/offboard",
    anchor: "system",
    tags: ["ai ux", "context", "assistant", "architecture"],
    skills: ["AI Product Design", "Systems Design"],
    evidenceType: "product",
  },
  {
    id: "offboard-risk-gate",
    project: "offboard",
    title: "A risk gate that protects the user's effort",
    summary:
      "The system evaluates whether an opportunity is worth pursuing before it spends the user's attention generating tailored material.",
    detail:
      "A submitted role is enriched with role intelligence and then risk-assessed. If the opportunity looks like a ghost listing or otherwise low value, the product warns the user or pauses the workflow before any tailored material is produced. It is a gate rather than a banner — a product willing to talk a user out of work, which a tool measured on output volume would not do.",
    route: "/work/offboard",
    anchor: "decision-risk",
    tags: ["ghost jobs", "risk", "guardrails", "ai ux", "workflow"],
    skills: ["AI Product Design", "Product Strategy", "Interaction Design"],
    evidenceType: "product",
  },
  {
    id: "offboard-hitl-actions",
    project: "offboard",
    title: "Human-in-the-loop AI actions",
    summary:
      "Consequential AI actions use visible approval checkpoints.",
    detail:
      "The assistant proposes an action, a specific tool is selected, a preview is generated, and the user confirms before anything runs. The result then appears as a discrete, attributable change rather than a silent mutation — the user always sees which tool is about to act, on what, and what it will produce. TODO(content): Louie to add concrete shipped examples of this flow.",
    route: "/work/offboard",
    anchor: "decision-control",
    tags: ["agents", "human-in-the-loop", "ai ux", "tool calling", "confirmation"],
    skills: ["AI Product Design", "Interaction Design", "Systems Design"],
    evidenceType: "product",
  },
  {
    id: "offboard-context-compounds",
    project: "offboard",
    title: "Downstream artifacts inherit upstream work",
    summary:
      "Research feeds the resume, the resume and research feed outreach, and all of it feeds interview preparation — nothing restarts from empty.",
    detail:
      "Most tools begin each task from a blank box and charge the setup cost again. Offboard is built so work accumulates: the role, company, and user context feed a research layer, which then informs the resume, the outreach, and the interview preparation in parallel, and those produce the application materials and decisions.",
    route: "/work/offboard",
    anchor: "decision-context",
    tags: ["context", "workflow", "compounding", "product model"],
    skills: ["Systems Design", "Product Design"],
    evidenceType: "product",
  },
  {
    id: "offboard-architecture",
    project: "offboard",
    title: "Offboard's system architecture",
    summary:
      "How data and actions move through the product Louie both designed and built.",
    detail:
      "A client application talks to a backend owning authentication, an opportunity data model with per-user row-level security, and server-side functions that call model APIs, external research, and document generation before writing results back into the workspace. TODO(content): Louie to confirm this description is historically accurate before publishing — the elements are candidates drawn from current work, not verified facts.",
    route: "/work/offboard",
    anchor: "architecture",
    tags: ["architecture", "full-stack", "design engineering", "technical"],
    skills: ["Design Engineering", "Full-stack Development", "Systems Design"],
    technologies: [
      "React",
      "TypeScript",
      "Tailwind CSS",
      "shadcn/ui",
      "Postgres",
      "Row-level security",
      "Edge functions",
    ],
    evidenceType: "technical",
  },

  // ------------------------------------------------------------------- Flexi
  {
    id: "flexi-classroom-scale",
    project: "flexi",
    title: "An AI tutor operating at classroom scale",
    summary:
      "Flexi is CK-12's AI tutor, running inside a learning platform used in real classrooms with three different kinds of user.",
    detail:
      "Because it sits inside a platform schools actually use, Flexi's users are not one group with one goal: students want to get unstuck, teachers depend on the learning still happening, and institutions need the whole thing safe, private, and observable. That made the design work less about making the AI capable and more about deciding what it should refuse to do.",
    route: "/work/flexi",
    anchor: "context",
    tags: ["education", "scale", "ai tutor", "multi-sided", "constraints"],
    skills: ["AI Product Design", "Product Strategy"],
    evidenceType: "strategy",
  },
  {
    id: "flexi-central-tension",
    project: "flexi",
    title: "When giving the user what they ask for is the wrong answer",
    summary:
      "The design question behind Flexi: what an AI should do when satisfying a request undermines the user's actual goal.",
    detail:
      "A student asking for an answer wants the answer; supplying it satisfies the request and defeats the exercise, while refusing outright drives them to a tool that complies. The product has to hold three needs at once — a student who wants immediate help, a teacher who needs the learning intact, and an institution that needs trust, safety, privacy, and visibility.",
    route: "/work/flexi",
    anchor: "tension",
    tags: ["ai ux", "product judgment", "education", "multi-sided", "trust"],
    skills: ["AI Product Design", "Product Strategy"],
    evidenceType: "strategy",
  },
  {
    id: "flexi-scaffolding-loop",
    project: "flexi",
    title: "The answer is not the end of the interaction",
    summary:
      "The tutoring loop continues past the response — check understanding, adapt support, stretch thinking, then continue or hand off.",
    detail:
      "Answering is where a search engine stops; a tutor has to find out whether anything was understood. Flexi treats a response as the middle of an interaction, adapting the level of support based on what the student says next rather than closing the exchange.",
    route: "/work/flexi",
    anchor: "decision-scaffolding",
    tags: ["conversational ux", "scaffolding", "learning", "ai ux"],
    skills: ["AI Product Design", "Conversational Design", "Interaction Design"],
    evidenceType: "product",
  },
  {
    id: "flexi-expose-uncertainty",
    project: "flexi",
    title: "Exposing model uncertainty rather than hiding it",
    summary:
      "A tutor that is confidently wrong is worse than one that is visibly unsure, especially for a student with no way to tell the difference.",
    detail:
      "Students cannot calibrate trust against a system that sounds identical whether it is right or guessing — and in a subject they are still learning, they have no independent check. The design surfaces the model's limits instead of smoothing them over, and treats recovery as a designed path rather than an error state. TODO(content): Louie to add the specific interface treatment.",
    route: "/work/flexi",
    anchor: "decision-uncertainty",
    tags: ["uncertainty", "trust", "ai ux", "confidence", "failure modes"],
    skills: ["AI Product Design", "Interaction Design"],
    evidenceType: "product",
  },
  {
    id: "flexi-teacher-first-class",
    project: "flexi",
    title: "The teacher as a first-class user",
    summary:
      "Treating teacher visibility as a designed surface turned a private chatbot into a multi-sided learning system.",
    detail:
      "Once the teacher is a user rather than an administrator, what happens in a tutoring session informs what the teacher does next with that student. That decision changed the product's shape more than any other. TODO(content): Louie to add what teachers can actually see, and where the line was drawn against surveillance.",
    route: "/work/flexi",
    anchor: "decision-teacher",
    tags: ["multi-sided", "teachers", "visibility", "education", "trust"],
    skills: ["Product Design", "Systems Design", "Product Strategy"],
    evidenceType: "product",
  },
  {
    id: "flexi-research",
    project: "flexi",
    title: "Student and teacher research behind Flexi",
    summary:
      "Research is the backbone of this project — what students do when a tutor will not simply comply, and what teachers need in order to trust it.",
    detail:
      "The areas studied included reading level and age-appropriate tone, accessibility, academic integrity and over-reliance, points of confusion, teacher visibility, and the tutor's failure modes. TODO(content): findings themselves are pending. Spec §14 forbids inventing research statistics, so this entry names the areas studied and stops there.",
    route: "/work/flexi",
    anchor: "research",
    tags: ["user research", "education", "students", "teachers", "over-reliance"],
    skills: ["User Research", "AI Product Design"],
    evidenceType: "research",
  },
  {
    id: "flexi-multi-sided-system",
    project: "flexi",
    title: "Holding student, teacher, and institutional needs together",
    summary:
      "The scaffolding rules, the uncertainty behaviour, and teacher visibility are the three mechanisms that keep the three needs from trading off.",
    detail:
      "Balancing immediate help, learning integrity, and institutional trust is a system problem rather than a prompt problem. A student request enters the tutoring loop, bounded by scaffolding rules and by the uncertainty behaviour that governs what the tutor will claim, and what happens in the session surfaces to the teacher inside institutional safety and privacy constraints.",
    route: "/work/flexi",
    anchor: "system",
    tags: ["systems design", "multi-sided", "education", "safety", "privacy"],
    skills: ["Systems Design", "AI Product Design", "Product Strategy"],
    evidenceType: "strategy",
  },
];
