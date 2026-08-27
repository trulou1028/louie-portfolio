"use client"

import * as React from "react"
import { ResponsiveContainer, Tooltip as RechartsTooltip } from "recharts"

import { cn } from "@/lib/utils"

/**
 * A reduced version of shadcn's `chart` primitive.
 *
 * Written by hand rather than pulled with `pnpm shadcn add`: this environment
 * cannot reach `ui.shadcn.com`. It keeps upstream's public shape — a `config`
 * object keyed by `dataKey`, `--color-<key>` CSS variables, a `ChartContainer`
 * that owns the responsive box, and a themed tooltip — so replacing it with
 * the real registry component later is a drop-in, but it carries only the
 * pieces this portfolio uses. No legend component: every chart here is a
 * single series, which needs no legend box.
 */

export type ChartConfig = Record<
  string,
  {
    label: string
    /** Any CSS color. Use a token — `hsl(var(--accent))`, never a raw hex. */
    color?: string
  }
>

const ChartContext = React.createContext<ChartConfig | null>(null)

function useChartConfig() {
  const context = React.useContext(ChartContext)
  if (!context) {
    throw new Error("useChartConfig must be used within a <ChartContainer />")
  }
  return context
}

/** Emits the `--color-<key>` custom properties, scoped to this chart only. */
function ChartStyle({ id, config }: { id: string; config: ChartConfig }) {
  const declarations = Object.entries(config)
    .filter(([, item]) => item.color)
    .map(([key, item]) => `  --color-${key}: ${item.color};`)
    .join("\n")

  if (!declarations) return null

  return (
    <style
      dangerouslySetInnerHTML={{
        __html: `[data-chart="${id}"] {\n${declarations}\n}`,
      }}
    />
  )
}

function ChartContainer({
  config,
  className,
  children,
  ...props
}: React.ComponentProps<"div"> & {
  config: ChartConfig
  children: React.ComponentProps<typeof ResponsiveContainer>["children"]
}) {
  const uid = React.useId()
  const id = `chart-${uid.replace(/:/g, "")}`

  return (
    <ChartContext.Provider value={config}>
      <div
        data-slot="chart"
        data-chart={id}
        className={cn(
          // Recessive axes and grid: one step off the surface, hairline,
          // never dashed.
          "[&_.recharts-cartesian-axis-tick_text]:fill-foreground-muted [&_.recharts-cartesian-axis-tick_text]:text-body-sm",
          "[&_.recharts-cartesian-grid_line]:stroke-border-subtle",
          "[&_.recharts-surface]:outline-none",
          className,
        )}
        {...props}
      >
        <ChartStyle id={id} config={config} />
        <ResponsiveContainer>{children}</ResponsiveContainer>
      </div>
    </ChartContext.Provider>
  )
}

const ChartTooltip = RechartsTooltip

type TooltipPayloadItem = {
  dataKey?: string | number
  name?: string | number
  value?: number | string
  payload?: Record<string, unknown>
}

/**
 * The hover card. Text wears text tokens; the series colour appears only as
 * the swatch beside it, never as the label's own colour.
 */
function ChartTooltipContent({
  active,
  payload,
  label,
  formatter,
}: {
  active?: boolean
  payload?: TooltipPayloadItem[]
  label?: React.ReactNode
  /** Formats the value, e.g. thousands separators or a unit. */
  formatter?: (value: number | string) => string
}) {
  const config = useChartConfig()

  if (!active || !payload?.length) return null

  return (
    <div className="rounded-md border border-border-default bg-surface-raised px-3 py-2 shadow-soft">
      {label ? (
        <p className="text-body-sm font-medium text-foreground">{label}</p>
      ) : null}
      <ul className="mt-1 flex flex-col gap-1">
        {payload.map((item, i) => {
          const key = String(item.dataKey ?? item.name ?? i)
          const entry = config[key]
          return (
            <li
              key={key}
              className="flex items-center gap-2 text-body-sm text-foreground-muted"
            >
              <span
                aria-hidden="true"
                className="size-2 shrink-0 rounded-xs"
                style={{ background: `var(--color-${key})` }}
              />
              <span>{entry?.label ?? key}</span>
              <span className="ml-auto font-mono text-system text-foreground">
                {formatter && item.value !== undefined
                  ? formatter(item.value)
                  : item.value}
              </span>
            </li>
          )
        })}
      </ul>
    </div>
  )
}

export { ChartContainer, ChartStyle, ChartTooltip, ChartTooltipContent }
