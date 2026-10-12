# AGENTS.md

## Implementation

This project is used as a submodule in "copylink-dev-user.js", which is the UserScript version of this browser extension.

Implement shareable and pure logic in the `src/shared/` directory.

## Testing

E2E tests for GitHub, Google Sheets / Docs / Slides / Drive, Jira, ReDoc pages, as well as general websites, are performed using actual URLs and run periodically via CI. 

This is to detect UI changes on these sites. When CI fails, it lets us know that this extension needs to be fixed.
