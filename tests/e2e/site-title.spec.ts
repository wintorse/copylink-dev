import {
  SHEETS_URL,
  expect,
  readClipboardHtml,
  readClipboardText,
  test,
  triggerCommand,
} from "./fixtures";

test.describe("Site-specific title formatting and emoji", () => {
  // ──────────────────────────────────────────────
  // GitHub
  // ──────────────────────────────────────────────

  test("GitHub Pull Request: title is #<number> <text>", async ({
    sw,
    context,
  }) => {
    const page = await context.newPage();
    await page.goto("https://github.com/wintorse/copylink-dev/pull/52", {
      waitUntil: "domcontentloaded",
    });
    await triggerCommand(sw, page, "copy-link");

    const text = await readClipboardText(page);
    expect(text).toMatch(/^#52 .+/);

    await triggerCommand(sw, page, "copy-link-for-slack");
    const html = await readClipboardHtml(page);
    expect(html).not.toBeNull();
    expect(html).toContain(":open_pull_request:");
  });

  test("GitHub Issue: title is #<number> <text>", async ({ sw, context }) => {
    const page = await context.newPage();
    await page.goto("https://github.com/wintorse/copylink-dev/issues/54", {
      waitUntil: "domcontentloaded",
    });
    await triggerCommand(sw, page, "copy-link");

    const text = await readClipboardText(page);
    expect(text).toMatch(/^#54 .+/);

    await triggerCommand(sw, page, "copy-link-for-slack");
    const html = await readClipboardHtml(page);
    expect(html).not.toBeNull();
    expect(html).toContain(":open_issue:");
  });

  test("GitHub Repo: emoji is :github:", async ({ sw, context }) => {
    const page = await context.newPage();
    await page.goto("https://github.com/wintorse/copylink-dev", {
      waitUntil: "domcontentloaded",
    });
    await triggerCommand(sw, page, "copy-link");

    const text = await readClipboardText(page);
    // Title should reference the repo name
    expect(text).toContain("copylink-dev");

    await triggerCommand(sw, page, "copy-link-for-slack");
    const html = await readClipboardHtml(page);
    expect(html).not.toBeNull();
    // Repo pages should use :github:, not PR/Issue emojis
    expect(html).toContain(":github:");
    expect(html).not.toContain(":open_pull_request:");
    expect(html).not.toContain(":open_issue:");
  });

  // ──────────────────────────────────────────────
  // Jira
  // ──────────────────────────────────────────────

  test("Jira Issue: title is HIBERNATE-77 Support HQL in / not in", async ({
    sw,
    context,
  }) => {
    const page = await context.newPage();
    await page.goto(
      "https://jira.mongodb.org/projects/HIBERNATE/issues/HIBERNATE-77?filter=allopenissues",
      { waitUntil: "domcontentloaded" },
    );
    // Jira may load content dynamically
    await page.waitForSelector("#key-val", { timeout: 15_000 });

    await triggerCommand(sw, page, "copy-link");
    const text = await readClipboardText(page);
    expect(text).toContain("HIBERNATE-77");
    expect(text).toContain("Support HQL in / not in");

    await triggerCommand(sw, page, "copy-link-for-slack");
    const html = await readClipboardHtml(page);
    expect(html).not.toBeNull();
    expect(html).toContain(":jira:");
  });

  // ──────────────────────────────────────────────
  // Redmine
  // ──────────────────────────────────────────────

  test("Redmine Issue: title is Feature #642: OpenXR On Linux.", async ({
    sw,
    context,
  }) => {
    const page = await context.newPage();
    await page.goto("https://redmine.openspace3d.com/issues/642", {
      waitUntil: "domcontentloaded",
    });

    await triggerCommand(sw, page, "copy-link");
    const text = await readClipboardText(page);
    expect(text).toContain("Feature #642");
    expect(text).toContain("OpenXR On Linux.");

    await triggerCommand(sw, page, "copy-link-for-slack");
    const html = await readClipboardHtml(page);
    expect(html).not.toBeNull();
    expect(html).toContain(":redmine_ticket:");
  });

  // ──────────────────────────────────────────────
  // ReDoc
  // ──────────────────────────────────────────────

  test("ReDoc: title is 法令本文取得API", async ({ sw, context }) => {
    const page = await context.newPage();
    await page.goto(
      "https://laws.e-gov.go.jp/api/2/redoc/#tag/laws-api/operation/get-law_data",
      { waitUntil: "domcontentloaded" },
    );
    // Wait for ReDoc to render the active label
    await page.waitForSelector("label[class*='active']", { timeout: 15_000 });

    await triggerCommand(sw, page, "copy-link");
    const text = await readClipboardText(page);
    expect(text).toContain("法令本文取得API");

    await triggerCommand(sw, page, "copy-link-for-slack");
    const html = await readClipboardHtml(page);
    expect(html).not.toBeNull();
    expect(html).toContain(":swagger:");
  });

  // ──────────────────────────────────────────────
  // Google Sheets
  // ──────────────────────────────────────────────

  test("Google Sheets: title is テスト spreadsheet", async ({
    sw,
    context,
  }) => {
    const page = await context.newPage();
    await page.goto(SHEETS_URL, { waitUntil: "load", timeout: 30_000 });
    // Wait for title input to be in the DOM (it may be hidden)
    await page.waitForSelector("#docs-title-widget input", {
      state: "attached",
      timeout: 15_000,
    });

    await triggerCommand(sw, page, "copy-link");
    const text = await readClipboardText(page);
    expect(text).toContain("テスト spreadsheet");

    await triggerCommand(sw, page, "copy-link-for-slack");
    const html = await readClipboardHtml(page);
    expect(html).not.toBeNull();
    expect(html).toContain(":google_sheets:");
  });

  // ──────────────────────────────────────────────
  // Google Docs
  // ──────────────────────────────────────────────

  test("Google Docs: title is テスト document", async ({ sw, context }) => {
    const page = await context.newPage();
    await page.goto(
      "https://docs.google.com/document/d/1dnmPyKPXidbBweLnAkOLbvJpbgOMuft6LrtMoeLtjCg/edit",
      { waitUntil: "load", timeout: 30_000 },
    );
    await page.waitForSelector("#docs-title-widget input", {
      state: "attached",
      timeout: 15_000,
    });

    await triggerCommand(sw, page, "copy-link");
    const text = await readClipboardText(page);
    expect(text).toContain("テスト document");

    await triggerCommand(sw, page, "copy-link-for-slack");
    const html = await readClipboardHtml(page);
    expect(html).not.toBeNull();
    expect(html).toContain(":google_docs:");
  });

  // ──────────────────────────────────────────────
  // Google Slides
  // ──────────────────────────────────────────────

  test("Google Slides: title is テスト presentation", async ({
    sw,
    context,
  }) => {
    const page = await context.newPage();
    await page.goto(
      "https://docs.google.com/presentation/d/1LYg3VmFY4yBCI8ujhzTlMSBYLkv5b8W3sTQ8qTIJZtc/edit",
      { waitUntil: "load", timeout: 30_000 },
    );
    await page.waitForSelector("#docs-title-widget input", {
      state: "attached",
      timeout: 15_000,
    });

    await triggerCommand(sw, page, "copy-link");
    const text = await readClipboardText(page);
    expect(text).toContain("テスト presentation");

    await triggerCommand(sw, page, "copy-link-for-slack");
    const html = await readClipboardHtml(page);
    expect(html).not.toBeNull();
    expect(html).toContain(":google_slides:");
  });

  // ──────────────────────────────────────────────
  // Google Drive
  // ──────────────────────────────────────────────

  test("Google Drive: title is public folder", async ({ sw, context }) => {
    const page = await context.newPage();
    await page.goto(
      "https://drive.google.com/drive/folders/1Om4PwxNNjGDODM8EZXFP-aRHSL1NyJg0",
      { waitUntil: "load", timeout: 30_000 },
    );

    // Wait for title to update — Google Drive loads folder names asynchronously.
    // Initial title may be a generic "フォルダ" before the real name loads.
    await page.waitForFunction(
      (expected) => document.title.includes(expected),
      "public folder",
      { timeout: 15_000 },
    );

    await triggerCommand(sw, page, "copy-link");
    const text = await readClipboardText(page);
    // Google Drive title = document.title with " - Google Drive" stripped
    expect(text).toContain("public folder");

    await triggerCommand(sw, page, "copy-link-for-slack");
    const html = await readClipboardHtml(page);
    expect(html).not.toBeNull();
    expect(html).toContain(":google_drive_2:");
  });

  // ──────────────────────────────────────────────
  // Asana (mocked — requires authentication)
  // ──────────────────────────────────────────────

  test("Asana Task (mocked): title from aria-label", async ({
    sw,
    context,
  }) => {
    const page = await context.newPage();
    await page.route("https://app.asana.com/0/1234/5678", async (route) => {
      await route.fulfill({
        contentType: "text/html",
        body: `<!DOCTYPE html>
<html><head><title>My Asana Task - Asana</title></head>
<body>
  <div id="TaskPrintView" aria-label="My Asana Task">Task content</div>
</body></html>`,
      });
    });
    await page.goto("https://app.asana.com/0/1234/5678", {
      waitUntil: "domcontentloaded",
    });
    await triggerCommand(sw, page, "copy-link");

    const text = await readClipboardText(page);
    expect(text).toBe("My Asana Task");

    await triggerCommand(sw, page, "copy-link-for-slack");
    const html = await readClipboardHtml(page);
    expect(html).not.toBeNull();
    expect(html).toContain(":asana:");
  });

  // ──────────────────────────────────────────────
  // Backlog (mocked — requires authentication)
  // ──────────────────────────────────────────────

  test("Backlog Issue (mocked): title from DOM selector", async ({
    sw,
    context,
  }) => {
    const page = await context.newPage();
    await page.route(
      "https://example.backlog.jp/view/PROJ-1",
      async (route) => {
        await route.fulfill({
          contentType: "text/html",
          body: `<!DOCTYPE html>
<html><head><title>PROJ-1 - Backlog</title></head>
<body>
  <div id="summary">
    <span class="title-group__title-text"><div>My Backlog Issue</div></span>
  </div>
</body></html>`,
        });
      },
    );
    await page.goto("https://example.backlog.jp/view/PROJ-1", {
      waitUntil: "domcontentloaded",
    });
    await triggerCommand(sw, page, "copy-link");

    const text = await readClipboardText(page);
    expect(text).toBe("My Backlog Issue");

    await triggerCommand(sw, page, "copy-link-for-slack");
    const html = await readClipboardHtml(page);
    expect(html).not.toBeNull();
    expect(html).toContain(":backlog:");
  });
});
