# Chrome Web Store Listing — copylink.dev

Last reviewed against repository source: 2026-10-31.

This document records source-backed listing copy and permission explanations for Chrome Web Store updates. Reconcile it with the existing Developer Dashboard before submission. Dashboard-only values and publication status have not been verified; the entries below do not imply that a new version has been submitted.

## Store Listing

- Existing listing: https://chromewebstore.google.com/detail/ohkebnhdjdgmfnhcmdpkdfddongdjadp
- Extension ID: `ohkebnhdjdgmfnhcmdpkdfddongdjadp`
- English name: `copylink.dev | Copy link with shortcuts`
- English short description: `Copy links with shortcuts. On supported sites, create Slack emoji-enhanced links.`
- Suggested category: Productivity. Confirm the existing Dashboard category.
- Primary source language: English; the extension also contains Japanese and Simplified Chinese messages.
- Single purpose: Copy the current page's title and link, or a selected Google Sheets range link, to the clipboard using keyboard shortcuts.

### Detailed Description Draft

Copy titled links with keyboard shortcuts and paste them into Slack, documents, or other tools.

Copy a page link, a link with a configurable Slack emoji, or the page title alone. On supported sites, copy a formatted title that includes useful details such as an issue or pull request number. Customize emojis for GitHub pull requests in Draft, Open, Merged, and Closed states.

Copy links to selected Google Sheets ranges in HTML, HTML with a Slack emoji, Markdown, or plain URL format. Choose emojis and custom website URL patterns in the extension settings, and import or export those settings to share them between installations.

Supported sites include Google Sheets, Docs, Slides, Drive, GitHub, Jira, Asana, Backlog, Redmine and RedMica, and ReDoc API documentation. Other websites use the page title.

After installation, configure your preferred keyboard shortcuts in the browser's extension shortcut settings. Click the extension icon to customize emojis and the Google Sheets range link format.

Settings stay in the browser's local extension storage. Copying writes the requested content to your clipboard; the extension does not send it to an extension-operated server.

Support and source code: https://github.com/wintorse/copylink-dev

## Permissions Justification

The normal Chrome build uses the permissions in `public/manifest.json`:

| Permission       | Purpose                                                                                                                                                                                                                  |
| ---------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `activeTab`      | Temporarily access the current page after the user invokes a copy shortcut, so the extension can obtain the page URL and generate its titled link.                                                                       |
| `scripting`      | Inject the bundled copy command handler into the active page after the user invokes a shortcut. The handler reads the title and supported page details, performs the requested copy, and displays a result notification. |
| `storage`        | Save the user's emoji names, custom website URL patterns, and Google Sheets range link format locally, and read them when generating links or importing/exporting settings.                                              |
| `clipboardWrite` | Write the requested title, link, or exported settings to the clipboard when the user invokes the corresponding operation.                                                                                                |

### Host Access and Build Variants

- The normal Chrome build has no persistent `host_permissions`. The `web_accessible_resources` match pattern makes the bundled toast stylesheet available to pages where the extension runs; it is not a host permission grant.
- `pnpm build:with-host-permissions` is an opt-in local build for Chrome / Arc. It adds `host_permissions: ["<all_urls>"]` to the generated manifest. If that variant is ever submitted, explicitly justify persistent access and update the Dashboard disclosures to match that artifact. Do not describe it as the normal store build.
- Chromium E2E tests also add host permissions to a temporary build so tests can trigger commands programmatically. Those permissions are test-only and must not be copied into the normal store package.
- Firefox has a separate Manifest V2 build and permission model. This document describes the Chrome listing, not a Firefox submission.

## Privacy and Data Use

Repository assessment:

- A copy command reads the active page URL and title. Supported-site formatting can also read issue identifiers, summaries, pull request state, or the selected Google Sheets range.
- The requested content is written to the local clipboard. Pasting or sharing it elsewhere is a subsequent user action.
- Emoji names, custom website patterns, and the range link format are stored in `chrome.storage.local`, not automatically synced by this extension.
- Export copies emoji and custom website settings as JSON to the clipboard. Import validates pasted JSON and saves the accepted settings locally; it does not call a remote import/export service.
- No analytics, extension-operated remote data collection, or remote runtime code loading was found in `src/`. Links to GitHub and the browser's extension store open only when the user follows them.

Review the existing Dashboard data-use answers against these behaviors before submission, particularly the distinction between local processing of website content and transmission off-device. Reassess this section if storage, clipboard handling, or network behavior changes.

### Privacy Policy

The published privacy policy URL is not recorded in this repository. Confirm the URL currently used in the Developer Dashboard, verify that it describes the behavior above, and record it here before the next store submission. Do not invent a URL or replace an existing published policy without reviewing it.

## Graphics and Assets

| Asset                                   | Repository source                                                         | Status                                                                             |
| --------------------------------------- | ------------------------------------------------------------------------- | ---------------------------------------------------------------------------------- |
| Extension icons                         | `public/images/icon-16.png`, `icon-32.png`, `icon-48.png`, `icon-128.png` | Dimensions verified as 16, 32, 48, and 128 pixels square.                          |
| Promotional artwork                     | `docs/promo.png`                                                          | 2400 × 1500 pixels; source artwork, not a verified store screenshot export.        |
| Store screenshots and promotional tiles | Not recorded as separate store assets                                     | Check the existing Dashboard assets and refresh them when visible features change. |

## Developer and Distribution Details

- Repository author: `wintorse`. Confirm the Dashboard publisher name and public contact email before submission; the email is not recorded in the repository.
- Homepage: https://github.com/wintorse/copylink-dev
- Support: https://github.com/wintorse/copylink-dev/issues
- Current Dashboard visibility and distribution regions: not verified. Preserve the existing values unless a distribution change is intended.

## Version History and Review Notes

| Version         | Repository evidence                                                                                                          | Store status                               |
| --------------- | ---------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------ |
| 1.13.0          | Current package and manifest versions; GitHub release exists.                                                                | Dashboard publication status not verified. |
| 1.14.0, planned | `release/v1.14.0` contains RedMica detection changes. Reconcile the final release scope and version files before submission. | Not submitted by this change.              |

Arc shortcut limitations and the local host-permission workaround are documented in `README.md`. Include accurate limitations in store copy when relevant. No rejection history is recorded in this repository; obtain actual review feedback before adding rejection or resolution claims.

## Maintenance

Update this file when user-visible behavior, permissions, host access, data handling, listing assets, or submission status changes. Keep it outside the packaged extension: builds copy `public/` into `dist/`, so this root-level document is not included. The detailed description is a draft for review and does not update the live listing.

Sources: `public/manifest.json`, `public/manifest_firefox.json`, `public/_locales/en/messages.json`, `src/scripts/background.ts`, `src/popup/popup.ts`, `src/shared/`, `vite.config.js`, and `README.md`.
