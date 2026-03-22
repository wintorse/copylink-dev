import {
  DEFAULT_LINK_FORMAT,
  LINK_FORMAT_STORAGE_KEY,
} from "../shared/constants";
import type { LinkFormat } from "../types/types";

type StorageData = {
  [key: string]: unknown;
};

/**
 * Retrieves the user-selected link format from extension storage.
 * @returns The stored link format, falling back to the default if not set.
 */
export const getLinkFormat = (): Promise<LinkFormat> =>
  new Promise((resolve) => {
    chrome.storage.local.get(LINK_FORMAT_STORAGE_KEY, (data: StorageData) => {
      const value = data[LINK_FORMAT_STORAGE_KEY];
      if (
        value === "html" ||
        value === "htmlWithEmoji" ||
        value === "markdown" ||
        value === "plainUrl"
      ) {
        resolve(value);
      } else {
        resolve(DEFAULT_LINK_FORMAT);
      }
    });
  });
