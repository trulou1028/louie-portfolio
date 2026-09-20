/**
 * Curated evidence index — the grounding authority for every factual claim
 * AI Louie makes (spec §16.2, §16.3).
 *
 * Rules this file lives by:
 *
 * - Curated from supplied work and attributed sources. Never scraped at runtime.
 *   Editorial review status is tracked in plans/portfolio-strategy/claim-ledger.md.
 * - **Nothing here may outrun the case studies.** Each `summary` and `detail`
 *   restates something the linked section actually argues. Where a section is
 *   still awaiting Louie's content, the entry says so in `detail` rather than
 *   inventing substance — AI Louie citing an outcome the page does not
 *   contain would be exactly the failure spec §16.2 exists to prevent.
 * - **Every route/anchor pair must resolve.** `scripts/validate-evidence.ts`
 *   runs on `prebuild` and fails the build otherwise.
 *
 */

import { profile } from "@/content/profile";

export type EvidenceItem = {
  id: string;
  project: "ck12-analytics" | "offboard" | "flexi" | "career" | "experiment";
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
{
  "id": "analytics-context",
  "project": "ck12-analytics",
  "title": "A prediction still requires a teacher decision",
  "summary": "Teachers need to anticipate support before work and investigate evidence afterward.",
  "detail": "Scores alone do not answer when or how to intervene. Foresights and Insights connect planning with investigation.",
  "route": "/work/ck12-analytics",
  "anchor": "context",
  "tags": [
    "teacher analytics",
    "problem"
  ],
  "skills": [
    "Product Strategy"
  ],
  "evidenceType": "strategy"
},
{
  "id": "analytics-system",
  "project": "ck12-analytics",
  "title": "Concept-level evidence makes the result more interpretable",
  "summary": "Assignment and content structure constrain what the chart can explain.",
  "detail": "An assignment spanning several concepts makes a single result harder to interpret. This describes a dependency, not a claim that Louie caused a platform-wide curriculum change.",
  "route": "/work/ck12-analytics",
  "anchor": "system",
  "tags": [
    "teacher analytics",
    "concept",
    "system"
  ],
  "skills": [
    "Systems Design"
  ],
  "evidenceType": "strategy"
},
{
  "id": "neuron-shift-premise",
  "project": "experiment",
  "title": "An incoming operator inherits reasoning",
  "summary": "Neuron Shift explores what an alarm history leaves out of a handoff.",
  "detail": "The incoming operator needs to understand what was decided, why, and when to revisit it. This is an unvalidated user hypothesis with simulated records, not findings from operator interviews.",
  "route": "/experiments/neuron-shift",
  "anchor": "premise",
  "tags": [
    "neuron",
    "shift",
    "handoff"
  ],
  "skills": [
    "Product Strategy"
  ],
  "evidenceType": "strategy"
},
{
  "id": "neuron-shift-technical",
  "project": "experiment",
  "title": "Browser-local decisions and a computed impact path",
  "summary": "Graph reachability supports the prototype impact view.",
  "detail": "The graph is simplified and does not model generators. Decisions persist in the browser; there is no backend, authentication, live telemetry, or live model. This demonstrates interaction consistency, not engineering-grade analysis.",
  "route": "/experiments/neuron-shift",
  "anchor": "technical",
  "tags": [
    "neuron",
    "shift",
    "graph",
    "reachability",
    "engineering"
  ],
  "skills": [
    "Design Engineering"
  ],
  "evidenceType": "technical"
},
{
  "id": "analytics-ownership",
  "project": "ck12-analytics",
  "title": "Experience ownership for Foresights and Insights",
  "summary": "Louie owned experience architecture, interaction design, prototypes, and visual language.",
  "detail": "Role: Lead Product Designer. Collaborated with educators, Product, Data Science, and Engineering. Published evaluations are CK-12 research, not evidence that Louie authored those studies. No specific management, mentoring, or conflict-resolution episode is established.",
  "route": "/work/ck12-analytics",
  "anchor": "role",
  "tags": [
    "teacher analytics",
    "foresights",
    "insights",
    "ownership",
    "role"
  ],
  "skills": [
    "Product Design",
    "Systems Design"
  ],
  "evidenceType": "product"
},
{
  "id": "analytics-prediction-diagnosis",
  "project": "ck12-analytics",
  "title": "Separate prediction from diagnosis",
  "summary": "Foresights supports planning before work; Insights supports investigation afterward.",
  "detail": "The experience separates anticipating support from interpreting the evidence after practice. A prediction is not an explanation of a student behavior.",
  "route": "/work/ck12-analytics",
  "anchor": "decision-prediction",
  "tags": [
    "teacher analytics",
    "foresights",
    "insights",
    "prediction",
    "diagnosis"
  ],
  "skills": [
    "Product Strategy",
    "Systems Design"
  ],
  "evidenceType": "strategy"
},
{
  "id": "analytics-uncertainty",
  "project": "ck12-analytics",
  "title": "Make uncertainty interpretable",
  "summary": "The Foresights range view makes uncertainty visible instead of implying a precise single value.",
  "detail": "The supplied demo-class interface uses ranges. Visibility alone did not solve interpretation: published evaluation found graph difficulty for half the teachers.",
  "route": "/work/ck12-analytics",
  "anchor": "decision-uncertainty",
  "tags": [
    "teacher analytics",
    "uncertainty",
    "range",
    "foresights"
  ],
  "skills": [
    "Interaction Design",
    "Data Visualization"
  ],
  "evidenceType": "product"
},
{
  "id": "analytics-investigation",
  "project": "ck12-analytics",
  "title": "Separate skill and engagement",
  "summary": "Insights supports class-pattern scanning and student-level investigation.",
  "detail": "Skill and engagement remain separate signals. The supplied scatterplot and detail view demonstrate the interaction, with demo records rather than measured classroom outcomes.",
  "route": "/work/ck12-analytics",
  "anchor": "decision-investigation",
  "tags": [
    "teacher analytics",
    "insights",
    "skill",
    "engagement"
  ],
  "skills": [
    "Interaction Design",
    "Data Visualization"
  ],
  "evidenceType": "product"
},
{
  "id": "analytics-evaluation",
  "project": "ck12-analytics",
  "title": "Perceived value exceeded comprehension",
  "summary": "Two published evaluations, ten teachers each using a demo class, found graph difficulty for half of participants.",
  "detail": "Foresights: 70% meaningful, 90% anticipated time savings, 75% mean comprehension. Insights: 90% meaningful, 100% anticipated time savings, 73% mean comprehension. Both: 50% difficulty with the key graph. Expected savings are not measured savings. No causal learning effect or broad adoption is established. Sources are linked in the case study; these are CK-12 evaluations, not claimed personal research ownership.",
  "route": "/work/ck12-analytics",
  "anchor": "evaluation",
  "tags": [
    "teacher analytics",
    "evaluation",
    "research",
    "results",
    "outcomes",
    "metrics"
  ],
  "skills": [
    "User Research",
    "Product Judgment"
  ],
  "evidenceType": "research"
},
{
  "id": "offboard-entry-point",
  "project": "offboard",
  "title": "From packet-first to plan-first",
  "summary": "Louie moved the product direction toward a first useful plan action, with Job Packets later in the journey.",
  "detail": "A packet assumes the person already has an opportunity to pursue. The supplied founder narrative identifies that as too much to ask at the start of a fresh transition. No measured activation or conversion lift is established for the correction.",
  "route": "/work/offboard",
  "anchor": "decision-entry-point",
  "tags": [
    "activation",
    "conversion",
    "plan",
    "packet",
    "strategy",
    "outcomes"
  ],
  "skills": [
    "Product Strategy",
    "Product Design"
  ],
  "evidenceType": "strategy"
},
{
  "id": "offboard-outcome-limits",
  "project": "offboard",
  "title": "A built product, without an attributed conversion lift",
  "summary": "Offboard moved into live beta workflows through Louie’s end-to-end design and implementation.",
  "detail": "The case study establishes built capabilities and product direction. It does not establish adoption counts, repeat usage, revenue, or a conversion improvement. Do not invent metrics or imply that packet-to-plan sequencing has a measured effect.",
  "route": "/work/offboard",
  "anchor": "outcomes",
  "tags": [
    "results",
    "outcomes",
    "metrics",
    "revenue",
    "conversion"
  ],
  "skills": [
    "Design Engineering"
  ],
  "evidenceType": "outcome"
},
{
  "id": "flexi-evaluation-limits",
  "project": "flexi",
  "title": "Conversation activity is not proof of learning",
  "summary": "CK-12 dialogue research examined 5,000 students and selected 15 cases for qualitative analysis.",
  "detail": "The published research distinguishes deeper learning-oriented exchanges from superficial use. It does not isolate the effect of Louie’s interface work or establish that his design caused academic gains. Sources are linked in the case study.",
  "route": "/work/flexi",
  "anchor": "outcomes",
  "tags": [
    "results",
    "outcomes",
    "metrics",
    "learning",
    "research"
  ],
  "skills": [
    "User Research",
    "AI Product Design"
  ],
  "evidenceType": "research"
},
{
  "id": "neuron-shift-prototype",
  "project": "experiment",
  "title": "Neuron Shift is an independent simulation",
  "summary": "A prototype exploring how an incoming operator inherits decision reasoning.",
  "detail": "Built for interview preparation, not for a customer. Not affiliated with or endorsed by Teserac. Fictional operational data, no operator interviews, no live model or telemetry, no backend or authentication. It is not a production operational deployment and has no established adoption or safety outcome.",
  "route": "/experiments/neuron-shift",
  "anchor": "limits",
  "tags": [
    "neuron",
    "shift",
    "teserac",
    "prototype",
    "simulation",
    "customer",
    "production",
    "results"
  ],
  "skills": [
    "Interaction Design",
    "Design Engineering"
  ],
  "evidenceType": "product"
},
{
  "id": "neuron-shift-decisions",
  "project": "experiment",
  "title": "Preserve the reasons behind an operator decision",
  "summary": "Attach recommendations to assets, scale friction to reversibility, and retain defer or override reasoning.",
  "detail": "The prototype preserves the asset situation, recommendation, human decision, reason, revisit condition, and author/time. These are fictional records. Local browser persistence and graph reachability support the simulated interaction, not an engineering-grade model.",
  "route": "/experiments/neuron-shift",
  "anchor": "decisions",
  "tags": [
    "neuron",
    "shift",
    "handoff",
    "reversibility",
    "judgment",
    "human-in-the-loop"
  ],
  "skills": [
    "Interaction Design",
    "Systems Design"
  ],
  "evidenceType": "technical"
},
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
    title: "A risk assessment before tailored generation",
    summary: "Job Packets can pause on a flagged opportunity before tailored materials are generated.",
    detail: "Role intelligence and risk assessment precede tailored generation. A flag asks the person whether to continue. It is an assessment, not proof of fraud or a guarantee that an opportunity is worthwhile.",
    route: "/work/offboard",
    anchor: "decision-risk",
    tags: ["ghost jobs", "risk", "guardrails", "ai ux", "workflow"],
    skills: ["AI Product Design", "Product Strategy", "Interaction Design"],
    evidenceType: "product",
  },
  {
    id: "offboard-hitl-actions",
    project: "offboard",
    title: "Editable drafts and meaningful control",
    summary: "Packet outputs remain editable and nothing sends itself to an employer.",
    detail: "Offboard automates preparation and can file results into the tracker automatically. People review drafts and decide what to use. A missing resume can yield a partial packet rather than invented experience. Do not claim every internal action requires preview and confirmation.",
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
      "A Vite + React + TypeScript client with Tailwind and shadcn/ui talks to Supabase: Postgres under per-user row-level security, with Deno edge functions calling model APIs, external research, and document generation before writing results back into the workspace. Operational surfaces include authentication, user data, AI credits, assistant experiences, employer workspaces, and paid plans. Designed and built by Louie, with AI development tools as part of the workflow. This establishes implementation ownership, not the size of the company or direct reports.",
    route: "/work/offboard",
    anchor: "architecture",
    tags: ["architecture", "full-stack", "design engineering", "technical"],
    skills: ["Design Engineering", "Full-stack Development", "Systems Design"],
    technologies: [
      "Vite",
      "React",
      "TypeScript",
      "Tailwind CSS",
      "shadcn/ui",
      "Supabase",
      "Postgres",
      "Row-level security",
      "Deno edge functions",
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
    title: "Visible choices after the first explanation",
    summary: "Follow-up actions offer simpler explanations, analogies, translation, detail, rephrasing, and challenges.",
    detail: "The supplied Flexi interface shows follow-up controls alongside the answer. They give students a concrete way to request a different kind of support. These controls do not prove an automatic adaptive tutoring loop or a causal learning improvement.",
    route: "/work/flexi",
    anchor: "decision-scaffolding",
    tags: ["conversational ux", "scaffolding", "learning", "ai ux"],
    skills: ["AI Product Design", "Conversational Design", "Interaction Design"],
    evidenceType: "product",
  },
  {
    id: "flexi-expose-uncertainty",
    project: "flexi",
    title: "Source labels and paths to a different explanation",
    summary: "The shown interface distinguishes AI-generated explanations from CK-12 Library content.",
    detail: "Source labels and follow-up actions help students orient and recover. The available artifacts do not substantiate a calibrated confidence indicator, automatic refusal threshold, or guaranteed error correction. Do not describe those as shipped features.",
    route: "/work/flexi",
    anchor: "decision-uncertainty",
    tags: ["uncertainty", "trust", "ai ux", "confidence", "failure modes"],
    skills: ["AI Product Design", "Interaction Design"],
    evidenceType: "product",
  },
  {
    id: "flexi-teacher-first-class",
    project: "flexi",
    title: "Teacher trust and the limits of the evidence",
    summary: "Teacher trust matters, but this case study does not demonstrate teacher monitoring controls.",
    detail: "Do not claim Flexi provides teacher pause controls, monitoring of private tutoring exchanges, or a teacher visibility dashboard on this evidence. Foresights and Insights are a separate teacher analytics project, not a Flexi conversation-monitoring surface.",
    route: "/work/flexi",
    anchor: "decision-teacher",
    tags: ["multi-sided", "teachers", "visibility", "education", "trust"],
    skills: ["Product Design", "Systems Design", "Product Strategy"],
    evidenceType: "product",
  },
  {
    id: "flexi-research",
    project: "flexi",
    title: "Published classroom research on Flexi",
    summary: "CK-12 published a six-week Spring 2025 study with ten teachers.",
    detail: "The published study used surveys, diaries, focus groups, and interviews. It described engagement and confidence alongside prompting, comprehension, tone, and over-reliance challenges. Louie cites this research as evaluation context, not as a claim that he authored the study or that it caused each interface decision. The article links the original study.",
    route: "/work/flexi",
    anchor: "research",
    tags: ["user research", "education", "students", "teachers", "over-reliance"],
    skills: ["User Research", "AI Product Design"],
    evidenceType: "research",
  },
  {
    id: "flexi-multi-sided-system",
    project: "flexi",
    title: "Connect the explanation with its next learning action",
    summary: "The interaction model connects content, source labels, and follow-up actions.",
    detail: "These affordances help a student request another explanation or a challenge. They do not prove the system can infer understanding from engagement or establish teacher monitoring capabilities.",
    route: "/work/flexi",
    anchor: "system",
    tags: ["systems design", "multi-sided", "education", "safety", "privacy"],
    skills: ["Systems Design", "AI Product Design", "Product Strategy"],
    evidenceType: "strategy",
  },
  // ------------------------------------------------------------------ Career
  {
    id: "career-user-research",
    project: "career",
    title: "Research and usability testing with students and educators",
    summary: "At CK-12, Louie led research and usability testing with students and educators, translating behavioral insights into product and architectural changes.",
    detail: "This is the research practice documented on the general resume. It does not establish authorship of the separately cited published Flexi studies, nor provide participant counts, recruitment responsibilities, or detailed methods for a particular study.",
    route: "/resume",
    tags: ["user research", "usability", "testing", "students", "educators"],
    skills: ["User Research", "Usability Testing"],
    evidenceType: "career",
  },
  {
    id: "career-contact-availability",
    project: "career",
    title: "Location, availability, and getting in touch",
    summary: `Based in ${profile.location}. ${profile.availability.label}. ${profile.availability.detail}.`,
    detail: "The portfolio provides email, LinkedIn, and a booking link in its navigation. It does not publish salary expectations, work authorization, relocation preferences, or a specific start date. Current availability should be confirmed directly with Louie; the portfolio status is not a calendar commitment.",
    route: "/about",
    tags: ["location", "based", "availability", "available", "contact", "hire", "salary", "start", "remote"],
    skills: ["Product Design"],
    evidenceType: "career",
  },
  {
    id: "career-experience-arc",
    project: "career",
    title: "14+ years across AI, education, and workflow products",
    summary:
      "Lead UX at CK-12 for nine years (2016\u20132025), now founding product designer and AI systems lead at Offboard \u2014 with earlier product leadership at OdysseyDAO and ecommerce design at Lowe's.",
    detail:
      "The arc: UX production design at Lowe's (2014\u20132016), product lead at OdysseyDAO (2021\u20132022) where an education platform onboarded 80,000+ learners, nine years as Lead UX Designer at CK-12 (2016\u20132025) on a K-12 platform serving 20M+ users worldwide, and since May 2025 Founding Product Designer & AI Systems Lead at Offboard. Education: BS in Entrepreneurship (University of Utah, 3.8 GPA, Academic All-American) and an MBA. Also a former professional football player in the CFL.",
    route: "/resume",
    tags: ["career", "experience", "ck-12", "offboard", "leadership"],
    skills: ["Product Design", "AI Product Design", "Product Strategy"],
    evidenceType: "career",
  },
  {
    id: "career-technical-fluency",
    project: "career",
    title: "Technical depth: a designer who ships full-stack",
    summary:
      "Builds production software \u2014 Vite, React, TypeScript, Tailwind, shadcn/ui, Supabase, Postgres/RLS, Deno edge functions, Stripe, and Resend \u2014 using AI development tools as a core part of the workflow.",
    detail:
      "At Offboard, Louie designed and built the full product: client application, authentication, data model with row-level security, server-side AI workflows, document generation, payments, and email. His stated fluency spans React, TypeScript, JavaScript, Vite, Tailwind CSS, shadcn/ui, Supabase, Postgres/RLS, Deno edge functions, API integrations, Stripe, and Resend. He works with Claude Code, Codex, Lovable, and other AI development tools daily \u2014 the source of his intuition for where automation should defer to humans and how model output becomes usable product.",
    route: "/resume",
    tags: ["technical", "full-stack", "design engineering", "react", "typescript", "supabase"],
    skills: ["Design Engineering", "Full-stack Development", "AI Product Design"],
    technologies: [
      "React",
      "TypeScript",
      "JavaScript",
      "Vite",
      "Tailwind CSS",
      "shadcn/ui",
      "Supabase",
      "Postgres/RLS",
      "Deno edge functions",
      "Stripe",
      "Resend",
    ],
    evidenceType: "technical",
  },
  {
    id: "career-ck12-scale",
    project: "career",
    title: "Nine years designing at 20M-user scale",
    summary:
      "Led UX for CK-12's multi-sided platform \u2014 students, teachers, administrators \u2014 serving 20M+ users worldwide, including Flexi, its LLM-powered tutor.",
    detail:
      "From 2016 to 2025 Louie led UX at CK-12, designing student, teacher, and administrator workflows across learning, practice, assignments, insights, content discovery, and support. He led design for Flexi, the LLM-powered student tutor, partnering with product, engineering, data science, curriculum, and research teams from early concept through shipped product.",
    route: "/resume",
    tags: ["scale", "education", "ck-12", "flexi", "multi-sided", "enterprise"],
    skills: ["Product Design", "AI Product Design", "Systems Design"],
    evidenceType: "career",
  },
  {
    id: "career-design-systems",
    project: "career",
    title: "Design systems and accessibility at platform scale",
    summary:
      "Developed CK-12's 2.0 design system across web and responsive surfaces, aligned to WCAG, alongside a parallel React component library built with engineering.",
    detail:
      "Louie developed CK-12's 2.0 design system across web and responsive surfaces, aligning interaction patterns with WCAG accessibility guidelines and partnering with engineering on a parallel React component library \u2014 design-system work done with production code as a first-class concern, not an afterthought.",
    route: "/resume",
    tags: ["design systems", "accessibility", "wcag", "component library", "react"],
    skills: ["Design Systems", "Accessibility", "Design Engineering"],
    evidenceType: "career",
  },
];
