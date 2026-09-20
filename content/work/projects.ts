import type { Route } from "@/lib/routes";

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
  },
];

export const featuredWork = workProjects.filter((project) => project.featured);
