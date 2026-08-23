"use client";

import * as React from "react";
import Link from "next/link";
import { motion, useReducedMotion } from "motion/react";

import { useAnswerStore } from "@/components/ai/answer-store";
import { EvidenceCard } from "@/components/portfolio/evidence-card";
import { Action } from "@/components/system/action";
import { SectionLabel } from "@/components/system/section-label";
import { getEvidenceById } from "@/lib/ai/portfolio-search";
import type { EvidenceItem } from "@/content/evidence/evidence";

/**
 * The Answer Sheet — the main-column half of Plan 012's hook ("Ask the
 * panel; the site answers").
 *
 * A question asked in the Ask panel does not pile up as bubbles in the
 * sidebar; it composes here instead, in the same allowlisted component
 * vocabulary the spec mandates for generative UI (spec §19): the question
 * set large as a display headline, a grounded answer as editorial text, and
 * the supporting evidence as `EvidenceCard`s — the glass-box reasoning trail
 * made part of the page itself.
 *
 * `idle` renders nothing at all: the canvas is additive, never a takeover of
 * the ordinary homepage (hero, featured work, in brief).
 */
function AnswerCanvas() {
  const store = useAnswerStore();
  const prefersReducedMotion = useReducedMotion();
  const state = store?.state ?? { status: "idle" as const };

  if (state.status === "idle") return null;

  // --duration-standard is 240ms (app/globals.css). Motion's WAAPI-driven
  // transforms are not covered by the CSS `prefers-reduced-motion` kill
  // switch, so reduced motion is honored explicitly here.
  const transition = { duration: prefersReducedMotion ? 0 : 0.24, ease: "easeOut" as const };
  const initial = prefersReducedMotion ? false : { opacity: 0, y: 8 };

  return (
    <section
      id="answer"
      tabIndex={-1}
      aria-live="polite"
      aria-atomic="false"
      className="scroll-mt-8 flex flex-col gap-6 border-b border-border-subtle pb-10 outline-none"
    >
      {state.status === "answered" ? (
        <motion.div
          key={`answered-${state.question}`}
          initial={initial}
          animate={{ opacity: 1, y: 0 }}
          transition={transition}
          className="flex flex-col gap-6"
        >
          <AnsweredContent
            question={state.question}
            answerText={state.answerText}
            evidenceIds={state.evidenceIds}
            onClear={() => store?.clear()}
          />
        </motion.div>
      ) : (
        <motion.div
          key="pending"
          initial={initial}
          animate={{ opacity: 1, y: 0 }}
          transition={transition}
          className="flex flex-col gap-6"
        >
          <PendingContent question={state.question} />
        </motion.div>
      )}
    </section>
  );
}

function PendingContent({ question }: { question: string }) {
  return (
    <>
      <SectionLabel>Answer</SectionLabel>
      <h2 className="max-w-[20ch] font-serif text-heading-xl text-balance text-foreground">
        {question}
      </h2>
      <div aria-hidden="true" className="flex flex-col gap-2.5">
        <div className="h-4 w-full max-w-[58ch] animate-pulse rounded-xs bg-surface-muted" />
        <div className="h-4 w-11/12 max-w-[54ch] animate-pulse rounded-xs bg-surface-muted" />
        <div className="h-4 w-2/3 max-w-[38ch] animate-pulse rounded-xs bg-surface-muted" />
      </div>
      <span className="sr-only">AI Louie is composing an answer…</span>
    </>
  );
}

function AnsweredContent({
  question,
  answerText,
  evidenceIds,
  onClear,
}: {
  question: string;
  answerText: string;
  evidenceIds: string[];
  onClear: () => void;
}) {
  const headlineRef = React.useRef<HTMLHeadingElement>(null);

  // Focus follows the answer (spec §26): every new answer moves focus to its
  // headline, so keyboard and screen-reader users land where the content
  // changed rather than staying wherever they were in the panel.
  React.useEffect(() => {
    headlineRef.current?.focus({ preventScroll: true });
  }, [question, answerText]);

  const items = evidenceIds
    .map((id) => getEvidenceById(id))
    .filter((item): item is EvidenceItem => Boolean(item));

  const strongest = items[0];
  const primaryHref = strongest
    ? strongest.anchor
      ? `${strongest.route}#${strongest.anchor}`
      : strongest.route
    : undefined;

  return (
    <>
      <SectionLabel>Answer</SectionLabel>
      <h2
        ref={headlineRef}
        tabIndex={-1}
        className="max-w-[20ch] font-serif text-heading-xl text-balance text-foreground outline-none"
      >
        {question}
      </h2>

      <p className="max-w-[62ch] text-body-lg text-foreground-muted">
        {answerText}
      </p>

      {items.length > 0 ? (
        <div className="flex flex-col gap-3">
          <SectionLabel>
            Grounded in {items.length} portfolio source
            {items.length === 1 ? "" : "s"}
          </SectionLabel>
          <div className="grid gap-3 sm:grid-cols-2">
            {items.map((item) => (
              <EvidenceCard
                key={item.id}
                evidenceId={item.id}
                project={item.project}
                title={item.title}
                relevance={item.summary}
                route={item.route}
                anchor={item.anchor}
                highlighted
              />
            ))}
          </div>
        </div>
      ) : null}

      <div className="flex flex-wrap items-center gap-3">
        {primaryHref ? (
          <Action render={<Link href={primaryHref} />}>
            Open the strongest evidence
          </Action>
        ) : null}
        <Action variant="ghost" onClick={onClear}>
          Clear
        </Action>
      </div>
    </>
  );
}

export { AnswerCanvas };
