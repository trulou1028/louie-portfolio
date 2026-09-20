import Image from "next/image";
import type { WorkProject } from "@/content/work/projects";

/** Original supplied wordmarks, displayed at their intrinsic proportions. */
export function ProjectBrand({ project }: { project: WorkProject }) {
  const offboard = project.slug === "offboard";
  return (
    <div className="flex min-h-8 flex-wrap items-center gap-4" aria-label={project.name}>
      <Image
        src={offboard ? "/brands/offboard.png" : "/brands/ck12.svg"}
        alt={offboard ? "Offboard" : "CK-12"}
        width={offboard ? 1726 : 74}
        height={offboard ? 353 : 26}
        className={offboard ? "h-auto w-32 object-contain" : "h-auto w-20 object-contain"}
      />
      {!offboard && <span className="border-l border-border-subtle pl-4 text-body-sm text-foreground-muted">{project.name.replace("CK-12 ", "")}</span>}
    </div>
  );
}
