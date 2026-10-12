import { afterEach, describe, expect, it, vi } from "vitest";
import { getFormattedTitle } from "../../src/shared/getFormattedTitle";

afterEach(() => {
  vi.restoreAllMocks();
  vi.unstubAllGlobals();
  document.body.innerHTML = "";
  document.body.id = "";
});

describe("issue title fallback", () => {
  it.each([
    ["redmine.example.com", "", '<div id="content"><h2>Issue #1</h2></div>'],
    ["jira.example.com", "jira", '<a id="key-val">A-1</a>'],
  ])(
    "uses document.title when the issue summary is absent on %s",
    (hostname, bodyId, html) => {
      vi.stubGlobal("window", {
        location: {
          hostname,
          href: `https://${hostname}/issues/1`,
          pathname: "/issues/1",
        },
      });
      document.title = "Fallback title";
      document.body.id = bodyId;
      document.body.innerHTML = html;
      expect(getFormattedTitle()).toBe("Fallback title");
    },
  );
  it.each([
    [
      "redmine.example.com",
      "",
      '<div id="content"><h2>Issue #1</h2><h3>Summary</h3></div>',
      "Issue #1: Summary",
    ],
    [
      "jira.example.com",
      "jira",
      '<a id="key-val">A-1</a><div id="summary-val"><h2>Summary</h2></div>',
      "A-1 Summary",
    ],
  ])(
    "keeps complete issue titles on %s",
    (hostname, bodyId, html, expected) => {
      vi.stubGlobal("window", {
        location: {
          hostname,
          href: `https://${hostname}/issues/1`,
          pathname: "/issues/1",
        },
      });
      document.body.id = bodyId;
      document.body.innerHTML = html;
      expect(getFormattedTitle()).toBe(expected);
    },
  );
});
