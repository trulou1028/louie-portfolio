"use client";

import * as React from "react";
import { ArrowLeft } from "lucide-react";

import { useAskLouie } from "@/components/ai/ask-louie-dialog";
import { JobFitResult } from "@/components/ai/job-fit-result";
import { SourceStack } from "@/components/ai/thinking-sources";
import { Action } from "@/components/system/action";
import type { VerifiedJobFit } from "@/lib/ai/job-fit";
import { track } from "@/lib/analytics";

/**
 * The job-description comparison, inside the Ask Louie panel (spec §22,
 * Plan 042).
 *
 * No account, no sign-up, no stored description. The privacy line sits
 * before the button, because the honest moment to say what happens to the
 * text is before someone sends it. The description lives in this
 * component's state for the request only. Closing the panel returns it to
 * the chat view, which unmounts this component and drops the text
 * (spec §30). It is never logged or sent to analytics.
 *
 * Lazy-loaded by `AskPanel` with the rest of the AI surface (spec §27).
 */
const MIN_LENGTH = 200;

/** What the comparison reads from. Every evidence entry belongs to one. */
const SOURCES = ["Offboard", "CK-12 Foresights", "Flexi", "Neuron Shift", "Resume"];

type Phase =
  | { status: "idle" }
  | { status: "loading" }
  | { status: "done"; result: VerifiedJobFit }
  | { status: "error"; message: string };

/**
 * The wait (Plan 042). The visitor's own text, faded, with a highlight
 * reading down it, and the sources lighting up in turn. It shows what the
 * comparison is doing without claiming steps it cannot report. Under
 * reduced motion the global rule stills both animations.
 */
function Comparing({ text }: { text: string }) {
  return (
    <div aria-busy="true" className="ask-fade-in flex flex-col gap-5">
      <div aria-hidden="true" className="relative h-56 overflow-hidden rounded-lg border border-border-subtle bg-surface">
        <p className="whitespace-pre-line p-4 text-body-sm text-foreground-subtle">{text.slice(0, 900)}</p>
        <div className="jd-scan pointer-events-none absolute inset-x-0 top-0 h-full" />
        <div className="pointer-events-none absolute inset-x-0 bottom-0 h-16 bg-linear-to-t from-surface to-transparent" />
      </div>

      <div className="flex items-center gap-2.5">
        <SourceStack dealing />
        <p className="text-body-sm text-foreground">Comparing this role with my case studies</p>
      </div>

      <div className="flex flex-col gap-2">
        <p className="text-body-sm text-foreground-muted">Checking against</p>
        <ul aria-hidden="true" className="flex flex-wrap gap-1.5">
          {SOURCES.map((source, index) => (
            <li
              key={source}
              style={{ "--i": index } as React.CSSProperties}
              className="jd-source rounded-full border border-border-default bg-surface px-3 py-1 text-body-sm text-foreground-muted"
            >
              {source}
            </li>
          ))}
        </ul>
      </div>
      <span className="sr-only">Comparing this role against Louie&rsquo;s work…</span>
    </div>
  );
}

function JobCompare() {
  const { setView } = useAskLouie();
  const [value, setValue] = React.useState("");
  const [phase, setPhase] = React.useState<Phase>({ status: "idle" });
  const tooShort = value.trim().length < MIN_LENGTH;
  const textareaRef = React.useRef<HTMLTextAreaElement>(null);

  // The button that opened this view is now hidden, so focus has nowhere to
  // be. Put it in the text box: keyboard and screen-reader users land where
  // the task starts, and on phones the modal panel's focus guard cannot pull
  // it back while someone is already typing.
  React.useEffect(() => {
    const frame = requestAnimationFrame(() => textareaRef.current?.focus());
    return () => cancelAnimationFrame(frame);
  }, []);

  async function compare() {
    setPhase({ status: "loading" });
    try {
      const response = await fetch("/api/job-fit", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ jobDescription: value }),
      });

      if (!response.ok) {
        const body = (await response.json().catch(() => null)) as { error?: string } | null;
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
      track("job_description_compared", {
        matches: body.result.strongestMatches.length,
        weakerAreas: body.result.weakerAreas.length,
        demoted: body.result.demotedCount,
      });
    } catch {
      setPhase({
        status: "error",
        message: "That comparison couldn’t be completed. You can still explore the work directly.",
      });
    }
  }

  function reset() {
    setValue("");
    setPhase({ status: "idle" });
    requestAnimationFrame(() => textareaRef.current?.focus());
  }

  return (
    <section aria-labelledby="job-compare-title" className="flex min-h-0 flex-1 flex-col">
      <div className="flex items-center justify-between gap-3 pb-4">
        <h3 id="job-compare-title" className="font-display text-body-lg font-bold text-foreground">
          Compare a role
        </h3>
        <button
          type="button"
          onClick={() => setView("chat")}
          className="focus-ring inline-flex items-center gap-1.5 rounded-xs text-body-sm font-medium text-foreground-muted hover:text-foreground"
        >
          <ArrowLeft aria-hidden="true" className="size-3.5" />
          Back to chat
        </button>
      </div>

      <div className="-mx-5 min-h-0 flex-1 overflow-y-auto px-5 pb-2">
        {phase.status === "loading" ? (
          <Comparing text={value} />
        ) : phase.status === "done" ? (
          <div className="flex flex-col gap-6">
            <JobFitResult result={phase.result} />
            <div className="flex flex-wrap gap-2 border-t border-border-subtle pt-4">
              <Action variant="secondary" size="sm" onClick={reset}>Compare another role</Action>
              <Action variant="ghost" size="sm" onClick={() => setView("chat")}>Ask a follow-up</Action>
            </div>
          </div>
        ) : (
          <div className="flex flex-col gap-3">
            <p className="text-body-sm text-foreground-muted">
              Paste the job description. I&rsquo;ll compare it with the evidence published here, including where it falls short.
            </p>
            <label htmlFor="job-description" className="sr-only">Job description</label>
            <textarea
              ref={textareaRef}
              id="job-description"
              value={value}
              onChange={(event) => setValue(event.target.value)}
              rows={12}
              maxLength={15_000}
              placeholder="Paste the full job description…"
              aria-describedby="job-description-privacy"
              className="w-full resize-y rounded-md border border-border-default bg-surface p-4 text-body-sm text-foreground outline-none placeholder:text-foreground-muted focus:border-border-strong"
            />
            <p id="job-description-privacy" className="text-body-sm text-foreground-muted">
              Used only for this comparison. Not stored, and not sent to analytics.
            </p>
            {phase.status === "error" ? (
              <p role="alert" className="text-body-sm text-danger">{phase.message}</p>
            ) : null}
            <div className="flex flex-wrap items-center gap-3">
              <Action onClick={compare} disabled={tooShort}>Compare with my work</Action>
              {tooShort && value.length > 0 ? (
                <span className="text-body-sm text-foreground-muted">Paste a bit more for a useful comparison.</span>
              ) : null}
            </div>
          </div>
        )}
      </div>
    </section>
  );
}

export { JobCompare };
export default JobCompare;
