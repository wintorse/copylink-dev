// @vitest-environment happy-dom
// B-TOAST-04: The toast is rendered inside a Shadow DOM, isolating it from the
// host page's CSS cascade.  These tests verify:
//   1. The .copylink-dev-toast element lives inside a shadow root, not in the
//      main document tree (structural isolation).
//   2. The toast's <style> tag is scoped to the shadow root and does NOT appear
//      in document.head (style encapsulation).
//   3. A page-level CSS rule targeting .copylink-dev-toast does not appear
//      inside the shadow DOM (cascade isolation).
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { showToastCore } from "../../src/shared/ui/toast";

/**
 * Return the shadow host appended to document.body by showToastCore.
 * Throws if the element is missing or not an HTMLElement.
 * @returns The host HTMLElement containing the shadow root.
 */
const getHost = (): HTMLElement => {
  const host = document.body.lastElementChild;
  if (!(host instanceof HTMLElement)) {
    throw new Error("Expected an HTMLElement as the last child of body");
  }
  return host;
};

describe("showToastCore – Shadow DOM isolation (B-TOAST-04)", () => {
  beforeEach(() => {
    document.body.innerHTML = "";
    // Use fake timers so the long-lived setTimeout inside showToastCore
    // does not create real Node.js timers that keep the event loop open.
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.clearAllTimers();
    vi.useRealTimers();
    document.body.innerHTML = "";
  });

  it("attaches a shadow root to the host element", async () => {
    await showToastCore("hello", document, { durationMs: 60_000 });

    expect(getHost().shadowRoot).not.toBeNull();
  });

  it("places .copylink-dev-toast inside the shadow root, not in the main document", async () => {
    await showToastCore("hello", document, { durationMs: 60_000 });

    // Must NOT be reachable from the main document tree.
    expect(document.querySelector(".copylink-dev-toast")).toBeNull();

    // Must be reachable from inside the shadow root.
    const toastInShadow = getHost().shadowRoot?.querySelector(
      ".copylink-dev-toast",
    );
    expect(toastInShadow).not.toBeNull();
  });

  it("places the toast <style> tag inside the shadow root, not in document.head", async () => {
    const stylesBefore = document.head.querySelectorAll("style").length;

    await showToastCore("hello", document, { durationMs: 60_000 });

    // No new <style> tags should have been added to document.head.
    expect(document.head.querySelectorAll("style").length).toBe(stylesBefore);

    // The shadow root must contain the <style> tag.
    const styleInShadow = getHost().shadowRoot?.querySelector("style");
    expect(styleInShadow).not.toBeNull();
  });

  it("page-level CSS rules targeting .copylink-dev-toast do not appear inside the shadow DOM", async () => {
    // Inject a distinctive page-level rule before the toast is shown.
    const pageStyle = document.createElement("style");
    pageStyle.textContent = ".copylink-dev-toast { color: rgb(255, 0, 128); }";
    document.head.appendChild(pageStyle);

    await showToastCore("hello", document, { durationMs: 60_000 });

    const shadowStyle = getHost().shadowRoot?.querySelector("style");

    // The shadow root's own <style> must not contain the page-level rule.
    expect(shadowStyle?.textContent).not.toContain("rgb(255, 0, 128)");

    pageStyle.remove();
  });
});
