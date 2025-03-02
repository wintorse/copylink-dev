import { handleCommand } from "./commands";
import { ValidCommands } from "../types/types";
import type { Command } from "../types/types";

window.addEventListener("executeCommand", (event) => {
  const command = (event as CustomEvent).detail;
  if (isValidCommand(command)) {
    handleCommand(command);
    return true;
  }
  return false;
});

function isValidCommand(command: string): command is Command {
  return (Object.values(ValidCommands) as ReadonlyArray<string>).includes(
    command
  );
}
