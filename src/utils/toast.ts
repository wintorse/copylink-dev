import { showToastCore } from "../shared/ui/toast";

/**
 * Chrome extension wrapper for toast rendering. Provides platform-specific URL resolver.
 */
export const showToast = (message: string) =>
  showToastCore(message, {
    document,
    getCssHref: () => chrome.runtime.getURL("../styles/toast.css"),
  });
