import { resolve } from "node:path";
import { defineConfig } from "vite";

export default defineConfig({
  root: "src",
  publicDir: resolve(__dirname, "public"),
  build: {
    outDir: "../dist",
    emptyOutDir: true,
    rollupOptions: {
      input: {
        background: resolve(__dirname, "src/background/background.ts"),
        popup: resolve(__dirname, "src/popup/popup.ts"),
      },
      output: {
        entryFileNames: "scripts/[name].js",
        chunkFileNames: "scripts/[name].js",
        assetFileNames: "assets/[name].[ext]",
      },
    },
  },
});
