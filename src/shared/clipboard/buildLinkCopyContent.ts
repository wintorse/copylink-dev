import type { LinkFormat } from "../../types/types";

export type FallbackSpec =
  | { type: "title"; title: string }
  | { type: "plainUrl"; url: string }
  | { type: "link"; title: string; url: string }
  | { type: "linkWithEmoji"; title: string; url: string; emojiName: string };

export type CopyContent = {
  text: string;
  html?: string;
  fallbackSpec: FallbackSpec;
};

type LinkCopyOptions = {
  title: string;
  url: string;
  format: LinkFormat;
  emojiName?: string;
};

const escapeHtml = (str: string): string =>
  str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");

// Builds clipboard content and a fallback description without accessing the DOM.
export const buildLinkCopyContent = ({
  title,
  url,
  format,
  emojiName = "",
}: LinkCopyOptions): CopyContent => {
  switch (format) {
    case "plainUrl":
      return {
        text: url,
        fallbackSpec: { type: "plainUrl", url },
      };
    case "markdown": {
      const text = `[${title}](${url})`;
      return {
        text,
        fallbackSpec: { type: "title", title: text },
      };
    }
    case "html":
    case "htmlWithEmoji": {
      // Added &nbsp; to include a space at the end of the link
      // (used &nbsp; because regular spaces are removed in Asana and other tools)
      const htmlLink = `<a href="${escapeHtml(url)}">${escapeHtml(title)}</a>&nbsp;`;
      if (format === "html") {
        return {
          text: title,
          html: htmlLink,
          fallbackSpec: { type: "link", title, url },
        };
      }
      const emojiPrefix = emojiName ? `${escapeHtml(emojiName)}&nbsp;` : "";
      return {
        text: `[${title}](${url})`,
        html: `${emojiPrefix}${htmlLink}`,
        fallbackSpec: { type: "linkWithEmoji", title, url, emojiName },
      };
    }
  }
};
