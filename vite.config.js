import { resolve } from "node:path";
import { defineConfig, loadEnv } from "vite";
import {
  copyFileSync,
  unlinkSync,
  existsSync,
  readFileSync,
  writeFileSync,
} from "node:fs";

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

            // Update popup.html to use Firefox links and icons
            const popupPath = resolve(distDir, "popup.html");
            if (existsSync(popupPath)) {
              let popupContent = readFileSync(popupPath, "utf8");

              // Replace Chrome Web Store link with Firefox Add-ons link
              popupContent = popupContent.replace(
                /<a href="https:\/\/chromewebstore\.google\.com\/detail\/ohkebnhdjdgmfnhcmdpkdfddongdjadp\?utm_source=popup" target="_blank" class="link">\s*<img src="images\/chromewebstore-icon\.svg" alt="Chrome Web Store" class="icon">\s*Leave feedback\s*<\/a>/,
                '<a href="https://addons.mozilla.org/ja/firefox/addon/copylink-dev/" target="_blank" class="link">\n            <img src="images/firefox-icon.svg" alt="Firefox Add-ons" class="icon">\n            Leave feedback\n        </a>'
              );

              writeFileSync(popupPath, popupContent);
              console.log("Updated popup.html for Firefox");
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
