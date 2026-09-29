import { test, expect } from "@playwright/test";

// "/" (Plan 038 bento): three case-study tiles (wordmark + screenshot) and
// Neuron Shift (screenshot): seven images. "/work" (Plan 037 plates): the
// same plus the real gallery images: nine. Offboard has none until a
// dashboard screenshot in its updated UI arrives.
for (const [path, count] of [["/", 7], ["/work", 9]] as const) {
  test(`${path} loads and its project images decode`, async ({ page }) => {
    await page.goto(path);
    const images = page.locator("main article img");
    await expect(images).toHaveCount(count);
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
  const image = await plate.locator('img[alt*="Offboard application packet"]').boundingBox();
  const title = await plate.locator("h3").boundingBox();
  expect(image).not.toBeNull();
  expect(title).not.toBeNull();
  if (isMobile) expect(image!.y).toBeGreaterThan(title!.y + title!.height);
  else expect(image!.x).toBeGreaterThan(title!.x + title!.width);
});
