import type { CustomRegexes, EmojiNameRecord } from "../types/types";
import {
  DEFAULT_EMOJI_NAMES,
  CUSTOM_EMOJI_KEYS,
  CUSTOM_REGEX_KEYS,
} from "../types/constants";

type StorageData = {
  emojiNames?: Partial<EmojiNameRecord>;
  copylinkdevCustomRegexes?: Partial<CustomRegexes>;
};

/**
 * Retrieves the appropriate emoji name based on the current URL's hostname and pathname, or the document contents.
 * The emoji names are stored in the browser's local storage.
 *
 * @returns {Promise<string>} A promise that resolves to the corresponding emoji name.
 */
export const getEmojiName = (): Promise<string> =>
  new Promise((resolve) => {
    chrome.storage.local.get(
      ["emojiNames", "copylinkdevCustomRegexes"],
      (data: StorageData) => {
        const emojiNames: Partial<EmojiNameRecord> = data.emojiNames || {};
        const customRegexes: Partial<CustomRegexes> =
          data.copylinkdevCustomRegexes || {};
        let result = "";
        const href = window.location.href;
        const hostname = window.location.hostname;
        const pathname = window.location.pathname;

        for (let i = 0; i < CUSTOM_REGEX_KEYS.length; i++) {
          const websiteKey = CUSTOM_EMOJI_KEYS[i];
          const regexKey = CUSTOM_REGEX_KEYS[i];
          const regexPattern = customRegexes[regexKey];

          if (
            emojiNames[websiteKey] &&
            regexPattern &&
            new RegExp(regexPattern).test(href)
          ) {
            resolve(emojiNames[websiteKey] || DEFAULT_EMOJI_NAMES[websiteKey]);
            return;
          }
        }

        switch (hostname) {
          case "docs.google.com":
            switch (pathname.split("/")[1]) {
              case "spreadsheets":
                result =
                  emojiNames.googleSheets ||
                  DEFAULT_EMOJI_NAMES["googleSheets"];
                break;
              case "document":
                result =
                  emojiNames.googleDocs || DEFAULT_EMOJI_NAMES["googleDocs"];
                break;
              case "presentation":
                result =
                  emojiNames.googleSlides ||
                  DEFAULT_EMOJI_NAMES["googleSlides"];
                break;
              default:
                result =
                  emojiNames.googleDrive || DEFAULT_EMOJI_NAMES["googleDrive"];
            }
            break;
          case "drive.google.com":
            result =
              emojiNames.googleDrive || DEFAULT_EMOJI_NAMES["googleDrive"];
            break;
          case "github.com":
            switch (pathname.split("/")[3]) {
              case "pull":
                result =
                  emojiNames.githubPullRequest ||
                  DEFAULT_EMOJI_NAMES["githubPullRequest"];
                break;
              case "issues":
                result =
                  emojiNames.githubIssue || DEFAULT_EMOJI_NAMES["githubIssue"];
                break;
              default:
                result = emojiNames.github || DEFAULT_EMOJI_NAMES["github"];
            }
            break;
          case "app.asana.com":
            result = emojiNames.asanaTask || DEFAULT_EMOJI_NAMES["asanaTask"];
            break;
        }

        if (hostname.includes("backlog")) {
          result =
            emojiNames.backlogIssue || DEFAULT_EMOJI_NAMES["backlogIssue"];
        } else if (
          hostname.includes("redmine") ||
          document.querySelector("#footer a")?.textContent?.includes("Redmine")
        ) {
          result =
            emojiNames.redmineIssue || DEFAULT_EMOJI_NAMES["redmineIssue"];
        } else if (document.body.id === "jira") {
          result = emojiNames.jiraIssue || DEFAULT_EMOJI_NAMES["jiraIssue"];
        } else if (
          document.title.includes("ReDoc") ||
          document.querySelector(".redoc-wrap")
        ) {
          result = emojiNames.reDoc || DEFAULT_EMOJI_NAMES["reDoc"];
        }

        resolve(result);
      }
    );
  });
