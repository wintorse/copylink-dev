import type { Command } from "../types/types";
import { copyTextLink } from "./copyTextLink";

/**
 * Handles the execution of a given command on a current tab.
 *
 * @param {Command} command - The command to be executed.
 */
export const handleCommand = async (command: Command): Promise<void> => {
  try {
    await copyTextLink(command);
  } catch (error) {
    console.error(error);
  }
};
