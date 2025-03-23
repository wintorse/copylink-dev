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
    customWebsite1: "emojiName-custom-1",
    customWebsite2: "emojiName-custom-2",
    customWebsite3: "emojiName-custom-3",
    customWebsite4: "emojiName-custom-4",
    customWebsite5: "emojiName-custom-5",
  } as const;
}

export function getCustomRegexElements() {
  return {
    customRegex1: "regex-custom-1",
    customRegex2: "regex-custom-2",
    customRegex3: "regex-custom-3",
    customRegex4: "regex-custom-4",
    customRegex5: "regex-custom-5",
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
    customWebsite1: ":link:",
    customWebsite2: ":link:",
    customWebsite3: ":link:",
    customWebsite4: ":link:",
    customWebsite5: ":link:",
  } as const;
  return defaultEmojiNames[key];
}
