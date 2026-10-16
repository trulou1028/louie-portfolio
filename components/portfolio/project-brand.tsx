import Image from "next/image";
import type { WorkProject } from "@/content/work/projects";
import { cn } from "@/lib/utils";

/**
 * Original supplied wordmarks, displayed at their intrinsic proportions.
 *
 * Offboard's wordmark is white lettering, and CK-12's is drawn for white. So
 * each sits on a chip of the background it was drawn for whenever the
 * surrounding surface would hide it: Offboard on its own charcoal away from its
 * plate, CK-12 on white when it sits on a colored plate (Plan 037).
 */
export function ProjectBrand({ project, onPlate = false, className }: { project: WorkProject; onPlate?: boolean; className?: string }) {
  const offboard = project.plate === "offboard";
  const chip = offboard ? !onPlate : onPlate;
  // The product name beside the wordmark, when it is not the brand itself.
  const product = project.slug === "offboard" ? null : project.name.replace(/^(CK-12|Offboard) /, "");

  return (
    <div className={cn("flex min-h-8 flex-wrap items-center gap-4", className)} aria-label={project.name}>
      <span className={cn("inline-flex items-center gap-3", chip && "rounded-sm px-2.5 py-1.5", chip && (offboard ? "bg-plate-offboard" : "bg-surface"))}>
        <Image
          src={offboard ? "/brands/offboard.png" : "/brands/ck12.svg"}
          alt={offboard ? "Offboard" : "CK-12"}
          width={offboard ? 1726 : 74}
          height={offboard ? 353 : 26}
          className={offboard ? "h-auto w-28 object-contain" : "h-auto w-18 object-contain"}
        />
        {product && onPlate ? <span className={cn("border-l pl-3 text-body-sm font-medium", offboard ? "border-plate-offboard-muted/40 text-plate-offboard-ink" : "border-border-default text-foreground")}>{product}</span> : null}
      </span>
      {product && !onPlate ? <span className="border-l border-border-subtle pl-4 text-body-sm text-foreground-muted">{product}</span> : null}
    </div>
  );
}
