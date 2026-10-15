import { afterEach, expect, it, vi } from "vitest";

vi.mock("../../src/shared/clipboard/copyToClipboardShared", () => ({
  copyToClipboardShared: vi.fn(),
}));

afterEach(() => {
  vi.unstubAllGlobals();
  vi.restoreAllMocks();
  document.body.innerHTML = "";
});

it("shows exportFailure when the asynchronous storage callback reports an error", async () => {
  document.body.innerHTML =
    '<button id="exportButton"></button><span id="exportMessage"></span>';
  const runtime: { lastError?: { message: string } } = {};
  vi.spyOn(console, "error").mockImplementation(() => {});
  vi.stubGlobal("chrome", {
    runtime,
    i18n: { getMessage: (key: string) => key },
    storage: {
      local: {
        get: (
          keys: string | Array<string>,
          callback: (data: object) => void,
        ) => {
          if (Array.isArray(keys)) {
            queueMicrotask(() => {
              runtime.lastError = { message: "storage failed" };
              callback({});
              delete runtime.lastError;
            });
          } else {
            callback({});
          }
        },
      },
    },
  });
  await import("../../src/popup/popup");
  document.dispatchEvent(new Event("DOMContentLoaded"));
  document.getElementById("exportButton")?.click();
  await vi.waitFor(() =>
    expect(document.getElementById("exportMessage")?.textContent).toBe(
      "exportFailure",
    ),
  );
});
