// oxlint-disable-next-line typescript/no-misused-promises -- async listener returns a Promise to keep the MV3 service worker alive; @types/chrome incorrectly types the return as void
chrome.commands.onCommand.addListener(async (command) => {
  // Get the active tab in the current window
  const [tab] = await chrome.tabs.query({
    active: true,
    currentWindow: true,
  });

  // Ensure we have a valid tab and tab ID
  const tabId = tab?.id;
  if (tabId === undefined) {
    console.error("No active tab found.");
    return;
  }

  // Skip non-web pages (e.g. chrome://, about:) where script injection is not allowed.
  const tabUrl = tab.url;
  if (tabUrl === undefined || tabUrl === "") {
    console.error("Tab URL is undefined.");
    return;
  }

  if (!tabUrl.startsWith("http://") && !tabUrl.startsWith("https://")) {
    console.error("Invalid URL scheme.");
    return;
  }

  // Inject the content script dynamically via activeTab + scripting permission.
  // The guard inside content.ts prevents duplicate listener registration.
  try {
    await chrome.scripting.executeScript({
      target: { tabId },
      files: ["scripts/content.js"],
    });
  } catch (error) {
    console.error("Failed to inject content script:", error);
    return;
  }

  // Send the command to the content script for execution
  try {
    await chrome.tabs.sendMessage(tabId, { type: "execute-command", command });
  } catch (error) {
    console.error(`Error sending command ${command}:`, error);
  }
});
