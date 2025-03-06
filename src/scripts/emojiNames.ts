import type { EmojiNames } from "../types/types";
/**
 * Retrieves the appropriate emoji name based on the current URL's hostname and pathname, or the document body ID.
 * The emoji names are stored in the browser's local storage under the key "emojiNames".
 *
 * @returns {Promise<string>} A promise that resolves to the corresponding emoji name.
 */
export function getEmojiName(): Promise<string> {
  const defaultEmojiNames: EmojiNames = {
    googleSheets: ":google_sheets:",
    googleDocs: ":google_docs:",
    googleSlides: ":google_slides:",
    googleDrive: ":google_drive_2:",
    excel: ":excel:",
    word: ":word:",
    powerpoint: ":powerpoint:",
    github: ":github:",
    githubPullRequest: ":open_pull_request:",
    githubIssue: ":open_issue:",
    jiraIssue: ":jira:",
    asanaTask: ":asana:",
    backlogIssue: ":backlog:",
    redmineTicket: ":redmine_ticket:",
  } as const;
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
      } else if (
        hostname.includes("redmine") ||
        document.querySelector("#footer a")?.textContent?.includes("Redmine")
      ) {
        result = emojiNames.redmineTicket;
      } else if (document.body.id === "jira") {
        result = emojiNames.jiraIssue;
      } else if (document.querySelector("[id^='WacFrame']")) {
        if (document.querySelector("[id^='WacFrame_Excel']")) {
          result = emojiNames.excel;
        } else if (document.querySelector("[id^='WacFrame_Word']")) {
          result = emojiNames.word;
        } else if (document.querySelector("[id^='WacFrame_PowerPoint']")) {
          result = emojiNames.powerpoint;
        }
      }
      resolve(result);
    });
  });
}
