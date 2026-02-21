import {
  CUSTOM_REGEX_KEYS,
  EMOJI_KEYS,
  getCustomRegexElements,
  getEmojiElements,
} from "../shared/constants";
import type { CustomRegexes, EmojiNameRecord } from "../types/types";
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
    el.textContent = messageKey
      ? chrome.i18n.getMessage(messageKey)
      : el.textContent;
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
          element.value = data.copylinkdevCustomRegexes?.[key] || "";

          element.addEventListener("input", updateCustomRegexes);
        }
      }
    },
  );
});
