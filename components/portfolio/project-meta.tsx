import { cn } from "@/lib/utils";

/**
 * The facts row beneath a case-study title: role, timeframe, and what Louie
 * personally did (spec §13, §29).
 *
 * Every field is optional and simply omitted when unknown — an empty "Role"
 * label with nothing after it would be worse than no row at all.
 */
type ProjectMetaProps = {
  role?: string | null;
  timeframe?: string | null;
  team?: string | null;
  className?: string;
};

function Item({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex flex-col gap-1">
      <dt className="font-mono text-system uppercase text-foreground-muted">
        {label}
      </dt>
      <dd className="text-body-sm text-foreground">{value}</dd>
    </div>
  );
}

function ProjectMeta({ role, timeframe, team, className }: ProjectMetaProps) {
  if (!role && !timeframe && !team) return null;

  return (
    <dl className={cn("flex flex-wrap gap-x-10 gap-y-4", className)}>
      {role ? <Item label="Role" value={role} /> : null}
      {timeframe ? <Item label="Timeframe" value={timeframe} /> : null}
      {team ? <Item label="Team" value={team} /> : null}
    </dl>
  );
}

export { ProjectMeta };
