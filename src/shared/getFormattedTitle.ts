import { buildPageContext } from "./pageContext";
import { detectSite } from "./siteDetection";

const getGoogleDocsTitle = (): string => {
  const titleElement = document.querySelector<HTMLInputElement>(
    "#docs-title-widget input",
  );
  return titleElement ? titleElement.value : document.title;
};

const getGoogleDriveTitle = (): string => {
  // remove the " - Google Drive" part from document.title(in any language)
  return document.title.replace(/\s*-\s*[^-]+$/, "");
};

const getGitHubTitle = (): string => {
  const titleElement =
    document.querySelector<HTMLElement>("h1 > *:first-child");
  const title = titleElement?.textContent?.trim();
  const idMatch = window.location.pathname.match(/\/(?:pull|issues)\/(\d+)/);
  const id = idMatch ? `#${idMatch[1]}` : undefined;
  return title !== undefined && title !== "" && id !== undefined
    ? `${id} ${title}`
    : document.title;
};

const getAsanaTitle = (): string => {
  const element = document.getElementById("TaskPrintView");
  return element?.getAttribute("aria-label") ?? document.title;
};

const getBacklogTitle = (): string => {
  const titleElement = document.querySelector<HTMLDivElement>(
    "#summary > span.title-group__title-text > div",
  );
  return titleElement
    ? (titleElement.textContent ?? document.title)
    : document.title;
};

const getRedmineTitle = (): string => {
  const idElement = document.querySelector<HTMLHeadingElement>("#content h2");
  const titleElement =
    document.querySelector<HTMLHeadingElement>("#content h3");
  const issueId = idElement?.textContent;
  const issueTitle = titleElement?.textContent;
  return issueId !== null &&
    issueId !== undefined &&
    issueTitle !== null &&
    issueTitle !== undefined
    ? `${issueId}: ${issueTitle}`
    : document.title;
};

const getJiraTitle = (): string => {
  const idElement = document.querySelector<HTMLAnchorElement>("#key-val");
  const titleElement =
    document.querySelector<HTMLHeadingElement>("#summary-val h2");
  const issueId = idElement?.textContent;
  const issueTitle = titleElement?.textContent;
  return issueId !== null &&
    issueId !== undefined &&
    issueTitle !== null &&
    issueTitle !== undefined
    ? `${issueId} ${issueTitle}`
    : document.title;
};

const getReDocTitle = (): string => {
  // ReDoc v3 separates the menu title from the HTTP method badge.
  const activeMenuItemLabel = document
    .querySelector<HTMLElement>('[data-active="true"] [data-text]')
    ?.textContent?.trim();
  if (activeMenuItemLabel !== undefined && activeMenuItemLabel !== "") {
    return activeMenuItemLabel;
  }

  // ReDoc v2 uses the second span of the active label for operation titles.
  const activeLabel = document.querySelector<HTMLLabelElement>(
    "label[class*='active']",
  );

  if (activeLabel) {
    const spans = activeLabel.querySelectorAll("span");
    if (spans.length >= 2) {
      return spans[1].textContent?.trim() || document.title;
    }
  }

  return document.title;
};

/**
 * Retrieves the formatted title of the current document.
 *
 * If the site is not supported, it falls back to returning `document.title`.
 *
 * @returns {string} The formatted title of the current document.
 */
export const getFormattedTitle = (): string => {
  const ctx = buildPageContext();
  switch (detectSite(ctx)) {
    case "googleSheets":
    case "googleDocs":
    case "googleSlides":
      return getGoogleDocsTitle();
    case "googleDrive":
      return ctx.hostname === "docs.google.com"
        ? getGoogleDocsTitle()
        : getGoogleDriveTitle();
    case "github":
    case "githubPullRequest":
    case "githubIssue":
      return getGitHubTitle();
    case "asanaTask":
      return getAsanaTitle();
    case "backlogIssue":
      return getBacklogTitle();
    case "jiraIssue":
      return getJiraTitle();
    case "redmineIssue":
      return getRedmineTitle();
    case "reDoc":
      return getReDocTitle();
    case undefined:
      return document.title;
  }
};
