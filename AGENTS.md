# AGENTS.md

## Official Skills

Repository-local `chrome-extensions` and `modern-web-guidance` skills are available in `.agents/skills/`. See [docs/official-skills.md](docs/official-skills.md) for their source, revision, and update procedure. Apply them within these project constraints:

- Chrome uses Manifest V3; the separate Firefox build currently uses Manifest V2. Do not apply Chrome-only migration rules to Firefox or introduce extension APIs into shared UserScript code. The UserScript consumer is not a `chrome.userScripts` implementation.
- The normal Chrome build uses a keyboard shortcut to obtain `activeTab` access. This permits reading that tab's URL and injecting scripts with `scripting`; reading `tab.url` does not by itself justify adding `tabs` or persistent host permissions. Verify permission advice against the official API documentation and the actual user-gesture path.
- Preserve clipboard fallback on HTTP pages and existing browser-compatible message/callback behavior. A skill's preferred syntax or modern API pattern is not a reason to remove supported behavior or raise browser requirements.
- Resolve conflicts between downloaded guidance and platform behavior using current official API documentation and focused tests. Update `CHROMEWEBSTORE.md` when store-relevant behavior or permissions change, rather than generating unrelated metadata on every edit.

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

E2E tests for GitHub, Google Sheets / Docs / Slides / Drive, Jira, ReDoc pages, as well as general websites, are performed using actual URLs and run periodically via CI.

This is to detect UI changes on these sites. When CI fails, it lets us know that this extension needs to be fixed.
