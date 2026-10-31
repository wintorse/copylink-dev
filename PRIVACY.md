# Privacy Policy for copylink.dev

[日本語](./PRIVACY-ja.md) | [简体中文](./PRIVACY-zh-CN.md)

Last updated: October 31, 2026

This policy describes how the copylink.dev Chrome extension handles data.

## Information used to copy links

When you run a copy shortcut, the extension reads the current page's URL and title to create the requested link or copy the title. On supported sites, it may also read page details used to format the result, such as an issue number and title or a pull request's status. When you copy a Google Sheets range link, it reads the selected range reference and sheet identifier. Page URLs and titles may contain personal or sensitive information.

The extension processes this information on your device and writes the requested result to your clipboard. It reads the current page when you run a copy command; it does not access or create a list of your browsing history. It does not save page URLs and titles in its settings storage. Your operating system or clipboard manager may retain copied content. If you paste it into another application or service, that recipient handles the information under its own policies.

## Settings

The extension saves your emoji names, custom website URL patterns, and Google Sheets range link format in local extension storage so it can apply your preferences. It does not use Chrome's extension sync storage. When Chrome sync is enabled, sync storage can automatically synchronize an extension's settings and data across Chrome browsers signed in to the same Google account.

Settings remain until you change them or remove the extension. Removing the extension clears its local extension storage.

You can change your settings in the extension popup. The export feature copies emoji names and custom website patterns as JSON to your clipboard; the range link format is not included. Import accepts settings that you paste into the popup and saves the accepted settings locally.

## Sharing and external services

The extension does not send the page information or settings it handles to the developer or an extension-operated server, share them with third parties, or use analytics. It does not sell user data or use it for advertising. The extension itself does not sync settings to other devices.

When you choose to open a link to GitHub or the Chrome Web Store in the extension popup, or paste copied content into another service, that site or service receives information according to your interaction with it and its own privacy policy. Clipboard contents and exported settings may also remain outside the extension after it is removed.

## Chrome Web Store Limited Use

copylink.dev's use of information received from Chrome APIs complies with the [Chrome Web Store User Data Policy](https://developer.chrome.com/docs/webstore/program-policies/policies), including its Limited Use requirements.

## Changes and contact

We will update this policy when the extension's data practices change. The date at the top shows when this version was last updated.

For privacy questions, contact the project through [GitHub Issues](https://github.com/wintorse/copylink-dev/issues). Issues are public; please do not include sensitive information.
