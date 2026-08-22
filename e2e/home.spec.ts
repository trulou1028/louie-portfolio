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

  test("features both case studies in the contextual rail", async ({ page }) => {
    await page.goto("/");
    const rail = page.getByRole("complementary", {
      name: "Featured work and profile",
    });

    await expect(rail.getByRole("link", { name: /Offboard/ })).toBeVisible();
    await expect(rail.getByRole("link", { name: /CK-12 Flexi/ })).toBeVisible();
  });

  test("rail content is present once, at every width", async ({ page }) => {
    // The rail repositions with CSS rather than rendering a second hidden
    // copy — spec §28 forbids duplicate portfolio content, and a duplicate
    // would also double every link for crawlers.
    await page.goto("/");
    const rail = page.getByRole("complementary", {
      name: "Featured work and profile",
    });

    // Exactly one rail — not a desktop copy plus a hidden mobile copy.
    await expect(rail).toHaveCount(1);

    // And one card per project inside it. (Prompt chips elsewhere on the page
    // legitimately link to the same routes, so this is scoped to the rail.)
    for (const href of ["/work/offboard", "/work/flexi"]) {
      await expect(rail.locator(`a[href="${href}"]`)).toHaveCount(1);
    }

    // Visible on mobile too: it stacks below the main column, it does not vanish.
    await expect(rail).toBeVisible();
  });

  test("headline renders spec copy despite the styled tail", async ({ page }) => {
    // "and build them." is set in accent italic via a separate span; the
    // accessible name must still be the full spec sentence.
    await page.goto("/");
    await expect(
      page.getByRole("heading", {
        level: 1,
        name: "I design AI products and build them.",
      }),
    ).toBeVisible();
  });

  // The AI surface is live as of Plan 006; its behavior — suggestions,
  // composer, tools, and failure states — is covered in e2e/ai-louie.spec.ts.
  test("presents the AI surface as a real product surface", async ({ page }) => {
    await page.goto("/");
    const panel = page.locator("#ask-ai-louie");
    await expect(panel.getByRole("heading", { name: "Ask AI Louie" })).toBeVisible();
    await expect(
      panel.getByRole("textbox", { name: /Ask anything about/ }),
    ).toBeEnabled();
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
