import { getFormattedTitle } from "./getFormattedTitle";
import { getEmojiName } from "./getEmojiName";
import { getGoogleSheetsRangeInfo } from "./getGoogleSheetsRangeLink";
import { showToast } from "../utils/toast";
import { copyToClipboardShared } from "../shared/clipboard/copyToClipboardShared";
import { copyTextLinkCore } from "../shared/clipboard/copyTextLinkCore";
import type { Command } from "../types/types";

export const copyTextLink = async (command: Command) => {
  await copyTextLinkCore(command, {
    t: (key: string) => chrome.i18n.getMessage(key),
    getEmojiName,
    getFormattedTitle,
    getGoogleSheetsRangeInfo,
    getUrl: () => document.URL,
    notify: showToast,
    copy: copyToClipboardShared,
  });
};
