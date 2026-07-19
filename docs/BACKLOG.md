# Backlog

Record useful but out-of-scope findings here. Do not silently expand prompt scope.

## Discovered during Prompt 002 (foundation)

- **Prisma 7 config migration.** We pinned Prisma to v6 for compatibility. Before
  adopting v7, plan the migration to `prisma.config.ts` + a driver adapter
  (`@prisma/adapter-pg`) and update the kit's later domain/migration prompts.
- **Homebrew not installable non-interactively.** Node was installed to
  `~/.local/node` without sudo. For a reproducible team setup, document a
  standard install (Homebrew or nvm) and consider committing `.tool-versions`.
- **Playwright browsers not installed.** CI/dev must run `npx playwright install`
  before e2e. Add this to the CI e2e job when e2e is wired into the pipeline.
- **npm 11 blocks install scripts by default.** Approved packages are pinned in
  `package.json` `allowScripts` (esbuild, sharp, unrs-resolver, prisma engines).
  Revisit these entries on any major dependency bump.
- **Baseline docs from kit Prompt 001 not yet created.** `docs/MVP_SCOPE.md` and
  `docs/TECHNICAL_DECISIONS.md` are referenced by later prompts but do not exist.
  Create them when rejoining the kit sequence.
- **Kit prompt numbering divergence.** The custom Prompt 002 overlaps kit steps
  004–008 and 022–024. When rejoining, skip those to avoid duplicate work.

## Discovered during the Prompt 002 foundation review

- **Standalone output deferred.** `output: "standalone"` was removed because it
  breaks `next start` and added premature complexity. The Dockerfile now uses the
  conventional production server. Reintroduce standalone later (with a tested
  `node .next/standalone/server.js` runner) if smaller images are needed.
- **e2e in CI.** A Playwright job was added to `.github/workflows/ci.yml`. Add a
  PostgreSQL service to that job once routes depend on the database.
