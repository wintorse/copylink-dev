// import { createNotification } from "../utils/notification";

chrome.commands.onCommand.addListener((command) => {
  chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
    const tabId = tabs[0]?.id;
    if (tabId === undefined) {
      console.error("No active tab found.");
      return;
    }
    const tabUrl = tabs[0]?.url;
    // The manifest excludes XML pages; avoid messaging those tabs.
    if (
      tabUrl !== undefined &&
      tabUrl !== "" &&
      new URL(tabUrl).pathname.toLowerCase().endsWith(".xml")
    ) {
      return;
    }

    chrome.tabs.sendMessage(tabId, { type: "execute-command", command }, () => {
      if (chrome.runtime.lastError) {
        console.error(
          `Error sending command ${command}:`,
          chrome.runtime.lastError.message,
        );
      }
    });
  });
});

// chrome.runtime.onMessage.addListener((message, _, __) => {
//   console.log("Received message", message.type, message.message);
//   if (message.type === "copylink.dev-notification") {
//     createNotification(message.message);
//   }
// });
