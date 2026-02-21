import { buildNotificationConfig } from "../shared/ui/notification";

/**
 * Chrome extension wrapper for notifications. Uses shared config builder and injects runtime URLs.
 * @param message Notification message to display.
 * @returns No return value.
 */
export const createNotification = (message: string) => {
  const config = buildNotificationConfig(message);
  chrome.notifications.create(
    config.id,
    {
      type: "basic",
      iconUrl: chrome.runtime.getURL(config.iconPath),
      title: config.title,
      message: config.message,
      silent: true,
    },
    () => {
      if (chrome.runtime.lastError) {
        console.error(chrome.runtime.lastError);
        return;
      }
      if (!config.autoClearMs) {
        return;
      }
      setTimeout(() => {
        chrome.notifications.clear(config.id, (wasCleared) => {
          if (chrome.runtime.lastError) {
            console.error(chrome.runtime.lastError);
          } else if (!wasCleared) {
            console.error(`Failed to clear notification with ID: ${config.id}`);
          }
        });
      }, config.autoClearMs);
    },
  );
};
