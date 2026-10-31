import { browserUiConfig } from "./tests/browser-ui/config";
import { defineConfig } from "@playwright/test";

// oxlint-disable-next-line import/no-default-export -- Playwright requires a default export for config
export default defineConfig({
  ...browserUiConfig,
  testMatch: "chromium-shortcuts.spec.ts",
  outputDir: "test-results/chromium-shortcuts",
  reporter: [
    ["list"],
    [
      "html",
      { outputFolder: "playwright-report/chromium-shortcuts", open: "never" },
    ],
  ],
});
