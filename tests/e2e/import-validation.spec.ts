import { expect, test } from "./fixtures";

test("malformed settings do not overwrite storage or the popup", async ({
  context,
  sw,
  extensionId,
}) => {
  await sw.evaluate(async () => {
    await chrome.storage.local.set({
      emojiNames: { github: ":custom:" },
      copylinkdevCustomRegexes: { customRegex1: "example" },
    });
  });
  const page = await context.newPage();
  await page.goto(`chrome-extension://${extensionId}/popup.html`);
  await expect(page.locator("#emojiName-github")).toHaveValue(":custom:");
  await page.click("#importButton");
  for (const text of [
    '{"emojiNames":[]}',
    '{"emojiNames":{"github":42}}',
    '{"emojiNames":{"github":":new:"},"customRegexes":null}',
  ]) {
    await page.locator("#importTextarea").fill(text);
    await page.click("#importConfirmButton");
    await expect(page.locator("#importErrorMessage")).toBeVisible();
    await expect(page.locator("#emojiName-github")).toHaveValue(":custom:");
    expect(
      await sw.evaluate(async () =>
        chrome.storage.local.get(["emojiNames", "copylinkdevCustomRegexes"]),
      ),
    ).toEqual({
      emojiNames: { github: ":custom:" },
      copylinkdevCustomRegexes: { customRegex1: "example" },
    });
  }
});
