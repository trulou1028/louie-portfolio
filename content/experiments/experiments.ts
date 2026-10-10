import type { CaseStudyBriefContent } from "@/components/portfolio/case-study-brief";

export type Experiment = {
  slug: string;
  /** The product name, shown on plates and tiles ("Neuron Shift"). */
  name: string;
  title: string;
  summary: string | null;
  tags: readonly string[];
  status: "prototype" | "shipped" | "exploration";
  /** ISO date; null until the experiment actually exists. */
  date: string | null;
  image?: { src: string; alt: string; width: number; height: number };
  demoUrl?: string;
  /** Link text for `demoUrl`. */
  demoLabel?: string;
  /** The project's own brand field on plates and tiles. */
  plate?: "neuron" | "motif";
  /** The project's wordmark: `dark` for its plate, `light` for the canvas. */
  logo?: { dark: string; light: string; width: number; height: number };
  /** The chip beside the name on plates and tiles. */
  badge?: string;
  /** The short line under the title on a homepage tile. */
  meta?: string;
  /** The three-line summary at the top of the write-up (Plan 045). */
  brief?: CaseStudyBriefContent;
};

export const experiments: readonly Experiment[] = [
  {
    slug: "motif",
    name: "Motif",
    // Captured from the live site, 2026-10-10 (Snappy preset, dark theme).
    image: { src: "/work/motif/studio.webp", alt: "The Motif studio. On the left, Find your feel: Work tools is picked as the kind of product, a style row picks Rise, Spring, Cascade, and Squeeze, and three sliders read energy 0.70, bounce 0.20, distance 0.40. On the right, a live app window shows a Settings page with notification switches, tabs, and shared files, with settles 383 ms, overshoot 0.3%, and travel 15 px in its footer.", width: 2880, height: 1910 },
    demoUrl: "https://motif-ui-kappa.vercel.app/",
    demoLabel: "Try Motif",
    plate: "motif",
    // Louie's wordmark, as cropped for the Motif site (motifui public/brand).
    logo: { dark: "/brands/motif-on-dark.png", light: "/brands/motif-on-light.png", width: 425, height: 96 },
    badge: "Independent project",
    meta: "Live site, no outside users yet",
    brief: {
      problem: "Teams want every button, menu, and dialog in a product to move the same way. Without a system, each component gets its own hand-picked duration and curve.",
      did: "I wrote the spec and directed the build with Claude Code: three sliders that generate every motion token, 11 interactions built only from those tokens, and four exports, one of them a rules file for AI coding agents.",
      result: "A live site with 7 presets and a one-command install. In one test, a fresh Claude Code session given only the exported files built a menu and a dialog with no hand-written motion values. Nobody outside the project has used it yet.",
    },
    title: "Giving a whole product one way to move",
    summary: "Motif: a motion design system you tune with three sliders, watch on a live app, and export as code and as rules an AI coding agent follows. Independent project, built in three days; no outside users yet.",
    tags: ["Design systems", "Design engineering"],
    status: "prototype",
    date: "2026-10-09",
  },
  {
    slug: "neuron-shift",
    name: "Neuron Shift",
    // Supplied screenshot from Louie's revised case study, 2026-09-28. The
    // tour view, not the console, because the homepage hero already loops
    // the console (Plan 041).
    image: { src: "/work/neuron-shift/tour.webp", alt: "The Neuron Shift guided tour on step 5 of 7: PDU-05 is ringed on the power path and both racks below it go dark, showing a single point of failure. All values are simulated.", width: 2880, height: 1800 },
    demoUrl: "https://neuron-shift.vercel.app/",
    demoLabel: "Try the simulated demo",
    plate: "neuron",
    badge: "Independent prototype",
    meta: "Simulated data",
    brief: {
      problem: "At shift change, operations systems keep what happened but lose why a person chose what they chose. The costliest mistake is undoing a decision a colleague made on purpose.",
      did: "I designed and built an independent prototype with an AI pair: a shift brief that keeps each decision and its reason, AI that attaches to assets instead of a chat box, and friction that scales with how hard an action is to undo.",
      result: "A working prototype anyone can try, with simulated data and no live model. Its main open question is still untested: whether a real operator finds the six-field handoff useful.",
    },
    title: "Preserving operator judgment across shift changes",
    summary: "Neuron Shift: an independent prototype exploring asset context, reversible decisions, and a handoff that preserves the reason behind an action. Simulated data; no live model or operator research.",
    tags: ["Operator workflows", "Design engineering"],
    status: "prototype",
    date: null,
  },
  {
    slug: "voice-tool-calling",
    name: "Voice + tool calling",
    title: "Voice + tool calling",
    summary: null, // TODO(content)
    tags: ["Voice", "Tool calling"],
    status: "exploration",
    date: null,
  },
  {
    slug: "human-in-the-loop",
    name: "Human-in-the-loop AI",
    title: "Human-in-the-loop AI",
    summary: null, // TODO(content)
    tags: ["Confirmation", "Agency"],
    status: "exploration",
    date: null,
  },
  {
    slug: "agent-interface-patterns",
    name: "Agent interface patterns",
    title: "Agent interface patterns",
    summary: null, // TODO(content)
    tags: ["Agents", "Interface"],
    status: "exploration",
    date: null,
  },
  {
    slug: "design-engineering",
    name: "Design engineering",
    title: "Design engineering",
    summary: null, // TODO(content)
    tags: ["Prototyping", "Front-end"],
    status: "exploration",
    date: null,
  },
] as const;
