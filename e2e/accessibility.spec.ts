import { test, expect } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";

/**
 * Accessibility audit (spec §26 — target WCAG 2.2 AA).
 *
 * Automated checks catch perhaps half of what matters, so this runs alongside
 * the keyboard and landmark assertions in the other suites rather than
 * standing in for them. Zero serious or critical violations is the bar.
 */
const ROUTES = [
  "/",
  "/work",
  "/work/offboard",
  "/work/flexi",
  "/ai-systems",
  "/experiments",
  "/experiments/voice-tool-calling",
  "/writing",
  "/about",
  "/resume",
];

for (const route of ROUTES) {
  test(`${route} has no serious accessibility violations`, async ({ page }) => {
    await page.goto(route);

    const results = await new AxeBuilder({ page })
      .withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa", "wcag22aa"])
      // Base UI renders visually-hidden focus sentinels inside its focus
      // traps. They carry role="button" with no accessible name, which axe
      // flags — but they are library internals we do not control and are
      // inert by design. Excluded knowingly, not to make a number go green;
      // revisit on the next @base-ui/react upgrade.
      .exclude("[data-base-ui-focus-guard]")
      .analyze();

    const blocking = results.violations.filter(
      (violation) =>
        violation.impact === "serious" || violation.impact === "critical",
    );

    // Name the offending selectors so a failure is actionable, not just a count.
    const detail = blocking
      .map(
        (v) =>
          `${v.id} (${v.impact}): ${v.nodes.map((n) => n.target.join(" ")).join(", ")}`,
      )
      .join("\n");

    expect(blocking, `${route}\n${detail}`).toEqual([]);
  });
}

test("the evaluator dialog is accessible when open", async ({ page }) => {
  // Dialogs are where focus management usually breaks, so it is audited open
  // rather than only in its closed state.
  await page.goto("/");
  await page.getByRole("button", { name: "Paste a job description" }).click();
  await expect(page.getByRole("dialog")).toBeVisible();

  const results = await new AxeBuilder({ page })
    .withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa"])
    .exclude("[data-base-ui-focus-guard]")
    .analyze();

  const blocking = results.violations.filter(
    (v) => v.impact === "serious" || v.impact === "critical",
  );
  expect(
    blocking,
    blocking.map((v) => `${v.id}: ${v.help}`).join("\n"),
  ).toEqual([]);
});
