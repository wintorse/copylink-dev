import type { Command } from "../types/types";
import { handleCommand } from "./commands";

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

chrome.runtime.onMessage.addListener((message) => {
  if (message.type === "execute-command" && isValidCommand(message.command)) {
    handleCommand(message.command).catch(console.error);
  }
});
