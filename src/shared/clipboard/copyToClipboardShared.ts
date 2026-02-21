export type CopyResult = { success: boolean; error?: unknown };

/**
 * Platform-neutral clipboard helper with optional HTML and fallback element.
 * - Tries `navigator.clipboard` first.
 * - Falls back to `execCommand('copy')` on the provided `fallbackElement` when available.
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
    if (navigator.clipboard) {
      if (html && "ClipboardItem" in window) {
        const ClipboardItemCtor = (
          window as typeof window & {
            ClipboardItem: typeof ClipboardItem;
          }
        ).ClipboardItem;
        await navigator.clipboard.write([
          new ClipboardItemCtor({
            "text/plain": new Blob([text], { type: "text/plain" }),
            "text/html": new Blob([html], { type: "text/html" }),
          }),
        ]);
      } else {
        await navigator.clipboard.writeText(text);
      }
      return { success: true };
    }
    throw new Error("Clipboard API not available");
  } catch (error) {
    if (!fallbackElement) {
      return { success: false, error };
    }
    document.body.appendChild(fallbackElement);
    const range = document.createRange();
    range.selectNode(fallbackElement);
    const selection = window.getSelection();
    let success = false;
    if (selection) {
      selection.removeAllRanges();
      selection.addRange(range);
      try {
        success = document.execCommand("copy");
      } catch {
        success = false;
      }
      selection.removeAllRanges();
    }
    document.body.removeChild(fallbackElement);
    return { success, error };
  }
};
