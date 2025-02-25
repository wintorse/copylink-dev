import { defaultEmojiNames } from "../types/constants";
import type { EmojiNames } from "../types/types";
/**
 * Retrieves the appropriate emoji name based on the current URL's hostname and pathname, or the document body ID.
 * The emoji names are stored in the browser's local storage under the key "emojiNames".
 *
 * @returns {Promise<string>} A promise that resolves to the corresponding emoji name.
 */
export function getEmojiName(): Promise<string> {
  return new Promise((resolve) => {
    chrome.storage.local.get("emojiNames", function (data) {
      const emojiNames: EmojiNames = data.emojiNames || {
        ...defaultEmojiNames,
      };
      let result = "";
      const hostname = window.location.hostname;
      const pathname = window.location.pathname;
      switch (hostname) {
        case "docs.google.com":
          switch (pathname.split("/")[1]) {
            case "spreadsheets":
              result = emojiNames.googleSheets;
              break;
            case "document":
              result = emojiNames.googleDocs;
              break;
            case "presentation":
              result = emojiNames.googleSlides;
              break;
            default:
              result = emojiNames.googleDrive;
          }
          break;
        case "drive.google.com":
          result = emojiNames.googleDrive;
          break;
        case "github.com":
          switch (pathname.split("/")[3]) {
            case "pull":
              result = emojiNames.githubPullRequest;
              break;
            case "issues":
              result = emojiNames.githubIssue;
              break;
            default:
              result = emojiNames.github;
          }
          break;
        case "app.asana.com":
          result = emojiNames.asanaTask;
          break;
      }
      if (hostname.includes("backlog")) {
        result = emojiNames.backlogIssue;
      } else if (hostname.includes("redmine")) {
        result = emojiNames.redmineTicket;
      } else if (document.body.id === "jira") {
        result = emojiNames.jiraIssue;
      } else if (
        document
          .querySelector<HTMLDivElement>("body > div:first-child")
          ?.id.includes("WAC")
      ) {
        const iframeId = document.querySelector<HTMLIFrameElement>(
          "body > div:first-child > div:first-child > iframe"
        )?.id;
        if (iframeId?.includes("Excel")) {
          result = emojiNames.excel;
        } else if (iframeId?.includes("Word")) {
          result = emojiNames.word;
        } else if (iframeId?.includes("PowerPoint")) {
          result = emojiNames.powerpoint;
        }
      }
      resolve(result);
    });
  });
}
