/**
 * Copies text or a link to the clipboard based on the provided argument.
 *
 * @param {string} args - The action to perform. Can be one of the following:
 *   - "copy-title": Copies the formatted title to the clipboard.
 *   - "copy-link": Copies a text link to the clipboard.
 *   - "copy-link-for-slack": Copies a text link with a Slack emoji name to the clipboard.
 *
 * The function also displays a toast message indicating the success or failure of the copy operation.
 */
export async function copyTextLink(command: string) {
  // MARK: main
  const title = _getFormattedTitle();
  const url = document.URL;
  const html = `<a href="${url}">${title}</a>`;

  const t = (key: string): string => chrome.i18n.getMessage(key);

  // Copy the title only to the clipboard
  if (command === "copy-title") {
    navigator.clipboard
      .writeText(title)
      .then(() => {
        _showToast(t("copyTitleSuccess"));
      })
      .catch((err) => {
        console.error("Failed to copy title to clipboard", err);
        _showToast(t("copyTitleFailure"));
      });
    return;
  }

  // Writing plain text and HTML to the clipboard allows you to use it as a text link.
  if (command === "copy-link") {
    navigator.clipboard
      .write([
        new ClipboardItem({
          "text/plain": new Blob([title], { type: "text/plain" }),
          "text/html": new Blob([html], { type: "text/html" }),
        }),
      ])
      .then(() => {
        _showToast(t("copyLinkSuccess"));
      })
      .catch((err) => {
        console.error("Failed to copy link to clipboard", err);
        _showToast(t("copyLinkFailure"));
      });
  }

  const emojiName = await _getEmojiName();

  // Copy plain text and HTML with Slack emoji name to clipboard
  if (command === "copy-link-for-slack") {
    const html = `${emojiName}&nbsp;<a href="${url}">${title}</a>`;
    navigator.clipboard
      .write([
        new ClipboardItem({
          "text/plain": new Blob([title], { type: "text/plain" }),
          "text/html": new Blob([html], { type: "text/html" }),
        }),
      ])
      .then(() => {
        _showToast(t("copyLinkSuccess"));
      })
      .catch((err) => {
        console.error("Failed to copy link to clipboard", err);
        _showToast(t("copyLinkFailure"));
      });
  }

  // MARK: get title
  /**
   * Retrieves the formatted title of the current document.
   *
   *  If the site is not supported, it falls back to returning `document.title`.
   *
   * @returns {string} The title of the current document.
   */
  function _getFormattedTitle(): string {
    switch (window.location.hostname) {
      case "docs.google.com":
        return _getGoogleDocsTitle();
      case "github.com":
        return _getGitHubTitle();
      case "app.asana.com":
        return _getAsanaTitle();
    }
    if (window.location.hostname.includes("backlog")) {
      return _getBacklogTitle();
    }
    if (window.location.hostname.includes("redmine")) {
      return _getRedmineTitle();
    }
    if (document.body.id === "jira") {
      return _getJiraTitle();
    }
    return document.title; // fallback

    /**
     * Retrieves the title of a Google Docs/Sheets/Slides document.
     *
     * @returns {string} The title of the Google Docs/Sheets/Slides document.
     */
    function _getGoogleDocsTitle(): string {
      const titleInputElement = document.querySelector<HTMLInputElement>(
        "#docs-title-widget > input"
      );
      if (titleInputElement) {
        return titleInputElement.value;
      }
      return document.title;
    }

    /**
     * Retrieves the title of a GitHub issue or pull request from the page.
     *
     * @returns {string} The title of the GitHub issue or pull request, or the document's title if the specific elements are not found.
     */
    function _getGitHubTitle(): string {
      const titleBdiElement = document.querySelector(
        "#partial-discussion-header > div.gh-header-show > div > h1 > bdi"
      );
      const idSpanElement = document.querySelector(
        "#partial-discussion-header > div.gh-header-show > div > h1 > span"
      );
      if (titleBdiElement && idSpanElement) {
        return titleBdiElement.textContent + " " + idSpanElement.textContent;
      }
      return document.title;
    }

    /**
     * Retrieves the title of an Asana task.
     *
     * @returns {string} The title of the Asana task.
     */
    function _getAsanaTitle(): string {
      const titleTextareaElement = document.querySelector<HTMLTextAreaElement>(
        "#TaskPrintView > div.UploadDropTargetAttachmentWrappingTextEditor.TaskPaneBody-attachmentDropTarget > div.DynamicBorderScrollable.DynamicBorderScrollable--canScrollDown.TaskPaneBody--scrollable > div > div > div.TaskPaneBody-main.Stack.Stack--align-stretch.Stack--direction-column.Stack--display-block.Stack--justify-start > div.TaskPane-resizeListenerContainer > div.TitleInput.TaskPaneTitle.Stack.Stack--align-start.Stack--direction-row.Stack--display-block.Stack--justify-start > div > textarea"
      );
      if (titleTextareaElement) {
        return titleTextareaElement.value;
      }
      return document.title;
    }

    /**
     * Retrieves the title of a Backlog issue.
     *
     * @returns {string} The title of the Backlog issue.
     */
    function _getBacklogTitle(): string {
      const titleDivElement = document.querySelector<HTMLDivElement>(
        "#summary > span.title-group__title-text > div"
      );
      if (titleDivElement) {
        return titleDivElement.textContent ?? document.title;
      }
      return document.title;
    }

    /**
     * Retrieves the title of a Redmine ticket.
     * @returns {string} The title of the Redmine ticket.
     */
    function _getRedmineTitle(): string {
      const idHeadingElement =
        document.querySelector<HTMLHeadingElement>("#content > h2");
      const titleHeadingElement = document.querySelector<HTMLHeadingElement>(
        "#content > div.issue.tracker-19.status-1.priority-2.priority-default.details > div.subject > div > h3"
      );
      if (idHeadingElement?.textContent && titleHeadingElement?.textContent) {
        return (
          idHeadingElement.textContent + ": " + titleHeadingElement.textContent
        );
      }
      return document.title;
    }

    /**
     * Retrieves the title of a Jira issue.
     *
     * @returns {string} The title of the Jira issue.
     */
    function _getJiraTitle(): string {
      const idListElement =
        document.querySelector<HTMLAnchorElement>("#key-val");
      const titleHeadingElement =
        document.querySelector<HTMLHeadingElement>("#summary-val > h2");
      if (idListElement?.textContent && titleHeadingElement?.textContent) {
        return (
          idListElement.textContent + " " + titleHeadingElement.textContent
        );
      }
      return document.title;
    }
  }

  type EmojiNames = {
    googleSheets: string;
    googleDocs: string;
    googleSlides: string;
    googleDrive: string;
    github: string;
    githubPullRequest: string;
    githubIssue: string;
    jiraIssue: string;
    asanaTask: string;
    backlogIssue: string;
    redmineTicket: string;
  };

  const defaultEmojiNames: EmojiNames = {
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
    redmineTicket: ":redmine_ticket:",
  };

  // MARK: get emoji name
  /**
   * Retrieves the appropriate emoji name based on the current URL's hostname and pathname, or the document body ID.
   * The emoji names are stored in the browser's local storage under the key "emojiNames".
   *
   * @returns {Promise<string>} A promise that resolves to the corresponding emoji name.
   */
  function _getEmojiName(): Promise<string> {
    return new Promise((resolve) => {
      chrome.storage.local.get("emojiNames", function (data) {
        const emojiNames: EmojiNames = data.emojiNames || {
          ...defaultEmojiNames,
        };
        let result = "";
        const hostname = window.location.hostname;
        const pathname = window.location.pathname;
        switch (window.location.hostname) {
          case "docs.google.com":
            switch (pathname.split("/")[1]) {
              case "spreadsheets":
                result = emojiNames.googleSheets;
                break;
              case "document":
                result = emojiNames.googleDocs;
                break;
              case "presentation":
                result = emojiNames.googleSlides;
                break;
              default:
                result = emojiNames.googleDrive;
            }
            break;
          case "drive.google.com":
            result = emojiNames.googleDrive;
            break;
          case "github.com":
            switch (pathname.split("/")[3]) {
              case "pull":
                result = emojiNames.githubPullRequest;
                break;
              case "issues":
                result = emojiNames.githubIssue;
                break;
              default:
                result = emojiNames.github;
            }
            break;
          case "app.asana.com":
            result = emojiNames.asanaTask;
            break;
        }
        if (hostname.includes("backlog")) {
          result = emojiNames.backlogIssue;
        }
        if (hostname.includes("redmine")) {
          result = emojiNames.redmineTicket;
        }
        if (document.body.id === "jira") {
          result = emojiNames.jiraIssue;
        }
        resolve(result);
      });
    });
  }

  // MARK: show toast
  /**
   * Displays a toast message on the bottom left of the screen.
   *
   * @param {string} message
   */
  function _showToast(message: string) {
    // load CSS file for toast
    const link = document.createElement("link");
    link.rel = "stylesheet";
    link.href = chrome.runtime.getURL("../styles/toast.css");
    document.head.appendChild(link);

    // Wait for the CSS to load
    link.onload = () => {
      const toast = document.createElement("div");
      toast.textContent = message;
      toast.className = "copylink-dev-toast";

      // Set initial styles
      toast.style.opacity = "0";
      toast.style.transform = "translate3d(0, 24px, 0)";

      document.body.appendChild(toast);

      // Force reflow
      toast.offsetHeight;

      // slide in and fade in
      setTimeout(() => {
        toast.style.transform = "translate3d(0, 0, 0)";
        toast.style.opacity = "1";
      }, 10);

      // slide out and fade out
      setTimeout(() => {
        toast.style.transform = "translate3d(0, 12px, 0)";
        toast.style.opacity = "0";
        setTimeout(() => {
          toast.remove();
        }, 310);
      }, 3000);
    };
  }
}
