// @vitest-environment node
// B-TOAST-02: Verify that the toast notification CSS positions the element in
// the bottom-left corner as specified (bottom: 24px, left: 24px).
// This is a static asset test — it reads toast.css directly, no browser needed.
import { describe, expect, it } from "vitest";
import fs from "fs";
import path from "path";

const TOAST_CSS = path.resolve(
  import.meta.dirname,
  "..",
  "..",
  "public",
  "styles",
  "toast.css",
);

const css = fs.readFileSync(TOAST_CSS, "utf-8");

describe("toast CSS – position (B-TOAST-02)", () => {
  it("positions the toast with position: fixed", () => {
    expect(css).toMatch(/\.copylink-dev-toast\s*\{[^}]*position\s*:\s*fixed/s);
  });

  it("positions the toast 24px from the bottom", () => {
    expect(css).toMatch(/\.copylink-dev-toast\s*\{[^}]*bottom\s*:\s*24px/s);
  });

  it("positions the toast 24px from the left", () => {
    expect(css).toMatch(/\.copylink-dev-toast\s*\{[^}]*left\s*:\s*24px/s);
  });

  it("applies a z-index high enough to overlay page content", () => {
    // z-index: 65536 ensures the toast renders above most page elements.
    expect(css).toMatch(/\.copylink-dev-toast\s*\{[^}]*z-index\s*:\s*65536/s);
  });
});
