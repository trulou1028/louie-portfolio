"use client";

import { motion } from "motion/react";
import { Link2 } from "lucide-react";

import { LumoFace } from "@/components/portfolio/lumo/lumo-face";
import { usePlay } from "@/components/portfolio/lumo/use-play";
import { cn } from "@/lib/utils";

/**
 * The audit's main finding, as one turn played twice: before, a classifier
 * replaced the answer with a tracker card; after, LUMO answers. An
 * illustration of the pattern the audit describes, not a product screen.
 * The member's message is a paraphrase. Reply text is drawn as lines, so no
 * reply is invented.
 */
function Bubble() {
  return (
    <p className="ml-auto max-w-[17rem] rounded-field rounded-br-xs bg-surface-raised px-4 py-3 text-body-sm text-foreground">
      Help me write a cover letter for this job.
      <span className="mt-2 flex items-center gap-1.5 font-mono text-system uppercase text-foreground-muted">
        <Link2 aria-hidden="true" className="size-3.5" />
        Job link
      </span>
    </p>
  );
}

function Lines({ widths }: { widths: readonly string[] }) {
  return (
    <span aria-hidden="true" className="flex flex-col gap-2">
      {widths.map((w, i) => <span key={i} className={cn("h-2 rounded-full bg-foreground/15", w)} />)}
    </span>
  );
}

export function TurnCompare() {
  const { ref, enter, motionKey } = usePlay<HTMLDivElement>(0.4);

  return (
    <div ref={ref} key={motionKey} className="grid gap-4 sm:grid-cols-2">
      <section aria-label="Before" className="flex flex-col gap-3 rounded-lg border border-border-subtle bg-surface p-5">
        <p className="font-mono text-system uppercase text-foreground-muted">Before · the classifier answers</p>
        <motion.div {...enter(0)}><Bubble /></motion.div>
        <motion.p {...enter(1)} className="flex items-center gap-2 font-mono text-system uppercase text-danger">
          <span aria-hidden="true" className="size-1.5 rounded-full bg-danger" />
          Classifier guesses “tracker”
        </motion.p>
        <motion.div {...enter(2)} className="flex items-start gap-2.5">
          <LumoFace className="mt-1 opacity-60 grayscale" />
          <div className="min-w-0 flex-1 rounded-sm border border-border-default bg-surface-muted p-4">
          <p className="text-body-sm font-semibold text-foreground">Add to tracker?</p>
          <dl className="mt-2 grid grid-cols-[auto_1fr] gap-x-3 gap-y-1 text-body-sm">
            <dt className="text-foreground-muted">Company</dt><dd className="text-foreground">Unknown</dd>
            <dt className="text-foreground-muted">Role</dt><dd className="text-foreground">Unknown</dd>
          </dl>
          <span aria-hidden="true" className="mt-3 flex gap-2">
            <span className="h-7 w-20 rounded-full bg-foreground/15" />
            <span className="h-7 w-16 rounded-full border border-border-default" />
          </span>
          </div>
        </motion.div>
        <motion.p {...enter(3)} className="text-body-sm text-foreground-muted">The cover letter is never written. Members confirmed none of these cards.</motion.p>
      </section>

      <section aria-label="After" className="flex flex-col gap-3 rounded-lg border border-plate-offboard-mark/40 bg-surface p-5">
        <p className="font-mono text-system uppercase text-plate-offboard-mark">After · LUMO answers</p>
        <motion.div {...enter(0.5)}><Bubble /></motion.div>
        <motion.p {...enter(1.5)} className="flex items-center gap-2 font-mono text-system uppercase text-foreground-muted">
          <span aria-hidden="true" className="size-1.5 rounded-full bg-plate-offboard-mark" />
          Writing help · write tools not offered
        </motion.p>
        <motion.div {...enter(2.5)} className="flex items-start gap-2.5">
          <LumoFace className="mt-1" />
          <div className="min-w-0 flex-1 rounded-sm bg-surface-muted p-4">
            <Lines widths={["w-11/12", "w-full", "w-10/12", "w-9/12", "w-full", "w-7/12"]} />
          </div>
        </motion.div>
        <motion.p {...enter(3.5)} className="text-body-sm text-foreground-muted">LUMO drafts the letter in the chat. No card appears.</motion.p>
      </section>
    </div>
  );
}
