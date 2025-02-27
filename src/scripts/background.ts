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
} catch (error) {
  console.error(error);
}
