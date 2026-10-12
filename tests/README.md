# Validation

- `pnpm test:unit`: pure logic, DOM extraction, and mocked Chrome background/message behavior.
- `pnpm typecheck`: both source and test code.
- `pnpm lint`: source, tests, and configuration.
- `pnpm test`: Chromium extension E2E, including local generic and Sheets-format fixtures. Site-title tests still exercise selected real external sites.
- `pnpm test:firefox-content`: Firefox build and Gecko content integration tests with native and fallback clipboard APIs. Only extension messaging and i18n APIs are mocked.

Chromium E2E adds host permissions and triggers commands through a service-worker helper. It does not exercise physical keyboard shortcuts or the production `activeTab` user-gesture grant. Background listeners are covered by unit tests. Firefox content tests do not install an add-on or validate its manifest permissions; Playwright supports extension loading only in Chromium. Verify those browser UI paths manually before release.

The Firefox test profile enables `dom.events.testing.asyncClipboard` to read copied data without permission prompts. This preference is limited to the temporary test browser.
