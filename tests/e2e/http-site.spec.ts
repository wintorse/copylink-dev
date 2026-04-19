import {
  expect,
  readClipboardHtml,
  readClipboardText,
  test,
  triggerCommand,
} from "./fixtures";

/**
 * Tests for HTTP (non-HTTPS) pages.
 *
 * On HTTP pages, navigator.clipboard is unavailable (requires a secure context).
 * The extension falls back to document.execCommand('copy') via ClipboardEvent.
 *
 * navigator.clipboard cannot be used in HTTP page contexts to verify clipboard
 * contents. Instead, a separate HTTPS page (clipboardPage) is opened alongside
 * the HTTP page: the command is triggered on the HTTP page, and clipboard
 * contents are read back from the HTTPS page.
 */
test.describe("HTTP site (navigator.clipboard unavailable)", () => {
  const HTTP_URL = "http://www.kmoni.bosai.go.jp/";
  const HTTP_TITLE = "強震モニタ";

  test("copy-link copies title as text and HTML anchor", async ({
    sw,
    context,
  }) => {
    const httpPage = await context.newPage();
    await httpPage.goto(HTTP_URL, { waitUntil: "domcontentloaded" });

    // Open an HTTPS page to read clipboard, since navigator.clipboard
    // is unavailable in the HTTP page context.
    const clipboardPage = await context.newPage();
    await clipboardPage.goto("https://example.com", {
      waitUntil: "domcontentloaded",
    });

    await triggerCommand(sw, httpPage, "copy-link");

    const text = await readClipboardText(clipboardPage);
    expect(text).toBe(HTTP_TITLE);

    const html = await readClipboardHtml(clipboardPage);
    expect(html).not.toBeNull();
    expect(html).toContain(HTTP_TITLE);
    expect(html).toContain("kmoni.bosai.go.jp");
    expect(html).toContain("</a>");
  });

  test("copy-title copies plain text title", async ({ sw, context }) => {
    const httpPage = await context.newPage();
    await httpPage.goto(HTTP_URL, { waitUntil: "domcontentloaded" });

    const clipboardPage = await context.newPage();
    await clipboardPage.goto("https://example.com", {
      waitUntil: "domcontentloaded",
    });

    await triggerCommand(sw, httpPage, "copy-title");

    const text = await readClipboardText(clipboardPage);
    expect(text).toBe(HTTP_TITLE);
  });

  test("copy-link-for-slack copies markdown text and HTML anchor", async ({
    sw,
    context,
  }) => {
    const httpPage = await context.newPage();
    await httpPage.goto(HTTP_URL, { waitUntil: "domcontentloaded" });

    const clipboardPage = await context.newPage();
    await clipboardPage.goto("https://example.com", {
      waitUntil: "domcontentloaded",
    });

    await triggerCommand(sw, httpPage, "copy-link-for-slack");

    const text = await readClipboardText(clipboardPage);
    // www.kmoni.bosai.go.jp is not a recognized site, so no emoji prefix
    expect(text).toContain(`[${HTTP_TITLE}]`);
    expect(text).toContain("kmoni.bosai.go.jp");

    const html = await readClipboardHtml(clipboardPage);
    expect(html).not.toBeNull();
    expect(html).toContain(HTTP_TITLE);
    expect(html).toContain("</a>");
  });
});
