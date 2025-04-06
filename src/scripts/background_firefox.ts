// import { createNotification } from "../utils/notification";

try {
  chrome.commands.onCommand.addListener((command) => {
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      const tabId = tabs[0].id;
      if (tabId !== undefined) {
        chrome.tabs.executeScript(tabId, { file: "scripts/content.js" }, () => {
          if (chrome.runtime.lastError) {
            console.error(
              `Error injecting content script: ${chrome.runtime.lastError.message}`
            );
            return;
          }
          chrome.tabs.executeScript(
            tabId,
            {
              code: `
                window.dispatchEvent(
                  new CustomEvent("copylinkDevExecuteCommand", {
                    detail: "${command}"
                  })
                );
              `,
            },
            () => {
              if (chrome.runtime.lastError) {
                console.error(
                  `Error executing script for command ${command}: ${chrome.runtime.lastError.message}`
                );
              }
            }
          );
        });
      }
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
