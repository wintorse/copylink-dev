// @vitest-environment node
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

// Mock the commands module to break the import chain into chrome storage APIs.
// content.ts imports handleCommand from ./commands, which would otherwise pull
// in copyTextLink → getEmojiName → chrome.storage.local etc.
vi.mock("../../src/scripts/commands", () => ({
  handleCommand: vi.fn(),
}));

describe("content.ts duplicate injection guard (B-CS-01)", () => {
  let addListenerMock: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    // Reset the guard flag so each test starts as if the script was never injected.
    delete (globalThis as Record<string, unknown>).__copylinkDevInjected;
    vi.resetModules();

    addListenerMock = vi.fn();
    vi.stubGlobal("chrome", {
      runtime: {
        onMessage: {
          addListener: addListenerMock,
        },
      },
    });
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("registers the message listener on the first injection", async () => {
    await import("../../src/scripts/content");

    expect(addListenerMock).toHaveBeenCalledTimes(1);
  });

  it("sets the __copylinkDevInjected flag after first injection", async () => {
    await import("../../src/scripts/content");

    expect((globalThis as Record<string, unknown>).__copylinkDevInjected).toBe(
      true,
    );
  });

  it("does NOT re-register the listener when the script is injected a second time", async () => {
    // First injection — listener registered once.
    await import("../../src/scripts/content");
    expect(addListenerMock).toHaveBeenCalledTimes(1);

    // Simulate a second injection: module cache is cleared but the globalThis
    // flag persists, so the guard inside content.ts should prevent re-registration.
    vi.resetModules();
    await import("../../src/scripts/content");

    expect(addListenerMock).toHaveBeenCalledTimes(1); // still only once
  });
});
