# AGENTS.md

## Implementation

This project is used as a submodule in "copylink-dev-user.js", which is the UserScript version of this browser extension.

Implement shareable and pure logic in the `src/shared/` directory.

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

## Testing

E2E tests for GitHub, Google Sheets / Docs / Slides / Drive, Jira, and ReDoc use real external pages and run periodically via CI to detect upstream UI changes. Generic pages and the current Redmine, RedMica, Asana, and Backlog cases use local or intercepted fixture responses for repeatable behavior checks.

When a live-site test fails, distinguish navigation or service failures from changed page structure and extension regressions before changing code. Preserve the real-site checks: do not replace them with fixtures, skip them, or weaken assertions solely to make CI pass. Update fixtures when the intended behavior changes, and add focused regression coverage for confirmed extension bugs.

See [tests/README.md](tests/README.md) for validation commands, fixture boundaries, failure triage, and browser paths that require manual verification.
