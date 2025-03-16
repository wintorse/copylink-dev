import type { EmojiNames } from "./types";

export function getEmojiElements() {
  return {
    googleSheets: "emojiName-google-sheets",
    googleDocs: "emojiName-google-docs",
    googleSlides: "emojiName-google-slides",
    googleDrive: "emojiName-google-drive",
    excel: "emojiName-excel",
    word: "emojiName-word",
    powerpoint: "emojiName-powerpoint",
    github: "emojiName-github",
    githubPullRequest: "emojiName-github-pull-request",
    githubIssue: "emojiName-github-issue",
    jiraIssue: "emojiName-jira-issue",
    asanaTask: "emojiName-asana-task",
    backlogIssue: "emojiName-backlog-issue",
    redmineIssue: "emojiName-redmine-issue",
  } as const;
}

export function getDefaultEmojiName(key: keyof EmojiNames): string {
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
  } as const;
  return defaultEmojiNames[key];
}
