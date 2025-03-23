export const ValidCommands = {
  COPY_LINK: "copy-link",
  COPY_LINK_FOR_SLACK: "copy-link-for-slack",
  COPY_TITLE: "copy-title",
} as const;

export type Command = (typeof ValidCommands)[keyof typeof ValidCommands];

export type EmojiNames = {
  googleSheets: string;
  googleDocs: string;
  googleSlides: string;
  googleDrive: string;
  excel: string;
  word: string;
  powerpoint: string;
  github: string;
  githubPullRequest: string;
  githubIssue: string;
  jiraIssue: string;
  asanaTask: string;
  backlogIssue: string;
  redmineIssue: string;
  customWebsite1: string;
  customWebsite2: string;
  customWebsite3: string;
  customWebsite4: string;
  customWebsite5: string;
};

export type CustomRegexes = {
  customRegex1: string;
  customRegex2: string;
  customRegex3: string;
  customRegex4: string;
  customRegex5: string;
};
