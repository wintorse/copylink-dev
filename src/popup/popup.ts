import type { EmojiNames } from "../types/types";
import { getEmojiElements, getDefaultEmojiName } from "../types/constants";

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
      }
    }
  });
});

document.getElementById("updateEmojiNames")?.addEventListener("click", () => {
  updateEmojiNames();
});
