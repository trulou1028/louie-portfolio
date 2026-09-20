import { describe, expect, it } from "vitest";

import { SCOPE_RULES, SPEC_RULES, buildSystemPrompt } from "@/lib/ai/system-prompt";

describe("buildSystemPrompt", () => {
  it("includes every SPEC_RULES entry verbatim (spec §20)", () => {
    const prompt = buildSystemPrompt();
    for (const rule of SPEC_RULES) {
      expect(prompt).toContain(rule);
    }
  });

  it("includes every SCOPE_RULES entry verbatim (Plan 014 scope harness)", () => {
    const prompt = buildSystemPrompt();
    for (const rule of SCOPE_RULES) {
      expect(prompt).toContain(rule);
    }
  });

  it("uses first-person portfolio voice while disclosing its AI identity", () => {
    const prompt = buildSystemPrompt();
    expect(prompt).toContain("Speak in Louie's authorized first-person portfolio voice");
    expect(prompt).toContain("You are an AI guide, not the human Louie.");
  });
});
