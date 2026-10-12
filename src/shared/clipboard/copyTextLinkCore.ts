import type { Command, LinkFormat } from "../../types/types";
import {
  type CopyContent,
  type FallbackSpec,
  buildLinkCopyContent,
} from "./buildLinkCopyContent";
import type { CopyResult } from "./copyToClipboardShared";

export type { FallbackSpec } from "./buildLinkCopyContent";

export type CopyTextLinkDeps = {
  t: (key: string) => string;
  getEmojiName: () => Promise<string>;
  getLinkFormat: () => Promise<LinkFormat>;
  getFormattedTitle: () => string;
  getGoogleSheetsRangeInfo: () => { link: string } | null;
  getUrl: () => string;
  notify: (message: string) => Promise<void>;
  copy: (
    text: string,
    html?: string,
    fallbackElement?: HTMLElement,
  ) => Promise<CopyResult>;
};

export const createFallbackElement = (
  spec: FallbackSpec,
): HTMLElement | undefined => {
  if (spec.type === "plainUrl") {
    const el = document.createElement("p");
    el.textContent = spec.url;
    return el;
  }
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
    if (spec.emojiName) {
      el.appendChild(document.createTextNode(`${spec.emojiName} `));
    }
    const anchor = document.createElement("a");
    anchor.setAttribute("href", spec.url);
    anchor.textContent = spec.title;
    el.appendChild(anchor);
    el.appendChild(document.createTextNode("\u00A0"));
    return el;
  }
  return undefined;
};

export const copyTextLinkCore = async (
  command: Command,
  deps: CopyTextLinkDeps,
): Promise<CopyResult | undefined> => {
  const {
    t,
    getEmojiName,
    getLinkFormat,
    getFormattedTitle,
    getGoogleSheetsRangeInfo,
    getUrl,
    notify,
    copy,
  } = deps;
  const title = getFormattedTitle();
  const url = getUrl();

  const notifySuccess = (messageKey: string) => notify(t(messageKey));
  const notifyFailure = (messageKey: string) => notify(t(messageKey));

  const runCopy = async (
    { text, html, fallbackSpec }: CopyContent,
    successKey: string,
    failureKey: string,
  ) => {
    const fallbackElement = createFallbackElement(fallbackSpec);
    const result = await copy(text, html, fallbackElement);
    if (result.success) {
      await notifySuccess(successKey);
    } else {
      await notifyFailure(failureKey);
    }
    return result;
  };

  const copyLinkWithFormat = async (
    link: string,
    linkTitle: string,
    linkFormat: LinkFormat,
    successKey: string,
    failureKey: string,
  ) => {
    const emojiName =
      linkFormat === "htmlWithEmoji" ? await getEmojiName() : "";
    return runCopy(
      buildLinkCopyContent({
        title: linkTitle,
        url: link,
        format: linkFormat,
        emojiName,
      }),
      successKey,
      failureKey,
    );
  };

  if (command === "copy-title") {
    return runCopy(
      { text: title, fallbackSpec: { type: "title", title } },
      "copyTitleSuccess",
      "copyTitleFailure",
    );
  }

  if (command === "copy-link") {
    return copyLinkWithFormat(
      url,
      title,
      "html",
      "copyLinkSuccess",
      "copyLinkFailure",
    );
  }

  if (command === "copy-link-for-slack") {
    return copyLinkWithFormat(
      url,
      title,
      "htmlWithEmoji",
      "copyLinkSuccess",
      "copyLinkFailure",
    );
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
      await notify(t("copyGoogleSheetsRangeFailure"));
      return {
        success: false,
        error: new Error("Google Sheets range unavailable"),
      };
    }

    const linkFormat = await getLinkFormat();
    return copyLinkWithFormat(
      rangeInfo.link,
      title,
      linkFormat,
      "copyGoogleSheetsRangeSuccess",
      "copyGoogleSheetsRangeFailure",
    );
  }

  await notify("Unknown command");
  return { success: false, error: new Error("Unknown command") };
};
