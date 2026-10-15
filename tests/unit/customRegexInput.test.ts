import { afterEach, expect, it, vi } from "vitest";
import { resolveEmojiName } from "../../src/shared/emojiResolver";

afterEach(() => {
  vi.unstubAllGlobals();
  document.body.innerHTML = "";
});

it("preserves the last valid regex, saves valid sibling edits, and clears validation after correction", async () => {
  document.body.innerHTML =
    '<input id="regex-custom-1"><input id="regex-custom-2">';
  const set = vi.fn((_data: object, callback: () => void) => callback());
  vi.stubGlobal("chrome", {
    runtime: {},
    i18n: { getMessage: (key: string) => key },
    storage: {
      local: {
        get: (_keys: string, callback: (data: object) => void) =>
          callback({ copylinkdevCustomRegexes: { customRegex1: "old" } }),
        set,
      },
    },
  });
  await import("../../src/popup/popup");
  document.dispatchEvent(new Event("DOMContentLoaded"));
  const first = document.querySelector<HTMLInputElement>("#regex-custom-1");
  const second = document.querySelector<HTMLInputElement>("#regex-custom-2");
  if (!first || !second) {
    throw new Error("Missing regex inputs");
  }
  first.value = "[";
  first.dispatchEvent(new Event("input"));
  expect(first.validationMessage).toBe("invalidCustomRegex");
  expect(first.getAttribute("aria-invalid")).toBe("true");
  expect(document.getElementById("regex-custom-1-error")?.textContent).toBe(
    "invalidCustomRegex",
  );
  second.value = "new";
  second.dispatchEvent(new Event("input"));
  expect(set).toHaveBeenLastCalledWith(
    { copylinkdevCustomRegexes: { customRegex1: "old", customRegex2: "new" } },
    expect.any(Function),
  );
  first.value = "valid";
  first.dispatchEvent(new Event("input"));
  expect(first.validationMessage).toBe("");
  expect(first.getAttribute("aria-invalid")).toBe("false");
  expect(document.getElementById("regex-custom-1-error")?.textContent).toBe("");
  expect(set).toHaveBeenLastCalledWith(
    {
      copylinkdevCustomRegexes: { customRegex1: "valid", customRegex2: "new" },
    },
    expect.any(Function),
  );
});

it("ignores invalid persisted regexes and continues built-in emoji resolution", () => {
  expect(
    resolveEmojiName(
      {
        href: "https://github.com/a/b",
        hostname: "github.com",
        pathname: "/a/b",
      },
      {
        emojiNames: { customWebsite1: ":custom:" },
        customRegexes: { customRegex1: "[" },
      },
    ),
  ).toBe(":github:");
});
