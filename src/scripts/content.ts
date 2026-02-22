import type { Command } from "../types/types";
import { handleCommand } from "./commands";

declare global {
  interface Window {
    hasCopylinkDevListener?: boolean;
  }
}

const getValidCommands = () =>
  ({
    COPY_LINK: "copy-link",
    COPY_LINK_FOR_SLACK: "copy-link-for-slack",
    COPY_TITLE: "copy-title",
    COPY_GOOGLE_SHEETS_RANGE: "copy-google-sheets-range",
  }) as const;

const isValidCommand = (command: string): command is Command => {
  const validCommands = getValidCommands();
  return Object.values(validCommands).some((c) => c === command);
};

if (window.hasCopylinkDevListener !== true) {
  window.hasCopylinkDevListener = true;
  window.addEventListener("copylinkDevExecuteCommand", (event: Event) => {
    const customEvent = event as CustomEvent<string>;
    const command = customEvent.detail;
    if (isValidCommand(command)) {
      handleCommand(command).catch(console.error);
    }
  });
}
