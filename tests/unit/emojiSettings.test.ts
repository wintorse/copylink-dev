import {
  buildCustomRegexes,
  buildEmojiNames,
  getInitialEmojiValues,
  normalizeEmojiValue,
} from "../../src/shared/popup/emojiSettings";
import { describe, expect, it } from "vitest";
import { resolveEmojiName } from "../../src/shared/emojiResolver";

describe("emoji name normalization", () => {
  it.each([
    { input: "  octocat  ", expected: ":octocat:" },
    { input: "\t:octocat:\n", expected: ":octocat:" },
    { input: " \t\n", expected: ":default:" },
  ])("trims emoji input before normalizing: $input", ({ input, expected }) => {
    expect(normalizeEmojiValue(input, ":default:")).toBe(expected);
  });

  it("trims ordinary, PR status, and custom emoji names before saving", () => {
    expect(
      buildEmojiNames({
        github: "  octocat  ",
        githubMergedPullRequest: " :merged: ",
        customWebsite1: "\tcustom\n",
      }),
    ).toMatchObject({
      github: ":octocat:",
      githubMergedPullRequest: ":merged:",
      customWebsite1: ":custom:",
    });
  });
});

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

  it("keeps unset GitHub PR status fields blank so inheritance survives saving", () => {
    const values = getInitialEmojiValues({
      githubPullRequest: ":pull_request:",
    });

    expect(values.githubPullRequest).toBe(":pull_request:");
    expect(values.githubMergedPullRequest).toBe("");
    expect(values.githubDraftPullRequest).toBe("");
    expect(values.githubOpenPullRequest).toBe("");
    expect(values.githubClosedPullRequest).toBe("");
  });

  it("inherits the updated common emoji after editing and reopening the popup", () => {
    const values = getInitialEmojiValues({ githubPullRequest: ":old:" });
    values.githubPullRequest = ":new:";
    const saved = buildEmojiNames(values);
    expect(saved).not.toHaveProperty("githubMergedPullRequest");
    expect(getInitialEmojiValues(saved).githubMergedPullRequest).toBe("");
    expect(
      resolveEmojiName(
        {
          href: "https://github.com/a/b/pull/1",
          hostname: "github.com",
          pathname: "/a/b/pull/1",
          githubPullRequestStatus: "merged",
        },
        { emojiNames: saved },
      ),
    ).toBe(":new:");
  });

  it("uses a configured GitHub PR status emoji instead of the fallback", () => {
    const values = getInitialEmojiValues({
      githubPullRequest: ":pull_request:",
      githubMergedPullRequest: ":merged_pull_request:",
    });

    expect(values.githubMergedPullRequest).toBe(":merged_pull_request:");
    expect(values.githubDraftPullRequest).toBe("");
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
