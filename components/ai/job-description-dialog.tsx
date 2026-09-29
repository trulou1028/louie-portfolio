"use client";

import * as React from "react";

import { useAskLouie } from "@/components/ai/ask-louie-dialog";
import { track } from "@/lib/analytics";

/**
 * The recruiter entry point (spec §22). Plan 042 moved the comparison from
 * its own dialog into the Ask Louie side panel, so the result sits beside
 * the page and the visitor can keep asking questions after it. This
 * trigger opens the panel on the comparison view; `JobCompare` does the
 * rest.
 *
 * `trigger` must be a single element (a button); it keeps its own look and
 * gains the click.
 */
function JobDescriptionTrigger({ trigger }: { trigger: React.ReactElement<{ onClick?: React.MouseEventHandler }> }) {
  const { openCompare } = useAskLouie();
  return React.cloneElement(trigger, {
    onClick: (event: React.MouseEvent) => {
      trigger.props.onClick?.(event);
      track("job_description_started", { source: "chip" });
      openCompare();
    },
  });
}

export { JobDescriptionTrigger };
