import { getFormattedTitle } from "./getFormattedTitle";
import { getEmojiName } from "./getEmojiName";
import { getGoogleSheetsRangeInfo } from "./getGoogleSheetsRangeLink";
import { showToast } from "../utils/toast";
import { copyToClipboardShared } from "../shared/clipboard/copyToClipboardShared";
import {
  copyTextLinkCore,
  type FallbackSpec,
} from "../shared/clipboard/copyTextLinkCore";
import type { Command } from "../types/types";

const createFallbackElement = (spec: FallbackSpec): HTMLElement | undefined => {
  if (spec.type === "title") {
    const el = document.createElement("p");
    el.textContent = spec.title;
    return el;
  }
  if (spec.type === "link") {
    const el = document.createElement("span");
    const anchor = document.createElement("a");
    anchor.setAttribute("href", spec.url);
    anchor.textContent = spec.title;
    el.appendChild(anchor);
    el.appendChild(document.createTextNode("\u00A0"));
    return el;
  }
  if (spec.type === "linkWithEmoji") {
    const el = document.createElement("span");
    el.appendChild(document.createTextNode(`${spec.emojiName} `));
    const anchor = document.createElement("a");
    anchor.setAttribute("href", spec.url);
    anchor.textContent = spec.title;
    el.appendChild(anchor);
    return el;
  }
  if (spec.type === "sheetsRange") {
    const el = document.createElement("span");
    el.appendChild(document.createTextNode(`${spec.emojiName} `));
    const anchor = document.createElement("a");
    anchor.setAttribute("href", spec.link);
    anchor.textContent = spec.text;
    el.appendChild(anchor);
    return el;
  }
  return undefined;
};

export const copyTextLink = async (command: Command) => {
  await copyTextLinkCore(command, {
    t: (key: string) => chrome.i18n.getMessage(key),
    getEmojiName,
    getFormattedTitle,
    getGoogleSheetsRangeInfo,
    getUrl: () => document.URL,
    notify: showToast,
    copy: copyToClipboardShared,
    createFallbackElement,
  });
};
