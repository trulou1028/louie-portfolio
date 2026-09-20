// INTERNAL: remove or protect before launch (spec §35 Phase 1).
// Plan 008 verifies this route is absent from production.
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Compass } from "lucide-react";

import { Action, InlineAction } from "@/components/system/action";
import { InlineLink } from "@/components/system/inline-link";
import { SectionLabel } from "@/components/system/section-label";
import { StatusDot } from "@/components/system/status-dot";
import { Surface } from "@/components/system/surface";
import { SystemLabel } from "@/components/system/system-label";
import { NavItem } from "@/components/app-shell/nav-item";
import { navItemVariants } from "@/components/app-shell/nav-item-variants";
import { Metric } from "@/components/portfolio/metric";
import { OutcomeChart } from "@/components/portfolio/outcome-chart";
import { PromptChip } from "@/components/ai/prompt-chip";

export const metadata: Metadata = {
  title: "Design system",
  robots: { index: false, follow: false },
};

const COLOR_TOKENS = [
  ["--canvas", "bg-canvas"],
  ["--surface", "bg-surface"],
  ["--surface-muted", "bg-surface-muted"],
  ["--surface-raised", "bg-surface-raised"],
  ["--foreground", "bg-foreground"],
  ["--foreground-muted", "bg-foreground-muted"],
  ["--foreground-subtle", "bg-foreground-subtle"],
  ["--border-subtle", "bg-border-subtle"],
  ["--border-default", "bg-border-default"],
  ["--border-strong", "bg-border-strong"],
  ["--accent", "bg-accent"],
  ["--accent-hover", "bg-accent-hover"],
  ["--accent-muted", "bg-accent-muted"],
  ["--accent-soft", "bg-accent-soft"],
  ["--accent-foreground", "bg-accent-foreground"],
  ["--danger", "bg-danger"],
  ["--success", "bg-success"],
] as const;

const TYPE_SCALE = [
  ["display-xl", "text-display-xl font-serif"],
  ["display-lg", "text-display-lg font-serif"],
  ["heading-xl", "text-heading-xl"],
  ["heading-lg", "text-heading-lg"],
  ["heading-md", "text-heading-md"],
  ["body-lg", "text-body-lg"],
  ["body", "text-body"],
  ["body-sm", "text-body-sm"],
  ["label", "text-label font-mono uppercase"],
  ["system", "text-system font-mono uppercase"],
] as const;

const RADII = [
  ["xs · 6px", "rounded-xs"],
  ["sm · 10px", "rounded-sm"],
  ["md · 14px", "rounded-md"],
  ["lg · 18px", "rounded-lg"],
  ["xl · 24px", "rounded-xl"],
  ["panel · 28px", "rounded-panel"],
] as const;

const DURATIONS = [
  ["instant · 90ms", "duration-(--duration-instant)"],
  ["fast · 160ms", "duration-(--duration-fast)"],
  ["standard · 240ms", "duration-(--duration-standard)"],
  ["deliberate · 380ms", "duration-(--duration-deliberate)"],
] as const;

function Row({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="border-t border-border-subtle py-12">
      <SectionLabel className="mb-6">{title}</SectionLabel>
      {children}
    </section>
  );
}

export default function DesignSystemPage() {
  // Internal review surface only. Absent in production rather than merely
  // unlinked, so it cannot be found by guessing the URL (spec §35 Phase 1).
  if (process.env.NODE_ENV === "production") notFound();

  return (
    <div className="h-full overflow-y-auto mx-auto w-full max-w-[900px] px-6 py-16">
      <SystemLabel tone="accent">Internal</SystemLabel>
      <h1 className="mt-4 font-serif text-display-lg">Design system</h1>
      <p className="mt-3 max-w-[65ch] text-body text-foreground-muted">
        Every primitive, in every variant. Not linked from navigation and not
        indexed; removed before launch.
      </p>

      <Row title="Color tokens">
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
          {COLOR_TOKENS.map(([name, cls]) => (
            <div key={name} className="flex flex-col gap-2">
              <div
                className={`h-14 rounded-sm border border-border-subtle ${cls}`}
              />
              <code className="font-mono text-system text-foreground-muted">
                {name}
              </code>
            </div>
          ))}
        </div>
      </Row>

      <Row title="Type scale">
        <div className="flex flex-col gap-6">
          {TYPE_SCALE.map(([name, cls]) => (
            <div key={name} className="flex flex-col gap-1">
              <code className="font-mono text-system text-foreground-muted">
                {name}
              </code>
              <p className={cls}>I design AI products and build them.</p>
            </div>
          ))}
        </div>
      </Row>

      <Row title="Surfaces">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {(["default", "muted", "raised", "interactive", "ai"] as const).map(
            (variant) => (
              <Surface key={variant} variant={variant} className="p-5">
                <code className="font-mono text-system uppercase text-foreground-muted">
                  {variant}
                </code>
                <p className="mt-2 text-body-sm text-foreground-muted">
                  Border first, background second, shadow last.
                </p>
              </Surface>
            ),
          )}
        </div>
        <p className="mt-4 text-body-sm text-foreground-muted">
          Composition:{" "}
          <code className="font-mono text-system">render={"{<Link />}"}</code>{" "}
          swaps the element without losing styling.
        </p>
        <Surface
          variant="interactive"
          className="mt-3 block p-5"
          render={<Link href="/work" />}
        >
          <span className="text-body-sm">
            This entire surface is a link — tab to it.
          </span>
        </Surface>
      </Row>

      <Row title="Actions">
        <div className="flex flex-wrap items-center gap-3">
          <Action variant="primary">View selected work</Action>
          <Action variant="secondary">Ask Louie</Action>
          <Action variant="ghost">Skip</Action>
          <Action variant="primary" disabled>
            Disabled
          </Action>
        </div>
        <div className="mt-4 flex flex-wrap items-center gap-3">
          <Action size="sm">Small · 36px</Action>
          <Action size="md">Medium · 44px</Action>
          <Action size="lg">Large · 52px</Action>
        </div>
        <div className="mt-4">
          <InlineAction>Open evidence →</InlineAction>
        </div>
      </Row>

      <Row title="Labels, links, status">
        <div className="flex flex-wrap items-center gap-3">
          <SystemLabel>AI system</SystemLabel>
          <SystemLabel tone="accent">Tool call</SystemLabel>
          <SystemLabel tone="quiet">Prototype</SystemLabel>
        </div>
        <div className="mt-5 flex flex-col gap-3">
          <StatusDot status="available" label="Open to new roles" />
          <StatusDot status="selective" label="Selectively available" />
          <StatusDot status="unavailable" label="Not currently available" />
        </div>
        <p className="mt-5 max-w-[65ch] text-body text-foreground-muted">
          Prose with an <InlineLink href="/work">internal link</InlineLink> and
          an <InlineLink href="https://vercel.com">external link</InlineLink>{" "}
          that announces itself.
        </p>
      </Row>

      <Row title="Navigation">
        <p className="mb-4 max-w-[65ch] text-body-sm text-foreground-muted">
          The active state is derived from the pathname, so it cannot be forced
          here — this route is intentionally absent from the typed route list.
          The first item below shows the active treatment statically.
        </p>
        <Surface className="max-w-[240px] p-2">
          <nav aria-label="Design system sample" className="flex flex-col gap-0.5">
            <span className={navItemVariants({ active: true })}>
              <span
                aria-hidden="true"
                className="absolute left-0 h-4 w-0.5 rounded-full bg-accent"
              />
              <span aria-hidden="true" className="[&_svg]:size-4">
                <Compass />
              </span>
              Active item
            </span>
            <NavItem href="/work" label="Work" />
            <NavItem href="/about" label="About" />
          </nav>
        </Surface>
        <p className="mt-3 text-body-sm text-foreground-muted">
          Sheet size, for mobile:
        </p>
        <Surface className="mt-2 max-w-[280px] p-2">
          <nav
            aria-label="Design system sample large"
            className="flex flex-col gap-0.5"
          >
            <NavItem href="/writing" label="Writing" size="sheet" />
            <NavItem href="/resume" label="Resume" size="sheet" />
          </nav>
        </Surface>
      </Row>

      <Row title="Prompt chips">
        <div className="flex flex-wrap gap-2.5">
          <PromptChip label="Show me Offboard" href="/work/offboard" />
          <PromptChip label="How technical is Louie?" href="/work" />
          <PromptChip label="Tell me about Flexi" href="/work/flexi" />
          <PromptChip
            label="A much longer suggestion that has to wrap cleanly across lines without truncating"
            href="/work"
          />
        </div>
      </Row>

      <Row title="Metrics">
        <div className="flex flex-wrap gap-10">
          <Metric value="—" label="Only ever real, verified numbers" note="spec §13.8" />
          <Metric value="14+" label="Years designing digital products" />
        </div>
      </Row>

      <Row title="Outcome chart">
        <p className="mb-6 max-w-[65ch] text-body-sm text-foreground-muted">
          Recharts, wrapped by <code className="font-mono text-system">
          components/ui/chart.tsx</code>. One series, values written at each
          bar tip, no legend and no value axis. It is not used in any case
          study: both Outcomes sections are still{" "}
          <code className="font-mono text-system">PendingContent</code>,
          because a chart needs verified figures and there are none yet
          (spec §13.8). The numbers below exist only to show the treatment —
          note that <code className="font-mono text-system">source</code> is a
          required prop, so a chart cannot be shipped without one.
        </p>
        <OutcomeChart
          measure="Sample series"
          unit=" units"
          source="Sample data — invented for this gallery, never for a case study"
          description="An illustration of the bar treatment at four categories. Real usage waits on figures Louie can verify."
          data={[
            { label: "Category one", value: 1840 },
            { label: "Category two", value: 1210 },
            { label: "A longer category name", value: 760 },
            { label: "Category four", value: 305 },
          ]}
        />
      </Row>

      <Row title="Radius">
        <div className="flex flex-wrap gap-4">
          {RADII.map(([name, cls]) => (
            <div key={name} className="flex flex-col items-center gap-2">
              <div
                className={`size-20 border border-border-strong bg-surface-muted ${cls}`}
              />
              <code className="font-mono text-system text-foreground-muted">
                {name}
              </code>
            </div>
          ))}
        </div>
      </Row>

      <Row title="Motion">
        <p className="mb-4 max-w-[65ch] text-body-sm text-foreground-muted">
          Hover each tile. All motion is disabled under{" "}
          <code className="font-mono text-system">prefers-reduced-motion</code>.
        </p>
        <div className="flex flex-wrap gap-4">
          {DURATIONS.map(([name, cls]) => (
            <div key={name} className="flex flex-col items-center gap-2">
              <div
                className={`size-20 rounded-md border border-border-subtle bg-surface-muted transition-colors hover:bg-accent-muted ${cls}`}
              />
              <code className="font-mono text-system text-foreground-muted">
                {name}
              </code>
            </div>
          ))}
        </div>
      </Row>
    </div>
  );
}
