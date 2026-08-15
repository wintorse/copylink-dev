import { expect, test, triggerCommand } from "./fixtures";
import { fileURLToPath } from "url";
import { join } from "path";
import { readFileSync } from "fs";

const __dirname = fileURLToPath(new URL(".", import.meta.url));

/** All supported locales' `copyGoogleSheetsRangeFailure` messages. */
const sheetsRangeFailureMessages = (["en", "ja", "zh_CN"] as const).map(
  (locale) => {
    const raw = readFileSync(
      join(__dirname, "../../public/_locales", locale, "messages.json"),
      "utf-8",
    );
    const parsed: unknown = JSON.parse(raw);
    if (
      typeof parsed !== "object" ||
      parsed === null ||
      !("copyGoogleSheetsRangeFailure" in parsed)
    ) {
      throw new Error(`Missing copyGoogleSheetsRangeFailure in ${locale}`);
    }
    const entry = (parsed as Record<string, unknown>)
      .copyGoogleSheetsRangeFailure;
    if (typeof entry !== "object" || entry === null || !("message" in entry)) {
      throw new Error(
        `Invalid copyGoogleSheetsRangeFailure shape in ${locale}`,
      );
    }
    const messageValue = (entry as Record<string, unknown>).message;
    if (typeof messageValue !== "string") {
      throw new Error(`message is not a string in ${locale}`);
    }
    return messageValue;
  },
);

test.describe("Toast notification", () => {
  test("toast appears after copy-link and disappears after ~3s", async ({
    sw,
    context,
  }) => {
    // Given: An example.com page is open.
    const page = await context.newPage();
    await page.goto("https://example.com", { waitUntil: "domcontentloaded" });

    // When: The copy-link command is executed.
    await triggerCommand(sw, page, "copy-link");

    // Then: A non-empty toast is displayed in the extension's Shadow DOM.
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

    // Then: The toast is removed automatically after its display duration.
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
    // Given: A mocked Google Sheets page has no available range information.
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

    // When: The copy-google-sheets-range command is executed.
    await triggerCommand(sw, page, "copy-google-sheets-range");

    // Then: A localized failure toast is displayed.
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
    expect(sheetsRangeFailureMessages).toContain(toastText);

    // Then: The failure toast is removed automatically.
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
