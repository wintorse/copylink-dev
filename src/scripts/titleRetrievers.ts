import { evaluateXPath } from "../utils/xpath";

/**
 * Retrieves the formatted title of the current document.
 *
 *  If the site is not supported, it falls back to returning `document.title`.
 *
 * @returns {string} The formatted title of the current document.
 */
export function getFormattedTitle(): string {
  switch (window.location.hostname) {
    case "docs.google.com":
      return getGoogleDocsTitle();
    case "github.com":
      return getGitHubTitle();
    case "app.asana.com":
      return getAsanaTitle();
  }
  if (window.location.hostname.includes("backlog")) {
    return getBacklogTitle();
  }
  if (document.body.id === "jira") {
    return getJiraTitle();
  }
  if (document.body.id.startsWith("Wac")) {
    return getMSOnlineTitle();
  }
  if (window.location.hostname.includes("redmine")) {
    return getRedmineTitle();
  }
  // if #footer > a has "Redmine" in it, return getRedmineTitle()
  if (document.querySelector("#footer > a")?.textContent?.includes("Redmine")) {
    return getRedmineTitle();
  }
  return document.title; // fallback
}

function getGoogleDocsTitle(): string {
  const titleElement = document.querySelector<HTMLInputElement>(
    "#docs-title-widget > input"
  );
  return titleElement ? titleElement.value : document.title;
}

function getGitHubTitle(): string {
  const titleXpath = `//*[@id="partial-discussion-header"]//h1/bdi`;
  const idXpath = `//*[@id="partial-discussion-header"]//h1/span`;
  const titleElement = evaluateXPath(titleXpath);
  const idElement = evaluateXPath(idXpath) as HTMLSpanElement;

  return titleElement && idElement
    ? `${idElement.textContent} ${titleElement.textContent}`
    : document.title;
}

function getAsanaTitle(): string {
  const xpath = `//*[@id="TaskPrintView"]/div[2]/div/div/div[2]/div/div[1]/div[1]//textarea`;
  const titleElement = evaluateXPath(xpath) as HTMLTextAreaElement;
  return titleElement ? titleElement.value : document.title;
}

function getBacklogTitle(): string {
  const titleElement = document.querySelector<HTMLDivElement>(
    "#summary > span.title-group__title-text > div"
  );
  return titleElement
    ? titleElement.textContent ?? document.title
    : document.title;
}

function getRedmineTitle(): string {
  const idElement = document.querySelector<HTMLHeadingElement>("#content > h2");
  const titleXpath = `//*[@id="content"]//h3`;
  const titleElement = evaluateXPath(titleXpath) as HTMLHeadingElement;
  return idElement?.textContent && titleElement?.textContent
    ? `${idElement.textContent}: ${titleElement.textContent}`
    : document.title;
}

function getJiraTitle(): string {
  const idElement = document.querySelector<HTMLAnchorElement>("#key-val");
  const titleElement =
    document.querySelector<HTMLHeadingElement>("#summary-val > h2");
  return idElement?.textContent && titleElement?.textContent
    ? `${idElement.textContent} ${titleElement.textContent}`
    : document.title;
}

function getMSOnlineTitle(): string {
  const titleElement =
    document.querySelector<HTMLDivElement>("#documentTitle")?.children[0];
  return titleElement && titleElement.textContent
    ? titleElement.textContent
    : document.title;
}
