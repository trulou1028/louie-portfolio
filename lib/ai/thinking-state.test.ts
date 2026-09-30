import { describe, expect, it } from "vitest";
import type { UIMessage } from "ai";

import { statusFor, thinkingState } from "@/lib/ai/thinking-state";

function assistant(parts: unknown[]): UIMessage {
  return { id: "a", role: "assistant", parts } as UIMessage;
}

const search = (state: string, output?: unknown) => ({
  type: "tool-search_portfolio",
  toolCallId: "c1",
  state,
  input: { query: "trust" },
  output,
});

describe("thinking state (Plan 043)", () => {
  it("reads the question before any tool runs", () => {
    expect(thinkingState(undefined)).toEqual({ phase: "reading", found: [] });
    expect(thinkingState(assistant([{ type: "step-start" }]))).toEqual({ phase: "reading", found: [] });
  });

  it("searches while a tool has no output", () => {
    expect(thinkingState(assistant([search("input-available")])).phase).toBe("searching");
  });

  it("writes from the sources the search returned, in portfolio order", () => {
    const state = thinkingState(
      assistant([search("output-available", { results: [{ route: "/resume" }, { route: "/work/flexi" }, { route: "/about" }] })]),
    );
    expect(state).toEqual({ phase: "writing", found: ["flexi", "resume"] });
    expect(statusFor(state.phase, state.found)).toEqual({
      text: "Writing from what I found",
      spoken: "Writing from Flexi and Resume",
    });
  });

  it("reads job-comparison evidence links too", () => {
    const part = { type: "tool-compare_job_description", state: "output-available", output: { evidenceLinks: [{ route: "/work/offboard" }] } };
    expect(thinkingState(assistant([part])).found).toEqual(["offboard"]);
  });

  it("keeps searching when a second search starts after the first returns", () => {
    const state = thinkingState(
      assistant([search("output-available", { results: [{ route: "/work/offboard" }] }), { ...search("input-streaming"), toolCallId: "c2" }]),
    );
    expect(state).toEqual({ phase: "searching", found: ["offboard"] });
  });

  it("says so when the search found nothing", () => {
    const state = thinkingState(assistant([search("output-available", { results: [] })]));
    expect(statusFor(state.phase, state.found).text).toBe("Writing the answer");
  });

  it("ignores a user message", () => {
    expect(thinkingState({ id: "u", role: "user", parts: [] } as UIMessage).phase).toBe("reading");
  });
});
