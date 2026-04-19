import { defineConfig } from "vitest/config";

// oxlint-disable-next-line import/no-default-export -- Vitest requires a default export for config
export default defineConfig({
  test: {
    include: ["tests/unit/**/*.test.ts"],
    environment: "happy-dom",
  },
});
