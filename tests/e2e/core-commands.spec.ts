import {
  expect,
  readClipboardHtml,
  readClipboardText,
  test,
  triggerCommand,
} from "./fixtures";

test.describe("Core commands on example.com", () => {
  test.beforeEach(async ({ sw }) => {
    // Reset link format to default (htmlWithEmoji) before each test
    await sw.evaluate(async () => {
      await chrome.storage.local.remove("copylinkdevLinkFormat");
    });
  });

  test("copy-link copies title as text and HTML anchor", async ({
    sw,
    context,
  }) => {
    // Given: The default link format is configured and example.com is open.
    const page = await context.newPage();
    await page.goto("https://example.com", { waitUntil: "domcontentloaded" });

    // When: The copy-link command is executed.
    await triggerCommand(sw, page, "copy-link");

    // Then: The clipboard contains the page title as text and an HTML anchor.
    const text = await readClipboardText(page);
    expect(text).toBe("Example Domain");

    const html = await readClipboardHtml(page);
    expect(html).not.toBeNull();
    expect(html).toContain("Example Domain");
    expect(html).toContain('href="https://example.com/"');
    expect(html).toContain("</a>");
  });

  test("copy-title copies only the page title as plain text", async ({
    sw,
    context,
  }) => {
    // Given: The default link format is configured and example.com is open.
    const page = await context.newPage();
    await page.goto("https://example.com", { waitUntil: "domcontentloaded" });

    // When: The copy-title command is executed.
    await triggerCommand(sw, page, "copy-title");

    // Then: The clipboard contains only the page title as plain text.
    const text = await readClipboardText(page);
    expect(text).toBe("Example Domain");
  });

  test("copy-link-for-slack copies markdown text and HTML with emoji", async ({
    sw,
    context,
  }) => {
    // Given: The default link format is configured and example.com is open.
    const page = await context.newPage();
    await page.goto("https://example.com", { waitUntil: "domcontentloaded" });

    // When: The copy-link-for-slack command is executed.
    await triggerCommand(sw, page, "copy-link-for-slack");

    // Then: The clipboard contains a Markdown link as text and an HTML anchor.
    const text = await readClipboardText(page);
    // Default format is htmlWithEmoji → plain text is markdown
    expect(text).toBe("[Example Domain](https://example.com/)");

    const html = await readClipboardHtml(page);
    expect(html).not.toBeNull();
    expect(html).toContain("Example Domain");
    expect(html).toContain("</a>");
    // example.com is not a recognized site, so no emoji prefix
  });
});
