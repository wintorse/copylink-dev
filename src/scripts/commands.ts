import type { Command } from "../types/types";
import { copyTextLink } from "./copyTextLink";

/**
 * Handles the execution of a given command on a current tab.
 *
 * @param {Command} command - The command to be executed.
 * @returns Resolves when command execution is complete.
 */
export const handleCommand = (command: Command): Promise<void> =>
  copyTextLink(command);
