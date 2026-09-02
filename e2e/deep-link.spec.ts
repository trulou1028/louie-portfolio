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

  test("a second reveal clears the first target's highlight instead of stacking", async ({
    page,
  }) => {
    // Regression: each reveal used to close over its own `target` in one
    // shared `timeout`, so a second reveal within HIGHLIGHT_MS canceled the
    // first target's *timer* without removing its *attribute* — the first
    // section stayed highlighted forever while only the second one's removal
    // was scheduled. Two reveals in quick succession is a real sequence (the
    // mount pass racing a `hashchange`), not a hypothetical.
    const highlighted = page.locator('[data-highlight="true"]');

    // First pass: prove both timers eventually clear (no permanent glow).
    await page.goto("/work/offboard#context");
    await expect(page.locator("#context")).toHaveAttribute(
      "data-highlight",
      "true",
    );
    await page.waitForTimeout(300); // well within the 500ms budget
    await page.evaluate(() => {
      window.location.hash = "system";
    });
    await page.waitForTimeout(1_700); // > HIGHLIGHT_MS past the second reveal
    await expect(highlighted).toHaveCount(0);

    // Second pass: prove only one section glows at a time, not two. If the
    // old bug were back, both #context and #system would carry the
    // attribute at this midpoint.
    await page.goto("/work/offboard#context");
    await expect(page.locator("#context")).toHaveAttribute(
      "data-highlight",
      "true",
    );
    await page.waitForTimeout(300);
    await page.evaluate(() => {
      window.location.hash = "system";
    });
    await page.waitForTimeout(800); // < HIGHLIGHT_MS: still mid-flight
    await expect(highlighted).toHaveCount(1);
    await expect(page.locator("#system")).toHaveAttribute(
      "data-highlight",
      "true",
    );
    await expect(page.locator("#context")).not.toHaveAttribute(
      "data-highlight",
      "true",
    );
  });

  test("navigating away and back leaves no stranded highlight", async ({
    page,
  }) => {
    // Regression: the effect cleanup on route change canceled the pending
    // timer but never removed the attribute, so a section could stay
    // accent-washed after navigating away and back.
    await page.goto("/work/offboard#context");
    await expect(page.locator("#context")).toHaveAttribute(
      "data-highlight",
      "true",
    );

    await page.goto("/about");
    await page.goBack();

    await page.waitForTimeout(1_700); // > HIGHLIGHT_MS, well past any expiry
    await expect(page.locator('[data-highlight="true"]')).toHaveCount(0);
  });
});
