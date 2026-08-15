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
    // Given: A GitHub pull request page is open.
    const page = await context.newPage();
    await page.goto("https://github.com/wintorse/copylink-dev/pull/52", {
      waitUntil: "domcontentloaded",
    });

    // When: The copy-link command is executed.
    await triggerCommand(sw, page, "copy-link");

    // Then: The copied text starts with the pull request number and title.
    const text = await readClipboardText(page);
    expect(text).toMatch(/^#52 .+/);

    // When: The copy-link-for-slack command is executed.
    await triggerCommand(sw, page, "copy-link-for-slack");

    // Then: The copied HTML contains the open pull request emoji.
    const html = await readClipboardHtml(page);
    expect(html).not.toBeNull();
    expect(html).toContain(":open_pull_request:");
  });

  test("GitHub Pull Request: status-specific emoji is used on a merged PR", async ({
    sw,
    context,
  }) => {
    // Given: Merged and open pull request emoji names are configured.
    await sw.evaluate(async () => {
      await chrome.storage.local.set({
        emojiNames: {
          githubPullRequest: ":pull_request:",
          githubMergedPullRequest: ":merged_pull_request:",
        },
      });
    });

    const page = await context.newPage();
    await page.goto("https://github.com/wintorse/copylink-dev/pull/60", {
      waitUntil: "domcontentloaded",
    });
    await page.waitForSelector("header [data-status]", { timeout: 15_000 });

    // When: The copy-link-for-slack command is executed on the merged PR.
    await triggerCommand(sw, page, "copy-link-for-slack");

    // Then: The copied HTML contains only the merged pull request emoji.
    const html = await readClipboardHtml(page);
    expect(html).not.toBeNull();
    expect(html).toContain(":merged_pull_request:");
    expect(html).not.toContain(":pull_request:");

    await sw.evaluate(async () => {
      await chrome.storage.local.remove("emojiNames");
    });
  });

  test("GitHub Issue: title is #<number> <text>", async ({ sw, context }) => {
    // Given: A GitHub issue page is open.
    const page = await context.newPage();
    await page.goto("https://github.com/wintorse/copylink-dev/issues/54", {
      waitUntil: "domcontentloaded",
    });

    // When: The copy-link command is executed.
    await triggerCommand(sw, page, "copy-link");

    // Then: The copied text starts with the issue number and title.
    const text = await readClipboardText(page);
    expect(text).toMatch(/^#54 .+/);

    // When: The copy-link-for-slack command is executed.
    await triggerCommand(sw, page, "copy-link-for-slack");

    // Then: The copied HTML contains the open issue emoji.
    const html = await readClipboardHtml(page);
    expect(html).not.toBeNull();
    expect(html).toContain(":open_issue:");
  });

  test("GitHub Repo: emoji is :github:", async ({ sw, context }) => {
    // Given: A GitHub repository page is open.
    const page = await context.newPage();
    await page.goto("https://github.com/wintorse/copylink-dev", {
      waitUntil: "domcontentloaded",
    });

    // When: The copy-link command is executed.
    await triggerCommand(sw, page, "copy-link");

    // Then: The copied title references the repository.
    const text = await readClipboardText(page);
    // Title should reference the repo name
    expect(text).toContain("copylink-dev");

    // When: The copy-link-for-slack command is executed.
    await triggerCommand(sw, page, "copy-link-for-slack");

    // Then: The copied HTML uses the GitHub emoji and no issue-specific emoji.
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
    // Given: A Jira issue page is open and its issue key has rendered.
    const page = await context.newPage();
    await page.goto(
      "https://jira.mongodb.org/projects/HIBERNATE/issues/HIBERNATE-77?filter=allopenissues",
      { waitUntil: "domcontentloaded" },
    );
    // Jira may load content dynamically
    await page.waitForSelector("#key-val", { timeout: 15_000 });

    // When: The copy-link command is executed.
    await triggerCommand(sw, page, "copy-link");

    // Then: The copied text contains the Jira issue key and title.
    const text = await readClipboardText(page);
    expect(text).toContain("HIBERNATE-77");
    expect(text).toContain("Support HQL in / not in");

    // When: The copy-link-for-slack command is executed.
    await triggerCommand(sw, page, "copy-link-for-slack");

    // Then: The copied HTML contains the Jira emoji.
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
    // Given: A mocked Redmine issue page returns the issue title structure.
    // redmine.openspace3d.com is a small, third-party-hosted Redmine
    // instance that is intermittently unreliable (slow responses / 503s),
    // which made this test flaky. Mock the response like the Asana/Backlog
    // tests below so we verify our own title-extraction logic without
    // depending on that server's uptime.
    const page = await context.newPage();
    await page.route(
      "https://redmine.openspace3d.com/issues/642",
      async (route) => {
        await route.fulfill({
          contentType: "text/html",
          body: `<!DOCTYPE html>
<html><head><title>Feature #642: OpenXR On Linux. - OpenSpace3D - Redmine</title></head>
<body>
  <div id="content">
    <h2>Feature #642</h2>
    <h3>OpenXR On Linux.</h3>
  </div>
</body></html>`,
        });
      },
    );
    await page.goto("https://redmine.openspace3d.com/issues/642", {
      waitUntil: "domcontentloaded",
    });

    // When: The copy-link command is executed.
    await triggerCommand(sw, page, "copy-link");

    // Then: The copied text contains the Redmine issue number and title.
    const text = await readClipboardText(page);
    expect(text).toContain("Feature #642");
    expect(text).toContain("OpenXR On Linux.");

    // When: The copy-link-for-slack command is executed.
    await triggerCommand(sw, page, "copy-link-for-slack");

    // Then: The copied HTML contains the Redmine ticket emoji.
    const html = await readClipboardHtml(page);
    expect(html).not.toBeNull();
    expect(html).toContain(":redmine_ticket:");
  });

  // ──────────────────────────────────────────────
  // ReDoc
  // ──────────────────────────────────────────────

  test("ReDoc: title is 法令本文取得API", async ({ sw, context }) => {
    // Given: A ReDoc operation page is open and its active label has rendered.
    const page = await context.newPage();
    await page.goto(
      "https://laws.e-gov.go.jp/api/2/redoc/#tag/laws-api/operation/get-law_data",
      { waitUntil: "domcontentloaded" },
    );
    // Wait for ReDoc to render the active label
    await page.waitForSelector("label[class*='active']", { timeout: 15_000 });

    // When: The copy-link command is executed.
    await triggerCommand(sw, page, "copy-link");

    // Then: The copied text contains the operation title.
    const text = await readClipboardText(page);
    expect(text).toContain("法令本文取得API");

    // When: The copy-link-for-slack command is executed.
    await triggerCommand(sw, page, "copy-link-for-slack");

    // Then: The copied HTML contains the Swagger emoji.
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
    // Given: A Google Sheets spreadsheet page is open and its title input exists.
    const page = await context.newPage();
    await page.goto(SHEETS_URL, { waitUntil: "load", timeout: 30_000 });
    // Wait for title input to be in the DOM (it may be hidden)
    await page.waitForSelector("#docs-title-widget input", {
      state: "attached",
      timeout: 15_000,
    });

    // When: The copy-link command is executed.
    await triggerCommand(sw, page, "copy-link");

    // Then: The copied text contains the spreadsheet title.
    const text = await readClipboardText(page);
    expect(text).toContain("テスト spreadsheet");

    // When: The copy-link-for-slack command is executed.
    await triggerCommand(sw, page, "copy-link-for-slack");

    // Then: The copied HTML contains the Google Sheets emoji.
    const html = await readClipboardHtml(page);
    expect(html).not.toBeNull();
    expect(html).toContain(":google_sheets:");
  });

  // ──────────────────────────────────────────────
  // Google Docs
  // ──────────────────────────────────────────────

  test("Google Docs: title is テスト document", async ({ sw, context }) => {
    // Given: A Google Docs document page is open and its title input exists.
    const page = await context.newPage();
    await page.goto(
      "https://docs.google.com/document/d/1dnmPyKPXidbBweLnAkOLbvJpbgOMuft6LrtMoeLtjCg/edit",
      { waitUntil: "load", timeout: 30_000 },
    );
    await page.waitForSelector("#docs-title-widget input", {
      state: "attached",
      timeout: 15_000,
    });

    // When: The copy-link command is executed.
    await triggerCommand(sw, page, "copy-link");

    // Then: The copied text contains the document title.
    const text = await readClipboardText(page);
    expect(text).toContain("テスト document");

    // When: The copy-link-for-slack command is executed.
    await triggerCommand(sw, page, "copy-link-for-slack");

    // Then: The copied HTML contains the Google Docs emoji.
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
    // Given: A Google Slides presentation page is open and its title input exists.
    const page = await context.newPage();
    await page.goto(
      "https://docs.google.com/presentation/d/1LYg3VmFY4yBCI8ujhzTlMSBYLkv5b8W3sTQ8qTIJZtc/edit",
      { waitUntil: "load", timeout: 30_000 },
    );
    await page.waitForSelector("#docs-title-widget input", {
      state: "attached",
      timeout: 15_000,
    });

    // When: The copy-link command is executed.
    await triggerCommand(sw, page, "copy-link");

    // Then: The copied text contains the presentation title.
    const text = await readClipboardText(page);
    expect(text).toContain("テスト presentation");

    // When: The copy-link-for-slack command is executed.
    await triggerCommand(sw, page, "copy-link-for-slack");

    // Then: The copied HTML contains the Google Slides emoji.
    const html = await readClipboardHtml(page);
    expect(html).not.toBeNull();
    expect(html).toContain(":google_slides:");
  });

  // ──────────────────────────────────────────────
  // Google Drive
  // ──────────────────────────────────────────────

  test("Google Drive: title is public folder", async ({ sw, context }) => {
    // Given: A Google Drive folder page is open and its title has loaded.
    const page = await context.newPage();
    await page.goto(
      "https://drive.google.com/drive/folders/1Om4PwxNNjGDODM8EZXFP-aRHSL1NyJg0",
      { waitUntil: "load", timeout: 20_000 },
    );

    // Wait for title to update — Google Drive loads folder names asynchronously.
    // Initial title may be a generic "フォルダ" before the real name loads.
    await page.waitForFunction(
      (expected) => document.title.includes(expected),
      "public folder",
      { timeout: 20_000 },
    );

    // When: The copy-link command is executed.
    await triggerCommand(sw, page, "copy-link");

    // Then: The copied text contains the folder title.
    const text = await readClipboardText(page);
    // Google Drive title = document.title with " - Google Drive" stripped
    expect(text).toContain("public folder");

    // When: The copy-link-for-slack command is executed.
    await triggerCommand(sw, page, "copy-link-for-slack");

    // Then: The copied HTML contains the Google Drive emoji.
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
    // Given: A mocked Asana task page contains the task name in an aria-label.
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

    // When: The copy-link command is executed.
    await triggerCommand(sw, page, "copy-link");

    // Then: The copied text is the Asana task title.
    const text = await readClipboardText(page);
    expect(text).toBe("My Asana Task");

    // When: The copy-link-for-slack command is executed.
    await triggerCommand(sw, page, "copy-link-for-slack");

    // Then: The copied HTML contains the Asana emoji.
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
    // Given: A mocked Backlog issue page contains the issue title in its DOM selector.
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

    // When: The copy-link command is executed.
    await triggerCommand(sw, page, "copy-link");

    // Then: The copied text is the Backlog issue title.
    const text = await readClipboardText(page);
    expect(text).toBe("My Backlog Issue");

    // When: The copy-link-for-slack command is executed.
    await triggerCommand(sw, page, "copy-link-for-slack");

    // Then: The copied HTML contains the Backlog emoji.
    const html = await readClipboardHtml(page);
    expect(html).not.toBeNull();
    expect(html).toContain(":backlog:");
  });
});
