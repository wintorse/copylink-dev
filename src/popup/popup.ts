import {
  CUSTOM_REGEX_KEYS,
  DEFAULT_LINK_FORMAT,
  EMOJI_KEYS,
  LINK_FORMAT_STORAGE_KEY,
  getCustomRegexElements,
  getEmojiElements,
} from "../shared/constants";
import type {
  CustomRegexes,
  EmojiNameRecord,
  LinkFormat,
} from "../types/types";
import {
  buildCustomRegexes,
  buildEmojiNames,
  getInitialEmojiValues,
} from "../shared/popup/emojiSettings";

type EmojiNamesStorageData = {
  emojiNames?: Partial<EmojiNameRecord>;
};

type CustomRegexesStorageData = {
  copylinkdevCustomRegexes?: Partial<CustomRegexes>;
};

type LinkFormatStorageData = {
  [key: string]: unknown;
};

const updateLinkFormat = (format: LinkFormat) => {
  chrome.storage.local.set({ [LINK_FORMAT_STORAGE_KEY]: format }, () => {
    if (chrome.runtime.lastError) {
      console.error(chrome.runtime.lastError);
    }
  });
};

const collectEmojiInputs = (): Partial<Record<string, string>> => {
  const values: Partial<Record<string, string>> = {};
  const emojiElements = getEmojiElements();
  for (const key of EMOJI_KEYS) {
    const element = document.getElementById(emojiElements[key]);
    if (element instanceof HTMLInputElement) {
      values[key] = element.value;
    }
  }
  return values;
};

// Update emoji names in storage based on form inputs
const updateEmojiNames = () => {
  const emojiNames = buildEmojiNames(collectEmojiInputs());
  chrome.storage.local.set({ emojiNames }, () => {
    if (chrome.runtime.lastError) {
      console.error(chrome.runtime.lastError);
    }
  });
};

const collectRegexInputs = (): Partial<Record<string, string>> => {
  const values: Partial<Record<string, string>> = {};
  const customRegexElements = getCustomRegexElements();
  for (const key of CUSTOM_REGEX_KEYS) {
    const element = document.getElementById(customRegexElements[key]);
    if (element instanceof HTMLInputElement) {
      values[key] = element.value;
    }
  }
  return values;
};

const updateCustomRegexes = () => {
  const customRegexes = buildCustomRegexes(collectRegexInputs());
  chrome.storage.local.set({ copylinkdevCustomRegexes: customRegexes }, () => {
    if (chrome.runtime.lastError) {
      console.error(chrome.runtime.lastError);
    }
  });
};

document.addEventListener("DOMContentLoaded", () => {
  // i18n
  const elements = document.querySelectorAll("[data-i18n]");
  elements.forEach((el) => {
    const messageKey = el.getAttribute("data-i18n");
    el.textContent =
      messageKey !== null ? chrome.i18n.getMessage(messageKey) : el.textContent;
  });

  // Get emoji names and custom regexes when the page is loaded and reflect them in the form.
  chrome.storage.local.get("emojiNames", (data: EmojiNamesStorageData) => {
    if (chrome.runtime.lastError) {
      console.error(chrome.runtime.lastError);
      return;
    }
    const emojiElements = getEmojiElements();
    const values = getInitialEmojiValues(data.emojiNames);
    for (const key of EMOJI_KEYS) {
      const element = document.getElementById(emojiElements[key]);
      if (element instanceof HTMLInputElement) {
        element.value = values[key];
        element.addEventListener("input", updateEmojiNames);
      }
    }
  });

  chrome.storage.local.get(
    "copylinkdevCustomRegexes",
    (data: CustomRegexesStorageData) => {
      if (chrome.runtime.lastError) {
        console.error(chrome.runtime.lastError);
        return;
      }
      const customRegexElements = getCustomRegexElements();
      for (const key of CUSTOM_REGEX_KEYS) {
        const element = document.getElementById(customRegexElements[key]);
        if (element instanceof HTMLInputElement) {
          element.value = data.copylinkdevCustomRegexes?.[key] ?? "";

          element.addEventListener("input", updateCustomRegexes);
        }
      }
    },
  );

  chrome.storage.local.get(
    LINK_FORMAT_STORAGE_KEY,
    (data: LinkFormatStorageData) => {
      if (chrome.runtime.lastError) {
        console.error(chrome.runtime.lastError);
        return;
      }
      const stored = data[LINK_FORMAT_STORAGE_KEY];
      const format: LinkFormat =
        stored === "html" ||
        stored === "htmlWithEmoji" ||
        stored === "markdown" ||
        stored === "plainUrl"
          ? stored
          : DEFAULT_LINK_FORMAT;
      const radio = document.getElementById(`linkFormat-${format}`);
      if (radio instanceof HTMLInputElement) {
        radio.checked = true;
      }
      const radios = document.querySelectorAll<HTMLInputElement>(
        'input[name="linkFormat"]',
      );
      radios.forEach((r) => {
        r.addEventListener("change", () => {
          if (
            r.checked &&
            (r.value === "html" ||
              r.value === "htmlWithEmoji" ||
              r.value === "markdown" ||
              r.value === "plainUrl")
          ) {
            updateLinkFormat(r.value);
          }
        });
      });
    },
  );
});
