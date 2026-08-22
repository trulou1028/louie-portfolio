import { defineConfig } from "vitest/config";
import path from "node:path";

/**
 * Unit tests for pure logic — retrieval, schemas, tool validation.
 * Browser behavior is covered by Playwright in `e2e/`, so this stays a fast
 * Node-only suite with no DOM.
 */
export default defineConfig({
  test: {
    environment: "node",
    include: ["lib/**/*.test.ts", "content/**/*.test.ts", "scripts/**/*.test.ts"],
  },
  resolve: {
    alias: { "@": path.resolve(__dirname) },
  },
});
