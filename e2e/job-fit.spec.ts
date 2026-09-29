import { test, expect, type Page } from "@playwright/test";

/**
 * The job-description evaluator (spec §18 Tool 4, §22, §30, §32).
 *
 * `/api/job-fit` is intercepted throughout, so the suite runs without an API
 * key. What is asserted is the part that must hold whatever the model says:
 * the four sections, honest gaps, no scores, no leaked text, and a dialog
 * that behaves for keyboard users.
 */

const SAMPLE_RESULT = {
  summary: "A senior AI product design role with a strong systems emphasis.",
  strongestMatches: [
    {
      requirement: "Designing AI products with human oversight",
      evidenceIds: ["offboard-hitl-actions"],
      explanation:
        "Offboard's consequential AI actions are previewed and confirmed before they run.",
    },
  ],
  weakerAreas: [
    {
      requirement: "Managing a design team",
      explanation:
        "The portfolio does not currently contain evidence for this requirement.",
    },
  ],
  suggestedProjectsToReview: ["offboard", "flexi"],
  suggestedQuestions: [
    "How large a team have you worked alongside?",
    "Which parts of Offboard did you build yourself?",
  ],
  demotedCount: 0,
};

const JOB_DESCRIPTION = "We are looking for a senior product designer. ".repeat(12);

/** Plan 042: the comparison lives in the Ask Louie panel's "Compare a role" view. */
async function openDialog(page: Page) {
  await page.goto("/");
  await page.getByRole("button", { name: "Ask Louie", exact: true }).click();
  await expect(page.locator("#ask-ai-louie")).toBeVisible();
  await page.locator("#ask-ai-louie").getByRole("button", { name: "Paste a job description" }).click();
  const view = page.locator("#ask-ai-louie").getByRole("region", { name: "Compare a role" });
  await expect(view).toBeVisible();
  // Opening the view puts focus in the text box (see JobCompare).
  await expect(view.getByLabel("Job description")).toBeFocused();
  return view;
}

test.describe("the job comparison", () => {
  test("opens with the recruiter framing and the privacy note", async ({ page }) => {
    const view = await openDialog(page);

    await expect(view.getByRole("heading", { name: "Compare a role" })).toBeVisible();

    // The privacy line must be visible before anything is pasted (spec §22).
    await expect(view.getByText(/Used only for this comparison/)).toBeVisible();
    await expect(view.getByText(/Not stored/)).toBeVisible();

    // No account required (spec §22).
    await expect(view.getByText(/sign in|sign up|create an account/i)).toHaveCount(0);
  });

  test("the hero button opens the same view", async ({ page }) => {
    await page.goto("/");
    await page.getByRole("region", { name: "Introduction" }).getByRole("button", { name: "Paste a job description" }).click();
    await expect(page.locator("#ask-ai-louie").getByRole("region", { name: "Compare a role" })).toBeVisible();
  });

  test("requires a substantial description before comparing", async ({ page }) => {
    const view = await openDialog(page);
    const submit = view.getByRole("button", { name: /Compare with/ });

    await expect(submit).toBeDisabled();
    await view.getByLabel("Job description").fill("Designer wanted");
    await expect(submit).toBeDisabled();

    await view.getByLabel("Job description").fill(JOB_DESCRIPTION);
    await expect(submit).toBeEnabled();
  });

  test("shows a reading state while comparing", async ({ page }) => {
    await page.route("**/api/job-fit", async (route) => {
      await new Promise((resolve) => setTimeout(resolve, 1500));
      await route.fulfill({ status: 200, json: { result: SAMPLE_RESULT } });
    });
    const view = await openDialog(page);
    await view.getByLabel("Job description").fill(JOB_DESCRIPTION);
    await view.getByRole("button", { name: /Compare with/ }).click();
    await expect(view.getByText("Comparing this role with my case studies")).toBeVisible();
    await expect(view.locator('[aria-busy="true"]')).toBeVisible();
    await expect(view.getByText("Where I match", { exact: true })).toBeVisible({ timeout: 10_000 });
  });

  test("renders a short result: matches, gaps, and questions", async ({ page }) => {
    await page.route("**/api/job-fit", (route) =>
      route.fulfill({ status: 200, json: { result: SAMPLE_RESULT } }),
    );

    const view = await openDialog(page);
    await view.getByLabel("Job description").fill(JOB_DESCRIPTION);
    await view.getByRole("button", { name: /Compare with/ }).click();

    for (const section of ["Where I match", "Gaps to ask me about", "Questions to ask me"]) {
      await expect(view.getByText(section, { exact: true })).toBeVisible();
    }

    // Gaps are stated plainly, not hidden.
    await expect(view.getByText("Managing a design team")).toBeVisible();

    // Matches link to their evidence.
    await expect(view.locator('a[href*="/work/offboard"]').first()).toBeVisible();
  });

  test("shows three rows per group and reveals the rest on request", async ({ page }) => {
    const many = {
      ...SAMPLE_RESULT,
      weakerAreas: ["A", "B", "C", "D", "E"].map((letter) => ({ requirement: `Requirement ${letter}`, explanation: "Not documented here." })),
    };
    await page.route("**/api/job-fit", (route) => route.fulfill({ status: 200, json: { result: many } }));
    const view = await openDialog(page);
    await view.getByLabel("Job description").fill(JOB_DESCRIPTION);
    await view.getByRole("button", { name: /Compare with/ }).click();
    await expect(view.getByText("Requirement C")).toBeVisible();
    await expect(view.getByText("Requirement D")).toHaveCount(0);
    await view.getByRole("button", { name: "Show 2 more" }).click();
    await expect(view.getByText("Requirement E")).toBeVisible();
  });

  test("shows each evidence page once, even when several entries share it", async ({ page }) => {
    const errors: string[] = [];
    page.on("console", (message) => { if (message.type() === "error") errors.push(message.text()); });
    const shared = {
      ...SAMPLE_RESULT,
      strongestMatches: [{
        requirement: "Full-stack implementation",
        evidenceIds: ["career-technical-fluency", "career-experience-arc"],
        explanation: "Both entries live on the resume page.",
      }],
    };
    await page.route("**/api/job-fit", (route) => route.fulfill({ status: 200, json: { result: shared } }));
    const view = await openDialog(page);
    await view.getByLabel("Job description").fill(JOB_DESCRIPTION);
    await view.getByRole("button", { name: /Compare with/ }).click();
    await expect(view.getByText("Full-stack implementation")).toBeVisible();
    await expect(view.locator('a[href="/resume"]')).toHaveCount(1);
    expect(errors.filter((text) => text.includes("same key"))).toEqual([]);
  });

  test("the result view never introduces a score of its own", async ({ page }) => {
    // Spec §18 forbids numeric match scores. Stripping them out of model
    // prose happens server-side in verifyMatches and is covered by
    // lib/ai/job-fit.test.ts — mocking this endpoint deliberately bypasses
    // that, so what is asserted here is narrower and still worth having: given
    // a clean result, the UI adds no percentage, ratio, or rating itself.
    await page.route("**/api/job-fit", (route) =>
      route.fulfill({ status: 200, json: { result: SAMPLE_RESULT } }),
    );

    const view = await openDialog(page);
    await view.getByLabel("Job description").fill(JOB_DESCRIPTION);
    await view.getByRole("button", { name: /Compare with/ }).click();
    await expect(view.getByText("Where I match", { exact: true })).toBeVisible();

    const body = await view.innerText();
    expect(body).not.toMatch(/\d{1,3}\s?%/);
    expect(body).not.toMatch(/\d\s*(\/|out of)\s*\d/);
    expect(body).not.toMatch(/\b(score|rating|ranked)\s*[:=]/i);
  });

  test("degrades honestly when the comparison fails", async ({ page }) => {
    await page.route("**/api/job-fit", (route) =>
      route.fulfill({ status: 502, json: { error: "comparison_failed" } }),
    );

    const view = await openDialog(page);
    await view.getByLabel("Job description").fill(JOB_DESCRIPTION);
    await view.getByRole("button", { name: /Compare with/ }).click();

    await expect(view.getByRole("alert")).toContainText(/couldn.t be completed/i);
  });

  test("closing the panel forgets what was pasted", async ({ page }) => {
    const view = await openDialog(page);
    await view.getByLabel("Job description").fill(JOB_DESCRIPTION);

    await page.keyboard.press("Escape");
    await expect(page.locator("#ask-ai-louie")).toBeHidden();

    // Reopening starts clean — the description is not retained.
    await page.getByRole("button", { name: "Ask Louie", exact: true }).click();
    await page.locator("#ask-ai-louie").getByRole("button", { name: "Paste a job description" }).click();
    await expect(page.locator("#ask-ai-louie").getByLabel("Job description")).toHaveValue("");
  });

  test("Back to chat keeps the conversation", async ({ page }) => {
    const view = await openDialog(page);
    await view.getByRole("button", { name: "Back to chat" }).click();
    await expect(page.locator("#ask-ai-louie").getByRole("textbox", { name: "Ask anything about Louie's work" })).toBeVisible();
  });
});

test.describe("the job-fit endpoint", () => {
  test("rejects a too-short description", async ({ request }) => {
    const response = await request.post("/api/job-fit", {
      data: { jobDescription: "Designer wanted" },
    });
    expect(response.status()).toBe(400);
    expect((await response.json()).error).toBe("invalid_request");
  });

  test("rejects an oversized description", async ({ request }) => {
    const response = await request.post("/api/job-fit", {
      data: { jobDescription: "x".repeat(15_001) },
    });
    expect(response.status()).toBe(400);
  });

  test("never echoes the description back", async ({ request }) => {
    // A pasted description must not appear in any response body (spec §30).
    const marker = "CONFIDENTIAL-ROLE-MARKER-9137";
    const response = await request.post("/api/job-fit", {
      data: { jobDescription: `${marker} `.repeat(30) },
    });
    expect(await response.text()).not.toContain(marker);
  });
});
