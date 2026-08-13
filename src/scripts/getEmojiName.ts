import type { CustomRegexes, EmojiNameRecord } from "../types/types";
import { type PageContext, resolveEmojiName } from "../shared/emojiResolver";
import { DEFAULT_EMOJI_NAMES } from "../shared/constants";
import { getGitHubPullRequestStatus } from "../shared/githubPullRequestStatus";

type StorageData = {
  emojiNames?: Partial<EmojiNameRecord>;
  copylinkdevCustomRegexes?: Partial<CustomRegexes>;
};

const buildPageContext = (): PageContext => ({
  href: window.location.href,
  hostname: window.location.hostname,
  pathname: window.location.pathname,
  documentBodyId: document.body.id,
  documentTitle: document.title,
  githubPullRequestStatus: getGitHubPullRequestStatus(),
  hasRedmineFooter:
    document.querySelector("#footer")?.textContent?.includes("Redmine") ??
    false,
  hasRedocWrap: !!document.querySelector(".redoc-wrap"),
});

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
