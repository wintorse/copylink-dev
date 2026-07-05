import {
  CUSTOM_REGEX_KEYS,
  DEFAULT_EMOJI_NAMES,
  EMOJI_KEYS,
  GITHUB_PULL_REQUEST_STATUS_EMOJI_KEYS,
} from "../constants";
import type {
  CustomRegexKeys,
  CustomRegexes,
  EmojiKeys,
  EmojiName,
  EmojiNameRecord,
} from "../../types/types";

const fallbackEmojiKeys = new Set<EmojiKeys>(
  GITHUB_PULL_REQUEST_STATUS_EMOJI_KEYS,
);

export const isEmojiFormat = (value: string): value is EmojiName =>
  /^:.*:$/.test(value);

export const normalizeEmojiValue = (
  value: string,
  defaultValue: EmojiName,
): EmojiName => {
  const trimmed = value.trim();
  if (!trimmed) {
    return defaultValue;
  }
  if (isEmojiFormat(trimmed)) {
    return trimmed;
  }
  return `:${trimmed}:`;
};

export const buildEmojiNames = (
  values: Partial<Record<EmojiKeys, string>>,
  defaults: EmojiNameRecord = DEFAULT_EMOJI_NAMES,
): Partial<EmojiNameRecord> => {
  const result: Partial<EmojiNameRecord> = {};
  for (const key of EMOJI_KEYS) {
    const rawValue = values[key] ?? "";
    if (fallbackEmojiKeys.has(key) && rawValue.trim().length === 0) {
      continue;
    }
    result[key] = normalizeEmojiValue(rawValue, defaults[key]);
  }
  return result;
};

export const buildCustomRegexes = (
  values: Partial<Record<CustomRegexKeys, string>>,
): Partial<CustomRegexes> => {
  const result: Partial<CustomRegexes> = {};
  for (const key of CUSTOM_REGEX_KEYS) {
    const rawValue = values[key];
    if (typeof rawValue === "string") {
      result[key] = rawValue;
    }
  }
  return result;
};

export const getInitialEmojiValues = (
  stored?: Partial<EmojiNameRecord>,
  defaults: EmojiNameRecord = DEFAULT_EMOJI_NAMES,
): EmojiNameRecord => {
  const result = { ...defaults };

  const storedGithubPullRequest = stored?.githubPullRequest;
  const githubPullRequestFallback =
    storedGithubPullRequest !== undefined && storedGithubPullRequest.length > 0
      ? normalizeEmojiValue(storedGithubPullRequest, defaults.githubPullRequest)
      : defaults.githubPullRequest;
  for (const key of fallbackEmojiKeys) {
    result[key] = githubPullRequestFallback;
  }

  if (stored) {
    for (const key of EMOJI_KEYS) {
      const value = stored[key];
      if (value !== undefined && value.length > 0) {
        result[key] = normalizeEmojiValue(value, defaults[key]);
      }
    }
  }
  return result;
};
