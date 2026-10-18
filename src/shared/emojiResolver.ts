import {
  CUSTOM_EMOJI_KEYS,
  CUSTOM_REGEX_KEYS,
  DEFAULT_EMOJI_NAMES,
} from "./constants";
import type { CustomRegexes, EmojiKeys, EmojiNameRecord } from "../types/types";
import type { GitHubPullRequestStatus } from "./githubPullRequestStatus";

import type { PageContext } from "./pageContext";
import { detectSite } from "./siteDetection";

export type { PageContext } from "./pageContext";

export type EmojiResolverDeps = {
  emojiNames?: Partial<EmojiNameRecord>;
  customRegexes?: Partial<CustomRegexes>;
  defaults?: EmojiNameRecord;
};

const getEmojiGetter =
  (emojiNames: Partial<EmojiNameRecord>, defaults: EmojiNameRecord) =>
  (key: keyof EmojiNameRecord) =>
    emojiNames[key] ?? defaults[key];

const githubPullRequestStatusEmojiKeys = {
  draft: "githubDraftPullRequest",
  open: "githubOpenPullRequest",
  merged: "githubMergedPullRequest",
  closed: "githubClosedPullRequest",
} as const satisfies Record<GitHubPullRequestStatus, EmojiKeys>;

const matchesCustomRegex = (pattern: string, href: string): boolean => {
  try {
    return new RegExp(pattern).test(href);
  } catch {
    return false;
  }
};

export const resolveEmojiName = (
  ctx: PageContext,
  deps: EmojiResolverDeps,
): string => {
  const emojiNames = deps.emojiNames ?? {};
  const customRegexes = deps.customRegexes ?? {};
  const defaults = deps.defaults ?? DEFAULT_EMOJI_NAMES;
  const getEmoji = getEmojiGetter(emojiNames, defaults);
  const getGitHubPullRequestEmoji = (): string => {
    const status = ctx.githubPullRequestStatus;
    if (status === undefined) {
      return getEmoji("githubPullRequest");
    }

    const statusEmoji = emojiNames[githubPullRequestStatusEmojiKeys[status]];
    if (statusEmoji !== undefined && statusEmoji.length > 0) {
      return statusEmoji;
    }

    return getEmoji("githubPullRequest");
  };

  for (const [index, regexKey] of CUSTOM_REGEX_KEYS.entries()) {
    const websiteKey = CUSTOM_EMOJI_KEYS[index];
    const customEmoji = emojiNames[websiteKey];
    const regexPattern = customRegexes[regexKey];
    if (
      customEmoji !== undefined &&
      customEmoji.length > 0 &&
      regexPattern !== undefined &&
      regexPattern.length > 0 &&
      matchesCustomRegex(regexPattern, ctx.href)
    ) {
      return getEmoji(websiteKey);
    }
  }

  const site = detectSite(ctx);
  if (site === "githubPullRequest") {
    return getGitHubPullRequestEmoji();
  }
  return site === undefined ? "" : getEmoji(site);
};
