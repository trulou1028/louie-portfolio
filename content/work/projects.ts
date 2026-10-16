import type { DecisionMarkSpec } from "@/lib/decision-mark";
import type { Route } from "@/lib/routes";
import type { CaseStudyBriefContent } from "@/components/portfolio/case-study-brief";

/** Canonical editorial metadata. Claims and assets: plans/portfolio-strategy/. */
export type WorkProject = {
  slug: "ck12-analytics" | "offboard" | "lumo" | "lumo-evals" | "flexi";
  name: string;
  title: string;
  tags: readonly string[];
  href: Route;
  summary: string;
  image: string | null;
  imageAlt: string;
  imageCaption: string;
  imageWidth: number;
  imageHeight: number;
  /** A different screenshot for the homepage tile, when `image` is styled
   *  differently from the other tiles' flat screenshots. */
  tileImage?: { src: string; alt: string; width: number; height: number };
  /** `none` when `image` is a chart, not a browser window (no address bar). */
  imageFrame?: "browser" | "none";
  role: string;
  scope: string;
  status: string;
  result: string;
  /** The three-line summary at the top of the case study (Plan 045). */
  brief: CaseStudyBriefContent;
  featured: boolean;
  /** Homepage plate color: the project's own brand color (Plan 037). */
  plate: "offboard" | "foresights" | "flexi";
  /** Quick facts for the plate and case-study header. Resume-stated only. */
  facts: readonly { label: string; value: string }[];
  /** Decision marks on the hero image. Labels restate the caption or case study. */
  imageMarks: readonly DecisionMarkSpec[];
};

export const workProjects: readonly WorkProject[] = [
  {
    slug: "offboard",
    name: "Offboard",
    title: "Offboard Job Search Platform",
    tags: ["Product strategy", "Agentic workflows", "Design engineering"],
    href: "/work/offboard",
    summary: "One workspace for a role, with research and drafts that stay connected. Automation does the repeated work; the person decides what goes out.",
    image: "/work/offboard/packet-panels.webp",
    imageAlt: "An Offboard application packet for a Senior Product Designer role at Clever, marked ready for review, shown as three panels: the navigation, the packet with its fit assessment and sections, and the completed nine-step pipeline.",
    imageCaption: "Ready for review. A Job Packet keeps the role, research, and prepared materials together so the person can inspect what the workflow produced. Supplied product screenshot.",
    imageWidth: 1538, imageHeight: 1096,
    tileImage: { src: "/work/offboard/packet.webp", alt: "An Offboard application packet for a Senior Product Designer role at Clever, marked ready for review, in the full app window: navigation, the packet with its fit assessment and sections, and the completed nine-step pipeline.", width: 2000, height: 1073 },
    role: "Founding Product Designer & AI Systems Lead",
    scope: "Product direction, UX, interface design, full-stack implementation, and iteration",
    status: "Working product",
    result: "Built end to end. The next product question is whether the first step meets the seeker where they are, not simply whether a packet can be generated.",
    brief: {
      problem: "People in a career transition rebuild the same context across a dozen disconnected tools. AI that only writes more documents can push them toward roles that are not worth it.",
      did: "As founding designer, I designed and engineered Offboard end to end: a workspace for each opportunity, an AI pipeline that checks a role before tailoring anything, drafts the person reviews before use, and a plan-first start for people not yet ready to apply.",
      result: "A live product. In early signups, most people finished onboarding and ran a ghost check, but few built a packet in their first days. That gap is the case for starting with a plan.",
    },
    featured: true,
    plate: "offboard",
    facts: [
      { label: "Role", value: "Founding Product Designer & AI Systems Lead" },
      { label: "Years", value: "2025 to now" },
      { label: "Team", value: "Six-person startup" },
    ],
    imageMarks: [{ x: 75.3, y: 20.6, w: 18.7, h: 40.5, label: "The pipeline stays visible" }],
  },
  {
    slug: "lumo",
    name: "Offboard LUMO",
    title: "LUMO Career Agent",
    tags: ["AI assistant", "Conversational UX", "Agentic workflows"],
    href: "/work/lumo",
    summary: "LUMO is the assistant inside Offboard. It reads the person’s own search, sits beside the page they are on, and turns every change into a card they confirm.",
    image: "/work/lumo/chat.webp",
    imageAlt: "LUMO's full chat page in Offboard, April 2026. The empty state reads: Advice grounded in your real search. Lumo uses the Offboard context you already keep current, like your profile, applications, interviews, network, reflections you allow for personalization, and saved chat memories. A card under it reads: Lumo has strong context across your job search, 5/6 automatic context sources ready, with a What Lumo knows button. The composer at the bottom reads Ask Lumo anything about your career, with two suggestions: Follow up on Function Health, and Check my progress.",
    imageCaption: "Before the first message, LUMO says what it reads and how much of that context is ready. LUMO’s full chat page, April 2026. Product screenshot.",
    imageWidth: 1536, imageHeight: 864,
    role: "Founding Product Designer & AI Systems Lead",
    scope: "Product direction, conversation and tool design, evaluation, and full-stack implementation",
    status: "Live in Offboard",
    result: "Live. Every change runs through a release gate before it ships.",
    brief: {
      problem: "In real conversations, a classifier that ran before the chat replaced LUMO’s answer with a tracker card, and members confirmed none of those cards. Asking about a page also meant leaving it.",
      did: "I designed and built LUMO end to end: the conversation, the tools, and the rules for when it may act. A card now appears only when the model calls a write tool with a concrete subject, and nothing changes until the person confirms. LUMO moved to a panel beside every page that says what it is looking at.",
      result: "Live in Offboard. On unchanged code, LUMO scores 30 to 32 of the 32 release cases, at about half a cent a turn.",
    },
    featured: true,
    plate: "offboard",
    facts: [
      { label: "Role", value: "Founding Product Designer & AI Systems Lead" },
      { label: "Years", value: "2025 to now" },
      { label: "Team", value: "Six-person startup" },
    ],
    imageMarks: [{ x: 39.6, y: 48.7, w: 37.5, h: 8.8, label: "Says what it reads before you ask" }],
  },
  {
    slug: "lumo-evals",
    name: "LUMO Bench",
    title: "LUMO Bench & Evals System",
    tags: ["AI evaluation", "Model selection", "Product judgment"],
    href: "/work/lumo-evals",
    summary: "Training a model needs far more conversations than an early product has. So every LUMO change runs through pass-or-fail cases, a harder set from real conversations, and a check on the grader itself.",
    image: "/work/lumo-evals/bench.webp",
    imageAlt: "A chart titled Four checks before a LUMO change ships. Release gate: 32 cases, unchanged code, four runs on 2026-09-26, scoring 31, 31, 30, and 32 of 32. Hard set: 31 harder cases, two runs on 2026-10-01, scoring 28 and 26 of 31, against a line at 85%: tune only when the mean is at or below this line. Grader check: 25 verdicts labelled blind on 2026-09-30, 24 of 25 agree with the grader, Cohen's kappa 0.92, and the one disagreement went to Louie. Model swap: the GPT-6 Luna requalification on 2026-09-23 kept the current model, because the candidate cost less per turn but failed a required safety case.",
    imageCaption: "The four checks and their numbers. A chart drawn for this page from the run reports in Offboard’s repository, not a product screen.",
    imageWidth: 2000, imageHeight: 1200,
    imageFrame: "none",
    role: "Founding Product Designer & AI Systems Lead",
    scope: "Evaluation strategy, test case design, grader checks, and model decisions",
    status: "In use for every LUMO change",
    result: "Two model swaps stopped at the gate, and prompt tuning paused when the hard set showed no room to measure a gain.",
    brief: {
      problem: "Every LUMO change ended with a 45-minute check by hand, and the result was a judgment in a sprint doc. A model swap or prompt change had no regression gate, and an early product has too little data to train a model.",
      did: "I chose a bench over training: test cases with pass-or-fail criteria, a runner against the deployed assistant, a hard set built from real conversations, rules that stop the prompt from learning the test, and a check on how often the grader agrees with a careful reader.",
      result: "A cheaper GPT-6 Luna failed a required safety case, so LUMO kept its model. When LUMO passed 87% of the hard set, above the 85% line where a gain can be measured, I paused prompt tuning and fixed a memory bug first.",
    },
    featured: true,
    plate: "offboard",
    facts: [
      { label: "Role", value: "Founding Product Designer & AI Systems Lead" },
      { label: "Years", value: "2026" },
      { label: "Team", value: "Six-person startup" },
    ],
    imageMarks: [],
  },
  {
    slug: "ck12-analytics",
    name: "CK-12 Foresights & Insights",
    title: "CK-12 Teacher Analytics",
    tags: ["Systems design", "Learning analytics", "Product judgment"],
    href: "/work/ck12-analytics",
    summary: "Separate prediction from diagnosis. Make uncertainty visible. Help teachers decide where to look next.",
    image: "/work/ck12-analytics/foresights.png",
    imageAlt: "Foresights shows predicted skill ranges for a demo class and marks students with insufficient data.",
    imageCaption: "A range, not a verdict. Foresights keeps the uncertainty visible alongside the prediction. Student information is demo data.",
    imageWidth: 1280, imageHeight: 768,
    role: "Lead Product Designer",
    scope: "Experience architecture, interaction model, prototypes, and visual language",
    status: "Product case study",
    result: "Teachers saw value in the tools. Published reviews also found that half struggled with each tool’s central chart.",
    brief: {
      problem: "A predicted skill level does not tell a teacher what to do next, and a single score is easy to overread.",
      did: "I led the experience architecture, interaction model, and visual language: predicted ranges instead of a single score, a clear no-data state, and Insights, which separates skill from engagement so a teacher can check one student before acting.",
      result: "In CK-12’s published reviews with ten teachers each, 90% found each tool’s menu easy to interpret and 90% or more expected it to save time. Half struggled with each tool’s main chart, which set the next goal: explain before you visualize.",
    },
    featured: true,
    plate: "foresights",
    facts: [
      { label: "Role", value: "Lead Product Designer" },
      { label: "At CK-12", value: "2016 to 2025" },
      { label: "Platform", value: "20M+ users" },
    ],
    imageMarks: [{ x: 21, y: 31.5, w: 45.5, h: 39.5, label: "A range, not a verdict" }],
  },
  {
    slug: "flexi",
    name: "CK-12 Flexi",
    title: "CK-12 Flexi AI Tutor",
    tags: ["Conversational UX", "Learning", "Research"],
    href: "/work/flexi",
    summary: "An answer begins the interaction. Clarification, source choices, and a next challenge give students ways to keep learning.",
    image: "/work/flexi/follow-up.webp",
    imageAlt: "Flexi offers an analogy, translation, simpler explanation, more detail, rephrasing, and a Challenge Me follow-up.",
    imageCaption: "Different ways into an explanation, followed by a next challenge. Supplied Flexi product view.",
    imageWidth: 1278, imageHeight: 753,
    role: "Lead UX Designer",
    scope: "Research, UX/UI design, and prototyping with product, engineering, and curriculum partners",
    status: "Product case study",
    result: "Published classroom research describes useful support alongside prompting, comprehension, and tone barriers. Activity alone is not evidence of learning.",
    brief: {
      problem: "An AI tutor can answer the question and still skip the learning. Students need help getting unstuck without the tutor doing the work for them.",
      did: "I led UX for Flexi with product, engineering, and curriculum partners: follow-up actions, so a student can ask for the next kind of help without writing a better prompt, and labels that separate AI-generated answers from CK-12 Library content.",
      result: "In an external six-week study, teachers reported more student engagement and confidence, with prompting and reading level as the barriers. In CK-12’s analysis of Flexi in Adaptive Practice, answer-seeking questions fell from 72% to 52% by a student’s eighth question.",
    },
    featured: false,
    plate: "flexi",
    facts: [
      { label: "Role", value: "Lead UX Designer" },
      { label: "At CK-12", value: "2016 to 2025" },
      { label: "Platform", value: "20M+ users" },
    ],
    imageMarks: [{ x: 30.4, y: 32.4, w: 19, h: 43.6, label: "Different ways into an explanation" }],
  },
];

export const featuredWork = workProjects.filter((project) => project.featured);
