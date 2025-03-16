import type { EmojiNames } from "../types/types";

/**
 * Retrieves the appropriate emoji name based on the current URL's hostname and pathname, or the document contents.
 * The emoji names are stored in the browser's local storage.
 *
 * @returns {Promise<string>} A promise that resolves to the corresponding emoji name.
 */
export function getEmojiName(): Promise<string> {
  function getDefaultEmojiName(key: keyof EmojiNames): string {
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
      redmineIssue: ":redmine_ticket:",
    };
    return defaultEmojiNames[key];
  }

  return new Promise((resolve) => {
    chrome.storage.local.get("emojiNames", function (data) {
      const emojiNames: Partial<EmojiNames> = data.emojiNames || {};
      let result = "";
      const hostname = window.location.hostname;
      const pathname = window.location.pathname;
      switch (hostname) {
        case "docs.google.com":
          switch (pathname.split("/")[1]) {
            case "spreadsheets":
              result =
                emojiNames.googleSheets || getDefaultEmojiName("googleSheets");
              break;
            case "document":
              result =
                emojiNames.googleDocs || getDefaultEmojiName("googleDocs");
              break;
            case "presentation":
              result =
                emojiNames.googleSlides || getDefaultEmojiName("googleSlides");
              break;
            default:
              result =
                emojiNames.googleDrive || getDefaultEmojiName("googleDrive");
          }
          break;
        case "drive.google.com":
          result = emojiNames.googleDrive || getDefaultEmojiName("googleDrive");
          break;
        case "github.com":
          switch (pathname.split("/")[3]) {
            case "pull":
              result =
                emojiNames.githubPullRequest ||
                getDefaultEmojiName("githubPullRequest");
              break;
            case "issues":
              result =
                emojiNames.githubIssue || getDefaultEmojiName("githubIssue");
              break;
            default:
              result = emojiNames.github || getDefaultEmojiName("github");
          }
          break;
        case "app.asana.com":
          result = emojiNames.asanaTask || getDefaultEmojiName("asanaTask");
          break;
      }
      if (hostname.includes("backlog")) {
        result = emojiNames.backlogIssue || getDefaultEmojiName("backlogIssue");
      } else if (
        hostname.includes("redmine") ||
        document.querySelector("#footer a")?.textContent?.includes("Redmine")
      ) {
        result = emojiNames.redmineIssue || getDefaultEmojiName("redmineIssue");
      } else if (document.body.id === "jira") {
        result = emojiNames.jiraIssue || getDefaultEmojiName("jiraIssue");
      } else if (document.querySelector("[id^='WacFrame']")) {
        if (document.querySelector("[id^='WacFrame_Excel']")) {
          result = emojiNames.excel || getDefaultEmojiName("excel");
        } else if (document.querySelector("[id^='WacFrame_Word']")) {
          result = emojiNames.word || getDefaultEmojiName("word");
        } else if (document.querySelector("[id^='WacFrame_PowerPoint']")) {
          result = emojiNames.powerpoint || getDefaultEmojiName("powerpoint");
        }
      }
      resolve(result);
    });
  });
}
