[日本語版 README はこちら](./README-ja.md)

# copylink.dev
A browser extension that copies text links with shortcuts. Some sites also support title formatting and Slack emoji.

## Features
Provides shortcuts to easily copy text links with titles, such as "[My spreadsheet](https://example.com)".

For the following sites, it has the functionality to format titles and also copy links with Slack emojis for pasting into Slack:
- Google Sheets
- Google Docs
- Google Slides
- Excel for the web
- Word for the web
- PowerPoint for the web
- GitHub Pull Request
- GitHub Issue
- Jira Issue
- Asana Task
- Backlog Issue
- Redmine Issue

Additionally, you can specify your preferred site URLs using regular expressions in the settings screen and set emojis (e.g., https://example\.com).

For other sites, it copies links with `document.title`, which is the title of the current webpage.

## Installation
Install from [Chrome Web Store](https://chromewebstore.google.com/)

Or
1. Download and unzip the latest zip file from Releases
2. Go to [chrome://extensions/](chrome://extensions/)
3. Enable "Developer mode" in the top right corner
4. Click "Load unpacked" and select the unzipped folder

## Usage
1. Execute the following shortcuts on website
2. Paste into your tools (e.g., Slack)

| Function                        | Mac             | Windows        |
|---------------------------------|-----------------|----------------|
| Copy link                       | `Ctrl+L`        | `Alt+L`        |
| Copy link (with Slack emoji)    | `Ctrl+Shift+L`  | `Alt+Shift+L`  |
| Copy title                      | `Ctrl+T`        | `Alt+T`        |

Shortcuts can be changed from [Extension Settings](chrome://extensions/shortcuts).

You can set Slack emojis by clicking the extension icon.

## License
MIT