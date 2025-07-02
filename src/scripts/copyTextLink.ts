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
  successMessage: string,
  failureMessage: string,
  html?: string,
  fallbackElement?: HTMLElement
) {
  const notify = (message: string) => {
    showToast(message);
    // chrome.runtime.sendMessage({ type: "copylink.dev-notification", message });
  };
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
    // notify(failureMessage);

    // Fallback for HTTP URLs
    // Clipboard API does not support HTTP URLs.
    if (!fallbackElement) {
      notify(failureMessage);
      return;
    }
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

/**
 * Copies text or a link to the clipboard based on the provided argument.
 *
 * @param {Command} command - The action to perform.
 *
 * The function also displays a toast message indicating the success or failure of the copy operation.
 */
export async function copyTextLink(command: Command) {
  const title = getFormattedTitle();
  const url = document.URL;
  const t = (key: string): string => chrome.i18n.getMessage(key);

  async function handleCopyTitle() {
    const fallbackElement = document.createElement("p");
    fallbackElement.textContent = title;
    await copyToClipboard(
      title,
      t("copyTitleSuccess"),
      t("copyTitleFailure"),
      undefined,
      fallbackElement
    );
  }

  async function handleCopyLink() {
    const html = `<a href="${url}">${title}</a>&nbsp;`;
    const fallbackElement = document.createElement("span");
    const anchor = document.createElement("a");
    anchor.setAttribute("href", url);
    anchor.textContent = title;
    fallbackElement.appendChild(anchor);
    fallbackElement.appendChild(document.createTextNode("&nbsp;"));
    await copyToClipboard(
      title,
      t("copyLinkSuccess"),
      t("copyLinkFailure"),
      html,
      fallbackElement
    );
  }

  async function handleCopyLinkForSlack() {
    const emojiName = await getEmojiName();
    const html = `${emojiName}&nbsp;<a href="${url}">${title}</a>&nbsp;`;
    const fallbackElement = document.createElement("span");
    fallbackElement.appendChild(document.createTextNode(`${emojiName} `));
    const anchor = document.createElement("a");
    anchor.setAttribute("href", url);
    anchor.textContent = title;
    fallbackElement.appendChild(anchor);
    fallbackElement.appendChild(document.createTextNode("&nbsp;"));
    await copyToClipboard(
      title,
      t("copyLinkSuccess"),
      t("copyLinkFailure"),
      html,
      fallbackElement
    );
  }

  const commandMap: Record<Command, () => Promise<void>> = {
    "copy-title": handleCopyTitle,
    "copy-link": handleCopyLink,
    "copy-link-for-slack": handleCopyLinkForSlack,
  };

  if (commandMap[command]) {
    await commandMap[command]();
  } else {
    showToast("Unknown command");
  }
}
