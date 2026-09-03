import { test, expect } from "@playwright/test";

/**
 * SEO and machine readability (spec §28).
 *
 * The spec notes this site will increasingly be read by AI systems as well as
 * people, so structured data is treated as a first-class output — and it must
 * agree with what the page actually says.
 */

test("sitemap lists every public page and no internal ones", async ({ request }) => {
  const response = await request.get("/sitemap.xml");
  expect(response.status()).toBe(200);
  const xml = await response.text();

  for (const path of [
    "/work",
    "/work/offboard",
    "/work/flexi",
    "/ai-systems",
    "/experiments",
    "/writing",
    "/about",
    "/resume",
  ]) {
    expect(xml, `${path} missing from sitemap`).toContain(path);
  }

  expect(xml).not.toContain("/design-system");
  expect(xml).not.toContain("/api/");
});

test("robots allows crawling and points at the sitemap", async ({ request }) => {
  const response = await request.get("/robots.txt");
  expect(response.status()).toBe(200);
  const text = await response.text();

  expect(text).toContain("Sitemap:");
  expect(text).toMatch(/Disallow:\s*\/api\//);
  expect(text).toMatch(/Disallow:\s*\/design-system/);
});

test("every page has a distinct title and description", async ({ page }) => {
  const seen = new Map<string, string>();

  for (const path of [
    "/",
    "/work",
    "/work/offboard",
    "/work/flexi",
    "/ai-systems",
    "/experiments",
    "/writing",
    "/about",
    "/resume",
  ]) {
    await page.goto(path);

    const title = await page.title();
    expect(title.length, `${path} has no title`).toBeGreaterThan(10);
    expect(seen.has(title), `${path} duplicates the title of ${seen.get(title)}`).toBe(
      false,
    );
    seen.set(title, path);

    const description = await page
      .locator('meta[name="description"]')
      .getAttribute("content");
    expect(description?.length ?? 0, `${path} has no description`).toBeGreaterThan(20);
  }
});

test("structured data is present and parses", async ({ page }) => {
  await page.goto("/");
  const blocks = await page
    .locator('script[type="application/ld+json"]')
    .allTextContents();

  const parsed = blocks.map((block) => JSON.parse(block));
  const types = parsed.map((entry) => entry["@type"]);

  expect(types).toContain("Person");
  expect(types).toContain("WebSite");

  const person = parsed.find((entry) => entry["@type"] === "Person");
  expect(person.name).toBe("Louie Sakoda");
  // Location was withheld until the resume verified it; now it must agree
  // with that source exactly.
  expect(person.address?.addressLocality).toBe("San Francisco");
  expect(person.sameAs).toContain("https://www.linkedin.com/in/louiesakoda");
});

test("case studies expose CreativeWork matching the visible title", async ({
  page,
}) => {
  await page.goto("/work/offboard");

  const blocks = await page
    .locator('script[type="application/ld+json"]')
    .allTextContents();
  const work = blocks
    .map((b) => JSON.parse(b))
    .find((entry) => entry["@type"] === "CreativeWork");

  expect(work).toBeDefined();
  expect(work.name).toBe(
    "Building an AI-native operating system for the job search",
  );
  // Structured data that disagrees with the page is worse than none.
  await expect(page.getByRole("heading", { level: 1, name: work.name })).toBeVisible();
});

test("OpenGraph metadata is present", async ({ page }) => {
  await page.goto("/");
  for (const property of ["og:title", "og:description", "og:type"]) {
    await expect(
      page.locator(`meta[property="${property}"]`),
    ).toHaveCount(1);
  }
});

const PUBLIC_PATHS = [
  "/", "/work", "/work/offboard", "/work/flexi", "/ai-systems",
  "/experiments", "/writing", "/about", "/resume",
];

test("every page's canonical is its own URL", async ({ page, baseURL }) => {
  for (const path of PUBLIC_PATHS) {
    await page.goto(path);
    const href = await page.locator('link[rel="canonical"]').getAttribute("href");
    // Playwright sets NEXT_PUBLIC_SITE_URL to baseURL, so this is exact.
    expect(href, `${path} canonical`).toBe(`${baseURL}${path === "/" ? "" : path}`);
  }
});

test("a share image is declared and actually serves", async ({ page, request }) => {
  await page.goto("/");
  const image = page.locator('meta[property="og:image"]');
  await expect(image).toHaveCount(1);
  const src = await image.getAttribute("content");
  expect(src).toBeTruthy();
  const response = await request.get(src!);
  expect(response.status()).toBe(200);
  expect(response.headers()["content-type"]).toContain("image/png");
});

test("security headers are present", async ({ request }) => {
  const response = await request.get("/");
  const headers = response.headers();
  expect(headers["x-content-type-options"]).toBe("nosniff");
  expect(headers["referrer-policy"]).toBe("strict-origin-when-cross-origin");
  expect(headers["x-frame-options"]).toBe("DENY");
  expect(headers["content-security-policy"]).toContain("frame-ancestors 'none'");
  expect(headers["content-security-policy"]).toContain("img-src 'self' data:");
  // Enforcing, not report-only: WebKit ignores report-only without report-to.
  expect(headers["content-security-policy-report-only"]).toBeUndefined();
});
