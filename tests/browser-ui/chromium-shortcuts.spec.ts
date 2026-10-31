import { chromium, expect, test } from "@playwright/test";
import { pressShortcut, readNativeClipboard } from "./native-input";
import path from "node:path";
import { readFile } from "node:fs/promises";

const extensionPath = path.resolve(import.meta.dirname, "../../dist");
const fixtureUrl = "http://127.0.0.1:4173/";

// eslint-disable-next-line no-empty-pattern -- The test manages its own extension context.
test("native shortcuts grant activeTab to the unmodified Chrome build", async ({}, testInfo) => {
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
    await context.tracing.start({ screenshots: true, snapshots: true });
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

    await pressShortcut("Copylink Chrome native shortcut", "alt+l");
    await expect
      .poll(() => readNativeClipboard())
      .toBe("Copylink Chrome native shortcut");
    await expect
      .poll(() => readNativeClipboard("text/html"))
      .toContain(`<a href="${fixtureUrl}">Copylink Chrome native shortcut</a>`);
    expect(await getActiveUrl()).toBe(fixtureUrl);

    await page.evaluate(() => {
      document.title = "Copylink Chrome Slack shortcut";
    });
    await pressShortcut("Copylink Chrome Slack shortcut", "alt+shift+l");
    await expect
      .poll(() => readNativeClipboard())
      .toBe(`[Copylink Chrome Slack shortcut](${fixtureUrl})`);

    await page.evaluate(() => {
      document.title = "Copylink Chrome title shortcut";
    });
    await pressShortcut("Copylink Chrome title shortcut", "alt+t");
    await expect
      .poll(() => readNativeClipboard())
      .toBe("Copylink Chrome title shortcut");

    await page.goto("http://localhost:4173/");
    await expect.poll(getActiveUrl).toBeUndefined();
  } catch (error) {
    const tracePath = testInfo.outputPath("trace.zip");
    await context.tracing.stop({ path: tracePath });
    await testInfo.attach("trace", {
      path: tracePath,
      contentType: "application/zip",
    });
    const pages = context.pages();
    const page = pages.pop();
    if (page !== undefined) {
      await testInfo.attach("chromium-shortcuts-failure", {
        body: await page.screenshot(),
        contentType: "image/png",
      });
    }
    throw error;
  } finally {
    await context.close();
  }
});
