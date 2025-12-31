import {
  VALID_COMMANDS,
  EMOJI_KEYS,
  CUSTOM_REGEX_KEYS,
} from "../types/constants";

export type Command = (typeof VALID_COMMANDS)[keyof typeof VALID_COMMANDS];

export type EmojiKeys = (typeof EMOJI_KEYS)[number];

export type EmojiNames = { [key in EmojiKeys]: string };

export type CustomRegexKeys = (typeof CUSTOM_REGEX_KEYS)[number];

export type CustomRegexes = { [key in CustomRegexKeys]: string };
