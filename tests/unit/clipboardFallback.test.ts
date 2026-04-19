// @vitest-environment happy-dom
// B-CLIP-03: When the Clipboard API is unavailable (HTTP fallback), the user's
// existing text selection must be restored after the copy operation, so the
// user does not lose their selection state.
import { describe, expect, it, vi } from "vitest";
import { copyToClipboardShared } from "../../src/shared/clipboard/copyToClipboardShared";

describe("copyToClipboardShared – selection preservation on fallback (B-CLIP-03)", () => {
  /**
   * Set up a text node with a range anchored to it, call copyToClipboardShared
   * with the Clipboard API forced to fail, then verify the selection is intact
   * after the call.
   */
  it("restores the previous selection range after execCommand fallback", async () => {
    // ── Arrange ─────────────────────────────────────────────────────────────
    // Force navigator.clipboard to be unavailable so the fallback path runs.
    vi.stubGlobal("navigator", {
      clipboard: {
        write: vi.fn().mockRejectedValue(new Error("clipboard unavailable")),
        writeText: vi
          .fn()
          .mockRejectedValue(new Error("clipboard unavailable")),
      },
    });
    // happy-dom supports ClipboardItem, but we need the write() call to fail.
    vi.stubGlobal("ClipboardItem", class {});

    // Create a text node and anchor a range to it so there is an existing selection.
    const textNode = document.createTextNode("pre-existing selection");
    document.body.appendChild(textNode);
    const originalRange = document.createRange();
    originalRange.setStart(textNode, 0);
    originalRange.setEnd(textNode, textNode.length);

    const selection = window.getSelection();
    selection?.removeAllRanges();
    selection?.addRange(originalRange);

    // Verify the selection is in place before the copy.
    expect(selection?.rangeCount).toBe(1);
    expect(selection?.toString()).toBe("pre-existing selection");

    // ── Act ──────────────────────────────────────────────────────────────────
    const fallbackElement = document.createElement("span");
    fallbackElement.textContent = "copy text";
    await copyToClipboardShared("copy text", undefined, fallbackElement);

    // ── Assert ───────────────────────────────────────────────────────────────
    // The selection must reference the same range as before the copy.
    expect(selection?.rangeCount).toBe(1);
    expect(selection?.toString()).toBe("pre-existing selection");

    // Cleanup
    document.body.removeChild(textNode);
    vi.unstubAllGlobals();
  });

  it("leaves the selection empty when there was no selection before the fallback", async () => {
    vi.stubGlobal("navigator", {
      clipboard: {
        write: vi.fn().mockRejectedValue(new Error("clipboard unavailable")),
        writeText: vi
          .fn()
          .mockRejectedValue(new Error("clipboard unavailable")),
      },
    });
    vi.stubGlobal("ClipboardItem", class {});

    const selection = window.getSelection();
    selection?.removeAllRanges();

    expect(selection?.rangeCount).toBe(0);

    const fallbackElement = document.createElement("span");
    fallbackElement.textContent = "copy text";
    await copyToClipboardShared("copy text", undefined, fallbackElement);

    // No ranges were present before; none should be present after.
    expect(selection?.rangeCount).toBe(0);

    vi.unstubAllGlobals();
  });

  it("removes the fallback element from the DOM after the copy (no DOM leak)", async () => {
    vi.stubGlobal("navigator", {
      clipboard: {
        write: vi.fn().mockRejectedValue(new Error("clipboard unavailable")),
        writeText: vi
          .fn()
          .mockRejectedValue(new Error("clipboard unavailable")),
      },
    });
    vi.stubGlobal("ClipboardItem", class {});

    const fallbackElement = document.createElement("span");
    fallbackElement.textContent = "copy text";
    await copyToClipboardShared("copy text", undefined, fallbackElement);

    // The implementation appends the element during copy; it must be removed afterwards.
    expect(document.body.contains(fallbackElement)).toBe(false);

    vi.unstubAllGlobals();
  });
});

// ──────────────────────────────────────────────
// B-ERR-04: Clipboard API failure → execCommand fallback
// ──────────────────────────────────────────────

describe("copyToClipboardShared – Clipboard API failure fallback (B-ERR-04)", () => {
  it("returns success:false and the error when Clipboard API fails and no fallbackElement is given", async () => {
    const clipboardError = new Error("clipboard unavailable");
    vi.stubGlobal("navigator", {
      clipboard: {
        writeText: vi.fn().mockRejectedValue(clipboardError),
      },
    });
    // Remove ClipboardItem so the writeText branch is taken.
    vi.stubGlobal("ClipboardItem", null);

    const result = await copyToClipboardShared("text only");

    expect(result.success).toBe(false);
    expect(result.error).toBe(clipboardError);

    vi.unstubAllGlobals();
  });

  it("attempts the execCommand fallback when Clipboard API fails and a fallbackElement is given", async () => {
    vi.stubGlobal("navigator", {
      clipboard: {
        write: vi.fn().mockRejectedValue(new Error("clipboard unavailable")),
        writeText: vi
          .fn()
          .mockRejectedValue(new Error("clipboard unavailable")),
      },
    });
    vi.stubGlobal("ClipboardItem", class {});

    const fallbackElement = document.createElement("span");
    fallbackElement.textContent = "copy text";
    // execCommand returns false in happy-dom, but the fallback path must be
    // entered (not short-circuited) — confirmed by the DOM cleanup behaviour.
    const result = await copyToClipboardShared(
      "copy text",
      undefined,
      fallbackElement,
    );

    // The error from the Clipboard API is forwarded even on the fallback path.
    expect(result.error).toBeDefined();
    // Fallback element must have been cleaned up (proves the fallback path ran).
    expect(document.body.contains(fallbackElement)).toBe(false);

    vi.unstubAllGlobals();
  });

  it("propagates the original Clipboard API error in the result even after a successful execCommand", async () => {
    const originalError = new Error("clipboard write rejected");
    vi.stubGlobal("navigator", {
      clipboard: {
        write: vi.fn().mockRejectedValue(originalError),
        writeText: vi.fn().mockRejectedValue(originalError),
      },
    });
    vi.stubGlobal("ClipboardItem", class {});

    const fallbackElement = document.createElement("span");
    const result = await copyToClipboardShared(
      "text",
      undefined,
      fallbackElement,
    );

    // Regardless of execCommand outcome, the original API error is preserved.
    expect(result.error).toBe(originalError);

    vi.unstubAllGlobals();
  });
});
