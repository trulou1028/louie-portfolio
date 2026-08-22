import { describe, expect, it } from "vitest";

import { profile } from "@/content/profile";
import { workProjects } from "@/content/work/projects";

describe("hero copy", () => {
  it("keeps the emphasised tail a suffix of the spec headline", () => {
    // The homepage renders the headline in two spans so the tail can be set
    // in accent italic. If these ever drift apart, the rendered heading stops
    // matching the spec §11 wording — silently.
    const { primary, primaryEmphasis } = profile.positioning;
    expect(primary.endsWith(primaryEmphasis)).toBe(true);

    const lead = primary
      .slice(0, primary.length - primaryEmphasis.length)
      .trimEnd();
    expect(`${lead} ${primaryEmphasis}`).toBe(primary);
  });

  it("still carries the exact spec positioning statements", () => {
    expect(profile.positioning.primary).toBe(
      "I design AI products and build them.",
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
