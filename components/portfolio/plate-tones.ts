/**
 * Project plate colors (Plan 037). Plan 051 took the plates off the homepage
 * and Work cards; they remain where a project gets the whole width, such as
 * the next-case-study link. Each plate carries the project's brand color,
 * with ink and muted text colors that meet contrast on it.
 */
export type PlateTone = "offboard" | "foresights" | "flexi" | "neuron" | "motif" | "transfersight";

/* Static class strings so Tailwind can see every token. */
export const TONES: Record<PlateTone, { field: string; ink: string; muted: string; rule: string }> = {
  offboard: { field: "bg-plate-offboard", ink: "text-plate-offboard-ink", muted: "text-plate-offboard-muted", rule: "border-plate-offboard-muted/40" },
  foresights: { field: "bg-plate-foresights", ink: "text-plate-foresights-ink", muted: "text-plate-foresights-muted", rule: "border-plate-foresights-ink/30" },
  flexi: { field: "bg-plate-flexi", ink: "text-plate-flexi-ink", muted: "text-plate-flexi-muted", rule: "border-plate-flexi-ink/25" },
  neuron: { field: "bg-plate-neuron", ink: "text-plate-neuron-ink", muted: "text-plate-neuron-muted", rule: "border-plate-neuron-muted/30" },
  transfersight: { field: "bg-plate-transfersight", ink: "text-plate-transfersight-ink", muted: "text-plate-transfersight-muted", rule: "border-plate-transfersight-muted/30" },
  motif: { field: "bg-plate-motif", ink: "text-plate-motif-ink", muted: "text-plate-motif-muted", rule: "border-plate-motif-muted/30" },
};
