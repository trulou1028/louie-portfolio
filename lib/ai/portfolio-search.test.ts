import { describe, expect, it } from "vitest";

import { evidence } from "@/content/evidence/evidence";
import { evidenceItemSchema } from "@/lib/ai/schemas";
import {
  searchEvidence,
  tokenize,
} from "@/lib/ai/portfolio-search";
import { CASE_STUDY_ANCHORS, isAnchorOnRoute, isRoute } from "@/lib/routes";

describe("tokenize", () => {
  it("drops stop words that would otherwise match everything", () => {
    // "louie" appears in most detail text; left in, any question about Louie
    // would match every entry through the detail field.
    expect(tokenize("What has Louie shipped in React?")).toEqual([
      "shipped",
      "react",
    ]);
  });

  it("strips punctuation and single characters", () => {
    expect(tokenize("agents, tool-calling!")).toEqual(["agents", "tool-calling"]);
  });
});

describe("searchEvidence", () => {
  it("ranks an exact tag match above a prose-only match", () => {
    const { results } = searchEvidence({ query: "human-in-the-loop" });
    expect(results.length).toBeGreaterThan(0);
    expect(results[0].id).toBe("offboard-hitl-actions");
  });

  it("finds the research evidence for a research question", () => {
    const { results } = searchEvidence({ query: "user research" });
    expect(results.map((r) => r.id)).toContain("flexi-research");
  });

  it("applies the project filter as a hard constraint", () => {
    const { results } = searchEvidence({
      query: "ai ux design",
      project: "flexi",
    });
    expect(results.length).toBeGreaterThan(0);
    expect(results.every((r) => r.project === "flexi")).toBe(true);
  });

  it("applies the evidenceType filter", () => {
    const { results } = searchEvidence({
      query: "architecture",
      evidenceType: "technical",
    });
    expect(results.every((r) => r.evidenceType === "technical")).toBe(true);
  });

  it("respects limit, defaults to 5, and caps at 10", () => {
    expect(searchEvidence({ query: "ai", limit: 2 }).results.length).toBeLessThanOrEqual(2);
    expect(searchEvidence({ query: "ai" }).results.length).toBeLessThanOrEqual(5);
    expect(searchEvidence({ query: "ai", limit: 50 }).results.length).toBeLessThanOrEqual(10);
  });

  it("returns nothing rather than low-relevance filler", () => {
    // Spec §31: AI Louie must be able to say it has no evidence.
    expect(searchEvidence({ query: "kubernetes helm charts" }).results).toEqual([]);
    expect(searchEvidence({ query: "the and of" }).results).toEqual([]);
    expect(searchEvidence({ query: "   " }).results).toEqual([]);
  });

  it("is deterministic", () => {
    const a = searchEvidence({ query: "agent workflows" });
    const b = searchEvidence({ query: "agent workflows" });
    expect(a).toEqual(b);
  });

  it("breaks score ties stably by id", () => {
    const ids = searchEvidence({ query: "education", limit: 10 }).results.map(
      (r) => r.id,
    );
    expect(ids).toEqual([...ids]);
    expect(new Set(ids).size).toBe(ids.length);
  });

  // Plan 014: the panel's three suggestions must reliably return grounded
  // evidence, or the basic Q&A chat has nothing to answer with.
  it.each(["Offboard", "Flexi", "technical engineering skills"])(
    "returns at least one result for the %s suggestion query",
    (query) => {
      expect(searchEvidence({ query }).results.length).toBeGreaterThan(0);
    },
  );
});

describe("the evidence index itself", () => {
  it("has at least 12 entries", () => {
    expect(evidence.length).toBeGreaterThanOrEqual(12);
  });

  it("passes its schema", () => {
    for (const item of evidence) {
      const parsed = evidenceItemSchema.safeParse(item);
      expect(parsed.success, `${item.id}: ${parsed.error?.message}`).toBe(true);
    }
  });

  it("has unique ids", () => {
    const ids = evidence.map((e) => e.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it("only cites routes and anchors that exist", () => {
    for (const item of evidence) {
      expect(isRoute(item.route), `${item.id} route`).toBe(true);
      if (item.anchor) {
        expect(
          isAnchorOnRoute(item.route, item.anchor),
          `${item.id} → ${item.route}#${item.anchor}`,
        ).toBe(true);
      }
    }
  });

  it("covers every decision section of both case studies", () => {
    // Each argued section should be reachable by citation; otherwise AI Louie
    // cannot point at part of the work.
    const cited = new Set(evidence.map((e) => `${e.route}#${e.anchor}`));
    const skip = new Set(["product", "outcomes", "learnings"]);

    for (const [route, anchors] of Object.entries(CASE_STUDY_ANCHORS)) {
      for (const anchor of anchors) {
        if (skip.has(anchor.id)) continue;
        expect(
          cited.has(`${route}#${anchor.id}`),
          `no evidence cites ${route}#${anchor.id}`,
        ).toBe(true);
      }
    }
  });
});
