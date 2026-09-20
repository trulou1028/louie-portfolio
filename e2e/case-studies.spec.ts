import { test, expect } from "@playwright/test";

import { OFFBOARD_ANCHORS, FLEXI_ANCHORS, ANALYTICS_ANCHORS, NEURON_ANCHORS } from "../lib/routes";

/**
 * Case studies (spec §13, §14, §25, §26, §34).
 *
 * The anchor assertions matter most: those slugs are the deep-link contract
 * that the evidence index (Plan 005) and AI navigation (Plan 006) validate
 * against, so a renamed section has to fail loudly here rather than silently
 * break links that were already published.
 */
const STUDIES = [
  { name: "CK-12 Analytics", path: "/work/ck12-analytics", anchors: ANALYTICS_ANCHORS, title: "Turning learning predictions into teacher decisions" },
  { name: "Neuron Shift", path: "/experiments/neuron-shift", anchors: NEURON_ANCHORS, title: "Preserving operator judgment across shift changes" },
  {
    name: "Offboard",
    path: "/work/offboard",
    anchors: OFFBOARD_ANCHORS,
    title: "Building a career-transition product around the next useful step",
  },
  {
    name: "CK-12 Flexi",
    path: "/work/flexi",
    anchors: FLEXI_ANCHORS,
    title:
      "Helping students get unstuck without doing the learning for them",
  },
];

for (const study of STUDIES) {
  test.describe(study.name, () => {
    test("renders with its adopted title", async ({ page }) => {
      const response = await page.goto(study.path);
      expect(response?.status()).toBe(200);
      await expect(
        page.getByRole("heading", { level: 1, name: study.title }),
      ).toBeVisible();
    });

    test("has every required section anchor", async ({ page }) => {
      await page.goto(study.path);
      for (const anchor of study.anchors) {
        await expect(
          page.locator(`#${anchor.id}`),
          `${study.path}#${anchor.id} must exist`,
        ).toHaveCount(1);
      }
    });

    test("deep links land on the right section", async ({ page }) => {
      const target = study.anchors[2];
      await page.goto(`${study.path}#${target.id}`);

      const section = page.locator(`#${target.id}`);
      await expect(section).toBeInViewport();
    });

    test("every diagram carries a text equivalent", async ({ page }) => {
      // Spec §26: system diagrams need textual equivalents.
      await page.goto(study.path);
      // Scoped to the article: the shell may legitimately contain figures of
      // its own, and this assertion is about diagrams and artifacts.
      const figures = page.locator("article figure");
      const count = await figures.count();
      expect(count).toBeGreaterThan(0);

      for (let i = 0; i < count; i++) {
        const caption = figures.nth(i).locator("figcaption");
        await expect(caption).toHaveCount(1);
        expect((await caption.innerText()).trim().length).toBeGreaterThan(20);
      }
    });

    test("diagrams reflow instead of scrolling sideways", async ({ page }) => {
      // Spec §25: diagrams should reflow, not shrink illegibly or scroll.
      await page.goto(study.path);

      const pageOverflows = await page.evaluate(
        () => document.documentElement.scrollWidth > window.innerWidth + 1,
      );
      expect(pageOverflows, "page must not scroll horizontally").toBe(false);

      const overflowing = await page.evaluate(() =>
        [...document.querySelectorAll("figure")]
          .filter((f) => f.scrollWidth > f.clientWidth + 1)
          .map((f) => f.textContent?.slice(0, 40) ?? ""),
      );
      expect(overflowing).toEqual([]);
    });

    test("table of contents links to real sections", async ({ page }) => {
      await page.goto(study.path);

      // Desktop rail and the mobile disclosure hold the same links; whichever
      // is present must point at sections that exist.
      const links = page.locator('nav[aria-label="On this page"] a, details a');
      const hrefs = await links.evaluateAll((els) =>
        els.map((el) => el.getAttribute("href")),
      );
      expect(hrefs.length).toBeGreaterThan(0);

      for (const href of hrefs) {
        expect(href).toMatch(/^#/);
        await expect(page.locator(href!)).toHaveCount(1);
      }
    });
  });
}

test("no developer markers are visible to readers", async ({ page }) => {
  // Placeholder captions once shipped literal "TODO(content):" text to the
  // page. Pending work is tracked with data attributes and code comments
  // instead, so nothing internal reaches a reader (spec §28: no lorem ipsum,
  // no stale placeholder content).
  for (const route of ["/", "/work", ...STUDIES.map((s) => s.path)]) {
    await page.goto(route);
    const body = await page.locator("body").innerText();
    expect(body, `${route} leaks a developer marker`).not.toMatch(
      /TODO\(|FIXME|lorem ipsum/i,
    );
  }
});

test("exactly one table of contents renders at the rail breakpoint", async ({
  page,
}) => {
  // Plan 015: `TableOfContentsInline`'s collapsed disclosure used to hide at
  // `xl:hidden` (1280px) while the rail pane itself switched on at the same
  // threshold — so the two guards agreed and never doubled up. Both are now
  // `lg` (1024px); 1100px sits just inside that breakpoint and would show
  // both the rail and the disclosure at once if the two guards ever drift
  // apart again.
  await page.setViewportSize({ width: 1100, height: 800 });
  await page.goto("/work/offboard");

  const rail = page.locator('nav[aria-label="On this page"]');
  const disclosure = page.locator("details").filter({ hasText: "On this page" });

  await expect(rail).toBeVisible();
  await expect(disclosure).toBeHidden();
});

test.describe("the Offboard architecture map", () => {
  // The one diagram in the portfolio rendered as a canvas. Everything below
  // guards the trade that earns it that: it may be interactive on a wide
  // screen only so long as the ordered list is what everything else gets,
  // and only one of the two is ever in the document.
  const LAYERS = 8;

  test("is a canvas on a wide screen, and the list is not left behind it", async ({
    page,
  }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto("/work/offboard");
    const section = page.locator("#architecture");
    await section.scrollIntoViewIfNeeded();

    await expect(section.locator(".react-flow__node")).toHaveCount(LAYERS);
    // Not merely hidden: a CSS swap would leave both trees in the document
    // and hand a screen reader the diagram twice.
    await expect(section.locator("ol li")).toHaveCount(0);

    // The plain-language equivalent survives the swap (spec §26).
    await expect(section.locator("figcaption")).toContainText(
      "write results back into the opportunity workspace",
    );
  });

  test("selecting a layer names what feeds it and what it feeds", async ({
    page,
  }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto("/work/offboard");
    const section = page.locator("#architecture");
    await section.scrollIntoViewIfNeeded();

    const detail = section.locator('[data-slot="layer-detail"]');
    await expect(detail).toContainText("Select a layer");

    // Keyboard, not a click: these are real buttons in graph order, which is
    // the whole reason a canvas is defensible here.
    const layer = section.getByRole("button", { name: /Server-side functions/ });
    await layer.focus();
    await page.keyboard.press("Enter");

    await expect(layer).toHaveAttribute("aria-pressed", "true");
    await expect(detail).toContainText("Deno edge functions");
    // Derived from the graph's edges, not from any per-layer copy.
    await expect(detail).toContainText("Opportunity data model");
    await expect(detail).toContainText("Model APIs");

    await page.keyboard.press("Escape");
    await expect(detail).toContainText("Select a layer");
  });

  test("falls back to the ordered list on a narrow screen", async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto("/work/offboard");
    const section = page.locator("#architecture");
    // Below `lg` the shell corrects from its server-rendered desktop tree one
    // effect after mount, which remounts this subtree — the same race
    // `e2e/home.spec.ts` rides out. Retrying the whole action covers it.
    await expect(async () => {
      await section.scrollIntoViewIfNeeded();
    }).toPass({ timeout: 5_000 });

    // A pannable viewport on a phone is the failure this guards against.
    await expect(section.locator(".react-flow__node")).toHaveCount(0);
    await expect(section.locator("ol li")).toHaveCount(LAYERS + 1);
    expect(
      await page.evaluate(
        () =>
          document.documentElement.scrollWidth -
          document.documentElement.clientWidth,
      ),
    ).toBe(0);
  });

  test("renders the list when scripting is unavailable", async ({ browser }) => {
    // The canvas is an enhancement; the section has to be readable without it.
    const context = await browser.newContext({
      javaScriptEnabled: false,
      viewport: { width: 1440, height: 900 },
    });
    const page = await context.newPage();
    await page.goto("/work/offboard");
    const section = page.locator("#architecture");

    await expect(section.locator("ol li")).toHaveCount(LAYERS + 1);
    await expect(section.locator("figcaption")).toBeVisible();
    await context.close();
  });
});

test("the work index links to both case studies", async ({ page }) => {
  await page.goto("/work");
  for (const study of STUDIES) {
    await expect(page.locator(`a[href="${study.path}"]`).first()).toBeVisible();
  }
});
