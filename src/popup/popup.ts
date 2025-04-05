import type { EmojiNames, CustomRegexes } from "../types/types";
import {
  getEmojiElements,
  getCustomRegexElements,
  getDefaultEmojiName,
} from "../types/constants";

// Update emoji names in storage based on form inputs
function updateEmojiNames() {
  const emojiNames: Partial<EmojiNames> = {};
  const emojiElements = getEmojiElements();
  for (const key in emojiElements) {
    const element = document.getElementById(
      emojiElements[key as keyof EmojiNames]
    ) as HTMLInputElement;
    if (element) {
      emojiNames[key as keyof EmojiNames] = element.value;
    }
  }
  chrome.storage.local.set({ emojiNames: emojiNames });
}

function updateCustomRegexes() {
  const customRegexes: Partial<CustomRegexes> = {};
  const customRegexElements = getCustomRegexElements();
  for (const key in customRegexElements) {
    const element = document.getElementById(
      customRegexElements[key as keyof CustomRegexes]
    ) as HTMLInputElement;
    if (element) {
      customRegexes[key as keyof CustomRegexes] = element.value;
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
    for (const key in emojiElements) {
      const element = document.getElementById(
        emojiElements[key as keyof EmojiNames]
      ) as HTMLInputElement;
      if (element) {
        const emojiName =
          data.emojiNames?.[key as keyof EmojiNames] ||
          getDefaultEmojiName(key as keyof EmojiNames);
        element.value = emojiName;

        element.addEventListener("input", updateEmojiNames);
      }
    }
  });

  chrome.storage.local.get("copylinkdevCustomRegexes", function (data) {
    const customRegexElements = getCustomRegexElements();
    for (const key in customRegexElements) {
      const element = document.getElementById(
        customRegexElements[key as keyof CustomRegexes]
      ) as HTMLInputElement;
      if (element) {
        element.value =
          data.copylinkdevCustomRegexes?.[key as keyof CustomRegexes] || "";

        element.addEventListener("input", updateCustomRegexes);
      }
    }
  });
});
