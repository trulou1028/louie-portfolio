import { test, expect } from "@playwright/test";

const NAV = [
  { label: "Home", path: "/" },
  { label: "Work", path: "/work" },
  { label: "About", path: "/about" },
  { label: "Resume", path: "/resume" },
];

test("homepage stacks the work, then my own projects, then where I've worked", async ({ page }) => {
  await page.goto("/");
  await expect(page.getByRole("heading", { level: 1, name: "Louie Sakoda" })).toBeVisible();
  await expect(page.getByRole("img", { name: /A line drawing of Louie/ })).toBeVisible();

  const featured = page.getByTestId("featured-work");
  await expect(featured.getByRole("heading", { level: 2, name: "Work I’m proud of" })).toBeVisible();
  const destinations = await featured.locator("article h3 a").evaluateAll((els) => els.map((el) => el.getAttribute("href")));
  expect(destinations).toEqual(["/work/offboard", "/work/lumo", "/work/lumo-evals", "/work/ck12-analytics", "/work/flexi"]);
  // Each row is a short paragraph beside the project's name and years.
  const first = featured.locator("article").first();
  await expect(first.getByText("People in a career transition rebuild the same context", { exact: false })).toBeVisible();
  await expect(first.getByText("2025 to now")).toBeVisible();

  const independent = page.getByTestId("independent-work");
  const own = await independent.locator("article h3 a").evaluateAll((els) => els.map((el) => el.getAttribute("href")));
  expect(own).toEqual(["/experiments/motif", "/experiments/transfersight", "/experiments/neuron-shift"]);
  await expect(page.locator("[data-pending-asset]")).toHaveCount(0);
});

test("hovering a project shows its screenshot in the left column", async ({ page, isMobile }) => {
  test.skip(isMobile, "touch screens have no hover");
  await page.goto("/");
  const frames = page.locator(".preview-frame");
  await expect(frames).toHaveCount(8);
  await expect(page.locator(".preview-frame[data-on]")).toHaveCount(0);
  await page.getByTestId("featured-work").locator("article").nth(2).hover();
  await expect(page.locator(".preview-frame[data-on]")).toHaveCount(1);
  await expect(frames.nth(2)).toHaveAttribute("data-on", "");
  await page.mouse.move(5, 5);
  await expect(page.locator(".preview-frame[data-on]")).toHaveCount(0);
  // The paragraph's own screenshot stays hidden where the preview works.
  await expect(page.locator(".stacked-inline-media").first()).toBeHidden();
});

test("narrow screens show each screenshot under its paragraph", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/");
  const media = page.getByTestId("featured-work").locator("article").first().locator(".stacked-inline-media");
  await media.scrollIntoViewIfNeeded();
  await expect(media).toBeVisible();
  await expect(page.locator(".preview-slot")).toBeHidden();
});

test("the record lists where Louie has worked", async ({ page }) => {
  await page.goto("/");
  const record = page.getByRole("list", { name: "Experience" });
  for (const company of ["Offboard", "Odyssey", "CK-12 Foundation", "Lowe’s"]) {
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

test.describe("arrival", () => {
  for (const size of [{ width: 1440, height: 900 }, { width: 390, height: 844 }]) {
    test(`Ask Louie starts closed at ${size.width}px on every visit`, async ({ page }) => {
      await page.setViewportSize(size);
      await page.goto("/");
      await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
      await page.waitForTimeout(500);
      await expect(page.getByRole("dialog", { name: "Ask Louie", exact: true })).toHaveCount(0);
      expect(await page.evaluate(() => document.documentElement.hasAttribute("data-ask-docked"))).toBe(false);
    });
  }
});

test("the first case study starts on the first screen at 1440x900", async ({ page }) => {
  // Stacked redesign: on a phone the intro comes first, so only the
  // desktop first screen is held to this.
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto("/");
  const row = page.getByTestId("featured-work").locator("article").first();
  await expect(row).toBeVisible();
  const box = await row.boundingBox();
  expect(box!.y).toBeLessThan(900 - 150);
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
  test("every page carries the same links in its left column", async ({ page }) => {
    for (const path of ["/", "/about", "/resume", "/work/offboard"]) {
      await page.goto(path);
      await expect(page.getByRole("banner")).toHaveCount(0);
      const nav = page.getByRole("navigation", { name: "Primary" });
      await expect(nav).toBeVisible();
      expect(await nav.getByRole("link").allTextContents(), path).toEqual(["Work", "About", "Résumé", "LinkedIn (opens in a new tab)", "louie.sakoda@gmail.com", "Book a call (opens in a new tab)"]);
    }
    await page.goto("/about");
    await expect(page.getByRole("navigation", { name: "Primary" }).getByRole("link", { name: "About" })).toHaveAttribute("aria-current", "page");
  });
  test("Ask Louie is a button near the top of every page", async ({ page }) => {
    for (const [path, name] of [["/", "Ask Louie"], ["/about", "Ask Louie"], ["/resume", "Ask Louie"], ["/work/flexi", "Ask about this project"]]) {
      await page.goto(path);
      const button = page.getByRole("button", { name, exact: true });
      await expect(button, path).toBeInViewport();
      // The blue fill (#1A10E6; the HSL token rounds by one).
      await expect(button).toHaveCSS("background-color", /^rgb\(2[67], 16, 2(29|30)\)$/);
    }
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

test("Ask Louie lives in navigation and retains a draft across routes", async ({ page }) => {
  await page.goto("/");
  await expect(page.getByRole("button", { name: "Ask Louie", exact: true })).toHaveCount(1);
  const trigger = page.getByRole("button", { name: "Ask Louie", exact: true });
  await trigger.click();
  const dialog = page.getByRole("dialog", { name: "Ask Louie", exact: true });
  await dialog.getByRole("textbox", { name: "Ask anything about Louie's work" }).fill("Tell me about Offboard");
  await dialog.getByRole("button", { name: "Close", exact: true }).click();
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



test("the Ask Louie panel resizes by dragging its edge or with the keyboard", async ({ page, isMobile }) => {
  test.skip(isMobile, "the panel docks on desktop only");
  await page.goto("/about");
  await page.getByRole("button", { name: "Ask Louie", exact: true }).click();
  const panel = page.locator("#ask-ai-louie");
  await expect(panel).toBeVisible();
  const handle = page.getByRole("separator", { name: "Resize Ask Louie panel" });
  await expect(handle).toHaveAttribute("aria-valuenow", "350");
  expect(Math.abs((await panel.boundingBox())!.width - 350)).toBeLessThanOrEqual(1);
  await page.waitForTimeout(400);
  const box = (await handle.boundingBox())!;
  await page.mouse.move(box.x + box.width / 2, box.y + 300);
  await page.mouse.down();
  await page.mouse.move(box.x + box.width / 2 - 250, box.y + 300, { steps: 6 });
  await page.mouse.up();
  await expect.poll(async () => Math.round((await panel.boundingBox())!.width)).toBeGreaterThanOrEqual(590);
  // The page narrows by the same amount.
  await expect.poll(async () => {
    const scroller = (await page.locator("[data-canvas-scroll]").boundingBox())!;
    return scroller.x + scroller.width <= (await panel.boundingBox())!.x + 1;
  }).toBe(true);
  // Remembered across a reload.
  await page.reload();
  await page.getByRole("button", { name: "Ask Louie", exact: true }).click();
  await expect(page.getByRole("separator", { name: "Resize Ask Louie panel" })).toHaveAttribute("aria-valuenow", /^(59\d|60\d)$/);
  // Keyboard: Home is the narrowest width.
  await page.getByRole("separator", { name: "Resize Ask Louie panel" }).focus();
  await page.keyboard.press("Home");
  await expect(page.getByRole("separator", { name: "Resize Ask Louie panel" })).toHaveAttribute("aria-valuenow", "350");
});

test("contact details are one click away on every page", async ({ page }) => {
  for (const path of ["/", "/about", "/work/flexi"]) {
    await page.goto(path);
    const email = page.getByRole("link", { name: "louie.sakoda@gmail.com" });
    await expect(email, path).toBeVisible();
    await expect(email).toHaveAttribute("href", "mailto:louie.sakoda@gmail.com");
  }
});

