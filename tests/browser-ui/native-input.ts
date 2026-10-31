import { execFile } from "node:child_process";
import { promisify } from "node:util";

const run = promisify(execFile);

export async function pressShortcut(
  windowTitle: string,
  shortcut: string,
): Promise<void> {
  const { stdout } = await run(
    "xdotool",
    ["search", "--sync", "--onlyvisible", "--name", windowTitle],
    { timeout: 10_000 },
  );
  const windowId = stdout.trim().split("\n")[0];
  if (!windowId) {
    throw new Error(`No visible browser window matches ${windowTitle}`);
  }
  await run("xdotool", ["windowfocus", "--sync", windowId]);
  await run("xdotool", ["key", "--clearmodifiers", shortcut]);
}

export async function readNativeClipboard(
  target = "UTF8_STRING",
): Promise<string> {
  const { stdout } = await run(
    "xclip",
    ["-selection", "clipboard", "-out", "-target", target],
    { timeout: 5_000 },
  );
  return stdout;
}
