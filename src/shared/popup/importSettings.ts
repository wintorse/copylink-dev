import { CUSTOM_REGEX_KEYS, EMOJI_KEYS } from "../constants";
import type { CustomRegexes, EmojiNameRecord } from "../../types/types";
import { buildCustomRegexes, buildEmojiNames } from "./emojiSettings";

export type ImportData = {
  emojiNames?: Partial<EmojiNameRecord>;
  customRegexes?: Partial<CustomRegexes>;
};

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === "object" && value !== null && !Array.isArray(value);

const validateStringRecord = <Key extends string>(
  value: unknown,
  keys: ReadonlyArray<Key>,
): Partial<Record<Key, string>> => {
  if (!isRecord(value)) {
    throw new Error("Settings must be an object");
  }
  const result: Partial<Record<Key, string>> = {};
  for (const [key, entry] of Object.entries(value)) {
    const knownKey = keys.find((candidate) => candidate === key);
    if (knownKey === undefined || typeof entry !== "string") {
      throw new Error("Invalid settings key or value");
    }
    result[knownKey] = entry;
  }
  return result;
};

export const parseImportedSettings = (text: string): ImportData => {
  const parsed: unknown = JSON.parse(text);
  if (
    !isRecord(parsed) ||
    !("emojiNames" in parsed || "customRegexes" in parsed)
  ) {
    throw new Error("Invalid import data format");
  }
  const data: ImportData = {};
  if ("emojiNames" in parsed) {
    data.emojiNames = buildEmojiNames(
      validateStringRecord(parsed.emojiNames, EMOJI_KEYS),
    );
  }
  if ("customRegexes" in parsed) {
    data.customRegexes = buildCustomRegexes(
      validateStringRecord(parsed.customRegexes, CUSTOM_REGEX_KEYS),
    );
  }
  return data;
};
