import * as React from "react";

import { cn } from "@/lib/utils";

/**
 * A single verified outcome: the figure, and what it measures (spec §13.8).
 *
 * Only ever render this with a number Louie has confirmed. The spec is
 * explicit — if a metric is not known, omit it rather than estimating
 * (spec §13.8, §29).
 */
type MetricProps = React.ComponentPropsWithoutRef<"div"> & {
  value: string;
  label: string;
  /** Optional qualifier, e.g. the measurement window or source. */
  note?: string;
};

function Metric({ className, value, label, note, ...props }: MetricProps) {
  return (
    <div
      data-slot="metric"
      className={cn("flex flex-col gap-1", className)}
      {...props}
    >
      <span className="font-serif text-heading-lg text-foreground">
        {value}
      </span>
      <span className="text-body-sm text-foreground-muted">{label}</span>
      {note ? (
        <span className="font-mono text-system uppercase text-foreground-muted">
          {note}
        </span>
      ) : null}
    </div>
  );
}

export { Metric };
