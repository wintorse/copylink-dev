import {
  type GitHubPullRequestStatus,
  getGitHubPullRequestStatus,
} from "./githubPullRequestStatus";

export type PageContext = {
  href: string;
  hostname: string;
  pathname: string;
  documentBodyId?: string;
  documentTitle?: string;
  githubPullRequestStatus?: GitHubPullRequestStatus;
  hasRedmineFooter?: boolean;
  hasRedocWrap?: boolean;
};

export const buildPageContext = (): PageContext => ({
  href: window.location.href,
  hostname: window.location.hostname,
  pathname: window.location.pathname,
  documentBodyId: document.body.id,
  documentTitle: document.title,
  githubPullRequestStatus: getGitHubPullRequestStatus(),
  hasRedmineFooter: Array.from(document.querySelectorAll("#footer a")).some(
    (link) => link.textContent?.includes("Redmine") === true,
  ),
  hasRedocWrap: document.querySelector(".redoc-wrap") !== null,
});
