import { expect, test } from "@playwright/test";
import path from "node:path";

// Firefox extension installation is outside Playwright's supported API.
// Run the Firefox bundle with mocked extension APIs to exercise real Gecko clipboard and DOM behavior.
for (const command of ["copy-title", "copy-link"] as const) {
  test(`${command} works in Firefox with native and fallback clipboard APIs`, async ({
    page,
  }) => {
    await page.goto("http://127.0.0.1:4173/");
    await page.evaluate((cmd) => {
      const button = document.createElement("button");
      button.id = "copy-test";
      button.textContent = "Copy";
      document.body.appendChild(button);
      Object.assign(globalThis, {
        chrome: {
          i18n: { getMessage: (key: string) => key },
          runtime: {
            getURL: () =>
              "data:text/css,.copylink-dev-toast%7Bposition:fixed%7D",
            onMessage: {
              addListener: (
                listener: (
                  message: object,
                  sender: object,
                  respond: (data: { success: boolean }) => void,
                ) => boolean,
              ) => {
                button.addEventListener("click", () => {
                  listener(
                    { type: "execute-command", command: cmd },
                    {},
                    (data) => {
                      document.body.dataset.copyResult = String(data.success);
                    },
                  );
                });
              },
            },
          },
        },
      });
    }, command);
    await page.addScriptTag({
      path: path.resolve(import.meta.dirname, "../../dist/scripts/content.js"),
    });

    await page.click("#copy-test");
    await expect(page.locator("body")).toHaveAttribute(
      "data-copy-result",
      "true",
    );
    expect(await page.evaluate(() => navigator.clipboard.readText())).toBe(
      "Test Title",
    );
    if (command === "copy-link") {
      const html = await page.evaluate(async () => {
        const [item] = await navigator.clipboard.read();
        return (await item.getType("text/html")).text();
      });
      expect(html).toContain('<a href="http://127.0.0.1:4173/">Test Title</a>');
    }

    // Disable the native write methods while leaving native clipboard reads available.
    await page.evaluate(() => {
      Object.defineProperty(navigator.clipboard, "write", {
        value: () => Promise.reject(new Error("forced fallback")),
      });
      Object.defineProperty(navigator.clipboard, "writeText", {
        value: () => Promise.reject(new Error("forced fallback")),
      });
      delete document.body.dataset.copyResult;
    });
    await page.click("#copy-test");
    await expect(page.locator("body")).toHaveAttribute(
      "data-copy-result",
      "true",
    );
    expect(await page.evaluate(() => navigator.clipboard.readText())).toBe(
      "Test Title",
    );
    if (command === "copy-link") {
      const html = await page.evaluate(async () => {
        const [item] = await navigator.clipboard.read();
        return (await item.getType("text/html")).text();
      });
      expect(html).toContain('<a href="http://127.0.0.1:4173/">Test Title</a>');
    }
  });
}
