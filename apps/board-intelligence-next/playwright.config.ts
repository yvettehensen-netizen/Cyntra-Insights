import { defineConfig } from "@playwright/test";

export default defineConfig({
  testDir: "tests/e2e",
  fullyParallel: true,
  retries: 0,
  use: {
    baseURL: "http://127.0.0.1:3000",
    trace: "on-first-retry"
  },
  webServer: {
    command: "ANALYSIS_INLINE_PROCESSING=true next dev --hostname 127.0.0.1 --port 3000",
    port: 3000,
    timeout: 120_000,
    reuseExistingServer: true
  }
});
