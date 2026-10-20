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
  "detail": "Role: Lead UX Designer. Collaborated with educators, Product, Data Science, and Engineering. Published evaluations are CK-12 research, not evidence that Louie authored those studies. No specific management, mentoring, or conflict-resolution episode is established.",
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
  "detail": "Foresights: 90% found the menu easy to interpret, 70% meaningful, 90% anticipated time savings, 70% would recommend, 75% mean comprehension. Insights: 90% found the menu easy to interpret, 90% meaningful, 100% anticipated time savings, 90% would recommend, 73% mean comprehension. Both: 50% difficulty with the key graph. Expected savings are not measured savings. No causal learning effect or broad adoption is established. Sources are linked in the case study; these are CK-12 evaluations, not claimed personal research ownership.",
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
  "detail": "A packet assumes the person already has an opportunity to pursue. Louie's own account identifies that as too much to ask at the start of a fresh transition. No measured activation or conversion lift is established for the correction.",
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
  "title": "Live product with early usage signal",
  "summary": "Offboard is live; Louie designed and built it end to end. Most people who signed up in August 2026 finished onboarding and ran a ghost check, but few built a packet in their first days. Most members who built a full packet built only one.",
  "detail": "Other results (September 2026): one LinkedIn post drove a burst of public ghost checks within a day; job search found the right role in the top ten for all 20 test queries, up from one; the LUMO assistant passed 29 of 29 test cases, 22% faster, at about 80% lower model cost per test run; the backend (188 functions, 175 tables) moved to a new Supabase project with about six minutes of downtime and no data lost; the product runs more than 200 server functions and about 4,500 automated tests. The numbers are early and small. They do not establish revenue, long-term retention, or a measured effect of the plan-first change. Do not state user or usage numbers: no signup, member, account, subscriber, revenue, or usage counts or percentages.",
  "route": "/work/offboard",
  "anchor": "outcomes",
  "tags": [
    "results",
    "outcomes",
    "metrics",
    "revenue",
    "conversion",
    "activation",
    "onboarding",
    "usage",
    "shipped"
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
  "summary": "CK-12 dialogue research examined 5,000 students and selected 15 cases for qualitative analysis. In Flexi inside Adaptive Practice, direct answer-seeking questions fell from 72% of first questions to 52% by the eighth, and learning-oriented questions rose from 11% to 26%.",
  "detail": "The published research distinguishes deeper learning-oriented exchanges from superficial use: students who grew asked follow-ups and checked their understanding. The analysis is descriptive and CK-12-run. It does not isolate the effect of Louie’s interface work or establish that his design caused academic gains. Sources are linked in the case study.",
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
  "detail": "Independent concept prototype, not built for a customer. Not affiliated with or endorsed by any company. Fictional operational data, no operator interviews, no live model or telemetry, no backend or authentication. It is not a production operational deployment and has no established adoption or safety outcome.",
  "route": "/experiments/neuron-shift",
  "anchor": "limits",
  "tags": [
    "neuron",
    "shift",
    "independent",
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
  "id": "neuron-shift-chat",
  "project": "experiment",
  "title": "Chat is the right fallback and the wrong default",
  "summary": "In Neuron Shift, AI attaches to objects, answers as interface state, and records what the operator accepts or overrides.",
  "detail": "A chat box asks for the question when the operator has the least time to form one, and its answer does not attach to an asset or persist. Selecting an asset is the query, answers are drawn on the graph, and accepted or overridden recommendations join the inherited record. A command bar that returns interface changes was scoped out. Simulated prototype; no model is called.",
  "route": "/experiments/neuron-shift",
  "anchor": "chat",
  "tags": [
    "neuron",
    "chat",
    "conversational",
    "ai",
    "interface",
    "handoff"
  ],
  "skills": [
    "Interaction Design",
    "Systems Design"
  ],
  "evidenceType": "product"
},
{
  "id": "neuron-shift-color",
  "project": "experiment",
  "title": "One meaning per color: red means a person owes a decision",
  "summary": "Neuron Shift's canvas shows where judgment is outstanding, not only where the plant is unhappy.",
  "detail": "The chrome carries no hue; color only means state. Green is flowing or decided, amber is an equipment condition to watch, and red means a person owes a decision, which deciding clears. A rack at 92 percent of budget stays amber because no decision is owed. A failure preview shows lost power as gray dashes and dark assets rather than red, so red keeps one meaning. Simulated prototype.",
  "route": "/experiments/neuron-shift",
  "anchor": "color",
  "tags": [
    "neuron",
    "color",
    "visual",
    "semantics",
    "state",
    "design"
  ],
  "skills": [
    "Visual Design",
    "Interaction Design"
  ],
  "evidenceType": "product"
},
{
  "id": "neuron-shift-unguided",
  "project": "experiment",
  "title": "A prototype that explains itself to an unguided visitor",
  "summary": "Neuron Shift was redesigned for a portfolio visitor with a seven-step guided tour and a separate phone page.",
  "detail": "The first version assumed Louie would present it. The redesign adds a first-visit tour in which every step asks for a real action and completes on app state rather than clicks. Every task can be done for the visitor except the consequential approval. Phones get their own page because the console needs a laptop-sized screen.",
  "route": "/experiments/neuron-shift",
  "anchor": "unguided",
  "tags": [
    "neuron",
    "onboarding",
    "tour",
    "portfolio",
    "mobile",
    "prototype"
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
  "detail": "Each shift-brief item keeps what changed, what we know, what was decided, why, who decided, and what you need to do. Recommendations show what Neuron does alone, what needs approval, and what it never does; the choices are Approve, Defer with a trigger, Approve with changes, and Reject. These are fictional records. Local browser persistence and graph reachability support the simulated interaction, not an engineering-grade model.",
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

  // -------------------------------------------------------- LUMO Career Agent
  {
    id: "lumo-context",
    project: "offboard",
    title: "LUMO, the AI assistant inside Offboard",
    summary:
      "LUMO reads a member's own job search and can add to and update their tracker. Louie designed and built it from October 2025.",
    detail:
      "LUMO reads the member's profile, applications, interviews, network, documents and their paperwork reviews, and the memories they allow. In the case study's recording, it quotes a clause from a synthetic test agreement word for word and drafts an email asking to narrow it, sending nothing. Because it has write access to the tracker, it has two jobs: answer the question that was asked, and change nothing the person did not choose. Built with AI coding tools in the loop.",
    route: "/work/lumo",
    anchor: "context",
    tags: ["ai assistant", "lumo", "chat", "context", "agents"],
    skills: ["AI Product Design", "Conversational UX", "Design Engineering"],
    evidenceType: "product",
  },
  {
    id: "lumo-gap-audit",
    project: "offboard",
    title: "Reading real LUMO conversations before changing anything",
    summary:
      "An audit of real conversations found a classifier replacing LUMO's answer with a tracker card, and members confirming none of those cards.",
    detail:
      "The September 2026 audit also found LUMO asking members to paste documents already on file, and interview-prep conversations finding no interview on file. The failures were missing tools and context, not a weak model. Quotes in the audit are paraphrased; no member text is published.",
    route: "/work/lumo",
    anchor: "audit",
    tags: ["research", "conversation audit", "real conversations", "lumo", "failure analysis"],
    skills: ["Research", "AI Product Design"],
    evidenceType: "research",
  },
  {
    id: "lumo-confirm-cards",
    project: "offboard",
    title: "LUMO proposes a change; the member confirms it",
    summary:
      "LUMO asks before it changes anything: a card appears only when the model calls a write tool with a concrete subject, and the tracker changes only when the member confirms.",
    detail:
      "Louie deleted four classifier takeover flows. The write tools return a card instead of writing. On writing-help turns (tailor, rewrite, simplify) the write tools are not offered at all, and one turn can produce one card. A confirmed change runs through the same code Offboard's connector for outside AI agents uses.",
    route: "/work/lumo",
    anchor: "decision-cards",
    tags: ["confirmation", "write tools", "tool calling", "lumo", "cards"],
    skills: ["AI Product Design", "Interaction Design", "Systems Design"],
    evidenceType: "product",
  },
  {
    id: "lumo-panel",
    project: "offboard",
    title: "LUMO sits beside the page and says what it sees",
    summary:
      "The right panel holds only LUMO. It opens beside any page, and one line says what LUMO is looking at, never more than the page context it receives.",
    detail:
      "Before, asking about a page meant leaving it for a separate chat page. The bet was written before the build, with a target for members asking from the panel and a switch back below a floor. Do not give usage numbers. The 30-day result was not in when the case study was written.",
    route: "/work/lumo",
    anchor: "decision-panel",
    tags: ["panel", "context", "lumo", "layout", "bet", "page context"],
    skills: ["Interaction Design", "Product Strategy"],
    evidenceType: "product",
  },
  {
    id: "lumo-limits",
    project: "offboard",
    title: "Limits on what LUMO reads and claims",
    summary:
      "One switch controls every money fact LUMO reads, outside agents never see offers, and LUMO never claims to cancel or refund.",
    detail:
      "With the money switch off, LUMO sees only the company and title of each offer. A database rule returns no offer rows to a connected AI agent. Support answers come from the Help page's own answers. A required test case checks that LUMO does not reach for the interview schedule after a crisis statement.",
    route: "/work/lumo",
    anchor: "decision-limits",
    tags: ["privacy", "guardrails", "safety", "lumo", "money", "support"],
    skills: ["AI Product Design", "Systems Design"],
    evidenceType: "product",
  },
  {
    id: "lumo-outcome-limits",
    project: "offboard",
    title: "What LUMO's numbers do and do not show",
    summary:
      "LUMO is live in Offboard. Its published numbers are test results, not usage.",
    detail:
      "On unchanged code LUMO scores 30 to 32 of its 32 release cases, at about half a cent a turn. The numbers show quality checks, not usage, revenue, or retention. Louie does not publish LUMO usage numbers. Do not claim the panel bet succeeded; its result was pending.",
    route: "/work/lumo",
    anchor: "outcomes",
    tags: ["outcome", "usage", "limits", "lumo"],
    skills: ["Product Strategy"],
    evidenceType: "outcome",
  },

  // ------------------------------------------------- LUMO Bench & Evals System
  {
    id: "lumo-bench-context",
    project: "offboard",
    title: "Why LUMO needed an evaluation system",
    summary:
      "Every LUMO change ended with a 45-minute check by hand, with no gate for a model or prompt change, and too little data to train a model.",
    detail:
      "Louie set the evaluation strategy and made each model and tuning call for LUMO Bench, building the tooling with AI coding agents in the loop.",
    route: "/work/lumo-evals",
    anchor: "context",
    tags: ["evaluation", "evals", "lumo bench", "testing", "ai quality"],
    skills: ["AI Evaluation", "Product Strategy"],
    evidenceType: "strategy",
  },
  {
    id: "lumo-bench-not-training",
    project: "offboard",
    title: "A bench instead of training a model",
    summary:
      "An early product has too few conversations for training to pay back, so LUMO is tested with pass-or-fail cases run against the deployed assistant instead.",
    detail:
      "Each case passes only when every criterion passes. Control cases are built to fail. Each change runs twice and the bench compares which cases miss, because two cases flip on the same code. The release gate has 32 cases and scored 31, 31, 30, and 32 of 32 on unchanged code. A run costs about a dollar. Example, case P1 (October 16, 2026): a member asks whether the company can take their severance back. Old code paraphrased the clause and passed 3 of 5 checks in each of 6 runs; new code quotes the clause and passed all 4 runs.",
    route: "/work/lumo-evals",
    anchor: "decision-bench",
    tags: ["evaluation", "benchmark", "regression testing", "training", "evals", "lumo bench"],
    skills: ["AI Evaluation", "Systems Design"],
    evidenceType: "technical",
  },
  {
    id: "lumo-model-gate",
    project: "offboard",
    title: "Model swaps have to pass the same gate",
    summary:
      "After the GPT-6 test, LUMO kept its model: GPT-6 Luna was cheaper and faster but failed a required safety case.",
    detail:
      "On 26 cases, GPT-6 Luna's estimated token cost was 46.5% lower and its median first reply 12.6% faster. After a crisis statement it called the upcoming-interviews tool before its crisis answer, which fails a required case. Earlier, GPT-5.6 Luna was the only setup to pass 29 of 29. A text-only Claude screen showed no clear win at about 15 times the cost per turn, so Louie kept LUMO on OpenAI models.",
    route: "/work/lumo-evals",
    anchor: "decision-models",
    tags: ["model selection", "gpt-6", "claude", "safety", "cost", "evaluation"],
    skills: ["AI Evaluation", "Product Judgment"],
    evidenceType: "technical",
  },
  {
    id: "lumo-hard-set",
    project: "offboard",
    title: "A hard set that can show LUMO getting better",
    summary:
      "A gate scoring 31 of 32 cannot show a gain, so a separate hard set came from real conversations, with rules that stop the prompt learning the test.",
    detail:
      "Sources: real member conversations and open bug reports; only aggregate notes went into the repository. 21 seeds grew to 31 cases, split into working and held-out sets. A test fails if the prompt holds any six-word run from a hard case. LUMO passed 87% of the hard set, above the 85% tuning line, so Louie paused tuning and fixed a memory bug first: LUMO saved its own suggestions as member facts.",
    route: "/work/lumo-evals",
    anchor: "decision-hard-set",
    tags: ["hard set", "held-out", "overfitting", "evaluation", "real conversations", "tuning"],
    skills: ["AI Evaluation", "Research"],
    evidenceType: "technical",
  },
  {
    id: "lumo-grader-check",
    project: "offboard",
    title: "How the LUMO Bench grader was checked",
    summary:
      "Claude labelled 25 grader verdicts blind and Louie ruled on each disagreement: 24 of 25 agreed, Cohen's kappa 0.92.",
    detail:
      "Louie started labelling and found the questions hard to answer with confidence, so the method changed. The one disagreement was a product question: a suggested line nudged a member to overstate compliance experience, and Louie ruled that LUMO should suggest only claims the member has made. With 25 items the range is wide; this is a first check, model plus owner review, not a human panel.",
    route: "/work/lumo-evals",
    anchor: "decision-grader",
    tags: ["grader", "llm judge", "human labels", "agreement", "evaluation", "lumo bench"],
    skills: ["AI Evaluation", "Product Judgment"],
    evidenceType: "research",
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
    summary: "Leanlab Education, an external research nonprofit, ran a six-week Spring 2025 Flexi study with ten teachers in five states, published by CK-12. In a separate CK-12 comparison, nine of ten teachers preferred Flexi overall to Khanmigo and Quizlet's Q-Chat.",
    detail: "The external study used surveys, diaries, focus groups, and interviews. Teachers reported more student engagement, confidence, and curiosity, time saved, and clearer insight into student thinking, alongside prompting, reading-level, tone, and over-reliance challenges. The study calls its findings early indicators, not conclusive. Louie cites this research as evaluation context, not as a claim that he authored the study or that it caused each interface decision. The article links the original study.",
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
    id: "career-about-story",
    project: "career",
    title: "Why Offboard, how Louie works, and what he wants next",
    summary: "Louie leads product and technology at Offboard, an AI career-transition platform the founders started building after going through the layoff process themselves. He has designed and built much of it end to end, including Lumo (the AI career agent), Career Context, job analysis, application tools, and interview preparation.",
    detail: "His approach: start with the decision a person is trying to make; let AI gather context and do the repetitive work while the person stays in control; build the real thing in code (React, TypeScript, AI coding tools, APIs, real product data), using Figma when it helps him think. At CK-12 his work included Flexi, predictive learning analytics, diagnostic experiences, content creation tools, and the CK-12 2.0 design system. Before design he played football at the University of Utah, where in 2008 he was a unanimous Consensus All-American kicker (the only one in Utah football history) and a first-team Academic All-American, then played professionally in the CFL. He is most interested in what happens when designers can build: products that are fundamentally different because AI exists. Louie supplied this in his own words for the About page.",
    route: "/about",
    tags: ["about", "background", "story", "why", "offboard", "founder", "layoff", "approach", "process", "football", "cfl", "all-american", "kicker", "athlete", "next", "looking", "interested", "figma", "code"],
    skills: ["Product Design", "AI Product Design", "Design Engineering"],
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
  {
    id: "motif-system",
    project: "experiment",
    title: "Motif: three sliders generate every motion token",
    summary: "In Motif, Energy, Bounce, and Distance generate every spring, duration, distance, and scale token, and each of 11 interaction recipes reads only tokens.",
    detail: "A preset is a saved slider position plus a style (entrance, curve, groups, press). Recipes may not contain raw numbers. Movement uses springs and fades use tweens, exits are faster than enters and never overshoot, every animation can be interrupted, and every recipe defines its reduced-motion version. Four exporters produce a W3C token file, CSS variables, Motion for React variants, and MOTION.md. Independent project.",
    route: "/experiments/motif",
    anchor: "system",
    tags: ["motif", "motion", "animation", "tokens", "design system", "sliders", "recipes", "spring"],
    skills: ["Design Systems", "Interaction Design"],
    evidenceType: "product",
  },
  {
    id: "motif-feel",
    project: "experiment",
    title: "Motif cut its A/B eye exam: people cannot compare two feels from memory",
    summary: "Motif's first feel finder played motion A, then B, six times; Louie found it confusing and replaced it with a product starting point and plain-word sliders.",
    detail: "Close settings felt the same even played one after the other on one stage, because people cannot hold a feel in memory long enough to compare. Finding a feel now starts from the kind of product (banking and health starts calm, work tools snappy, social playful), then sliders labeled Calmer to Livelier, Firmer to Bouncier, Subtler to Bolder. When the presets still felt alike, a style control was added, because the sliders changed how much a movement happened, not its shape. This was Louie's own judgment, not a user study.",
    route: "/experiments/motif",
    anchor: "feel",
    tags: ["motif", "motion", "feel", "exam", "cut", "iteration", "presets", "style"],
    skills: ["Interaction Design", "Product Strategy"],
    evidenceType: "product",
  },
  {
    id: "motif-ai-rules",
    project: "experiment",
    title: "An AI coding agent followed Motif's exported rules in one test",
    summary: "Given only Motif's exported MOTION.md and motif.ts, a fresh Claude Code session built a menu and a dialog that used Motif recipes, with no raw motion values.",
    detail: "The Snappy preset was exported into a fresh React app with a one-line rule to follow MOTION.md. A new Claude Code session with no context from the build was asked for a dropdown menu and a delete confirmation dialog; the request did not mention motion. Both spec checks passed with no hand edits: both components used Motif recipes, the agent mapped the menu to the overlay recipe, and a scanner found no raw durations or easings. One test, one preset, two components; not a study.",
    route: "/experiments/motif",
    anchor: "ai-rules",
    tags: ["motif", "ai", "agent", "claude code", "rules", "motion.md", "test", "follow"],
    skills: ["AI Product Design", "Design Systems"],
    evidenceType: "technical",
  },
  {
    id: "motif-prototype",
    project: "experiment",
    title: "Motif is an independent project with no outside users yet",
    summary: "Louie wrote Motif's spec and built it with Claude Code from October 7 to 9, 2026; the site is live, and nobody outside the project has used it.",
    detail: "Independent project, not built for a company or client. The spec's goal of a consistent app in under 15 minutes has not been timed with a real team. The repository is private, the name is not yet cleared, and the motifui.dev domain is not attached. There is no adoption, revenue, or user-research outcome.",
    route: "/experiments/motif",
    anchor: "limits",
    tags: ["motif", "independent", "prototype", "users", "customer", "results", "outside", "limits"],
    skills: ["Design Engineering"],
    evidenceType: "product",
  },
  {
    id: "motif-premise",
    project: "experiment",
    title: "Motif applies the shadcn/ui idea to motion",
    summary: "Motif lets a team tune one motion personality, watch real interactions update, and export tokens and code it owns, so every button, menu, and dialog moves the same way.",
    detail: "The spec set three goals: the settings feel different at once, the export makes a real React app's motion consistent, and an AI coding agent given only the exported rules builds components that match. No runtime package and no lock-in. Independent project.",
    route: "/experiments/motif",
    anchor: "premise",
    tags: ["motif", "motion", "design system", "shadcn", "consistency", "goals"],
    skills: ["Design Systems", "Product Strategy"],
    evidenceType: "strategy",
  },
  {
    id: "motif-use",
    project: "experiment",
    title: "Motif's setup guide starts with where you build",
    summary: "Motif's \"Use it in your app\" guide gives numbered steps for Claude.ai Projects, Claude Code, Cursor, or Codex, Lovable, v0, Bolt, or Replit, and hand-written code.",
    detail: "Each answer gets files to upload or one prompt to paste, then a test prompt and what to look for if it worked. Developers can install each feel with one shadcn command, with five components wired to it. Because the installer merges CSS rule by rule and never deletes, every style writes the same set of rules, so installing one feel over another gives the same stylesheet as a clean install.",
    route: "/experiments/motif",
    anchor: "use",
    tags: ["motif", "guide", "install", "shadcn", "registry", "lovable", "cursor", "non-developers"],
    skills: ["Interaction Design", "Design Engineering"],
    evidenceType: "product",
  },
  {
    id: "motif-technical",
    project: "experiment",
    title: "Motif's site runs on its own tokens, and its math is tested",
    summary: "Switching Motif's preset changes the site's own hovers, menus, and page transitions; the pure TypeScript token core is checked by tests.",
    detail: "The token core imports no React, enforced by a lint rule. Springs use the exact formula. Tests check every preset against the spec, all 240 style combinations against the recipe rules, and that the exports compile at each preset. Each interaction page draws every 60 fps frame of its movement as one picture. Louie wrote the spec, acceptance checks, and milestone order and built it with Claude Code over three days, October 7 to 9, 2026; the AI wrote most of the code.",
    route: "/experiments/motif",
    anchor: "technical",
    tags: ["motif", "engineering", "typescript", "tests", "spring", "claude code", "built", "technical"],
    skills: ["Design Engineering"],
    evidenceType: "technical",
  },
  {
    id: "transfersight-premise",
    project: "experiment",
    title: "TransferSight: roster math for athletes weighing a transfer",
    summary: "TransferSight is Louie's own product in progress: a report that tells a college football player where they'd project to start, and whether staying is the better call.",
    detail: "It is for backups and rotation players weighing the transfer portal, their parents (probably the buyers), and private trainers who refer athletes for a share of each sale. An athlete enters a name and school; it finds their roster page, stats, film, and recruiting history; they confirm it and answer 6 questions; they get a free number and a stay-or-go read, and can pay for the ranked report. Not affiliated with the NCAA or any school.",
    route: "/experiments/transfersight",
    anchor: "premise",
    tags: ["transfersight", "transfer", "portal", "football", "athlete", "college", "product"],
    skills: ["Product Strategy", "Product Design"],
    evidenceType: "strategy",
  },
  {
    id: "transfersight-flow",
    project: "experiment",
    title: "TransferSight's app flow is designed phone-first",
    summary: "TransferSight's app flow is six screens drawn at phone size (390 points wide), for 19 to 23 year old athletes and their parents.",
    detail: "Steps: start (name, school from the program list, sport), scouting you (sources fill in as the search runs), is this you? (every field with its source, editable before scoring; low-confidence matches land here), six questions (the ranking sets the score weights), the number (free, shareable, program names blurred but conference, projection, and fit visible), and the report (the position room with the athlete in it). These are prototype screens with demo data, in an early look; the app is not built.",
    route: "/experiments/transfersight",
    anchor: "flow",
    tags: ["transfersight", "mobile", "phone", "phones", "first", "designed", "app", "flow", "screens", "prototype", "ios"],
    skills: ["Mobile Design", "Interaction Design"],
    evidenceType: "product",
  },
  {
    id: "transfersight-trust",
    project: "experiment",
    title: "TransferSight is built to earn a parent's trust",
    summary: "TransferSight's fit score is plain math with visible weights and no AI model, because parents will ask why their kid got a 94.",
    detail: "AI handles fuzzy jobs such as matching a name to a roster row and writes a summary per program, but never sets the score; uncertain matches go back to the athlete to confirm. Every report has a stay-or-go read. It never contacts coaches and tells athletes to check with compliance. Lookups are private. No ID photos or selfies: verification is a code sent to a school email. Projections and sample data are labeled. Design intent; not yet tested with parents.",
    route: "/experiments/transfersight",
    anchor: "trust",
    tags: ["transfersight", "trust", "parent", "parents", "earn", "score", "math", "privacy", "ai"],
    skills: ["Product Design", "AI Product Design"],
    evidenceType: "product",
  },
  {
    id: "transfersight-share",
    project: "experiment",
    title: "TransferSight plans a share card and public room pages instead of daily posting",
    summary: "TransferSight is meant to run with one to three people, so growth comes from a planned 9:16 share card and free public pages per program and position.",
    detail: "The result screen ends on Share my number. The planned card targets Instagram stories with the athlete's number, position, and jersey number, and a referral link; program names never appear on it. Public room pages show counts and percentages only, never a named player. Planned, not built.",
    route: "/experiments/transfersight",
    anchor: "share",
    tags: ["transfersight", "share", "growth", "card", "instagram", "distribution", "seo"],
    skills: ["Product Strategy"],
    evidenceType: "strategy",
  },
  {
    id: "transfersight-landing",
    project: "experiment",
    title: "TransferSight's landing page is live with a waitlist",
    summary: "TransferSight's landing page has been live since September 30, 2026, with a waitlist, in a dark scouting-data direction that works on phones.",
    detail: "Louie picked the direction from three: dark, data-forward, monospace numbers, one orange accent. The page shows a sample report labeled as sample data. Its photos are AI-generated, of fictional athletes, with no logos or school marks. No waitlist count is published.",
    route: "/experiments/transfersight",
    anchor: "landing",
    tags: ["transfersight", "landing", "website", "live", "waitlist", "visual", "responsive"],
    skills: ["Visual Design", "Product Design"],
    evidenceType: "product",
  },
  {
    id: "transfersight-system",
    project: "experiment",
    title: "TransferSight stores every FBS roster page weekly",
    summary: "TransferSight's data pipeline stores all 138 FBS roster pages each week and parses them into clean rows; the first full cycle ran October 3, 2026.",
    detail: "Raw HTML is stored first, then parsed into position group, class year, height, weight, and hometown. A run with fewer than 70 or more than 200 players fails and keeps last week's data. The operating plan is no person in the loop beyond a weekly digest of flagged pages. Built on Supabase; the landing page is static on Vercel; the app will be Next.js.",
    route: "/experiments/transfersight",
    anchor: "system",
    tags: ["transfersight", "data", "pipeline", "roster", "scraper", "engineering", "supabase", "built"],
    skills: ["Design Engineering", "Systems Design"],
    evidenceType: "technical",
  },
  {
    id: "transfersight-status",
    project: "experiment",
    title: "TransferSight is designed, not yet built or proven",
    summary: "TransferSight's landing page and data pipeline are live, but the app is not built, no reports have been sold, and the athlete and parent interviews have not happened.",
    detail: "The prototype uses an early navy and orange look and shows an NIL estimate later removed from the landing page. Price is untested. The scoring must pass a backtest against past seasons before the paid report ships. Next: 10 interviews, season stats and the scoring engine, then public room pages and the lookup flow. No revenue, users, or outcome claims.",
    route: "/experiments/transfersight",
    anchor: "limits",
    tags: ["transfersight", "built", "status", "progress", "limits", "users", "customers", "results", "much"],
    skills: ["Product Strategy"],
    evidenceType: "product",
  },
];
