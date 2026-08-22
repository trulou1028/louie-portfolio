import { describe, expect, it } from "vitest";

import {
  CONTEXT_PANEL_VIEWS,
  RESERVED_TOOL_NAMES,
  validateContextPanelView,
  validateEvidenceId,
  validateNavigation,
} from "@/lib/ai/tools";
import { SPEC_RULES, buildSystemPrompt } from "@/lib/ai/system-prompt";
import { createRateLimiter } from "@/lib/ai/rate-limit";
import { AIUnavailableError, getAIConfig, isAIConfigured } from "@/lib/ai/provider";

describe("navigate_portfolio validation", () => {
  it("accepts a real route", () => {
    const result = validateNavigation({ route: "/work/offboard" });
    expect(result.ok).toBe(true);
  });

  it("accepts a real route and anchor", () => {
    const result = validateNavigation({
      route: "/work/offboard",
      anchor: "decision-control",
    });
    expect(result).toEqual({
      ok: true,
      value: { route: "/work/offboard", anchor: "decision-control" },
    });
  });

  it("refuses external URLs", () => {
    // Spec §32: no arbitrary external navigation, ever.
    for (const route of [
      "https://example.com",
      "//evil.test",
      "javascript:alert(1)",
      "http://localhost:3000/work",
    ]) {
      expect(validateNavigation({ route }).ok, route).toBe(false);
    }
  });

  it("refuses routes that do not exist", () => {
    expect(validateNavigation({ route: "/admin" }).ok).toBe(false);
    expect(validateNavigation({ route: "/work/secret" }).ok).toBe(false);
    // Not in ROUTES on purpose — internal only.
    expect(validateNavigation({ route: "/design-system" }).ok).toBe(false);
  });

  it("refuses anchors that do not exist on that page", () => {
    // A plausible-but-wrong anchor scrolls nowhere and quietly breaks the
    // promise that AI Louie can show you the source.
    const result = validateNavigation({
      route: "/work/offboard",
      anchor: "decision-teacher", // real, but belongs to Flexi
    });
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.error).toContain("decision-teacher");
  });

  it("refuses malformed input", () => {
    for (const input of [null, undefined, {}, { route: 42 }, "/work"]) {
      expect(validateNavigation(input).ok).toBe(false);
    }
  });
});

describe("show_evidence validation", () => {
  it("resolves a known id", () => {
    const result = validateEvidenceId({ evidenceId: "offboard-hitl-actions" });
    expect(result.ok).toBe(true);
    if (result.ok) expect(result.value.route).toBe("/work/offboard");
  });

  it("refuses an invented id", () => {
    const result = validateEvidenceId({ evidenceId: "offboard-made-up" });
    expect(result.ok).toBe(false);
  });
});

describe("set_context_panel validation", () => {
  it("accepts every allowlisted view and nothing else", () => {
    for (const view of CONTEXT_PANEL_VIEWS) {
      expect(validateContextPanelView({ view }).ok, view).toBe(true);
    }
    expect(validateContextPanelView({ view: "everything" }).ok).toBe(false);
    expect(validateContextPanelView({}).ok).toBe(false);
  });
});

describe("system prompt", () => {
  it("contains all eleven spec §20 rules verbatim", () => {
    const prompt = buildSystemPrompt();
    expect(SPEC_RULES).toHaveLength(11);
    for (const rule of SPEC_RULES) {
      expect(prompt, rule).toContain(rule);
    }
  });

  it("states that it is not Louie", () => {
    const prompt = buildSystemPrompt();
    expect(prompt).toContain("You are not Louie");
    expect(prompt).toContain("I'm an AI assistant trained on Louie's portfolio");
  });
});

describe("rate limiter", () => {
  it("allows up to the limit, then refuses", () => {
    const now = 1_000_000;
    const limiter = createRateLimiter({ limit: 3, windowMs: 1000, now: () => now });

    expect(limiter.check("a").allowed).toBe(true);
    expect(limiter.check("a").allowed).toBe(true);
    expect(limiter.check("a").allowed).toBe(true);
    expect(limiter.check("a").allowed).toBe(false);
  });

  it("keys are independent", () => {
    const now = 1_000_000;
    const limiter = createRateLimiter({ limit: 1, windowMs: 1000, now: () => now });
    expect(limiter.check("a").allowed).toBe(true);
    expect(limiter.check("b").allowed).toBe(true);
    expect(limiter.check("a").allowed).toBe(false);
  });

  it("recovers once the window passes", () => {
    let now = 1_000_000;
    const limiter = createRateLimiter({ limit: 1, windowMs: 1000, now: () => now });
    expect(limiter.check("a").allowed).toBe(true);
    expect(limiter.check("a").allowed).toBe(false);
    now += 1001;
    expect(limiter.check("a").allowed).toBe(true);
  });
});

describe("provider configuration", () => {
  it("reports unconfigured and throws rather than guessing a model", () => {
    const previousKey = process.env.OPENAI_API_KEY;
    const previousModel = process.env.OPENAI_MODEL;
    delete process.env.OPENAI_API_KEY;
    delete process.env.OPENAI_MODEL;

    try {
      expect(isAIConfigured()).toBe(false);
      expect(() => getAIConfig()).toThrow(AIUnavailableError);
    } finally {
      if (previousKey) process.env.OPENAI_API_KEY = previousKey;
      if (previousModel) process.env.OPENAI_MODEL = previousModel;
    }
  });

  it("never hard-codes a model id", () => {
    const previousKey = process.env.OPENAI_API_KEY;
    const previousModel = process.env.OPENAI_MODEL;
    process.env.OPENAI_API_KEY = "test-key";
    process.env.OPENAI_MODEL = "some-model-id";

    try {
      expect(getAIConfig().model).toBe("some-model-id");
    } finally {
      if (previousKey) process.env.OPENAI_API_KEY = previousKey;
      else delete process.env.OPENAI_API_KEY;
      if (previousModel) process.env.OPENAI_MODEL = previousModel;
      else delete process.env.OPENAI_MODEL;
    }
  });
});

describe("reserved tools", () => {
  it("reserves compare_job_description for Plan 007 without implementing it", () => {
    expect(RESERVED_TOOL_NAMES).toContain("compare_job_description");
  });
});
