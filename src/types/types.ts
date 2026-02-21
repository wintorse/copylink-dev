import type {
  CUSTOM_REGEX_KEYS,
  EMOJI_KEYS,
  VALID_COMMANDS,
} from "../shared/constants";

export type Command = (typeof VALID_COMMANDS)[keyof typeof VALID_COMMANDS];

export type EmojiKeys = (typeof EMOJI_KEYS)[number];

export type EmojiName = `:${string}:`;

export type EmojiNameRecord = { [key in EmojiKeys]: EmojiName };

export type EmojiElementRecord = { [key in EmojiKeys]: `emojiName-${string}` };

export type CustomRegexKeys = (typeof CUSTOM_REGEX_KEYS)[number];

export type CustomRegexes = { [key in CustomRegexKeys]: string };
