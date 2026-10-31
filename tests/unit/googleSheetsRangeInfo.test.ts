import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { getGoogleSheetsRangeInfo } from "../../src/shared/getGoogleSheetsRangeLink";

const baseUrl = "https://docs.google.com/spreadsheets/d/test/edit?usp=sharing";

beforeEach(() => {
  document.body.innerHTML = '<input id="t-name-box" value="C2:E4">';
  vi.spyOn(console, "warn").mockImplementation(() => {});
});

afterEach(() => {
  vi.unstubAllGlobals();
  vi.restoreAllMocks();
  document.body.innerHTML = "";
});

describe("Google Sheets range extraction", () => {
  it.each(["", "#range=C2:E4", "#gid=&range=C2:E4"])(
    "defaults to gid=0 when the hash has no sheet ID: %s",
    (hash) => {
      vi.stubGlobal("window", { location: { href: baseUrl + hash } });

      expect(getGoogleSheetsRangeInfo()).toEqual({
        rangeString: "C2:E4",
        link: `${baseUrl}#gid=0&range=C2:E4`,
      });
    },
  );

  it("preserves the selected sheet ID and replaces the previous hash", () => {
    vi.stubGlobal("window", {
      location: { href: `${baseUrl}#gid=123&range=A1` },
    });

    expect(getGoogleSheetsRangeInfo()).toEqual({
      rangeString: "C2:E4",
      link: `${baseUrl}#gid=123&range=C2:E4`,
    });
  });

  it.each(["missing", "empty"])(
    "returns no range when the name box is %s",
    (state) => {
      vi.stubGlobal("window", { location: { href: `${baseUrl}#gid=123` } });
      document.body.innerHTML =
        state === "empty" ? '<input id="t-name-box" value="">' : "";

      expect(getGoogleSheetsRangeInfo()).toBeNull();
      expect(console.warn).toHaveBeenCalledWith("Name box not found.");
    },
  );
});
