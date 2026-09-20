import { test, expect } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";

/**
 * Accessibility audit (spec §26 — target WCAG 2.2 AA).
 *
 * Automated checks catch perhaps half of what matters, so this runs alongside
 * the keyboard and landmark assertions in the other suites rather than
 * standing in for them. Zero serious or critical violations is the bar.
 */
// Audit the fully readable state, not a transient entrance fade.
test.beforeEach(async ({ page }) => { await page.emulateMedia({ reducedMotion: "reduce" }); });

const ROUTES = [
  "/",
  "/work",
  "/work/ck12-analytics",
  "/experiments/neuron-shift",
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

test("footer links meet the 24px minimum tap target on mobile", async (
  { page },
  testInfo,
) => {
  // WCAG 2.2 AA (2.5.8): tap targets must be at least 24px. Only meaningful
  // at a touch viewport — Plan 016.
  test.skip(testInfo.project.name !== "mobile", "mobile only");
  await page.goto("/");

  const heights = await page.evaluate(() =>
    [...document.querySelectorAll("footer a")].map(
      (a) => a.getBoundingClientRect().height,
    ),
  );

  expect(heights.length).toBeGreaterThan(0);
  for (const height of heights) {
    expect(height).toBeGreaterThanOrEqual(24);
  }
});

test("the evaluator dialog is accessible when open", async ({ page }) => {
  // Dialogs are where focus management usually breaks, so it is audited open
  // rather than only in its closed state.
  await page.goto("/");
  // Plan 012: the trigger lives inside the Ask panel, now the homepage's
  // persistent rail. On desktop it is already on screen at paint; below xl
  // it still stacks after the rest of the homepage (spec §10), so
  // approaching it is what triggers the lazy-loaded runtime that renders
  // this button (spec §27).
  //
  // Below xl, `Canvas` renders the rail in a structurally different tree
  // than on xl+ (a stacked `<div>` vs. a `PersistentPanelGroup` pane) —
  // `useMinWidth` reports desktop for the first client render even on a
  // real mobile viewport (matching SSR) and corrects one effect later,
  // unmounting and remounting the rail's subtree. Retrying the whole action
  // rides out a `goto` that lands mid-swap.
  await page.getByRole("button", { name: "Ask Louie", exact: true }).click();
  await expect(page.locator("#ask-ai-louie")).toBeVisible();
  await page.getByRole("button", { name: "Paste a job description" }).click();
  await expect(page.getByRole("dialog", { name: "Evaluating Louie for a role?" })).toBeVisible();

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
