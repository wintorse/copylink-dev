import type { PageContext } from "./pageContext";

export type SupportedSite =
  | "googleSheets"
  | "googleDocs"
  | "googleSlides"
  | "googleDrive"
  | "github"
  | "githubPullRequest"
  | "githubIssue"
  | "asanaTask"
  | "backlogIssue"
  | "jiraIssue"
  | "redmineIssue"
  | "reDoc";

export const detectSite = (ctx: PageContext): SupportedSite | undefined => {
  const parts = ctx.pathname.split("/");
  switch (ctx.hostname) {
    case "docs.google.com":
      switch (parts[1]) {
        case "spreadsheets":
          return "googleSheets";
        case "document":
          return "googleDocs";
        case "presentation":
          return "googleSlides";
        default:
          return "googleDrive";
      }
    case "drive.google.com":
      return "googleDrive";
    case "github.com":
      switch (parts[3]) {
        case "pull":
          return "githubPullRequest";
        case "issues":
          return "githubIssue";
        default:
          return "github";
      }
    case "app.asana.com":
      return "asanaTask";
  }
  if (ctx.hostname.includes("backlog")) {
    return "backlogIssue";
  }
  if (ctx.documentBodyId === "jira") {
    return "jiraIssue";
  }
  if (ctx.hostname.includes("redmine") || ctx.hasRedmineFooter === true) {
    return "redmineIssue";
  }
  if (ctx.hasRedocCredit === true) {
    return "reDoc";
  }
  return undefined;
};
