import type { Command } from "../../types/types";
import type { CopyResult } from "./copyToClipboardShared";

export type FallbackSpec =
  | { type: "title"; title: string }
  | { type: "link"; title: string; url: string }
  | { type: "linkWithEmoji"; title: string; url: string; emojiName: string }
  | { type: "sheetsRange"; title: string; link: string; emojiName: string };

export type CopyTextLinkDeps = {
  t: (key: string) => string;
  getEmojiName: () => Promise<string>;
  getFormattedTitle: () => string;
  getGoogleSheetsRangeInfo: () => { link: string } | null;
  getUrl: () => string;
  notify: (message: string) => void;
  copy: (
    text: string,
    html?: string,
    fallbackElement?: HTMLElement,
  ) => Promise<CopyResult>;
};

export const createFallbackElement = (
  spec: FallbackSpec,
): HTMLElement | undefined => {
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
    anchor.textContent = spec.title;
    el.appendChild(anchor);
    return el;
  }
  return undefined;
};

export const copyTextLinkCore = async (
  command: Command,
  deps: CopyTextLinkDeps,
): Promise<void> => {
  const {
    t,
    getEmojiName,
    getFormattedTitle,
    getGoogleSheetsRangeInfo,
    getUrl,
  } = deps;
  const title = getFormattedTitle();
  const url = getUrl();

  const notifySuccess = (messageKey: string) => deps.notify(t(messageKey));
  const notifyFailure = (messageKey: string) => deps.notify(t(messageKey));

  const runCopy = async (
    text: string,
    html: string | undefined,
    fallbackSpec: FallbackSpec | undefined,
    successKey: string,
    failureKey: string,
  ) => {
    const fallbackElement = fallbackSpec
      ? createFallbackElement(fallbackSpec)
      : undefined;
    const result = await deps.copy(text, html, fallbackElement);
    if (result.success) {
      notifySuccess(successKey);
    } else {
      notifyFailure(failureKey);
    }
  };

  if (command === "copy-title") {
    await runCopy(
      title,
      undefined,
      { type: "title", title },
      "copyTitleSuccess",
      "copyTitleFailure",
    );
    return;
  }

  if (command === "copy-link") {
    const html = `<a href="${url}">${title}</a>&nbsp;`;
    await runCopy(
      title,
      html,
      { type: "link", title, url },
      "copyLinkSuccess",
      "copyLinkFailure",
    );
    return;
  }

  if (command === "copy-link-for-slack") {
    const emojiName = await getEmojiName();
    const html = `${emojiName}&nbsp;<a href="${url}">${title}</a>&nbsp;`;
    await runCopy(
      // secret feature: Markdown format in plain text
      // If you copy-paste it into IDEs or plain text editors, it appears as a Markdown link.
      `[${title}](${url})`,
      html,
      { type: "linkWithEmoji", title, url, emojiName },
      "copyLinkSuccess",
      "copyLinkFailure",
    );
    return;
  }

  if (command === "copy-google-sheets-range") {
    const isGoogleSheetsUrl = /:\/\/docs\.google\.com\/spreadsheets\//.test(
      url,
    );
    // If not a Google Sheets URL, do nothing
    if (!isGoogleSheetsUrl) {
      return;
    }

    const rangeInfo = getGoogleSheetsRangeInfo();
    if (!rangeInfo) {
      deps.notify(t("copyGoogleSheetsRangeFailure"));
      return;
    }
    const emojiName = await getEmojiName();
    const html = `${emojiName}&nbsp;<a href="${rangeInfo.link}">${title}</a>&nbsp;`;
    await runCopy(
      title,
      html,
      { type: "sheetsRange", title, link: rangeInfo.link, emojiName },
      "copyGoogleSheetsRangeSuccess",
      "copyGoogleSheetsRangeFailure",
    );
    return;
  }

  deps.notify("Unknown command");
};
