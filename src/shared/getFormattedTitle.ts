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
  const idElement = document.querySelector<HTMLSpanElement>(
    "h1 > *:nth-child(2)",
  );
  return titleElement && idElement
    ? `${idElement.textContent} ${titleElement.textContent}`
    : document.title;
};

const getAsanaTitle = (): string => {
  const element = document.getElementById("TaskPrintView");
  return element?.getAttribute("aria-label") || document.title;
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
  return idElement?.textContent && titleElement?.textContent
    ? `${idElement.textContent}: ${titleElement.textContent}`
    : document.title;
};

const getJiraTitle = (): string => {
  const idElement = document.querySelector<HTMLAnchorElement>("#key-val");
  const titleElement =
    document.querySelector<HTMLHeadingElement>("#summary-val h2");
  return idElement?.textContent && titleElement?.textContent
    ? `${idElement.textContent} ${titleElement.textContent}`
    : document.title;
};

const getReDocTitle = (): string => {
  // Find the active label element (class contains 'active')
  const activeLabel = document.querySelector<HTMLLabelElement>(
    "label[class*='active']",
  );

  if (activeLabel) {
    // Get all span elements within the active label
    const spans = activeLabel.querySelectorAll("span");
    // Return the textContent of the second span (index 1)
    if (spans.length >= 2) {
      return spans[1].textContent?.trim() || document.title;
    }
  }

  // Fallback if no active label or second span is found
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
};
