import type { ComponentPropsWithoutRef } from "react";

/** Real text and native wrapping, with per-word masks measured into visual lines. */
export function RevealHeading({ as: Heading = "h2", children, ...props }: {
  as?: "h1" | "h2";
  children: string;
} & Omit<ComponentPropsWithoutRef<"h2">, "children">) {
  return <Heading {...props} aria-label={children}>
    <span aria-hidden="true">{children.split(" ").map((word, index) =>
      <span key={index}><span className="motion-word-mask"><span data-motion-word className="inline-block">{word}</span></span>{" "}</span>
    )}</span>
  </Heading>;
}
