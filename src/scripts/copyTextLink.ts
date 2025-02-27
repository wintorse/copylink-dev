import { getFormattedTitle } from "./titleRetrievers";
import { getEmojiName } from "./emojiNames";
import { showToast } from "./toast";
import { ValidCommands } from "../types/types";
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

  // Copy the title only to the clipboard
  if (command === ValidCommands.COPY_TITLE) {
    navigator.clipboard
      .writeText(title)
      .then(() => {
        showToast(t("copyTitleSuccess"));
      })
      .catch((err) => {
        console.error("Failed to copy title to clipboard", err);
        showToast(t("copyTitleFailure"));
      });
    return;
  }

  // Writing plain text and HTML to the clipboard allows you to use it as a text link.
  if (command === ValidCommands.COPY_LINK) {
    navigator.clipboard
      .write([
        new ClipboardItem({
          "text/plain": new Blob([title], { type: "text/plain" }),
          "text/html": new Blob([html], { type: "text/html" }),
        }),
      ])
      .then(() => {
        showToast(t("copyLinkSuccess"));
      })
      .catch((err) => {
        console.error("Failed to copy link to clipboard", err);
        showToast(t("copyLinkFailure"));
      });
  }

  const emojiName = await getEmojiName();

  // Copy plain text and HTML with Slack emoji name to clipboard
  if (command === ValidCommands.COPY_LINK_FOR_SLACK) {
    const html = `${emojiName}&nbsp;<a href="${url}">${title}</a>&nbsp;`;
    navigator.clipboard
      .write([
        new ClipboardItem({
          "text/plain": new Blob([title], { type: "text/plain" }),
          "text/html": new Blob([html], { type: "text/html" }),
        }),
      ])
      .then(() => {
        showToast(t("copyLinkSuccess"));
      })
      .catch((err) => {
        console.error("Failed to copy link to clipboard", err);
        showToast(t("copyLinkFailure"));
      });
  }
}
