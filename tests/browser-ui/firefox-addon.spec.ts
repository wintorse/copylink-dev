import { Driver, Options } from "selenium-webdriver/firefox.js";
import { expect, firefox, test } from "@playwright/test";
import { pressShortcut, readNativeClipboard } from "./native-input";
import path from "node:path";

const fixtureUrl = "http://127.0.0.1:4173/";

// eslint-disable-next-line no-empty-pattern -- Selenium manages the installed Firefox add-on.
test("installs the Firefox add-on and copies through manifest-driven scripts", async ({}, testInfo) => {
  const options = new Options().setBinary(firefox.executablePath());
  const driver = Driver.createSession(options);
  try {
    const extension = await driver.installWebExtension(
      path.resolve(import.meta.dirname, "../../dist"),
      { permanent: false },
    );
    expect(extension.id).toBe("copylink-dev@example.com");
    await driver.get(fixtureUrl);
    await driver.executeScript(
      'document.title = "Copylink Firefox native shortcut"',
    );
    await pressShortcut("Copylink Firefox native shortcut", "alt+l");
    await expect
      .poll(() => readNativeClipboard())
      .toBe("Copylink Firefox native shortcut");
    await expect
      .poll(() => readNativeClipboard("text/html"))
      .toContain(
        `<a href="${fixtureUrl}">Copylink Firefox native shortcut</a>`,
      );

    await driver.executeScript(
      'document.title = "Copylink Firefox Slack shortcut"',
    );
    await pressShortcut("Copylink Firefox Slack shortcut", "alt+shift+l");
    await expect
      .poll(() => readNativeClipboard())
      .toBe(`[Copylink Firefox Slack shortcut](${fixtureUrl})`);

    await driver.executeScript(
      'document.title = "Copylink Firefox title shortcut"',
    );
    await pressShortcut("Copylink Firefox title shortcut", "alt+t");
    await expect
      .poll(() => readNativeClipboard())
      .toBe("Copylink Firefox title shortcut");
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
