import type { Command } from "../types/types";
import type { CopyResult } from "../shared/clipboard/copyToClipboardShared";
import { copyTextLink } from "./copyTextLink";

/**
 * Handles the execution of a given command on a current tab.
 *
 * @param {Command} command - The command to be executed.
 * @returns The copy result, or undefined for commands that do not apply.
 */
export const handleCommand = (
  command: Command,
): Promise<CopyResult | undefined> => copyTextLink(command);
