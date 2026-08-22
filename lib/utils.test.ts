import { describe, expect, it } from "vitest";

import { cn, TYPE_SCALE } from "@/lib/utils";

/**
 * Regression tests for a silent, wide-reaching bug: tailwind-merge collapsing
 * a custom text *size* and a text *color* into one class group, dropping
 * whichever came first. It shipped a primary button with 3.22:1 contrast.
 */
describe("cn", () => {
  it("keeps a text colour and a custom text size together", () => {
    const result = cn("text-surface", "text-body-sm");
    expect(result).toContain("text-surface");
    expect(result).toContain("text-body-sm");
  });

  it("keeps them together in either order", () => {
    for (const [a, b] of [
      ["text-foreground", "text-body"],
      ["text-body", "text-foreground"],
      ["text-accent", "text-label"],
      ["text-foreground-muted", "text-system"],
    ]) {
      const result = cn(a, b);
      expect(result, `${a} + ${b}`).toContain(a);
      expect(result, `${a} + ${b}`).toContain(b);
    }
  });

  it("covers every size in the spec §8 scale", () => {
    for (const size of TYPE_SCALE) {
      const result = cn("text-accent", `text-${size}`);
      expect(result, size).toContain("text-accent");
      expect(result, size).toContain(`text-${size}`);
    }
  });

  it("still resolves genuine conflicts", () => {
    // Two sizes, or two colours, should still collapse to the last one.
    expect(cn("text-body", "text-body-lg")).toBe("text-body-lg");
    expect(cn("text-foreground", "text-accent")).toBe("text-accent");
    expect(cn("px-2", "px-4")).toBe("px-4");
  });
});
