/**
 * Experiments index (spec §15).
 *
 * The four entries below are the initial categories named in spec §11 §4 and
 * §15. They are genuinely explorations — none has shipped as a demo yet, and
 * `status: "exploration"` says so on the card rather than implying finished
 * work. Summaries stay null until Louie writes them: describing work that
 * does not exist yet would be inventing content (spec §29, §39.5).
 *
 * Plan 008 builds these out into 20–60 second demonstrations.
 */
export type Experiment = {
  slug: string;
  title: string;
  summary: string | null;
  tags: readonly string[];
  status: "prototype" | "shipped" | "exploration";
  /** ISO date; null until the experiment actually exists. */
  date: string | null;
};

export const experiments: readonly Experiment[] = [
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
