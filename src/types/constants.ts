import type {
  EmojiKeys,
  EmojiNameRecord,
  EmojiElementRecord,
  CustomRegexes,
} from "./types";

export const VALID_COMMANDS = {
  COPY_LINK: "copy-link",
  COPY_LINK_FOR_SLACK: "copy-link-for-slack",
  COPY_TITLE: "copy-title",
} as const;

export const EMOJI_KEYS = [
  "googleSheets",
  "googleDocs",
  "googleSlides",
  "googleDrive",
  "github",
  "githubPullRequest",
  "githubIssue",
  "jiraIssue",
  "asanaTask",
  "backlogIssue",
  "redmineIssue",
  "reDoc",
  "customWebsite1",
  "customWebsite2",
  "customWebsite3",
  "customWebsite4",
  "customWebsite5",
] as const;

export const CUSTOM_EMOJI_KEYS = [
  "customWebsite1",
  "customWebsite2",
  "customWebsite3",
  "customWebsite4",
  "customWebsite5",
] as const satisfies EmojiKeys[];

export const CUSTOM_REGEX_KEYS = [
  "customRegex1",
  "customRegex2",
  "customRegex3",
  "customRegex4",
  "customRegex5",
] as const;

export const DEFAULT_EMOJI_NAMES: EmojiNameRecord = {
  googleSheets: ":google_sheets:",
  googleDocs: ":google_docs:",
  googleSlides: ":google_slides:",
  googleDrive: ":google_drive_2:",
  github: ":github:",
  githubPullRequest: ":open_pull_request:",
  githubIssue: ":open_issue:",
  jiraIssue: ":jira:",
  asanaTask: ":asana:",
  backlogIssue: ":backlog:",
  redmineIssue: ":redmine_ticket:",
  reDoc: ":swagger:",
  customWebsite1: ":link:",
  customWebsite2: ":link:",
  customWebsite3: ":link:",
  customWebsite4: ":link:",
  customWebsite5: ":link:",
} as const;

const EMOJI_ELEMENT_RECORD: EmojiElementRecord = {
  googleSheets: "emojiName-google-sheets",
  googleDocs: "emojiName-google-docs",
  googleSlides: "emojiName-google-slides",
  googleDrive: "emojiName-google-drive",
  github: "emojiName-github",
  githubPullRequest: "emojiName-github-pull-request",
  githubIssue: "emojiName-github-issue",
  jiraIssue: "emojiName-jira-issue",
  asanaTask: "emojiName-asana-task",
  backlogIssue: "emojiName-backlog-issue",
  redmineIssue: "emojiName-redmine-issue",
  reDoc: "emojiName-reDoc",
  customWebsite1: "emojiName-custom-1",
  customWebsite2: "emojiName-custom-2",
  customWebsite3: "emojiName-custom-3",
  customWebsite4: "emojiName-custom-4",
  customWebsite5: "emojiName-custom-5",
} as const;

export function getEmojiElements(): EmojiElementRecord {
  return EMOJI_ELEMENT_RECORD;
}

export function getCustomRegexElements(): CustomRegexes {
  return {
    customRegex1: "regex-custom-1",
    customRegex2: "regex-custom-2",
    customRegex3: "regex-custom-3",
    customRegex4: "regex-custom-4",
    customRegex5: "regex-custom-5",
  } as const;
}

export function getDefaultEmojiName(key: EmojiKeys): string {
  return DEFAULT_EMOJI_NAMES[key];
}
