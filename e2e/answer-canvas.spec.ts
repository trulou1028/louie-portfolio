import { test, expect } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";

/**
 * The Answer Canvas (spec §19, §21, §26, §32; Plan 012).
 *
 * "Ask the panel; the site answers" — a question asked in the rail composes
 * an Answer Sheet in the main column instead of piling up as bubbles in the
 * sidebar. This intercepts `/api/chat` with a hand-built AI SDK UI-message
 * stream (the same wire protocol `streamText(...).toUIMessageStreamResponse()`
 * emits in `app/api/chat/route.ts`), so the suite runs keyless and never
 * reaches a provider — the same idiom every other AI e2e spec uses, just
 * extended to a successful run instead of only the failure paths.
 */

const QUESTION = "Show me Offboard";
const EVIDENCE_ID = "offboard-fragmentation-problem";
const ANSWER_TEXT =
  "Offboard treats a job search as one connected workspace instead of a dozen disconnected tools.";

function sseChunk(chunk: unknown): string {
  return `data: ${JSON.stringify(chunk)}\n\n`;
}

/**
 * A minimal but realistic two-step run: `search_portfolio` returns one
 * evidence item, then the model answers from it. Mirrors the chunk sequence
 * `ai`'s UI message stream actually emits (spec: `ui-message-chunks.ts`).
 */
function mockedChatStream(): string {
  const chunks: unknown[] = [
    { type: "start", messageId: "asst_1" },
    { type: "start-step" },
    {
      type: "tool-input-start",
      toolCallId: "call_1",
      toolName: "search_portfolio",
    },
    {
      type: "tool-input-available",
      toolCallId: "call_1",
      toolName: "search_portfolio",
      input: { query: QUESTION },
    },
    {
      type: "tool-output-available",
      toolCallId: "call_1",
      output: {
        results: [
          {
            id: EVIDENCE_ID,
            project: "offboard",
            title: "Why job seekers become the integration layer",
            summary:
              "A job search spans a dozen disconnected tools, so the applicant rebuilds the same context by hand at every step.",
            route: "/work/offboard",
            anchor: "context",
          },
        ],
      },
    },
    { type: "finish-step" },
    { type: "start-step" },
    { type: "text-start", id: "t1" },
    { type: "text-delta", id: "t1", delta: ANSWER_TEXT },
    { type: "text-end", id: "t1" },
    { type: "finish-step" },
    { type: "finish" },
  ];

  return chunks.map(sseChunk).join("") + "data: [DONE]\n\n";
}

async function mockChat(page: import("@playwright/test").Page) {
  await page.route("**/api/chat", async (route) => {
    // A brief, deliberate delay so the pending skeleton is observable
    // before the mocked answer resolves — a real run streams over time too.
    await new Promise((resolve) => setTimeout(resolve, 300));
    await route.fulfill({
      status: 200,
      headers: {
        "content-type": "text/event-stream",
        "x-vercel-ai-ui-message-stream": "v1",
      },
      body: mockedChatStream(),
    });
  });
}

async function ask(page: import("@playwright/test").Page) {
  await page.goto("/");
  // Below xl, `Canvas` renders the rail in a structurally different tree
  // than on xl+ (a stacked `<div>` vs. a `PersistentPanelGroup` pane) —
  // `useMinWidth` reports desktop for the first client render even on a
  // real mobile viewport (matching SSR) and corrects one effect later,
  // unmounting and remounting the rail's subtree. Retrying the whole action
  // rides out a `goto` that lands mid-swap.
  await expect(async () => {
    await page.locator("#ask-ai-louie").scrollIntoViewIfNeeded();
  }).toPass({ timeout: 5_000 });
  const panel = page.getByRole("complementary", { name: "Ask AI Louie" });
  await panel.getByText(QUESTION, { exact: true }).click();
}

test.describe("the Answer Canvas", () => {
  test("composes a grounded answer with evidence, then Clear restores the homepage", async ({
    page,
  }) => {
    await mockChat(page);
    await ask(page);

    const canvas = page.locator("#answer");
    await expect(canvas).toBeVisible();
    await expect(canvas.getByText(QUESTION)).toBeVisible();

    // The skeleton — a shimmer, not a spinner — while the mocked response is
    // still in flight.
    await expect(canvas.locator(".animate-pulse").first()).toBeVisible();

    // The full answer and its evidence land in the main column, not the
    // panel.
    await expect(canvas.getByText(ANSWER_TEXT)).toBeVisible({ timeout: 10_000 });
    await expect(canvas.getByText("Grounded in 1 portfolio source")).toBeVisible();
    await expect(
      canvas.getByRole("link", { name: "Open the strongest evidence" }),
    ).toHaveAttribute("href", "/work/offboard#context");
    await expect(
      canvas.locator('[data-evidence-id="offboard-fragmentation-problem"]'),
    ).toBeVisible();

    // Focus follows the answer (spec §26).
    await expect(
      canvas.getByRole("heading", { name: QUESTION }),
    ).toBeFocused();

    // Clear returns the canvas to the ordinary homepage.
    await canvas.getByRole("button", { name: "Clear" }).click();
    await expect(page.locator("#answer")).toHaveCount(0);
    await expect(page.getByTestId("featured-work")).toBeVisible();
  });

  test("an unknown evidence id from the model never reaches the canvas", async ({ page }) => {
    // Spec §32: model output is never trusted as routing data. An id the
    // curated evidence index does not recognize must be dropped, not shown.
    await page.route("**/api/chat", async (route) => {
      const chunks: unknown[] = [
        { type: "start", messageId: "asst_1" },
        { type: "start-step" },
        {
          type: "tool-input-available",
          toolCallId: "call_1",
          toolName: "search_portfolio",
          input: { query: QUESTION },
        },
        {
          type: "tool-output-available",
          toolCallId: "call_1",
          output: {
            results: [
              {
                id: "not-a-real-evidence-id",
                project: "offboard",
                title: "Fabricated",
                summary: "Should never render.",
                route: "/work/offboard",
              },
            ],
          },
        },
        { type: "finish-step" },
        { type: "start-step" },
        { type: "text-start", id: "t1" },
        { type: "text-delta", id: "t1", delta: ANSWER_TEXT },
        { type: "text-end", id: "t1" },
        { type: "finish-step" },
        { type: "finish" },
      ];
      await route.fulfill({
        status: 200,
        headers: {
          "content-type": "text/event-stream",
          "x-vercel-ai-ui-message-stream": "v1",
        },
        body: chunks.map(sseChunk).join("") + "data: [DONE]\n\n",
      });
    });

    await ask(page);

    const canvas = page.locator("#answer");
    await expect(canvas.getByText(ANSWER_TEXT)).toBeVisible({ timeout: 10_000 });
    await expect(canvas.getByText(/Grounded in/)).toHaveCount(0);
    await expect(canvas.getByText("Fabricated")).toHaveCount(0);
  });

  test("the sheet is accessible when open", async ({ page }) => {
    await mockChat(page);
    await ask(page);

    await expect(page.locator("#answer").getByText(ANSWER_TEXT)).toBeVisible({
      timeout: 10_000,
    });

    const results = await new AxeBuilder({ page })
      .withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa"])
      .exclude("[data-base-ui-focus-guard]")
      .analyze();

    const blocking = results.violations.filter(
      (v) => v.impact === "serious" || v.impact === "critical",
    );
    expect(
      blocking,
      blocking.map((v) => `${v.id}: ${v.help}`).join("\n"),
    ).toEqual([]);
  });
});
