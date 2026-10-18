// @vitest-environment node
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { copyTextLink } from "../../src/scripts/copyTextLink";

vi.mock("../../src/scripts/copyTextLink", () => ({ copyTextLink: vi.fn() }));

type Listener = (
  message: { type: string; command: string },
  sender: object,
  respond: () => void,
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

describe("command completion", () => {
  it("keeps the message port open and responds only after the command completes", async () => {
    const complete = vi.fn<() => void>();
    vi.mocked(copyTextLink).mockReturnValue(
      new Promise<void>((resolve) => {
        complete.mockImplementation(resolve);
      }),
    );
    const respond = vi.fn();
    if (!listener) {
      throw new Error("Missing listener");
    }
    expect(
      listener({ type: "execute-command", command: "copy-link" }, {}, respond),
    ).toBe(true);
    await new Promise<void>((resolve) => {
      setImmediate(resolve);
    });
    expect(copyTextLink).toHaveBeenCalledWith("copy-link");
    expect(respond).not.toHaveBeenCalled();

    complete();

    await vi.waitFor(() => expect(respond).toHaveBeenCalledExactlyOnceWith());
  });

  it("logs command errors locally and still responds with completion only", async () => {
    const errorSpy = vi.spyOn(console, "error").mockImplementation(() => {});
    const error = new Error("storage failed");
    vi.mocked(copyTextLink).mockRejectedValue(error);
    const respond = vi.fn();
    if (!listener) {
      throw new Error("Missing listener");
    }
    expect(
      listener({ type: "execute-command", command: "copy-link" }, {}, respond),
    ).toBe(true);
    await vi.waitFor(() => expect(respond).toHaveBeenCalledExactlyOnceWith());
    expect(errorSpy).toHaveBeenCalledWith(error);
  });
});
