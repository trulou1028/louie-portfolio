import { test, expect } from "@playwright/test";

test("the reading rail follows scrolling without changing the URL", async ({ page, isMobile }) => {
  test.skip(isMobile, "The persistent reading rail is desktop-only");
  await page.goto("/work/offboard");
  const nav = page.getByRole("navigation", { name: "On this page" });
  for (const id of ["context", "decision-control", "architecture", "outcomes", "system"]) {
    await page.locator(`#${id}`).evaluate(el => el.scrollIntoView({ block: "start", behavior: "instant" }));
    await expect(nav.locator(`[href="#${id}"]`)).toHaveAttribute("aria-current", "location");
    await expect(nav.locator(`[href="#${id}"]`)).toHaveCSS("border-left-width", "0px");
    await expect(nav.locator('[aria-current="location"]')).toHaveCount(1);
    await expect(page).toHaveURL(/\/work\/offboard$/);
  }
});

test("case-study sections visibly animate on scroll and then settle", async ({ page }) => {
  await page.emulateMedia({ reducedMotion: "no-preference" });
  await page.goto("/work/offboard");
  await expect(page.locator("article > [data-motion-reveal]")).toHaveAttribute("data-motion-state", "complete");
  const section = page.locator("#product");
  const reveal = section.locator("[data-motion-reveal]").first();
  await section.evaluate(el => el.scrollIntoView({ block: "center", behavior: "instant" }));
  await expect.poll(() => reveal.evaluate(el => el.getAnimations({ subtree: true }).filter(a => a.playState === "running").length)).toBeGreaterThan(0);
  // Catch CSS minification from milliseconds to seconds: a unit parsing
  // error previously reduced the visible transition to less than 1ms.
  expect(await reveal.evaluate(el => Number(el.getAnimations({ subtree: true })[0]?.effect?.getTiming().duration))).toBe(700);
  const delays = await reveal.evaluate(el => el.getAnimations({ subtree: true }).map(a => a.effect?.getTiming().delay ?? 0));
  expect(new Set(delays).size).toBeGreaterThan(1);
  await expect(reveal).toHaveAttribute("data-motion-state", "complete");
  await expect(reveal).toHaveCSS("transform", "none");
  await expect(reveal).toHaveCSS("opacity", "1");
});

test("Work leads with Offboard and uses the requested violet accent", async ({ page }) => {
  await page.goto("/work");
  await expect(page.locator('main a[href^="/work/"]').first()).toHaveAttribute("href", "/work/offboard");
  await expect(page.locator('main a[href="/work/offboard"] .text-accent').first()).toHaveCSS("color", "rgb(163, 126, 255)");
});

test("homepage section headings participate in motion and experience is current", async ({ page }) => {
  await page.goto("/");
  for (const heading of await page.locator("main h2").all()) {
    expect(await heading.evaluate(el => Boolean(el.closest("[data-motion-reveal]")))).toBe(true);
  }
  await expect(page.getByText("14+ years designing digital products", { exact: true })).toHaveCount(1);
});
