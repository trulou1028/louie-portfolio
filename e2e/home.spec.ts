import { test, expect } from "@playwright/test";

const NAV = [
  { label: "Home", path: "/" },
  { label: "Work", path: "/work" },
  { label: "About", path: "/about" },
  { label: "Resume", path: "/resume" },
];

test("homepage leads with Offboard, then the CK-12 pair, then independent projects", async ({ page }, testInfo) => {
  await page.goto("/");
  await expect(page.getByRole("heading", { level: 1, name: "Complex workflows. Clear decisions." })).toBeVisible();
  await expect(page.locator("main canvas")).toHaveCount(0);
  const featured = page.getByTestId("featured-work");
  await expect(featured).toHaveCount(1);
  const projectLinks = featured.locator('a[href^="/work/"]');
  const destinations = await projectLinks.evaluateAll((els) => els.map((el) => el.getAttribute("href")));
  expect(destinations).toEqual(["/work/offboard", "/work/ck12-analytics", "/work/flexi"]);
  // Case studies: a wordmark and a screenshot each.
  await expect(featured.locator("img")).toHaveCount(6);
  // Each case-study tile carries its one-line summary.
  await expect(featured.getByText("Separate prediction from diagnosis.", { exact: false })).toBeVisible();

  const independent = page.getByTestId("independent-work");
  for (const slug of ["motif", "transfersight", "neuron-shift"]) {
    await expect(independent.locator(`a[href="/experiments/${slug}"]`)).toHaveCount(1);
  }
  await expect(featured.locator('a[href^="/experiments/"]')).toHaveCount(0);
  // Motif and TransferSight: a wordmark and a screenshot. Neuron Shift: a screenshot.
  await expect(independent.locator("img")).toHaveCount(5);
  await expect(page.locator("[data-pending-asset]")).toHaveCount(0);
  await page.waitForTimeout(1_000);

  // Offboard spans the row; the CK-12 pair shares the next row on desktop
  // and stacks on mobile.
  const tiles = featured.locator("article");
  await expect(tiles).toHaveCount(3);
  const [first, second, third] = await Promise.all([0, 1, 2].map((i) => tiles.nth(i).boundingBox()));
  expect(second!.y).toBeGreaterThan(first!.y + first!.height);
  if (testInfo.project.name === "mobile") {
    expect(Math.abs(third!.x - second!.x)).toBeLessThan(2);
    expect(third!.y).toBeGreaterThan(second!.y + second!.height);
  } else {
    expect(first!.width).toBeGreaterThan(second!.width * 1.8);
    expect(Math.abs(third!.y - second!.y)).toBeLessThan(2);
    expect(Math.abs(third!.width - second!.width)).toBeLessThan(2);
  }
  const allWork = featured.getByRole("link", { name: "All work →" });
  await expect(allWork).toHaveAttribute("href", "/work");
  await expect(allWork).not.toHaveAttribute("role", "button");
});

test("the hero keeps its choices few and leads with Offboard", async ({ page, isMobile }) => {
  await page.goto("/");
  const hero = page.getByRole("region", { name: "Introduction" });
  await expect(hero.getByRole("link", { name: "See selected work" })).toHaveAttribute("href", "#work");
  // One link; booking lives in the header's Contact menu and the closing panel.
  await expect(hero.getByRole("link")).toHaveCount(1);
  // Two starter questions, not three.
  await expect(hero.getByRole("list", { name: "Try asking" }).getByRole("listitem")).toHaveCount(2);
  await expect(hero.locator("video")).toHaveCount(0);
  const figure = hero.locator("figure");
  if (isMobile) await expect(figure).toBeHidden();
  else await expect(figure).toContainText("Offboard");
  // The work record is its own section, outside the hero.
  await expect(hero.getByRole("list", { name: "Experience" })).toHaveCount(0);
  await expect(page.getByRole("region", { name: /Experience/ }).getByRole("list", { name: "Experience" })).toHaveCount(1);
});

test("the headline is visible on first paint, on any viewport", async ({ page }) => {
  await page.emulateMedia({ reducedMotion: "no-preference" });
  await page.goto("/");
  const heading = page.getByRole("heading", { level: 1 });
  // No entrance on the hero: every word sits in place at once.
  const offsets = await heading.locator("[data-motion-word]").evaluateAll((words) => words.map((word) => getComputedStyle(word).transform));
  expect(offsets.every((value) => value === "none")).toBe(true);
  await expect(heading.locator("xpath=ancestor::*[@data-motion-reveal]")).toHaveCount(0);
});

test("the headline marks its decision without changing its accessible name", async ({ page }) => {
  await page.goto("/");
  const heading = page.getByRole("heading", { level: 1 });
  await expect(heading).toHaveAccessibleName("Complex workflows. Clear decisions.");
  await expect(heading.locator(".headline-mark")).toContainText("Clear");
  // The tag needs the case studies to explain it, so the homepage omits it.
  await expect(heading.locator(".headline-mark-tag")).toHaveCount(0);
});

test("the hero record lists employers from the resume", async ({ page }) => {
  await page.goto("/");
  const record = page.getByRole("list", { name: "Experience" });
  for (const company of ["Offboard", "CK-12 Foundation", "Odyssey", "Lowe's Companies"]) {
    await expect(record.getByText(company, { exact: true })).toBeVisible();
  }
});

test("Ask Louie is closed on arrival and preserves a draft across closes", async ({ page }) => {
  await page.goto("/");
  const trigger = page.getByRole("button", { name: "Ask Louie", exact: true });
  const dialog = page.getByRole("dialog", { name: "Ask Louie", exact: true });
  await expect(dialog).toHaveCount(0);
  await trigger.focus();
  await page.keyboard.press("Enter");
  await expect(dialog).toBeVisible();
  const input = dialog.getByRole("textbox", { name: "Ask anything about Louie's work" });
  await input.fill("Show me teacher analytics");
  await page.keyboard.press("Escape");
  await expect(dialog).toBeHidden();
  await expect(trigger).toBeFocused();
  await trigger.click();
  await expect(input).toHaveValue("Show me teacher analytics");
  await dialog.getByRole("button", { name: "Close", exact: true }).click();
  await expect(dialog).toBeHidden();
});

test("the existing Ask Louie deep link opens its dialog", async ({ page }) => {
  await page.goto("/#ask-ai-louie");
  await expect(page.getByRole("dialog", { name: "Ask Louie", exact: true })).toBeVisible();
});

test("only the content panes scroll", async ({ page }) => {
  await page.goto("/");
  expect(await page.evaluate(() => document.documentElement.scrollHeight - document.documentElement.clientHeight)).toBeLessThanOrEqual(1);
  await page.getByRole("button", { name: "Ask Louie", exact: true }).click();
  expect(await page.evaluate(() => document.documentElement.scrollHeight - document.documentElement.clientHeight)).toBeLessThanOrEqual(1);
});

test.describe("navigation", () => {
  for (const item of NAV) {
    test(`${item.label} resolves`, async ({ page }) => {
      const response = await page.goto(item.path);
      expect(response?.status()).toBe(200);
      await expect(page.locator("main h1")).toHaveCount(1);
    });
  }
  test("primary navigation stays concise", async ({ page }, testInfo) => {
    await page.goto("/");
    if (testInfo.project.name === "mobile") await page.getByRole("button", { name: "Open navigation menu" }).click();
    const nav = page.getByRole("navigation", { name: "Primary" });
    await expect(nav).toBeVisible();
    expect(await nav.getByRole("link").allTextContents()).toEqual(NAV.map((item) => item.label));
  });
  test("secondary discovery remains reachable", async ({ page }) => {
    await page.goto("/work");
    for (const href of ["/work/flexi", "/experiments/neuron-shift", "/experiments", "/ai-systems"]) {
      await expect(page.locator(`main a[href="${href}"]`).first()).toBeVisible();
    }
    await page.goto("/experiments");
    await expect(page.locator('main a[href="/experiments/voice-tool-calling"]')).toHaveCount(0);
  });
});

test.describe("responsive shell", () => {
  test("mobile drawer closes on Escape and after navigation", async ({ page }, testInfo) => {
    test.skip(testInfo.project.name !== "mobile", "mobile drawer only");
    await page.goto("/");
    const trigger = page.getByRole("button", { name: "Open navigation menu" });
    await expect(page.getByRole("navigation", { name: "Primary" })).toBeHidden();
    await trigger.click();
    await expect(page.getByRole("dialog")).toBeVisible();
    await page.keyboard.press("Escape");
    await expect(page.getByRole("dialog")).toBeHidden();
    await trigger.click();
    await page.getByRole("dialog").getByRole("link", { name: "Work" }).click();
    await expect(page).toHaveURL(/\/work$/);
    await expect(page.getByRole("dialog")).toBeHidden();
  });
  test("no route overflows horizontally", async ({ page }) => {
    // Nine full page loads in one test: triple the budget (it failed in CI
    // when one slow load spent the default 30s).
    test.slow();
    for (const path of [...NAV.map((item) => item.path), "/work/ck12-analytics", "/work/offboard", "/work/flexi", "/experiments/neuron-shift"]) {
      await page.goto(path);
      expect(await page.evaluate(() => document.documentElement.scrollWidth > window.innerWidth + 1), path).toBe(false);
    }
  });
  test("Ask dialog remains usable around the former rail breakpoint", async ({ page }, testInfo) => {
    test.skip(testInfo.project.name !== "desktop", "desktop viewport resize");
    // Five full page loads in one test: triple the budget (CI failed it
    // twice, in September and October 2026, on the default 30s).
    test.slow();
    for (const width of [390, 768, 1023, 1025, 1440]) {
      // Resize on a blank page. Resizing a loaded page makes it request new
      // image sizes, and navigating away at once cancels them; `next start`'s
      // local image optimizer then stalls the same size on the next load
      // (observed September 27, 2026). The subject here is the dialog at
      // each width, not a live resize.
      await page.goto("about:blank");
      await page.setViewportSize({ width, height: 900 });
      await page.goto("/");
      await page.getByRole("button", { name: "Ask Louie", exact: true }).click();
      const input = page.getByRole("textbox", { name: "Ask anything about Louie's work" });
      await expect(input).toBeInViewport();
      await expect(page.locator("#ask-ai-louie")).toHaveCount(1);
      expect(await page.evaluate(() => document.documentElement.scrollWidth > window.innerWidth + 1)).toBe(false);
    }
  });
});

test("Ask Louie lives in navigation and retains a draft across routes", async ({ page, isMobile }) => {
  await page.goto("/");
  await expect(page.locator("main").getByRole("button", { name: "Ask Louie", exact: true })).toHaveCount(0);
  const trigger = page.getByRole("button", { name: "Ask Louie", exact: true });
  await trigger.click();
  const dialog = page.getByRole("dialog", { name: "Ask Louie", exact: true });
  await dialog.getByRole("textbox", { name: "Ask anything about Louie's work" }).fill("Tell me about Offboard");
  await dialog.getByRole("button", { name: "Close", exact: true }).click();
  if (isMobile) await page.getByRole("button", { name: "Open navigation menu" }).click();
  await page.getByRole("navigation", { name: "Primary", exact: true }).getByRole("link", { name: "About", exact: true }).click();
  await expect(page).toHaveURL(/\/about$/);
  await trigger.click();
  await expect(dialog.getByRole("textbox", { name: "Ask anything about Louie's work" })).toHaveValue("Tell me about Offboard");
  await expect(page.locator("#ask-ai-louie")).toHaveCount(1);
});

test("About has one unified closing action section", async ({ page }) => {
  await page.goto("/about");
  const actions = page.getByRole("region", { name: "Let’s start a conversation." });
  await expect(actions.getByRole("link")).toHaveCount(5);
  for (const label of ["View selected work", "Resume", "Email", "LinkedIn", "Book time"]) {
    await expect(actions.getByRole("link", { name: label, exact: true })).toBeVisible();
  }
});

test("homepage centers its frame and aligns header, content, and footer", async ({ page }, testInfo) => {
  test.skip(testInfo.project.name !== "desktop", "desktop viewport coverage");
  for (const width of [1024, 1440, 1680, 1920]) {
    await page.setViewportSize({ width, height: 900 });
    await page.goto("/");
    const geometry = await page.locator(".portfolio-wide").evaluateAll((frames) => frames.map((frame) => {
      const rect = frame.getBoundingClientRect();
      const style = getComputedStyle(frame);
      return { left: rect.left + parseFloat(style.paddingLeft), right: rect.right - parseFloat(style.paddingRight) };
    }));
    // Header, homepage content, and footer.
    expect(geometry).toHaveLength(3);
    const [header, content, footer] = geometry;
    expect(content.left).toBeGreaterThanOrEqual(16);
    expect(Math.abs(content.left - (width - content.right))).toBeLessThan(2);
    expect(content.right - content.left).toBeLessThanOrEqual(1320);
    for (const frame of [header, footer]) {
      expect(Math.abs(frame.left - content.left)).toBeLessThan(1);
      expect(Math.abs(frame.right - content.right)).toBeLessThan(1);
    }
  }
});

test("contact details are one click away on every page", async ({ page, isMobile }) => {
  await page.goto("/work/flexi");
  if (isMobile) await page.getByRole("button", { name: "Open navigation menu" }).click();
  else await page.getByRole("button", { name: "Contact" }).click();
  const email = page.getByRole("link", { name: "louie.sakoda@gmail.com" });
  await expect(email).toBeVisible();
  await expect(email).toHaveAttribute("href", "mailto:louie.sakoda@gmail.com");
  await expect(page.getByRole("button", { name: "Copy email address" })).toBeVisible();
});
