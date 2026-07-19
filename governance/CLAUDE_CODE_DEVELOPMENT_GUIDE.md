# Claude Code Development Guide

1. Open Claude Code at the repository root.
2. Paste exactly one numbered prompt.
3. Require Claude to inspect current code before editing.
4. Do not approve moving forward with failed tests or hidden shortcuts.
5. Commit stable steps separately.
6. Use the release-gate prompt at the end of each volume.
7. Keep production credentials out of Claude sessions and source control.
8. Review migrations, authorization, external capability claims, and AI grounding manually.

## Recommended commit format
`prompt-042: implement transcript search and filters`
