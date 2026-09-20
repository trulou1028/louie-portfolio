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
      "Complex workflows. Clear decisions.",
    );
    expect(profile.positioning.supporting).toBe(
      "I shape AI products around the decisions people need to make, from learning tools at CK-12 to building Offboard end to end.",
    );
  });
});

describe("project copy", () => {
  it("uses the adopted narrative titles", () => {
    const bySlug = Object.fromEntries(workProjects.map((p) => [p.slug, p]));
    expect(bySlug.offboard.title).toBe(
      "Building a career-transition product around the next useful step",
    );
    expect(bySlug.flexi.title).toBe(
      "Helping students get unstuck without doing the learning for them",
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
