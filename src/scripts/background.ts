// import { createNotification } from "../utils/notification";

try {
  chrome.commands.onCommand.addListener((command) => {
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      const tabId = tabs[0].id;
      if (tabId === undefined) {
        console.error("No active tab found.");
        return;
      }
      chrome.scripting
        .executeScript({
          target: { tabId: tabId },
          files: ["scripts/content.js"],
        })
        .then(() =>
          chrome.scripting.executeScript({
            target: { tabId: tabId },
            func: (command) => {
              window.dispatchEvent(
                new CustomEvent("copylinkDevExecuteCommand", {
                  detail: command,
                }),
              );
            },
            args: [command],
          }),
        )
        .catch((error) => {
          console.error(
            `Error executing script for command ${command}:`,
            error,
          );
        });
    });
    return true;
  });

  // chrome.runtime.onMessage.addListener((message, _, __) => {
  //   console.log("Received message", message.type, message.message);
  //   if (message.type === "copylink.dev-notification") {
  //     createNotification(message.message);
  //   }
  // });
} catch (error) {
  console.error(error);
}
