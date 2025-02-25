import { Command } from "../types/types";
import { copyTextLink } from "./copyTextLink";

/**
 * Handles the execution of a given command on a current tab.
 *
 * @param command - The command to be executed.
 */
export function handleCommand(command: Command): void {
  try {
    copyTextLink(command);
  } catch (error) {
    console.error(error);
  }
}
