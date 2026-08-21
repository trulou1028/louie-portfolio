import { SectionLabel } from "@/components/system/section-label";
import type { Anchor } from "@/lib/routes";
import { cn } from "@/lib/utils";

/**
 * Case-study navigation (spec §10: "table of contents during a case study").
 *
 * Plain anchor links — no scroll-spy. Highlighting the current section needs
 * client JS and an IntersectionObserver for a decorative gain; the links work
 * without hydration, which matters when JavaScript is unavailable (spec §31).
 */
function TableOfContents({
  anchors,
  className,
}: {
  anchors: readonly Anchor[];
  className?: string;
}) {
  return (
    <nav aria-label="On this page" className={className}>
      <SectionLabel className="mb-3">On this page</SectionLabel>
      <ol className="flex flex-col gap-0.5">
        {anchors.map((anchor) => (
          <li key={anchor.id}>
            <a
              href={`#${anchor.id}`}
              className="focus-ring block rounded-sm px-2 py-1.5 text-body-sm text-foreground-muted transition-colors duration-(--duration-fast) hover:bg-surface-muted hover:text-foreground"
            >
              {anchor.label}
            </a>
          </li>
        ))}
      </ol>
    </nav>
  );
}

/**
 * The same contents, collapsed into a disclosure for narrow screens where the
 * rail is not available (spec §25).
 */
function TableOfContentsInline({
  anchors,
  className,
}: {
  anchors: readonly Anchor[];
  className?: string;
}) {
  return (
    <details
      className={cn(
        "rounded-md border border-border-subtle bg-surface-muted px-4 py-3 xl:hidden",
        className,
      )}
    >
      <summary className="focus-ring cursor-pointer rounded-sm font-mono text-label uppercase text-foreground-muted">
        On this page
      </summary>
      <ol className="mt-3 flex flex-col gap-0.5">
        {anchors.map((anchor) => (
          <li key={anchor.id}>
            <a
              href={`#${anchor.id}`}
              className="focus-ring block rounded-sm py-1.5 text-body-sm text-foreground-muted hover:text-foreground"
            >
              {anchor.label}
            </a>
          </li>
        ))}
      </ol>
    </details>
  );
}

export { TableOfContents, TableOfContentsInline };
