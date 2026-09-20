import { test, expect } from "@playwright/test";

for (const path of ["/", "/work"]) {
  test(`${path} loads and its project images decode`, async ({ page }) => {
    await page.goto(path);
    const images = page.locator('a[href^="/work/"] img');
    await expect(images).toHaveCount(3);
    for (const image of await images.all()) {
      await image.scrollIntoViewIfNeeded();
      await expect.poll(() => image.evaluate((node) => (node as HTMLImageElement).naturalWidth)).toBeGreaterThan(0);
    }
  });
}

test("project cards retain their responsive split layout inside motion wrappers", async ({ page, isMobile }) => {
  await page.goto("/work");
  const card = page.locator('main a[href="/work/offboard"]');
  await card.scrollIntoViewIfNeeded();
  await expect(card).toHaveCSS("display", "block");
  const image = await card.locator("img").boundingBox();
  const title = await card.locator("h3").boundingBox();
  expect(image).not.toBeNull();
  expect(title).not.toBeNull();
  if (isMobile) expect(title!.y).toBeGreaterThan(image!.y + image!.height);
  else expect(title!.x).toBeGreaterThan(image!.x + image!.width);
});
