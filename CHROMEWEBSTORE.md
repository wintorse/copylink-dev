# Chrome Web Store Listing — copylink.dev

Last reviewed against repository source: 2026-10-31.

This document records Chrome Web Store listing copy and the source-backed information needed to maintain its disclosures and assets. It describes the normal Chrome build. The Developer Dashboard is the source of truth for the live listing, its settings, and publication status.

## Store Listing

- Existing listing: https://chromewebstore.google.com/detail/ohkebnhdjdgmfnhcmdpkdfddongdjadp
- Extension ID: `ohkebnhdjdgmfnhcmdpkdfddongdjadp`
- English name: `copylink.dev | Copy link with shortcuts`
- English short description: `Copy links with shortcuts. On supported sites, create Slack emoji-enhanced links.`
- Primary source language: English; the extension also contains Japanese and Simplified Chinese messages.
- Single purpose: Copy the current page's title and link, or a selected Google Sheets range link, to the clipboard using keyboard shortcuts.

### Detailed Description

Copy titled links with keyboard shortcuts and paste them into Slack, documents, or other tools.

Copy a page link, a link with a configurable Slack emoji, or the page title alone. On supported sites, copy a formatted title that includes useful details such as an issue or pull request number. Customize emojis for GitHub pull requests in Draft, Open, Merged, and Closed states.

Copy links to selected Google Sheets ranges in HTML, HTML with a Slack emoji, Markdown, or plain URL format. Choose emojis and custom website URL patterns in the extension settings, and import or export those settings to share them between installations.

Supported sites include Google Sheets, Docs, Slides, Drive, GitHub, Jira, Asana, Backlog, Redmine and RedMica, and ReDoc API documentation. Other websites use the page title.

After installation, configure your preferred keyboard shortcuts in the browser's extension shortcut settings. Click the extension icon to customize emojis and the Google Sheets range link format.

When you use a copy shortcut, the extension reads the current page's URL and title and, on supported sites, the details needed to format the result. For Google Sheets range links, it also reads the selected range reference. It does not access or create a list of your browsing history. The extension processes this information on your device and writes the requested content to your clipboard. Settings stay in the browser's local extension storage; the extension does not send page information or settings to an extension-operated server.

Support and source code: https://github.com/wintorse/copylink-dev

## Permissions Justification

The normal Chrome build uses the permissions in `public/manifest.json`:

| Permission       | Purpose                                                                                                                                                                                                                  |
| ---------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `activeTab`      | Temporarily access the current page after the user invokes a copy shortcut, so the extension can obtain the page URL and generate its titled link.                                                                       |
| `scripting`      | Inject the bundled copy command handler into the active page after the user invokes a shortcut. The handler reads the title and supported page details, performs the requested copy, and displays a result notification. |
| `storage`        | Save the user's emoji names, custom website URL patterns, and Google Sheets range link format locally, and read them when generating links or importing/exporting settings.                                              |
| `clipboardWrite` | Write the requested title, link, or exported settings to the clipboard when the user invokes the corresponding operation.                                                                                                |

### Host Access and Remote Code

The normal Chrome build has no persistent `host_permissions`. The `web_accessible_resources` match pattern makes the bundled toast stylesheet available to pages where the extension runs; it is not a host permission grant. No remote runtime code loading was found in `src/`; the Dashboard remote-code answer for this build is **No**.

## Privacy and Data Use

Repository assessment:

- A copy command reads the active page URL and title. Supported-site formatting can also read issue identifiers, summaries, pull request state, or the selected Google Sheets range. The extension does not access or create a list of browsing history.
- The requested content is written to the local clipboard. Pasting or sharing it elsewhere is a subsequent user action.
- Emoji names, custom website patterns, and the range link format are stored in `chrome.storage.local`, not automatically synced by this extension.
- Export copies emoji and custom website settings as JSON to the clipboard. Import validates pasted JSON and saves the accepted settings locally; it does not call a remote import/export service.
- No analytics or extension-operated remote data collection was found in `src/`. Links to GitHub and the browser's extension store open only when the user follows them.

### Dashboard Data-use Answers

| Dashboard category                                                                                                      | Source-backed assessment                                                                                                                                                                                                                                                                                        |
| ----------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Website content                                                                                                         | Select: the extension reads page titles and supported-site details.                                                                                                                                                                                                                                             |
| Web history                                                                                                             | Conservative recommendation: select for the current page URL and title. Google includes URLs in browsing activity, but the Dashboard describes a list of visited pages, which the extension does not access or create. Google does not explicitly resolve whether current-page access alone fits this checkbox. |
| Personal identification, health, financial or payment, authentication, personal communications, location, user activity | The current source does not intentionally collect these categories. Page titles and URLs may nevertheless contain sensitive or identifying information. Review the Dashboard definitions and submitted artifact when answering.                                                                                 |

Before certifying the Dashboard's data-use statements, verify that the submitted build does not sell or transfer data outside permitted uses, use or transfer it for unrelated purposes, or use or transfer it for creditworthiness or lending. Keep the Dashboard answers, store description, and privacy policy consistent. Google's disclosure requirements call for prominent disclosure and informed consent before installation; verify that the actual listing and installation flow meet them. Reassess the disclosures if storage, clipboard handling, or network behavior changes.

Sources: [Google's user data FAQ](https://developer.chrome.com/docs/webstore/program-policies/user-data-faq), [Limited Use policy](https://developer.chrome.com/docs/webstore/program-policies/limited-use), [disclosure requirements](https://developer.chrome.com/docs/webstore/program-policies/disclosure-requirements), and [Dashboard privacy fields](https://developer.chrome.com/docs/webstore/cws-dashboard-privacy/).

### Privacy Policy

The Chrome extension policy is in [English](PRIVACY.md), [Japanese](PRIVACY-ja.md), and [Simplified Chinese](PRIVACY-zh-CN.md). Each version links to the others and includes the Limited Use statement.

Use the English policy URL in the Developer Dashboard:

- English: https://github.com/wintorse/copylink-dev/blob/main/PRIVACY.md
- Japanese: https://github.com/wintorse/copylink-dev/blob/main/PRIVACY-ja.md
- Simplified Chinese: https://github.com/wintorse/copylink-dev/blob/main/PRIVACY-zh-CN.md

## Graphics and Assets

- The 128 × 128 extension icon is [icon-128.png](public/images/icon-128.png).
- Google requires at least one 1280 × 800 or 640 × 400 screenshot. The screenshots and promotional tiles in the Dashboard have not been verified; check them when visible features change. See [Google's image requirements](https://developer.chrome.com/docs/webstore/images).

## Developer and Distribution Details

- Repository author: `wintorse`.
- Homepage: https://github.com/wintorse/copylink-dev
- Support: https://github.com/wintorse/copylink-dev/issues
- Current Dashboard visibility and distribution regions: not verified. Preserve the existing values unless a distribution change is intended.

## Maintenance

Update this file when user-visible behavior, permissions, host access, data handling, or listing assets change. The live listing is managed in the Developer Dashboard. Keep this document outside the packaged extension: builds copy `public/` into `dist/`, so this root-level document is not included.
