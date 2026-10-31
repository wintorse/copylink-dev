import {
  type GitHubPullRequestStatus,
  getGitHubPullRequestStatus,
} from "./githubPullRequestStatus";

export type PageContext = {
  href: string;
  hostname: string;
  pathname: string;
  documentBodyId?: string;
  githubPullRequestStatus?: GitHubPullRequestStatus;
  hasRedmineFooter?: boolean;
  hasRedocCredit?: boolean;
};

export const buildPageContext = (): PageContext => ({
  href: window.location.href,
  hostname: window.location.hostname,
  pathname: window.location.pathname,
  documentBodyId: document.body.id,
  githubPullRequestStatus: getGitHubPullRequestStatus(),
  hasRedmineFooter: Array.from(document.querySelectorAll("#footer a")).some(
    (link) =>
      link.textContent?.toLowerCase().includes("redmine") === true ||
      link.textContent?.toLowerCase().includes("redmica") === true,
  ),
  // ReDoc v2 and v3 share the same attribution URL.
  hasRedocCredit:
    document.querySelector('a[href="https://redocly.com/redoc/"]') !== null,
});
