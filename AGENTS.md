# AGENTS.md

## Implementation

This project is used as a submodule in [copylink-dev-user-js](https://github.com/wintorse/copylink-dev-user-js), the UserScript version of this browser extension.

Implement shareable and pure logic in the `src/shared/` directory.
Keep shared modules independent of extension APIs such as `chrome.*`; pass platform-specific behavior through arguments or adapters. Preserve both Firefox and UserScript compatibility when changing shared code.

## Repository Layout

- `src/scripts/`: extension commands, background listeners, and content scripts. Chrome uses a Manifest V3 service worker; Firefox uses a separate Manifest V2 background script.
- `src/shared/`: reusable clipboard, title, site detection, emoji, and UI logic.
- `src/popup/` and `public/`: extension settings, localized messages, manifests, and static assets.
- `tests/`: unit tests, Chromium extension E2E tests, Firefox content integration, and Linux browser UI tests with an installed Firefox add-on. See [tests/README.md](tests/README.md) for coverage boundaries and manual checks.

## Setup and Validation

Use the pnpm and Node.js versions declared in `package.json`.

```sh
pnpm install --frozen-lockfile
pnpm exec playwright install chromium firefox
```

For code changes, run `pnpm typecheck`, `pnpm lint`, and `pnpm test:unit`. Check formatting with `pnpm fmt:check`, or limit the formatter check to changed files when unrelated existing formatting would obscure the result.

Run the relevant Chromium E2E tests for changes to commands, clipboard output, settings, or site-specific extraction. Run `pnpm test:firefox-content` when changing shared copy logic or content scripts. Build both Chrome (`pnpm build`) and Firefox (`pnpm build-firefox`) when changing runtime code or build configuration. Both builds write to `dist/`, so run them sequentially and rebuild the intended browser before testing it.

For background, manifest, shortcut, or permission changes, run the Linux browser UI suites (`xvfb-run -a pnpm test:chromium-shortcuts` and `xvfb-run -a pnpm test:firefox-addon`) or verify their CI results. They use native keyboard events and the normal browser builds. Setup and diagnostics are documented in [tests/README.md](tests/README.md).

For documentation-only changes, check the changed Markdown and local links. Report the checks performed and any remaining manual or UserScript consumer validation; do not imply that browser tests cover those paths.

## Workflows

GitHub Actions dependencies are pinned in `.github/workflows/actions.lock`.
Use version tags in workflow `uses` references and never edit the lockfile by hand.
When adding or changing workflow dependencies, regenerate and verify the lockfile:

```sh
gh extension install github/gh-actions-lock --pin v0.2.0
gh actions-lock
gh actions-lock --verify
```

Dependabot updates the lockfile alongside GitHub Actions version updates.

## Chrome Web Store Metadata

Maintain [CHROMEWEBSTORE.md](CHROMEWEBSTORE.md) when changes affect user-facing behavior, permissions, host access, data handling, store assets, or submission status. Base permission and privacy explanations on the actual source and the artifact being submitted. Keep unverified Dashboard values explicit, and distinguish the normal Chrome build from the optional host-permission and Firefox builds.

## Testing

Selected E2E tests for GitHub, Google Sheets / Docs / Slides / Drive, Jira, and ReDoc use real external pages and run periodically via CI to detect upstream UI changes. Generic pages, the current Redmine / RedMica / Asana / Backlog cases, and targeted GitHub / Sheets regression cases use local or intercepted fixture responses for repeatable behavior checks.

When a live-site test fails, distinguish navigation or service failures from changed page structure and extension regressions before changing code. Preserve the real-site checks: do not replace them with fixtures, skip them, or weaken assertions solely to make CI pass. Update fixtures when the intended behavior changes, and add focused regression coverage for confirmed extension bugs.

See [tests/README.md](tests/README.md) for validation commands, fixture boundaries, failure triage, and browser paths that require manual verification.
