import "selenium-webdriver/firefox.js";

declare module "selenium-webdriver/firefox.js" {
  // The current Selenium API is newer than @types/selenium-webdriver.
  interface Driver {
    installWebExtension(
      extension: string,
      options: { permanent: boolean },
    ): Promise<{ id: string }>;
  }
}
