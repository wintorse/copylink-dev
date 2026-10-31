# Validation

- `pnpm test:unit`: pure logic, DOM extraction, and mocked Chrome background/message behavior.
- `pnpm typecheck`: both source and test code.
- `pnpm lint`: source, tests, and configuration.
- `pnpm test`: Chromium extension E2E, including a local generic fixture. Sheets-format and selected site-title tests exercise real external sites to detect UI changes.
- `pnpm test:firefox-content`: Firefox build and Gecko content integration tests with native and fallback clipboard APIs. Only extension messaging and i18n APIs are mocked.

## Failure Diagnostics

Both browser suites retain a trace and screenshot for failed attempts. Chromium output is stored in `test-results/chromium/` and `playwright-report/chromium/`; Firefox uses the corresponding `firefox/` directories so a later suite cannot overwrite earlier diagnostics.

CI uploads these directories as the `browser-test-diagnostics` artifact, retained for seven days, including when a test fails. Firefox content tests still run after a Chromium test failure. Download and extract the artifact, then inspect a report or trace locally:

```sh
pnpm exec playwright show-report playwright-report/chromium
pnpm exec playwright show-report playwright-report/firefox
pnpm exec playwright show-trace path/to/trace.zip
```

Traces include page snapshots and network activity from the test run. Use the public test fixtures when sharing diagnostics, and inspect the artifact before posting it publicly.

## Coverage Boundaries

Chromium E2E adds host permissions and triggers commands through a service-worker helper. It does not exercise physical keyboard shortcuts or the production `activeTab` user-gesture grant. Background listeners are covered by unit tests. Firefox content tests do not install an add-on or validate its manifest permissions; Playwright supports extension loading only in Chromium. Verify those browser UI paths manually before release.

The Firefox test profile enables `dom.events.testing.asyncClipboard` to read copied data without permission prompts. This preference is limited to the temporary test browser.
