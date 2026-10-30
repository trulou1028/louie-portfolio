import { test, expect, type Page } from "@playwright/test";

/**
 * Plan 042: the Ask Louie side panel. Plan 051 removed the homepage ask
 * bar; asking starts in the panel.
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

async function openPanel(page: Page) {
  await page.getByRole("button", { name: "Ask Louie", exact: true }).click();
  const panel = page.locator("#ask-ai-louie");
  await expect(panel).toBeVisible();
  return panel;
}

test("the panel's composer asks the question once", async ({ page }) => {
  const bodies = await mockChat(page);
  await page.goto("/");
  const panel = await openPanel(page);
  await panel.getByRole("textbox", { name: "Ask anything about Louie's work" }).fill("Why does the Offboard packet pause for risk?");
  await panel.getByRole("button", { name: "Send message" }).click();

  await expect(panel.getByText("A risk gate can pause")).toBeVisible({ timeout: 15_000 });
  expect(bodies).toHaveLength(1);
  expect(bodies[0]).toContain("Why does the Offboard packet pause for risk?");
});

test("a starter question in the panel asks it", async ({ page }) => {
  const bodies = await mockChat(page);
  await page.goto("/");
  const panel = await openPanel(page);
  await panel.getByText("Can you build what you design?", { exact: true }).click();
  await expect(panel.getByText("A risk gate can pause")).toBeVisible({ timeout: 15_000 });
  expect(bodies[0]).toContain("Can you build what you design?");
});

test("the panel keeps the job-description comparison one click away", async ({ page }) => {
  await page.goto("/");
  const panel = await openPanel(page);
  await panel.getByRole("button", { name: "Paste a job description" }).click();
  await expect(panel.getByRole("region", { name: "Compare a role" })).toBeVisible();
});

test("on a case study, the panel starts from that project", async ({ page }) => {
  await page.goto("/work/offboard");
  await page.getByRole("button", { name: "Ask about this project" }).click();
  const panel = page.locator("#ask-ai-louie");
  await expect(panel.getByText("Reading:")).toContainText("Offboard");
  await expect(panel.getByRole("button", { name: "Why does the Offboard packet pause for risk?" })).toBeVisible({ timeout: 15_000 });
  await expect(panel.getByRole("button", { name: "How do you design AI people trust?" })).toHaveCount(0);
});

test("on desktop, a cited link keeps the panel open and highlights the section", async ({ page, isMobile }) => {
  test.skip(isMobile, "Desktop only: on a phone the sheet closes to show the page.");
  await mockChat(page);
  await page.goto("/work/offboard");
  await page.getByRole("button", { name: "Ask about this project" }).click();
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
  await page.getByRole("button", { name: "Ask about this project" }).click();
  await expect(page.locator("#ask-ai-louie")).toBeVisible();
  // The article beside the panel still scrolls under the pointer.
  await page.locator("h1").hover();
  await page.mouse.wheel(0, 1200);
  await expect.poll(() => page.locator("[data-canvas-scroll]").evaluate((el) => el.scrollTop)).toBeGreaterThan(0);
  await expect(page.locator("#ask-ai-louie")).toBeVisible();
  await page.keyboard.press("Escape");
  await expect(page.locator("#ask-ai-louie")).toBeHidden();
});

test("a case study's left column opens the panel on that project", async ({ page }) => {
  await page.goto("/work/flexi");
  await page.getByRole("button", { name: "Ask about this project" }).click();
  const panel = page.locator("#ask-ai-louie");
  await expect(panel.getByText("Reading:")).toContainText("Flexi");
  await expect(panel.getByRole("button", { name: "What follow-up choices does Flexi offer?" })).toBeVisible({ timeout: 15_000 });
});

test("on desktop, the open panel pushes the page instead of covering it", async ({ page, isMobile }) => {
  test.skip(isMobile, "Desktop only: on a phone the sheet covers the page.");
  await page.goto("/work/offboard");
  await page.getByRole("button", { name: "Ask about this project" }).click();
  const panel = await page.locator("#ask-ai-louie").boundingBox();
  await expect.poll(async () => {
    const scroller = await page.locator("[data-canvas-scroll]").boundingBox();
    return scroller!.x + scroller!.width;
  }).toBeLessThanOrEqual(panel!.x + 1);
  // The narrowed page (about 1090px) is below the 1280px canvas where the
  // contents get their own right column, so they fold into the disclosure
  // above the article (stacked redesign).
  await expect(page.getByRole("navigation", { name: "On this page" })).toBeHidden();
  await expect(page.locator("details", { hasText: "On this page" })).toBeVisible();
});

test("the thinking line sits on the avatar's row, with the work cards under it", async ({ page }) => {
  await page.route("**/api/chat", async (route) => {
    await new Promise((resolve) => setTimeout(resolve, 3000));
    await route.fulfill({ status: 503, json: { error: "ai_unavailable" } });
  });
  await page.goto("/");
  const panel = await openPanel(page);
  await panel.getByText("How do you design AI people trust?", { exact: true }).click();
  // The visible status is decorative; the thread announces the sr-only copy.
  const label = panel.getByText("Reading your question", { exact: true }).first();
  await expect(label).toBeVisible({ timeout: 10_000 });
  await expect(panel.locator(".sr-only", { hasText: "Reading your question" })).toBeAttached();
  const avatar = await panel.locator('[data-slot="message-avatar"]').last().boundingBox();
  const text = await label.boundingBox();
  const middle = text!.y + text!.height / 2;
  expect(middle).toBeGreaterThan(avatar!.y);
  expect(middle).toBeLessThan(avatar!.y + avatar!.height);
  expect(text!.x).toBeGreaterThan(avatar!.x + avatar!.width);
});
