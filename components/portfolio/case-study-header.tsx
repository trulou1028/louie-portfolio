import { ProjectMeta } from "@/components/portfolio/project-meta";
import { SectionLabel } from "@/components/system/section-label";
import type { WorkProject } from "@/content/work/projects";

/**
 * The opening of a case study (spec §13, §14). Typography carries it — no
 * hero image, consistent with the homepage.
 */
type CaseStudyHeaderProps = {
  project: WorkProject;
  role?: string | null;
  timeframe?: string | null;
  team?: string | null;
  /** The intellectual tension the study turns on, when there is one. */
  lede?: string;
};

function CaseStudyHeader({
  project,
  role,
  timeframe,
  team,
  lede,
}: CaseStudyHeaderProps) {
  return (
    <header className="pb-12">
      <SectionLabel>{project.name}</SectionLabel>

      <h1 className="mt-5 max-w-[20ch] font-serif text-display-lg text-balance text-foreground">
        {project.title}
      </h1>

      {lede ? (
        <p className="mt-6 max-w-[62ch] text-body-lg text-foreground-muted">
          {lede}
        </p>
      ) : null}

      <ul className="mt-7 flex flex-wrap gap-x-2 gap-y-1.5">
        {project.tags.map((tag) => (
          <li
            key={tag}
            className="rounded-xs border border-border-subtle bg-surface-muted px-2 py-0.5 text-body-sm text-foreground-muted"
          >
            {tag}
          </li>
        ))}
      </ul>

      <ProjectMeta
        role={role}
        timeframe={timeframe}
        team={team}
        className="mt-8"
      />
    </header>
  );
}

export { CaseStudyHeader };
