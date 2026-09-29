import { test, expect, type Page } from "@playwright/test";

/**
 * Plan 042: the homepage ask bar and the Ask Louie side panel.
 *
 * `/api/chat` is always intercepted, so no provider is called.
 */
const ANSWER =
  "A risk gate can pause before tailored materials are written. See [Decision 01 in the Offboard case study](/work/offboard#decision-risk).";

async function mockChat(page: Page) {
  const bodies: string[] = [];
  await page.route("**/api/chat", async (route) => {
    bodies.push(route.request().postData() ?? "");
    const chunks = [
      { type: "start" },
      { type: "start-step" },
      { type: "text-start", id: "t1" },
      { type: "text-delta", id: "t1", delta: ANSWER },
      { type: "text-end", id: "t1" },
      { type: "finish-step" },
      { type: "finish" },
    ];
    await route.fulfill({
      status: 200,
      headers: { "content-type": "text/event-stream", "x-vercel-ai-ui-message-stream": "v1" },
      body: chunks.map((chunk) => `data: ${JSON.stringify(chunk)}\n\n`).join("") + "data: [DONE]\n\n",
    });
  });
  return bodies;
}

test("the hero ask bar opens the panel and asks the question once", async ({ page }) => {
  const bodies = await mockChat(page);
  await page.goto("/");
  await page.getByRole("textbox", { name: "Ask about my work" }).fill("Why does the Offboard packet pause for risk?");
  await page.getByRole("button", { name: "Send question" }).click();

  const panel = page.locator("#ask-ai-louie");
  await expect(panel.getByText("A risk gate can pause")).toBeVisible({ timeout: 15_000 });
  expect(bodies).toHaveLength(1);
  expect(bodies[0]).toContain("Why does the Offboard packet pause for risk?");
});

test("a hero starter question opens the panel and asks it", async ({ page }) => {
  const bodies = await mockChat(page);
  await page.goto("/");
  await page.getByRole("region", { name: "Introduction" }).getByRole("button", { name: "How technical are you?" }).click();
  await expect(page.locator("#ask-ai-louie").getByText("A risk gate can pause")).toBeVisible({ timeout: 15_000 });
  expect(bodies[0]).toContain("How technical are you?");
});

test("the hero keeps the job-description comparison one click away", async ({ page }) => {
  await page.goto("/");
  await page.getByRole("region", { name: "Introduction" }).getByRole("button", { name: "Paste a job description" }).click();
  await expect(page.locator("#ask-ai-louie").getByRole("region", { name: "Compare a role" })).toBeVisible();
});

test("on a case study, the panel starts from that project", async ({ page }) => {
  await page.goto("/work/offboard");
  await page.getByRole("button", { name: "Ask Louie", exact: true }).first().click();
  const panel = page.locator("#ask-ai-louie");
  await expect(panel.getByText("Reading:")).toContainText("Offboard");
  await expect(panel.getByRole("button", { name: "Why does the Offboard packet pause for risk?" })).toBeVisible({ timeout: 15_000 });
  await expect(panel.getByRole("button", { name: "Show me Offboard" })).toHaveCount(0);
});

test("on desktop, a cited link keeps the panel open and highlights the section", async ({ page, isMobile }) => {
  test.skip(isMobile, "Desktop only: on a phone the sheet closes to show the page.");
  await mockChat(page);
  await page.goto("/work/offboard");
  await page.getByRole("button", { name: "Ask Louie", exact: true }).click();
  const panel = page.locator("#ask-ai-louie");
  await panel.getByRole("button", { name: "Why does the Offboard packet pause for risk?" }).click();
  await panel.getByRole("link", { name: /Decision 01/ }).click();

  await expect(page.locator("#decision-risk")).toHaveAttribute("data-highlight", "true");
  await expect(panel).toBeVisible();
  // Asked questions leave the list; the rest stay offered.
  await expect(panel.getByText("More about Offboard")).toBeVisible();
  await expect(panel.getByRole("button", { name: "Why does the Offboard packet pause for risk?" })).toHaveCount(0);
});

test("on desktop, the page stays usable beside the panel", async ({ page, isMobile }) => {
  test.skip(isMobile, "Desktop only: on a phone the sheet covers the page.");
  await page.goto("/work/offboard");
  await page.getByRole("button", { name: "Ask Louie", exact: true }).click();
  await expect(page.locator("#ask-ai-louie")).toBeVisible();
  // The article beside the panel still scrolls under the pointer.
  await page.locator("h1").hover();
  await page.mouse.wheel(0, 1200);
  await expect.poll(() => page.locator("[data-canvas-scroll]").evaluate((el) => el.scrollTop)).toBeGreaterThan(0);
  await expect(page.locator("#ask-ai-louie")).toBeVisible();
  await page.keyboard.press("Escape");
  await expect(page.locator("#ask-ai-louie")).toBeHidden();
});

test("a case study offers an Ask card that starts from that project", async ({ page, isMobile }) => {
  const bodies = await mockChat(page);
  await page.goto("/work/flexi");
  if (isMobile) {
    await page.getByRole("button", { name: "Ask about Flexi" }).click();
    await expect(page.locator("#ask-ai-louie").getByText("Reading:")).toContainText("Flexi");
    return;
  }
  const card = page.getByRole("region", { name: "Ask about Flexi" });
  await card.getByRole("button", { name: "What follow-up choices does Flexi offer?" }).click();
  await expect(page.locator("#ask-ai-louie").getByText("A risk gate can pause")).toBeVisible({ timeout: 15_000 });
  expect(bodies[0]).toContain("What follow-up choices does Flexi offer?");
});

test("case study content lines up with the header", async ({ page, isMobile }) => {
  test.skip(isMobile, "Desktop frame");
  for (const width of [1280, 1440, 1920]) {
    await page.setViewportSize({ width, height: 900 });
    await page.goto("/work/offboard");
    const name = await page.getByRole("link", { name: /Louie Sakoda, home/ }).boundingBox();
    const title = await page.locator("h1").boundingBox();
    const ask = await page.getByRole("button", { name: "Ask Louie", exact: true }).boundingBox();
    const rail = await page.getByRole("complementary", { name: "Case study contents" }).boundingBox();
    expect(Math.abs(title!.x - name!.x), `left edge at ${width}`).toBeLessThanOrEqual(2);
    expect(Math.abs(rail!.x + rail!.width - (ask!.x + ask!.width)), `right edge at ${width}`).toBeLessThanOrEqual(2);
  }
});

test("on desktop, the open panel pushes the header and page instead of covering them", async ({ page, isMobile }) => {
  test.skip(isMobile, "Desktop only: on a phone the sheet covers the page.");
  await page.goto("/work/offboard");
  await page.getByRole("button", { name: "Ask Louie", exact: true }).click();
  const panel = await page.locator("#ask-ai-louie").boundingBox();
  await expect.poll(async () => {
    const scroller = await page.locator("[data-canvas-scroll]").boundingBox();
    return scroller!.x + scroller!.width;
  }).toBeLessThanOrEqual(panel!.x + 1);
  const nav = await page.getByRole("navigation", { name: "Primary" }).last().boundingBox();
  expect(nav!.x + nav!.width).toBeLessThanOrEqual(panel!.x);
  // The case-study rail folds away when the canvas narrows below 64rem,
  // and the inline contents take its place.
  await expect(page.getByRole("complementary", { name: "Case study contents" })).toBeHidden();
  await expect(page.getByRole("group").filter({ hasText: "On this page" }).or(page.locator("details", { hasText: "On this page" }))).toBeVisible();
});

test("the thinking line sits on the avatar's row", async ({ page }) => {
  await page.route("**/api/chat", async (route) => {
    await new Promise((resolve) => setTimeout(resolve, 3000));
    await route.fulfill({ status: 503, json: { error: "ai_unavailable" } });
  });
  await page.goto("/");
  await page.getByRole("region", { name: "Introduction" }).getByRole("button", { name: "Show me Offboard" }).click();
  const panel = page.locator("#ask-ai-louie");
  const label = panel.getByText("Thinking", { exact: true });
  await expect(label).toBeVisible({ timeout: 10_000 });
  const avatar = await panel.locator('[data-slot="message-avatar"]').last().boundingBox();
  const text = await label.boundingBox();
  const middle = text!.y + text!.height / 2;
  expect(middle).toBeGreaterThan(avatar!.y);
  expect(middle).toBeLessThan(avatar!.y + avatar!.height);
  expect(text!.x).toBeGreaterThan(avatar!.x + avatar!.width);
});
