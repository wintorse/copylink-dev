import {
  copyFileSync,
  existsSync,
  readFileSync,
  unlinkSync,
  writeFileSync,
} from "node:fs";
import { defineConfig, loadEnv } from "vite";
import { resolve } from "node:path";

// NOTE: The content script is built with a separate config in `vite.content.config.js`.
// We split configs so the content script can be authored with `import` syntax but bundled into a classic script.
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
                  "src/scripts/background_firefox.ts",
                ),
              }
            : {
                background: resolve(__dirname, "src/scripts/background.ts"),
              }),
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

              // Replace Chrome Web Store feedback link with Firefox Add-ons link
              popupContent = popupContent
                .replace(
                  /https:\/\/chromewebstore\.google\.com\/detail\/ohkebnhdjdgmfnhcmdpkdfddongdjadp\?utm_source=popup/g,
                  "https://addons.mozilla.org/ja/firefox/addon/copylink-dev/",
                )
                .replace(
                  /images\/chromewebstore-icon\.svg/g,
                  "images/firefox-icon.svg",
                )
                .replace(/alt="Chrome Web Store"/g, 'alt="Firefox Add-ons"');

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
