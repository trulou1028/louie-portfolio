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
    // Louie's copy, 2026-10-15 (Plan 051, README "Deviations" ledger).
    // This is not the spec §11 wording.
    expect(profile.positioning.primary).toBe("I make complex things feel simple.");
    expect(profile.positioning.supporting).toBe(
      "I design and build AI-powered products that help people learn, navigate complexity, and make better decisions.",
    );
  });
});

describe("project copy", () => {
  it("uses the adopted narrative titles", () => {
    const bySlug = Object.fromEntries(workProjects.map((p) => [p.slug, p]));
    expect(bySlug.offboard.title).toBe(
      "Offboard Job Search Platform",
    );
    expect(bySlug.flexi.title).toBe(
      "CK-12 Flexi AI Tutor",
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
