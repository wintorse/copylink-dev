// import { createNotification } from "../utils/notification";

try {
  chrome.commands.onCommand.addListener((command) => {
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      if (tabs[0].id) {
        chrome.tabs
          .sendMessage(tabs[0].id, { command: command })
          .catch((error) => {
            console.error(`Error sending command ${command}:`, error);
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
