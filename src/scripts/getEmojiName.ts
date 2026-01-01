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
        const getEmoji = (key: keyof EmojiNameRecord) =>
          emojiNames[key] ?? DEFAULT_EMOJI_NAMES[key];
        const href = window.location.href;
        const hostname = window.location.hostname;
        const pathname = window.location.pathname;
        const pathParts = pathname.split("/");

        for (const [index, regexKey] of CUSTOM_REGEX_KEYS.entries()) {
          const websiteKey = CUSTOM_EMOJI_KEYS[index];
          const regexPattern = customRegexes[regexKey];

          if (
            emojiNames[websiteKey] &&
            regexPattern &&
            new RegExp(regexPattern).test(href)
          ) {
            resolve(getEmoji(websiteKey));
            return;
          }
        }

        // the extension's main use case (e.g. Google Workspaces and GitHub) should
        // resolve without doing any heavier DOM queries.
        if (hostname === "docs.google.com") {
          switch (pathParts[1]) {
            case "spreadsheets":
              resolve(getEmoji("googleSheets"));
              return;
            case "document":
              resolve(getEmoji("googleDocs"));
              return;
            case "presentation":
              resolve(getEmoji("googleSlides"));
              return;
            default:
              resolve(getEmoji("googleDrive"));
              return;
          }
        }

        if (hostname === "drive.google.com") {
          resolve(getEmoji("googleDrive"));
          return;
        }

        if (hostname === "github.com") {
          switch (pathParts[3]) {
            case "pull":
              resolve(getEmoji("githubPullRequest"));
              return;
            case "issues":
              resolve(getEmoji("githubIssue"));
              return;
            default:
              resolve(getEmoji("github"));
              return;
          }
        }

        if (hostname === "app.asana.com") {
          resolve(getEmoji("asanaTask"));
          return;
        }

        if (hostname.includes("backlog")) {
          resolve(getEmoji("backlogIssue"));
          return;
        }

        if (
          hostname.includes("redmine") ||
          document.querySelector("#footer a")?.textContent?.includes("Redmine")
        ) {
          resolve(getEmoji("redmineIssue"));
          return;
        }

        if (document.body.id === "jira") {
          resolve(getEmoji("jiraIssue"));
          return;
        }

        if (
          document.title.includes("ReDoc") ||
          document.querySelector(".redoc-wrap")
        ) {
          resolve(getEmoji("reDoc"));
          return;
        }
        resolve("");
      }
    );
  });
