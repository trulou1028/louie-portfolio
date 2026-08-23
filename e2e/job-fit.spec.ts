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

async function openDialog(page: Page) {
  await page.goto("/");
  // Plan 011 moved Featured work ahead of the AI panel, so it now sits below
  // the fold — approaching it (as scrolling toward it would) is what
  // triggers the lazy-loaded runtime that renders this button (spec §27).
  await page.locator("#ask-ai-louie").scrollIntoViewIfNeeded();
  await page.getByRole("button", { name: "Paste a job description" }).click();
  return page.getByRole("dialog");
}

test.describe("the evaluator dialog", () => {
  test("opens with the recruiter framing and the privacy note", async ({ page }) => {
    const dialog = await openDialog(page);

    await expect(
      dialog.getByRole("heading", { name: "Evaluating Louie for a role?" }),
    ).toBeVisible();

    // The privacy line must be visible before anything is pasted (spec §22).
    await expect(
      dialog.getByText(/Used only to compare against portfolio evidence/),
    ).toBeVisible();
    await expect(dialog.getByText(/Not stored/)).toBeVisible();

    // No account required (spec §22).
    await expect(dialog.getByText(/sign in|sign up|create an account/i)).toHaveCount(0);
  });

  test("requires a substantial description before comparing", async ({ page }) => {
    const dialog = await openDialog(page);
    const submit = dialog.getByRole("button", { name: /Compare with/ });

    await expect(submit).toBeDisabled();
    await dialog.getByLabel("Job description").fill("Designer wanted");
    await expect(submit).toBeDisabled();

    await dialog.getByLabel("Job description").fill(JOB_DESCRIPTION);
    await expect(submit).toBeEnabled();
  });

  test("renders all four spec sections", async ({ page }) => {
    await page.route("**/api/job-fit", (route) =>
      route.fulfill({ status: 200, json: { result: SAMPLE_RESULT } }),
    );

    const dialog = await openDialog(page);
    await dialog.getByLabel("Job description").fill(JOB_DESCRIPTION);
    await dialog.getByRole("button", { name: /Compare with/ }).click();

    for (const section of [
      "Strong evidence",
      "Relevant work to review",
      "Gaps or unclear areas",
      "Suggested questions",
    ]) {
      await expect(dialog.getByText(section, { exact: true })).toBeVisible();
    }

    // Gaps are stated plainly, not hidden.
    await expect(dialog.getByText("Managing a design team")).toBeVisible();

    // Matches link to their evidence.
    await expect(
      dialog.locator('a[href*="/work/offboard"]').first(),
    ).toBeVisible();
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

    const dialog = await openDialog(page);
    await dialog.getByLabel("Job description").fill(JOB_DESCRIPTION);
    await dialog.getByRole("button", { name: /Compare with/ }).click();
    await expect(dialog.getByText("Strong evidence", { exact: true })).toBeVisible();

    const body = await dialog.innerText();
    expect(body).not.toMatch(/\d{1,3}\s?%/);
    expect(body).not.toMatch(/\d\s*(\/|out of)\s*\d/);
    expect(body).not.toMatch(/\b(score|rating|ranked)\s*[:=]/i);
  });

  test("degrades honestly when the comparison fails", async ({ page }) => {
    await page.route("**/api/job-fit", (route) =>
      route.fulfill({ status: 502, json: { error: "comparison_failed" } }),
    );

    const dialog = await openDialog(page);
    await dialog.getByLabel("Job description").fill(JOB_DESCRIPTION);
    await dialog.getByRole("button", { name: /Compare with/ }).click();

    await expect(dialog.getByRole("alert")).toContainText(
      /couldn.t be completed/i,
    );
  });

  test("closes on Escape and forgets what was pasted", async ({ page }) => {
    const dialog = await openDialog(page);
    await dialog.getByLabel("Job description").fill(JOB_DESCRIPTION);

    await page.keyboard.press("Escape");
    await expect(page.getByRole("dialog")).toBeHidden();

    // Reopening starts clean — the description is not retained.
    await page.getByRole("button", { name: "Paste a job description" }).click();
    await expect(page.getByRole("dialog").getByLabel("Job description")).toHaveValue(
      "",
    );
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
