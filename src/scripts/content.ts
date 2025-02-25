import { handleCommand } from "./commands";
import { ValidCommands } from "../types/types";
import type { Command } from "../types/types";

chrome.runtime.onMessage.addListener((message, _, sendResponse) => {
  if (isValidCommand(message.command)) {
    handleCommand(message.command);
    sendResponse({ success: true });
  } else {
    sendResponse({ success: false });
  }
});

function isValidCommand(command: string): command is Command {
  return (Object.values(ValidCommands) as ReadonlyArray<string>).includes(
    command
  );
}
