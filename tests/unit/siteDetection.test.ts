import { afterEach, describe, expect, it, vi } from "vitest";
import { buildPageContext } from "../../src/shared/pageContext";
import { detectSite } from "../../src/shared/siteDetection";
import { getFormattedTitle } from "../../src/shared/getFormattedTitle";
import { resolveEmojiName } from "../../src/shared/emojiResolver";

afterEach(() => {
  vi.unstubAllGlobals();
  document.body.innerHTML = "";
  document.body.id = "";
});

describe("shared site detection", () => {
  it("gives Jira the same priority in titles and emoji when a Redmine footer also exists", () => {
    vi.stubGlobal("window", {
      location: {
        href: "https://example.com/browse/A-1",
        hostname: "example.com",
        pathname: "/browse/A-1",
      },
    });
    document.body.id = "jira";
    document.body.innerHTML =
      '<a id="key-val">A-1</a><div id="summary-val"><h2>Summary</h2></div><div id="footer"><a>Redmine</a></div>';
    const ctx = buildPageContext();
    expect(detectSite(ctx)).toBe("jiraIssue");
    expect(getFormattedTitle()).toBe("A-1 Summary");
    expect(resolveEmojiName(ctx, {})).toBe(":jira:");
  });

  it("finds Redmine credit after other footer links", () => {
    vi.stubGlobal("window", {
      location: {
        href: "https://example.com/issues/1",
        hostname: "example.com",
        pathname: "/issues/1",
      },
    });
    document.body.innerHTML =
      '<div id="footer"><a>Help</a><a>Powered by Redmine</a></div><div id="content"><h2>Issue #1</h2><h3>Summary</h3></div>';
    const ctx = buildPageContext();
    expect(detectSite(ctx)).toBe("redmineIssue");
    expect(getFormattedTitle()).toBe("Issue #1: Summary");
    expect(resolveEmojiName(ctx, {})).toBe(":redmine_ticket:");
  });

  it("does not detect Redmine from incidental footer text", () => {
    vi.stubGlobal("window", {
      location: {
        href: "https://example.com/",
        hostname: "example.com",
        pathname: "/",
      },
    });
    document.title = "Normal page";
    document.body.innerHTML = '<div id="footer">We migrated from Redmine</div>';
    const ctx = buildPageContext();
    expect(detectSite(ctx)).toBeUndefined();
    expect(getFormattedTitle()).toBe("Normal page");
    expect(resolveEmojiName(ctx, {})).toBe("");
  });
});
