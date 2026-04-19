// @vitest-environment node
// B-I18N-01〜04: Verify that all locale message files contain every key used by
// the extension, and that popup.html's data-i18n attributes reference only
// valid message keys. These tests run in Node (no browser) because they only
// read static asset files.
import { describe, expect, it } from "vitest";
import fs from "fs";
import path from "path";

const ROOT = path.resolve(import.meta.dirname, "..", "..");
const LOCALES_DIR = path.join(ROOT, "public", "_locales");
const POPUP_HTML = path.join(ROOT, "public", "popup.html");

/**
 * Load all keys from a messages.json file.
 * @param locale - The locale code (e.g. "en", "ja", "zh_CN").
 * @returns A set of all top-level keys defined in the locale's messages.json.
 */
const loadKeys = (locale: string): Set<string> => {
  const filePath = path.join(LOCALES_DIR, locale, "messages.json");
  const data: Record<string, unknown> = JSON.parse(
    fs.readFileSync(filePath, "utf-8"),
  );
  return new Set(Object.keys(data));
};

/**
 * Discover all locale directories that provide a messages.json file.
 * This keeps the completeness checks aligned with the filesystem so newly
 * added locales are automatically validated.
 * @returns Array of locale codes found under `_locales/`.
 */
const getLocales = (): Array<string> =>
  fs
    .readdirSync(LOCALES_DIR, { withFileTypes: true })
    .filter((entry) => entry.isDirectory())
    .map((entry) => entry.name)
    .filter((locale) =>
      fs.existsSync(path.join(LOCALES_DIR, locale, "messages.json")),
    );

/** The English locale is the canonical reference for required keys. */
const enKeys = loadKeys("en");

const LOCALES: Array<string> = getLocales();

// ──────────────────────────────────────────────
// B-I18N-01〜03: All locales must contain every key present in the English locale
// ──────────────────────────────────────────────

describe("i18n – locale completeness (B-I18N-01 to B-I18N-03)", () => {
  for (const locale of LOCALES) {
    it(`${locale}/messages.json contains all required keys`, () => {
      const localeKeys = loadKeys(locale);
      const missing = [...enKeys].filter((key) => !localeKeys.has(key));
      expect(
        missing,
        `Missing keys in ${locale}: ${missing.join(", ")}`,
      ).toHaveLength(0);
    });
  }

  it("messages.json files do not contain unknown extra keys beyond the English baseline", () => {
    for (const locale of LOCALES.filter((l) => l !== "en")) {
      const localeKeys = loadKeys(locale);
      const extra = [...localeKeys].filter((key) => !enKeys.has(key));
      expect(
        extra,
        `${locale} has keys not present in en: ${extra.join(", ")}`,
      ).toHaveLength(0);
    }
  });
});

// ──────────────────────────────────────────────
// B-I18N-04: popup.html data-i18n attributes must reference valid message keys
// ──────────────────────────────────────────────

describe("i18n – popup.html data-i18n attributes (B-I18N-04)", () => {
  const html = fs.readFileSync(POPUP_HTML, "utf-8");

  // Extract all data-i18n="..." values
  const dataI18nRegex = /data-i18n="([^"]+)"/g;
  const usedKeys: Array<string> = [];
  let match: RegExpExecArray | null;
  while ((match = dataI18nRegex.exec(html)) !== null) {
    usedKeys.push(match[1]);
  }

  it("popup.html contains at least one data-i18n attribute", () => {
    expect(usedKeys.length).toBeGreaterThan(0);
  });

  it("every data-i18n attribute in popup.html references a key present in messages.json", () => {
    const unknownKeys = usedKeys.filter((key) => !enKeys.has(key));
    expect(
      unknownKeys,
      `data-i18n values with no matching message key: ${unknownKeys.join(", ")}`,
    ).toHaveLength(0);
  });

  it("all message keys used in popup.html are non-empty strings in the English locale", () => {
    const enMessages: Record<string, { message: string }> = JSON.parse(
      fs.readFileSync(path.join(LOCALES_DIR, "en", "messages.json"), "utf-8"),
    );

    for (const key of usedKeys) {
      const entry = enMessages[key];
      expect(
        entry?.message,
        `Key "${key}" has an empty or missing message in en/messages.json`,
      ).toBeTruthy();
    }
  });
});
