import { browserUiConfig } from "./tests/browser-ui/config";
import { defineConfig } from "@playwright/test";

// oxlint-disable-next-line import/no-default-export -- Playwright requires a default export for config
export default defineConfig({
  ...browserUiConfig,
  testMatch: "firefox-addon.spec.ts",
  outputDir: "test-results/firefox-addon",
  reporter: [
    ["list"],
    [
      "html",
      { outputFolder: "playwright-report/firefox-addon", open: "never" },
    ],
  ],
});
