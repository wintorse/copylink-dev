import {
  DEFAULT_EMOJI_NAMES,
  GITHUB_PULL_REQUEST_STATUS_EMOJI_KEYS,
} from "../../src/shared/constants";
import { expect, test } from "./fixtures";

for (const section of ["emojiNames", "customRegexes", "both"] as const) {
  test(`importing empty ${section} resets only the requested settings`, async ({
    context,
    extensionId,
    sw,
  }) => {
    const previousEmojis = {
      github: ":saved_github:",
      githubMergedPullRequest: ":saved_merged:",
      customWebsite1: ":saved_custom:",
    };
    const previousRegexes = { customRegex1: "saved\\.example" };
    await sw.evaluate(
      async ({ emojiNames, customRegexes }) => {
        await chrome.storage.local.set({
          emojiNames,
          copylinkdevCustomRegexes: customRegexes,
          copylinkdevLinkFormat: "markdown",
        });
      },
      { emojiNames: previousEmojis, customRegexes: previousRegexes },
    );

    const popup = await context.newPage();
    const popupUrl = `chrome-extension://${extensionId}/popup.html`;
    await popup.goto(popupUrl);
    await expect(popup.locator("#emojiName-github")).toHaveValue(
      ":saved_github:",
    );
    await expect(popup.locator("#regex-custom-1")).toHaveValue(
      "saved\\.example",
    );

    const resetEmojis = section !== "customRegexes";
    const resetRegexes = section !== "emojiNames";
    const payload = {
      ...(resetEmojis ? { emojiNames: {} } : {}),
      ...(resetRegexes ? { customRegexes: {} } : {}),
    };
    await popup.locator("#importButton").click();
    await popup.locator("#importTextarea").fill(JSON.stringify(payload));
    await popup.locator("#importConfirmButton").click();

    const defaults = Object.fromEntries(
      Object.entries(DEFAULT_EMOJI_NAMES).filter(
        ([key]) =>
          !GITHUB_PULL_REQUEST_STATUS_EMOJI_KEYS.some(
            (status) => status === key,
          ),
      ),
    );
    const expectedStorage = {
      emojiNames: resetEmojis ? defaults : previousEmojis,
      copylinkdevCustomRegexes: resetRegexes ? {} : previousRegexes,
      copylinkdevLinkFormat: "markdown",
    };
    await expect
      .poll(() => sw.evaluate(() => chrome.storage.local.get(null)))
      .toEqual(expectedStorage);

    // Check the refreshed form and a reopened form to verify persistence.
    for (const reopen of [false, true]) {
      if (reopen) {
        await popup.reload();
      }
      await expect(popup.locator("#emojiName-github")).toHaveValue(
        resetEmojis ? DEFAULT_EMOJI_NAMES.github : ":saved_github:",
      );
      await expect(popup.locator("#emojiName-custom-1")).toHaveValue(
        resetEmojis ? ":link:" : ":saved_custom:",
      );
      await expect(
        popup.locator("#emojiName-github-merged-pull-request"),
      ).toHaveValue(resetEmojis ? "" : ":saved_merged:");
      await expect(popup.locator("#regex-custom-1")).toHaveValue(
        resetRegexes ? "" : "saved\\.example",
      );
      await expect(popup.locator("#linkFormat-markdown")).toBeChecked();
    }
  });
}

test("localizes every popup data-i18n element with browser messages", async ({
  context,
  extensionId,
}) => {
  const popup = await context.newPage();
  await popup.addInitScript(() => {
    // Replace fallback English before the popup listener runs so untranslated
    // static HTML cannot accidentally satisfy the localization assertions.
    document.addEventListener("DOMContentLoaded", () => {
      for (const element of document.querySelectorAll("[data-i18n]")) {
        element.textContent = "Untranslated fallback";
      }
    });
  });
  await popup.goto(`chrome-extension://${extensionId}/popup.html`);
  const messages = await popup.locator("[data-i18n]").evaluateAll((elements) =>
    elements.map((element) => {
      const key = element.getAttribute("data-i18n") ?? "";
      return { key, message: chrome.i18n.getMessage(key) };
    }),
  );
  expect(messages.length).toBeGreaterThan(0);
  for (const { key, message } of messages) {
    expect(message, `Browser message for ${key}`).not.toBe("");
    await expect(popup.locator(`[data-i18n="${key}"]`)).toHaveJSProperty(
      "textContent",
      message,
    );
  }
});
