import { describe, expect, it } from "vitest";

import { profile } from "@/content/profile";
import { workProjects } from "@/content/work/projects";

describe("hero copy", () => {
  it("renders as a single unstyled string", () => {
    // The headline used to be split into two spans so the tail could be set
    // in accent italic; owner decision 2026-08-27 made it one plain white
    // string, so the split field is gone and nothing may reintroduce it
    // without also reintroducing the suffix invariant it needed.
    expect(profile.positioning).not.toHaveProperty("primaryEmphasis");
  });

  it("still carries the exact positioning statements", () => {
    // The headline was superseded by owner decision 2026-08-23 (Plan 011,
    // README "Deviations" ledger) — this is no longer the spec §11 wording.
    expect(profile.positioning.primary).toBe(
      "I plan, design & ship AI products.",
    );
    expect(profile.positioning.supporting).toBe(
      "Product designer working across AI systems, complex workflows, design engineering, and product strategy.",
    );
  });
});

describe("project copy", () => {
  it("uses the spec titles verbatim", () => {
    const bySlug = Object.fromEntries(workProjects.map((p) => [p.slug, p]));
    expect(bySlug.offboard.title).toBe(
      "Building an AI-native operating system for the job search",
    );
    expect(bySlug.flexi.title).toBe(
      "Designing an AI tutor that helps students learn instead of simply giving them answers",
    );
  });

  it("never describes Offboard as an IT or employee offboarding tool", () => {
    // The strategy mockup misdescribes Offboard this way. Offboard is a
    // job-search product (spec §11 §3, §13.1, and the live product site).
    const offboard = workProjects.find((p) => p.slug === "offboard")!;
    const text = `${offboard.title} ${offboard.summary ?? ""}`.toLowerCase();
    expect(text).not.toMatch(/help desk|it offboarding|hris|device/);
  });
});
