import type { DecisionMarkSpec } from "@/lib/decision-mark";
import type { Route } from "@/lib/routes";

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
  role: string;
  scope: string;
  status: string;
  result: string;
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
    image: "/work/offboard/application-packet.jpg",
    imageAlt: "Offboard application packet ready for review, with job fit, research sections, tailored materials, and a completed pipeline.",
    imageCaption: "Ready for review. A Job Packet keeps the role, research, and prepared materials together so the person can inspect what the workflow produced. Supplied product screenshot.",
    imageWidth: 1556, imageHeight: 957,
    role: "Founder & Product Designer",
    scope: "Product direction, UX, interface design, full-stack implementation, and iteration",
    status: "Working product",
    result: "Built end to end. The next product question is whether the first step meets the seeker where they are, not simply whether a packet can be generated.",
    featured: true,
    plate: "offboard",
    facts: [
      { label: "Role", value: "Founder & Product Designer" },
      { label: "Years", value: "2025 to now" },
      { label: "Team", value: "Six-person startup" },
    ],
    gallery: [
      { src: "/work/offboard/product.jpg", alt: "Offboard dashboard showing the sections of Louie's workspace.", width: 2048, height: 1052 },
      { need: "Risk gate: the pause for the person's choice" },
      { need: "Job Packet on a phone" },
    ],
    imageMarks: [{ x: 80, y: 9, w: 18.8, h: 46.2, label: "The pipeline stays visible" }],
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
    featured: true,
    plate: "foresights",
    facts: [
      { label: "Role", value: "Lead Product Designer" },
      { label: "At CK-12", value: "2016 to 2025" },
      { label: "Platform", value: "20M+ users" },
    ],
    gallery: [
      { src: "/work/ck12-analytics/insights.png", alt: "Insights demo-class scatterplot separating skill from engagement, with a student detail panel.", width: 1280, height: 768 },
      { need: "Detail: one range with the not-enough-data state" },
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
