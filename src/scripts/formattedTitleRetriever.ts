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
    case "drive.google.com":
      return getGoogleDriveTitle();
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
  if (window.location.hostname.includes("redmine")) {
    return getRedmineTitle();
  }
  if (document.querySelector("#footer a")?.textContent?.includes("Redmine")) {
    return getRedmineTitle();
  }
  return document.title; // fallback
}

function getGoogleDocsTitle(): string {
  const titleElement = document.querySelector<HTMLInputElement>(
    "#docs-title-widget input"
  );
  return titleElement ? titleElement.value : document.title;
}

function getGoogleDriveTitle(): string {
  // remove the " - Google Drive" part from document.title(in any language)
  return document.title.replace(/\s*-\s*[^-]+$/, "");
}

function getGitHubTitle(): string {
  const titleElement = document.querySelector<HTMLElement>("h1 bdi");
  const idElement = document.querySelector<HTMLSpanElement>("h1 span");
  return titleElement && idElement
    ? `${idElement.textContent} ${titleElement.textContent}`
    : document.title;
}

function getAsanaTitle(): string {
  const element = document.getElementById("TaskPrintView");
  return element?.getAttribute("aria-label") || document.title;
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
  const idElement = document.querySelector<HTMLHeadingElement>("#content h2");
  const titleElement =
    document.querySelector<HTMLHeadingElement>("#content h3");
  return idElement?.textContent && titleElement?.textContent
    ? `${idElement.textContent}: ${titleElement.textContent}`
    : document.title;
}

function getJiraTitle(): string {
  const idElement = document.querySelector<HTMLAnchorElement>("#key-val");
  const titleElement =
    document.querySelector<HTMLHeadingElement>("#summary-val h2");
  return idElement?.textContent && titleElement?.textContent
    ? `${idElement.textContent} ${titleElement.textContent}`
    : document.title;
}
