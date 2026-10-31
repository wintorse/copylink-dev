import { Driver, Options } from "selenium-webdriver/firefox.js";
import { expect, firefox, test } from "@playwright/test";
import { pressShortcut, readNativeClipboard } from "./native-input";
import path from "node:path";

const fixtureUrl = "http://127.0.0.1:4173/";

// eslint-disable-next-line no-empty-pattern -- Selenium manages the installed Firefox add-on.
test("installs the Firefox add-on and copies through manifest-driven scripts", async ({}, testInfo) => {
  // Given: A Firefox session is configured to use the installed Playwright browser.
  const options = new Options().setBinary(firefox.executablePath());
  const driver = Driver.createSession(options);
  try {
    // When: The unmodified Firefox build is installed as a temporary add-on.
    const extension = await driver.installWebExtension(
      path.resolve(import.meta.dirname, "../../dist"),
      { permanent: false },
    );

    // Then: Firefox reports the extension ID declared in the manifest.
    expect(extension.id).toBe("copylink-dev@example.com");

    // Given: The fixture page is open for the manifest content script to load.
    await driver.get(fixtureUrl);
    await driver.executeScript(
      'document.title = "Copylink Firefox native shortcut"',
    );

    // When: The native Copy Link shortcut is pressed.
    await pressShortcut("Copylink Firefox native shortcut", "alt+l");

    // Then: The clipboard contains the title and HTML link through the installed add-on.
    await expect
      .poll(() => readNativeClipboard())
      .toBe("Copylink Firefox native shortcut");
    await expect
      .poll(() => readNativeClipboard("text/html"))
      .toContain(
        `<a href="${fixtureUrl}">Copylink Firefox native shortcut</a>`,
      );

    // Given: The page has a different title for the Slack copy scenario.
    await driver.executeScript(
      'document.title = "Copylink Firefox Slack shortcut"',
    );

    // When: The native Copy Link for Slack shortcut is pressed.
    await pressShortcut("Copylink Firefox Slack shortcut", "alt+shift+l");

    // Then: The clipboard contains the new title and URL as a Markdown link.
    await expect
      .poll(() => readNativeClipboard())
      .toBe(`[Copylink Firefox Slack shortcut](${fixtureUrl})`);
  } catch (error) {
    const screenshot = await driver.takeScreenshot().catch(() => null);
    if (screenshot !== null) {
      await testInfo.attach("firefox-addon-failure", {
        body: Buffer.from(screenshot, "base64"),
        contentType: "image/png",
      });
    }
    throw error;
  } finally {
    await driver.quit();
  }
});
