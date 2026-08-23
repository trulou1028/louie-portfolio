import { test, expect, type Page } from "@playwright/test";

/**
 * Matches text regardless of whether apostrophes are typographic (’) or
 * straight ('). The UI uses proper typography; tests should not be brittle
 * about it.
 */
function text(literal: string) {
  const escaped = literal.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  return new RegExp(escaped.replace(/['’]/g, "['’]"));
}

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

/**
 * AI Louie's text surface (spec §11 §2, §18, §21, §31, §32).
 *
 * Every test intercepts `/api/chat`, so the suite runs without an API key and
 * never reaches a provider. Most tests here assert the failure and boundary
 * paths — everything that must hold regardless of what the model says; the
 * happy path with a mocked grounded answer and evidence cards is covered by
 * `e2e/answer-canvas.spec.ts` instead, and against a real model by the manual
 * smoke script in the README.
 */

test.describe("the AI surface", () => {
  test("renders the thread, opening message, and suggestions", async ({ page }) => {
    await page.goto("/");
    // Plan 012: the Ask panel is the homepage's persistent rail. On desktop
    // it is already on screen at paint, so this is a no-op; below xl it
    // still stacks after the rest of the homepage (spec §10), so approaching
    // it is what triggers the lazy-loaded runtime (spec §27).
    await scrollToAskPanel(page);

    // Plan 012: the panel is a complementary landmark, not just an id —
    // scoping to it is what proves the suggestions live in the rail, not
    // buried somewhere else in the main column.
    const panel = page.getByRole("complementary", { name: "Ask AI Louie" });

    await expect(
      panel.getByRole("heading", { name: "AI Louie" }),
    ).toBeVisible();

    await expect(
      panel.getByText(
        text(
          "Hi, I'm AI Louie. I can answer questions about Louie's work and take you directly to the evidence behind my answer.",
        ),
      ),
    ).toBeVisible();

    await expect(
      panel.getByRole("textbox", { name: "Ask anything about Louie's work" }),
    ).toBeVisible();

    for (const prompt of [
      "Show me Offboard",
      "How technical is Louie?",
      "Tell me about Flexi",
    ]) {
      await expect(panel.getByText(prompt, { exact: true })).toBeVisible();
    }
  });

  test("suggestions are keyboard reachable and activate on Enter", async ({ page }) => {
    // Plan 012: the suggestions are a vertical list of real buttons, not
    // decorative chips — this proves one can be focused and activated
    // without a mouse.
    await page.goto("/");
    await scrollToAskPanel(page);

    let body: { messages?: unknown[] } | null = null;
    await page.route("**/api/chat", async (route) => {
      body = route.request().postDataJSON();
      await route.fulfill({ status: 503, json: { error: "ai_unavailable" } });
    });

    const panel = page.getByRole("complementary", { name: "Ask AI Louie" });
    const suggestion = panel.getByText("How technical is Louie?", { exact: true });
    await suggestion.focus();
    await expect(suggestion).toBeFocused();
    await page.keyboard.press("Enter");

    await expect.poll(() => body !== null, { timeout: 10_000 }).toBe(true);
    expect(JSON.stringify((body as unknown as { messages: unknown[] }).messages)).toContain(
      "How technical is Louie?",
    );
  });

  test("ships no voice, attachment, or research controls", async ({ page }) => {
    // Spec §11: do not ship fake controls. Voice is Plan 009.
    await page.goto("/");
    const panel = page.getByRole("complementary", { name: "Ask AI Louie" });

    for (const name of [/microphone/i, /talk/i, /attach/i, /deep research/i]) {
      await expect(panel.getByRole("button", { name })).toHaveCount(0);
    }
  });

  test("sends the question and declares its client tools", async ({ page }) => {
    // The three browser-executed tools must reach the server, or the model
    // can never navigate, surface evidence, or drive the panel (spec §18).
    let body: { messages?: unknown[]; tools?: Record<string, unknown> } | null =
      null;

    await page.route("**/api/chat", async (route) => {
      body = route.request().postDataJSON();
      await route.fulfill({ status: 503, json: { error: "ai_unavailable" } });
    });

    await page.goto("/");
    await scrollToAskPanel(page);
    await page.getByText("Show me Offboard", { exact: true }).click();

    await expect.poll(() => body !== null, { timeout: 10_000 }).toBe(true);

    const sent = body as unknown as {
      messages: unknown[];
      tools?: Record<string, unknown>;
    };
    expect(JSON.stringify(sent.messages)).toContain("Show me Offboard");
    expect(Object.keys(sent.tools ?? {})).toEqual(
      expect.arrayContaining([
        "navigate_portfolio",
        "show_evidence",
        "set_context_panel",
      ]),
    );
  });

  test("shows the spec fallback copy when the backend fails", async ({ page }) => {
    await page.route("**/api/chat", (route) =>
      route.fulfill({ status: 503, json: { error: "ai_unavailable" } }),
    );

    await page.goto("/");
    await scrollToAskPanel(page);
    await page.getByText("Tell me about Flexi", { exact: true }).click();

    await expect(
      page.getByText(
        text(
          "AI Louie is temporarily unavailable. You can still explore all of Louie's work below.",
        ),
      ).first(),
    ).toBeVisible({ timeout: 10_000 });
  });

  test("keeps the rest of the portfolio usable when AI fails", async ({ page }) => {
    // Spec §31: an AI outage must not take the portfolio with it.
    await page.route("**/api/chat", (route) =>
      route.fulfill({ status: 503, json: { error: "ai_unavailable" } }),
    );

    await page.goto("/");
    await scrollToAskPanel(page);
    await page.getByText("Show me Offboard", { exact: true }).click();

    await page.getByRole("link", { name: "View selected work" }).click();
    await expect(page).toHaveURL(/\/work$/);
    await expect(page.locator("h1")).toBeVisible();
  });
});

test.describe("the chat endpoint", () => {
  test("rejects malformed requests without leaking internals", async ({
    request,
  }) => {
    const empty = await request.post("/api/chat", { data: {} });
    expect(empty.status()).toBe(400);
    expect(await empty.json()).toEqual({ error: "invalid_request" });

    const notJson = await request.post("/api/chat", {
      headers: { "content-type": "application/json" },
      data: "not json",
    });
    expect([400, 413]).toContain(notJson.status());
  });

  test("enforces the per-message size limit", async ({ request }) => {
    const response = await request.post("/api/chat", {
      data: {
        messages: [
          {
            id: "1",
            role: "user",
            parts: [{ type: "text", text: "x".repeat(17_000) }],
          },
        ],
      },
    });
    expect(response.status()).toBe(413);
    expect(await response.json()).toEqual({ error: "message_too_long" });
  });

  test("enforces a total conversation size limit", async ({ request }) => {
    // The per-message cap alone would allow 32 large messages through.
    const response = await request.post("/api/chat", {
      data: {
        messages: Array.from({ length: 10 }, (_, i) => ({
          id: String(i),
          role: "user",
          parts: [{ type: "text", text: "x".repeat(15_000) }],
        })),
      },
    });
    expect(response.status()).toBe(413);
    expect(await response.json()).toEqual({ error: "conversation_too_long" });
  });

  test("accepts a job description pasted into the composer", async ({ request }) => {
    // 9k chars was rejected before the limit was raised for this flow.
    const response = await request.post("/api/chat", {
      data: {
        messages: [
          { id: "1", role: "user", parts: [{ type: "text", text: "x".repeat(9_000) }] },
        ],
      },
    });
    expect(response.status()).not.toBe(413);
  });

  test("never returns provider error text", async ({ request }) => {
    // Whatever goes wrong, the body is one of our own small shapes (spec §31).
    const response = await request.post("/api/chat", {
      data: { messages: [{ id: "1", role: "user", parts: [{ type: "text", text: "hi" }] }] },
    });
    const text = await response.text();
    expect(text).not.toMatch(/openai|api key|sk-|stack|at Object\./i);
  });
});
