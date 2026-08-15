import {
  buildCustomRegexes,
  buildEmojiNames,
} from "../../src/shared/popup/emojiSettings";
import {
  expect,
  readClipboardHtml,
  readClipboardText,
  test,
  triggerCommand,
} from "./fixtures";
import { DEFAULT_EMOJI_NAMES } from "../../src/shared/constants";

test.describe("Popup settings page", () => {
  test("selecting a link format radio persists to storage", async ({
    sw,
    extensionId,
    context,
  }) => {
    // Given: The popup settings page is open with the link format controls visible.
    const page = await context.newPage();
    await page.goto(`chrome-extension://${extensionId}/popup.html`, {
      waitUntil: "domcontentloaded",
    });

    // When: The markdown radio is selected.
    await page.click("#linkFormat-markdown");

    // Then: The markdown format is persisted to extension storage.
    const stored = await sw.evaluate(async () => {
      return new Promise((resolve) => {
        chrome.storage.local.get("copylinkdevLinkFormat", (data) => {
          resolve(data.copylinkdevLinkFormat);
        });
      });
    });
    expect(stored).toBe("markdown");

    // When: The plainUrl radio is selected.
    await page.click("#linkFormat-plainUrl");
    const stored2 = await sw.evaluate(async () => {
      return new Promise((resolve) => {
        chrome.storage.local.get("copylinkdevLinkFormat", (data) => {
          resolve(data.copylinkdevLinkFormat);
        });
      });
    });
    // Then: The plainUrl format is persisted to extension storage.
    expect(stored2).toBe("plainUrl");
  });

  test("exports emoji names and custom regexes to the clipboard", async ({
    sw,
    extensionId,
    context,
  }) => {
    // Given: Custom emoji names and URL regexes are stored and the popup is open.
    const emojiNames = {
      github: ":exported_github:",
      customWebsite1: ":exported_custom:",
    };
    const customRegexes = {
      customRegex1: "export\\.example\\.com",
    };
    await sw.evaluate(
      async ({ emojiNames, customRegexes }) => {
        await chrome.storage.local.set({
          emojiNames,
          copylinkdevCustomRegexes: customRegexes,
        });
      },
      { emojiNames, customRegexes },
    );

    const popupPage = await context.newPage();
    await popupPage.goto(`chrome-extension://${extensionId}/popup.html`, {
      waitUntil: "domcontentloaded",
    });

    // When: The export button is clicked.
    await popupPage.click("#exportButton");
    const exportSuccessMessage = await popupPage.evaluate(() =>
      chrome.i18n.getMessage("exportSuccess"),
    );

    // Then: A success message is shown and the settings are copied as JSON.
    await expect(popupPage.locator("#exportMessage")).toHaveText(
      exportSuccessMessage,
    );

    const exported = JSON.parse(await readClipboardText(popupPage));
    expect(exported).toEqual({ emojiNames, customRegexes });
  });

  test("imports settings, saves them, and refreshes the form inputs", async ({
    sw,
    extensionId,
    context,
  }) => {
    // Given: Default settings and a different settings payload to import are prepared.
    const defaultCustomRegexes = {
      customRegex1: "default\\.example\\.com",
    };
    await sw.evaluate(
      async ({ emojiNames, customRegexes }) => {
        await chrome.storage.local.set({
          emojiNames,
          copylinkdevCustomRegexes: customRegexes,
        });
      },
      {
        emojiNames: DEFAULT_EMOJI_NAMES,
        customRegexes: defaultCustomRegexes,
      },
    );

    const importedSettings = {
      emojiNames: {
        github: ":imported_github:",
        customWebsite1: ":imported_custom:",
      },
      customRegexes: {
        customRegex1: "import\\.example\\.com",
      },
    };

    const popupPage = await context.newPage();
    await popupPage.goto(`chrome-extension://${extensionId}/popup.html`, {
      waitUntil: "domcontentloaded",
    });

    await expect(popupPage.locator("#emojiName-github")).toHaveValue(
      DEFAULT_EMOJI_NAMES.github,
    );
    await expect(popupPage.locator("#regex-custom-1")).toHaveValue(
      defaultCustomRegexes.customRegex1,
    );

    // When: The imported settings are entered and confirmed.
    await popupPage.click("#importButton");
    await expect(popupPage.locator("#importGroup")).toBeVisible();
    await popupPage
      .locator("#importTextarea")
      .fill(JSON.stringify(importedSettings));
    await popupPage.click("#importConfirmButton");

    // Then: The form inputs refresh with the imported values.
    await expect(popupPage.locator("#emojiName-github")).toHaveValue(
      importedSettings.emojiNames.github,
    );
    await expect(popupPage.locator("#emojiName-custom-1")).toHaveValue(
      importedSettings.emojiNames.customWebsite1,
    );
    await expect(popupPage.locator("#regex-custom-1")).toHaveValue(
      importedSettings.customRegexes.customRegex1,
    );

    // Then: Storage contains normalized imported settings.
    // Import formatting fills in defaults for regular emoji names and omits
    // GitHub PR status-specific fallback emoji names.
    const expectedEmojiNames = buildEmojiNames(importedSettings.emojiNames);
    const expectedCustomRegexes = buildCustomRegexes(
      importedSettings.customRegexes,
    );
    await expect
      .poll(async () => {
        return sw.evaluate(async () => {
          return new Promise((resolve) => {
            chrome.storage.local.get(
              ["emojiNames", "copylinkdevCustomRegexes"],
              (data) => resolve(data),
            );
          });
        });
      })
      .toEqual({
        emojiNames: expectedEmojiNames,
        copylinkdevCustomRegexes: expectedCustomRegexes,
      });
  });

  test("changing an emoji name persists and is used in copy", async ({
    sw,
    extensionId,
    context,
  }) => {
    // Given: The popup settings page is open with the GitHub emoji input available.
    const popupPage = await context.newPage();
    await popupPage.goto(`chrome-extension://${extensionId}/popup.html`, {
      waitUntil: "domcontentloaded",
    });

    const githubInput = popupPage.locator("#emojiName-github");

    // When: The GitHub emoji is changed to a custom value.
    await githubInput.clear();
    await githubInput.fill(":custom_github:");

    // Wait for the input event debounce
    await popupPage.waitForTimeout(300);

    // Then: The custom emoji is persisted to storage.
    const stored = await sw.evaluate(async () => {
      type StorageData = { emojiNames?: Record<string, string> };
      return new Promise<Record<string, string> | undefined>((resolve) => {
        chrome.storage.local.get("emojiNames", (data: StorageData) => {
          resolve(data.emojiNames);
        });
      });
    });
    expect(stored).toHaveProperty("github", ":custom_github:");

    // When: copy-link-for-slack is executed on a GitHub page.
    const page = await context.newPage();
    await page.goto("https://github.com/wintorse/copylink-dev", {
      waitUntil: "domcontentloaded",
    });
    await triggerCommand(sw, page, "copy-link-for-slack");

    // Then: The copied HTML contains the custom GitHub emoji.
    const html = await readClipboardHtml(page);
    expect(html).not.toBeNull();
    expect(html).toContain(":custom_github:");

    // Cleanup: Reset the test-specific emoji settings.
    await sw.evaluate(async () => {
      await chrome.storage.local.remove("emojiNames");
    });
  });

  test("custom website regex + emoji is applied for matching URLs", async ({
    sw,
    extensionId,
    context,
  }) => {
    // Given: The popup settings page is open with an empty custom website entry.
    const popupPage = await context.newPage();
    await popupPage.goto(`chrome-extension://${extensionId}/popup.html`, {
      waitUntil: "domcontentloaded",
    });

    const regexInput = popupPage.locator("#regex-custom-1");

    // When: A matching URL regex and custom emoji are entered.
    await regexInput.clear();
    await regexInput.fill("example\\.com");

    const emojiInput = popupPage.locator("#emojiName-custom-1");
    await emojiInput.clear();
    await emojiInput.fill(":my_emoji:");

    // Wait for input events
    await popupPage.waitForTimeout(300);

    // When: copy-link-for-slack is executed on a matching example.com page.
    const page = await context.newPage();
    await page.goto("https://example.com", {
      waitUntil: "domcontentloaded",
    });
    await triggerCommand(sw, page, "copy-link-for-slack");

    // Then: The copied HTML contains the configured custom emoji.
    const html = await readClipboardHtml(page);
    expect(html).not.toBeNull();
    expect(html).toContain(":my_emoji:");

    // Cleanup: Reset the test-specific settings.
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
    // Given: The popup settings page is open with a custom GitHub-matching entry.
    const popupPage = await context.newPage();
    await popupPage.goto(`chrome-extension://${extensionId}/popup.html`, {
      waitUntil: "domcontentloaded",
    });

    const regexInput = popupPage.locator("#regex-custom-1");

    // When: A custom regex and emoji are entered for GitHub URLs.
    await regexInput.clear();
    await regexInput.fill("github\\.com");

    const emojiInput = popupPage.locator("#emojiName-custom-1");
    await emojiInput.clear();
    await emojiInput.fill(":my_custom_emoji:");

    await popupPage.waitForTimeout(300);

    // When: copy-link-for-slack is executed on a GitHub repo page.
    const page = await context.newPage();
    await page.goto("https://github.com/wintorse/copylink-dev", {
      waitUntil: "domcontentloaded",
    });
    await triggerCommand(sw, page, "copy-link-for-slack");

    // Then: The custom emoji is used instead of the built-in GitHub emoji.
    const html = await readClipboardHtml(page);
    expect(html).not.toBeNull();
    // Custom regex should take priority: custom emoji appears, built-in :github: does not
    expect(html).toContain(":my_custom_emoji:");
    expect(html).not.toContain(":github:");

    // Cleanup: Reset the test-specific settings.
    await sw.evaluate(async () => {
      await chrome.storage.local.remove([
        "emojiNames",
        "copylinkdevCustomRegexes",
      ]);
    });
  });
});
