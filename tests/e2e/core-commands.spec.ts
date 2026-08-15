import {
  E2E_FIXTURE_URL,
  expect,
  readClipboardHtml,
  readClipboardText,
  test,
  triggerCommand,
} from "./fixtures";

test.describe("Core commands on the e2e fixture page", () => {
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
    // Given: The default link format is configured and the e2e fixture page is open.
    const page = await context.newPage();
    await page.goto(E2E_FIXTURE_URL, { waitUntil: "domcontentloaded" });
    const fixtureTitle = await page.title();
    const fixtureUrl = page.url();

    // When: The copy-link command is executed.
    await triggerCommand(sw, page, "copy-link");

    // Then: The clipboard contains the page title as text and an HTML anchor.
    const text = await readClipboardText(page);
    expect(text).toBe(fixtureTitle);

    const html = await readClipboardHtml(page);
    expect(html).not.toBeNull();
    expect(html).toContain(fixtureTitle);
    expect(html).toContain(`href="${fixtureUrl}"`);
    expect(html).toContain("</a>");
  });

  test("copy-title copies only the page title as plain text", async ({
    sw,
    context,
  }) => {
    // Given: The default link format is configured and the e2e fixture page is open.
    const page = await context.newPage();
    await page.goto(E2E_FIXTURE_URL, { waitUntil: "domcontentloaded" });
    const fixtureTitle = await page.title();

    // When: The copy-title command is executed.
    await triggerCommand(sw, page, "copy-title");

    // Then: The clipboard contains only the page title as plain text.
    const text = await readClipboardText(page);
    expect(text).toBe(fixtureTitle);
  });

  test("copy-link-for-slack copies markdown text and HTML with emoji", async ({
    sw,
    context,
  }) => {
    // Given: The default link format is configured and the e2e fixture page is open.
    const page = await context.newPage();
    await page.goto(E2E_FIXTURE_URL, { waitUntil: "domcontentloaded" });
    const fixtureTitle = await page.title();
    const fixtureUrl = page.url();

    // When: The copy-link-for-slack command is executed.
    await triggerCommand(sw, page, "copy-link-for-slack");

    // Then: The clipboard contains a Markdown link as text and an HTML anchor.
    const text = await readClipboardText(page);
    // Default format is htmlWithEmoji → plain text is markdown
    expect(text).toBe(`[${fixtureTitle}](${fixtureUrl})`);

    const html = await readClipboardHtml(page);
    expect(html).not.toBeNull();
    expect(html).toContain(fixtureTitle);
    expect(html).toContain("</a>");
    // The e2e fixture page is not a recognized site, so no emoji prefix is added.
  });
});
