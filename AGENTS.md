<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->

## Release-gate rule

Never declare **READY FOR HUMAN TESTING** from code review, static checks, or an isolated unit test
alone. Codex must verify the exact changed journey in the running application, including the
authenticated write path and its recovery/progress behavior. Independent Claude review must inspect
that same exact-head runtime evidence and classify product-meaning and implementation findings before
readiness is declared. Any authorization, credential, upload, persistence, or provider failure blocks
readiness until it is remediated and both verification passes are repeated.
