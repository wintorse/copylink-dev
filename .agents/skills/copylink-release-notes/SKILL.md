---
name: copylink-release-notes
description: Draft or review concise English release summaries for copylink.dev using Git refs, published releases, and the associated pull requests.
---

# copylink.dev Release Notes

Produce the categorized summary that appears before the existing `## What's Changed` section. Use the published v1.6.0 and v1.6.1 notes as style references, while keeping category names consistent with the format below.

## Establish the Release Range

Use the base and target refs specified by the user. Otherwise inspect tags, release branches, and published releases to determine the previous release and requested target. Do not assume that `main`, the latest tag, and the version in `package.json` refer to the same release.

For multiple versions, compare each version with its immediate predecessor. Inspect both `git log <base>..<target>` and `git diff <base> <target>`; merge titles and generated PR lists can omit direct commits and small user-visible fixes. Use the repository's GitHub integration or `gh` to read relevant PR descriptions and published release bodies when available.

## Select and Verify Changes

- Verify behavioral claims against the source diff. Distinguish a new feature, a bug fix, and a refactor without a user-visible behavior change.
- Include relevant fixes found outside the generated PR list. Explain the resulting behavior in plain English rather than repeating internal function names.
- Consolidate dependency and workflow updates. Omit release merges, version bumps, formatting-only commits, and duplicated entries unless they explain a meaningful change.
- Preserve the difference between an optional build mode and a setting available in the shipped extension. Keep Chrome, Firefox, and UserScript effects accurate.
- Describe tests as maintenance work rather than product features. Do not claim that manual browser paths or the UserScript consumer were tested without evidence.

## Write the Summary

Use only nonempty sections, normally in this order:

```markdown
## New Features

- Add support for ...

## Bug Fixes

- Fix ... when ...

## Refactor

- Move ... to a shared module for reuse in the UserScript version

## Chores

- Update dependencies and GitHub Actions workflows
```

Use short English bullets with active verbs. Prefer the user-visible effect; retain an implementation detail when it explains compatibility or a maintenance-only release. A release containing only refactoring or chores should contain only those categories. Do not invent features to fill headings.

Keep the existing `## What's Changed`, contributor credits, and `Full Changelog` intact when proposing an insertion or editing an authorized release. Avoid duplicating PR URLs in the concise summary; provide a release or compare link alongside each version in the surrounding response when useful.

Return copy-ready Markdown for each requested version. Flag unresolved facts separately from the proposed text. Drafting notes does not itself request publishing or editing remote releases; perform those actions only when the user has requested them.
