import { defineConfig, devices } from "@playwright/test";

const PORT = Number(process.env.PLAYWRIGHT_PORT ?? 3100);
const baseURL = `http://localhost:${PORT}`;

/**
 * End-to-end tests.
 *
 * Runs against a production build on its own port, so a running `pnpm dev`
 * never collides with a test run and tests exercise what actually ships.
 * No API keys are required — every suite must pass without them (spec §31:
 * the site stays fully usable when AI is unavailable).
 */
export default defineConfig({
  testDir: "./e2e",
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  // CI also writes the HTML report, which embeds the traces recorded on
  // retry. Without it the workflow's failure upload had nothing to upload,
  // and a flaky test left no evidence of what hung.
  reporter: process.env.CI ? [["github"], ["html", { open: "never" }]] : [["list"]],
  use: {
    baseURL,
    trace: "on-first-retry",
    // Plan 051: the desktop homepage opens Ask Louie on arrival. Every test
    // starts as a visitor who closed it before, so suites that open the
    // panel themselves see it closed first. `home.spec.ts` clears this to
    // test the arrival behavior.
    storageState: {
      cookies: [],
      origins: [{ origin: baseURL, localStorage: [{ name: "ask-louie-closed", value: "1" }] }],
    },
  },
  projects: [
    {
      name: "desktop",
      use: { ...devices["Desktop Chrome"], viewport: { width: 1440, height: 900 } },
    },
    {
      name: "mobile",
      use: { ...devices["iPhone 13"] },
    },
  ],
  webServer: {
    command: `pnpm build && pnpm start --port ${PORT}`,
    url: baseURL,
    // Always rebuild. Reusing a running server silently tests stale code —
    // it once made a real accessibility regression look like a pass.
    reuseExistingServer: false,
    timeout: 180_000,
    env: {
      // Placeholders so the AI surface mounts and can be exercised. They are
      // never used to reach a provider: every AI test intercepts /api/chat.
      // No real key is required to run this suite (spec §31).
      OPENAI_API_KEY: "test-key-never-used",
      OPENAI_MODEL: "test-model-never-used",
      NEXT_PUBLIC_SITE_URL: baseURL,
      // Serve images as-is; see `images` in next.config.ts.
      PORTFOLIO_E2E: "1",
    },
  },
});
