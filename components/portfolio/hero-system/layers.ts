export type HeroLayer = {
  id: "interface" | "decisions" | "system";
  label: string;
  description: string;
  assembledY: number;
  expandedY: number;
  expandedX: number;
  rotation: number;
};

/**
 * One shared description of the visual and its text equivalent. The diagram
 * is illustrative: it describes Louie's design lens, not a client system.
 */
export const HERO_LAYERS: readonly HeroLayer[] = [
  {
    id: "interface",
    label: "Interface",
    description: "What people see and use.",
    assembledY: 0.34,
    expandedY: 1.42,
    expandedX: -0.38,
    rotation: 0.045,
  },
  {
    id: "decisions",
    label: "Decisions",
    description: "The choices that shape the experience.",
    assembledY: 0,
    expandedY: 0,
    expandedX: 0.08,
    rotation: -0.035,
  },
  {
    id: "system",
    label: "System",
    description: "How the pieces work together.",
    assembledY: -0.34,
    expandedY: -1.42,
    expandedX: 0.42,
    rotation: 0.055,
  },
] as const;

export const HERO_SCENE = {
  width: 3.2,
  depth: 2.24,
  height: 0.3,
  cornerRadius: 0.2,
  damping: 5.75,
  settleThreshold: 0.001,
  restProgress: 0.22,
} as const;
