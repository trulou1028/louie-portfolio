import Image from "next/image";

import { cn } from "@/lib/utils";

/**
 * A row of phone screens (Plan 049), for flows designed at phone size.
 *
 * Each screen keeps its full height, so a long screen reads top to bottom
 * instead of being cropped to a device outline. Two across on a phone,
 * three from `sm`. Each figure has its own caption, so the step it shows is
 * readable without the image.
 */
type PhoneScreen = { src: string; alt: string; width: number; height: number; caption: string };

function PhoneScreens({ screens, className }: { screens: readonly PhoneScreen[]; className?: string }) {
  return (
    <div className={cn("mt-8 grid grid-cols-2 items-start gap-x-4 gap-y-8 sm:grid-cols-3", className)}>
      {screens.map((screen) => (
        <figure key={screen.src}>
          <Image
            src={screen.src}
            alt={screen.alt}
            width={screen.width}
            height={screen.height}
            sizes="(min-width: 640px) 240px, 45vw"
            className="h-auto w-full rounded-panel shadow-shot ring-1 ring-foreground/10"
          />
          <figcaption className="mt-3 text-body-sm text-foreground-muted">{screen.caption}</figcaption>
        </figure>
      ))}
    </div>
  );
}

export { PhoneScreens };
