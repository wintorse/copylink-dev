# copylink-dev — Behavior Catalog & Test Coverage

> 日本語版: [behavior-test-coverage-ja.md](behavior-test-coverage-ja.md)

---

## 1. Behavior Catalog

### 1.1 Core Commands

| ID       | Command                      | Keyboard Shortcut             | Behavior                                                        |
| -------- | ---------------------------- | ----------------------------- | --------------------------------------------------------------- |
| B-CMD-01 | **Copy Link**                | Alt+L / MacCtrl+L             | Copies the page URL with a formatted title                      |
| B-CMD-02 | **Copy Link for Slack**      | Alt+Shift+L / MacCtrl+Shift+L | Copies a link prefixed with a Slack emoji                       |
| B-CMD-03 | **Copy Title**               | Alt+T / MacCtrl+T             | Copies the page title as plain text only                        |
| B-CMD-04 | **Copy Google Sheets Range** | Alt+R / MacCtrl+R             | Copies a range link for Google Sheets (with gid & range params) |

### 1.2 Link Formats

| ID       | Format                        | Example output                                                  |
| -------- | ----------------------------- | --------------------------------------------------------------- |
| B-FMT-01 | **Plain URL**                 | `https://docs.google.com/...`                                   |
| B-FMT-02 | **HTML**                      | `<a href="...">Title</a>&nbsp;` (plain text = title only)       |
| B-FMT-03 | **Markdown**                  | `[Title](https://...)`                                          |
| B-FMT-04 | **HTML with Emoji** (default) | `:emoji: <a href="...">Title</a>&nbsp;` (plain text = Markdown) |

### 1.3 Site-specific Title Extraction & Emoji Detection

| ID        | Site                 | Emoji                 | Title extraction method                        |
| --------- | -------------------- | --------------------- | ---------------------------------------------- |
| B-SITE-01 | Google Docs          | `:google_docs:`       | From `input#docs-title-widget`                 |
| B-SITE-02 | Google Sheets        | `:google_sheets:`     | From `document.title`                          |
| B-SITE-03 | Google Slides        | `:google_slides:`     | From `document.title`                          |
| B-SITE-04 | Google Drive         | `:google_drive_2:`    | Strips " - Google Drive" from `document.title` |
| B-SITE-05 | GitHub Repos         | `:github:`            | Extracts repo/owner from h1                    |
| B-SITE-06 | GitHub Pull Requests | `:open_pull_request:` | Formats as `#number title`                     |
| B-SITE-07 | GitHub Issues        | `:open_issue:`        | Formats as `#number title`                     |
| B-SITE-08 | Jira Issues          | `:jira:`              | Formats as `ID title`                          |
| B-SITE-09 | Asana Tasks          | `:asana:`             | From `aria-label` of `TaskPrintView`           |
| B-SITE-10 | Backlog Issues       | `:backlog:`           | From `#summary .title-group__title-text`       |
| B-SITE-11 | Redmine Issues       | `:redmine_ticket:`    | Extracts `Tracker #number: title` from h2/h3   |
| B-SITE-12 | ReDoc (Swagger)      | `:swagger:`           | From the second span of the active label       |
| B-SITE-13 | Unregistered sites   | (none)                | Uses `document.title` as-is                    |

### 1.4 Custom Website Settings

| ID          | Behavior                                                                     |
| ----------- | ---------------------------------------------------------------------------- |
| B-CUSTOM-01 | Five custom website slots (regex + emoji)                                    |
| B-CUSTOM-02 | Custom regex takes priority over built-in site detection                     |
| B-CUSTOM-03 | When a custom regex matches the current URL, its configured emoji is applied |

### 1.5 Popup Settings

| ID         | Behavior                                                                 |
| ---------- | ------------------------------------------------------------------------ |
| B-POPUP-01 | Edit the 13 built-in emoji names                                         |
| B-POPUP-02 | Configure up to 5 custom websites (regex + emoji)                        |
| B-POPUP-03 | Select the Google Sheets range link format via radio buttons (4 options) |
| B-POPUP-04 | All setting changes are saved to `chrome.storage.local` in real time     |

### 1.6 Clipboard Behavior

| ID        | Behavior                                                                    |
| --------- | --------------------------------------------------------------------------- |
| B-CLIP-01 | Dual-format copy (text/plain + text/html) via `navigator.clipboard.write()` |
| B-CLIP-02 | Fallback to `document.execCommand('copy')` on HTTP (non-secure) pages       |
| B-CLIP-03 | User's text selection is preserved after the execCommand fallback           |
| B-CLIP-04 | Copy Link: plain text = title, HTML = `<a>` tag                             |
| B-CLIP-05 | Copy Link for Slack: plain text = Markdown, HTML = emoji + `<a>` tag        |

### 1.7 Google Sheets Range Link

| ID         | Behavior                                                        |
| ---------- | --------------------------------------------------------------- |
| B-RANGE-01 | Extracts the GID (sheet ID) from the URL hash                   |
| B-RANGE-02 | Extracts the cell range from the `#t-name-box` input            |
| B-RANGE-03 | Generates a link in `{baseUrl}#gid={gid}&range={range}` format  |
| B-RANGE-04 | Does nothing on non-Sheets pages                                |
| B-RANGE-05 | Produces four output variants based on the selected link format |

### 1.8 Toast Notifications

| ID         | Behavior                                                    |
| ---------- | ----------------------------------------------------------- |
| B-TOAST-01 | Shows an in-page toast notification after a successful copy |
| B-TOAST-02 | Positioned at the bottom-left (bottom: 24px, left: 24px)    |
| B-TOAST-03 | Auto-dismissed after ~3 seconds with a fade-out animation   |
| B-TOAST-04 | Rendered inside a Shadow DOM, isolated from the page's CSS  |

### 1.9 Internationalization (i18n)

| ID        | Behavior                                                |
| --------- | ------------------------------------------------------- |
| B-I18N-01 | English (en) locale support                             |
| B-I18N-02 | Japanese (ja) locale support                            |
| B-I18N-03 | Simplified Chinese (zh_CN) locale support               |
| B-I18N-04 | Automatic translation of popup labels via `[data-i18n]` |

### 1.10 Error Handling

| ID       | Behavior                                                         |
| -------- | ---------------------------------------------------------------- |
| B-ERR-01 | Silent error handling when no active tab is found                |
| B-ERR-02 | Rejects non-http/https URL schemes (e.g., `chrome://`, `about:`) |
| B-ERR-03 | Logs an error and aborts when content script injection fails     |
| B-ERR-04 | Falls back to `execCommand` when the Clipboard API fails         |
| B-ERR-05 | Shows a failure toast when all copy methods fail                 |

### 1.11 Content Scripts

| ID      | Behavior                                                              |
| ------- | --------------------------------------------------------------------- |
| B-CS-01 | Duplicate-injection guard via the `__copylinkDevInjected` flag        |
| B-CS-02 | Chrome: dynamic script injection via `chrome.scripting.executeScript` |
| B-CS-03 | Firefox: pre-injected content script                                  |

---

## 2. Test Coverage

### Test Architecture

| Type       | Framework             | Directory     | Scope                                                   |
| ---------- | --------------------- | ------------- | ------------------------------------------------------- |
| E2E tests  | Playwright (Chromium) | `tests/e2e/`  | Command execution, UI behavior, and settings in-browser |
| Unit tests | Vitest + happy-dom    | `tests/unit/` | Pure logic, static assets, and error-handling paths     |

### Legend

| Symbol | Meaning                  |
| ------ | ------------------------ |
| ✅     | Fully tested             |
| ⚠️     | Implicitly verified only |
| ❌     | Not tested               |

### Coverage Mapping

| Behavior ID                  | Behavior                            | Status | Test file / test name                                                                                        |
| ---------------------------- | ----------------------------------- | ------ | ------------------------------------------------------------------------------------------------------------ |
| **Core Commands**            |                                     |        |                                                                                                              |
| B-CMD-01                     | Copy Link                           | ✅     | `e2e/core-commands.spec.ts`: `copy-link copies title as text and HTML anchor`                                |
| B-CMD-02                     | Copy Link for Slack                 | ✅     | `e2e/core-commands.spec.ts`: `copy-link-for-slack copies markdown text and HTML with emoji`                  |
| B-CMD-03                     | Copy Title                          | ✅     | `e2e/core-commands.spec.ts`: `copy-title copies only the page title as plain text`                           |
| B-CMD-04                     | Copy Google Sheets Range            | ✅     | `e2e/google-sheets.spec.ts`: `copy-google-sheets-range copies URL with range parameter`                      |
| **Link Formats**             |                                     |        |                                                                                                              |
| B-FMT-01                     | Plain URL                           | ✅     | `e2e/link-formats.spec.ts`: `plainUrl format: text is URL only`                                              |
| B-FMT-02                     | HTML                                | ✅     | `e2e/link-formats.spec.ts`: `html format: text is title, html is <a> without emoji`                          |
| B-FMT-03                     | Markdown                            | ✅     | `e2e/link-formats.spec.ts`: `markdown format: text is [title](url), no html`                                 |
| B-FMT-04                     | HTML with Emoji                     | ✅     | `e2e/link-formats.spec.ts`: `htmlWithEmoji format: text is markdown, html has emoji + <a>`                   |
| **Site-specific Processing** |                                     |        |                                                                                                              |
| B-SITE-01                    | Google Docs                         | ✅     | `e2e/site-title.spec.ts`: `Google Docs: title is テスト document`                                            |
| B-SITE-02                    | Google Sheets                       | ✅     | `e2e/site-title.spec.ts`: `Google Sheets: title is テスト spreadsheet`                                       |
| B-SITE-03                    | Google Slides                       | ✅     | `e2e/site-title.spec.ts`: `Google Slides: title is テスト presentation`                                      |
| B-SITE-04                    | Google Drive                        | ✅     | `e2e/site-title.spec.ts`: `Google Drive: title is public folder`                                             |
| B-SITE-05                    | GitHub Repos                        | ✅     | `e2e/site-title.spec.ts`: `GitHub Repo: emoji is :github:`                                                   |
| B-SITE-06                    | GitHub Pull Requests                | ✅     | `e2e/site-title.spec.ts`: `GitHub Pull Request: title is #<number> <text>`                                   |
| B-SITE-07                    | GitHub Issues                       | ✅     | `e2e/site-title.spec.ts`: `GitHub Issue: title is #<number> <text>`                                          |
| B-SITE-08                    | Jira Issues                         | ✅     | `e2e/site-title.spec.ts`: `Jira Issue: title is HIBERNATE-77 Support HQL in / not in`                        |
| B-SITE-09                    | Asana Tasks                         | ✅     | `e2e/site-title.spec.ts`: `Asana Task (mocked): title from aria-label`                                       |
| B-SITE-10                    | Backlog Issues                      | ✅     | `e2e/site-title.spec.ts`: `Backlog Issue (mocked): title from DOM selector`                                  |
| B-SITE-11                    | Redmine Issues                      | ✅     | `e2e/site-title.spec.ts`: `Redmine Issue: title is Feature #642: OpenXR On Linux.`                           |
| B-SITE-12                    | ReDoc (Swagger)                     | ✅     | `e2e/site-title.spec.ts`: `ReDoc: title is 法令本文取得API`                                                  |
| B-SITE-13                    | Unregistered sites                  | ✅     | `e2e/core-commands.spec.ts`: implicitly tested on example.com                                                |
| **Custom Websites**          |                                     |        |                                                                                                              |
| B-CUSTOM-01                  | Custom slot configuration           | ✅     | `e2e/popup.spec.ts`: `custom website regex + emoji is applied for matching URLs`                             |
| B-CUSTOM-02                  | Custom takes priority over built-in | ✅     | `e2e/popup.spec.ts`: `custom website regex takes priority over built-in site detection`                      |
| B-CUSTOM-03                  | Emoji applied on regex match        | ✅     | `e2e/popup.spec.ts`: `custom website regex + emoji is applied for matching URLs`                             |
| **Popup Settings**           |                                     |        |                                                                                                              |
| B-POPUP-01                   | Change emoji names                  | ✅     | `e2e/popup.spec.ts`: `changing an emoji name persists and is used in copy`                                   |
| B-POPUP-02                   | Custom website configuration        | ✅     | `e2e/popup.spec.ts`: `custom website regex + emoji is applied for matching URLs`                             |
| B-POPUP-03                   | Link format selection               | ✅     | `e2e/popup.spec.ts`: `selecting a link format radio persists to storage`                                     |
| B-POPUP-04                   | Real-time storage persistence       | ✅     | `e2e/popup.spec.ts`: storage verified in each test                                                           |
| **Clipboard**                |                                     |        |                                                                                                              |
| B-CLIP-01                    | Clipboard API dual-format           | ✅     | `e2e/core-commands.spec.ts`: both text and HTML verified                                                     |
| B-CLIP-02                    | HTTP fallback                       | ✅     | `e2e/http-site.spec.ts`: three commands tested on an HTTP site                                               |
| B-CLIP-03                    | Selection preservation              | ✅     | `unit/clipboardFallback.test.ts`: `restores the previous selection range after execCommand fallback`         |
| B-CLIP-04                    | Copy Link output format             | ✅     | `e2e/core-commands.spec.ts`                                                                                  |
| B-CLIP-05                    | Copy Link for Slack output format   | ✅     | `e2e/core-commands.spec.ts`                                                                                  |
| **Google Sheets Range**      |                                     |        |                                                                                                              |
| B-RANGE-01                   | GID extraction                      | ✅     | `e2e/google-sheets.spec.ts`: `gid=0` verified                                                                |
| B-RANGE-02                   | Cell range extraction               | ✅     | `e2e/google-sheets.spec.ts`: `range=C2:E4` verified                                                          |
| B-RANGE-03                   | Link format                         | ✅     | `e2e/google-sheets.spec.ts`                                                                                  |
| B-RANGE-04                   | No-op on non-Sheets pages           | ✅     | `e2e/google-sheets.spec.ts`: `on non-Sheets page does nothing`                                               |
| B-RANGE-05                   | Format-variant outputs              | ✅     | `e2e/link-formats.spec.ts`: all 4 formats tested                                                             |
| **Toast Notifications**      |                                     |        |                                                                                                              |
| B-TOAST-01                   | Shown after successful copy         | ✅     | `e2e/toast.spec.ts`: `toast appears after copy-link`                                                         |
| B-TOAST-02                   | Position                            | ✅     | `unit/toast-css.test.ts`: `positions the toast 24px from the bottom/left`                                    |
| B-TOAST-03                   | Auto-dismissed after ~3s            | ✅     | `e2e/toast.spec.ts`: `disappears after ~3s`                                                                  |
| B-TOAST-04                   | Shadow DOM isolation                | ✅     | `unit/toastShadowDom.test.ts`: `places .copylink-dev-toast inside the shadow root, not in the main document` |
| **Internationalization**     |                                     |        |                                                                                                              |
| B-I18N-01                    | English locale                      | ✅     | `unit/i18n.test.ts`: `en/messages.json contains all required keys`                                           |
| B-I18N-02                    | Japanese locale                     | ✅     | `unit/i18n.test.ts`: `ja/messages.json contains all required keys`                                           |
| B-I18N-03                    | Simplified Chinese locale           | ✅     | `unit/i18n.test.ts`: `zh_CN/messages.json contains all required keys`                                        |
| B-I18N-04                    | Popup auto-translation              | ✅     | `unit/i18n.test.ts`: `every data-i18n attribute in popup.html references a key present in messages.json`     |
| **Error Handling**           |                                     |        |                                                                                                              |
| B-ERR-01                     | No active tab                       | ✅     | `unit/background.test.ts`: `logs an error and does nothing when no active tab is found`                      |
| B-ERR-02                     | Non-http/https scheme rejected      | ✅     | `unit/background.test.ts`: `rejects chrome:// URLs without injecting the content script`                     |
| B-ERR-03                     | Script injection failure            | ✅     | `unit/background.test.ts`: `logs error and does NOT send message when script injection fails`                |
| B-ERR-04                     | Clipboard API failure fallback      | ✅     | `unit/clipboardFallback.test.ts`: `attempts the execCommand fallback when Clipboard API fails`               |
| B-ERR-05                     | Failure toast when all methods fail | ✅     | `e2e/toast.spec.ts` + `unit/copyTextLinkCore.test.ts`: failure notification                                  |
| **Content Scripts**          |                                     |        |                                                                                                              |
| B-CS-01                      | Duplicate-injection guard           | ✅     | `unit/content.test.ts`: `does NOT re-register the listener when the script is injected a second time`        |
| B-CS-02                      | Chrome dynamic injection            | ⚠️     | Implicitly verified by all E2E tests                                                                         |
| B-CS-03                      | Firefox pre-injected script         | ❌     | Playwright does not support testing Firefox extensions                                                       |
