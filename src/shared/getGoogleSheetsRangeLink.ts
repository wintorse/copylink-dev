/**
 * Gets Google Sheets range information (range string and link).
 * This function extracts the current sheet ID (gid) and the selected range from Google Sheets.
 *
 * @returns {{ rangeString: string; link: string } | null} Range information with link, or null if the range cannot be determined.
 */
export const getGoogleSheetsRangeInfo = (): {
  rangeString: string;
  link: string;
} | null => {
  // 1. Get the current sheet ID (gid) from the URL
  const currentUrl = window.location.href;
  const urlObj = new URL(currentUrl);
  const hashParams = new URLSearchParams(urlObj.hash.replace(/^#/, ""));
  const gidParam = hashParams.get("gid");
  const gid = gidParam !== null && gidParam.length > 0 ? gidParam : "0";

  // 2. Get the range string (e.g., A1 or A1:B5) from the name box
  const nameBox = document.querySelector<HTMLInputElement>("#t-name-box");
  let rangeString = "";

  if (nameBox !== null && nameBox.value.length > 0) {
    rangeString = nameBox.value;
  } else {
    // Fallback when unable to get the range (or when focus is lost)
    console.warn("Name box not found.");
    return null;
  }

  // 3. Generate the link
  // Get the base URL (up to the #)
  const baseUrl = currentUrl.split("#")[0];
  const finalLink = `${baseUrl}#gid=${gid}&range=${rangeString}`;

  return { rangeString, link: finalLink };
};
