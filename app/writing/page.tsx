import type { Metadata } from "next";
import Link from "next/link";

import { Canvas } from "@/components/app-shell/contextual-rail";
import { Action } from "@/components/system/action";
import { SectionLabel } from "@/components/system/section-label";

export const metadata: Metadata = {
  title: "Writing",
  description: "Notes on AI product design, systems, and design engineering.",
};

/**
 * Writing (spec §4, §28).
 *
 * Nothing is published yet. The empty state says so in plain language — spec
 * §28 rules out lorem ipsum and placeholder articles, and a fake post list
 * would be worse than an honest blank page.
 */
export default function WritingIndex() {
  return (
    <Canvas>
      <div className="max-w-[760px]">
        <SectionLabel>Writing</SectionLabel>
        <h1 className="mt-5 max-w-[18ch] font-serif text-display-lg text-balance text-foreground">
          Notes on building AI products
        </h1>

        <p className="mt-6 max-w-[62ch] text-body-lg text-foreground-muted">
          Nothing published here yet. Until there is, the case studies carry the
          thinking — they are written as arguments rather than walkthroughs.
        </p>

        <div className="mt-9 flex flex-wrap gap-3">
          <Action render={<Link href="/work/offboard" />}>
            Read the Offboard case study
          </Action>
          <Action variant="secondary" render={<Link href="/work/flexi" />}>
            Read the Flexi case study
          </Action>
        </div>
      </div>
    </Canvas>
  );
}
