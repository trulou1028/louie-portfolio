import { test, expect } from "@playwright/test";

const NAV = [
  { label: "Home", path: "/" },
  { label: "Work", path: "/work" },
  { label: "About", path: "/about" },
  { label: "Resume", path: "/resume" },
];

test("homepage leads with Offboard, then the LUMO pair, the CK-12 pair, and independent projects", async ({ page }, testInfo) => {
  await page.goto("/");
  await expect(page.getByRole("heading", { level: 1, name: "I make complex things feel simple." })).toBeVisible();
  await expect(page.locator("main canvas")).toHaveCount(0);
  const featured = page.getByTestId("featured-work");
  await expect(featured).toHaveCount(1);
  const projectLinks = featured.locator('a[href^="/work/"]');
  const destinations = await projectLinks.evaluateAll((els) => els.map((el) => el.getAttribute("href")));
  expect(destinations).toEqual(["/work/offboard", "/work/lumo", "/work/lumo-evals", "/work/ck12-analytics", "/work/flexi"]);
  // Plan 051: one card anatomy. A screenshot, a meta line, and the title;
  // no wordmark, no plate, and no summary (the title carries the argument).
  await expect(featured.locator("img")).toHaveCount(5);
  await expect(featured.getByText("Separate prediction from diagnosis.", { exact: false })).toHaveCount(0);
  await expect(featured.getByText("CK-12 Foresights & Insights · Lead Product Designer")).toBeVisible();

  const independent = page.getByTestId("independent-work");
  for (const slug of ["motif", "transfersight", "neuron-shift"]) {
    await expect(independent.locator(`a[href="/experiments/${slug}"]`)).toHaveCount(1);
  }
  await expect(featured.locator('a[href^="/experiments/"]')).toHaveCount(0);
  await expect(independent.locator("img")).toHaveCount(3);
  await expect(page.locator("[data-pending-asset]")).toHaveCount(0);
  await page.waitForTimeout(1_000);

  // Offboard spans the row; the LUMO pair shares the next row on desktop
  // and stacks on mobile. The CK-12 pair follows the same way.
  const tiles = featured.locator("article");
  await expect(tiles).toHaveCount(5);
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

test("the hero is the headline, one sentence, and one link", async ({ page }) => {
  await page.goto("/");
  const hero = page.getByRole("region", { name: "Introduction" });
  await expect(hero.getByRole("link", { name: "Explore my work" })).toHaveAttribute("href", "#work");
  // One link. Asking lives in the Ask Louie panel (Plan 051).
  await expect(hero.getByRole("link")).toHaveCount(1);
  await expect(hero.getByRole("button")).toHaveCount(0);
  await expect(hero.getByRole("textbox")).toHaveCount(0);
  await expect(hero.getByText("I design and build AI-powered products that help people learn, navigate complexity, and make better decisions.")).toBeVisible();
  // The work record is its own section, outside the hero.
  await expect(hero.getByRole("list", { name: "Experience" })).toHaveCount(0);
  await expect(page.getByRole("region", { name: /Experience/ }).getByRole("list", { name: "Experience" })).toHaveCount(1);
});

test("the headline lands quickly, without waiting on JavaScript", async ({ page }) => {
  await page.emulateMedia({ reducedMotion: "no-preference" });
  await page.goto("/");
  const heading = page.getByRole("heading", { level: 1 });
  // No JS-gated reveal around the hero (audit finding 1).
  await expect(heading.locator("xpath=ancestor::*[@data-motion-reveal]")).toHaveCount(0);
  // The entrance is CSS and short. Check its configured timing rather than
  // the wall clock, which a parallel test run stretches: every word's delay
  // plus duration ends within 1.3s of first paint.
  const ends = await heading.evaluate((h) => [...h.querySelectorAll(".hero-word")].map((word) => {
    const style = getComputedStyle(word);
    return (parseFloat(style.animationDelay) + parseFloat(style.animationDuration)) * 1000;
  }));
  expect(ends).toHaveLength(6);
  for (const end of ends) expect(end).toBeLessThanOrEqual(1_300);
  // And it finishes visible.
  await expect.poll(() => heading.locator(".hero-word").evaluateAll((words) => words.every((word) => getComputedStyle(word).opacity === "1")), { timeout: 5_000 }).toBe(true);
});

test("the headline reads as one sentence, with its screens and underline for sighted visitors", async ({ page, isMobile }) => {
  await page.goto("/");
  const heading = page.getByRole("heading", { level: 1 });
  await expect(heading).toHaveAccessibleName("I make complex things feel simple.");
  // Two stacks of three real screens, decorative only.
  await expect(heading.locator(".hero-shot")).toHaveCount(2);
  await expect(heading.locator(".hero-shot img")).toHaveCount(6);
  for (const alt of await heading.locator(".hero-shot img").evaluateAll((imgs) => imgs.map((img) => img.getAttribute("alt")))) expect(alt).toBe("");
  // The lime line sits behind "feel simple."
  await expect(heading.locator(".hero-neon")).toHaveText("feel simple.");
  // Hover previews are laid out at full size, not scaled-up thumbnails, so
  // they stay sharp. Touch screens have no hover and render none.
  const preview = await heading.locator(".hero-preview").first().evaluate((el) => (el as HTMLElement).offsetWidth);
  if (isMobile) expect(preview).toBe(0);
  else expect(preview).toBeGreaterThanOrEqual(320);
});

test("with reduced motion, the headline is simply there", async ({ page }) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("/");
  const heading = page.getByRole("heading", { level: 1 });
  const state = await heading.evaluate((h) => ({
    words: [...h.querySelectorAll(".hero-word")].map((word) => getComputedStyle(word).opacity),
    firstShots: [...h.querySelectorAll(".hero-shot img:first-child")].map((img) => getComputedStyle(img).opacity),
    underline: getComputedStyle(h.querySelector(".hero-neon")!, "::after").transform,
  }));
  expect(state.words.every((opacity) => opacity === "1")).toBe(true);
  expect(state.firstShots).toEqual(["1", "1"]);
  expect(state.underline).toBe("none");
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

test.describe("arrival on the desktop homepage", () => {
  // A first-time visitor: no remembered close (see playwright.config.ts).
  test.use({ storageState: { cookies: [], origins: [] } });

  test("Ask Louie opens beside the page without taking focus, and stays closed once closed", async ({ page, isMobile }) => {
    await page.goto("/");
    const dialog = page.getByRole("dialog", { name: "Ask Louie", exact: true });
    if (isMobile) {
      // Phones keep the page: the panel would cover it.
      await expect(dialog).toHaveCount(0);
      return;
    }
    await expect(dialog).toBeVisible();
    expect(await page.evaluate(() => Boolean(document.activeElement?.closest("#ask-ai-louie")))).toBe(false);
    // Docked: the page narrows beside it.
    expect(await page.evaluate(() => document.documentElement.hasAttribute("data-ask-docked"))).toBe(true);
    await dialog.getByRole("button", { name: "Close", exact: true }).click();
    await expect(dialog).toBeHidden();
    await page.reload();
    await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
    await page.waitForTimeout(500);
    await expect(dialog).toHaveCount(0);
  });

  test("other pages do not open it", async ({ page }) => {
    await page.goto("/work");
    await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
    await page.waitForTimeout(500);
    await expect(page.getByRole("dialog", { name: "Ask Louie", exact: true })).toHaveCount(0);
  });

  test("a narrow desktop window keeps the page instead", async ({ page, isMobile }) => {
    test.skip(isMobile, "desktop widths only");
    await page.setViewportSize({ width: 1100, height: 900 });
    await page.goto("/");
    await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
    await page.waitForTimeout(500);
    await expect(page.getByRole("dialog", { name: "Ask Louie", exact: true })).toHaveCount(0);
  });
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

test("every page's content starts at the header's left edge", async ({ page, isMobile }) => {
  test.skip(isMobile, "the desktop header");
  test.slow();
  for (const path of ["/about", "/resume", "/ai-systems", "/experiments", "/writing", "/experiments/motif", "/work", "/work/offboard"]) {
    await page.goto(path);
    const name = await page.getByRole("link", { name: /Louie Sakoda, home/ }).boundingBox();
    const title = await page.locator("main h1").boundingBox();
    expect(Math.abs(title!.x - name!.x), path).toBeLessThanOrEqual(2);
  }
});

test("the Ask Louie panel resizes by dragging its edge or with the keyboard", async ({ page, isMobile }) => {
  test.skip(isMobile, "the panel docks on desktop only");
  await page.goto("/work/offboard");
  await page.getByRole("button", { name: "Ask Louie", exact: true }).click();
  const panel = page.locator("#ask-ai-louie");
  await expect(panel).toBeVisible();
  const handle = page.getByRole("separator", { name: "Resize Ask Louie panel" });
  await expect(handle).toHaveAttribute("aria-valuenow", "420");
  await page.waitForTimeout(400);
  const box = (await handle.boundingBox())!;
  await page.mouse.move(box.x + box.width / 2, box.y + 300);
  await page.mouse.down();
  await page.mouse.move(box.x + box.width / 2 - 180, box.y + 300, { steps: 6 });
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
  await expect(page.getByRole("separator", { name: "Resize Ask Louie panel" })).toHaveAttribute("aria-valuenow", "360");
});

test("contact details are one click away on every page", async ({ page, isMobile }) => {
  await page.goto("/work/flexi");
  if (isMobile) await page.getByRole("button", { name: "Open navigation menu" }).click();
  else await page.getByRole("button", { name: "Let’s talk" }).click();
  const email = page.getByRole("link", { name: "louie.sakoda@gmail.com" });
  await expect(email).toBeVisible();
  await expect(email).toHaveAttribute("href", "mailto:louie.sakoda@gmail.com");
  await expect(page.getByRole("button", { name: "Copy email address" })).toBeVisible();
});
