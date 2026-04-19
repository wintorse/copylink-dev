import {
  type PageContext,
  resolveEmojiName,
} from "../../src/shared/emojiResolver";
import { describe, expect, it } from "vitest";

/**
 * Build a minimal PageContext from a URL, with optional overrides.
 * @param href - The URL to parse.
 * @param overrides - Optional partial PageContext fields to override.
 * @returns A PageContext constructed from the URL and overrides.
 */
const ctx = (href: string, overrides?: Partial<PageContext>): PageContext => {
  const url = new URL(href);
  return {
    href,
    hostname: url.hostname,
    pathname: url.pathname,
    ...overrides,
  };
};

describe("resolveEmojiName – built-in site detection", () => {
  it("returns :google_sheets: for Google Sheets", () => {
    expect(
      resolveEmojiName(ctx("https://docs.google.com/spreadsheets/d/abc"), {}),
    ).toBe(":google_sheets:");
  });

  it("returns :google_docs: for Google Docs", () => {
    expect(
      resolveEmojiName(ctx("https://docs.google.com/document/d/abc"), {}),
    ).toBe(":google_docs:");
  });

  it("returns :google_slides: for Google Slides", () => {
    expect(
      resolveEmojiName(ctx("https://docs.google.com/presentation/d/abc"), {}),
    ).toBe(":google_slides:");
  });

  it("returns :google_drive_2: for Google Drive", () => {
    expect(
      resolveEmojiName(ctx("https://drive.google.com/drive/folders/abc"), {}),
    ).toBe(":google_drive_2:");
  });

  it("returns :open_pull_request: for GitHub PR", () => {
    expect(
      resolveEmojiName(ctx("https://github.com/owner/repo/pull/1"), {}),
    ).toBe(":open_pull_request:");
  });

  it("returns :open_issue: for GitHub Issue", () => {
    expect(
      resolveEmojiName(ctx("https://github.com/owner/repo/issues/1"), {}),
    ).toBe(":open_issue:");
  });

  it("returns :github: for GitHub Repo", () => {
    expect(resolveEmojiName(ctx("https://github.com/owner/repo"), {})).toBe(
      ":github:",
    );
  });

  it("returns :asana: for Asana", () => {
    expect(resolveEmojiName(ctx("https://app.asana.com/0/1234/5678"), {})).toBe(
      ":asana:",
    );
  });

  it("returns :backlog: for Backlog (hostname contains 'backlog')", () => {
    expect(
      resolveEmojiName(ctx("https://example.backlog.jp/view/PROJ-1"), {}),
    ).toBe(":backlog:");
  });

  it("returns :redmine_ticket: for Redmine (hostname contains 'redmine')", () => {
    expect(
      resolveEmojiName(ctx("https://redmine.example.com/issues/1"), {}),
    ).toBe(":redmine_ticket:");
  });

  it("returns :redmine_ticket: for Redmine detected via footer credit", () => {
    expect(
      resolveEmojiName(
        ctx("https://example.com/issues/1", { hasRedmineFooter: true }),
        {},
      ),
    ).toBe(":redmine_ticket:");
  });

  it("returns :jira: for Jira (document.body.id === 'jira')", () => {
    expect(
      resolveEmojiName(
        ctx("https://jira.example.com/browse/PROJ-1", {
          documentBodyId: "jira",
        }),
        {},
      ),
    ).toBe(":jira:");
  });

  it("returns :swagger: for ReDoc (document.title contains 'ReDoc')", () => {
    expect(
      resolveEmojiName(
        ctx("https://example.com/api", { documentTitle: "MyAPI - ReDoc" }),
        {},
      ),
    ).toBe(":swagger:");
  });

  it("returns :swagger: for ReDoc (redoc-wrap element present)", () => {
    expect(
      resolveEmojiName(
        ctx("https://example.com/api", { hasRedocWrap: true }),
        {},
      ),
    ).toBe(":swagger:");
  });

  it("returns empty string for unknown sites", () => {
    expect(resolveEmojiName(ctx("https://www.example.com/"), {})).toBe("");
  });
});

describe("resolveEmojiName – custom emoji override", () => {
  it("uses custom emoji name when set for a built-in site", () => {
    expect(
      resolveEmojiName(ctx("https://github.com/owner/repo"), {
        emojiNames: { github: ":my_github:" },
      }),
    ).toBe(":my_github:");
  });
});

describe("resolveEmojiName – custom regex (B-CUSTOM-02)", () => {
  it("custom regex takes priority over built-in detection for the same URL", () => {
    expect(
      resolveEmojiName(ctx("https://github.com/owner/repo"), {
        emojiNames: { customWebsite1: ":my_custom_emoji:" },
        customRegexes: { customRegex1: "github\\.com" },
      }),
    ).toBe(":my_custom_emoji:");
  });

  it("falls through to built-in when regex pattern is empty", () => {
    expect(
      resolveEmojiName(ctx("https://github.com/owner/repo"), {
        emojiNames: { customWebsite1: ":my_custom_emoji:" },
        customRegexes: { customRegex1: "" },
      }),
    ).toBe(":github:");
  });

  it("falls through to built-in when custom emoji slot is unset (undefined)", () => {
    expect(
      resolveEmojiName(ctx("https://github.com/owner/repo"), {
        // customWebsite1 not in emojiNames → undefined → guard (customEmoji !== undefined) fails
        customRegexes: { customRegex1: "github\\.com" },
      }),
    ).toBe(":github:");
  });

  it("falls through to built-in when regex does not match", () => {
    expect(
      resolveEmojiName(ctx("https://github.com/owner/repo"), {
        emojiNames: { customWebsite1: ":my_custom_emoji:" },
        customRegexes: { customRegex1: "example\\.com" },
      }),
    ).toBe(":github:");
  });
});
