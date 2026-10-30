import { cn } from "@/lib/utils";

export type CaseStudyBriefContent = {
  problem: string;
  did: string;
  result: string;
};

const ROWS = [
  { key: "problem", label: "Problem" },
  { key: "did", label: "What I did" },
  { key: "result", label: "Result" },
] as const;

/**
 * The case study in three lines (Plan 045): the problem, what Louie did,
 * and the result, before the hero image. A hiring manager who reads only
 * this still leaves with the story. Every line restates the case study;
 * the brief adds no claim of its own.
 *
 * Stacked redesign: each row is the text with its label in the narrow
 * column beside it, ruled like the homepage list. The label leads in the
 * markup (a `dt` comes before its `dd`) and moves to the side on wide
 * canvases.
 */
function CaseStudyBrief({ brief, className }: { brief: CaseStudyBriefContent; className?: string }) {
  return (
    <dl className={cn("border-t border-border-default", className)}>
      {ROWS.map((row) => (
        <div key={row.key} className="stacked-row border-b border-border-default py-5">
          <dt className="stacked-label order-2 text-meta text-foreground-quiet">{row.label}</dt>
          <dd className="text-body text-foreground-muted">{brief[row.key]}</dd>
        </div>
      ))}
    </dl>
  );
}

export { CaseStudyBrief };
