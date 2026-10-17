import Image from "next/image";

import { cn } from "@/lib/utils";

/**
 * LUMO's face, from the Offboard app (October 2026). Decorative wherever
 * the word "LUMO" sits next to it, which is everywhere on this site, so it
 * carries no alt text by default.
 */
export const LUMO_FACE = { src: "/work/lumo/face.webp", width: 512, height: 512 } as const;

export function LumoFace({ className, label }: { className?: string; label?: string }) {
  return (
    <Image
      src={LUMO_FACE.src}
      width={LUMO_FACE.width}
      height={LUMO_FACE.height}
      alt={label ?? ""}
      aria-hidden={label ? undefined : true}
      sizes="64px"
      className={cn("size-7 shrink-0 select-none object-contain", className)}
    />
  );
}
