import { describe, expect, it } from "vitest";

import { condensePeriod } from "./period";

describe("condensePeriod", () => {
  it("keeps years only", () => {
    expect(condensePeriod("May 2016 - May 2025")).toBe("2016 to 2025");
  });
  it("reads Present as now", () => {
    expect(condensePeriod("May 2025 - Present")).toBe("2025 to now");
  });
  it("collapses a single year", () => {
    expect(condensePeriod("Jan 2020 - Dec 2020")).toBe("2020");
  });
  it("passes unknown formats through", () => {
    expect(condensePeriod("Spring term")).toBe("Spring term");
  });
});
