chrome.commands.onCommand.addListener((command) => {
  void (async () => {
    const [tab] = await chrome.tabs.query({
      active: true,
      currentWindow: true,
    });
    const tabId = tab?.id;
    if (tabId === undefined) {
      console.error("No active tab found.");
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
    chrome.tabs.sendMessage(tabId, { type: "execute-command", command }, () => {
      if (chrome.runtime.lastError) {
        console.error(
          `Error sending command ${command}:`,
          chrome.runtime.lastError.message,
        );
      }
    });
  })();
});
