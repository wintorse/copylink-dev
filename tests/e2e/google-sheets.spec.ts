import {
  SHEETS_URL_WITH_RANGE,
  expect,
  readClipboardText,
  test,
  triggerCommand,
} from "./fixtures";

test.describe("Google Sheets range link", () => {
  test("copy-google-sheets-range copies URL with range parameter", async ({
    sw,
    context,
  }) => {
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
    // The clipboard should contain a URL with the pre-selected range
    expect(text).toContain("docs.google.com/spreadsheets");
    expect(text).toContain("range=C2:E4");
    expect(text).toContain("gid=0");
  });

  test("copy-google-sheets-range on non-Sheets page does nothing", async ({
    sw,
    context,
  }) => {
    const page = await context.newPage();
    await page.goto("https://example.com", { waitUntil: "domcontentloaded" });

    // Write a known value to the clipboard first
    await page.evaluate(() => navigator.clipboard.writeText("__sentinel__"));
    await triggerCommand(sw, page, "copy-google-sheets-range");

    const text = await readClipboardText(page);
    // Should remain unchanged since the command is a no-op on non-Sheets pages
    expect(text).toBe("__sentinel__");
  });
});
