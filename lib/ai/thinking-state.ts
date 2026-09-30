import type { UIMessage } from "ai";

/**
 * What Louie reads from, shown as small cards of the real work (Plan 043).
 *
 * While Louie reads and searches, the cards deal through a small stack, one
 * after another, like flipping through a portfolio. When the search
 * returns, the sources it found open into labeled chips and the rest leave.
 * The chips come from the routes the search really returned, so the wait
 * shows true progress and never shows reasoning (spec §21).
 */
export const SOURCES = [
  { key: "offboard", label: "Offboard", routes: ["/work/offboard"], image: "/work/offboard/packet.webp", tone: "bg-plate-offboard" },
  { key: "foresights", label: "Foresights", routes: ["/work/ck12-analytics"], image: "/work/ck12-analytics/foresights.png", tone: "bg-plate-foresights" },
  { key: "flexi", label: "Flexi", routes: ["/work/flexi"], image: "/work/flexi/follow-up.webp", tone: "bg-plate-flexi" },
  { key: "neuron", label: "Neuron Shift", routes: ["/experiments/neuron-shift"], image: "/work/neuron-shift/tour.webp", tone: "bg-plate-neuron" },
  { key: "resume", label: "Resume", routes: ["/resume", "/about"], image: null, tone: "bg-surface" },
] as const;

export type SourceKey = (typeof SOURCES)[number]["key"];

export type ThinkingPhase =
  /** Sent; nothing back yet. */
  | "reading"
  /** A portfolio search is running. */
  | "searching"
  /** Every search has returned; the answer is being written. */
  | "writing";

type ToolPart = { type: string; state?: string; output?: unknown };

function routesIn(output: unknown): string[] {
  if (!output || typeof output !== "object") return [];
  const record = output as { results?: { route?: unknown }[]; evidenceLinks?: { route?: unknown }[] };
  return [...(record.results ?? []), ...(record.evidenceLinks ?? [])]
    .map((item) => item.route)
    .filter((route): route is string => typeof route === "string");
}

/** Reads the pending turn's tool parts: which phase, and what was found. */
export function thinkingState(message: UIMessage | undefined): { phase: ThinkingPhase; found: SourceKey[] } {
  const tools = (message?.role === "assistant" ? message.parts : []).filter((part) =>
    part.type.startsWith("tool-"),
  ) as ToolPart[];
  if (tools.length === 0) return { phase: "reading", found: [] };

  const routes = new Set(tools.flatMap((part) => (part.state === "output-available" ? routesIn(part.output) : [])));
  const found = SOURCES.filter((source) => source.routes.some((route) => routes.has(route))).map((s) => s.key);
  const running = tools.some((part) => part.state !== "output-available" && part.state !== "output-error");
  return { phase: running ? "searching" : "writing", found };
}

/** "Offboard", "Offboard and Flexi", "Offboard, Flexi, and Resume". */
function listOf(keys: readonly SourceKey[]): string {
  const labels = keys.map((key) => SOURCES.find((source) => source.key === key)!.label);
  if (labels.length <= 2) return labels.join(" and ");
  return `${labels.slice(0, -1).join(", ")}, and ${labels.at(-1)}`;
}

/**
 * The status line. The found sources already show as labels under it, so
 * the visible line stays short; `spoken` names them for screen readers.
 */
export function statusFor(phase: ThinkingPhase, found: readonly SourceKey[]): { text: string; spoken: string } {
  if (phase === "reading") return { text: "Reading your question", spoken: "Reading your question" };
  if (phase === "searching") return { text: "Searching my case studies", spoken: "Searching my case studies" };
  if (found.length === 0) return { text: "Writing the answer", spoken: "Writing the answer" };
  return { text: "Writing from what I found", spoken: `Writing from ${listOf(found)}` };
}
