[日本語版 README はこちら](./README-ja.md)

[Also available as a UserScript!](https://gist.github.com/wintorse/10e2ec0206a0f29522cb06c6dafd2611)

# copylink.dev
A browser extension that copies text links with shortcuts. Some websites also support title formatting and Slack emoji.

## Features
Provides shortcuts to easily copy text links with titles, such as "[My spreadsheet](https://example.com)".

For the following sites, it has the functionality to format titles and also copy links with Slack emojis for pasting into Slack:
- Google Sheets / Docs / Slides
- Google Drive
- GitHub Pull Request / Issue
- Jira Issue
- Asana Task
- Backlog Issue
- Redmine Issue

Additionally, you can specify your preferred site URLs using regular expressions in the settings screen and set emojis (e.g., `https://www\.example\.com`).

For other sites, it copies links with `document.title`, which is the title of the current webpage.

## Installation - Chrome
Install from [Chrome Web Store](https://chromewebstore.google.com/detail/ohkebnhdjdgmfnhcmdpkdfddongdjadp)

Or install from Release:
1. Download and unzip the latest zip file from [Releases](https://github.com/wintorse/copylink-dev/releases/latest)
2. Go to [chrome://extensions/](chrome://extensions/)
3. Enable "Developer mode" in the top right corner
4. Click "Load unpacked" and select the unzipped folder

Or build from the source code:
1. Clone this repository
2. Run `npm i` to install dev dependencies
3. Run `npm run build`
4. Go to [chrome://extensions/](chrome://extensions/)
5. Enable "Developer mode" in the top right corner
6. Click "Load unpacked" and select the `dist` folder

## Installation - Firefox
Install from [Firefox Browser Add-Ons](https://addons.mozilla.org/firefox/addon/copylink-dev/)

Or install from Release:
1. Download and unzip the latest zip file from [Releases](https://github.com/wintorse/copylink-dev/releases/latest)
2. Go to [Debugger page](about:debugging#/runtime/this-firefox)
3. Click "Load Temporary Add-on…" and select any file in the unzipped folder

Or build from the source code:
1. Clone this repository
2. Run `npm i` to install dev dependencies
3. Run `npm run build-firefox`
4. Go to [Debugger page](about:debugging#/runtime/this-firefox)
5. Click "Load Temporary Add-on…" and select any file in the `dist` folder

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