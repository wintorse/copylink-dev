# Validation

- `pnpm test:unit`: pure logic, DOM extraction, and mocked Chrome/Firefox background and message behavior.
- `pnpm typecheck`: both source and test code.
- `pnpm lint`: source, tests, and configuration.
- `pnpm test`: Chromium extension E2E, including a local generic fixture. Sheets-format and selected site-title tests exercise real external sites to detect UI changes.
- `pnpm test:firefox-content`: Firefox build and Gecko content integration tests with native and fallback clipboard APIs. Only extension messaging and i18n APIs are mocked.
- `xvfb-run -a pnpm test:chromium-shortcuts`: normal Chrome build, native keyboard shortcuts, and production `activeTab` grants/revocation on Linux.
- `xvfb-run -a pnpm test:firefox-addon`: Firefox build installed as a temporary add-on, manifest-driven scripts, and native keyboard shortcuts on Linux.

The browser UI suites require Linux, Xvfb, `xdotool`, and `xclip`. CI installs these tools and both Playwright browsers. To run them locally on Linux, install the tools with `sudo apt-get install xvfb xdotool xclip` and browsers with `pnpm exec playwright install --with-deps chromium firefox`. Selenium Manager downloads and caches geckodriver for the Firefox add-on test; no globally installed Selenium package is needed. Both builds write to `dist/`, so run browser build/test commands sequentially.

## Failure Diagnostics

Chromium E2E and Firefox content tests retain a trace and screenshot for failed attempts. Chromium output is stored in `test-results/chromium/` and `playwright-report/chromium/`; Firefox uses the corresponding `firefox/` directories so a later suite cannot overwrite earlier diagnostics.

CI uploads these directories as the `browser-test-diagnostics` artifact, retained for seven days, including when a test fails. Firefox content tests still run after a Chromium test failure. Download and extract the artifact, then inspect a report or trace locally:

```sh
pnpm exec playwright show-report playwright-report/chromium
pnpm exec playwright show-report playwright-report/firefox
pnpm exec playwright show-trace path/to/trace.zip
```

The separate `browser-ui` CI job uploads `browser-ui-diagnostics`, also retained for seven days. Reports and results use `chromium-shortcuts/` and `firefox-addon/` subdirectories. Chrome shortcut failures attach a Playwright trace and screenshot; the Selenium Firefox test attaches a screenshot when its session is available. Playwright does not record a trace of the Selenium session. The Firefox add-on test still runs after a Chrome shortcut test failure.

Traces include page snapshots and network activity from the test run. Use the public test fixtures when sharing diagnostics, and inspect the artifact before posting it publicly.

## Coverage Boundaries

The general Chromium E2E suite adds host permissions and triggers commands through a service-worker helper. The dedicated Chrome browser UI test instead loads the unmodified normal build and sends native X11 key events. It checks that the tab URL is inaccessible before the shortcut, becomes accessible after copying, and is hidden again after navigation to a different origin. It also checks plain text and HTML from the system clipboard.

Firefox content integration tests mock extension APIs. The separate Selenium test installs the unmodified Firefox build as an unsigned temporary add-on and copies through its actual manifest, background listener, and pre-injected content script. It does not mock extension APIs or inject the content script through a helper. Chrome browser UI tests exercise Alt+L, Alt+Shift+L, and Alt+T; Firefox add-on tests exercise Alt+L and Alt+Shift+L. The Google Sheets command remains covered by the general Chromium suite.

The native-input run exposed an existing Firefox/Linux shortcut conflict: Alt+T opens the browser's Tools menu instead of dispatching `copy-title`. The Firefox add-on test does not assert that shortcut works; Firefox content integration tests cover the title-copy implementation. Default shortcut assignments are unchanged. See [Mozilla's shortcut priority rules](https://developer.mozilla.org/en-US/docs/Mozilla/Add-ons/WebExtensions/manifest.json/commands#shortcut_values) when investigating this browser UI limitation.

The Firefox test profile enables `dom.events.testing.asyncClipboard` to read copied data without permission prompts. This preference is limited to the temporary test browser.

## Live Sites and Fixtures

| Test target                                                                           | Response source                                        | Purpose                                                                                    |
| ------------------------------------------------------------------------------------- | ------------------------------------------------------ | ------------------------------------------------------------------------------------------ |
| Selected GitHub, Google Sheets / Docs / Slides / Drive, Jira, and ReDoc v2 / v3 tests | Real external pages                                    | Detect upstream DOM and UI changes as well as extension regressions                        |
| Generic HTTPS page                                                                    | Intercepted HTML fixture in `e2e/fixtures.ts`          | Verify commands, clipboard formats, settings, and notifications consistently               |
| Non-secure HTTP page                                                                  | Local Vite server at `http://copylink-dev.test:4173/`  | Exercise clipboard fallback outside a secure context                                       |
| Redmine, RedMica, Asana, Backlog                                                      | Intercepted HTML in `e2e/site-title.spec.ts`           | Verify extraction from controlled page structures; these do not monitor the live services  |
| GitHub PR emoji inheritance                                                           | Intercepted HTML in `e2e/pr-emoji-inheritance.spec.ts` | Verify inheritance after saving and reopening settings without relying on a live PR        |
| Missing Google Sheets range                                                           | Intercepted HTML in `e2e/toast.spec.ts`                | Verify the failure notification when the name box is missing                               |
| Firefox content integration                                                           | Local Vite server at `http://127.0.0.1:4173/`          | Verify content scripts and clipboard behavior in Gecko                                     |
| Chrome shortcuts and installed Firefox add-on                                         | Local Vite server at `http://127.0.0.1:4173/`          | Verify native Linux shortcuts, normal Chrome permissions, and Firefox manifest integration |

An external-looking URL does not necessarily mean the response comes from the live service: inspect `page.route()` and `context.route()` when identifying coverage.

The [English behavior catalog](../docs/behavior-test-coverage.md) and [Japanese behavior catalog](../docs/behavior-test-coverage-ja.md) map implemented behaviors to explicit test evidence, including partial coverage and known gaps. Keep their IDs and mappings aligned when behavior or tests change.

## Investigating Failures

1. Identify whether the failing test uses a live site or a fixture, and reproduce the specific test with `pnpm exec playwright test <test-file> -g '<test name>'` after `pnpm build`.
2. For live pages, check navigation errors, service availability, redirects, and the rendered DOM before deciding that the extension is broken. Rerun a transient failure before modifying selectors or timeouts.
3. If the site structure changed, update extraction and focused regression coverage while preserving the live-site assertion. Do not replace the page with a fixture, skip the case, or relax the expected behavior just to obtain a passing run.
4. For fixture failures, inspect the extension output and fixture assumptions. Update expectations only when the intended behavior changes.
5. Report the observed cause, the checks performed, and any live-site or manual checks that could not be completed.

## Manual Browser Checks Before Release

- Verify configured shortcuts on supported Windows/macOS browser versions, including the Google Sheets range shortcut and pasting into destination applications. Native browser UI CI covers three default Chrome/Linux shortcuts and two Firefox/Linux shortcuts; track the Firefox Alt+T conflict above separately.
- Verify restricted browser pages and customized shortcut assignments. Unit tests cover Chrome's non-web scheme rejection; native browser UI CI covers the ordinary production `activeTab` path.
- Check Firefox popup settings in an installed add-on. The Selenium test covers installation, manifest injection, and copying; settings UI tests currently run in Chromium.
- When shared behavior changes, verify the UserScript consumer separately; the extension test suite does not build or install that repository.
