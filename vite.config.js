import { resolve } from "node:path";
import { defineConfig, loadEnv } from "vite";
import { copyFileSync, unlinkSync, existsSync } from "node:fs";

export default defineConfig(({ mode }) => {
  process.env = { ...process.env, ...loadEnv(mode, process.cwd()) };
  const isFirefoxAddOn = process.env.VITE_IS_FIREFOX_ADDON === "true";
  console.log("isFirefoxAddOn:", isFirefoxAddOn);

  return {
    root: "src",
    publicDir: resolve(__dirname, "public"),
    build: {
      outDir: "../dist",
      emptyOutDir: true,
      rollupOptions: {
        input: {
          ...(isFirefoxAddOn
            ? {
                background: resolve(
                  __dirname,
                  "src/scripts/background_firefox.ts"
                ),
              }
            : {
                background: resolve(__dirname, "src/scripts/background.ts"),
              }),
          content: resolve(__dirname, "src/scripts/content.ts"),
          popup: resolve(__dirname, "src/popup/popup.ts"),
        },
        output: {
          entryFileNames: "scripts/[name].js",
          chunkFileNames: "scripts/[name].js",
          assetFileNames: "assets/[name].[ext]",
        },
      },
    },
    plugins: [
      {
        name: "handle-manifest",
        closeBundle() {
          const distDir = resolve(__dirname, "dist");
          const manifestPath = resolve(distDir, "manifest.json");
          const firefoxManifestPath = resolve(distDir, "manifest_firefox.json");

          if (isFirefoxAddOn) {
            // For Firefox: Delete manifest.json and rename manifest_firefox.json to manifest.json
            if (existsSync(manifestPath)) {
              unlinkSync(manifestPath);
            }
            if (existsSync(firefoxManifestPath)) {
              copyFileSync(firefoxManifestPath, manifestPath);
              unlinkSync(firefoxManifestPath);
            }
          } else {
            // For Chrome: Delete manifest_firefox.json
            if (existsSync(firefoxManifestPath)) {
              unlinkSync(firefoxManifestPath);
            }
          }
        },
      },
    ],
  };
});
