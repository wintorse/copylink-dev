/// <reference types="node" />
import { defineConfig } from "@playwright/test";
import process from "node:process";

// oxlint-disable-next-line import/no-default-export -- Playwright requires a default export for config
export default defineConfig({
  testDir: "./tests/firefox",
  outputDir: "test-results/firefox",
  reporter: [
    ["list"],
    ["html", { outputFolder: "playwright-report/firefox", open: "never" }],
  ],
  workers: 1,
  timeout: 30_000,
  webServer: {
    command:
      "pnpm exec vite tests/e2e/http-fixture --host 127.0.0.1 --port 4173 --strictPort",
    url: "http://127.0.0.1:4173/",
    reuseExistingServer: process.env.CI === undefined,
  },
  use: {
    trace: "retain-on-failure",
    screenshot: "only-on-failure",
    browserName: "firefox",
    launchOptions: {
      firefoxUserPrefs: { "dom.events.testing.asyncClipboard": true },
    },
  },
});
