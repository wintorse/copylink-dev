// @vitest-environment node
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { copyTextLink } from "../../src/scripts/copyTextLink";
import { handleCommand } from "../../src/scripts/commands";

vi.mock("../../src/scripts/copyTextLink", () => ({ copyTextLink: vi.fn() }));

type Listener = (
  message: { type: string; command: string },
  sender: object,
  respond: (data: object) => void,
) => boolean;
let listener: Listener | undefined;

beforeEach(async () => {
  vi.resetModules();
  vi.mocked(copyTextLink).mockReset();
  listener = undefined;
  delete (globalThis as Record<string, unknown>).__copylinkDevInjected;
  vi.stubGlobal("chrome", {
    runtime: {
      onMessage: {
        addListener: (callback: Listener) => {
          listener = callback;
        },
      },
    },
  });
  await import("../../src/scripts/content");
});

afterEach(() => {
  vi.unstubAllGlobals();
  vi.restoreAllMocks();
});

describe("command results", () => {
  it("returns the copy result from the command handler", async () => {
    vi.mocked(copyTextLink).mockResolvedValue({ success: false });
    expect(await handleCommand("copy-link")).toEqual({ success: false });
  });

  it.each([
    { success: true },
    { success: false, error: new Error("clipboard failed") },
  ])("responds with the actual copy outcome: %j", async (result) => {
    vi.mocked(copyTextLink).mockResolvedValue(result);
    const respond = vi.fn();
    if (!listener) {
      throw new Error("Missing listener");
    }
    expect(
      listener({ type: "execute-command", command: "copy-link" }, {}, respond),
    ).toBe(true);
    await vi.waitFor(() =>
      expect(respond).toHaveBeenCalledWith(
        result.success
          ? { success: true, result: { success: true } }
          : { success: false, error: "clipboard failed" },
      ),
    );
  });

  it("propagates thrown errors to a failure response", async () => {
    vi.spyOn(console, "error").mockImplementation(() => {});
    vi.mocked(copyTextLink).mockRejectedValue(new Error("storage failed"));
    const respond = vi.fn();
    if (!listener) {
      throw new Error("Missing listener");
    }
    listener({ type: "execute-command", command: "copy-link" }, {}, respond);
    await vi.waitFor(() =>
      expect(respond).toHaveBeenCalledWith({
        success: false,
        error: "storage failed",
      }),
    );
  });
});
