/**
 * The Offboard architecture, as one graph (spec §13, §29).
 *
 * This is the single source of truth behind both representations of the
 * `#architecture` section: the ordered list that always renders, and the
 * interactive map that replaces it on wide screens. They used to be one
 * hand-written `FlowDiagram` in the MDX; a map and a list built from
 * separate literals would drift the moment either was edited.
 *
 * **Every string here is already stated in the case study.** The `note`
 * values are the stack lines from the original diagram, and each `role` is
 * drawn from that diagram's own description sentence — "the client
 * application talks to a backend that owns authentication, the opportunity
 * data model with per-user row-level security, and a set of server-side
 * functions; those functions call model APIs, external research sources, and
 * document generation, then write results back into the opportunity
 * workspace, which the client reads."
 *
 * TODO(content): Louie may want richer per-layer detail — what each edge
 * function actually does, which model APIs, which research sources. None of
 * that is in the spec, so none of it is guessed here (spec §29, §39.5).
 */

export type ArchitectureLayer = {
  id: string;
  label: string;
  /** The stack line, where the case study states one. */
  note?: string;
  /** What this layer does, in the diagram's own terms. */
  role: string;
  /** Draws the eye: the workspace and the write-back close the loop. */
  emphasis?: boolean;
  /** Canvas position. Hand-placed — eight nodes do not need a layout engine. */
  position: { x: number; y: number };
};

export type ArchitectureLink = {
  from: string;
  to: string;
  /** Routes the feedback edges around the spine rather than through it. */
  side?: "left" | "right";
};

export const ARCHITECTURE_LAYERS: readonly ArchitectureLayer[] = [
  {
    id: "client",
    label: "Client application",
    note: "Vite · React · TypeScript · Tailwind · shadcn/ui",
    role: "Talks to the backend, and reads the opportunity workspace.",
    position: { x: 232, y: 0 },
  },
  {
    id: "auth",
    label: "Authentication and access control",
    note: "Row-level security per user",
    role: "Owned by the backend. Scopes every row to the user it belongs to.",
    position: { x: 232, y: 112 },
  },
  {
    id: "data",
    label: "Opportunity data model",
    note: "Supabase · Postgres · RLS",
    role: "The workspace itself — what every other layer reads from and writes to.",
    emphasis: true,
    position: { x: 232, y: 224 },
  },
  {
    id: "functions",
    label: "Server-side functions",
    note: "Deno edge functions",
    role: "Where the backend's work happens. Calls out, then writes back.",
    position: { x: 232, y: 336 },
  },
  {
    id: "models",
    label: "Model APIs",
    role: "Called by the server-side functions.",
    position: { x: 0, y: 452 },
  },
  {
    id: "research",
    label: "External research",
    role: "Called by the server-side functions.",
    position: { x: 232, y: 452 },
  },
  {
    id: "documents",
    label: "Document generation",
    role: "Called by the server-side functions.",
    position: { x: 464, y: 452 },
  },
  {
    id: "writeback",
    label: "Results written back to the workspace",
    role: "Closes the loop: results land in the workspace, and the client reads them.",
    emphasis: true,
    position: { x: 232, y: 568 },
  },
];

export const ARCHITECTURE_LINKS: readonly ArchitectureLink[] = [
  { from: "client", to: "auth" },
  { from: "auth", to: "data" },
  { from: "data", to: "functions" },
  { from: "functions", to: "models" },
  { from: "functions", to: "research" },
  { from: "functions", to: "documents" },
  { from: "models", to: "writeback" },
  { from: "research", to: "writeback" },
  { from: "documents", to: "writeback" },
  // The loop the description names: results land in the workspace, and the
  // client reads them back out.
  { from: "writeback", to: "data", side: "right" },
  { from: "data", to: "client", side: "left" },
];

/** Plain-language equivalent, shown to everyone (spec §26). */
export const ARCHITECTURE_DESCRIPTION =
  "The client application talks to a backend that owns authentication, the opportunity data model with per-user row-level security, and a set of server-side functions. Those functions call model APIs, external research sources, and document generation, then write results back into the opportunity workspace, which the client reads.";
