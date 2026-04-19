import { expect, test, triggerCommand } from "./fixtures";

test.describe("Toast notification", () => {
  test("toast appears after copy-link and disappears after ~3s", async ({
    sw,
    context,
  }) => {
    const page = await context.newPage();
    await page.goto("https://example.com", { waitUntil: "domcontentloaded" });
    await triggerCommand(sw, page, "copy-link");

    // Toast is rendered inside a Shadow DOM host element
    // const toastHost = page.locator("div").filter({
    //   has: page.locator(":scope"),
    // });

    // Find the shadow host that contains the toast
    const toastVisible = await page.evaluate(() => {
      const hosts = document.querySelectorAll("body > div");
      for (const host of hosts) {
        const shadow = host.shadowRoot;
        if (shadow) {
          const toast = shadow.querySelector(".copylink-dev-toast");
          if (toast) {
            return true;
          }
        }
      }
      return false;
    });
    expect(toastVisible).toBe(true);

    // Verify toast text content exists
    const toastText = await page.evaluate(() => {
      const hosts = document.querySelectorAll("body > div");
      for (const host of hosts) {
        const shadow = host.shadowRoot;
        if (shadow) {
          const toast = shadow.querySelector(".copylink-dev-toast");
          if (toast) {
            return toast.textContent;
          }
        }
      }
      return null;
    });
    expect(toastText).not.toBeNull();
    expect(toastText?.length).toBeGreaterThan(0);

    // Wait for toast to be removed (~3s duration + 200ms fade)
    await page.waitForFunction(
      () => {
        const hosts = document.querySelectorAll("body > div");
        for (const host of hosts) {
          const shadow = host.shadowRoot;
          if (shadow) {
            const toast = shadow.querySelector(".copylink-dev-toast");
            if (toast) {
              return false;
            }
          }
        }
        return true;
      },
      { timeout: 5000 },
    );
  });

  test("failure toast appears when Google Sheets range is unavailable", async ({
    sw,
    context,
  }) => {
    const page = await context.newPage();

    // Mock a Google Sheets URL that serves a page WITHOUT #t-name-box.
    // This causes getGoogleSheetsRangeInfo() to return null, triggering the failure toast.
    await page.route(
      "https://docs.google.com/spreadsheets/d/test-sheet-id/edit",
      async (route) => {
        await route.fulfill({
          contentType: "text/html",
          body: `<!DOCTYPE html><html><head><title>Test Sheet</title></head><body></body></html>`,
        });
      },
    );

    // Navigate with a gid hash so the URL passes the Google Sheets regex check
    await page.goto(
      "https://docs.google.com/spreadsheets/d/test-sheet-id/edit#gid=0",
      { waitUntil: "domcontentloaded" },
    );
    await triggerCommand(sw, page, "copy-google-sheets-range");

    // Failure toast should appear
    const toastText = await page.evaluate(() => {
      const hosts = document.querySelectorAll("body > div");
      for (const host of hosts) {
        const shadow = host.shadowRoot;
        if (shadow) {
          const toast = shadow.querySelector(".copylink-dev-toast");
          if (toast) {
            return toast.textContent;
          }
        }
      }
      return null;
    });
    expect(toastText).not.toBeNull();
    expect(toastText).toContain("Failed");

    // Failure toast should also disappear automatically
    await page.waitForFunction(
      () => {
        const hosts = document.querySelectorAll("body > div");
        for (const host of hosts) {
          const shadow = host.shadowRoot;
          if (shadow) {
            const toast = shadow.querySelector(".copylink-dev-toast");
            if (toast) {
              return false;
            }
          }
        }
        return true;
      },
      { timeout: 5000 },
    );
  });
});
