import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { buildPageContext } from "../../src/shared/pageContext";
import { detectSite } from "../../src/shared/siteDetection";
import { getFormattedTitle } from "../../src/shared/getFormattedTitle";
import { resolveEmojiName } from "../../src/shared/emojiResolver";

const v2Credit =
  '<a target="_blank" rel="noopener noreferrer" href="https://redocly.com/redoc/">API docs by Redocly</a>';
const v3Credit =
  '<a target="_blank" rel="noopener noreferrer" href="https://redocly.com/redoc/"><p>API docs by</p><img alt="redocly logo" src="https://cdn.redoc.ly/redoc/logo-mini-full.svg"></a>';

beforeEach(() => {
  vi.stubGlobal("window", {
    location: {
      href: "https://example.com/api/orders/createorder",
      hostname: "example.com",
      pathname: "/api/orders/createorder",
    },
  });
  document.title = "Cafe API";
});

afterEach(() => {
  vi.unstubAllGlobals();
  document.body.innerHTML = "";
  document.title = "";
});

describe("ReDoc titles and detection", () => {
  it("keeps v2 operation titles and emoji with a custom document title", () => {
    document.body.innerHTML = `
      <div class="redoc-wrap">
        <label class="menu-item active">
          <span class="operation-type get">GET</span>
          <span> 法令本文取得API </span>
        </label>
      </div>
      ${v2Credit}
    `;

    const ctx = buildPageContext();
    expect(detectSite(ctx)).toBe("reDoc");
    expect(getFormattedTitle()).toBe("法令本文取得API");
    expect(resolveEmojiName(ctx, {})).toBe(":swagger:");
  });

  it("reads the active v3 operation without its HTTP method or neighboring headings", () => {
    // Component names and test IDs are intentionally omitted.
    document.body.innerHTML = `
      <ul>
        <div>
          <a href="/api/orders/listorders">
            <li data-active="false">
              <div><span><span data-text="List all orders">List all orders</span></span></div>
              <div class="tag-http"><div>get</div></div>
            </li>
          </a>
        </div>
        <div>
          <a href="/api/orders/createorder">
            <li data-active="true">
              <div><span><span data-text="Create order"> Create order </span></span></div>
              <div class="tag-http"><div>post</div></div>
            </li>
          </a>
        </div>
      </ul>
      <main><h2>List all orders</h2><h2>Create order</h2></main>
      ${v3Credit}
    `;

    const ctx = buildPageContext();
    expect(detectSite(ctx)).toBe("reDoc");
    expect(getFormattedTitle()).toBe("Create order");
    expect(resolveEmojiName(ctx, {})).toBe(":swagger:");

    // Client-side navigation changes the active item without reloading the document.
    const items = document.querySelectorAll("[data-active]");
    items[1].setAttribute("data-active", "false");
    items[0].setAttribute("data-active", "true");
    expect(getFormattedTitle()).toBe("List all orders");
  });

  it("reads a v3 section title without an HTTP method badge", () => {
    document.body.innerHTML = `
      <ul data-component-name="Navigation">
        <li data-testid="navigation-item" data-active="true">
          <div><span><span data-text="Orders">Orders</span></span></div>
        </li>
      </ul>
      ${v3Credit}
    `;

    expect(getFormattedTitle()).toBe("Orders");
  });

  it.each([v2Credit, v3Credit])(
    "detects ReDoc from its credit link without a menu: %s",
    (credit) => {
      document.body.innerHTML = credit;

      const ctx = buildPageContext();
      expect(detectSite(ctx)).toBe("reDoc");
      expect(getFormattedTitle()).toBe("Cafe API");
      expect(resolveEmojiName(ctx, {})).toBe(":swagger:");
    },
  );
});
