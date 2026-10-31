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

## Live Sites and Fixtures

| Test target                                                                           | Response source                                        | Purpose                                                                                   |
| ------------------------------------------------------------------------------------- | ------------------------------------------------------ | ----------------------------------------------------------------------------------------- |
| Selected GitHub, Google Sheets / Docs / Slides / Drive, Jira, and ReDoc v2 / v3 tests | Real external pages                                    | Detect upstream DOM and UI changes as well as extension regressions                       |
| Generic HTTPS page                                                                    | Intercepted HTML fixture in `e2e/fixtures.ts`          | Verify commands, clipboard formats, settings, and notifications consistently              |
| Non-secure HTTP page                                                                  | Local Vite server at `http://copylink-dev.test:4173/`  | Exercise clipboard fallback outside a secure context                                      |
| Redmine, RedMica, Asana, Backlog                                                      | Intercepted HTML in `e2e/site-title.spec.ts`           | Verify extraction from controlled page structures; these do not monitor the live services |
| GitHub PR emoji inheritance                                                           | Intercepted HTML in `e2e/pr-emoji-inheritance.spec.ts` | Verify inheritance after saving and reopening settings without relying on a live PR       |
| Missing Google Sheets range                                                           | Intercepted HTML in `e2e/toast.spec.ts`                | Verify the failure notification when the name box is missing                              |
| Firefox content integration                                                           | Local Vite server at `http://127.0.0.1:4173/`          | Verify content scripts and clipboard behavior in Gecko                                    |

An external-looking URL does not necessarily mean the response comes from the live service: inspect `page.route()` and `context.route()` when identifying coverage.

The [English behavior catalog](../docs/behavior-test-coverage.md) and [Japanese behavior catalog](../docs/behavior-test-coverage-ja.md) map implemented behaviors to explicit test evidence, including partial coverage and known gaps. Keep their IDs and mappings aligned when behavior or tests change.

## Investigating Failures

1. Identify whether the failing test uses a live site or a fixture, and reproduce the specific test with `pnpm exec playwright test <test-file> -g '<test name>'` after `pnpm build`.
2. For live pages, check navigation errors, service availability, redirects, and the rendered DOM before deciding that the extension is broken. Rerun a transient failure before modifying selectors or timeouts.
3. If the site structure changed, update extraction and focused regression coverage while preserving the live-site assertion. Do not replace the page with a fixture, skip the case, or relax the expected behavior just to obtain a passing run.
4. For fixture failures, inspect the extension output and fixture assumptions. Update expectations only when the intended behavior changes.
5. Report the observed cause, the checks performed, and any live-site or manual checks that could not be completed.

## Manual Browser Checks Before Release

- Load the normal Chrome build without the extra host permissions used by E2E. Invoke the configured physical shortcuts and verify copying on an ordinary website, including HTML and plain-text paste output.
- Verify that the normal `activeTab` path works after a user gesture, and that restricted pages are handled without unintended script injection.
- Verify that copy shortcuts leave pages with `.xml` URL paths unchanged in both browsers; the XML exclusion paths currently lack direct automated assertions.
- Install the Firefox build as a temporary add-on and verify its manifest, shortcuts, popup settings, and copying. Content integration tests do not cover add-on installation or these browser UI paths.
- When shared behavior changes, verify the UserScript consumer separately; the extension test suite does not build or install that repository.
