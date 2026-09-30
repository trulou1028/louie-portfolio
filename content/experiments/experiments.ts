import type { CaseStudyBriefContent } from "@/components/portfolio/case-study-brief";

export type Experiment = {
  slug: string;
  title: string;
  summary: string | null;
  tags: readonly string[];
  status: "prototype" | "shipped" | "exploration";
  /** ISO date; null until the experiment actually exists. */
  date: string | null;
  image?: { src: string; alt: string; width: number; height: number };
  demoUrl?: string;
  /** The three-line summary at the top of the write-up (Plan 045). */
  brief?: CaseStudyBriefContent;
};

export const experiments: readonly Experiment[] = [
  {
    slug: "neuron-shift",
    // Supplied screenshot from Louie's revised case study, 2026-09-28. The
    // tour view, not the console, because the homepage hero already loops
    // the console (Plan 041).
    image: { src: "/work/neuron-shift/tour.webp", alt: "The Neuron Shift guided tour on step 5 of 7: PDU-05 is ringed on the power path and both racks below it go dark, showing a single point of failure. All values are simulated.", width: 2880, height: 1800 },
    demoUrl: "https://neuron-shift.vercel.app/",
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
    title: "Voice + tool calling",
    summary: null, // TODO(content)
    tags: ["Voice", "Tool calling"],
    status: "exploration",
    date: null,
  },
  {
    slug: "human-in-the-loop",
    title: "Human-in-the-loop AI",
    summary: null, // TODO(content)
    tags: ["Confirmation", "Agency"],
    status: "exploration",
    date: null,
  },
  {
    slug: "agent-interface-patterns",
    title: "Agent interface patterns",
    summary: null, // TODO(content)
    tags: ["Agents", "Interface"],
    status: "exploration",
    date: null,
  },
  {
    slug: "design-engineering",
    title: "Design engineering",
    summary: null, // TODO(content)
    tags: ["Prototyping", "Front-end"],
    status: "exploration",
    date: null,
  },
] as const;
