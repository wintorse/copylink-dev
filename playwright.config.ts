/// <reference types="node" />

import { defineConfig } from "@playwright/test";
import process from "node:process";

// oxlint-disable-next-line import/no-default-export -- Playwright requires a default export for config
export default defineConfig({
  testDir: "./tests/e2e",
  timeout: 60_000,
  retries: 1,
  workers: 1, // Extensions require persistent context — run serially
  webServer: {
    command:
      "pnpm exec vite tests/e2e/http-fixture --host 127.0.0.1 --port 4173 --strictPort",
    url: "http://127.0.0.1:4173/",
    reuseExistingServer: process.env.CI === undefined,
  },
  use: {
    permissions: ["clipboard-read", "clipboard-write"],
  },
});
