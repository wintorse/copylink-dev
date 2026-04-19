// @vitest-environment node
import {
  type Mock,
  afterEach,
  beforeEach,
  describe,
  expect,
  it,
  vi,
} from "vitest";

describe("background.ts command handler", () => {
  // Captured listener from chrome.commands.onCommand.addListener
  let commandListener: ((command: string) => Promise<void>) | undefined;

  // Chrome API mocks
  let queryMock: Mock;
  let executeScriptMock: Mock;
  let sendMessageMock: Mock;

  beforeEach(async () => {
    vi.resetModules();
    commandListener = undefined;

    queryMock = vi.fn();
    executeScriptMock = vi.fn();
    sendMessageMock = vi.fn();

    // Stub the chrome global BEFORE importing background.ts so that the
    // addListener call at module top level captures our mock.
    vi.stubGlobal("chrome", {
      commands: {
        onCommand: {
          addListener: (fn: (command: string) => Promise<void>) => {
            commandListener = fn;
          },
        },
      },
      tabs: { query: queryMock, sendMessage: sendMessageMock },
      scripting: { executeScript: executeScriptMock },
    });

    // Importing the module registers the listener as a side effect.
    await import("../../src/scripts/background");
  });

  afterEach(() => {
    vi.unstubAllGlobals();
    vi.restoreAllMocks();
  });

  // Invoke the captured command listener, throwing if it was not set up.
  const invoke = (command: string): Promise<void> => {
    if (commandListener === undefined) {
      throw new Error("commandListener was not captured");
    }
    return commandListener(command);
  };

  // ──────────────────────────────────────────────
  // B-ERR-01: No active tab
  // ──────────────────────────────────────────────

  it("logs an error and does nothing when no active tab is found", async () => {
    queryMock.mockResolvedValue([]);
    const errorSpy = vi.spyOn(console, "error").mockImplementation(() => {});

    await invoke("copy-link");

    expect(errorSpy).toHaveBeenCalledWith("No active tab found.");
    expect(executeScriptMock).not.toHaveBeenCalled();
    expect(sendMessageMock).not.toHaveBeenCalled();
  });

  it("logs an error and does nothing when tab has no URL", async () => {
    queryMock.mockResolvedValue([{ id: 1 }]); // no url property
    const errorSpy = vi.spyOn(console, "error").mockImplementation(() => {});

    await invoke("copy-link");

    expect(errorSpy).toHaveBeenCalledWith("Tab URL is undefined.");
    expect(executeScriptMock).not.toHaveBeenCalled();
  });

  // ──────────────────────────────────────────────
  // B-ERR-02: Non http/https URL rejection
  // ──────────────────────────────────────────────

  it("rejects chrome:// URLs without injecting the content script", async () => {
    queryMock.mockResolvedValue([{ id: 1, url: "chrome://extensions" }]);
    const errorSpy = vi.spyOn(console, "error").mockImplementation(() => {});

    await invoke("copy-link");

    expect(errorSpy).toHaveBeenCalledWith("Invalid URL scheme.");
    expect(executeScriptMock).not.toHaveBeenCalled();
    expect(sendMessageMock).not.toHaveBeenCalled();
  });

  it("rejects about:blank without injecting the content script", async () => {
    queryMock.mockResolvedValue([{ id: 1, url: "about:blank" }]);
    const errorSpy = vi.spyOn(console, "error").mockImplementation(() => {});

    await invoke("copy-link");

    expect(errorSpy).toHaveBeenCalledWith("Invalid URL scheme.");
    expect(executeScriptMock).not.toHaveBeenCalled();
  });

  it("allows http:// URLs through to content script injection", async () => {
    queryMock.mockResolvedValue([{ id: 1, url: "http://example.com" }]);
    executeScriptMock.mockResolvedValue(null);
    sendMessageMock.mockResolvedValue({});

    await invoke("copy-link");

    expect(executeScriptMock).toHaveBeenCalledWith({
      target: { tabId: 1 },
      files: ["scripts/content.js"],
    });
  });

  it("allows https:// URLs through to content script injection", async () => {
    queryMock.mockResolvedValue([{ id: 1, url: "https://example.com" }]);
    executeScriptMock.mockResolvedValue(null);
    sendMessageMock.mockResolvedValue({});

    await invoke("copy-link");

    expect(executeScriptMock).toHaveBeenCalledWith({
      target: { tabId: 1 },
      files: ["scripts/content.js"],
    });
  });

  // ──────────────────────────────────────────────
  // B-ERR-03: Script injection failure
  // ──────────────────────────────────────────────

  it("logs error and does NOT send message when script injection fails", async () => {
    queryMock.mockResolvedValue([{ id: 1, url: "https://example.com" }]);
    const injectionError = new Error("Permission denied");
    executeScriptMock.mockRejectedValue(injectionError);
    const errorSpy = vi.spyOn(console, "error").mockImplementation(() => {});

    await invoke("copy-link");

    expect(errorSpy).toHaveBeenCalledWith(
      "Failed to inject content script:",
      injectionError,
    );
    expect(sendMessageMock).not.toHaveBeenCalled();
  });

  // ──────────────────────────────────────────────
  // Happy path
  // ──────────────────────────────────────────────

  it("injects content script and sends command message on a valid https page", async () => {
    queryMock.mockResolvedValue([{ id: 42, url: "https://example.com" }]);
    executeScriptMock.mockResolvedValue(null);
    sendMessageMock.mockResolvedValue({});

    await invoke("copy-link");

    expect(executeScriptMock).toHaveBeenCalledWith({
      target: { tabId: 42 },
      files: ["scripts/content.js"],
    });
    expect(sendMessageMock).toHaveBeenCalledWith(42, {
      type: "execute-command",
      command: "copy-link",
    });
  });
});
