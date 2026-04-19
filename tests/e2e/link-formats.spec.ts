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
    await triggerCommand(sw, page, "copy-google-sheets-range");

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
    await triggerCommand(sw, page, "copy-google-sheets-range");

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
    await triggerCommand(sw, page, "copy-google-sheets-range");

    const text = await readClipboardText(page);
    expect(text).toContain("[テスト spreadsheet]");
    expect(text).toContain("range=C2:E4");
  });

  test("plainUrl format: text is URL only", async ({ sw, context }) => {
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
    await triggerCommand(sw, page, "copy-google-sheets-range");

    const text = await readClipboardText(page);
    expect(text).toContain("docs.google.com/spreadsheets");
    expect(text).toContain("range=C2:E4");
    // plainUrl should not contain the title
    expect(text).not.toContain("[テスト spreadsheet]");
  });
});
