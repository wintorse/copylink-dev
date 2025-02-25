import type { EmojiNames } from "../types/types";
import { emojiElements, defaultEmojiNames } from "../types/constants";

// Retrieve emoji names from storage and update the form inputs
function getEmojiNames() {
  chrome.storage.local.get("emojiNames", (data) => {
    const emojiNames: EmojiNames = data.emojiNames || defaultEmojiNames;
    updateFormInputs(emojiNames);
  });
}

// Update form inputs with the retrieved emoji names
function updateFormInputs(emojiNames: EmojiNames) {
  for (const key in emojiElements) {
    const element = document.getElementById(
      emojiElements[key as keyof EmojiNames]
    ) as HTMLInputElement;
    if (element) {
      element.value = emojiNames[key as keyof EmojiNames] ?? "";
    }
  }
}

// Update emoji names in storage based on form inputs
function updateEmojiNames() {
  const emojiNames: Partial<EmojiNames> = {};
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

document.addEventListener("DOMContentLoaded", () => {
  // i18n
  const elements = document.querySelectorAll("[data-i18n]");
  elements.forEach((el) => {
    const messageKey = el.getAttribute("data-i18n");
    el.textContent = messageKey
      ? chrome.i18n.getMessage(messageKey)
      : el.textContent;
  });

  // Get emoji names when the page is loaded and reflect them in the form.
  chrome.storage.local.get("emojiNames", function (data) {
    if (!data.emojiNames) {
      chrome.storage.local.set(
        { emojiNames: defaultEmojiNames },
        getEmojiNames
      );
    } else {
      getEmojiNames();
    }
  });
});

document.getElementById("updateEmojiNames")?.addEventListener("click", () => {
  updateEmojiNames();
});
