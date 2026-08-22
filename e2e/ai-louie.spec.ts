import { test, expect } from "@playwright/test";

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
 * AI Louie's text surface (spec §11 §2, §18, §21, §31, §32).
 *
 * Every test intercepts `/api/chat`, so the suite runs without an API key and
 * never reaches a provider. The happy path — a grounded answer with evidence
 * cards — needs a real model and is covered by the manual smoke script in the
 * README instead; what is asserted here is everything that must hold
 * regardless of what the model says.
 */

test.describe("the AI surface", () => {
  test("renders the thread, opening message, and suggestions", async ({ page }) => {
    await page.goto("/");

    await expect(
      page.getByRole("heading", { name: "Ask AI Louie" }),
    ).toBeVisible();

    await expect(
      page.getByText(
        text(
          "Hi, I'm AI Louie. I can answer questions about Louie's work and take you directly to the evidence behind my answer.",
        ),
      ),
    ).toBeVisible();

    await expect(
      page.getByRole("textbox", { name: "Ask anything about Louie's work" }),
    ).toBeVisible();

    for (const prompt of [
      "Show me Offboard",
      "How technical is Louie?",
      "Tell me about Flexi",
    ]) {
      await expect(page.getByText(prompt, { exact: true })).toBeVisible();
    }
  });

  test("ships no voice, attachment, or research controls", async ({ page }) => {
    // Spec §11: do not ship fake controls. Voice is Plan 009.
    await page.goto("/");
    const panel = page.locator("#ask-ai-louie");

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

  test("enforces the message size limit", async ({ request }) => {
    const response = await request.post("/api/chat", {
      data: {
        messages: [
          {
            id: "1",
            role: "user",
            parts: [{ type: "text", text: "x".repeat(9_000) }],
          },
        ],
      },
    });
    expect(response.status()).toBe(413);
    expect(await response.json()).toEqual({ error: "message_too_long" });
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
