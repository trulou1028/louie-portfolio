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
 */
function CaseStudyBrief({ brief, className }: { brief: CaseStudyBriefContent; className?: string }) {
  return (
    <dl className={cn("@container rounded-lg border border-border-subtle bg-surface p-5 sm:p-6", className)}>
      {ROWS.map((row, index) => (
        <div
          key={row.key}
          className={cn(
            "grid gap-1 @xl:grid-cols-[8.5rem_minmax(0,1fr)] @xl:gap-6",
            index > 0 && "mt-4 border-t border-border-subtle pt-4",
          )}
        >
          <dt className="text-body-sm font-semibold text-foreground @xl:pt-0.5">{row.label}</dt>
          <dd className="text-body text-foreground-muted">{brief[row.key]}</dd>
        </div>
      ))}
    </dl>
  );
}

export { CaseStudyBrief };
