import { test, expect } from "@playwright/test";
import { CASE_STUDY_ANCHORS } from "../lib/routes";

test("all four stories remain readable without JavaScript", async ({ browser }) => {
  const context = await browser.newContext({ javaScriptEnabled: false, viewport: { width: 390, height: 844 } });
  const page = await context.newPage();
  for (const [path, anchors] of Object.entries(CASE_STUDY_ANCHORS)) {
    await page.goto(path);
    await expect(page.locator("article h1")).toHaveCount(1);
    for (const anchor of anchors) {
      expect((await page.locator(`#${anchor.id}`).innerText()).length).toBeGreaterThan(50);
    }
    await expect(page.locator("[data-pending-content], [data-pending-asset]")).toHaveCount(0);
  }
  await context.close();
});

test("assistant and evidence navigation work with reduced motion", async ({ page }) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("/");
  await page.getByRole("button", { name: "Ask Louie", exact: true }).click();
  const dialog = page.getByRole("dialog", { name: "Ask Louie", exact: true });
  await expect(dialog.getByRole("textbox", { name: "Ask anything about Louie's work" })).toBeEnabled();
  await dialog.getByRole("button", { name: "Close", exact: true }).click();
  await expect(dialog).toBeHidden();
  await page.goto("/work/ck12-analytics#decision-investigation");
  await expect(page.locator("#decision-investigation")).toBeInViewport();
});

test("entrances finish visibly and reduced motion skips their animation", async ({ page }) => {
  await page.emulateMedia({ reducedMotion: "no-preference" });
  await page.goto("/");
  const hero = page.locator("[data-motion-reveal]").first();
  await expect(hero).toHaveCSS("opacity", "1");
  await expect(hero).toHaveCSS("transform", "none");
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("/work");
  const card = page.locator('[data-motion-reveal]').first();
  await expect(card).toBeInViewport();
  await expect(card).toHaveCSS("opacity", "1");
  await expect(card).toHaveCSS("transform", "none");
  expect(await card.evaluate(el => el.getAnimations().length)).toBe(0);
});
