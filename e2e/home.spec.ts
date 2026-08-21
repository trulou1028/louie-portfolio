import { test, expect } from "@playwright/test";

/**
 * Homepage and shell behavior (spec §10, §11, §25, §26).
 *
 * These assert the things a later refactor could silently break: the exact
 * positioning copy, that every nav destination resolves, that the mobile
 * drawer works by keyboard, and that nothing overflows horizontally.
 */

const NAV = [
  { label: "Home", path: "/" },
  { label: "Work", path: "/work" },
  { label: "AI Systems", path: "/ai-systems" },
  { label: "Experiments", path: "/experiments" },
  { label: "Writing", path: "/writing" },
  { label: "About", path: "/about" },
  { label: "Resume", path: "/resume" },
];

test.describe("homepage", () => {
  test("renders the positioning copy verbatim", async ({ page }) => {
    await page.goto("/");

    await expect(
      page.getByRole("heading", {
        level: 1,
        name: "I design AI products and build them.",
      }),
    ).toBeVisible();

    await expect(
      page.getByText(
        "Product designer working across AI systems, complex workflows, design engineering, and product strategy.",
      ),
    ).toBeVisible();

    await expect(
      page.getByText("AI PRODUCT DESIGN · SYSTEMS · DESIGN ENGINEERING"),
    ).toBeVisible();
  });

  test("hero actions are links, not buttons", async ({ page }) => {
    // A navigation control announced as a button misleads assistive tech.
    await page.goto("/");
    const viewWork = page.getByRole("link", { name: "View selected work" });
    await expect(viewWork).toHaveAttribute("href", "/work");
    await expect(viewWork).not.toHaveAttribute("role", "button");
  });

  test("shows both case studies with their spec titles", async ({ page }) => {
    await page.goto("/");
    await expect(
      page.getByRole("heading", {
        name: "Building an AI-native operating system for the job search",
      }),
    ).toBeVisible();
    await expect(
      page.getByRole("heading", {
        name: "Designing an AI tutor that helps students learn instead of simply giving them answers",
      }),
    ).toBeVisible();
  });

  test("AI surface offers working suggestions and no live composer", async ({
    page,
  }) => {
    await page.goto("/");

    // The composer must be visibly disabled rather than silently inert.
    await expect(page.locator("#ai-composer")).toBeDisabled();

    // Every suggestion goes somewhere real — no dead controls (spec §11).
    const chips = page.locator('[data-slot="prompt-chip"]');
    await expect(chips).toHaveCount(5);
    for (const chip of await chips.all()) {
      await expect(chip).toHaveAttribute("href", /^\/work\//);
    }
  });

  test("suggestion chips are keyboard reachable", async ({ page }) => {
    await page.goto("/");
    const chip = page.locator('[data-slot="prompt-chip"]').first();
    await chip.focus();
    await expect(chip).toBeFocused();
    await page.keyboard.press("Enter");
    await expect(page).toHaveURL(/\/work\/offboard/);
  });
});

test.describe("navigation", () => {
  test("every primary destination resolves", async ({ page }) => {
    for (const item of NAV) {
      const response = await page.goto(item.path);
      expect(response?.status(), `${item.path} should return 200`).toBe(200);
      await expect(page.locator("h1")).toBeVisible();
    }
  });
});

test.describe("responsive shell", () => {
  test("desktop shows the persistent left rail", async ({ page }, testInfo) => {
    test.skip(testInfo.project.name !== "desktop", "desktop only");
    await page.goto("/");
    await expect(
      page.getByRole("navigation", { name: "Primary" }),
    ).toBeVisible();
  });

  test("mobile uses the drawer and closes on Escape", async ({
    page,
  }, testInfo) => {
    test.skip(testInfo.project.name !== "mobile", "mobile only");
    await page.goto("/");

    // The persistent rail must not be present on mobile (spec §25).
    await expect(page.getByRole("navigation", { name: "Primary" })).toBeHidden();

    await page.getByRole("button", { name: "Open navigation menu" }).click();
    const drawer = page.getByRole("dialog");
    await expect(drawer).toBeVisible();

    await page.keyboard.press("Escape");
    await expect(drawer).toBeHidden();
  });

  test("mobile drawer navigates and dismisses", async ({ page }, testInfo) => {
    test.skip(testInfo.project.name !== "mobile", "mobile only");
    await page.goto("/");
    await page.getByRole("button", { name: "Open navigation menu" }).click();
    await page.getByRole("dialog").getByRole("link", { name: "Work" }).click();
    await expect(page).toHaveURL(/\/work$/);
    await expect(page.getByRole("dialog")).toBeHidden();
  });

  test("no horizontal overflow on any primary route", async ({ page }) => {
    for (const item of NAV) {
      await page.goto(item.path);
      const overflows = await page.evaluate(
        () => document.documentElement.scrollWidth > window.innerWidth + 1,
      );
      expect(overflows, `${item.path} overflows horizontally`).toBe(false);
    }
  });
});
