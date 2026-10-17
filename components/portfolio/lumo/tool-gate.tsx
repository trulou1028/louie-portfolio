"use client";

import * as React from "react";
import { AnimatePresence, motion } from "motion/react";
import { Check } from "lucide-react";

import { LumoFace } from "@/components/portfolio/lumo/lumo-face";
import { useReducedMotionSafe } from "@/components/portfolio/lumo/use-play";
import { cn } from "@/lib/utils";

/**
 * The write-tool rule from Sprint 402, as something to try. Pick a message
 * and see which of LUMO's ten tools the model is offered, which one it
 * calls, and what the member sees. On a tracker request the card waits for
 * a click: the tracker changes only on Confirm.
 *
 * The tool names are the real ones (`chat-with-lumo/toolDefinitions.ts`).
 * The messages are examples of each kind of turn, not member quotes.
 */
const READ_TOOLS = ["web_search", "scrape_webpage", "get_upcoming_interviews", "analyze_ghost_job", "list_applications", "get_application"] as const;
const WRITE_TOOLS = ["create_application", "update_application", "create_contact", "create_application_with_interview"] as const;

type Turn = {
  key: string;
  message: string;
  kind: string;
  writeOffered: boolean;
  calls: string | null;
  outcome: string;
  card: boolean;
};

const TURNS: readonly Turn[] = [
  {
    key: "rewrite",
    message: "Rewrite this cover letter so it is shorter.",
    kind: "Writing help",
    writeOffered: false,
    calls: null,
    outcome: "LUMO rewrites the letter in the chat. The write tools are not offered, so no card can appear.",
    card: false,
  },
  {
    key: "track",
    message: "Add this job to my tracker.",
    kind: "Tracker request with a link",
    writeOffered: true,
    calls: "create_application",
    outcome: "The model calls a write tool. The tool returns a card. Nothing is saved yet.",
    card: true,
  },
  {
    key: "prep",
    message: "What should I prepare for my interview?",
    kind: "Question",
    writeOffered: true,
    calls: "get_upcoming_interviews",
    outcome: "LUMO reads the interview on file and answers. A read changes nothing.",
    card: false,
  },
];

function Tool({ name, state }: { name: string; state: "offered" | "called" | "blocked" }) {
  return (
    <li
      className={cn(
        "rounded-xs border px-2 py-1 font-mono text-system transition-[opacity,background-color,border-color] duration-(--duration-standard)",
        state === "called" && "border-plate-offboard-mark bg-plate-offboard-mark text-canvas",
        state === "offered" && "border-border-default text-foreground",
        state === "blocked" && "border-border-subtle text-foreground-subtle line-through opacity-50",
      )}
    >
      {name}
      <span className="sr-only">{state === "called" ? " (called)" : state === "blocked" ? " (not offered)" : " (offered)"}</span>
    </li>
  );
}

export function ToolGate() {
  const [active, setActive] = React.useState<Turn>(TURNS[0]);
  const [confirmed, setConfirmed] = React.useState(false);
  const reduce = useReducedMotionSafe();

  const pick = (turn: Turn) => { setActive(turn); setConfirmed(false); };
  const state = (name: string, write: boolean) =>
    active.calls === name ? "called" : write && !active.writeOffered ? "blocked" : "offered";

  return (
    <div className="flex flex-col gap-5">
      <div role="group" aria-label="Try a message" className="flex flex-wrap gap-2">
        {TURNS.map((turn) => (
          <button
            key={turn.key}
            type="button"
            aria-pressed={active.key === turn.key}
            onClick={() => pick(turn)}
            className="focus-ring rounded-full border border-border-default px-3.5 py-2 text-left text-body-sm text-foreground-muted transition-colors duration-(--duration-fast) hover:text-foreground aria-pressed:border-foreground aria-pressed:bg-foreground aria-pressed:text-canvas"
          >
            {turn.message}
          </button>
        ))}
      </div>

      <div className="grid gap-5 @2xl/canvas:grid-cols-[1fr_1fr]">
        <div className="flex flex-col gap-3">
          <p className="font-mono text-system uppercase text-foreground-muted">Tools the model is offered · {active.kind}</p>
          <p className="text-body-sm text-foreground-muted">Read</p>
          <ul className="flex flex-wrap gap-1.5">{READ_TOOLS.map((name) => <Tool key={name} name={name} state={state(name, false)} />)}</ul>
          <p className="text-body-sm text-foreground-muted">Write</p>
          <ul className="flex flex-wrap gap-1.5">{WRITE_TOOLS.map((name) => <Tool key={name} name={name} state={state(name, true)} />)}</ul>
        </div>

        <div aria-live="polite" className="flex min-h-56 flex-col gap-3 rounded-lg border border-border-subtle bg-surface p-5">
          <p className="ml-auto max-w-[16rem] rounded-field rounded-br-xs bg-surface-raised px-4 py-2.5 text-body-sm text-foreground">{active.message}</p>
          <AnimatePresence mode="wait" initial={false}>
            <motion.div
              key={active.key + String(confirmed)}
              initial={reduce ? false : { opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={reduce ? undefined : { opacity: 0, y: -4 }}
              transition={{ duration: reduce ? 0 : 0.25 }}
              className="flex items-start gap-2.5"
            >
              <LumoFace className="mt-1" />
              <div className="flex min-w-0 flex-1 flex-col gap-3">
              {active.card ? (
                <div className="rounded-sm border border-border-default bg-surface-muted p-4">
                  {confirmed ? (
                    <p className="flex items-center gap-2 text-body-sm font-semibold text-foreground">
                      <Check aria-hidden="true" className="size-4 text-plate-offboard-mark" />
                      Added. The tracker changed only now.
                    </p>
                  ) : (
                    <>
                      <p className="text-body-sm font-semibold text-foreground">Add to tracker?</p>
                      <p className="mt-1 text-body-sm text-foreground-muted">The role from the link, as a pending card.</p>
                      <span className="mt-3 flex gap-2">
                        <button type="button" onClick={() => setConfirmed(true)} className="focus-ring rounded-full bg-plate-offboard-mark px-3.5 py-1.5 text-body-sm font-semibold text-canvas">Confirm</button>
                        <span aria-hidden="true" className="rounded-full border border-border-default px-3.5 py-1.5 text-body-sm text-foreground-muted">Not now</span>
                      </span>
                    </>
                  )}
                </div>
              ) : (
                <span aria-hidden="true" className="flex flex-col gap-2 rounded-sm bg-surface-muted p-4">
                  {["w-11/12", "w-full", "w-8/12"].map((w) => <span key={w} className={cn("h-2 rounded-full bg-foreground/15", w)} />)}
                </span>
              )}
              <p className="text-body-sm text-foreground-muted">{confirmed ? "The confirmed change runs through the same code a connected AI agent uses." : active.outcome}</p>
              </div>
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
