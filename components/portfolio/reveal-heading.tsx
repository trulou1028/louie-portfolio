import type { ComponentPropsWithoutRef } from "react";

import { cn } from "@/lib/utils";

/**
 * Real text and native wrapping, with per-word masks measured into visual lines.
 *
 * `quietWords` renders that many leading words in the quieter display color
 * and starts the rest on a new line: the homepage's "Complex workflows." /
 * "Clear decisions." split, where the type itself makes the decision
 * (Plan 037).
 */
export function RevealHeading({ as: Heading = "h2", children, quietWords = 0, ...props }: {
  as?: "h1" | "h2";
  children: string;
  quietWords?: number;
} & Omit<ComponentPropsWithoutRef<"h2">, "children">) {
  const words = children.split(" ");
  return <Heading {...props} aria-label={children}>
    <span aria-hidden="true">{words.map((word, index) =>
      <span key={index} className={cn(index < quietWords && "text-foreground-quiet")}>
        {quietWords > 0 && index === quietWords ? <br /> : null}
        <span className="motion-word-mask"><span data-motion-word className="inline-block">{word}</span></span>{" "}
      </span>
    )}</span>
  </Heading>;
}
