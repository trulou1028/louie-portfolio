import { cn } from "@/lib/utils";

/**
 * Quick facts for a project: role, years, team, platform (Plan 037).
 *
 * Recruiters and hiring managers look for these first, so they sit directly
 * under the title as a ruled row instead of in the body. Values come from
 * `content/work/projects.ts`, which restates only resume-stated facts.
 */
function ProjectMeta({
  items,
  className,
}: {
  items: readonly { label: string; value: string }[];
  className?: string;
}) {
  if (!items.length) return null;

  return (
    <dl className={cn("grid grid-cols-2 gap-x-8 gap-y-4 border-t border-foreground pt-4 sm:grid-cols-[repeat(auto-fit,minmax(9rem,1fr))]", className)}>
      {items.map((item) => (
        <div key={item.label} className="flex flex-col gap-0.5">
          <dt className="text-body-sm text-foreground-muted">{item.label}</dt>
          <dd className="text-body font-semibold text-foreground">{item.value}</dd>
        </div>
      ))}
    </dl>
  );
}

export { ProjectMeta };
