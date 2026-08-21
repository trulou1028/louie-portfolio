import { test, expect } from "@playwright/test";

/**
 * Landmark structure (spec §26).
 *
 * The shell owns the single `<main>`; pages render their content inside it.
 * Nesting a second `<main>` in a page is invalid and gives assistive tech two
 * "main" landmarks — easy to reintroduce, so it is asserted here.
 */
const ROUTES = [
  "/",
  "/work",
  "/work/offboard",
  "/work/flexi",
  "/ai-systems",
  "/experiments",
  "/writing",
  "/about",
  "/resume",
];

for (const route of ROUTES) {
  test(`${route} has exactly one main landmark and one h1`, async ({ page }) => {
    await page.goto(route);

    await expect(page.locator("main")).toHaveCount(1);
    await expect(page.locator("h1")).toHaveCount(1);
  });
}

test("the first tab stop is a skip link", async ({ page }, testInfo) => {
  // Desktop only: iOS Safari has no Tab key, and WebKit does not move focus to
  // links on Tab, so this assertion is meaningless there.
  test.skip(testInfo.project.name !== "desktop", "keyboard navigation is desktop-only");
  await page.goto("/");
  await page.keyboard.press("Tab");
  const focused = page.locator(":focus");
  await expect(focused).toHaveText("Skip to content");
  await expect(focused).toHaveAttribute("href", "#main");
});
