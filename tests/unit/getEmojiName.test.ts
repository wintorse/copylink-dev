// @vitest-environment happy-dom
import { beforeEach, describe, expect, it } from "vitest";
import { getGitHubPullRequestStatus } from "../../src/shared/githubPullRequestStatus";

describe("getGitHubPullRequestStatus", () => {
  beforeEach(() => {
    document.body.innerHTML = "";
  });

  it("ignores GitHub header menu text and reads the PR status data attribute", () => {
    document.body.innerHTML = `
      <header>
        <button><span>Open Menu</span></button>
        <div class="d-flex flex-items-center gap-2 flex-shrink-0">
          <span data-status="pullOpened"><svg aria-hidden="true"></svg></span>
        </div>
      </header>
    `;

    expect(getGitHubPullRequestStatus()).toBe("open");
  });

  it("reads status from the data-status attribute before other text", () => {
    document.body.innerHTML = `
      <header>
        <span data-status="pullMerged" aria-label="Status: Open">Open</span>
      </header>
    `;

    expect(getGitHubPullRequestStatus()).toBe("merged");
  });

  it.each([
    ["draft", "draft"],
    ["pullOpened", "open"],
    ["pullMerged", "merged"],
    ["pullClosed", "closed"],
  ] as const)("maps data-status=%s to %s", (dataStatus, expected) => {
    document.body.innerHTML = `
      <header>
        <span data-status="${dataStatus}"></span>
      </header>
    `;

    expect(getGitHubPullRequestStatus()).toBe(expected);
  });

  it("falls back to reviewable_state text for GitHub Files Changed", () => {
    document.body.innerHTML = `
      <main>
        <span reviewable_state="ready">Open</span>
        <span reviewable_state="ready">Open</span>
      </main>
    `;

    expect(getGitHubPullRequestStatus()).toBe("open");
  });

  it("prefers data-status over reviewable_state text", () => {
    document.body.innerHTML = `
      <header>
        <span data-status="pullMerged"></span>
      </header>
      <main>
        <span reviewable_state="ready">Open</span>
      </main>
    `;

    expect(getGitHubPullRequestStatus()).toBe("merged");
  });
});
