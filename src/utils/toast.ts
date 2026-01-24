import { showToastCore } from "../shared/ui/toast";

/**
 * Chrome extension wrapper for toast rendering. No additional CSS needed because the shared core handles styling.
 */
export const showToast = (message: string) =>
	showToastCore(message, document, {
		getCssHref: () => chrome.runtime.getURL("../styles/toast.css"),
	});
