import { copyTextLink } from "./copyTextLink";

/**
 * Handles the execution of a given command on a specified browser tab.
 *
 * @param command - The command to be executed.
 * @param tabId - The ID of the tab where the command should be executed.
 */
export function handleCommand(command: string, tabId: number): void {
  chrome.scripting.executeScript(
    {
      target: { tabId: tabId },
      func: copyTextLink,
      args: [command],
    },
    (results) => {
      if (chrome.runtime.lastError) {
        console.error(chrome.runtime.lastError.message);
      } else if (!results || results.length === 0) {
        console.error("No active tab found");
      }
    }
  );
}
