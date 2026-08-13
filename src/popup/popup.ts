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
import { copyToClipboardShared } from "../shared/clipboard/copyToClipboardShared";

type EmojiNamesStorageData = {
  emojiNames?: Partial<EmojiNameRecord>;
};

type CustomRegexesStorageData = {
  copylinkdevCustomRegexes?: Partial<CustomRegexes>;
};

type LinkFormatStorageData = {
  [key: string]: unknown;
};

type ImportData = {
  emojiNames?: Partial<EmojiNameRecord>;
  customRegexes?: Partial<CustomRegexes>;
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

// Export emoji names and custom regexes to clipboard
const exportEmojiNames = async () => {
  const data = await new Promise<{
    emojiNames?: Partial<EmojiNameRecord>;
    copylinkdevCustomRegexes?: Partial<CustomRegexes>;
  }>((resolve) => {
    chrome.storage.local.get(
      ["emojiNames", "copylinkdevCustomRegexes"],
      (result) => {
        if (chrome.runtime.lastError) {
          console.error(chrome.runtime.lastError);
          resolve({});
          return;
        }
        resolve(
          result as {
            emojiNames?: Partial<EmojiNameRecord>;
            copylinkdevCustomRegexes?: Partial<CustomRegexes>;
          },
        );
      },
    );
  });

  const exportData = {
    emojiNames: data.emojiNames ?? {},
    customRegexes: data.copylinkdevCustomRegexes ?? {},
  };

  const json = JSON.stringify(exportData, null, 2);
  const result = await copyToClipboardShared(json);
  return result;
};

const isImportData = (value: unknown): value is ImportData =>
  typeof value === "object" &&
  value !== null &&
  ("emojiNames" in value || "customRegexes" in value);

const isNonEmptyObject = (value: unknown): value is Record<string, unknown> =>
  value !== null && typeof value === "object" && Object.keys(value).length > 0;

const saveImportedData = (data: ImportData) => {
  if (isNonEmptyObject(data.emojiNames)) {
    chrome.storage.local.set({ emojiNames: data.emojiNames }, () => {
      if (chrome.runtime.lastError) {
        console.error(chrome.runtime.lastError);
      }
    });
  }

  if (isNonEmptyObject(data.customRegexes)) {
    chrome.storage.local.set(
      { copylinkdevCustomRegexes: data.customRegexes },
      () => {
        if (chrome.runtime.lastError) {
          console.error(chrome.runtime.lastError);
        }
      },
    );
  }
};

const refreshEmojiInputs = (emojiNames?: Partial<EmojiNameRecord>) => {
  const emojiElements = getEmojiElements();
  const values = getInitialEmojiValues(emojiNames);
  for (const key of EMOJI_KEYS) {
    const element = document.getElementById(emojiElements[key]);
    if (element instanceof HTMLInputElement) {
      element.value = values[key];
    }
  }
};

const refreshCustomRegexInputs = (customRegexes?: Partial<CustomRegexes>) => {
  const customRegexElements = getCustomRegexElements();
  for (const key of CUSTOM_REGEX_KEYS) {
    const element = document.getElementById(customRegexElements[key]);
    if (element instanceof HTMLInputElement) {
      element.value = customRegexes?.[key] ?? "";
    }
  }
};

const refreshImportedInputs = (data: ImportData) => {
  if (isNonEmptyObject(data.emojiNames)) {
    refreshEmojiInputs(data.emojiNames);
  }
  if (isNonEmptyObject(data.customRegexes)) {
    refreshCustomRegexInputs(data.customRegexes);
  }
};

const importData = (importedText: string) => {
  const parsedData: unknown = JSON.parse(importedText);
  if (!isImportData(parsedData)) {
    throw new Error("Invalid import data format");
  }

  saveImportedData(parsedData);
  refreshImportedInputs(parsedData);
};

const handleImportConfirm = (importTextarea: HTMLTextAreaElement) => {
  const importedText = importTextarea.value.trim();
  if (!importedText) {
    return;
  }

  try {
    importData(importedText);
  } catch (error) {
    console.error("Error importing emoji names:", error);
    alert(chrome.i18n.getMessage("importFailure"));
  }
};

document.addEventListener("DOMContentLoaded", () => {
  // i18n
  const elements = document.querySelectorAll("[data-i18n]");

  // Export button handler
  const exportButton = document.getElementById("exportButton");
  const exportMessage = document.getElementById("exportMessage");
  if (exportButton && exportMessage) {
    exportButton.addEventListener("click", (event) => {
      event.preventDefault();
      exportEmojiNames()
        .then((result) => {
          if (result.success === false) {
            console.error("Error exporting emoji names:", result.error);
            exportMessage.textContent = chrome.i18n.getMessage("exportFailure");
            return;
          }
          exportMessage.textContent = chrome.i18n.getMessage("exportSuccess");
          setTimeout(() => {
            exportMessage.textContent = "";
          }, 8000);
        })
        .catch((error) => {
          console.error("Error exporting emoji names:", error);
          exportMessage.textContent = chrome.i18n.getMessage("exportFailure");
        });
    });
  }

  // Import button handler - show import UI
  const importButton = document.getElementById("importButton");

  if (importButton) {
    importButton.addEventListener("click", (event) => {
      event.preventDefault();
      const importGroup = document.getElementById("importGroup");
      if (importGroup) {
        importGroup.style.display = "inline-block";
      }
    });
  }

  // Import button handler - process import
  const importConfirmButton = document.getElementById("importConfirmButton");
  const importTextarea = document.getElementById("importTextarea");

  if (importConfirmButton && importTextarea instanceof HTMLTextAreaElement) {
    importConfirmButton.addEventListener("click", (event) => {
      event.preventDefault();
      handleImportConfirm(importTextarea);
    });
  }

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
    refreshEmojiInputs(data.emojiNames);
    const emojiElements = getEmojiElements();
    for (const key of EMOJI_KEYS) {
      const element = document.getElementById(emojiElements[key]);
      if (element instanceof HTMLInputElement) {
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
      refreshCustomRegexInputs(data.copylinkdevCustomRegexes);
      const customRegexElements = getCustomRegexElements();
      for (const key of CUSTOM_REGEX_KEYS) {
        const element = document.getElementById(customRegexElements[key]);
        if (element instanceof HTMLInputElement) {
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
