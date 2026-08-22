import { describe, expect, it } from "vitest";

import {
  jobDescriptionInputSchema,
  jobFitResultSchema,
  resolveEvidence,
  stripMatchScores,
  verifyMatches,
  type JobFitResult,
} from "@/lib/ai/job-fit";

const base: JobFitResult = {
  summary: "A senior AI product design role.",
  strongestMatches: [],
  weakerAreas: [],
  suggestedProjectsToReview: [],
  suggestedQuestions: [],
};

describe("evidence verification", () => {
  it("keeps matches whose citations resolve", () => {
    const result = verifyMatches({
      ...base,
      strongestMatches: [
        {
          requirement: "Experience with agentic systems",
          evidenceIds: ["offboard-hitl-actions"],
          explanation: "Human-in-the-loop AI actions in Offboard.",
        },
      ],
    });

    expect(result.strongestMatches).toHaveLength(1);
    expect(result.demotedCount).toBe(0);
  });

  it("demotes a match whose citations are invented", () => {
    // This is the integrity core: a hallucinated citation must become an
    // admitted gap, never a claim the portfolio cannot support.
    const result = verifyMatches({
      ...base,
      strongestMatches: [
        {
          requirement: "Ten years of Kubernetes",
          evidenceIds: ["offboard-kubernetes-mastery"],
          explanation: "He is deeply experienced here.",
        },
      ],
    });

    expect(result.strongestMatches).toHaveLength(0);
    expect(result.demotedCount).toBe(1);
    expect(result.weakerAreas[0].requirement).toBe("Ten years of Kubernetes");
    expect(result.weakerAreas[0].explanation).toMatch(/does not currently contain evidence/i);
  });

  it("demotes a match with an empty citation list", () => {
    const result = verifyMatches({
      ...base,
      strongestMatches: [
        {
          requirement: "Leadership",
          evidenceIds: [],
          explanation: "Surely he has some.",
        },
      ],
    });
    expect(result.strongestMatches).toHaveLength(0);
    expect(result.demotedCount).toBe(1);
  });

  it("drops only the invalid ids from a partly-valid match", () => {
    const result = verifyMatches({
      ...base,
      strongestMatches: [
        {
          requirement: "AI product design",
          evidenceIds: ["flexi-scaffolding-loop", "totally-made-up"],
          explanation: "Flexi's tutoring loop.",
        },
      ],
    });

    expect(result.strongestMatches[0].evidenceIds).toEqual(["flexi-scaffolding-loop"]);
    expect(result.demotedCount).toBe(0);
  });

  it("preserves genuine weaker areas alongside demoted ones", () => {
    const result = verifyMatches({
      ...base,
      strongestMatches: [
        { requirement: "Rust", evidenceIds: ["nope"], explanation: "x" },
      ],
      weakerAreas: [
        { requirement: "People management", explanation: "Not evidenced." },
      ],
    });
    expect(result.weakerAreas).toHaveLength(2);
  });
});

describe("no numeric scores", () => {
  it("strips percentage match claims", () => {
    // Spec §18: this is an evidence navigator, not a scoring tool.
    expect(stripMatchScores("An 85% match for this role.")).not.toMatch(/%/);
    expect(stripMatchScores("Overall fit: 70%")).not.toMatch(/%/);
    expect(stripMatchScores("Scores 8/10 against the requirements.")).not.toMatch(
      /8\/10/,
    );
  });

  it("leaves ordinary numbers alone", () => {
    expect(stripMatchScores("Requires 5+ years of experience.")).toContain(
      "5+ years",
    );
    expect(stripMatchScores("Grew usage 20% year over year.")).toContain("20%");
  });

  it("is applied through verifyMatches", () => {
    const result = verifyMatches({
      ...base,
      summary: "A 92% match overall.",
      strongestMatches: [
        {
          requirement: "AI UX",
          evidenceIds: ["flexi-central-tension"],
          explanation: "A 90% fit with his Flexi work.",
        },
      ],
    });
    expect(result.summary).not.toMatch(/%/);
    expect(result.strongestMatches[0].explanation).not.toMatch(/%/);
  });
});

describe("input bounds", () => {
  it("rejects a too-short description", () => {
    expect(jobDescriptionInputSchema.safeParse({ jobDescription: "Designer wanted" }).success).toBe(
      false,
    );
  });

  it("rejects an oversized description", () => {
    expect(
      jobDescriptionInputSchema.safeParse({ jobDescription: "x".repeat(15_001) }).success,
    ).toBe(false);
  });

  it("accepts a realistic one", () => {
    expect(
      jobDescriptionInputSchema.safeParse({ jobDescription: "x".repeat(1_200) }).success,
    ).toBe(true);
  });
});

describe("result schema", () => {
  it("accepts a well-formed result", () => {
    expect(jobFitResultSchema.safeParse(base).success).toBe(true);
  });

  it("rejects a match missing its explanation", () => {
    expect(
      jobFitResultSchema.safeParse({
        ...base,
        strongestMatches: [{ requirement: "x", evidenceIds: [] }],
      }).success,
    ).toBe(false);
  });
});

describe("resolveEvidence", () => {
  it("returns known items and silently drops unknown ids", () => {
    const items = resolveEvidence(["offboard-risk-gate", "not-real"]);
    expect(items).toHaveLength(1);
    expect(items[0].id).toBe("offboard-risk-gate");
  });
});
