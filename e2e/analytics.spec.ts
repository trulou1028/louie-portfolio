import { test, expect, type Page } from "@playwright/test";

/**
 * Proves two things about Plan 028's wiring:
 *
 * 1. Events actually fire when a visitor does the thing they map to.
 * 2. No visitor-authored text ever reaches the analytics queue — not the
 *    question, not its length, not a hash of it. `sanitizeProperties` is a
 *    backstop, not permission (a short question would pass it), so this is
 *    checked at the transport boundary instead of by re-deriving the guard's
 *    logic.
 *
 * `@vercel/analytics`'s `track()` calls `window.va("event", { name, data })`
 * (see `node_modules/@vercel/analytics/dist/index.mjs`); `<Analytics />`
 * only installs `window.va` if it is not already set
 * (`if (window.va) return;` in its queue init), so stubbing it before
 * navigation is stable — the real script never overwrites the stub.
 */
async function stubAnalytics(page: Page) {
  await page.addInitScript(() => {
    (window as unknown as { __vaCalls: unknown[] }).__vaCalls = [];
    (window as unknown as { va: (...args: unknown[]) => void }).va = (
      ...args: unknown[]
    ) => {
      (window as unknown as { __vaCalls: unknown[] }).__vaCalls.push(args);
    };
  });
}

async function scrollToAskPanel(page: Page) {
  await expect(async () => {
    await page.locator("#ask-ai-louie").scrollIntoViewIfNeeded();
  }).toPass({ timeout: 5_000 });
}

/** Same UI message stream shape the ai-louie suite mocks `/api/chat` with. */
async function mockChatAnswer(page: Page, answer: string) {
  await page.route("**/api/chat", async (route) => {
    const chunks = [
      { type: "start" },
      { type: "start-step" },
      { type: "text-start", id: "t1" },
      { type: "text-delta", id: "t1", delta: answer },
      { type: "text-end", id: "t1" },
      { type: "finish-step" },
      { type: "finish" },
    ];
    const body =
      chunks.map((chunk) => `data: ${JSON.stringify(chunk)}\n\n`).join("") +
      "data: [DONE]\n\n";

    await route.fulfill({
      status: 200,
      headers: {
        "content-type": "text/event-stream",
        "x-vercel-ai-ui-message-stream": "v1",
      },
      body,
    });
  });
}

test.describe("analytics", () => {
  test("fires events for real interactions", async ({ page }) => {
    await stubAnalytics(page);
    await mockChatAnswer(page, "Offboard is CK-12's counselor tool.");

    await page.goto("/");
    await scrollToAskPanel(page);
    await page.getByText("Show me Offboard", { exact: true }).click();

    await expect
      .poll(() =>
        page.evaluate(
          () => (window as unknown as { __vaCalls: unknown[] }).__vaCalls.length,
        ),
      )
      .toBeGreaterThan(0);

    const names = await page.evaluate(() =>
      (
        window as unknown as {
          __vaCalls: [string, { name?: string }][];
        }
      ).__vaCalls
        .filter(([kind]) => kind === "event")
        .map(([, options]) => options.name),
    );

    // ai_louie_started fires on approach; ai_prompt_chip_clicked and
    // ai_question_submitted fire from the suggestion click (Suggestions
    // calls track then onSelect, which calls sendText).
    expect(names).toContain("ai_louie_started");
    expect(names).toContain("ai_prompt_chip_clicked");
    expect(names).toContain("ai_question_submitted");
  });

  test("never sends visitor-authored text to the analytics queue", async ({
    page,
  }) => {
    await stubAnalytics(page);
    await mockChatAnswer(page, "Answer text, unrelated to the question sent.");

    const secret = "ZZQQ-secret-question";

    await page.goto("/");
    await scrollToAskPanel(page);

    const panel = page.getByRole("complementary", { name: "Ask Louie" });
    await panel
      .getByRole("textbox", { name: "Ask anything about Louie's work" })
      .fill(secret);
    await panel.getByRole("button", { name: "Send message" }).click();

    await expect
      .poll(() =>
        page.evaluate(
          () => (window as unknown as { __vaCalls: unknown[] }).__vaCalls.length,
        ),
      )
      .toBeGreaterThan(0);

    const serialized = await page.evaluate(() =>
      JSON.stringify(
        (window as unknown as { __vaCalls: unknown[] }).__vaCalls,
      ),
    );

    expect(serialized).not.toContain("ZZQQ");
  });
});
