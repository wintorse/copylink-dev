import type { Command } from "../types/types";
import { VALID_COMMANDS } from "../shared/constants";
import { handleCommand } from "./commands";

// Guard against duplicate injection when using chrome.scripting.executeScript()
const g = globalThis as Record<string, unknown>;
if (g.__copylinkDevInjected !== true) {
  g.__copylinkDevInjected = true;

  const isValidCommand = (command: string): command is Command => {
    return Object.values(VALID_COMMANDS).some((c) => c === command);
  };

  // Listen for messages from the background script to execute commands
  chrome.runtime.onMessage.addListener((message, _sender, sendResponse) => {
    if (message.type === "execute-command" && isValidCommand(message.command)) {
      handleCommand(message.command)
        .then((result) => {
          sendResponse({ success: true, result });
        })
        .catch((error) => {
          console.error(error);
          sendResponse({
            success: false,
            error: error instanceof Error ? error.message : String(error),
          });
        });
      return true; // Keep the message port open for async response
    }
    return false;
  });
}
