/**
 * Retrieves the formatted title of the current document.
 *
 * If the site is not supported, it falls back to returning `document.title`.
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
  if (
    document.title.includes("ReDoc") ||
    document.querySelector(".redoc-wrap")
  ) {
    return getReDocTitle();
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
  const titleElement =
    document.querySelector<HTMLElement>("h1 > *:first-child");
  const idElement = document.querySelector<HTMLSpanElement>(
    "h1 > *:nth-child(2)"
  );
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

function getReDocTitle(): string {
  const hash = window.location.hash.slice(1);

  if (!hash) {
    // return the main title
    return document.querySelector("h1")?.textContent || document.title;
  }

  // Find an a tag that has the value of the anchor in its href attribute.
  // Looking for href="#xxx" or href="/path#xxx"
  const anchor = document.querySelector(
    `a[href="#${hash}"], a[href*="#${hash}"]`
  );

  if (!anchor) {
    return document.title;
  }

  // Find the parent h2 tag
  let parent = anchor.parentElement;
  while (parent && parent.tagName !== "H2") {
    parent = parent.parentElement;
  }

  if (parent && parent.tagName === "H2") {
    return parent.textContent.trim();
  }

  // Fallback if no h2 tag is found
  return document.title;
}
