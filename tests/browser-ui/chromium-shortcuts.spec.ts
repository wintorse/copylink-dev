import { chromium, expect, test } from "@playwright/test";
import { pressShortcut, readNativeClipboard } from "./native-input";
import path from "node:path";
import { readFile } from "node:fs/promises";

const extensionPath = path.resolve(import.meta.dirname, "../../dist");
const fixtureUrl = "http://127.0.0.1:4173/";

test("native shortcuts grant activeTab to the unmodified Chrome build", async () => {
  // Given: The unmodified Chrome extension has no persistent host permissions.
  const manifest: { host_permissions?: Array<string> } = JSON.parse(
    await readFile(path.join(extensionPath, "manifest.json"), "utf8"),
  );
  expect(manifest.host_permissions).toBeUndefined();
  const context = await chromium.launchPersistentContext("", {
    channel: "chromium",
    headless: false,
    args: [
      `--disable-extensions-except=${extensionPath}`,
      `--load-extension=${extensionPath}`,
    ],
  });
  try {
    // Given: The fixture page is active and the extension has no activeTab grant.
    const worker =
      context.serviceWorkers()[0] ??
      (await context.waitForEvent("serviceworker"));
    const page = await context.newPage();
    await page.goto(fixtureUrl);
    await page.evaluate(() => {
      document.title = "Copylink Chrome native shortcut";
    });
    await page.bringToFront();
    const getActiveUrl = () =>
      worker.evaluate(async () => {
        const [tab] = await chrome.tabs.query({
          active: true,
          currentWindow: true,
        });
        return tab?.url;
      });
    expect(await getActiveUrl()).toBeUndefined();

    // When: The native Copy Link shortcut is pressed.
    await pressShortcut("Copylink Chrome native shortcut", "alt+l");

    // Then: activeTab is granted, and the clipboard contains the title and HTML link.
    await expect.poll(getActiveUrl).toBe(fixtureUrl);
    await expect
      .poll(() => readNativeClipboard())
      .toBe("Copylink Chrome native shortcut");
    await expect
      .poll(() => readNativeClipboard("text/html"))
      .toContain(`<a href="${fixtureUrl}">Copylink Chrome native shortcut</a>`);

    // Given: The page has a different title for the Slack copy scenario.
    await page.evaluate(() => {
      document.title = "Copylink Chrome Slack shortcut";
    });

    // When: The native Copy Link for Slack shortcut is pressed.
    await pressShortcut("Copylink Chrome Slack shortcut", "alt+shift+l");

    // Then: The clipboard contains the new title and URL as a Markdown link.
    await expect
      .poll(() => readNativeClipboard())
      .toBe(`[Copylink Chrome Slack shortcut](${fixtureUrl})`);

    // Given: The page has a different title for the title-only copy scenario.
    await page.evaluate(() => {
      document.title = "Copylink Chrome title shortcut";
    });

    // When: The native Copy Title shortcut is pressed.
    await pressShortcut("Copylink Chrome title shortcut", "alt+t");

    // Then: The clipboard contains only the new page title.
    await expect
      .poll(() => readNativeClipboard())
      .toBe("Copylink Chrome title shortcut");

    // When: The tab navigates to a different origin.
    await page.goto("http://localhost:4173/");

    // Then: The activeTab grant is revoked and the extension cannot read the tab URL.
    await expect.poll(getActiveUrl).toBeUndefined();
  } finally {
    await context.close();
  }
});
