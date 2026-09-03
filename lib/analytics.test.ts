import { describe, expect, it } from "vitest";

import { ANALYTICS_EVENTS, sanitizeProperties } from "@/lib/analytics";

describe("analytics event list", () => {
  it("matches spec §30", () => {
    expect(ANALYTICS_EVENTS).toContain("ai_question_submitted");
    expect(ANALYTICS_EVENTS).toContain("job_description_compared");
    expect(ANALYTICS_EVENTS).toHaveLength(13);
  });
});

describe("property sanitizing", () => {
  it("keeps short enum-like labels", () => {
    expect(
      sanitizeProperties({ project: "offboard", count: 3, first: true }),
    ).toEqual({ project: "offboard", count: 3, first: true });
  });

  it("drops long strings", () => {
    // A pasted job description or a question would arrive as a long string.
    const result = sanitizeProperties({ text: "x".repeat(200) });
    expect(result).toEqual({});
  });

  it("drops prose even when it is short", () => {
    expect(sanitizeProperties({ q: "How technical is  Louie?" })).toEqual({});
    expect(sanitizeProperties({ q: "line one\nline two" })).toEqual({});
  });

  it("never lets a job description through in any form", () => {
    const jd =
      "We are seeking a senior product designer to join our team. Responsibilities include...";
    expect(Object.values(sanitizeProperties({ jd }))).toHaveLength(0);
  });
});

describe("Plan 028 call-site properties survive sanitizing unchanged", () => {
  it("portfolio_project_opened / resume_opened", () => {
    expect(sanitizeProperties({ project: "offboard" })).toEqual({
      project: "offboard",
    });
    expect(sanitizeProperties({ source: "page" })).toEqual({ source: "page" });
  });

  it("ai_louie_started", () => {
    expect(sanitizeProperties({ trigger: "approach" })).toEqual({
      trigger: "approach",
    });
    expect(sanitizeProperties({ trigger: "fallback" })).toEqual({
      trigger: "fallback",
    });
  });

  it("ai_question_submitted", () => {
    expect(sanitizeProperties({ turn: 3 })).toEqual({ turn: 3 });
  });

  it("ai_prompt_chip_clicked", () => {
    expect(sanitizeProperties({ chip: "show-offboard" })).toEqual({
      chip: "show-offboard",
    });
  });

  it("job_description_started", () => {
    expect(sanitizeProperties({ source: "chip" })).toEqual({ source: "chip" });
  });

  it("job_description_compared", () => {
    expect(
      sanitizeProperties({ matches: 2, weakerAreas: 1, demoted: 0 }),
    ).toEqual({ matches: 2, weakerAreas: 1, demoted: 0 });
  });

  it("contact_clicked", () => {
    expect(sanitizeProperties({ method: "email" })).toEqual({
      method: "email",
    });
  });
});
