import { getFormattedTitle } from "./titleRetrievers";
import { getEmojiName } from "./emojiNames";
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

  // Copy the title only to the clipboard
  if (command === VALID_COMMANDS.COPY_TITLE) {
    if (navigator.clipboard) {
      navigator.clipboard
        .writeText(title)
        .then(() => {
          notify(t("copyTitleSuccess"));
        })
        .catch((err) => {
          console.error("Failed to copy title to clipboard", err);
          notify(t("copyTitleFailure"));
        });
      return;
    } else {
      // Fallback for websites that don't support https
      const textArea = document.createElement("textarea");
      textArea.value = title;
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand("copy");
      document.body.removeChild(textArea);
      notify(t("copyTitleSuccess"));
    }
  }

  // Writing plain text and HTML to the clipboard allows you to use it as a text link.
  if (command === VALID_COMMANDS.COPY_LINK) {
    if (navigator.clipboard) {
      navigator.clipboard
        .write([
          new ClipboardItem({
            "text/plain": new Blob([title], { type: "text/plain" }),
            "text/html": new Blob([html], { type: "text/html" }),
          }),
        ])
        .then(() => {
          notify(t("copyLinkSuccess"));
        })
        .catch((err) => {
          console.error("Failed to copy link to clipboard", err);
          notify(t("copyLinkFailure"));
        });
    } else {
      // Fallback for websites that don't support https
      const target = document.createElement("a");
      target.setAttribute("href", url);
      target.textContent = title;
      document.body.appendChild(target);

      const range = document.createRange();
      range.selectNode(target);
      const select = window.getSelection();
      if (!select) {
        notify(t("copyLinkFailure"));
        return;
      }
      select.removeAllRanges();
      select.addRange(range);
      document.execCommand("copy");
      select.removeAllRanges();
      document.body.removeChild(target);
      notify(t("copyLinkSuccess"));
    }
  }

  const emojiName = await getEmojiName();

  // Copy plain text and HTML with Slack emoji name to clipboard
  if (command === VALID_COMMANDS.COPY_LINK_FOR_SLACK) {
    if (navigator.clipboard) {
      const html = `${emojiName}&nbsp;<a href="${url}">${title}</a>&nbsp;`;
      navigator.clipboard
        .write([
          new ClipboardItem({
            "text/plain": new Blob([title], { type: "text/plain" }),
            "text/html": new Blob([html], { type: "text/html" }),
          }),
        ])
        .then(() => {
          notify(t("copyLinkSuccess"));
        })
        .catch((err) => {
          console.error("Failed to copy link to clipboard", err);
          notify(t("copyLinkFailure"));
        });
    } else {
      // Fallback for websites that don't support https
      const spanTarget = document.createElement("span");
      spanTarget.textContent = emojiName + " ";
      const anchorTarget = document.createElement("a");
      anchorTarget.setAttribute("href", url);
      anchorTarget.textContent = title;
      spanTarget.appendChild(anchorTarget);
      document.body.appendChild(spanTarget);
      const range = document.createRange();
      range.selectNode(spanTarget);
      const select = window.getSelection();
      if (!select) {
        notify(t("copyLinkFailure"));
        return;
      }
      select.removeAllRanges();
      select.addRange(range);
      document.execCommand("copy");
      select.removeAllRanges();
      document.body.removeChild(spanTarget);
      notify(t("copyLinkSuccess"));
    }
  }
}
