import {
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

  it("shows blank initial values for unset GitHub PR status emoji fields", () => {
    const values = getInitialEmojiValues({
      githubPullRequest: ":pull_request:",
    });

    expect(values.githubPullRequest).toBe(":pull_request:");
    expect(values.githubMergedPullRequest).toBe("");
  });
});
