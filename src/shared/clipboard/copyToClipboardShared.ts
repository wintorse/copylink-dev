export type CopyResult = { success: boolean; error?: unknown };

/**
 * Platform-neutral clipboard helper with optional HTML and fallback element.
 * - Tries `navigator.clipboard` first.
 * - Falls back to `execCommand('copy')` + `copy` event handling on the provided `fallbackElement` when available.
 *   In fallback mode, sets `text/plain` and optionally `text/html` via `ClipboardEvent.clipboardData`.
 * - Returns a boolean result and keeps UI concerns (toast/i18n) at the call site.
 * @param text Plain-text content to copy.
 * @param html Optional HTML content to copy.
 * @param fallbackElement Optional element used for legacy copy fallback.
 * @returns Copy operation result.
 */
export const copyToClipboardShared = async (
  text: string,
  html?: string,
  fallbackElement?: HTMLElement,
): Promise<CopyResult> => {
  try {
    if (typeof html === "string" && "ClipboardItem" in window) {
      await navigator.clipboard.write([
        new ClipboardItem({
          "text/plain": text,
          "text/html": html,
        }),
      ]);
    } else {
      await navigator.clipboard.writeText(text);
    }
    return { success: true };
  } catch (error) {
    if (!fallbackElement) {
      return { success: false, error };
    }
    const selection = window.getSelection();
    const previousRanges: Array<Range> = [];
    if (selection) {
      for (let i = 0; i < selection.rangeCount; i += 1) {
        previousRanges.push(selection.getRangeAt(i).cloneRange());
      }
    }

    let success = false;
    let copiedViaClipboardData = false;
    let listenerAttached = false;
    const onCopy = (event: ClipboardEvent): void => {
      const clipboardData = event.clipboardData;
      if (!clipboardData) {
        return;
      }
      event.preventDefault();
      clipboardData.setData("text/plain", text);
      if (typeof html === "string") {
        clipboardData.setData("text/html", html);
      }
      copiedViaClipboardData = true;
    };
    try {
      document.addEventListener("copy", onCopy);
      listenerAttached = true;
      document.body.appendChild(fallbackElement);
      if (selection) {
        const range = document.createRange();
        range.selectNode(fallbackElement);
        selection.removeAllRanges();
        selection.addRange(range);
        try {
          // oxlint-disable-next-line no-deprecated --- Required for copy support in HTTP pages
          const commandSuccess = document.execCommand("copy");
          success = copiedViaClipboardData || commandSuccess;
        } catch {
          success = false;
        }
      }
    } finally {
      if (selection) {
        selection.removeAllRanges();
        for (const range of previousRanges) {
          selection.addRange(range);
        }
      }
      if (listenerAttached) {
        document.removeEventListener("copy", onCopy);
      }
      if (fallbackElement.isConnected) {
        document.body.removeChild(fallbackElement);
      }
    }
    return { success, error };
  }
};
