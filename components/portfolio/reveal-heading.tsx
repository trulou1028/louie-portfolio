import type { ComponentPropsWithoutRef } from "react";

import { cn } from "@/lib/utils";

/**
 * Real text and native wrapping, with per-word masks measured into visual lines.
 *
 * `quietWords` renders that many leading words in the quieter display color:
 * the homepage's "Complex workflows." / "Clear decisions." split, where the
 * type itself makes the decision (Plan 037).
 *
 * `markLabel` draws an amber decision mark around the remaining words, the
 * same redline the case studies use on screenshots (Plan 038). The label is
 * decorative; the heading's accessible name stays the plain sentence.
 *
 * `breakAfterQuiet` starts the loud words on a new line.
 */
export function RevealHeading({ as: Heading = "h2", children, quietWords = 0, breakAfterQuiet = true, markLabel, quietClassName = "text-foreground-quiet", ...props }: {
  as?: "h1" | "h2";
  children: string;
  quietWords?: number;
  breakAfterQuiet?: boolean;
  markLabel?: string;
  /** Color for the quiet words; over a photo the default gray would fail contrast. */
  quietClassName?: string;
} & Omit<ComponentPropsWithoutRef<"h2">, "children">) {
  const words = children.split(" ");
  const renderWord = (word: string, index: number) => (
    <span key={index} className={cn(index < quietWords && quietClassName)}>
      {quietWords > 0 && breakAfterQuiet && !markLabel && index === quietWords ? <br /> : null}
      <span className="motion-word-mask"><span data-motion-word className="inline-block">{word}</span></span>
      {index < words.length - 1 && !(markLabel && index === quietWords - 1) ? " " : null}
    </span>
  );

  if (markLabel && quietWords > 0) {
    return <Heading {...props} aria-label={children}>
      <span aria-hidden="true">
        {words.slice(0, quietWords).map(renderWord)}
        {breakAfterQuiet ? <br /> : " "}
        <span className="headline-mark">
          <span className="headline-mark-tag">{markLabel}</span>
          {words.slice(quietWords).map((word, i) => renderWord(word, i + quietWords))}
        </span>
      </span>
    </Heading>;
  }

  return <Heading {...props} aria-label={children}>
    <span aria-hidden="true">{words.map(renderWord)}</span>
  </Heading>;
}
