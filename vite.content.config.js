import { defineConfig, loadEnv } from "vite";
import { resolve } from "node:path";

// NOTE:
// We intentionally keep a dedicated Vite config for the content script build.
// This allows the content script source (e.g. `content.ts`) to be authored with ES module `import` syntax,
// while still emitting a single classic script bundle (IIFE) required by extension content scripts.

// Content scripts are not loaded as ES modules.
// Inline all dependencies into a single file and emit it as a classic script.
export default defineConfig(({ mode }) => {
  process.env = { ...process.env, ...loadEnv(mode, process.cwd()) };

  return {
    root: "src",
    // Disable re-copying `public` on the second build to avoid overwriting manifest files, etc.
    publicDir: false,
    build: {
      outDir: "../dist",
      emptyOutDir: false,
      rollupOptions: {
        input: {
          content: resolve(__dirname, "src/scripts/content.ts"),
        },
        output: {
          format: "iife",
          name: "copylinkDevContent",
          entryFileNames: "scripts/content.js",
          inlineDynamicImports: true,
        },
      },
    },
  };
});
