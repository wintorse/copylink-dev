import { expect, readClipboardHtml, test, triggerCommand } from "./fixtures";

test("unset PR status emoji inherits changes to the common emoji after saving", async ({
  context,
  sw,
  extensionId,
}) => {
  await sw.evaluate(async () => {
    await chrome.storage.local.set({
      emojiNames: { githubPullRequest: ":old:" },
    });
  });
  const popup = await context.newPage();
  await popup.goto(`chrome-extension://${extensionId}/popup.html`);
  await expect(
    popup.locator("#emojiName-github-merged-pull-request"),
  ).toHaveValue("");
  await expect(
    popup.locator("#emojiName-github-merged-pull-request"),
  ).toHaveAttribute("placeholder", ":old:");
  await popup.locator("#emojiName-github-pull-request").fill(":new:");
  await expect(
    popup.locator("#emojiName-github-merged-pull-request"),
  ).toHaveAttribute("placeholder", ":new:");
  await expect
    .poll(async () =>
      sw.evaluate(async () => {
        const data = await chrome.storage.local.get<{
          emojiNames?: { githubPullRequest?: string };
        }>("emojiNames");
        return data.emojiNames?.githubPullRequest;
      }),
    )
    .toBe(":new:");
  expect(
    (await sw.evaluate(async () => chrome.storage.local.get("emojiNames")))
      .emojiNames,
  ).not.toHaveProperty("githubMergedPullRequest");
  await popup.reload();
  await expect(
    popup.locator("#emojiName-github-merged-pull-request"),
  ).toHaveValue("");
  const page = await context.newPage();
  await page.route("https://github.com/a/b/pull/1", async (route) => {
    await route.fulfill({
      contentType: "text/html",
      body: '<html><head><title>PR title</title></head><body><header><span data-status="pullMerged"></span></header><h1><span>PR title</span></h1></body></html>',
    });
  });
  await page.goto("https://github.com/a/b/pull/1");
  await triggerCommand(sw, page, "copy-link-for-slack");
  expect(await readClipboardHtml(page)).toContain(":new:");
});
