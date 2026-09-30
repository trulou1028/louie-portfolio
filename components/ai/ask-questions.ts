/**
 * Starter questions for Ask Louie (Plan 014, Plan 042).
 *
 * Plain data, kept out of the lazy chat chunk so the homepage ask bar can
 * show them without loading the chat runtime.
 *
 * Every question must retrieve grounded evidence: see "starter questions"
 * in `lib/ai/portfolio-search.test.ts`. Project questions name the project,
 * so the answer does not depend on which page the visitor is on.
 */

/**
 * The general set: the homepage ask bar and the panel's empty state away
 * from a project page (Plan 043). Each answers a question a hiring manager
 * brings to this role: AI judgment, whether the designer builds, and scale.
 * The work itself is one scroll below, so no question only names a project.
 */
export const STARTER_QUESTIONS = [
  { text: "How do you design AI people trust?", slug: "ai-trust" },
  { text: "Can you build what you design?", slug: "build-what-you-design" },
  { text: "What have you shipped at scale?", slug: "shipped-at-scale" },
] as const;

export type AskQuestion = { text: string; slug: string };

export type PageQuestions = {
  route: string;
  /** The project name shown in the panel ("Reading: Offboard"). */
  name: string;
  questions: readonly AskQuestion[];
};

/** On a case study or prototype page, the panel starts from that project. */
export const PAGE_QUESTIONS: readonly PageQuestions[] = [
  {
    route: "/work/offboard",
    name: "Offboard",
    questions: [
      { text: "Why does the Offboard packet pause for risk?", slug: "offboard-risk" },
      { text: "What stays under the person's control in Offboard?", slug: "offboard-control" },
      { text: "Why did Offboard move from packet-first to plan-first?", slug: "offboard-entry" },
    ],
  },
  {
    route: "/work/ck12-analytics",
    name: "CK-12 Foresights",
    questions: [
      { text: "Why separate prediction from diagnosis in Foresights?", slug: "analytics-prediction" },
      { text: "How does Foresights show uncertainty?", slug: "analytics-uncertainty" },
      { text: "What did the Foresights evaluation find?", slug: "analytics-evaluation" },
    ],
  },
  {
    route: "/work/flexi",
    name: "Flexi",
    questions: [
      { text: "What follow-up choices does Flexi offer?", slug: "flexi-next-step" },
      { text: "How does Flexi label AI answers and sources?", slug: "flexi-check" },
      { text: "What does the research say about Flexi?", slug: "flexi-research" },
    ],
  },
  {
    route: "/experiments/neuron-shift",
    name: "Neuron Shift",
    questions: [
      { text: "Why isn't Neuron Shift a chat box?", slug: "neuron-chat" },
      { text: "What does red mean in Neuron Shift?", slug: "neuron-color" },
      { text: "Was Neuron Shift built for a real customer?", slug: "neuron-customer" },
    ],
  },
];

export function pageQuestionsFor(pathname: string | null): PageQuestions | null {
  return PAGE_QUESTIONS.find((page) => page.route === pathname) ?? null;
}
