import type { Command, LinkFormat } from "../../types/types";
import type { CopyResult } from "./copyToClipboardShared";

export type FallbackSpec =
  | { type: "title"; title: string }
  | { type: "plainUrl"; url: string }
  | { type: "link"; title: string; url: string }
  | { type: "linkWithEmoji"; title: string; url: string; emojiName: string };

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

const escapeHtml = (str: string): string =>
  str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");

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
    el.appendChild(document.createTextNode(`${spec.emojiName} `));
    const anchor = document.createElement("a");
    anchor.setAttribute("href", spec.url);
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
    getLinkFormat,
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
      await notifySuccess(successKey);
    } else {
      await notifyFailure(failureKey);
    }
  };

  const copyLinkWithFormat = async (
    link: string,
    linkTitle: string,
    linkFormat: LinkFormat,
    successKey: string,
    failureKey: string,
  ) => {
    if (linkFormat === "plainUrl") {
      await runCopy(
        link,
        undefined,
        { type: "plainUrl", url: link },
        successKey,
        failureKey,
      );
    } else if (linkFormat === "markdown") {
      await runCopy(
        `[${linkTitle}](${link})`,
        undefined,
        { type: "title", title: `[${linkTitle}](${link})` },
        successKey,
        failureKey,
      );
    } else if (linkFormat === "html") {
      const html = `<a href="${escapeHtml(link)}">${escapeHtml(linkTitle)}</a>&nbsp;`;
      await runCopy(
        linkTitle,
        html,
        { type: "link", title: linkTitle, url: link },
        successKey,
        failureKey,
      );
    } else {
      // htmlWithEmoji
      const emojiName = await getEmojiName();
      const html = `${escapeHtml(emojiName)}&nbsp;<a href="${escapeHtml(link)}">${escapeHtml(linkTitle)}</a>&nbsp;`;
      await runCopy(
        `[${linkTitle}](${link})`,
        html,
        { type: "linkWithEmoji", title: linkTitle, url: link, emojiName },
        successKey,
        failureKey,
      );
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

  if (command === "copy-link" || command === "copy-link-for-slack") {
    const linkFormat = await getLinkFormat();
    await copyLinkWithFormat(
      url,
      title,
      linkFormat,
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
      await deps.notify(t("copyGoogleSheetsRangeFailure"));
      return;
    }

    const linkFormat = await getLinkFormat();
    await copyLinkWithFormat(
      rangeInfo.link,
      title,
      linkFormat,
      "copyGoogleSheetsRangeSuccess",
      "copyGoogleSheetsRangeFailure",
    );
    return;
  }

  await deps.notify("Unknown command");
};
