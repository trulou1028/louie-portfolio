import Image from "next/image";

import { cn } from "@/lib/utils";

/**
 * Louie's line portrait (version M1, picked 2026-10-29), drawn from his
 * photo. Large on the homepage, small at the top of a case study.
 */
function Portrait({ size = "lg", className }: { size?: "lg" | "sm"; className?: string }) {
  return (
    <div className={cn("portrait", size === "lg" ? "-ml-3 w-[9.75rem]" : "-ml-2 w-24", className)}>
      <Image
        src="/portrait/louie.webp"
        width={640}
        height={640}
        alt="A line drawing of Louie: short dark hair, clear glasses, a wide smile, a bead necklace, and a henley shirt."
        sizes={size === "lg" ? "156px" : "96px"}
        preload={size === "lg"}
      />
    </div>
  );
}

export { Portrait };
