import { cn } from "@/lib/utils";

/**
 * A visible marker for a section whose substance only Louie can supply —
 * verified metrics, real research findings, specific product examples.
 *
 * The section itself still has to render: its anchor is part of the deep-link
 * contract that evidence entries and AI navigation depend on (spec §13, §14).
 * So instead of an empty section, or invented filler, the gap is stated
 * plainly.
 *
 * `items` lists exactly what is needed, which doubles as the brief for the
 * person filling it in. Plan 008 sweeps for these before launch — none should
 * survive to production.
 */
type PendingContentProps = {
  /** What is missing, e.g. "Verified usage metrics". */
  summary: string;
  items?: readonly string[];
  className?: string;
};

function PendingContent({ summary, items, className }: PendingContentProps) {
  return (
    <div
      data-pending-content
      className={cn(
        "mt-6 max-w-[68ch] rounded-md border border-dashed border-border-default bg-surface-muted/70 p-5",
        className,
      )}
    >
      <p className="font-mono text-system uppercase text-foreground-muted">
        Content pending
      </p>
      <p className="mt-2 text-body-sm text-foreground">{summary}</p>
      {items?.length ? (
        <ul className="mt-3 flex flex-col gap-1.5">
          {items.map((item) => (
            <li
              key={item}
              className="text-body-sm text-foreground-muted before:mr-2 before:content-['—']"
            >
              {item}
            </li>
          ))}
        </ul>
      ) : null}
    </div>
  );
}

export { PendingContent };
