import { getEmojiName } from "./getEmojiName";
import { showToast } from "../utils/toast";
import { copyToClipboardShared } from "../shared/clipboard/copyToClipboardShared";
import { copyTextLinkCore } from "../shared/clipboard/copyTextLinkCore";
import { getFormattedTitle } from "../shared/getFormattedTitle";
import { getGoogleSheetsRangeInfo } from "../shared/getGoogleSheetsRangeLink";
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
