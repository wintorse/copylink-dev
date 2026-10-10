import {
  SHEETS_URL_WITH_RANGE,
  type Worker,
  expect,
  readClipboardHtml,
  readClipboardText,
  test,
  triggerCommand,
} from "./fixtures";

test.describe("Link format settings for copy-google-sheets-range", () => {
  async function setLinkFormat(sw: Worker, format: string) {
    await sw.evaluate(async (fmt) => {
      await chrome.storage.local.set({ copylinkdevLinkFormat: fmt });
    }, format);
  }

  test("html format: text is title, html is <a> without emoji", async ({
    sw,
    context,
  }) => {
    // Given: The html link format is selected and a Google Sheets range is open.
    await setLinkFormat(sw, "html");
    const page = await context.newPage();
    await page.goto(SHEETS_URL_WITH_RANGE, {
      waitUntil: "load",
      timeout: 30_000,
    });

    // Wait for the name box to reflect the range from the URL
    await page.waitForFunction(
      () =>
        (document.querySelector<HTMLInputElement>("#t-name-box")?.value ?? "")
          .length > 0,
      { timeout: 15_000 },
    );

    // When: The copy-google-sheets-range command is executed.
    await triggerCommand(sw, page, "copy-google-sheets-range");

    // Then: The clipboard has the title as text and an HTML anchor without an emoji.
    const text = await readClipboardText(page);
    // text should be the formatted title (Google Docs title getter)
    expect(text).toContain("テスト spreadsheet");

    const html = await readClipboardHtml(page);
    expect(html).not.toBeNull();
    expect(html).toContain("</a>");
    // html format should not contain emoji
    expect(html).not.toContain(":google_sheets:");
  });

  test("htmlWithEmoji format: text is markdown, html has emoji + <a>", async ({
    sw,
    context,
  }) => {
    // Given: The htmlWithEmoji link format is selected and a Google Sheets range is open.
    await setLinkFormat(sw, "htmlWithEmoji");
    const page = await context.newPage();
    await page.goto(SHEETS_URL_WITH_RANGE, {
      waitUntil: "load",
      timeout: 30_000,
    });
    await page.waitForFunction(
      () =>
        (document.querySelector<HTMLInputElement>("#t-name-box")?.value ?? "")
          .length > 0,
      { timeout: 15_000 },
    );

    // When: The copy-google-sheets-range command is executed.
    await triggerCommand(sw, page, "copy-google-sheets-range");

    // Then: The clipboard has a Markdown link as text and an emoji plus anchor as HTML.
    const text = await readClipboardText(page);
    // htmlWithEmoji → plain text is markdown format
    expect(text).toContain("[テスト spreadsheet]");
    expect(text).toContain("range=C2:E4");

    const html = await readClipboardHtml(page);
    expect(html).not.toBeNull();
    expect(html).toContain(":google_sheets:");
    expect(html).toContain("</a>");
  });

  test("markdown format: text is [title](url), no html", async ({
    sw,
    context,
  }) => {
    // Given: The markdown link format is selected and a Google Sheets range is open.
    await setLinkFormat(sw, "markdown");
    const page = await context.newPage();
    await page.goto(SHEETS_URL_WITH_RANGE, {
      waitUntil: "load",
      timeout: 30_000,
    });
    await page.waitForFunction(
      () =>
        (document.querySelector<HTMLInputElement>("#t-name-box")?.value ?? "")
          .length > 0,
      { timeout: 15_000 },
    );

    // When: The copy-google-sheets-range command is executed.
    await triggerCommand(sw, page, "copy-google-sheets-range");

    // Then: The clipboard text is a Markdown link containing the selected range.
    const text = await readClipboardText(page);
    expect(text).toContain("[テスト spreadsheet]");
    expect(text).toContain("range=C2:E4");
  });

  test("plainUrl format: text is URL only", async ({ sw, context }) => {
    // Given: The plainUrl link format is selected and a Google Sheets range is open.
    await setLinkFormat(sw, "plainUrl");
    const page = await context.newPage();
    await page.goto(SHEETS_URL_WITH_RANGE, {
      waitUntil: "load",
      timeout: 30_000,
    });
    await page.waitForFunction(
      () =>
        (document.querySelector<HTMLInputElement>("#t-name-box")?.value ?? "")
          .length > 0,
      { timeout: 15_000 },
    );

    // When: The copy-google-sheets-range command is executed.
    await triggerCommand(sw, page, "copy-google-sheets-range");

    // Then: The clipboard contains only the URL with the selected range.
    const text = await readClipboardText(page);
    expect(text).toContain("docs.google.com/spreadsheets");
    expect(text).toContain("range=C2:E4");
    // plainUrl should not contain the title
    expect(text).not.toContain("[テスト spreadsheet]");
  });
});
