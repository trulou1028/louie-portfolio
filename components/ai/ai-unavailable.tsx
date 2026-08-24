import Link from "next/link";
import { Sparkles } from "lucide-react";

import { Action } from "@/components/system/action";
import { Surface } from "@/components/system/surface";

/**
 * Shown when the AI backend is not configured (spec §31).
 *
 * Copy is spec §31 verbatim. Rendered on the server when the key is absent,
 * so the AI runtime never loads at all — the rest of the portfolio stays
 * fully usable and no client JavaScript is shipped for a feature that cannot
 * run.
 */
function AiUnavailable() {
  return (
    <Surface variant="ai" radius="panel" className="p-6 sm:p-8">
      <div className="flex items-center gap-2.5">
        <Sparkles aria-hidden="true" className="size-4 text-accent" />
        <h2 className="text-heading-md text-foreground">Ask Louie</h2>
      </div>

      <p className="mt-3 max-w-[62ch] text-body text-foreground-muted">
        AI Louie is temporarily unavailable. You can still explore all of
        Louie&rsquo;s work below.
      </p>

      <div className="mt-6 flex flex-wrap gap-3">
        <Action variant="secondary" size="sm" render={<Link href="/work/offboard" />}>
          Read the Offboard case study
        </Action>
        <Action variant="secondary" size="sm" render={<Link href="/work/flexi" />}>
          Read the Flexi case study
        </Action>
      </div>
    </Surface>
  );
}

export { AiUnavailable };
