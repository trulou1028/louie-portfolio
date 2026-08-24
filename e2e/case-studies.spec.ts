import { test, expect } from "@playwright/test";

import { OFFBOARD_ANCHORS, FLEXI_ANCHORS } from "../lib/routes";

/**
 * Case studies (spec §13, §14, §25, §26, §34).
 *
 * The anchor assertions matter most: those slugs are the deep-link contract
 * that the evidence index (Plan 005) and AI navigation (Plan 006) validate
 * against, so a renamed section has to fail loudly here rather than silently
 * break links that were already published.
 */
const STUDIES = [
  {
    name: "Offboard",
    path: "/work/offboard",
    anchors: OFFBOARD_ANCHORS,
    title: "Building an AI-native operating system for the job search",
  },
  {
    name: "CK-12 Flexi",
    path: "/work/flexi",
    anchors: FLEXI_ANCHORS,
    title:
      "Designing an AI tutor that helps students learn instead of simply giving them answers",
  },
];

for (const study of STUDIES) {
  test.describe(study.name, () => {
    test("renders with its spec title", async ({ page }) => {
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

test("the work index links to both case studies", async ({ page }) => {
  await page.goto("/work");
  for (const study of STUDIES) {
    await expect(page.locator(`a[href="${study.path}"]`).first()).toBeVisible();
  }
});
