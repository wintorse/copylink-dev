import {
  buildCustomRegexes,
  buildEmojiNames,
  getInitialEmojiValues,
} from "../../src/shared/popup/emojiSettings";
import { describe, expect, it } from "vitest";

describe("emojiSettings – GitHub PR status fallback", () => {
  it("omits blank GitHub PR status emoji values so they can fall back", () => {
    expect(
      buildEmojiNames({
        githubPullRequest: ":pull_request:",
        githubMergedPullRequest: "",
      }),
    ).not.toHaveProperty("githubMergedPullRequest");
  });

  it("stores configured GitHub PR status emoji values", () => {
    expect(
      buildEmojiNames({
        githubMergedPullRequest: "merged_pull_request",
      }),
    ).toHaveProperty("githubMergedPullRequest", ":merged_pull_request:");
  });

  it("falls back unset GitHub PR status emoji fields to the githubPullRequest emoji", () => {
    const values = getInitialEmojiValues({
      githubPullRequest: ":pull_request:",
    });

    expect(values.githubPullRequest).toBe(":pull_request:");
    expect(values.githubMergedPullRequest).toBe(":pull_request:");
    expect(values.githubDraftPullRequest).toBe(":pull_request:");
    expect(values.githubOpenPullRequest).toBe(":pull_request:");
    expect(values.githubClosedPullRequest).toBe(":pull_request:");
  });

  it("uses a configured GitHub PR status emoji instead of the fallback", () => {
    const values = getInitialEmojiValues({
      githubPullRequest: ":pull_request:",
      githubMergedPullRequest: ":merged_pull_request:",
    });

    expect(values.githubMergedPullRequest).toBe(":merged_pull_request:");
    expect(values.githubDraftPullRequest).toBe(":pull_request:");
  });
});

describe("buildCustomRegexes", () => {
  it("preserves valid custom regex values", () => {
    expect(
      buildCustomRegexes({
        customRegex1: "example\\.com/(foo|bar)",
        customRegex2: "",
      }),
    ).toEqual({
      customRegex1: "example\\.com/(foo|bar)",
      customRegex2: "",
    });
  });

  it("throws when a custom regex is invalid", () => {
    expect(() =>
      buildCustomRegexes({
        customRegex1: "[",
      }),
    ).toThrow();
  });
});
