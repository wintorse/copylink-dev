import {
  CUSTOM_EMOJI_KEYS,
  CUSTOM_REGEX_KEYS,
  DEFAULT_EMOJI_NAMES,
} from "./constants";
import type { CustomRegexes, EmojiNameRecord } from "../types/types";

export type PageContext = {
  href: string;
  hostname: string;
  pathname: string;
  documentBodyId?: string;
  documentTitle?: string;
  hasRedmineFooter?: boolean;
  hasRedocWrap?: boolean;
};

export type EmojiResolverDeps = {
  emojiNames?: Partial<EmojiNameRecord>;
  customRegexes?: Partial<CustomRegexes>;
  defaults?: EmojiNameRecord;
};

const getEmojiGetter =
  (emojiNames: Partial<EmojiNameRecord>, defaults: EmojiNameRecord) =>
  (key: keyof EmojiNameRecord) =>
    emojiNames[key] ?? defaults[key];

export const resolveEmojiName = (
  ctx: PageContext,
  deps: EmojiResolverDeps,
): string => {
  const emojiNames = deps.emojiNames ?? {};
  const customRegexes = deps.customRegexes ?? {};
  const defaults = deps.defaults ?? DEFAULT_EMOJI_NAMES;
  const getEmoji = getEmojiGetter(emojiNames, defaults);

  for (const [index, regexKey] of CUSTOM_REGEX_KEYS.entries()) {
    const websiteKey = CUSTOM_EMOJI_KEYS[index];
    const customEmoji = emojiNames[websiteKey];
    const regexPattern = customRegexes[regexKey];
    if (
      customEmoji !== undefined &&
      customEmoji.length > 0 &&
      regexPattern !== undefined &&
      regexPattern.length > 0 &&
      new RegExp(regexPattern).test(ctx.href)
    ) {
      return getEmoji(websiteKey);
    }
  }

  const pathParts = ctx.pathname.split("/");

  if (ctx.hostname === "docs.google.com") {
    switch (pathParts[1]) {
      case "spreadsheets":
        return getEmoji("googleSheets");
      case "document":
        return getEmoji("googleDocs");
      case "presentation":
        return getEmoji("googleSlides");
      default:
        return getEmoji("googleDrive");
    }
  }

  if (ctx.hostname === "drive.google.com") {
    return getEmoji("googleDrive");
  }

  if (ctx.hostname === "github.com") {
    switch (pathParts[3]) {
      case "pull":
        return getEmoji("githubPullRequest");
      case "issues":
        return getEmoji("githubIssue");
      default:
        return getEmoji("github");
    }
  }

  if (ctx.hostname === "app.asana.com") {
    return getEmoji("asanaTask");
  }

  if (ctx.hostname.includes("backlog")) {
    return getEmoji("backlogIssue");
  }

  if (ctx.hostname.includes("redmine") || ctx.hasRedmineFooter === true) {
    return getEmoji("redmineIssue");
  }

  if (ctx.documentBodyId === "jira") {
    return getEmoji("jiraIssue");
  }

  if (
    (ctx.documentTitle?.includes("ReDoc") ?? false) ||
    ctx.hasRedocWrap === true
  ) {
    return getEmoji("reDoc");
  }

  return "";
};
