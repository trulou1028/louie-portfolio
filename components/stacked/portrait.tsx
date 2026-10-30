import Image from "next/image";

import { cn } from "@/lib/utils";

/**
 * Louie's pen doodle portrait (supplied by Louie, 2026-10-30). Large on
 * the homepage, small at the top of a case study.
 *
 * The file is ink on a transparent ground, so it sits on the paper in
 * every browser. It used to be ink on white with a CSS multiply blend,
 * which iPhone browsers did not apply: the white showed as a box.
 */
function Portrait({ size = "lg", className }: { size?: "lg" | "sm"; className?: string }) {
  return (
    <div className={cn("portrait", size === "lg" ? "-ml-3 w-[9.75rem]" : "-ml-2 w-24", className)}>
      <Image
        src="/portrait/louie-doodle.webp"
        width={640}
        height={640}
        alt="A pen doodle of Louie: short spiky dark hair, clear glasses, a wide smile with stubble, a bead necklace, and a hooded sweatshirt."
        sizes={size === "lg" ? "156px" : "96px"}
        preload={size === "lg"}
      />
    </div>
  );
}

export { Portrait };
