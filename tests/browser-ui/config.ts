import type { PlaywrightTestConfig } from "@playwright/test";
import process from "node:process";

export const browserUiConfig: PlaywrightTestConfig = {
  testDir: "./tests/browser-ui",
  workers: 1,
  timeout: 90_000,
  webServer: {
    command:
      "pnpm exec vite tests/e2e/http-fixture --host 127.0.0.1 --port 4173 --strictPort",
    url: "http://127.0.0.1:4173/",
    reuseExistingServer: process.env.CI === undefined,
  },
  use: { trace: "retain-on-failure", screenshot: "only-on-failure" },
};
