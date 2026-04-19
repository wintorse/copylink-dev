import {
  type BrowserContext,
  type Page,
  type Worker,
  test as base,
  chromium,
} from "@playwright/test";

export type { Worker } from "@playwright/test";
import fs from "fs";
import os from "os";
import path from "path";

const DIST_PATH = path.join(import.meta.dirname, "..", "..", "dist");

/**
 * Create a temporary copy of the dist folder with host_permissions added
 * to the manifest. This is needed because `activeTab` only grants access
 * on explicit user gestures (keyboard shortcuts, action clicks) which
 * cannot be triggered programmatically from Playwright.
 *
 * @returns The path to the prepared extension directory that can be loaded in the test context.
 */
function prepareTestableDist(): string {
  const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), "copylink-e2e-"));
  fs.cpSync(DIST_PATH, tmpDir, { recursive: true });
  const manifestPath = path.join(tmpDir, "manifest.json");
  const manifest = JSON.parse(fs.readFileSync(manifestPath, "utf-8"));
  manifest.host_permissions = ["<all_urls>"];
  fs.writeFileSync(manifestPath, JSON.stringify(manifest, null, 2));
  return tmpDir;
}

export const test = base.extend<{
  context: BrowserContext;
  extensionId: string;
  sw: Worker;
}>({
  // eslint-disable-next-line no-empty-pattern
  context: async ({}, use) => {
    const extPath = prepareTestableDist();
    const context = await chromium.launchPersistentContext("", {
      channel: "chromium",
      locale: "en-US",
      args: [
        `--disable-extensions-except=${extPath}`,
        `--load-extension=${extPath}`,
        "--lang=en-US",
        "--accept-lang=en-US",
      ],
    });
    await use(context);
    await context.close();
    fs.rmSync(extPath, { recursive: true, force: true });
  },
  extensionId: async ({ context }, use) => {
    let [sw] = context.serviceWorkers();
    sw ??= await context.waitForEvent("serviceworker");
    const extensionId = sw.url().split("/")[2];
    await use(extensionId);
  },
  sw: async ({ context }, use) => {
    let [sw] = context.serviceWorkers();
    sw ??= await context.waitForEvent("serviceworker");
    await use(sw);
  },
});

export const expect = test.expect;

/** Public Google Sheets spreadsheet used across e2e tests. */
export const SHEETS_URL =
  "https://docs.google.com/spreadsheets/d/1edX-93flOBU51Vd-3dh0oZ5FDFdbpuV1V6uX3gLSADE/edit";

/** SHEETS_URL with a specific sheet and range pre-selected (for copy-google-sheets-range tests). */
export const SHEETS_URL_WITH_RANGE = `${SHEETS_URL}#gid=0&range=C2:E4`;

/**
 * Trigger a copylink-dev command via the extension's service worker.
 * Mirrors what `background.ts` does on `chrome.commands.onCommand`:
 * query active tab → inject content script → send message.
 *
 * @param sw - The extension's service worker handle.
 * @param page - The Playwright page to trigger the command on.
 * @param command - The copylink-dev command name (e.g. "copy-link").
 */
export async function triggerCommand(
  sw: Worker,
  page: Page,
  command: string,
): Promise<void> {
  // Wait for the page to be fully loaded before triggering
  await page.waitForLoadState("domcontentloaded");

  // Ensure this page is the active tab (mirrors user having the tab in focus)
  await page.bringToFront();

  await sw.evaluate(async (cmd) => {
    const [tab] = await chrome.tabs.query({
      active: true,
      currentWindow: true,
    });
    const tabId = tab?.id;
    if (tabId === undefined) {
      throw new Error("No active tab found");
    }

    await chrome.scripting.executeScript({
      target: { tabId },
      files: ["scripts/content.js"],
    });

    await chrome.tabs.sendMessage(tabId, {
      type: "execute-command",
      command: cmd,
    });
  }, command);

  // Give the content script time to process the copy
  await page.waitForTimeout(500);
}

/**
 * Read plain-text content from the clipboard via the page context.
 *
 * @param page - The Playwright page to read the clipboard from.
 * @returns The text content from the clipboard.
 */
export async function readClipboardText(page: Page): Promise<string> {
  return page.evaluate(() => navigator.clipboard.readText());
}

/**
 * Read HTML content from the clipboard via the page context.
 * Returns null if no text/html is available.
 *
 * @param page - The Playwright page to read the clipboard from.
 * @returns The HTML content from the clipboard, or null if not available.
 */
export async function readClipboardHtml(page: Page): Promise<string | null> {
  return page.evaluate(async () => {
    const items = await navigator.clipboard.read();
    for (const item of items) {
      if (item.types.includes("text/html")) {
        const blob = await item.getType("text/html");
        return blob.text();
      }
    }
    return null;
  });
}
