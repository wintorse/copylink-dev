import { defineConfig } from "@playwright/test";

// oxlint-disable-next-line import/no-default-export -- Playwright requires a default export for config
export default defineConfig({
  testDir: "./tests/e2e",
  timeout: 30_000,
  retries: 1,
  workers: 1, // Extensions require persistent context — run serially
  use: {
    permissions: ["clipboard-read", "clipboard-write"],
  },
});
