import { test, expect } from "@playwright/test";

/**
 * Deep-link behavior (spec §18 Tool 2, §26).
 *
 * This is the contract AI navigation depends on in Plan 006: arriving from a
 * pasted link and arriving because AI Louie sent you must behave identically.
 * If any of this regresses, "Open evidence" stops paying off.
 */
test.describe("deep links into case studies", () => {
  test("scrolls the target section into view", async ({ page }) => {
    await page.goto("/work/offboard#decision-control");
    const section = page.locator("#decision-control");
    await expect(section).toBeInViewport();
  });

  test("moves focus to the target section", async ({ page }) => {
    // Keyboard and screen-reader users must continue from the destination,
    // not from the top of the document.
    await page.goto("/work/flexi#decision-teacher");
    await expect(page.locator("#decision-teacher")).toBeFocused();
  });

  test("highlights the target, then clears the highlight", async ({ page }) => {
    await page.goto("/work/offboard#decision-risk");
    const section = page.locator("#decision-risk");

    await expect(section).toHaveAttribute("data-highlight", "true");

    // The wash must actually paint, not just set an attribute.
    const painted = await section.evaluate(
      (el) => getComputedStyle(el).backgroundColor,
    );
    expect(painted).not.toBe("rgba(0, 0, 0, 0)");

    // ...and it must clear, so the page does not stay marked up.
    await expect(section).not.toHaveAttribute("data-highlight", "true", {
      timeout: 4000,
    });
  });

  test("responds to a hash change without a full navigation", async ({
    page,
  }) => {
    // navigate_portfolio (Plan 006) routes client-side; the highlight has to
    // fire on hashchange, not only on first load.
    await page.goto("/work/offboard");
    const section = page.locator("#architecture");
    // Wait for the target to exist before changing the hash: under parallel
    // load the hash can otherwise change before the section has rendered, and
    // the listener finds nothing to highlight.
    await expect(section).toBeAttached();

    await page.evaluate(() => {
      window.location.hash = "architecture";
    });
    await expect(section).toHaveAttribute("data-highlight", "true");
    await expect(section).toBeInViewport();
  });

  test("survives a hash set before the page has hydrated", async ({
    page,
    browserName,
  }) => {
    // Regression. Two things conspire against a hash that arrives in the gap
    // between the HTML painting and the App Router hydrating: the
    // `hashchange` fires before any React effect is listening for it, and
    // then the router `replaceState`s its own canonical URL over the top,
    // erasing the fragment. The deep link then silently did nothing —
    // `navigate_portfolio` (Plan 006) can hit exactly this window.
    // `DeepLinkHighlight` captures the hash at module scope to survive both.
    //
    // Throttling the CPU is what makes the gap wide enough to land in every
    // time. Without it this is a race the suite only loses under parallel
    // load, which is a flaky way to learn about a reproducible bug.
    test.skip(browserName !== "chromium", "CPU throttling is a CDP feature");

    const cdp = await page.context().newCDPSession(page);
    await cdp.send("Emulation.setCPUThrottlingRate", { rate: 8 });

    await page.goto("/work/offboard");
    const section = page.locator("#architecture");
    await expect(section).toBeAttached();

    await page.evaluate(() => {
      window.location.hash = "architecture";
    });

    await expect(section).toHaveAttribute("data-highlight", "true", {
      timeout: 15_000,
    });

    await cdp.send("Emulation.setCPUThrottlingRate", { rate: 1 });
  });

  test("every table-of-contents link deep-links correctly", async ({ page }) => {
    await page.goto("/work/flexi");
    const links = page.locator('nav[aria-label="On this page"] a, details a');
    const hrefs = (
      await links.evaluateAll((els) => els.map((e) => e.getAttribute("href")))
    ).filter(Boolean) as string[];

    expect(hrefs.length).toBeGreaterThan(0);
    for (const href of hrefs) {
      await page.goto(`/work/flexi${href}`);
      await expect(page.locator(href)).toBeInViewport();
    }
  });
});
