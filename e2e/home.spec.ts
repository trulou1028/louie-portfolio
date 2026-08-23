import { test, expect, type Page } from "@playwright/test";

/**
 * Homepage and shell behavior (spec §10, §11, §25, §26).
 *
 * These assert the things a later refactor could silently break: the exact
 * positioning copy, that every nav destination resolves, that the mobile
 * drawer works by keyboard, and that nothing overflows horizontally.
 */

/**
 * Below xl, `Canvas` renders the rail in a structurally different tree than
 * on xl+ (a stacked `<div>` vs. a `PersistentPanelGroup` pane) — `useMinWidth`
 * reports desktop for the first client render even on a real mobile viewport
 * (matching SSR, so hydration never mismatches) and corrects one effect
 * later, which unmounts and remounts the rail's subtree. A `goto` followed
 * immediately by `scrollIntoViewIfNeeded` can therefore catch `#ask-ai-louie`
 * mid-swap; retrying the whole action rides that out, the same way a real
 * visitor's slower first interaction never would.
 */
async function scrollToAskPanel(page: Page) {
  await expect(async () => {
    await page.locator("#ask-ai-louie").scrollIntoViewIfNeeded();
  }).toPass({ timeout: 5_000 });
}

// The primary nav, post-restructure (Plan 011): Writing and Experiments left
// the primary nav but remain live, stable URLs (spec §28) — they are still
// exercised directly by e2e/landmarks.spec.ts and e2e/accessibility.spec.ts.
const NAV = [
  { label: "Home", path: "/" },
  { label: "Work", path: "/work" },
  { label: "AI Systems", path: "/ai-systems" },
  { label: "About", path: "/about" },
  { label: "Resume", path: "/resume" },
];

test.describe("homepage", () => {
  test("renders the positioning copy verbatim", async ({ page }) => {
    await page.goto("/");

    await expect(
      page.getByRole("heading", {
        level: 1,
        name: "I design & ship AI products.",
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

  test("features both case studies in the main column", async ({ page }) => {
    // Plan 011: Featured work moved out of the contextual rail (removed) and
    // into the main column, directly after the hero, so it is reached fast.
    await page.goto("/");
    const featuredWork = page.getByTestId("featured-work");

    await expect(
      featuredWork.getByRole("link", { name: /Offboard/ }),
    ).toBeVisible();
    await expect(
      featuredWork.getByRole("link", { name: /CK-12 Flexi/ }),
    ).toBeVisible();
  });

  test("featured work is present once, at every width", async ({ page }) => {
    await page.goto("/");
    const featuredWork = page.getByTestId("featured-work");

    // Exactly one featured-work section — not a desktop copy plus a hidden
    // mobile copy.
    await expect(featuredWork).toHaveCount(1);

    // And one card per project inside it. (The AI suggestion chips elsewhere
    // on the page legitimately link to the same routes, so this is scoped to
    // the featured-work section, not the whole `main`.)
    for (const href of ["/work/offboard", "/work/flexi"]) {
      await expect(featuredWork.locator(`a[href="${href}"]`)).toHaveCount(1);
    }

    await expect(featuredWork).toBeVisible();
  });

  test("headline renders full copy despite the styled tail", async ({ page }) => {
    // "ship AI products." is set in accent italic via a separate span; the
    // accessible name must still be the full headline sentence.
    await page.goto("/");
    await expect(
      page.getByRole("heading", {
        level: 1,
        name: "I design & ship AI products.",
      }),
    ).toBeVisible();
  });

  // The AI surface is live as of Plan 006; its behavior — suggestions,
  // composer, tools, and failure states — is covered in e2e/ai-louie.spec.ts.
  test("presents the AI surface as a real product surface", async ({ page }) => {
    await page.goto("/");
    const panel = page.locator("#ask-ai-louie");
    // Plan 012: the AI surface is the homepage's persistent rail. On desktop
    // it is already on screen at paint, so this is a no-op there; below xl
    // it still stacks after the rest of the homepage (spec §10), so
    // approaching it (as a real visitor scrolling down would) is what
    // triggers the lazy-loaded runtime (spec §27), not just being present in
    // the DOM. `scrollIntoViewIfNeeded` mirrors that.
    await scrollToAskPanel(page);
    await expect(panel.getByRole("heading", { name: "AI Louie" })).toBeVisible();
    await expect(
      panel.getByRole("textbox", { name: /Ask anything about/ }),
    ).toBeEnabled();
  });

  test("the Ask panel is a complementary landmark, not a main-column section", async ({
    page,
  }) => {
    // Plan 012: "ask the panel; the site answers" — the AI surface moved out
    // of the main column into its own rail (desktop: a parallel pane; below
    // xl: stacked after the rest of the homepage, spec §10).
    await page.goto("/");
    const rail = page.getByRole("complementary", { name: "Ask AI Louie" });
    await expect(rail).toHaveCount(1);
    expect(await rail.locator("#ask-ai-louie").count()).toBe(1);
  });

  test("work appears before the AI panel in document order", async ({ page }, testInfo) => {
    // Plan 011: hiring managers should reach the work as fast as possible —
    // Featured work sits directly after the hero, ahead of the AI thread.
    // Plan 012: on xl+ the AI panel lives in its own parallel rail pane
    // (spec §10) — position no longer maps onto document order the way a
    // single column does, so this only still asserts below xl, where the
    // rail stacks after the entire main column.
    test.skip(testInfo.project.name !== "mobile", "single-column layout only");
    await page.goto("/");
    const featuredWork = page.getByTestId("featured-work");
    const aiPanel = page.locator("#ask-ai-louie");

    // Below xl, `useMinWidth` reports desktop for the first client render
    // (matching SSR) and corrects one effect later, remounting the rail's
    // subtree — waiting for both to be stably visible first rides out that
    // transition instead of racing it for a bounding box.
    await expect(featuredWork).toBeVisible();
    await expect(aiPanel).toBeVisible();

    const [workBox, aiBox] = await Promise.all([
      featuredWork.boundingBox(),
      aiPanel.boundingBox(),
    ]);

    expect(workBox).not.toBeNull();
    expect(aiBox).not.toBeNull();
    expect(workBox!.y).toBeLessThan(aiBox!.y);
  });

});

test.describe("the app frame", () => {
  test("the document never scrolls — only the panes do", async ({ page }) => {
    // Regression: Tailwind's `sr-only` is position:absolute, so screen-reader
    // spans deep inside a scroll container (InlineLink's "(opens in a new
    // tab)", the AI panel's "Loading AI Louie…") resolved against the initial
    // containing block when no ancestor was positioned. They landed at their
    // page coordinate and extended the DOCUMENT's scroll height to 2008px on
    // a 900px viewport — scrolling lifted the whole fixed app frame away and
    // left a blank void. The scrollers are now `relative`.
    await page.goto("/");

    // Let the lazy AI runtime mount; its skeleton carries one of the spans.
    await expect(
      page.getByRole("complementary", { name: "Ask AI Louie" }),
    ).toBeVisible();

    const overflow = await page.evaluate(() => {
      const root = document.documentElement;
      return root.scrollHeight - root.clientHeight;
    });
    expect(overflow, "document must not be scrollable").toBeLessThanOrEqual(1);

    // And the inner canvas must still scroll — the fix must not have simply
    // clipped everything.
    const canScroll = await page.evaluate(() => {
      const sc = document.querySelector<HTMLElement>("[data-canvas-scroll]");
      if (!sc) return false;
      sc.scrollTop = 300;
      const moved = sc.scrollTop > 0;
      sc.scrollTop = 0;
      return moved;
    });
    expect(canScroll, "the content pane must still scroll").toBe(true);
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

  test("primary nav omits Writing and Experiments", async ({ page }, testInfo) => {
    // Owner decision, 2026-08-23 (Plan 011): Writing and Experiments leave
    // the primary nav. Both remain live, stable URLs (spec §28) — see
    // e2e/landmarks.spec.ts and e2e/accessibility.spec.ts.
    //
    // On mobile the same NAV_ITEMS drive the drawer, which is not mounted
    // until opened (spec §25) — open it first, as the other mobile nav tests do.
    await page.goto("/");
    if (testInfo.project.name === "mobile") {
      await page.getByRole("button", { name: "Open navigation menu" }).click();
    }

    const nav = page.getByRole("navigation", { name: "Primary" });
    await expect(nav.getByRole("link").first()).toBeVisible();
    const labels = await nav.getByRole("link").allTextContents();
    expect(labels).toEqual(["Home", "Work", "AI Systems", "About", "Resume"]);
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
