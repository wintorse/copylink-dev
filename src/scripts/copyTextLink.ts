import { getFormattedTitle } from "./formattedTitleRetriever";
import { getEmojiName } from "./getEmojiName";
import { showToast } from "../utils/toast";
import type { Command } from "../types/types";

/**
 * Copies text or a link to the clipboard based on the provided argument.
 *
 * @param {Command} command - The action to perform. Can be one of the following:
 *   - "copy-title": Copies the formatted title to the clipboard.
 *   - "copy-link": Copies a text link to the clipboard.
 *   - "copy-link-for-slack": Copies a text link with a Slack emoji name to the clipboard.
 *
 * The function also displays a toast message indicating the success or failure of the copy operation.
 */
async function copyToClipboard(
  text: string,
  notify: (message: string) => void,
  successMessage: string,
  failureMessage: string,
  html?: string
) {
  try {
    if (navigator.clipboard) {
      if (html) {
        await navigator.clipboard.write([
          new ClipboardItem({
            "text/plain": new Blob([text], { type: "text/plain" }),
            "text/html": new Blob([html], { type: "text/html" }),
          }),
        ]);
      } else {
        await navigator.clipboard.writeText(text);
      }
      notify(successMessage);
    } else {
      throw new Error("Clipboard API not supported");
    }
  } catch (err) {
    notify(failureMessage);
    // Fallback for Firefox and HTTP URLs
    // HTTP URLs are not supported by the Clipboard API
    // Firefox is said to require a user gesture to copy,
    // but the shortcuts seem to work when run within five seconds after a click
    // https://developer.mozilla.org/en-US/docs/Web/API/Clipboard/writeText#browser_compatibility
    const fallbackElement = html
      ? createFallbackHtmlElement(html)
      : createFallbackTextElement(text);
    document.body.appendChild(fallbackElement);
    const range = document.createRange();
    range.selectNode(fallbackElement);
    const selection = window.getSelection();
    if (selection) {
      selection.removeAllRanges();
      selection.addRange(range);
      document.execCommand("copy");
      selection.removeAllRanges();
    }
    document.body.removeChild(fallbackElement);
    notify(successMessage);
  }
}

function createFallbackTextElement(text: string): HTMLTextAreaElement {
  const textArea = document.createElement("textarea");
  textArea.value = text;
  return textArea;
}

function createFallbackHtmlElement(html: string): HTMLElement {
  const container = document.createElement("div");
  container.innerHTML = html;
  return container;
}

export async function copyTextLink(command: Command) {
  const title = getFormattedTitle();
  const url = document.URL;
  const html = `<a href="${url}">${title}</a>&nbsp;`;
  const t = (key: string): string => chrome.i18n.getMessage(key);

  const notify = (message: string) => {
    showToast(message);
    // chrome.runtime.sendMessage({ type: "copylink.dev-notification", message });
  };

  const VALID_COMMANDS = {
    COPY_LINK: "copy-link",
    COPY_LINK_FOR_SLACK: "copy-link-for-slack",
    COPY_TITLE: "copy-title",
  } as const satisfies { [key: string]: Command };

  if (command === VALID_COMMANDS.COPY_TITLE) {
    await copyToClipboard(
      title,
      notify,
      t("copyTitleSuccess"),
      t("copyTitleFailure"),
      undefined
    );
  } else if (command === VALID_COMMANDS.COPY_LINK) {
    await copyToClipboard(
      title,
      notify,
      t("copyLinkSuccess"),
      t("copyLinkFailure"),
      html
    );
  } else if (command === VALID_COMMANDS.COPY_LINK_FOR_SLACK) {
    const emojiName = await getEmojiName();
    const slackHtml = `${emojiName}&nbsp;<a href="${url}">${title}</a>&nbsp;`;
    await copyToClipboard(
      title,
      notify,
      t("copyLinkSuccess"),
      t("copyLinkFailure"),
      slackHtml
    );
  }
}
