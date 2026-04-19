// DOM is needed because createFallbackElement calls document.createElement internally.
// @vitest-environment happy-dom
import {
  type CopyTextLinkDeps,
  copyTextLinkCore,
} from "../../src/shared/clipboard/copyTextLinkCore";
import { describe, expect, it, vi } from "vitest";
import type { CopyResult } from "../../src/shared/clipboard/copyToClipboardShared";

/**
 * Build a fully-mocked deps object with sensible defaults.
 * @param overrides - Optional partial CopyTextLinkDeps to override default mocks.
 * @returns A CopyTextLinkDeps object with all methods mocked.
 */
const makeDeps = (overrides?: Partial<CopyTextLinkDeps>): CopyTextLinkDeps => ({
  // Returns the key itself so assertions can match the i18n key directly.
  t: (key: string) => key,
  getEmojiName: vi.fn().mockResolvedValue(""),
  getLinkFormat: vi.fn().mockResolvedValue("htmlWithEmoji"),
  getFormattedTitle: vi.fn().mockReturnValue("Test Title"),
  getGoogleSheetsRangeInfo: vi.fn().mockReturnValue(null),
  getUrl: vi.fn().mockReturnValue("https://example.com/"),
  notify: vi.fn().mockImplementation(() => Promise.resolve()),
  copy: vi.fn().mockResolvedValue({ success: true } satisfies CopyResult),
  ...overrides,
});

// ──────────────────────────────────────────────
// copy-link
// ──────────────────────────────────────────────

describe("copyTextLinkCore / copy-link", () => {
  it("copies title as text and HTML anchor, then notifies success", async () => {
    const deps = makeDeps();
    await copyTextLinkCore("copy-link", deps);

    expect(deps.copy).toHaveBeenCalledWith(
      "Test Title",
      '<a href="https://example.com/">Test Title</a>&nbsp;',
      expect.any(Object), // fallbackElement created by createFallbackElement
    );
    expect(deps.notify).toHaveBeenCalledWith("copyLinkSuccess");
  });

  it("notifies failure when the copy operation fails (B-ERR-05)", async () => {
    const deps = makeDeps({
      copy: vi.fn().mockResolvedValue({
        success: false,
        error: new Error("clipboard unavailable"),
      } satisfies CopyResult),
    });

    await copyTextLinkCore("copy-link", deps);

    expect(deps.notify).toHaveBeenCalledWith("copyLinkFailure");
  });
});

// ──────────────────────────────────────────────
// copy-title
// ──────────────────────────────────────────────

describe("copyTextLinkCore / copy-title", () => {
  it("copies plain text title with no HTML, then notifies success", async () => {
    const deps = makeDeps();
    await copyTextLinkCore("copy-title", deps);

    expect(deps.copy).toHaveBeenCalledWith(
      "Test Title",
      undefined, // no HTML for copy-title
      expect.any(Object),
    );
    expect(deps.notify).toHaveBeenCalledWith("copyTitleSuccess");
  });

  it("notifies failure when the copy operation fails", async () => {
    const deps = makeDeps({
      copy: vi.fn().mockResolvedValue({ success: false } satisfies CopyResult),
    });

    await copyTextLinkCore("copy-title", deps);

    expect(deps.notify).toHaveBeenCalledWith("copyTitleFailure");
  });
});

// ──────────────────────────────────────────────
// copy-link-for-slack
// ──────────────────────────────────────────────

describe("copyTextLinkCore / copy-link-for-slack", () => {
  it("copies Markdown text and HTML with emoji prefix", async () => {
    const deps = makeDeps({
      getEmojiName: vi.fn().mockResolvedValue(":github:"),
    });

    await copyTextLinkCore("copy-link-for-slack", deps);

    expect(deps.copy).toHaveBeenCalledWith(
      "[Test Title](https://example.com/)",
      expect.stringContaining(":github:"),
      expect.any(Object),
    );
    expect(deps.copy).toHaveBeenCalledWith(
      expect.any(String),
      expect.stringContaining('<a href="https://example.com/">Test Title</a>'),
      expect.any(Object),
    );
  });

  it("notifies failure when the copy operation fails", async () => {
    const deps = makeDeps({
      copy: vi.fn().mockResolvedValue({ success: false } satisfies CopyResult),
    });

    await copyTextLinkCore("copy-link-for-slack", deps);

    expect(deps.notify).toHaveBeenCalledWith("copyLinkFailure");
  });
});

// ──────────────────────────────────────────────
// copy-google-sheets-range
// ──────────────────────────────────────────────

describe("copyTextLinkCore / copy-google-sheets-range", () => {
  it("does nothing (no copy, no notify) when not on a Google Sheets page", async () => {
    const deps = makeDeps({
      getUrl: vi.fn().mockReturnValue("https://example.com/"),
    });

    await copyTextLinkCore("copy-google-sheets-range", deps);

    expect(deps.copy).not.toHaveBeenCalled();
    expect(deps.notify).not.toHaveBeenCalled();
  });

  it("notifies failure when range info is unavailable (name box missing)", async () => {
    const deps = makeDeps({
      getUrl: vi
        .fn()
        .mockReturnValue(
          "https://docs.google.com/spreadsheets/d/abc/edit#gid=0",
        ),
      getGoogleSheetsRangeInfo: vi.fn().mockReturnValue(null),
    });

    await copyTextLinkCore("copy-google-sheets-range", deps);

    expect(deps.notify).toHaveBeenCalledWith("copyGoogleSheetsRangeFailure");
    expect(deps.copy).not.toHaveBeenCalled();
  });

  it("copies the range link with emoji prefix in htmlWithEmoji format", async () => {
    const rangeLink =
      "https://docs.google.com/spreadsheets/d/abc/edit#gid=0&range=A1:B5";

    const deps = makeDeps({
      getUrl: vi
        .fn()
        .mockReturnValue(
          "https://docs.google.com/spreadsheets/d/abc/edit#gid=0",
        ),
      getGoogleSheetsRangeInfo: vi.fn().mockReturnValue({
        rangeString: "A1:B5",
        link: rangeLink,
      }),
      getLinkFormat: vi.fn().mockResolvedValue("htmlWithEmoji"),
      getEmojiName: vi.fn().mockResolvedValue(":google_sheets:"),
    });

    await copyTextLinkCore("copy-google-sheets-range", deps);

    expect(deps.copy).toHaveBeenCalledWith(
      expect.stringContaining(rangeLink),
      expect.stringContaining(":google_sheets:"),
      expect.any(Object),
    );
    expect(deps.notify).toHaveBeenCalledWith("copyGoogleSheetsRangeSuccess");
  });

  it("notifies failure when copy fails on a Sheets page", async () => {
    const deps = makeDeps({
      getUrl: vi
        .fn()
        .mockReturnValue(
          "https://docs.google.com/spreadsheets/d/abc/edit#gid=0",
        ),
      getGoogleSheetsRangeInfo: vi.fn().mockReturnValue({
        rangeString: "A1",
        link: "https://docs.google.com/spreadsheets/d/abc/edit#gid=0&range=A1",
      }),
      copy: vi.fn().mockResolvedValue({ success: false } satisfies CopyResult),
    });

    await copyTextLinkCore("copy-google-sheets-range", deps);

    expect(deps.notify).toHaveBeenCalledWith("copyGoogleSheetsRangeFailure");
  });
});

// ──────────────────────────────────────────────
// HTML escaping
// ──────────────────────────────────────────────

describe("copyTextLinkCore – HTML escaping", () => {
  it("escapes special characters in the title within HTML output", async () => {
    const deps = makeDeps({
      getFormattedTitle: vi
        .fn()
        .mockReturnValue("<script>Title & More</script>"),
      getUrl: vi.fn().mockReturnValue("https://example.com/?q=a&b=c"),
    });

    await copyTextLinkCore("copy-link", deps);

    expect(deps.copy).toHaveBeenCalledWith(
      expect.any(String),
      expect.stringContaining("&lt;script&gt;"),
      expect.any(Object),
    );
    expect(deps.copy).toHaveBeenCalledWith(
      expect.any(String),
      expect.stringContaining("&amp;"),
      expect.any(Object),
    );
    expect(deps.copy).not.toHaveBeenCalledWith(
      expect.any(String),
      expect.stringContaining("<script>"),
      expect.any(Object),
    );
  });
});
