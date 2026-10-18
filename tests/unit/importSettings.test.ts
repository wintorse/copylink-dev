// @vitest-environment node
import { describe, expect, it } from "vitest";
import { parseImportedSettings } from "../../src/shared/popup/importSettings";

describe("parseImportedSettings", () => {
  it.each([
    null,
    [],
    {},
    { emojiNames: [] },
    { emojiNames: "github" },
    { emojiNames: null },
    { emojiNames: { github: 42 } },
    { emojiNames: { unknown: ":link:" } },
    { customRegexes: [] },
    { customRegexes: { customRegex1: false } },
    { emojiNames: { github: ":valid:" }, customRegexes: { customRegex1: "[" } },
  ])("rejects malformed settings before saving: %j", (data) => {
    expect(() => parseImportedSettings(JSON.stringify(data))).toThrow();
  });

  it("normalizes valid emoji names and preserves regexes", () => {
    const data = parseImportedSettings(
      JSON.stringify({
        emojiNames: { github: "my_github" },
        customRegexes: { customRegex1: "example\\.com" },
      }),
    );
    expect(data.emojiNames?.github).toBe(":my_github:");
    expect(data.customRegexes).toEqual({ customRegex1: "example\\.com" });
  });

  it("accepts empty sections to reset settings", () => {
    expect(parseImportedSettings('{"customRegexes":{}}')).toEqual({
      customRegexes: {},
    });
    expect(parseImportedSettings('{"emojiNames":{}}').emojiNames?.github).toBe(
      ":github:",
    );
  });
});
