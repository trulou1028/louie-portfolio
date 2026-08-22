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
  reporter: process.env.CI ? "github" : [["list"]],
  use: {
    baseURL,
    trace: "on-first-retry",
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
    reuseExistingServer: !process.env.CI,
    timeout: 180_000,
    env: {
      // Placeholders so the AI surface mounts and can be exercised. They are
      // never used to reach a provider: every AI test intercepts /api/chat.
      // No real key is required to run this suite (spec §31).
      OPENAI_API_KEY: "test-key-never-used",
      OPENAI_MODEL: "test-model-never-used",
      NEXT_PUBLIC_SITE_URL: baseURL,
    },
  },
});
