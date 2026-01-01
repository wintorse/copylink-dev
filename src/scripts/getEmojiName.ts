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
            resolve(emojiNames[websiteKey] || DEFAULT_EMOJI_NAMES[websiteKey]);
            return;
          }
        }

        // Fast-path: the extension's main use case (e.g. Google Sheets) should
        // resolve without doing any heavier DOM queries.
        if (hostname === "docs.google.com") {
          switch (pathParts[1]) {
            case "spreadsheets":
              resolve(
                emojiNames.googleSheets || DEFAULT_EMOJI_NAMES["googleSheets"]
              );
              return;
            case "document":
              resolve(
                emojiNames.googleDocs || DEFAULT_EMOJI_NAMES["googleDocs"]
              );
              return;
            case "presentation":
              resolve(
                emojiNames.googleSlides || DEFAULT_EMOJI_NAMES["googleSlides"]
              );
              return;
            default:
              resolve(
                emojiNames.googleDrive || DEFAULT_EMOJI_NAMES["googleDrive"]
              );
              return;
          }
        }

        if (hostname === "drive.google.com") {
          resolve(emojiNames.googleDrive || DEFAULT_EMOJI_NAMES["googleDrive"]);
          return;
        }

        if (hostname === "github.com") {
          switch (pathParts[3]) {
            case "pull":
              resolve(
                emojiNames.githubPullRequest ||
                  DEFAULT_EMOJI_NAMES["githubPullRequest"]
              );
              return;
            case "issues":
              resolve(
                emojiNames.githubIssue || DEFAULT_EMOJI_NAMES["githubIssue"]
              );
              return;
            default:
              resolve(emojiNames.github || DEFAULT_EMOJI_NAMES["github"]);
              return;
          }
        }

        if (hostname === "app.asana.com") {
          resolve(emojiNames.asanaTask || DEFAULT_EMOJI_NAMES["asanaTask"]);
          return;
        }

        if (hostname.includes("backlog")) {
          resolve(
            emojiNames.backlogIssue || DEFAULT_EMOJI_NAMES["backlogIssue"]
          );
          return;
        }

        if (hostname.includes("redmine")) {
          resolve(
            emojiNames.redmineIssue || DEFAULT_EMOJI_NAMES["redmineIssue"]
          );
          return;
        }

        const footerHasRedmine =
          document
            .querySelector("#footer a")
            ?.textContent?.includes("Redmine") || false;
        if (footerHasRedmine) {
          resolve(
            emojiNames.redmineIssue || DEFAULT_EMOJI_NAMES["redmineIssue"]
          );
          return;
        }

        if (document.body.id === "jira") {
          resolve(emojiNames.jiraIssue || DEFAULT_EMOJI_NAMES["jiraIssue"]);
          return;
        }

        if (document.title.includes("ReDoc")) {
          resolve(emojiNames.reDoc || DEFAULT_EMOJI_NAMES["reDoc"]);
          return;
        }

        if (document.querySelector(".redoc-wrap")) {
          resolve(emojiNames.reDoc || DEFAULT_EMOJI_NAMES["reDoc"]);
          return;
        }
        resolve("");
      }
    );
  });
