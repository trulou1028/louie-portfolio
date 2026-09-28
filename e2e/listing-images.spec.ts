import { test, expect } from "@playwright/test";

// Plan 037: projects sit on plates. "/" and "/work" both show three case
// studies (wordmark, hero screenshot, one real gallery image each) and the
// Neuron Shift experiment (hero screenshot only): ten images.
for (const path of ["/", "/work"]) {
  test(`${path} loads and its project images decode`, async ({ page }) => {
    await page.goto(path);
    const images = page.locator("main article img");
    await expect(images).toHaveCount(10);
    for (const image of await images.all()) {
      await image.scrollIntoViewIfNeeded();
      await expect.poll(() => image.evaluate((node) => (node as HTMLImageElement).naturalWidth)).toBeGreaterThan(0);
    }
  });
}

test("project plates put copy beside the screenshot on desktop and above it on mobile", async ({ page, isMobile }) => {
  await page.goto("/work");
  const plate = page.locator("main article").filter({ has: page.locator('a[href="/work/offboard"]') });
  await plate.scrollIntoViewIfNeeded();
  const image = await plate.locator('img[alt^="Offboard application packet"]').boundingBox();
  const title = await plate.locator("h3").boundingBox();
  expect(image).not.toBeNull();
  expect(title).not.toBeNull();
  if (isMobile) expect(image!.y).toBeGreaterThan(title!.y + title!.height);
  else expect(image!.x).toBeGreaterThan(title!.x + title!.width);
});
