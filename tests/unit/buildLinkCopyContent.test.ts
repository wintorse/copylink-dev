// @vitest-environment node
import { describe, expect, it } from "vitest";
import { buildLinkCopyContent } from "../../src/shared/clipboard/buildLinkCopyContent";

const title = "Test Title";
const url = "https://example.com/";

describe("buildLinkCopyContent", () => {
  it("builds plain URL content without HTML", () => {
    expect(buildLinkCopyContent({ title, url, format: "plainUrl" })).toEqual({
      text: url,
      fallbackSpec: { type: "plainUrl", url },
    });
  });

  it("builds Markdown content without HTML", () => {
    expect(buildLinkCopyContent({ title, url, format: "markdown" })).toEqual({
      text: "[Test Title](https://example.com/)",
      fallbackSpec: {
        type: "title",
        title: "[Test Title](https://example.com/)",
      },
    });
  });

  it("builds HTML content with the title as plain text and a trailing non-breaking space", () => {
    expect(
      buildLinkCopyContent({ title, url, format: "html", emojiName: ":link:" }),
    ).toEqual({
      text: title,
      html: '<a href="https://example.com/">Test Title</a>&nbsp;',
      fallbackSpec: { type: "link", title, url },
    });
  });

  it("builds emoji HTML with Markdown as plain text", () => {
    expect(
      buildLinkCopyContent({
        title,
        url,
        format: "htmlWithEmoji",
        emojiName: ":link:",
      }),
    ).toEqual({
      text: "[Test Title](https://example.com/)",
      html: ':link:&nbsp;<a href="https://example.com/">Test Title</a>&nbsp;',
      fallbackSpec: { type: "linkWithEmoji", title, url, emojiName: ":link:" },
    });
  });

  it("omits the emoji prefix and separator when no emoji is supplied", () => {
    expect(
      buildLinkCopyContent({ title, url, format: "htmlWithEmoji" }),
    ).toEqual({
      text: "[Test Title](https://example.com/)",
      html: '<a href="https://example.com/">Test Title</a>&nbsp;',
      fallbackSpec: { type: "linkWithEmoji", title, url, emojiName: "" },
    });
  });

  it("escapes title, URL and emoji only in HTML, preserving raw fallback values", () => {
    const options = {
      title: '<Title & "More">',
      url: 'https://example.com/?q="value"&next=<page>',
      format: "htmlWithEmoji" as const,
      emojiName: ':<emoji&">:',
    };
    expect(buildLinkCopyContent(options)).toEqual({
      text: `[${options.title}](${options.url})`,
      html: ':&lt;emoji&amp;&quot;&gt;:&nbsp;<a href="https://example.com/?q=&quot;value&quot;&amp;next=&lt;page&gt;">&lt;Title &amp; &quot;More&quot;&gt;</a>&nbsp;',
      fallbackSpec: {
        type: "linkWithEmoji",
        title: options.title,
        url: options.url,
        emojiName: options.emojiName,
      },
    });
  });
});
