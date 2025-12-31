import { handleCommand } from "./commands";
import type { Command } from "../types/types";

declare global {
  interface Window {
    hasCopylinkDevListener?: boolean;
  }
}

function getValidCommands() {
  return {
    COPY_LINK: "copy-link",
    COPY_LINK_FOR_SLACK: "copy-link-for-slack",
    COPY_TITLE: "copy-title",
  } as const;
}

function isValidCommand(command: string): command is Command {
  const validCommands = getValidCommands();
  return Object.values(validCommands).some((c) => c === command);
}

if (!window.hasCopylinkDevListener) {
  window.hasCopylinkDevListener = true;
  window.addEventListener("copylinkDevExecuteCommand", (event) => {
    const command = (event as CustomEvent).detail;
    if (isValidCommand(command)) {
      handleCommand(command);
      return true;
    }
    return false;
  });
}
