import type { CustomRegexes, EmojiNameRecord } from "../types/types";
import { DEFAULT_EMOJI_NAMES } from "../shared/constants";
import { buildPageContext } from "../shared/pageContext";
import { resolveEmojiName } from "../shared/emojiResolver";

type StorageData = {
  emojiNames?: Partial<EmojiNameRecord>;
  copylinkdevCustomRegexes?: Partial<CustomRegexes>;
};

/**
 * Retrieves the appropriate emoji name based on the current URL or document snapshot.
 * Platform dependencies (storage, DOM, i18n) are handled in this wrapper; the
 * core resolution logic lives in `shared/emojiResolver`.
 * @returns Resolved emoji name.
 */
export const getEmojiName = (): Promise<string> =>
  new Promise((resolve) => {
    chrome.storage.local.get(
      ["emojiNames", "copylinkdevCustomRegexes"],
      (data: StorageData) => {
        const ctx = buildPageContext();
        const name = resolveEmojiName(ctx, {
          emojiNames: data.emojiNames,
          customRegexes: data.copylinkdevCustomRegexes,
          defaults: DEFAULT_EMOJI_NAMES,
        });
        resolve(name);
      },
    );
  });
