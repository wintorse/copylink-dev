// @vitest-environment node
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

type Tab = { id: number; url?: string };
let listener: ((command: string) => void) | undefined;
let tabs: Array<Tab>;
const runtime: { lastError?: { message: string } } = {};
const sendMessage = vi.fn(
  (_id: number, _message: object, respond: () => void) => respond(),
);

beforeEach(async () => {
  vi.resetModules();
  sendMessage.mockClear();
  delete runtime.lastError;
  tabs = [{ id: 7, url: "https://example.com/" }];
  listener = undefined;
  vi.stubGlobal("chrome", {
    runtime,
    commands: {
      onCommand: {
        addListener: (callback: (command: string) => void) => {
          listener = callback;
        },
      },
    },
    tabs: {
      query: (_query: object, callback: (result: Array<Tab>) => void) =>
        callback(tabs),
      sendMessage,
    },
  });
  await import("../../src/scripts/background_firefox");
});

afterEach(() => {
  vi.unstubAllGlobals();
  vi.restoreAllMocks();
});

const invoke = () => {
  if (!listener) {
    throw new Error("Missing Firefox command listener");
  }
  listener("copy-link");
};

describe("Firefox background command handler", () => {
  it.each([
    "https://example.com/feed.xml",
    "https://example.com/FEED.XML?download=1#section",
  ])("skips XML paths without sending a command: %s", (url) => {
    tabs = [{ id: 7, url }];

    invoke();

    expect(sendMessage).not.toHaveBeenCalled();
  });

  it("sends commands for non-XML paths", () => {
    tabs = [{ id: 7, url: "https://example.com/view?file=feed.xml" }];

    invoke();

    expect(sendMessage).toHaveBeenCalledExactlyOnceWith(
      7,
      { type: "execute-command", command: "copy-link" },
      expect.any(Function),
    );
  });

  it("logs runtime message errors without throwing", () => {
    runtime.lastError = { message: "Content script disconnected" };
    const errorSpy = vi.spyOn(console, "error").mockImplementation(() => {});

    expect(invoke).not.toThrow();

    expect(errorSpy).toHaveBeenCalledWith(
      "Error sending command copy-link:",
      "Content script disconnected",
    );
  });
});
