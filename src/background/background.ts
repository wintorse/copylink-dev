/**
 * Listens for keyboard commands and handles them accordingly.
 *
 * @param {string} command - The command string received from the keyboard shortcut.
 * @param {chrome.tabs.Tab} tab - The current tab where the command was triggered.
 */

import { handleCommand } from "../scripts/commands";

const validCommands = ["copy-link", "copy-link-for-slack", "copy-title"];

chrome.commands.onCommand.addListener(async (command: string, tab) => {
  if (!tab.id || tab.id === -1 || !validCommands.includes(command)) {
    return;
  }
  handleCommand(command, tab.id);
});
