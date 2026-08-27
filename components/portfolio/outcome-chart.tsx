"use client";

import * as React from "react";
import { Bar, BarChart, LabelList, XAxis, YAxis } from "recharts";

import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart";
import { cn } from "@/lib/utils";

/**
 * A verified outcome, plotted (spec §13.8, §26).
 *
 * The same rule that governs `Metric` governs this: **only ever render it with
 * figures Louie has confirmed.** `source` is required rather than optional
 * precisely so a chart cannot be dropped into a case study without someone
 * naming where its numbers came from — spec §29 and §38 rule out plausible
 * placeholder data, and a chart makes invented numbers look more authoritative
 * than prose ever could.
 *
 * Form: a horizontal bar chart, which is the right shape for comparing a few
 * labelled magnitudes in a 760px column — category names get a full line of
 * horizontal space instead of being turned on their side. One series, so:
 * no legend (the caption names what is plotted), values written at each bar
 * tip, and therefore no value axis or gridlines to restate them.
 *
 * The SVG is `aria-hidden`; the accessible equivalent is a real table, which
 * is also what a screen reader and a text browser get. That mirrors how
 * `SystemDiagram` works — the structure IS text.
 */

export type OutcomeDatum = {
  label: string;
  value: number;
  /** Optional qualifier surfaced on hover, e.g. the measurement window. */
  note?: string;
};

type OutcomeChartProps = {
  /** What the bars measure, e.g. "Application packets". Names the series. */
  measure: string;
  data: readonly OutcomeDatum[];
  /**
   * Where these figures come from — an analytics dashboard, a report, Louie
   * directly. Required: see the note above.
   */
  source: string;
  /** The plain-language equivalent shown to everyone (spec §26). */
  description: string;
  /** Appended to each value in labels and the table, e.g. "%" or " sessions". */
  unit?: string;
  className?: string;
};

/** Reserve room for the longest category name, within sane bounds. */
function axisWidth(data: readonly OutcomeDatum[]) {
  const longest = data.reduce((n, d) => Math.max(n, d.label.length), 0);
  return Math.min(200, Math.max(80, longest * 7.5));
}

function OutcomeChart({
  measure,
  data,
  source,
  description,
  unit = "",
  className,
}: OutcomeChartProps) {
  const config = {
    value: { label: measure, color: "hsl(var(--accent))" },
  } satisfies ChartConfig;

  const format = React.useCallback(
    (value: number | string) => `${Number(value).toLocaleString()}${unit}`,
    [unit],
  );

  // Descending, so the comparison the chart exists to make reads top-down.
  const sorted = [...data].sort((a, b) => b.value - a.value);

  return (
    <figure className={cn("mt-8", className)}>
      <div className="rounded-lg border border-border-subtle bg-surface-muted/60">
        <div className="border-b border-border-subtle px-5 py-4 sm:px-6">
          <p className="font-mono text-label uppercase text-foreground-muted">
            {measure}
          </p>
        </div>

        <div className="px-5 py-5 sm:px-6 sm:py-6">
          {/* The equivalent, not a fallback: it is in the DOM either way. */}
          <table className="sr-only">
            <caption>{`${measure}. ${description}`}</caption>
            <thead>
              <tr>
                <th scope="col">Category</th>
                <th scope="col">{measure}</th>
              </tr>
            </thead>
            <tbody>
              {sorted.map((d) => (
                <tr key={d.label}>
                  <th scope="row">{d.label}</th>
                  <td>{`${format(d.value)}${d.note ? ` (${d.note})` : ""}`}</td>
                </tr>
              ))}
            </tbody>
          </table>

          <ChartContainer
            aria-hidden="true"
            config={config}
            // 44px a row keeps a <=24px bar with air around it, plus room
            // for the tip label.
            style={{ height: sorted.length * 44 + 8 }}
            className="w-full"
          >
            <BarChart
              accessibilityLayer
              layout="vertical"
              data={sorted}
              margin={{ left: 0, right: 56, top: 0, bottom: 0 }}
            >
              {/* Every value is written at its tip, so the value axis and its
                  gridlines would only restate them. */}
              <XAxis type="number" dataKey="value" hide />
              <YAxis
                type="category"
                dataKey="label"
                width={axisWidth(sorted)}
                tickLine={false}
                axisLine={false}
                tickMargin={8}
              />
              <ChartTooltip
                cursor={false}
                content={<ChartTooltipContent formatter={format} />}
              />
              <Bar
                dataKey="value"
                fill="var(--color-value)"
                // Square at the baseline, 4px rounded at the data end.
                radius={[0, 4, 4, 0]}
                maxBarSize={24}
              >
                <LabelList
                  dataKey="value"
                  position="right"
                  offset={10}
                  // Recharts hands the label renderer a possibly-undefined
                  // value; `format` itself stays strictly typed.
                  formatter={(value) =>
                    value === undefined || value === null
                      ? ""
                      : format(value as number | string)
                  }
                  className="fill-foreground text-body-sm"
                />
              </Bar>
            </BarChart>
          </ChartContainer>
        </div>
      </div>

      <figcaption className="mt-3 max-w-[68ch] text-body-sm text-foreground-muted">
        {description}{" "}
        <span className="text-foreground-subtle">Source: {source}.</span>
      </figcaption>
    </figure>
  );
}

export { OutcomeChart };
