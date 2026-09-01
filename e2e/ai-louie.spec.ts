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
 * Below lg (1024px), `Canvas` renders the rail in a structurally different
 * tree than on lg+ (a stacked `<div>` vs. a `PersistentPanelGroup` pane) —
 * `useMinWidth` reports desktop for the first client render even on a real
 * mobile viewport (matching SSR, so hydration never mismatches) and corrects
 * one effect later, which unmounts and remounts the rail's subtree. A `goto`
 * followed immediately by `scrollIntoViewIfNeeded` can therefore catch
 * `#ask-ai-louie` mid-swap; retrying the whole action rides that out, the
 * same way a real visitor's slower first interaction never would.
 */
async function scrollToAskPanel(page: Page) {
  await expect(async () => {
    await page.locator("#ask-ai-louie").scrollIntoViewIfNeeded();
  }).toPass({ timeout: 5_000 });
}

/**
 * AI Louie's text surface — a basic Q&A chat (spec §18, §21, §31, §32;
 * Plan 014).
 *
 * Every test intercepts `/api/chat`, so the suite runs without an API key and
 * never reaches a provider. Most tests here assert the failure and boundary
 * paths — everything that must hold regardless of what the model says; the
 * happy path with a mocked grounded answer is covered by this suite's
 * mocked runs, and against a real model by the manual smoke script in the
 * README.
 */

test.describe("the AI surface", () => {
  test("renders the thread, opening message, and suggestions", async ({ page }) => {
    await page.goto("/");
    // Plan 012: the Ask panel is the homepage's persistent rail. On desktop
    // it is already on screen at paint, so this is a no-op; below lg it
    // still stacks after the rest of the homepage (spec §10), so approaching
    // it is what triggers the lazy-loaded runtime (spec §27).
    await scrollToAskPanel(page);

    // Plan 012: the panel is a complementary landmark, not just an id —
    // scoping to it is what proves the suggestions live in the rail, not
    // buried somewhere else in the main column.
    const panel = page.getByRole("complementary", { name: "Ask Louie" });

    await expect(
      panel.getByRole("heading", { name: "Ask Louie" }),
    ).toBeVisible();

    await expect(
      panel.getByText(
        text(
          "Hi — ask me anything about Louie's work. I answer from his case studies and project evidence.",
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

    // Plan 014: the panel ships exactly three suggestions now — the two
    // dropped ones must not still be rendered.
    for (const removed of ["Show me agent workflows", "Show me user research"]) {
      await expect(panel.getByText(removed, { exact: true })).toHaveCount(0);
    }

    // Plan 014: the disclaimer line under the composer was removed.
    await expect(
      page.getByText(
        "It answers from Louie's case studies and cites the evidence.",
      ),
    ).toHaveCount(0);
  });

  test("the composer renders without any scrolling, on desktop", async (
    { page },
    testInfo,
  ) => {
    // Plan 017: the runtime behind the panel dropped from ~840KB
    // (assistant-ui) to ~504KB (`useChat` + the shadcn chat components), but
    // Plan 017 measured folding it into the eager bundle and chose to keep
    // it behind the `IntersectionObserver` gate — 504KB is still real
    // weight for a portfolio site. This proves the gate does not cost
    // desktop visitors anything: on desktop the rail is already on screen
    // at paint, so the observer's threshold is satisfied immediately and
    // the composer is interactive with no scroll at all.
    test.skip(testInfo.project.name !== "desktop", "desktop only");

    await page.goto("/");
    const panel = page.getByRole("complementary", { name: "Ask Louie" });
    await expect(
      panel.getByRole("textbox", { name: "Ask anything about Louie's work" }),
    ).toBeEnabled();
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

    const panel = page.getByRole("complementary", { name: "Ask Louie" });
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
    const panel = page.getByRole("complementary", { name: "Ask Louie" });

    for (const name of [/microphone/i, /talk/i, /attach/i, /deep research/i]) {
      await expect(panel.getByRole("button", { name })).toHaveCount(0);
    }
  });

  test("sends the question and declares no client tools", async ({ page }) => {
    // Plan 014: the browser-executed tools (navigate, show evidence, set the
    // context panel) are gone — the chat only ever sends messages now.
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
    const toolNames = Object.keys(sent.tools ?? {});
    for (const removed of [
      "navigate_portfolio",
      "show_evidence",
      "set_context_panel",
    ]) {
      expect(toolNames).not.toContain(removed);
    }
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

  test("keeps the composer in view after a long answer, on mobile", async (
    { page },
    testInfo,
  ) => {
    // Plan 016: below lg the panel used to grow with the whole conversation
    // (`max-lg:h-auto`) and push the composer off screen. This proves the
    // bounded-height fix (`max-lg:max-h-[80svh]`) actually pins the composer
    // and scrolls the transcript inside the panel, the way desktop already
    // does. Desktop already has a bounded rail height, so there is nothing
    // new to prove there.
    test.skip(testInfo.project.name !== "mobile", "mobile only");

    // Mocks the `ai` package's UI message stream protocol directly (see
    // `toUIMessageStreamResponse()` in app/api/chat/route.ts) rather than
    // the plain-JSON 503 shape the other tests here use, because this test
    // needs a real streamed answer long enough to overflow the panel.
    const paragraph =
      "Flexi is CK-12's AI tutor, built for a platform serving over 20 million learners a year. ".repeat(
        20,
      );

    await page.route("**/api/chat", async (route) => {
      const chunks = [
        { type: "start" },
        { type: "start-step" },
        { type: "text-start", id: "t1" },
        { type: "text-delta", id: "t1", delta: paragraph },
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

    await page.goto("/");
    await scrollToAskPanel(page);
    await page.getByText("Tell me about Flexi", { exact: true }).click();

    const panel = page.getByRole("complementary", { name: "Ask Louie" });
    await expect(panel.getByText(paragraph.slice(0, 30))).toBeVisible({
      timeout: 10_000,
    });

    // Criterion 1: the composer stays within the viewport.
    const composerBox = await page
      .locator('#ask-ai-louie textarea[aria-label="Ask anything about Louie\'s work"]')
      .boundingBox();
    expect(composerBox).not.toBeNull();
    const viewportSize = page.viewportSize();
    expect(viewportSize).not.toBeNull();
    expect(composerBox!.y).toBeLessThan(viewportSize!.height);
    expect(composerBox!.y + composerBox!.height).toBeGreaterThan(0);

    // Criterion 2: the transcript scrolls inside the panel instead of
    // growing it to fit the whole conversation.
    const overflow = await page.evaluate(() => {
      const viewport = document.querySelector(
        '#ask-ai-louie [class*="overflow-y-auto"]',
      );
      if (!viewport) return null;
      return {
        scrollHeight: viewport.scrollHeight,
        clientHeight: viewport.clientHeight,
      };
    });
    expect(overflow).not.toBeNull();
    expect(overflow!.scrollHeight).toBeGreaterThan(overflow!.clientHeight + 4);
  });

  test("keeps the rest of the portfolio usable when AI fails", async ({ page }) => {
    // Spec §31: an AI outage must not take the portfolio with it.
    await page.route("**/api/chat", (route) =>
      route.fulfill({ status: 503, json: { error: "ai_unavailable" } }),
    );

    await page.goto("/");
    await scrollToAskPanel(page);
    await page.getByText("Show me Offboard", { exact: true }).click();

    // The hero's CTAs were removed (owner decision 2026-08-27); Featured
    // work carries the route out to /work now.
    await page
      .getByTestId("featured-work")
      .getByRole("link", { name: "All work →" })
      .click();
    await expect(page).toHaveURL(/\/work$/);
    await expect(page.locator("h1")).toBeVisible();
  });

  /**
   * Mocks the `ai` package's UI message stream protocol (see the "keeps the
   * composer in view" test above for the same shape) so a single text delta
   * carries the answer under test.
   */
  async function mockAnswer(page: Page, answer: string) {
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

  test("renders assistant markdown as real elements, not literal syntax", async ({
    page,
  }) => {
    // Plan 018: the model writes in markdown; before this, the panel printed
    // it as plain text — literal asterisks and hyphens instead of bold text
    // and a bullet list.
    const markdownAnswer =
      "This is **bold** text.\n\n- bullet one\n- bullet two\n\nInline `code` here.";
    await mockAnswer(page, markdownAnswer);

    await page.goto("/");
    await scrollToAskPanel(page);
    await page.getByText("Tell me about Flexi", { exact: true }).click();

    const panel = page.getByRole("complementary", { name: "Ask Louie" });

    // Real elements, not just visually-bold-looking text.
    await expect(
      panel.locator("strong", { hasText: "bold" }),
    ).toBeVisible({ timeout: 10_000 });
    await expect(panel.locator("li", { hasText: "bullet one" })).toBeVisible();
    await expect(panel.locator("li", { hasText: "bullet two" })).toBeVisible();
    await expect(panel.locator("code", { hasText: "code" })).toBeVisible();

    // The literal markdown syntax must not survive anywhere in the panel.
    await expect(panel.getByText("**bold**")).toHaveCount(0);
    await expect(panel.getByText("- bullet one")).toHaveCount(0);
  });

  test("never renders model-supplied HTML as live DOM (spec §32)", async ({
    page,
  }) => {
    // The guard this plan adds: react-markdown escapes raw HTML by default,
    // but only as long as no rehype plugin re-enables passthrough. This test
    // is written to fail the moment that stops being true — an `img` or
    // `script` element appearing, or `window.__pwned` getting set, means
    // the model's answer reached the DOM instead of the page's text.
    const htmlAnswer =
      '<img src=x onerror="window.__pwned=1">\n\n<script>window.__pwned=1</script>';
    await mockAnswer(page, htmlAnswer);

    await page.goto("/");
    await scrollToAskPanel(page);
    await page.getByText("Tell me about Flexi", { exact: true }).click();

    const panel = page.getByRole("complementary", { name: "Ask Louie" });

    // The markup shows up as visible text instead of being rendered...
    await expect(
      panel.getByText('<img src=x onerror="window.__pwned=1">'),
    ).toBeVisible({ timeout: 10_000 });
    await expect(
      panel.getByText("<script>window.__pwned=1</script>"),
    ).toBeVisible();

    // ...which means no actual img/script element exists inside the panel.
    //
    // Scoped to images *outside* an avatar rather than counting zero panel
    // images: AI Louie's own avatar is a real `<img>` of Louie's portrait
    // (owner decision, 2026-08-31), so a flat count of 0 would now fail on
    // the page's own markup and say nothing about the model's. Any image the
    // page did not put there itself still fails this.
    await expect(
      page.locator('#ask-ai-louie img:not([data-slot="message-avatar"] img)'),
    ).toHaveCount(0);
    await expect(page.locator("#ask-ai-louie script")).toHaveCount(0);

    // ...and neither payload ever executed.
    const pwned = await page.evaluate(() => (window as { __pwned?: unknown }).__pwned);
    expect(pwned).toBeUndefined();
  });

  test("links a real route, and never a fabricated one (spec §32)", async ({
    page,
  }) => {
    // The observed failure: the model invented a base URL and prepended it to
    // an otherwise correct route. `InlineLink` renders anything not starting
    // with "/" as an external new-tab link, so that shipped a live link to
    // nowhere. `resolveAnswerLink` now drops an unrecognised target to plain
    // text, keeping the sentence readable. `lib/ai/answer-link.test.ts` covers
    // the allowlist itself; this checks the renderer is actually wired to it.
    await mockAnswer(
      page,
      "See [the case study](<your-link-here>/work/offboard) and " +
        "[the architecture](/work/offboard#architecture) and " +
        "[a made-up page](/work/imaginary).",
    );

    await page.goto("/");
    await scrollToAskPanel(page);
    await page.getByText("Tell me about Flexi", { exact: true }).click();

    const panel = page.getByRole("complementary", { name: "Ask Louie" });

    // The one real route is a link...
    const good = panel.getByRole("link", { name: "the architecture" });
    await expect(good).toBeVisible({ timeout: 10_000 });
    await expect(good).toHaveAttribute("href", "/work/offboard#architecture");

    // ...while both unrecognised targets render as text, not links.
    await expect(panel.getByText("the case study")).toBeVisible();
    await expect(panel.getByRole("link", { name: "the case study" })).toHaveCount(0);
    await expect(panel.getByRole("link", { name: "a made-up page" })).toHaveCount(0);

    // Nothing in the panel points off-site.
    await expect(
      panel.locator('a[href^="http"], a[href^="<"], a[target="_blank"]'),
    ).toHaveCount(0);
  });

  test("centers the send button on one line, bottom-aligns it once the input wraps", async ({
    page,
  }) => {
    // Plan 018 owner decision: centered for a single line, bottom-aligned
    // once the textarea grows past one line. Before this fix the form was
    // always `items-end`, so on a single line the button's center sat
    // ~5.2px below the textarea's center — a 2px tolerance genuinely
    // discriminates between the old and new behavior.
    await page.goto("/");
    await scrollToAskPanel(page);

    const panel = page.getByRole("complementary", { name: "Ask Louie" });
    const textarea = panel.getByRole("textbox", {
      name: "Ask anything about Louie's work",
    });
    const sendButton = panel.getByRole("button", { name: "Send message" });

    await textarea.fill("hello there");
    const singleLineTextarea = await textarea.boundingBox();
    const singleLineButton = await sendButton.boundingBox();
    expect(singleLineTextarea).not.toBeNull();
    expect(singleLineButton).not.toBeNull();
    const singleLineTextareaCenter =
      singleLineTextarea!.y + singleLineTextarea!.height / 2;
    const singleLineButtonCenter =
      singleLineButton!.y + singleLineButton!.height / 2;
    expect(
      Math.abs(singleLineTextareaCenter - singleLineButtonCenter),
    ).toBeLessThanOrEqual(2);

    await textarea.fill(
      "This is a much longer message that should wrap across several lines in " +
        "the narrow composer textarea, so the send button stays bottom aligned " +
        "instead of centered.",
    );
    const multiLineTextarea = await textarea.boundingBox();
    const multiLineButton = await sendButton.boundingBox();
    expect(multiLineTextarea).not.toBeNull();
    expect(multiLineButton).not.toBeNull();
    const multiLineTextareaBottom =
      multiLineTextarea!.y + multiLineTextarea!.height;
    const multiLineButtonBottom = multiLineButton!.y + multiLineButton!.height;
    expect(
      Math.abs(multiLineTextareaBottom - multiLineButtonBottom),
    ).toBeLessThanOrEqual(2);
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
