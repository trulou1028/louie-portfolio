import type { DecisionMarkSpec } from "@/lib/decision-mark";
import type { Route } from "@/lib/routes";
import type { CaseStudyBriefContent } from "@/components/portfolio/case-study-brief";

/**
 * A secondary image for the homepage plate. `need` entries are open asset
 * requests: they render as labeled empty slots in development only, so a
 * production build never shows an unfinished frame (Plan 037).
 */
export type GalleryItem =
  | { src: string; alt: string; width: number; height: number }
  | { need: string };

/** Canonical editorial metadata. Claims and assets: plans/portfolio-strategy/. */
export type WorkProject = {
  slug: "ck12-analytics" | "offboard" | "flexi";
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
  gallery: readonly GalleryItem[];
  /** Decision marks on the hero image. Labels restate the caption or case study. */
  imageMarks: readonly DecisionMarkSpec[];
};

export const workProjects: readonly WorkProject[] = [
  {
    slug: "offboard",
    name: "Offboard",
    title: "Building a career-transition product around the next useful step",
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
      result: "A live product. In an early signup cohort, 92% finished onboarding and 45% ran a ghost check, but only 8% built a packet in their first days. That gap is the case for starting with a plan.",
    },
    featured: true,
    plate: "offboard",
    facts: [
      { label: "Role", value: "Founding Product Designer & AI Systems Lead" },
      { label: "Years", value: "2025 to now" },
      { label: "Team", value: "Six-person startup" },
    ],
    gallery: [
      { src: "/work/offboard/resume-review.webp", alt: "The tailored resume in an Offboard packet, with each changed line shown: the original struck through above the rewrite. Contact details blurred.", width: 2000, height: 999 },
      { src: "/work/offboard/layoff-plan.webp", alt: "Offboard's Layoff Plan: steps that fit the person's situation, in groups, done in any order. 5 of 24 done.", width: 2000, height: 999 },
      { src: "/work/offboard/risk-gate.webp", alt: "An Offboard packet paused by the risk gate: High Ghost Risk Detected, 84/100, with Continue Anyway, Save Application Only, and Discard. A test packet.", width: 2000, height: 1472 },
    ],
    imageMarks: [{ x: 75.3, y: 20.6, w: 18.7, h: 40.5, label: "The pipeline stays visible" }],
  },
  {
    slug: "ck12-analytics",
    name: "CK-12 Foresights & Insights",
    title: "Turning learning predictions into teacher decisions",
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
    gallery: [
      { src: "/work/ck12-analytics/insights.png", alt: "Insights demo-class scatterplot separating skill from engagement, with a student detail panel.", width: 1280, height: 768 },
      { src: "/work/ck12-analytics/not-enough-data.webp", alt: "Foresights with too little data: no prediction, a message saying what data it needs, and grey per-question bars.", width: 2000, height: 1200 },
      { need: "Early sketch or the rejected single-score concept" },
    ],
    imageMarks: [{ x: 21, y: 31.5, w: 45.5, h: 39.5, label: "A range, not a verdict" }],
  },
  {
    slug: "flexi",
    name: "CK-12 Flexi",
    title: "Helping students get unstuck without doing the learning for them",
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
    gallery: [
      { src: "/work/flexi/photosynthesis.webp", alt: "Flexi photosynthesis explanation with AI-generated and CK-12 Library labels and follow-up learning actions.", width: 1920, height: 1136 },
      { need: "Flexi on a phone, inside a lesson" },
      { need: "Research artifact from the classroom study" },
    ],
    imageMarks: [{ x: 30.4, y: 32.4, w: 19, h: 43.6, label: "Different ways into an explanation" }],
  },
];

export const featuredWork = workProjects.filter((project) => project.featured);
