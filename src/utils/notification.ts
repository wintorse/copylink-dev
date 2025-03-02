/**
 * Displays a notification.
 *
 * @param {string} message
 */
export function createNotification(message: string) {
  const notificationId = "copylink.dev-notification";
  chrome.notifications.create(
    notificationId,
    {
      type: "basic",
      iconUrl: chrome.runtime.getURL("images/icon-128.png"),
      title: "copylink.dev",
      message: message,
      silent: true,
    },
    () => {
      if (chrome.runtime.lastError) {
        console.error(chrome.runtime.lastError);
      } else {
        console.log("Notification created", message, notificationId);
        setTimeout(() => {
          chrome.notifications.clear(notificationId, (wasCleared) => {
            if (chrome.runtime.lastError) {
              console.error(chrome.runtime.lastError);
            } else if (!wasCleared) {
              console.error(
                `Failed to clear notification with ID: ${notificationId}`
              );
            } else if (wasCleared) {
              console.log("Notification cleared", notificationId);
              chrome.notifications.getAll((notifications) => {
                console.log("Notifications", notifications);
              });
            }
          });
        }, 3000);
      }
    }
  );
}
