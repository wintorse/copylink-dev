import { expect, readClipboardHtml, test, triggerCommand } from "./fixtures";

test.describe("Popup settings page", () => {
  test("selecting a link format radio persists to storage", async ({
    sw,
    extensionId,
    context,
  }) => {
    const page = await context.newPage();
    await page.goto(`chrome-extension://${extensionId}/popup.html`, {
      waitUntil: "domcontentloaded",
    });

    // Click the markdown radio
    await page.click("#linkFormat-markdown");

    // Verify storage was updated
    const stored = await sw.evaluate(async () => {
      return new Promise((resolve) => {
        chrome.storage.local.get("copylinkdevLinkFormat", (data) => {
          resolve(data.copylinkdevLinkFormat);
        });
      });
    });
    expect(stored).toBe("markdown");

    // Click the plainUrl radio
    await page.click("#linkFormat-plainUrl");
    const stored2 = await sw.evaluate(async () => {
      return new Promise((resolve) => {
        chrome.storage.local.get("copylinkdevLinkFormat", (data) => {
          resolve(data.copylinkdevLinkFormat);
        });
      });
    });
    expect(stored2).toBe("plainUrl");
  });

  test("changing an emoji name persists and is used in copy", async ({
    sw,
    extensionId,
    context,
  }) => {
    // Step 1: Change the GitHub emoji in popup settings
    const popupPage = await context.newPage();
    await popupPage.goto(`chrome-extension://${extensionId}/popup.html`, {
      waitUntil: "domcontentloaded",
    });

    const githubInput = popupPage.locator("#emojiName-github");
    await githubInput.clear();
    await githubInput.fill(":custom_github:");

    // Wait for the input event debounce
    await popupPage.waitForTimeout(300);

    // Step 2: Verify storage reflects the change
    const stored = await sw.evaluate(async () => {
      type StorageData = { emojiNames?: Record<string, string> };
      return new Promise<Record<string, string> | undefined>((resolve) => {
        chrome.storage.local.get("emojiNames", (data: StorageData) => {
          resolve(data.emojiNames);
        });
      });
    });
    expect(stored).toHaveProperty("github", ":custom_github:");

    // Step 3: Use copy-link-for-slack on a GitHub page to verify emoji is applied
    const page = await context.newPage();
    await page.goto("https://github.com/wintorse/copylink-dev", {
      waitUntil: "domcontentloaded",
    });
    await triggerCommand(sw, page, "copy-link-for-slack");
    const html = await readClipboardHtml(page);
    expect(html).not.toBeNull();
    expect(html).toContain(":custom_github:");

    // Cleanup: reset emoji names
    await sw.evaluate(async () => {
      await chrome.storage.local.remove("emojiNames");
    });
  });

  test("custom website regex + emoji is applied for matching URLs", async ({
    sw,
    extensionId,
    context,
  }) => {
    // Step 1: Register a custom website in popup settings
    const popupPage = await context.newPage();
    await popupPage.goto(`chrome-extension://${extensionId}/popup.html`, {
      waitUntil: "domcontentloaded",
    });

    const regexInput = popupPage.locator("#regex-custom-1");
    await regexInput.clear();
    await regexInput.fill("example\\.com");

    const emojiInput = popupPage.locator("#emojiName-custom-1");
    await emojiInput.clear();
    await emojiInput.fill(":my_emoji:");

    // Wait for input events
    await popupPage.waitForTimeout(300);

    // Step 2: Visit example.com and copy-link-for-slack
    const page = await context.newPage();
    await page.goto("https://example.com", {
      waitUntil: "domcontentloaded",
    });
    await triggerCommand(sw, page, "copy-link-for-slack");

    const html = await readClipboardHtml(page);
    expect(html).not.toBeNull();
    expect(html).toContain(":my_emoji:");

    // Cleanup
    await sw.evaluate(async () => {
      await chrome.storage.local.remove([
        "emojiNames",
        "copylinkdevCustomRegexes",
      ]);
    });
  });

  test("custom website regex takes priority over built-in site detection", async ({
    sw,
    extensionId,
    context,
  }) => {
    // Register a custom regex that matches GitHub's hostname
    const popupPage = await context.newPage();
    await popupPage.goto(`chrome-extension://${extensionId}/popup.html`, {
      waitUntil: "domcontentloaded",
    });

    const regexInput = popupPage.locator("#regex-custom-1");
    await regexInput.clear();
    await regexInput.fill("github\\.com");

    const emojiInput = popupPage.locator("#emojiName-custom-1");
    await emojiInput.clear();
    await emojiInput.fill(":my_custom_emoji:");

    await popupPage.waitForTimeout(300);

    // Visit a GitHub repo page (which would normally use the built-in :github: emoji)
    const page = await context.newPage();
    await page.goto("https://github.com/wintorse/copylink-dev", {
      waitUntil: "domcontentloaded",
    });
    await triggerCommand(sw, page, "copy-link-for-slack");

    const html = await readClipboardHtml(page);
    expect(html).not.toBeNull();
    // Custom regex should take priority: custom emoji appears, built-in :github: does not
    expect(html).toContain(":my_custom_emoji:");
    expect(html).not.toContain(":github:");

    // Cleanup
    await sw.evaluate(async () => {
      await chrome.storage.local.remove([
        "emojiNames",
        "copylinkdevCustomRegexes",
      ]);
    });
  });
});
