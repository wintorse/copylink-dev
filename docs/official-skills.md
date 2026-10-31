# Official Chrome Development Skills

The repository includes the `chrome-extensions` and `modern-web-guidance` skills in `.agents/skills/`, following the [Chrome team's coding-agent guide](https://developer.chrome.com/docs/extensions/ai/build-with-ai). They are development guidance, not runtime dependencies or part of the extension package.

## Provenance

- Upstream: [GoogleChrome/modern-web-guidance](https://github.com/GoogleChrome/modern-web-guidance)
- Reviewed revision: [`4f2b13e25c5815b3f080ca0d983e828d96561a0f`](https://github.com/GoogleChrome/modern-web-guidance/commit/4f2b13e25c5815b3f080ca0d983e828d96561a0f)
- Imported: 2026-10-31
- Upstream paths: `skills/chrome-extensions/` and `skills/modern-web-guidance/`
- License: Apache-2.0; the upstream root license is included as `LICENSE` in each imported skill directory.

The upstream skill files are copied unchanged. Keeping the revision explicit makes guidance updates reviewable. The `modern-web-guidance` skill can invoke a separately downloaded CLI for searches; pinning these instruction files does not pin that CLI or its remotely retrieved guides.

## Applying the Skills

Use `chrome-extensions` for Chrome-specific implementation and store preparation. Use `modern-web-guidance` when a task needs web-platform guidance for UI, CSS, accessibility, or DOM behavior. The repository's [AGENTS.md](../AGENTS.md) defines the compatibility and permission constraints for both.

Two upstream rules need particular care here:

- The Chrome skill says to always generate Manifest V3. Our Firefox manifest is intentionally separate and remains Manifest V2; shared code is also consumed by a UserScript repository.
- The skill states that reading `tab.url` requires `tabs`. The [official activeTab documentation](https://developer.chrome.com/docs/extensions/develop/concepts/activeTab#what-activetab-allows) also permits reading the URL through a temporary grant, including one triggered by a keyboard shortcut. Preserve the normal build's `activeTab` design unless an actual feature requires broader access.

Skill installation does not request changes to browser permissions, publication status, or the local MCP configuration. Chrome DevTools MCP is a separate optional tool; the existing Playwright suites remain the automated regression checks.

## Updating the Imported Skills

1. Choose and record an upstream commit after reviewing its changes and compatibility advice.
2. Refresh only the two imported skill directories from that commit, preserving their upstream contents, and include the license from the same revision. Use a temporary download or the skill installer with an explicit `--ref` and repository-local destination; its installer refuses to overwrite an existing skill directory.
3. Compare the new rules with `AGENTS.md`, especially Manifest versions, `activeTab`, messaging, and clipboard fallbacks. Update the local constraints if needed rather than silently applying an incompatible rule.
4. Validate skill frontmatter and referenced local files, review the diff, and update the revision and import date above. Keep the upstream files out of blanket formatting changes so subsequent diffs remain attributable to upstream.

After checking out or merging this branch, the repository-local skills become available when the agent next refreshes its skill catalog. They do not install a global skill or change another repository's settings.
