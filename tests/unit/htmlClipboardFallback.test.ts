import { afterEach, describe, expect, it, vi } from "vitest";
import { copyToClipboardShared } from "../../src/shared/clipboard/copyToClipboardShared";

afterEach(() => {
  vi.unstubAllGlobals();
  vi.restoreAllMocks();
  Reflect.deleteProperty(document, "execCommand");
});

describe("HTML clipboard fallback", () => {
  it("uses the copy event when ClipboardItem is unavailable instead of losing HTML", async () => {
    const writeText = vi.fn().mockResolvedValue(null);
    vi.stubGlobal("navigator", { clipboard: { writeText } });
    vi.stubGlobal("ClipboardItem", null);
    const data = new Map<string, string>();
    Object.defineProperty(document, "execCommand", {
      configurable: true,
      value: vi.fn(() => {
        const event = new Event("copy", { cancelable: true });
        Object.defineProperty(event, "clipboardData", {
          value: {
            setData: (type: string, content: string) => data.set(type, content),
          },
        });
        document.dispatchEvent(event);
        return true;
      }),
    });
    const element = document.createElement("span");
    const html = '<a href="https://example.com/">Title</a>&nbsp;';
    const result = await copyToClipboardShared("Title", html, element);
    expect(result.success).toBe(true);
    expect(writeText).not.toHaveBeenCalled();
    expect(data.get("text/html")).toBe(html);
    expect(data.get("text/plain")).toBe("Title");
    expect(element.isConnected).toBe(false);
  });

  it("reports failure without an HTML-capable fallback", async () => {
    const writeText = vi.fn().mockResolvedValue(null);
    vi.stubGlobal("navigator", { clipboard: { writeText } });
    vi.stubGlobal("ClipboardItem", null);
    expect((await copyToClipboardShared("Title", "<a>Title</a>")).success).toBe(
      false,
    );
    expect(writeText).not.toHaveBeenCalled();
  });

  it("still uses writeText for plain text", async () => {
    const writeText = vi.fn().mockResolvedValue(null);
    vi.stubGlobal("navigator", { clipboard: { writeText } });
    expect((await copyToClipboardShared("Title")).success).toBe(true);
    expect(writeText).toHaveBeenCalledWith("Title");
  });
});
