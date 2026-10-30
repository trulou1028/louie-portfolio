import { test, expect } from "@playwright/test";

// "/": the stacked rows show their screenshots under the paragraph on a
// narrow screen; three of the eight rows are recordings, not images.
// "/work": one screenshot per work card, eight.
for (const [path, count] of [["/", 5], ["/work", 8]] as const) {
  test(`${path} loads and its project images decode`, async ({ page }) => {
    if (path === "/") await page.setViewportSize({ width: 390, height: 844 });
    await page.goto(path);
    const images = page.locator("main article img");
    await expect(images).toHaveCount(count);
    for (const image of await images.all()) {
      await image.scrollIntoViewIfNeeded();
      await expect.poll(() => image.evaluate((node) => (node as HTMLImageElement).naturalWidth)).toBeGreaterThan(0);
    }
  });
}

test("Work rows put copy beside the screenshot on desktop and below it on mobile", async ({ page, isMobile }) => {
  await page.goto("/work");
  const plate = page.locator("main article").filter({ has: page.locator('a[href="/work/offboard"]') });
  await plate.scrollIntoViewIfNeeded();
  const image = await plate.locator('img[alt*="Offboard Job Packet"]').boundingBox();
  const title = await plate.locator("h2").boundingBox();
  expect(image).not.toBeNull();
  expect(title).not.toBeNull();
  if (isMobile) expect(title!.y).toBeGreaterThan(image!.y + image!.height);
  else expect(title!.x).toBeGreaterThan(image!.x + image!.width);
});
