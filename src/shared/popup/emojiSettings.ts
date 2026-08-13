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
      // verify that the regex is valid by attempting to create a RegExp object
      new RegExp(rawValue);
      result[key] = rawValue;
    }
  }
  return result;
};

export const getInitialEmojiValues = (
  stored?: Partial<EmojiNameRecord>,
): EmojiNameRecord => {
  const defaults = DEFAULT_EMOJI_NAMES;
  const result = { ...defaults };
  if (!stored) {
    return result;
  }

  const githubPullRequestFallback =
    stored.githubPullRequest ?? defaults.githubPullRequest;
  for (const key of fallbackEmojiKeys) {
    result[key] = githubPullRequestFallback;
  }

  for (const key of EMOJI_KEYS) {
    const value = stored[key];
    if (value !== undefined) {
      result[key] = normalizeEmojiValue(value, defaults[key]);
    }
  }

  return result;
};
