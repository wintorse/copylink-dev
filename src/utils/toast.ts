import { showToastCore } from "../shared/ui/toast";

/**
 * Chrome extension wrapper for toast rendering. No additional CSS needed because the shared core handles styling.
 * @param message Toast message to show.
 * @returns Promise that resolves when the toast is shown.
 */
export const showToast = (message: string) =>
  showToastCore(message, document, {
    getCssHref: () => chrome.runtime.getURL("../styles/toast.css"),
  });
