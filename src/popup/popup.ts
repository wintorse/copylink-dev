import type { EmojiName, EmojiNameRecord, CustomRegexes } from "../types/types";

import {
  getEmojiElements,
  getCustomRegexElements,
  getDefaultEmojiName,
  EMOJI_KEYS,
  CUSTOM_REGEX_KEYS,
} from "../types/constants";

// check if value is in `:${string}:` format
const isEmojiFormat = (value: string): value is EmojiName => {
  return /^:.*:$/.test(value);
};

// Update emoji names in storage based on form inputs
function updateEmojiNames() {
  const emojiNames: Partial<EmojiNameRecord> = {};
  const emojiElements = getEmojiElements();
  for (const key of EMOJI_KEYS) {
    const element = document.getElementById(emojiElements[key]);
    if (element instanceof HTMLInputElement) {
      const value = element.value.trim();
      if (isEmojiFormat(value)) {
        emojiNames[key] = value;
      } else {
        emojiNames[key] = `:${value}:`;
      }
    }
  }
  chrome.storage.local.set({ emojiNames: emojiNames });
}

function updateCustomRegexes() {
  const customRegexes: Partial<CustomRegexes> = {};
  const customRegexElements = getCustomRegexElements();
  for (const key of CUSTOM_REGEX_KEYS) {
    const element = document.getElementById(customRegexElements[key]);
    if (element instanceof HTMLInputElement) {
      customRegexes[key] = element.value;
    }
  }
  chrome.storage.local.set({ copylinkdevCustomRegexes: customRegexes });
}

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
  chrome.storage.local.get("emojiNames", function (data) {
    const emojiElements = getEmojiElements();
    for (const key of EMOJI_KEYS) {
      const element = document.getElementById(emojiElements[key]);
      if (element instanceof HTMLInputElement) {
        const emojiName = data.emojiNames?.[key] || getDefaultEmojiName(key);
        element.value = emojiName;

        element.addEventListener("input", updateEmojiNames);
      }
    }
  });

  chrome.storage.local.get("copylinkdevCustomRegexes", function (data) {
    const customRegexElements = getCustomRegexElements();
    for (const key of CUSTOM_REGEX_KEYS) {
      const element = document.getElementById(customRegexElements[key]);
      if (element instanceof HTMLInputElement) {
        element.value = data.copylinkdevCustomRegexes?.[key] || "";

        element.addEventListener("input", updateCustomRegexes);
      }
    }
  });
});
