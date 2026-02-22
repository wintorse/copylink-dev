import type { Command } from "../types/types";
import { copyTextLinkCore } from "../shared/clipboard/copyTextLinkCore";
import { copyToClipboardShared } from "../shared/clipboard/copyToClipboardShared";
import { getEmojiName } from "./getEmojiName";
import { getFormattedTitle } from "../shared/getFormattedTitle";
import { getGoogleSheetsRangeInfo } from "../shared/getGoogleSheetsRangeLink";
import { showToast } from "../utils/toast";

export const copyTextLink = async (command: Command) => {
  await copyTextLinkCore(command, {
    t: (key: string) => chrome.i18n.getMessage(key),
    getEmojiName,
    getFormattedTitle,
    getGoogleSheetsRangeInfo,
    getUrl: () => document.URL,
    notify: async (message: string) => {
      await showToast(message);
    },
    copy: copyToClipboardShared,
  });
};
