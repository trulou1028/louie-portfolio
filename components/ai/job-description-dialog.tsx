"use client";

import * as React from "react";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Action } from "@/components/system/action";
import { JobFitResult } from "@/components/ai/job-fit-result";
import { Skeleton } from "@/components/ui/skeleton";
import type { VerifiedJobFit } from "@/lib/ai/job-fit";

/**
 * The recruiter entry point (spec §22).
 *
 * No account, no sign-up, no stored description. The privacy line is shown
 * before the textarea rather than buried afterwards, because the honest
 * moment to say what happens to the text is before someone pastes it.
 *
 * The description is held in component state for the length of the request
 * and never written anywhere else — no logging, no analytics (spec §30).
 */
const MIN_LENGTH = 200;

type Phase =
  | { status: "idle" }
  | { status: "loading" }
  | { status: "done"; result: VerifiedJobFit }
  | { status: "error"; message: string };

function JobDescriptionDialog({
  trigger,
}: {
  /** Must be an element: Base UI’s `render` composes it, not renders it. */
  trigger?: React.ReactElement;
}) {
  const [value, setValue] = React.useState("");
  const [phase, setPhase] = React.useState<Phase>({ status: "idle" });

  const tooShort = value.trim().length < MIN_LENGTH;

  async function compare() {
    setPhase({ status: "loading" });
    try {
      const response = await fetch("/api/job-fit", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ jobDescription: value }),
      });

      if (!response.ok) {
        const body = (await response.json().catch(() => null)) as {
          error?: string;
        } | null;
        setPhase({
          status: "error",
          message:
            body?.error === "rate_limited"
              ? "Too many comparisons just now. Please try again in a few minutes."
              : "That comparison couldn’t be completed. You can still explore the work directly.",
        });
        return;
      }

      const body = (await response.json()) as { result: VerifiedJobFit };
      setPhase({ status: "done", result: body.result });
    } catch {
      setPhase({
        status: "error",
        message:
          "That comparison couldn’t be completed. You can still explore the work directly.",
      });
    }
  }

  function handleOpenChange(open: boolean) {
    if (!open) {
      // Drop the description as soon as the dialog closes — there is no
      // reason to keep it in memory once it has been used.
      setValue("");
      setPhase({ status: "idle" });
    }
  }

  return (
    <Dialog onOpenChange={handleOpenChange}>
      <DialogTrigger
        render={
          trigger ?? (
            <Action variant="secondary" size="sm">
              Paste a job description
            </Action>
          )
        }
      />

      <DialogContent className="max-h-[85dvh] overflow-y-auto sm:max-w-[680px]">
        <DialogHeader>
          <DialogTitle className="font-serif text-heading-md">
            Evaluating Louie for a role?
          </DialogTitle>
          <DialogDescription>
            Paste the job description and I&rsquo;ll compare it against the
            evidence published here — including where it falls short.
          </DialogDescription>
        </DialogHeader>

        {phase.status === "done" ? (
          <div className="px-6 pb-6">
            <JobFitResult result={phase.result} />
          </div>
        ) : phase.status === "loading" ? (
          /* Shaped like the result that is coming — four sections, not a
             lone spinner, so the wait previews its own outcome. */
          <div className="flex flex-col gap-6 px-6 pb-6" aria-busy="true">
            <Skeleton className="h-4 w-3/4" />
            {["Strong evidence", "Relevant work to review", "Gaps or unclear areas", "Suggested questions"].map(
              (section) => (
                <div key={section} className="flex flex-col gap-2">
                  <Skeleton className="h-3 w-32" />
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-5/6" />
                </div>
              ),
            )}
            <span className="sr-only">Comparing this role against Louie&rsquo;s work…</span>
          </div>
        ) : (
          <div className="flex flex-col gap-3 px-6 pb-6">
            <label htmlFor="job-description" className="sr-only">
              Job description
            </label>
            <textarea
              id="job-description"
              value={value}
              onChange={(event) => setValue(event.target.value)}
              rows={10}
              maxLength={15_000}
              placeholder="Paste the full job description…"
              aria-describedby="job-description-privacy"
              className="w-full resize-y rounded-md border border-border-default bg-surface p-4 text-body text-foreground outline-none placeholder:text-foreground-muted focus:border-border-strong"
            />

            <p
              id="job-description-privacy"
              className="text-body-sm text-foreground-muted"
            >
              Used only to compare against portfolio evidence. Not stored, and
              not sent to analytics.
            </p>

            {phase.status === "error" ? (
              <p role="alert" className="text-body-sm text-danger">
                {phase.message}
              </p>
            ) : null}

            <div className="flex items-center gap-3">
              {/* No spinner state here: while the comparison runs, the whole
                  form is replaced by a skeleton shaped like the result. */}
              <Action onClick={compare} disabled={tooShort}>
                Compare with Louie&rsquo;s work
              </Action>
              {tooShort && value.length > 0 ? (
                <span className="text-body-sm text-foreground-muted">
                  Paste a bit more for a useful comparison.
                </span>
              ) : null}
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}

export { JobDescriptionDialog };
